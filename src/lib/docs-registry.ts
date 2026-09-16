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
    "hardware-and-adapters": () => import("@/content/docs/hardware-and-adapters.mdx"),
    "supported-vehicles": () => import("@/content/docs/supported-vehicles.mdx"),
    "workspace-tour": () => import("@/content/docs/workspace-tour.mdx"),
    "interface-and-language": () => import("@/content/docs/interface-and-language.mdx"),
    "troubleshooting": () => import("@/content/docs/troubleshooting.mdx"),
    "battery-diagnostics": () => import("@/content/docs/battery-diagnostics.mdx"),
    "charging": () => import("@/content/docs/charging.mdx"),
    "parasitic-drain": () => import("@/content/docs/parasitic-drain.mdx"),
    "dtc-scanning": () => import("@/content/docs/dtc-scanning.mdx"),
    "live-telemetry": () => import("@/content/docs/live-telemetry.mdx"),
    "subsystem-telemetry": () => import("@/content/docs/subsystem-telemetry.mdx"),
    "inspection-reports": () => import("@/content/docs/inspection-reports.mdx"),
    "sessions-and-evidence": () => import("@/content/docs/sessions-and-evidence.mdx"),
    "captures-and-sweeps": () => import("@/content/docs/captures-and-sweeps.mdx"),
    "firmware-and-inventory": () => import("@/content/docs/firmware-and-inventory.mdx"),
    "service-functions": () => import("@/content/docs/service-functions.mdx"),
    "engine-lane": () => import("@/content/docs/engine-lane.mdx"),
    "vehicle-configuration": () => import("@/content/docs/vehicle-configuration.mdx"),
    "ecu-reference": () => import("@/content/docs/ecu-reference.mdx"),
    "did-catalogue": () => import("@/content/docs/did-catalogue.mdx"),
    "capabilities-and-gating": () => import("@/content/docs/capabilities-and-gating.mdx"),
    "network-explorer": () => import("@/content/docs/network-explorer.mdx"),
    "vehicle-identity": () => import("@/content/docs/vehicle-identity.mdx"),
    "cli": () => import("@/content/docs/cli.mdx"),
    "glossary": () => import("@/content/docs/glossary.mdx"),
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
    "workspace-tour": () => import("@/content/docs/sv/workspace-tour.mdx"),
    "interface-and-language": () => import("@/content/docs/sv/interface-and-language.mdx"),
    "battery-diagnostics": () => import("@/content/docs/sv/battery-diagnostics.mdx"),
    "dtc-scanning": () => import("@/content/docs/sv/dtc-scanning.mdx"),
    "live-telemetry": () => import("@/content/docs/sv/live-telemetry.mdx"),
    "inspection-reports": () => import("@/content/docs/sv/inspection-reports.mdx"),
    "sessions-and-evidence": () => import("@/content/docs/sv/sessions-and-evidence.mdx"),
    "firmware-and-inventory": () => import("@/content/docs/sv/firmware-and-inventory.mdx"),
    "service-functions": () => import("@/content/docs/sv/service-functions.mdx"),
    "ecu-reference": () => import("@/content/docs/sv/ecu-reference.mdx"),
    "cli": () => import("@/content/docs/sv/cli.mdx"),
    "glossary": () => import("@/content/docs/sv/glossary.mdx"),
    "architecture": () => import("@/content/docs/sv/architecture.mdx"),
    "privacy": () => import("@/content/docs/sv/privacy.mdx"),
    "license": () => import("@/content/docs/sv/license.mdx"),
    "releases": () => import("@/content/docs/sv/releases.mdx"),
    "hardware-and-adapters": () => import("@/content/docs/sv/hardware-and-adapters.mdx"),
    "troubleshooting": () => import("@/content/docs/sv/troubleshooting.mdx"),
    "charging": () => import("@/content/docs/sv/charging.mdx"),
    "parasitic-drain": () => import("@/content/docs/sv/parasitic-drain.mdx"),
    "subsystem-telemetry": () => import("@/content/docs/sv/subsystem-telemetry.mdx"),
    "captures-and-sweeps": () => import("@/content/docs/sv/captures-and-sweeps.mdx"),
    "engine-lane": () => import("@/content/docs/sv/engine-lane.mdx"),
    "vehicle-configuration": () => import("@/content/docs/sv/vehicle-configuration.mdx"),
    "did-catalogue": () => import("@/content/docs/sv/did-catalogue.mdx"),
    "capabilities-and-gating": () => import("@/content/docs/sv/capabilities-and-gating.mdx"),
    "network-explorer": () => import("@/content/docs/sv/network-explorer.mdx"),
    "vehicle-identity": () => import("@/content/docs/sv/vehicle-identity.mdx"),
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
