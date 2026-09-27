import type { Locale } from "@/i18n/routing";
import { docLoaders } from "./docs-registry.generated";

/**
 * Loader access for the docs pages. The static import map itself is generated:
 * `docs-registry.generated.ts` is written by scripts/prebuild.mjs from the
 * files on disk (en holds every doc, sv the translated subset), so a doc is
 * never listed in two places. The map is static so the bundler resolves every
 * doc at build time; sv falls back to English (the page shows the "English
 * only" note when it has to).
 */

export function docLoaderFor(locale: Locale | string, slug: string) {
  const byLocale = docLoaders[locale];
  return byLocale?.[slug] ?? docLoaders.en[slug];
}

/** True when the doc has a real translation for this locale. */
export function docIsTranslated(locale: Locale | string, slug: string) {
  return Boolean(docLoaders[locale]?.[slug]);
}
