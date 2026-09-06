import { join } from "node:path";
import { readFileSync } from "node:fs";
import { fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const problems = [];
const read = (rel) => readFileSync(join(root, rel), "utf8");

// --- Rejected by decision, not by accident (see PREMIUM-PASS.md section 5) ---
const pkg = JSON.parse(read("package.json"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const banned = ["@react-three/postprocessing", "lenis", "@studio-freight/lenis", "gsap", "chart.js", "react-chartjs-2", "echarts", "echarts-for-react"];
for (const b of banned) {
  if (deps[b]) problems.push(`package.json depends on "${b}" (rejected in PREMIUM-PASS.md: postprocessing / smooth-scroll / heavy chart libs do not fit this brand)`);
}

// --- 3D battery: studio lighting, not a prototype ---
const pack3d = read("src/components/battery/BatteryPack3D.tsx");
if (!/<Environment\b/.test(pack3d))
  problems.push("BatteryPack3D.tsx: no <Environment> (expected studio lighting via Environment + Lightformer, not bare directionalLight)");
if (!/<Lightformer\b/.test(pack3d))
  problems.push("BatteryPack3D.tsx: no <Lightformer> in the environment");
if (!/<ContactShadows\b/.test(pack3d))
  problems.push("BatteryPack3D.tsx: no grounded soft shadow (<ContactShadows>)");
if (/meshBasicMaterial/.test(pack3d))
  problems.push("BatteryPack3D.tsx: uses meshBasicMaterial (unlit) for the modules");
if (/EffectComposer|@react-three\/postprocessing/.test(pack3d))
  problems.push("BatteryPack3D.tsx: postprocessing in the scene (rejected for this brand)");
if (/frameloop=\{[^}]*demand/.test(pack3d) === false)
  problems.push("BatteryPack3D.tsx: canvas frameloop no longer drops to demand when idle / reduced-motion");

// --- CSS scroll-driven reveal, double-guarded ---
const css = read("src/app/globals.css");
if (!/@supports\s*\(animation-timeline:\s*view\(\)\)/.test(css))
  problems.push("globals.css: reveal is not behind @supports (animation-timeline: view())");
if (!/\.reveal\s*\{\s*opacity:\s*1/.test(css))
  problems.push("globals.css: .reveal base style must keep opacity: 1");
if (/Reveal[\s\S]{0,400}motion\/react/.test(read("src/components/ui/Reveal.tsx")))
  problems.push("Reveal.tsx still imports motion/react (should be a plain element with the .reveal class)");

// --- No page-transition engine, scoped or global ---
// Scoped view transitions (P3-4) were trialled and pulled: Next 16.3.4 has no
// experimental.viewTransition flag and the auto-VT on navigation could not be
// verified across browsers. Guard against any of it creeping back.
const localeLayout = read("src/app/[locale]/layout.tsx");
if (/AnimatePresence[\s\S]{0,120}\{children\}/.test(localeLayout))
  problems.push("[locale]/layout.tsx: children are wrapped in a global page transition");
if (/::view-transition|view-transition-name/.test(css))
  problems.push("globals.css: view-transition CSS is back (P3-4 was pulled, see PREMIUM-PASS.md 4.4)");
if (/addTransitionType/.test(read("src/components/layout/LocaleSwitcher.tsx")))
  problems.push("LocaleSwitcher.tsx: addTransitionType is back (P3-4 was pulled)");

// --- Press feedback is pointer-only and motion-gated ---
if (!/@media\s*\(hover:\s*hover\)\s*and\s*\(prefers-reduced-motion:\s*no-preference\)[\s\S]*?\.press/.test(css))
  problems.push("globals.css: .press feedback is not gated to (hover: hover) and (prefers-reduced-motion: no-preference)");

if (problems.length) fail(`premium pass issues:\n  ${problems.join("\n  ")}`);
pass("premium pass verification passed");
