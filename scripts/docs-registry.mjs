// The docs registry: one artifact, shared by the app, prebuild and the gates.
//
// `src/content/docs.json` is the single hand-edited list of docs (metadata and
// Swedish coverage). The MDX files carry no metadata: a doc's slug is its
// filename, and a translation exists when `src/content/docs/sv/<slug>.mdx`
// exists on disk. This module is the one reader of that contract: prebuild
// uses it to generate the loader map and the search index, and
// check-sources.mjs uses it to fail loudly when the artifact and the files on
// disk disagree.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const GROUPS = ["Start", "Diagnostics", "Reference", "Project"];

export const DOCS_DIR = join(process.cwd(), "src/content/docs");
export const SV_DIR = join(DOCS_DIR, "sv");
export const DOCS_META_JSON = join(process.cwd(), "src/content/docs.json");

/**
 * Read and validate the registry. Throws with every violation listed when the
 * artifact and the content files disagree, so a mistake surfaces at the build
 * that would have shipped it instead of silently emptying the search index.
 * Returns the metas in file order plus the on-disk slug listings.
 */
export async function readDocsRegistry() {
  const raw = JSON.parse(await readFile(DOCS_META_JSON, "utf8"));
  const errors = [];
  const metas = [];
  const seen = new Set();
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("docs.json: expected a non-empty array of doc rows");
  }
  for (const row of raw) {
    const where = `docs.json slug "${row?.slug ?? JSON.stringify(row)}"`;
    if (typeof row?.slug !== "string" || !/^[a-z][a-z-]*$/.test(row.slug)) {
      errors.push(`${where}: slug must be lowercase letters and dashes`);
      continue;
    }
    if (seen.has(row.slug)) errors.push(`${where}: duplicate slug`);
    seen.add(row.slug);
    for (const field of ["title", "summary"]) {
      if (typeof row[field] !== "string" || !row[field].trim()) errors.push(`${where}: ${field} must be a non-empty string`);
    }
    if (!GROUPS.includes(row.group)) errors.push(`${where}: group "${row.group}" is not one of ${GROUPS.join(", ")}`);
    const hasSvMeta = row.titleSv != null || row.summarySv != null;
    if (hasSvMeta && (!row.titleSv?.trim() || !row.summarySv?.trim())) {
      errors.push(`${where}: titleSv and summarySv must be set together, both non-empty`);
    }
    metas.push({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      group: row.group,
      ...(row.titleSv ? { titleSv: row.titleSv } : {}),
      ...(row.summarySv ? { summarySv: row.summarySv } : {}),
    });
  }

  const listMdx = async (dir) =>
    (await readdir(dir)).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, "")).sort();
  const enSlugs = await listMdx(DOCS_DIR);
  const svSlugs = await listMdx(SV_DIR);
  const metaSlugs = metas.map((m) => m.slug);

  for (const s of metaSlugs) {
    if (!enSlugs.includes(s)) errors.push(`docs.json: "${s}" has no src/content/docs/${s}.mdx on disk`);
  }
  for (const s of enSlugs) {
    if (!metaSlugs.includes(s)) errors.push(`orphan mdx: src/content/docs/${s}.mdx is not in docs.json`);
  }
  for (const s of svSlugs) {
    if (!metaSlugs.includes(s)) errors.push(`orphan sv mdx: src/content/docs/sv/${s}.mdx is not in docs.json`);
    else if (!metas.find((m) => m.slug === s).titleSv) {
      errors.push(`docs.json: "${s}" has a Swedish translation on disk but no titleSv/summarySv`);
    }
  }
  for (const m of metas) {
    if (m.titleSv && !svSlugs.includes(m.slug)) {
      errors.push(`docs.json: "${m.slug}" declares titleSv but src/content/docs/sv/${m.slug}.mdx does not exist`);
    }
  }
  if (errors.length) {
    throw new Error(`docs registry is inconsistent:\n  - ${errors.join("\n  - ")}`);
  }
  return { metas, enSlugs, svSlugs };
}
