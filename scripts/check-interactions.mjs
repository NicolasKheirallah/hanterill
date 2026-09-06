import { join } from "node:path";
import { existsSync } from "node:fs";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const problems = [];

function need(rel, ...must) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    problems.push(`missing ${rel}`);
    return;
  }
  const src = read(p);
  for (const m of must) {
    if (!(m instanceof RegExp ? m.test(src) : src.includes(m)))
      problems.push(`${rel}: expected ${m}`);
  }
}

// 108-potential explorer: view modes, keyboard grid nav, synchronized detail.
need(
  "src/components/battery/BatteryMatrixSection.tsx",
  "ToggleGroup",
  'role="grid"',
  'role="gridcell"',
  "ArrowRight",
  "ArrowDown",
  "Escape",
  "aria-label={srText",
);

// Battery Health: no hex identifier anywhere in the panel (moved to the docs);
// the Engineering level shows a provenance chain and links to the reference.
need(
  "src/components/battery/BatteryHealthPanel.tsx",
  "vehicleBms",
  /engineering/i,
  "ProvenanceStep",
  "/docs/battery-diagnostics",
);
const bh = read(join(root, "src/components/battery/BatteryHealthPanel.tsx"));
if (/0x[0-9A-Fa-f]{2,}/.test(bh))
  problems.push("BatteryHealthPanel: still contains a hex identifier in the primary view");

// Scan simulator: deterministic clock, controls, faults, simulated label,
// and translated chrome (no hardcoded English).
need(
  "src/components/features/ScanSimulator.tsx",
  "requestAnimationFrame",
  'useTranslations("scan")',
  "replayScanAria",
  /pause/i,
  "footerNote",
  "useInView",
);
need("src/lib/scan-sim.ts", "SCAN_END", "stageAt", "SimFault", "stageKey");
// The panel renders t("footerNote"); its value in every catalog must carry a
// "simulated" / "representative" label (brief section 40: never present the
// scan as a live vehicle). Also require the session-shell label to survive.
for (const loc of ["en", "sv"]) {
  const cat = JSON.parse(read(join(root, `src/messages/${loc}.json`)));
  const foot = cat.scan?.footerNote;
  if (!foot) {
    problems.push(`${loc}.json: scan.footerNote missing`);
  } else if (!/simulated|simulerad|representative|representativ/i.test(foot)) {
    problems.push(`${loc}.json: scan.footerNote does not label the session as simulated: "${foot}"`);
  }
  const sessLabel = cat.session?.label;
  if (sessLabel && !/simulated|simulerad|representative|representativ/i.test(sessLabel))
    problems.push(`${loc}.json: session.label no longer says simulated/representative: "${sessLabel}"`);
}

// Live telemetry: real moving canvas, decoupled loop, controls, reduced motion,
// and keyboard point-inspection (brief sections 92-93 / gate G27).
need(
  "src/components/telemetry/LiveTelemetryChart.tsx",
  "<canvas",
  "requestAnimationFrame",
  "useReducedMotion",
  "visibilitychange",
  "useInView",
  "tabIndex={0}",
  "onKeyDown",
  'aria-live="polite"',
  /ArrowRight/,
  /ArrowLeft/,
);
need("src/lib/telemetry-sim.ts", "drivePhase", "sample");

// Connection diagram: clickable nodes + packet + protocol disclosure.
need("src/components/architecture/ConnectionDiagram.tsx", "Popover", "protocolDetails", /request/i, /response/i);

// Platform explorer: platforms, status hierarchy, no invented percentages.
need(
  "src/components/vehicles/PlatformExplorer.tsx",
  "ToggleGroup",
  "platformsInOrder",
  "verifiedFunctions",
);
need("src/lib/vehicles.ts", "SupportStatus", '"wip"', '"research"', "platformMeta");
const veh = read(join(root, "src/lib/vehicles.ts"));
if (/\b0 ?\/ ?n\b|\d+% (complete|done)/i.test(veh))
  problems.push("vehicles.ts: looks like an invented completion figure");

// Hero product demo is interactive (tabs switch the view).
need("src/components/hero/HeroInterface.tsx", "onSelect", "AnimatePresence", "useMotionValue");

// Motion tokens are shared, not per-component.
need("src/lib/motion.ts", "DUR", "EASE");
const cssTokens = read(join(root, "src/app/globals.css"));
if (!/--motion-base/.test(cssTokens) || !/--ease-standard/.test(cssTokens))
  problems.push("globals.css: motion timing tokens missing");

// No dead MiniChart left as the telemetry feature (it's fine for panel sparklines only).
const featureBlocks = read(join(root, "src/components/features/FeatureBlocks.tsx"));
if (/MiniChart/.test(featureBlocks))
  problems.push("FeatureBlocks: still uses MiniChart for a feature visual (should be LiveTelemetryChart / ScanSimulator)");

// Radix primitives are used for interaction semantics.
const anyRadix = walk(join(root, "src/components"), [".tsx"])
  .map(read)
  .join("\n");
if (!/@radix-ui\/react-(popover|toggle-group|tooltip)/.test(anyRadix))
  problems.push("no Radix primitives used for interaction semantics");

if (problems.length) fail(`interaction upgrade issues:\n  ${problems.join("\n  ")}`);
pass("interaction upgrade verification passed");
