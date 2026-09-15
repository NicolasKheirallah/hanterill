// Gate oracle: structural accessibility checks (grep-level assertions).
// Prints A11Y_PASSED when all pass. Deep a11y judgement stays a manual gate.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];
let passed = 0;
function expect(cond, name, detail) {
  if (cond) passed++;
  else failures.push(`${name}: ${detail}`);
}
const read = (p) => readFile(join(ROOT, p), "utf8");

const gallery = await read("src/components/screenshots/ScreenshotGallery.tsx");
expect(/role="dialog"/.test(gallery) && /aria-modal/.test(gallery), "gallery dialog semantics", "missing");
expect(
  /e\.key !== "Tab"|e\.key === "Tab"/.test(gallery) &&
    /querySelectorAll/.test(gallery) &&
    /tabIndex >= 0/.test(gallery),
  "gallery focus trap",
  "no trap, or not filtering to focusable nodes",
);
expect(/useTranslations\(/.test(gallery), "gallery localized", "hardcoded strings");

const search = await read("src/components/command/SiteCommand.tsx");
expect(/role="dialog"/.test(search) && /aria-modal/.test(search), "command palette dialog semantics", "missing");
expect(/restore|prevActive|lastFocus/.test(search), "command palette focus restore", "no restore");
// The trap must handle Tab in both directions AND filter to nodes that can
// actually take focus. The first version compared `document.activeElement`
// against a cmdk `[role="option"]` div with no tabindex, so forward Tab walked
// out of the dialog - the assertion passed while the trap was broken.
expect(
  /e\.key !== "Tab"|e\.key === "Tab"/.test(search) && /tabIndex >= 0/.test(search),
  "command palette focus trap",
  "no trap, or not filtering to focusable nodes",
);

const panel = await read("src/components/product/PanelChrome.tsx");
expect(/role="tabpanel"/.test(panel) && /aria-controls/.test(panel), "panel tabs complete", "missing tabpanel/aria-controls");
expect(/ArrowDown|ArrowUp|ArrowRight|ArrowLeft/.test(panel), "panel tab arrow keys", "no keyboard nav");

const toc = await read("src/components/docs/TableOfContents.tsx");
expect(/aria-current/.test(toc), "toc aria-current", "missing");

// A bezel clips its own box with `clip-path`, which also clips an outline or a
// box-shadow drawn outside the polygon. Every focusable bezel therefore needs
// the ring drawn inside the clip.
const css = await read("src/app/globals.css");
expect(
  /\.bezel:focus-visible/.test(css) && /has\(:focus-visible\)/.test(css),
  "focus ring survives a bezel's clip-path",
  "no in-clip focus ring for .bezel",
);

// WCAG 2.2.2: anything that starts moving on its own and runs past five
// seconds needs a pause control.
const scanSrc = await read("src/components/features/ScanSimulator.tsx");
const chartSrc = await read("src/components/telemetry/LiveTelemetryChart.tsx");
expect(/paused/.test(scanSrc) && /pauseScanAria/.test(scanSrc), "scan simulator is pausable", "no pause control");
expect(/paused/.test(chartSrc) && /pauseAria/.test(chartSrc), "telemetry chart is pausable", "no pause control");

// Reduced motion must be resolved after mount, or the server and the client's
// first render disagree and React throws a hydration mismatch.
const motionPrefs = await read("src/lib/use-motion-prefs.ts");
expect(
  /useSyncExternalStore/.test(motionPrefs),
  "reduced-motion hook is hydration-safe",
  "resolves during render",
);
// The bare hook is allowed in exactly one file - the wrapper that makes it
// hydration-safe. Anywhere else it resolves during render and desyncs SSR.
const rawHook = [];
for (const f of [
  "src/components/product/MiniChart.tsx",
  "src/components/features/ScanSimulator.tsx",
  "src/components/battery/BatteryMatrixSection.tsx",
  "src/components/telemetry/LiveTelemetryChart.tsx",
  "src/components/screenshots/ScreenshotGallery.tsx",
]) {
  const src = await read(f);
  if (/import\s*\{[^}]*\buseReducedMotion\b[^}]*\}\s*from\s*"motion\/react"/.test(src)) {
    rawHook.push(f);
  }
}
expect(rawHook.length === 0, "no component uses the raw reduced-motion hook", rawHook.join(", "));

// The docs sidebar must mark the current page with trailing slashes in play.
const sidebar = await read("src/components/docs/DocsSidebar.tsx");
expect(/aria-current/.test(sidebar), "docs sidebar aria-current", "missing");
expect(/endsWith\("\/"\)/.test(sidebar), "docs sidebar normalises the trailing slash", "raw comparison");

const packView = await read("src/components/battery/BatteryPackView.tsx");
expect(/role="status"/.test(packView), "3d loading placeholder announced", "missing role=status");

const header = await read("src/components/layout/Header.tsx");
expect(/aria-controls/.test(header) && /Escape/.test(header), "header menu wiring", "missing aria-controls/escape");

const copy = await read("src/components/ui/CopyButton.tsx");
expect(/useTranslations|useSyncExternalStore/.test(copy) || !/aria-label="Cop/.test(copy), "copy button localized", "hardcoded aria");
expect(/clearTimeout/.test(copy), "copy timer cleanup", "missing");

const scan = await read("src/components/features/ScanSimulator.tsx");
expect(/aria-live/.test(scan), "scan status announced", "missing live region");

const ecuTopo = await read("src/components/architecture/EcuTopology.tsx");
expect(/aria-live/.test(ecuTopo) || /role="status"/.test(ecuTopo), "ecu detail announced", "missing live region");

const matrix = await read("src/components/battery/BatteryMatrixSection.tsx");
expect(/role="row"|role="gridcell"|role="rowheader"|role="columnheader"/.test(matrix), "matrix grid roles", "incomplete grid pattern");

const chart = await read("src/components/telemetry/LiveTelemetryChart.tsx");
expect(!/getComputedStyle[^]*getComputedStyle/.test(chart) || /themeVars|cachedVars|varsRef/.test(chart), "chart per-frame getComputedStyle", "still computed every frame");

console.log(`a11y checks: ${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log("  FAIL " + f);
if (failures.length) {
  console.log("A11Y_FAILED");
  process.exit(1);
}
console.log("A11Y_PASSED");
