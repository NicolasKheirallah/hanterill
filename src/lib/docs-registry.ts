import type { ComponentType } from "react";

type MDXModule = { default: ComponentType };

/** Static import map so the bundler resolves every doc at build time. */
export const docLoaders: Record<string, () => Promise<MDXModule>> = {
  "getting-started": () => import("@/content/docs/getting-started.mdx"),
  connection: () => import("@/content/docs/connection.mdx"),
  "supported-vehicles": () => import("@/content/docs/supported-vehicles.mdx"),
  "battery-diagnostics": () => import("@/content/docs/battery-diagnostics.mdx"),
  "dtc-scanning": () => import("@/content/docs/dtc-scanning.mdx"),
  "ecu-reference": () => import("@/content/docs/ecu-reference.mdx"),
  cli: () => import("@/content/docs/cli.mdx"),
  architecture: () => import("@/content/docs/architecture.mdx"),
  safety: () => import("@/content/docs/safety.mdx"),
  privacy: () => import("@/content/docs/privacy.mdx"),
  license: () => import("@/content/docs/license.mdx"),
  development: () => import("@/content/docs/development.mdx"),
};
