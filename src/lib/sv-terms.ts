/**
 * Swedish doc terminology.
 *
 * The app ships its own Swedish (`openCMA/apps/desktop/ui/src/i18n/sv.ts`)
 * under an explicit policy: established workshop terms are kept, and everything
 * else follows Swedish motor-industry convention (styrenhet for ECU, felkod for
 * DTC, frysta ramdata for freeze frame, vilström for drain).
 *
 * The docs must speak the same language as the product. The term table itself
 * is data — `sv-terms.json`, the one artifact — and
 * `scripts/gates/check-sv-terms.mjs` imports it directly to fail the build
 * when a doc uses an invented synonym instead.
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

import termsJson from "./sv-terms.json";

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

export const svTerms: SvTerm[] = termsJson.map((t) => ({
  en: t.en,
  sv: t.sv,
  reject: t.reject,
  ...(t.appLabel ? { appLabel: t.appLabel } : {}),
}));

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
