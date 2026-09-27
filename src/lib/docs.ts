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
export type DocIndexEntry = DocMeta & { headings: DocHeading[]; text: string };

/** Mirrors rehype-slug / github-slugger: unicode letters are kept. */
function slugify(s: string) {
  // Mirrors github-slugger (used by rehype-slug): unicode letters survive,
  // punctuation drops, whitespace becomes hyphens.
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s+/g, "-");
}

/**
 * Server-only search index: headings (with the ids rehype-slug will generate)
 * plus a plain-text body for matching technical strings like BECM or 0x496D.
 * Prefers `src/lib/generated/docs-index.json`, written by scripts/prebuild.mjs
 * with imports and JSX stripped. Falls back to parsing the MDX directly when
 * the generated file is absent (fresh checkout before the first build).
 */
export async function getDocsIndex(): Promise<DocIndexEntry[]> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");

  try {
    const json = JSON.parse(
      await readFile(join(process.cwd(), "src/lib/generated/docs-index.json"), "utf8"),
    ) as { entries?: (DocIndexEntry & { headings: { text: string; id: string; level?: number }[] })[] };
    if (json.entries?.length) {
      return json.entries.map((e) => ({
        ...e,
        headings: e.headings.map((h) => ({ ...h, level: h.level ?? 2 })),
      }));
    }
  } catch {
    // fall through to direct parsing
  }

  const dir = join(process.cwd(), "src/content/docs");
  return Promise.all(
    docs.map(async (d) => {
      let raw = "";
      try {
        raw = await readFile(join(dir, `${d.slug}.mdx`), "utf8");
      } catch {
        // fall through with empty body
      }
      // Same extraction prebuild.mjs performs via scripts/docs-text.mjs: the
      // whole stripped body, no cap, so the fallback cannot index less than
      // the generated corpus does.
      const headings: DocHeading[] = [];
      for (const m of raw.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)) {
        const text = m[2].replace(/[*_`]/g, "");
        headings.push({ level: m[1].length, text, id: slugify(text) });
      }
      const text = raw
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/^import[^;]+;/gm, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/[#>|*_`[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { ...d, headings, text };
    }),
  );
}

export type DocsTocItem = DocHeading;

/**
 * Headings for the "on this page" rail of one doc. Translated locales read
 * their own MDX so the rail matches the anchors rehype-slug generated on the
 * page; everything else uses the built (English) index.
 */
export async function getDocToc(slug: string, locale = "en"): Promise<DocHeading[]> {
  if (locale !== "en") {
    try {
      const { readFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      const raw = await readFile(
        join(process.cwd(), "src/content/docs", locale, `${slug}.mdx`),
        "utf8",
      );
      const headings: DocHeading[] = [];
      for (const m of raw.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)) {
        const text = m[2].replace(/[*_`]/g, "");
        headings.push({ level: m[1].length, text, id: slugify(text) });
      }
      return headings;
    } catch {
      // no translated file; fall through to the English index
    }
  }
  const idx = await getDocsIndex();
  return idx.find((e) => e.slug === slug)?.headings.filter((h) => h.level >= 2) ?? [];
}
