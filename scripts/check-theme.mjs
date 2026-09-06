import { join } from "node:path";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const css = read(join(root, "src/app/globals.css"));
const problems = [];

if (!/:root\s*\{[^}]*--bg-primary/s.test(css)) problems.push("globals.css: no light --bg-primary token on :root");
if (!/\[data-theme="dark"\][^{]*\{[^}]*--bg-primary/s.test(css))
  problems.push('globals.css: no [data-theme="dark"] override for --bg-primary');
if (!/@media\s*\(prefers-color-scheme:\s*dark\)/.test(css))
  problems.push("globals.css: no prefers-color-scheme dark block");
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css))
  problems.push("globals.css: no prefers-reduced-motion reduce block");

const layout = read(join(root, "src/app/[locale]/layout.tsx"));
if (!/localStorage/.test(layout) || !/data-theme/.test(layout))
  problems.push("layout.tsx: missing inline no-flash theme script (localStorage + data-theme)");

const comps = walk(join(root, "src/components"), [".tsx"]);
const toggle = comps.find((f) => /ThemeToggle/.test(f));
if (!toggle) problems.push("no ThemeToggle component found");
else {
  const t = read(toggle);
  if (!/localStorage/.test(t)) problems.push("ThemeToggle: does not persist to localStorage");
  if (!/matchMedia|prefers-color-scheme|"system"|'system'/.test(t))
    problems.push("ThemeToggle: offers no system-preference option");
}

if (problems.length) fail(`theme system issues:\n  ${problems.join("\n  ")}`);
pass("theme system verification passed");
