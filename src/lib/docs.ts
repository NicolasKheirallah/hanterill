export type DocMeta = {
  slug: string;
  title: string;
  summary: string;
  group: "Start" | "Diagnostics" | "Reference" | "Project";
};

export const docs: DocMeta[] = [
  { slug: "getting-started", title: "Getting started", summary: "Install openCMA and open your first session.", group: "Start" },
  { slug: "connection", title: "Connection", summary: "ENET cable, Ethernet interface and network setup.", group: "Start" },
  { slug: "supported-vehicles", title: "Supported vehicles", summary: "Platforms, status labels and what each one means.", group: "Start" },
  { slug: "battery-diagnostics", title: "Battery diagnostics", summary: "SOH, SOC, cell-group potentials and thermal data.", group: "Diagnostics" },
  { slug: "dtc-scanning", title: "DTC scanning", summary: "Reading fault codes by status and freeze frames.", group: "Diagnostics" },
  { slug: "ecu-reference", title: "ECU reference", summary: "CMA ECU codes, names and part numbers.", group: "Reference" },
  { slug: "cli", title: "CLI", summary: "Scripting openCMA from the command line.", group: "Reference" },
  { slug: "architecture", title: "Architecture", summary: "How the diagnostic engine, DoIP and UDS layers fit together.", group: "Reference" },
  { slug: "safety", title: "Safety", summary: "Read-only versus vehicle-changing operations.", group: "Project" },
  { slug: "privacy", title: "Privacy", summary: "What stays local and what is never collected.", group: "Project" },
  { slug: "license", title: "License", summary: "Source-available, for private use. What that permits.", group: "Project" },
  { slug: "development", title: "Development", summary: "Build openCMA from source and contribute.", group: "Project" },
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Server-only. Reads the MDX sources to build a search index: headings (with
 * the ids rehype-slug will generate) plus a plain-text body for matching
 * technical strings like BECM or 0x496D.
 */
export async function getDocsIndex(): Promise<DocIndexEntry[]> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
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
        .replace(/[#>|*_`\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 600);
      return { ...d, headings, text };
    }),
  );
}

export type DocsTocItem = DocHeading;

/** Headings for the "on this page" rail of one doc. */
export async function getDocToc(slug: string): Promise<DocHeading[]> {
  const idx = await getDocsIndex();
  return idx.find((e) => e.slug === slug)?.headings.filter((h) => h.level >= 2) ?? [];
}
