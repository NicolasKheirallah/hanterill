import docsJson from "@/content/docs.json";

export type DocGroup = "Start" | "Diagnostics" | "Reference" | "Project";

export type DocMeta = {
  slug: string;
  title: string;
  summary: string;
  group: DocGroup;
  /** Present when src/content/docs/sv holds a translation of this doc. */
  titleSv?: string;
  summarySv?: string;
};

export function docTitle(d: DocMeta, locale: string) {
  return locale === "sv" && d.titleSv ? d.titleSv : d.title;
}
export function docSummary(d: DocMeta, locale: string) {
  return locale === "sv" && d.summarySv ? d.summarySv : d.summary;
}

const DOC_GROUPS: DocGroup[] = ["Start", "Diagnostics", "Reference", "Project"];

type DocMetaInput = Omit<DocMeta, "group" | "titleSv" | "summarySv"> & {
  group: string;
  titleSv?: string;
  summarySv?: string;
};

function asDocGroup(group: string): DocGroup {
  if (!DOC_GROUPS.includes(group as DocGroup)) {
    throw new Error(`docs.json: group "${group}" is not one of ${DOC_GROUPS.join(", ")}`);
  }
  return group as DocGroup;
}

/**
 * The docs registry, read from src/content/docs.json — the one hand-edited
 * list of docs. The MDX files carry no metadata: a doc's slug is its
 * filename, and translation coverage is declared here (titleSv) and verified
 * against disk by scripts/prebuild.mjs and check-sources.mjs.
 */
export const docs: DocMeta[] = docsJson.map((d) => {
  const row = d as DocMetaInput;
  return {
    ...row,
    group: asDocGroup(row.group),
    titleSv: row.titleSv || undefined,
    summarySv: row.summarySv || undefined,
  };
});

export function docsSlugs() {
  return docs.map((d) => d.slug);
}

export function getDoc(slug: string) {
  return docs.find((d) => d.slug === slug) ?? null;
}

export const docGroups = ["Start", "Diagnostics", "Reference", "Project"] as const;

export type DocHeading = { id: string; text: string; level: number };
export type DocIndexEntry = DocMeta & {
  headings: DocHeading[];
  text: string;
  /** Swedish corpus prebuild extracts when a translation exists. */
  headingsSv?: DocHeading[];
  textSv?: string;
};

/**
 * Server-only search index: headings (with the ids rehype-slug generates on
 * the page) plus a plain-text body for matching technical strings like BECM
 * or 0x496D, read from `src/lib/generated/docs-index.json`, written by
 * scripts/prebuild.mjs with imports and JSX stripped. `npm run dev` and
 * `npm run build` both run prebuild first, so the index is always there;
 * hitting this error means the file was removed or generation failed.
 */
export async function getDocsIndex(): Promise<DocIndexEntry[]> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");

  let raw: string;
  try {
    raw = await readFile(join(process.cwd(), "src/lib/generated/docs-index.json"), "utf8");
  } catch {
    throw new Error(
      "src/lib/generated/docs-index.json is missing — run `npm run prebuild` (npm run dev and npm run build run it automatically).",
    );
  }
  const json = JSON.parse(raw) as { entries?: DocIndexEntry[] };
  if (!json.entries?.length) {
    throw new Error("src/lib/generated/docs-index.json has no entries — run `npm run prebuild`.");
  }
  return json.entries.map((e) => ({
    ...e,
    headings: e.headings.map((h) => ({ ...h, level: h.level ?? 2 })),
  }));
}

export type DocsTocItem = DocHeading;

/**
 * Headings for the "on this page" rail of one doc, from the prebuilt index.
 * Translated docs read the `headingsSv` corpus prebuild extracted from the
 * translated MDX — same slugger, so the rail matches the anchors rehype-slug
 * generates on the page; everything else uses the (English) headings.
 */
export async function getDocToc(slug: string, locale = "en"): Promise<DocHeading[]> {
  const entry = (await getDocsIndex()).find((e) => e.slug === slug);
  if (!entry) return [];
  const headings = locale !== "en" && entry.headingsSv?.length ? entry.headingsSv : entry.headings;
  return headings.filter((h) => h.level >= 2);
}
