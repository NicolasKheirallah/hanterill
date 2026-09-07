import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sv"],
  defaultLocale: "en",
  // /en/... and /sv/... always in the URL, so a shared link keeps its language.
  localePrefix: "always",
  // Accept-Language detection needs middleware, which a static export has none
  // of. "/" is a prerendered redirect to the default locale (src/app/page.tsx);
  // the header switch covers the rest.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  sv: "Svenska",
};
