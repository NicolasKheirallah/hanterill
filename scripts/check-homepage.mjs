import { join } from "node:path";
import { existsSync } from "node:fs";
import { read, fail, pass, walk } from "./lib-scan.mjs";

const root = process.cwd();
const page = join(root, "src/app/[locale]/page.tsx");
if (!existsSync(page)) fail("src/app/[locale]/page.tsx does not exist");
const src = read(page);

// Each required homepage section must be referenced (rendered) by name in page.tsx.
const requiredSections = [
  "Hero",
  "ConnectionDiagram",
  "FeatureBlocks",
  "BatteryMatrixSection",
  "ProtocolStack",
  "EcuTopology",
  "SessionSimulator",
  "PrivacySection",
  "OpenSourceSection",
  "VehicleCompatibility",
  "HardwareChain",
  "DownloadSection",
  "SafetySection",
];

const missing = requiredSections.filter((s) => !new RegExp(`<${s}[\\s/>]`).test(src));
if (missing.length) fail(`homepage does not render sections: ${missing.join(", ")}`);

// Each referenced section must resolve to a real component file.
const files = walk(join(root, "src/components"), [".tsx"]);
const defined = new Set();
for (const f of files) {
  const c = read(f);
  for (const m of c.matchAll(/export\s+(?:default\s+)?function\s+([A-Za-z0-9_]+)/g)) defined.add(m[1]);
  for (const m of c.matchAll(/export\s+(?:const|let)\s+([A-Za-z0-9_]+)/g)) defined.add(m[1]);
  for (const m of c.matchAll(/export\s*\{([^}]+)\}/g))
    m[1].split(",").forEach((n) => defined.add(n.trim().split(/\s+as\s+/).pop().trim()));
}
const undefinedSections = requiredSections.filter((s) => !defined.has(s));
if (undefinedSections.length)
  fail(`section components have no implementation: ${undefinedSections.join(", ")}`);

pass(`homepage composition verification passed (${requiredSections.length} sections)`);
