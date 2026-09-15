/**
 * Swedish doc terminology.
 *
 * The app ships its own Swedish (`openCMA/apps/desktop/ui/src/i18n/sv.ts`)
 * under an explicit policy: established workshop terms are kept, and everything
 * else follows Swedish motor-industry convention (styrenhet for ECU, felkod for
 * DTC, frysta ramdata for freeze frame, vilström for drain).
 *
 * The docs must speak the same language as the product. This file is the
 * mapping, and `scripts/gates/check-sv-terms.mjs` fails the build when a doc
 * uses an invented synonym instead.
 *
 * Two distinct things are tracked, because they call for different fixes:
 *
 * 1. `reject` lists forms that are not idiomatic Swedish at all: anglicism
 *    calques of English noun stacks (`sömndrift` for sleep drain) or compounds
 *    Swedish does not build (`frysbild`, `skrivbordsapp`). These are always
 *    wrong and are fixed everywhere, including the message catalog.
 *
 * 2. `appLabel` records terms that are perfectly good Swedish, but where the
 *    app has one specific word for a screen. `Realtidstelemetri` is correct
 *    Swedish; the app still calls that screen `Livedata`, so a doc that sends
 *    the reader looking for a screen must use the app's word. These are only
 *    checked in screen-name positions, never in prose.
 */

export type SvTerm = {
  /** English term as used in the docs. */
  en: string;
  /** Preferred Swedish, matching the app. */
  sv: string;
  /** Forms that are never idiomatic Swedish. Fixed everywhere. */
  reject: string[];
  /**
   * Alternative Swedish that is valid but is not what the app calls this
   * screen. Only checked where a doc names a screen.
   */
  appLabel?: string;
};

export const svTerms: SvTerm[] = [
  // Modules and diagnostics
  { en: "ECU", sv: "styrenhet", reject: [] },
  { en: "fault code / DTC", sv: "felkod", reject: [] },
  { en: "freeze frame", sv: "frysta ramdata", reject: ["frysbild", "frysbilder"] },
  {
    en: "ECU inventory",
    sv: "styrmodulregister",
    reject: ["styrenhetsinventering", "ECU-inventering"],
    appLabel: "Styrenhetsregister",
  },
  { en: "module", sv: "modul", reject: [] },
  { en: "coverage", sv: "täckning", reject: [] },
  { en: "payload", sv: "nyttolast", reject: [] },

  // Battery and energy
  { en: "state of health", sv: "hälsotillstånd", reject: [] },
  { en: "state of charge", sv: "laddningsnivå", reject: [] },
  { en: "cell group", sv: "cellgrupp", reject: [] },
  { en: "quiescent drain", sv: "viloförbrukning", reject: ["sömndrift", "sömnström"] },
  { en: "quiescent current", sv: "vilström", reject: [] },

  // Vehicle and connection
  { en: "vehicle", sv: "fordon", reject: [] },
  { en: "connection", sv: "anslutning", reject: [] },
  { en: "interface", sv: "gränssnitt", reject: [] },
  { en: "link", sv: "länk", reject: [] },
  { en: "gateway", sv: "gateway", reject: [] },
  { en: "routing activation", sv: "routningsaktivering", reject: ["diagnostikväg"] },
  { en: "discovery", sv: "upptäckt", reject: ["upptäcktsbroadcast"] },

  // Safety and writes
  { en: "read-only", sv: "skrivskyddad", reject: [] },
  { en: "write", sv: "skrivning", reject: [] },
  { en: "confirm-gated", sv: "kräver bekräftelse", reject: ["bekräftelsekrävande", "bekräftelsegrindad"] },

  // Evidence and sessions
  { en: "evidence", sv: "bevis", reject: [] },
  { en: "session", sv: "session", reject: [] },
  { en: "measured", sv: "uppmätt", reject: [] },
  { en: "derived", sv: "härledd", reject: [] },
  { en: "decode", sv: "avkoda", reject: [] },

  // App surfaces
  { en: "live data", sv: "livedata", reject: [], appLabel: "Realtidstelemetri" },
  { en: "inspection report", sv: "inspektionsrapport", reject: [], appLabel: "Besiktningsrapport" },
  { en: "desktop app", sv: "appen", reject: ["skrivbordsapp"] },
  {
    en: "released build",
    sv: "den skarpa versionen",
    reject: ["släpptbygget", "släppta appen", "släpptbyggen", "släpptbygderna"],
  },
  { en: "capability", sv: "kapacitet", reject: [] },
];

/** Every form that is never idiomatic Swedish. */
export function rejectedSvForms(): string[] {
  return svTerms.flatMap((t) => t.reject);
}

/** Alternative screen names that the app spells differently. */
export function appLabelAlternatives(): { want: string; bad: string }[] {
  return svTerms
    .filter((t) => t.appLabel)
    .map((t) => ({ want: t.sv, bad: t.appLabel as string }));
}
