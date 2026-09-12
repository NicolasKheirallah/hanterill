import type { ComponentType } from "react";
import type { Locale } from "@/i18n/routing";

type MDXModule = { default: ComponentType };

/**
 * Static import map so the bundler resolves every doc at build time.
 * English holds every doc; `sv` holds the translated subset and falls back
 * to English for the rest (the page shows the "English only" note when it
 * has to fall back).
 */
export const docLoaders: Record<Locale, Record<string, () => Promise<MDXModule>>> = {
  en: {
    "getting-started": () => import("@/content/docs/getting-started.mdx"),
    "connection": () => import("@/content/docs/connection.mdx"),
    "supported-vehicles": () => import("@/content/docs/supported-vehicles.mdx"),
    "battery-diagnostics": () => import("@/content/docs/battery-diagnostics.mdx"),
    "dtc-scanning": () => import("@/content/docs/dtc-scanning.mdx"),
    "inspection-reports": () => import("@/content/docs/inspection-reports.mdx"),
    "ecu-reference": () => import("@/content/docs/ecu-reference.mdx"),
    "cli": () => import("@/content/docs/cli.mdx"),
    "architecture": () => import("@/content/docs/architecture.mdx"),
    "safety": () => import("@/content/docs/safety.mdx"),
    "privacy": () => import("@/content/docs/privacy.mdx"),
    "license": () => import("@/content/docs/license.mdx"),
    "releases": () => import("@/content/docs/releases.mdx"),
  },
  sv: {
    "getting-started": () => import("@/content/docs/sv/getting-started.mdx"),
    "connection": () => import("@/content/docs/sv/connection.mdx"),
    "safety": () => import("@/content/docs/sv/safety.mdx"),
    "supported-vehicles": () => import("@/content/docs/sv/supported-vehicles.mdx"),
  },
};

export function docLoaderFor(locale: string, slug: string) {
  const byLocale = docLoaders[locale as Locale];
  return byLocale?.[slug] ?? docLoaders.en[slug];
}

/** True when the doc has a real translation for this locale. */
export function docIsTranslated(locale: string, slug: string) {
  return Boolean(docLoaders[locale as Locale]?.[slug]);
}
