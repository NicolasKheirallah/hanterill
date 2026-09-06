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

// The CSS scroll-driven reveal must be double-guarded: only where
// `animation-timeline: view()` is supported, and only with motion allowed.
if (/\.reveal\s*\{/.test(css)) {
  if (!/@supports\s*\(animation-timeline:\s*view\(\)\)/.test(css))
    problems.push("globals.css: .reveal is not guarded by @supports (animation-timeline: view())");
  if (!/@media\s*\(prefers-reduced-motion:\s*no-preference\)[\s\S]*?\.reveal/.test(css))
    problems.push("globals.css: .reveal animation is not inside a prefers-reduced-motion: no-preference block");
  if (!/\.reveal\s*\{\s*opacity:\s*1/.test(css))
    problems.push("globals.css: .reveal base style must keep opacity: 1 (readable with no animation)");
}

// The one orchestrated load moment (hero) is also gated.
if (/\.hero-seq\b/.test(css) && !/@media\s*\(prefers-reduced-motion:\s*no-preference\)[\s\S]*?\.hero-seq/.test(css))
  problems.push("globals.css: .hero-seq animation is not inside a prefers-reduced-motion: no-preference block");

if (problems.length) fail(`motion / reduced-motion issues:\n  ${problems.join("\n  ")}`);
pass(`motion + reduced-motion verification passed (${reducedAware}/${motionFiles} gated)`);
