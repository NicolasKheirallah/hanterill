import { join } from "node:path";
import { existsSync } from "node:fs";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const problems = [];

for (const rel of ["src/app/sitemap.ts", "src/app/robots.ts"]) {
  if (!existsSync(join(root, rel))) problems.push(`missing ${rel}`);
}

const layout = read(join(root, "src/app/[locale]/layout.tsx"));
for (const key of ["metadataBase", "openGraph", "twitter", "description", "title"]) {
  if (!new RegExp(key).test(layout)) problems.push(`layout metadata missing "${key}"`);
}

// JSON-LD structured data for SoftwareApplication + SoftwareSourceCode somewhere in the tree.
const all = walk(join(root, "src"), [".ts", ".tsx"]).map(read).join("\n");
if (!/application\/ld\+json/.test(all)) problems.push("no JSON-LD (application/ld+json) script anywhere");
if (!/"SoftwareApplication"/.test(all)) problems.push("no SoftwareApplication JSON-LD");
if (!/"SoftwareSourceCode"/.test(all)) problems.push("no SoftwareSourceCode JSON-LD");
if (!/"FAQPage"/.test(all)) problems.push("no FAQPage JSON-LD");

if (problems.length) fail(`SEO issues:\n  ${problems.join("\n  ")}`);
pass("SEO verification passed");
