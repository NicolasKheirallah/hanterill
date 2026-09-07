import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sv"],
  defaultLocale: "en",
  // /en/... and /sv/... always in the URL, so a shared link keeps its language.
  localePrefix: "always",
  // No Accept-Language detection: that needs middleware, which a static export
  // has no room for. "/" is a prerendered redirect to the default locale
  // (src/app/page.tsx); the switch in the header covers the rest.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  sv: "Svenska",
};
