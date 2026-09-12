// Gate oracle: source-level consistency checks. Exits 1 and prints
// CONSISTENCY_FAILED on any miss; prints CONSISTENCY_PASSED only when all pass.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];
const checks = { passed: 0, failed: 0 };

function ok(name) {
  checks.passed++;
  void name;
}
function fail(name, detail) {
  checks.failed++;
  failures.push(`${name}: ${detail}`);
}

async function read(rel) {
  return readFile(join(ROOT, rel), "utf8");
}
function expect(cond, name, detail) {
  if (cond) ok(name); else fail(name, detail);
}

// 1. One repo slug everywhere; the private app repo is never referenced;
//    site.ts is the source of truth.
const site = await read("src/lib/site.ts");
const readmes = await read("README.md");
const lic = await read("LICENSE.md");
expect(/repo:\s*"NicolasKheirallah\/hanterill"/.test(site), "site.ts repo slug", site);
for (const [label, txt] of [["README.md", readmes], ["LICENSE.md", lic]]) {
  expect(!/Hanterill-main/i.test(txt), `${label} legacy slug`, "contains Hanterill-main");
  expect(!/github\.com\/hanterill\/hanterill/.test(txt), `${label} phantom org`, "contains github.com/hanterill/hanterill");
}
expect(!/hanterill\.com/.test(readmes + lic + site), "domain drift", "hanterill.com appears");
expect(!/hanterill-app/i.test(readmes + lic + site), "private repo slug", "hanterill-app appears in README/LICENSE/site.ts");

// 2. GitHub URLs in src point at the public repo only (everything else derives
//    from site.ts); the private app repo slug never appears in src.
const srcFiles = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else srcFiles.push(p);
  }
}
await walk(join(ROOT, "src"));
const offenders = [];
for (const f of srcFiles) {
  const c = await readFile(f, "utf8");
  for (const m of c.matchAll(/https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/g)) {
    const slug = `${m[1]}/${m[2]}`.toLowerCase();
    if (slug !== "nicolaskheirallah/hanterill" && !m[0].toLowerCase().includes("/creativecommons")) {
      offenders.push(`${f.slice(ROOT.length + 1)} -> ${m[0]}`);
    }
  }
  if (/hanterill-app/i.test(c)) {
    offenders.push(`${f.slice(ROOT.length + 1)} -> private repo slug hanterill-app`);
  }
}
expect(offenders.length === 0, "hardcoded github URLs", offenders.join(" | "));

// 3. ECU counts derive from ecus.ts (43 catalogue / 34 DTC-capable).
const ecus = await read("src/lib/ecus.ts");
const ecuCount = (ecus.match(/\{\s*code:\s*"/g) || []).length;
const dtcCount = (ecus.match(/dtc:\s*true/g) || []).length;
expect(ecuCount === 43, "ecu catalogue size", `found ${ecuCount}`);
expect(dtcCount === 34, "dtc-capable size", `found ${dtcCount}`);
const scanSim = await read("src/lib/scan-sim.ts");
expect(!/discovered:\s*\d+\s*,/.test(scanSim), "scan-sim hardcodes totals", "still hardcodes discovered/diagnostic");
expect(/ecuStats/.test(scanSim), "scan-sim derives from ecuStats", "no ecuStats import");
const views = await read("src/components/product/views.tsx");
expect(/ecuStats\.dtc\b/.test(views), "views uses DTC-capable stat", "no ecuStats.dtc usage");
expect(/43/.test(ecus), "ecus.ts states catalogue size", "no 43 in comment/data");

// 4. Cell spread thresholds: one band definition (2/4), demo data self-consistent.
expect(!/within 3 mV|3 to 5 mV|over 5 mV|inom 3 mV|3 till 5 mV|över 5 mV/.test(await read("src/messages/en.json") + await read("src/messages/sv.json")), "second band set", "3/5 mV legend still present");
const demo = await read("src/lib/demo-data.ts");
const avg = Number(demo.match(/avgCellGroup:\s*([\d.]+)/)[1]);
const declaredMin = Number(demo.match(/minCellGroup:\s*([\d.]+)/)[1]);
const declaredMax = Number(demo.match(/maxCellGroup:\s*([\d.]+)/)[1]);
const declaredDelta = Number(demo.match(/cellDelta:\s*(\d+)/)[1]);
const seedBlock = demo.match(/const seed = \[([\s\S]*?)\];/)[1];
const offsets = seedBlock.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)).slice(0, 108);
const offMin = Math.min(...offsets), offMax = Math.max(...offsets);
const calcMin = Number((avg + offMin / 1000).toFixed(3));
const calcMax = Number((avg + offMax / 1000).toFixed(3));
const calcDelta = offMax - offMin;
expect(offsets.length === 108, "108 offsets", `got ${offsets.length}`);
expect(declaredMin === calcMin, "min matches offsets", `declared ${declaredMin}, computed ${calcMin}`);
expect(declaredMax === calcMax, "max matches offsets", `declared ${declaredMax}, computed ${calcMax}`);
expect(declaredDelta === calcDelta, "delta matches offsets", `declared ${declaredDelta}, computed ${calcDelta}`);
expect(Math.max(Math.abs(offMin), Math.abs(offMax)) <= 4, "sample within 4 mV", `spread ${offMin}..${offMax}`);

// 5. VIN mask identical everywhere it appears.
const vinMasks = new Set();
for (const f of ["src/lib/demo-data.ts", "src/lib/session-sim.ts"]) {
  for (const m of (await read(f)).matchAll(/vin:\s*"([^"]+)"/g)) vinMasks.add(m[1]);
}
expect(vinMasks.size <= 1, "VIN mask drift", [...vinMasks].join(" vs "));

// 6. Write-gating story: one mechanism (compiled out + unsafe-write feature).
const all = await Promise.all(srcFiles.map(async (f) => [f.slice(ROOT.length + 1), await readFile(f, "utf8")]));
const sessionFlag = all.filter(([, c]) => /session-scoped write flag|enable write access for the session|session write flag/.test(c)).map(([f]) => f);
expect(sessionFlag.length === 0, "old write-flag story", sessionFlag.join(" | "));
const wipish = all.filter(([, c]) => /Experimental/.test(c)).map(([f]) => f);
expect(wipish.length === 0, "phantom Experimental label", wipish.join(" | "));

// 7. Invented metric gone from README; connection guide wording fixed.
expect(!/under 5 seconds/i.test(readmes), "invented scan metric", "README still claims under 5 seconds");
expect(!/will assign your computer a link-local address/i.test(readmes), "link-local wording", "README still says gateway assigns link-local");

// 8. Node/TS floors agree.
expect(!/Node\.js 22|Node 20/i.test(readmes), "Node floor drift (README)", "README Node floor wrong");
const pkg = JSON.parse(await read("package.json"));
expect(/>=\s*24/.test(pkg.engines?.node || ""), "package engines", String(pkg.engines?.node));

// 9. Docs registry <-> content files <-> routes coherence (en map = source of
// truth; sv map must stay a subset with files on disk).
const registry = await read("src/lib/docs-registry.ts");
const docMeta = await read("src/lib/docs.ts");
const enBlock = registry.slice(registry.indexOf("en: {"), registry.indexOf("sv: {"));
const svBlock = registry.slice(registry.indexOf("sv: {"));
const regSlugs = [...enBlock.matchAll(/"([a-z][a-z-]*)":\s*\(\)\s*=>\s*import\("@\/content\/docs\/\1\.mdx"\)/g)].map((m) => m[1]);
const svSlugs = [...svBlock.matchAll(/"([a-z][a-z-]*)":\s*\(\)\s*=>\s*import\("@\/content\/docs\/sv\/\1\.mdx"\)/g)].map((m) => m[1]);
const metaSlugs = [...docMeta.matchAll(/slug:\s*"([a-z-]+)"/g)].map((m) => m[1]);
expect(JSON.stringify(regSlugs) === JSON.stringify(metaSlugs), "docs slug sets differ", `${metaSlugs} vs ${regSlugs}`);
expect(svSlugs.every((s) => metaSlugs.includes(s)), "sv doc outside registry", svSlugs.filter((s) => !metaSlugs.includes(s)).join(","));
const docsDir = await readdir(join(ROOT, "src/content/docs"));
const svDir = await readdir(join(ROOT, "src/content/docs/sv"));
for (const s of regSlugs) expect(docsDir.includes(`${s}.mdx`), `missing mdx ${s}`, "not on disk");
for (const f of docsDir.filter((x) => x.endsWith(".mdx"))) expect(regSlugs.includes(f.replace(/\.mdx$/, "")), `orphan mdx ${f}`, "not in registry");
for (const f of svDir) expect(svSlugs.includes(f.replace(/\.mdx$/, "")), `orphan sv mdx ${f}`, "not in sv registry");
for (const s of svSlugs) expect(svDir.includes(`${s}.mdx`), `missing sv mdx ${s}`, "not on disk");

// 10. No /docs/development links remain anywhere.
const devLinks = all.filter(([, c]) => /\/docs\/development/.test(c)).map(([f]) => f);
expect(devLinks.length === 0, "dead /docs/development links", devLinks.join(" | "));
expect(!docsDir.includes("development.mdx"), "development.mdx removed", "still present");

// 11. Changelog source page exists and covers both releases, minus build-from-source.
const rel = await read("src/content/docs/releases.mdx");
expect(/0\.1\.1/.test(rel) && /0\.1\.0/.test(rel), "releases page versions", "missing version headers");
expect(!/build from source|tauri build|cargo|npm run tauri|rustup/i.test(rel), "releases page build content", "contains build-from-source material");
expect(!/build from source|build from source/i.test(readmes), "README build-from-source", "still has build instructions");

// 12. Hygiene in source: dead code gone.
for (const [f, c] of all) {
  expect(!/export function InfoLabel/.test(c), "InfoLabel removed", f);
  expect(!/getRepoMeta/.test(c), "getRepoMeta removed", f);
  expect(!/docsRepoPath/.test(c), "docsRepoPath removed", f);
}
expect(!/revalidate:\s*3600/.test(await read("src/lib/github.ts")), "meaningless revalidate", "still present");

console.log(`source checks: ${checks.passed} passed, ${checks.failed} failed`);
for (const f of failures) console.log("  FAIL " + f);
if (failures.length) {
  console.log("CONSISTENCY_FAILED");
  process.exit(1);
}
console.log("CONSISTENCY_PASSED");
