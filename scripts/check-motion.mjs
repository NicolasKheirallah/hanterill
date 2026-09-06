import { join } from "node:path";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const files = walk(join(root, "src"), [".ts", ".tsx"]);
const problems = [];

let motionFiles = 0;
let reducedAware = 0;
for (const f of files) {
  const c = read(f);
  if (/window\.addEventListener\(\s*["']scroll["']/.test(c))
    problems.push(`${f.replace(root, ".")}: raw window scroll listener (use useScroll / IntersectionObserver)`);
  if (/from\s+["']motion\/react["']/.test(c)) {
    motionFiles++;
    if (/useReducedMotion|prefers-reduced-motion/.test(c)) reducedAware++;
  }
}

if (motionFiles === 0) problems.push("no components import from motion/react — brief requires state-communicating motion");
// Not every motion file must gate individually, but the majority should.
if (motionFiles > 0 && reducedAware / motionFiles < 0.6)
  problems.push(`only ${reducedAware}/${motionFiles} motion components honor useReducedMotion (need >= 60%)`);

const css = read(join(root, "src/app/globals.css"));
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)[^}]*\{/s.test(css))
  problems.push("globals.css: no prefers-reduced-motion reduce rule");

if (problems.length) fail(`motion / reduced-motion issues:\n  ${problems.join("\n  ")}`);
pass(`motion + reduced-motion verification passed (${reducedAware}/${motionFiles} gated)`);
