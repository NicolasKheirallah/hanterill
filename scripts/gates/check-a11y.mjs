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
expect(/Tab/.test(gallery) && /trap|querySelectorAll/.test(gallery), "gallery focus trap", "no trap");
expect(/useTranslations\(/.test(gallery), "gallery localized", "hardcoded strings");

const search = await read("src/components/command/SiteCommand.tsx");
expect(/role="dialog"/.test(search) && /aria-modal/.test(search), "command palette dialog semantics", "missing");
expect(/restore|prevActive|lastFocus/.test(search), "command palette focus restore", "no restore");
expect(/e.key === "Tab"/.test(search), "command palette focus trap", "no trap");

const panel = await read("src/components/product/PanelChrome.tsx");
expect(/role="tabpanel"/.test(panel) && /aria-controls/.test(panel), "panel tabs complete", "missing tabpanel/aria-controls");
expect(/ArrowDown|ArrowUp|ArrowRight|ArrowLeft/.test(panel), "panel tab arrow keys", "no keyboard nav");

const toc = await read("src/components/docs/TableOfContents.tsx");
expect(/aria-current/.test(toc), "toc aria-current", "missing");

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
