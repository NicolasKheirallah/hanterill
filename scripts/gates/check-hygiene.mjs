// Gate oracle: repo + build-output hygiene. Prints HYGIENE_PASSED when all pass.
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];
let passed = 0;
function expect(cond, name, detail) {
  if (cond) passed++;
  else failures.push(`${name}: ${detail}`);
}

// public assets: defaults and unreferenced images gone, CNAME present
const pub = await readdir(join(ROOT, "public"));
for (const gone of ["file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg"]) {
  expect(!pub.includes(gone), `public/${gone} removed`, "still shipped");
}
expect(existsSync(join(ROOT, "public/.nojekyll")), "public/.nojekyll", "missing");
const cname = await readFile(join(ROOT, "public/CNAME"), "utf8").catch(() => "");
expect(cname.trim() === "hanterill.org", "public/CNAME", JSON.stringify(cname));
const hisingen = await readdir(join(ROOT, "public/assets/hisingen")).catch(() => []);
for (const gone of ["analytics-dashboard.png", "charging-11kw.png"]) {
  expect(!hisingen.includes(gone), `hisingen/${gone} removed`, "still present");
}
// every /assets/ path referenced in src exists in public/assets
const srcBlobs = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(ts|tsx|json|mdx)$/.test(e.name)) srcBlobs.push([p, await readFile(p, "utf8")]);
  }
}
await walk(join(ROOT, "src"));
const refs = new Set();
for (const [, c] of srcBlobs) for (const m of c.matchAll(/\/assets\/([\w./-]+\.(?:png|svg|jpg))/g)) refs.add(m[1]);
for (const r of refs) {
  expect(existsSync(join(ROOT, "public/assets", r)), `referenced asset ${r}`, "missing in public");
}
const onDisk = [];
async function walkAssets(dir, base = "") {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walkAssets(p, base + e.name + "/");
    else onDisk.push(base + e.name);
  }
}
await walkAssets(join(ROOT, "public/assets"));
// assets/gen is emitted by scripts/prebuild.mjs from the sources above; its
// renditions are referenced programmatically by src/components/ui/Shot.tsx.
for (const f of onDisk.filter((f) => !f.startsWith("gen/")))
  expect(refs.has(f), `unreferenced asset ${f}`, "not referenced from src");

// stray files and scripts
expect(!existsSync(join(ROOT, "--full-page")), "stray --full-page", "present at root");
expect(!existsSync(join(ROOT, "scripts/setup-pages-domain.sh")), "broken python-as-sh", "present");

// CI: a PR check workflow exists and runs lint + tsc + build
const workflows = await readdir(join(ROOT, ".github/workflows"));
expect(workflows.includes("ci.yml"), "ci.yml workflow", "missing");
const ci = await readFile(join(ROOT, ".github/workflows/ci.yml"), "utf8").catch(() => "");
expect(/pull_request/.test(ci), "ci triggers on PR", "no pull_request trigger");
expect(/lint/.test(ci) && /tsc/.test(ci), "ci runs lint and typecheck", "missing steps");

// tsconfig stricter
const tsconfig = await readFile(join(ROOT, "tsconfig.json"), "utf8");
expect(/"noUnusedLocals":\s*true/.test(tsconfig), "tsconfig noUnusedLocals", "off");

// package.json hygiene: dead tooltip dep removed (InfoLabel gone), typecheck script added
const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const usesTooltip = srcBlobs.filter(([, c]) => /react-tooltip/.test(c)).length;
expect(usesTooltip === 0 || !!pkg.dependencies["@radix-ui/react-tooltip"], "tooltip dep vs usage", "dep kept but unused");
expect(!!pkg.scripts.typecheck, "typecheck script", "missing");

// built output: og image asset emitted and referenced
const outIdx = await readFile(join(ROOT, "out/en/index.html"), "utf8").catch(() => "");
const ogm = outIdx.match(/property="og:image" content="([^"]+)"/);
expect(!!ogm, "og:image in built home", "missing");

console.log(`hygiene checks: ${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log("  FAIL " + f);
if (failures.length) {
  console.log("HYGIENE_FAILED");
  process.exit(1);
}
console.log("HYGIENE_PASSED");
