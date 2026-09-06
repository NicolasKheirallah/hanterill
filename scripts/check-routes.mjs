import { existsSync } from "node:fs";
import { join } from "node:path";
import { fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const required = [
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/layout.tsx",
  "src/app/[locale]/features/page.tsx",
  "src/app/[locale]/features/battery-health/page.tsx",
  "src/app/[locale]/features/vehicle-diagnostics/page.tsx",
  "src/app/[locale]/features/live-data/page.tsx",
  "src/app/[locale]/features/service-functions/page.tsx",
  "src/app/[locale]/vehicles/page.tsx",
  "src/app/[locale]/download/page.tsx",
  "src/app/[locale]/docs/page.tsx",
  "src/app/[locale]/docs/[...slug]/page.tsx",
  "src/app/[locale]/safety/page.tsx",
  "src/app/[locale]/privacy/page.tsx",
  "src/app/[locale]/about/page.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/not-found.tsx",
];

const missing = required.filter((r) => !existsSync(join(root, r)));
if (missing.length) fail(`missing route files:\n  ${missing.join("\n  ")}`);
pass(`routes verification passed (${required.length} files)`);
