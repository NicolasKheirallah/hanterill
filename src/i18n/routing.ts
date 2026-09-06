import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sv"],
  defaultLocale: "en",
  // /en/... and /sv/... always in the URL, so a shared link keeps its language.
  localePrefix: "always",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  sv: "Svenska",
};
