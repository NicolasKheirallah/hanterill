export type DocMeta = {
  slug: string;
  title: string;
  summary: string;
  group: "Start" | "Diagnostics" | "Reference" | "Project";
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

export const docs: DocMeta[] = [
  { slug: "getting-started", title: "Getting started", summary: "Install Hanterill and open your first session.", group: "Start", titleSv: "Kom igång", summarySv: "Installera Hanterill och öppna din första session." },
  { slug: "connection", title: "Connection", summary: "ENET cable, Ethernet interface and network setup.", group: "Start", titleSv: "Anslutning", summarySv: "ENET-kabel, Ethernet-gränssnitt och nätverksinställningar." },
  { slug: "supported-vehicles", title: "Supported vehicles", summary: "Platforms, status labels and what each one means.", group: "Start", titleSv: "Fordon som stöds", summarySv: "Plattformar, statusetiketter och vad varje etikett betyder." },
  { slug: "battery-diagnostics", title: "Battery diagnostics", summary: "SOH, SOC, cell-group potentials, topologies and thermal data.", group: "Diagnostics" },
  { slug: "dtc-scanning", title: "DTC scanning", summary: "Reading fault codes by status, freeze frames, clearing and diffs.", group: "Diagnostics" },
  { slug: "inspection-reports", title: "Inspection reports", summary: "The scored pre-purchase inspection and how its rules work.", group: "Diagnostics" },
  { slug: "ecu-reference", title: "ECU reference", summary: "The 43-ECU CMA catalogue: codes, names and part numbers.", group: "Reference" },
  { slug: "cli", title: "CLI", summary: "The hanterill command line: reads, offline DID tooling, output formats.", group: "Reference" },
  { slug: "architecture", title: "Architecture", summary: "How the diagnostic engine, DoIP and UDS layers fit together.", group: "Reference" },
  { slug: "safety", title: "Safety", summary: "Read-only versus vehicle-changing operations.", group: "Project", titleSv: "Säkerhet", summarySv: "Skrivskyddad läsning kontra operationer som ändrar fordonet." },
  { slug: "privacy", title: "Privacy", summary: "What stays local and what is never collected.", group: "Project" },
  { slug: "license", title: "License", summary: "Source-available, for private use. What that permits.", group: "Project" },
  { slug: "releases", title: "Releases", summary: "Versioning, release channels and where the changelog lives.", group: "Project" },
];

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
      const headings: DocHeading[] = [];
      for (const m of raw.matchAll(/^(#{1,3})\s+(.+?)\s*$/gm)) {
        const text = m[2].replace(/[*_`]/g, "");
        headings.push({ level: m[1].length, text, id: slugify(text) });
      }
      const text = raw
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/^import[^;]+;/gm, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/[#>|*_`\-\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 600);
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
