/**
 * Glossary terms for the documentation and the surface UI. Each entry is the
 * expansion of an acronym a reader will meet, in plain language, plus the doc
 * page where it is used.
 *
 * The table itself is data — src/content/glossary.json, the one artifact —
 * with the English text and, where a term has a Swedish form matching the
 * app's shipped vocabulary (sv-terms), the termSv/fullSv/meaningSv fields.
 * This module is the typed interface over it.

 * Written for a reader who is comfortable with cars but not with diagnostics.
 * Where a term has a precise technical expansion, the expansion is given first
 * and the plain-language explanation second.
 */
import glossaryJson from "@/content/glossary.json";

export type GlossaryGroup =
  | "Diagnostics"
  | "Protocols"
  | "Battery and high voltage"
  | "Modules"
  | "Platforms and bodies";

export type GlossaryEntry = {
  /** Short form, as it appears in the UI and the docs. */
  term: string;
  /** Full expansion. */
  full: string;
  /** One sentence, plain language. */
  meaning: string;
  /** Grouping for the glossary page. */
  group: GlossaryGroup;
  /** Doc page where the term is used. */
  doc?: string;
  /** Swedish short form, when it differs from the English one. */
  termSv?: string;
  fullSv?: string;
  meaningSv?: string;
};

/** One entry as a locale should render it: the Swedish fields applied when present. */
export type GlossaryView = {
  term: string;
  full: string;
  meaning: string;
  group: GlossaryGroup;
  doc?: string;
};

export const glossaryGroups: GlossaryGroup[] = [
  "Diagnostics",
  "Protocols",
  "Battery and high voltage",
  "Modules",
  "Platforms and bodies",
];

/** Catalog keys (docs.glossaryGroups.*) for the group headings. */
export const glossaryGroupKeys: Record<GlossaryGroup, string> = {
  "Diagnostics": "diagnostics",
  "Protocols": "protocols",
  "Battery and high voltage": "battery",
  "Modules": "modules",
  "Platforms and bodies": "platforms",
};

const GROUPS: GlossaryGroup[] = glossaryGroups;

function asGroup(group: string): GlossaryGroup {
  if (!GROUPS.includes(group as GlossaryGroup)) {
    throw new Error(`glossary.json: group "${group}" is not one of ${GROUPS.join(", ")}`);
  }
  return group as GlossaryGroup;
}

export const glossary: GlossaryEntry[] = glossaryJson.map((e) => {
  const row = e as GlossaryEntry;
  return { ...row, group: asGroup(row.group) };
});

/** The whole glossary, localised: Swedish fields applied where they exist. */
export function glossaryEntries(locale: string): GlossaryView[] {
  return glossary.map((e) => ({
    term: (locale === "sv" && e.termSv) || e.term,
    full: (locale === "sv" && e.fullSv) || e.full,
    meaning: (locale === "sv" && e.meaningSv) || e.meaning,
    group: e.group,
    doc: e.doc,
  }));
}

/** Look up one term by its English short form, case-insensitively. */
export function findTerm(term: string): GlossaryEntry | undefined {
  const want = term.toLowerCase();
  return glossary.find((e) => e.term.toLowerCase() === want);
}
