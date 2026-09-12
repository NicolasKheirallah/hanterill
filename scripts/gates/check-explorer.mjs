// Gate oracle: CMA Network Explorer port.
// Modes: --data | --out | --css | --keys. Each prints its own success-only
// marker after every assertion passes; any failure exits 1.
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const mode = process.argv[2];
const NET = join(ROOT, "src", "components", "network");
const failures = [];
let passed = 0;
function expect(cond, name, detail = "") {
  if (cond) passed++;
  else failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
async function json(p) {
  return JSON.parse(await readFile(p, "utf8"));
}
async function text(p) {
  return readFile(p, "utf8");
}

if (mode === "--data") {
  const units = await json(join(NET, "data", "units.json"));
  const edges = await json(join(NET, "data", "edges.json"));
  const segments = await json(join(NET, "data", "segments.json"));
  const modules = await json(join(NET, "data", "modules.json"));
  const meta = await json(join(NET, "data", "meta.json"));

  const core = units.filter((u) => !u.peripheral);
  const periph = units.filter((u) => u.peripheral);
  expect(units.length === 170, "unit total", String(units.length));
  expect(core.length === 76, "core units", String(core.length));
  expect(periph.length === 94, "peripheral units", String(periph.length));
  expect(edges.length === 295, "raw edges", String(edges.length));
  expect(Object.keys(modules).length === 24, "documented modules", String(Object.keys(modules).length));

  const pinRows = Object.values(modules)
    .flatMap((m) => m.pins)
    .filter((p) => !p.sep && !p.section).length;
  expect(pinRows === 622, "pin rows", String(pinRows));
  expect(meta.pins === 622, "meta.json pin count agrees", String(meta.pins));

  const ids = new Set(units.map((u) => u.id));
  expect(edges.every((e) => ids.has(e.source) && ids.has(e.target)), "edge endpoints resolve");
  const segIds = new Set(segments.map((s) => s.id));
  expect(edges.every((e) => !e.segment || segIds.has(e.segment)), "edge segments resolve");
  const connected = new Set();
  for (const e of edges) { connected.add(e.source); connected.add(e.target); }
  const orphans = units.filter((u) => !connected.has(u.id)).map((u) => u.id);
  expect(orphans.length === 0, "zero orphan units", orphans.join(","));

  const detail = units.filter((u) => u.hasDetail).map((u) => u.id).sort();
  const modKeys = Object.keys(modules).sort();
  expect(detail.length === modKeys.length && detail.every((id, i) => id === modKeys[i]),
    "hasDetail set equals module key set", `${detail.length} vs ${modKeys.length}`);
  const rails = segments.filter((s) => s.members.length >= 3);
  expect(rails.length === 12, "rail-eligible segments", String(rails.length));
  expect(rails.every((s) => s.members.every((m) => ids.has(m))), "segment members resolve to units");
} else if (mode === "--out") {
  for (const loc of ["en", "sv"]) {
    const f = join(ROOT, "out", loc, "network", "index.html");
    expect(existsSync(f), `${loc}/network page built`);
    if (!existsSync(f)) continue;
    const html = await text(f);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    expect(loc === "en" ? /CMA Network Explorer/i.test(title) : /n[aä]tverk/i.test(title),
      `${loc} localized network title`, title);
    expect(html.includes(`/${loc}/network/`), `${loc} canonical path present`);
    expect(/rel="canonical"[^>]*href="[^"]*\/network\/"/.test(html) || /href="[^"]*\/network\/"[^>]*rel="canonical"/.test(html),
      `${loc} canonical targets /network/`);
    // Next emits the React prop casing (hrefLang); HTML attribute names are case-insensitive.
    expect(/hreflang="en"/i.test(html) && /hreflang="sv"/i.test(html) && /hreflang="x-default"/i.test(html),
      `${loc} hreflang trio`);
    expect(/aria-current="page"[^>]*href="[^"]*\/network\/"|href="[^"]*\/network\/"[^>]*aria-current="page"/.test(html),
      `${loc} nav marks Network active`);
  }
  const home = await text(join(ROOT, "out", "en", "index.html"));
  expect(home.includes("/network/"), "home nav links to /network/");
  const sitemap = await text(join(ROOT, "out", "sitemap.xml"));
  expect(sitemap.includes("/en/network/") && sitemap.includes("/sv/network/"), "sitemap lists route");
} else if (mode === "--css") {
  const css = await text(join(NET, "network.css"));
  const files = ["NetworkExplorer.tsx", "graph.ts", "components/CommandK.tsx", "components/DetailDrawer.tsx",
    "components/edges.tsx", "components/nodes.tsx"].map((f) => join(NET, f));
  const srcs = [];
  for (const f of files) srcs.push(await text(f));
  const all = srcs.join("\n");

  expect(!/^\s*(html|body)\s*[,{]/m.test(css) || /#cma-explorer/.test(css), "no bare html/body global rules");
  expect(!/#root\s*{/.test(css), "no #root sizing rules");
  expect(!/:\root\s*{[^}]*--bg:\s*#/.test(css), "no literal --bg hex palette");
  expect(!/data-theme\s*=/.test(css), "css does not key off its own data-theme stamp");
  expect(!/@import\s+["']tailwindcss["']/.test(css), "no duplicate tailwind import");
  expect(/--bg:\s*var\(--bg-primary\)/.test(css), "token alias block present (--bg)");
  expect(/--ink:\s*var\(--text-primary\)/.test(css), "token alias block present (--ink)");

  const cmdkLines = css.split(/\r?\n/).filter((l) => /\[cmdk-/.test(l) && !l.includes("cma-palette"));
  expect(cmdkLines.length === 0, "every cmdk selector scoped to .cma-palette", cmdkLines.join(" | "));

  expect(!/dataset\.theme/.test(all), "no vendored file stamps data-theme");
  expect(!/ps2-theme/.test(all), "no vendored file uses the ps2-theme storage key");

  // positive controls: the absence scanners must actually fire on the old code
  const fixtureCss = ":root {\n  --bg: #f4f4f2;\n}\nhtml,\nbody {\n  height: 100%;\n}\n[cmdk-root] {\n  background: var(--surface);\n}";
  expect(/^\s*(html|body)\s*[,{]/m.test(fixtureCss), "control: bare html/body rule is detected");
  expect(/:\s*\[?r?o?o?t?\]?\s*{[^}]*--bg:\s*#/.test(fixtureCss) || /--bg:\s*#/.test(fixtureCss), "control: literal palette is detected");
  expect(fixtureCss.split(/\r?\n/).some((l) => /\[cmdk-/.test(l) && !l.includes("cma-palette")), "control: unscoped cmdk selector is detected");
  expect(/document\.documentElement\.dataset\.theme\s*=/.test("document.documentElement.dataset.theme = t"), "control: theme stamp is detected");
} else if (mode === "--keys") {
  const site = await text(join(ROOT, "src", "components", "command", "SiteCommand.tsx"));
  const exp = await text(join(NET, "NetworkExplorer.tsx"));
  const page = await text(join(ROOT, "src", "app", "[locale]", "network", "page.tsx"));
  expect(/if\s*\(e\.defaultPrevented\)\s*return/.test(site), "site palette defers to prevented events");
  expect(/\(e\.metaKey\s*\|\|\s*e\.ctrlKey\)/.test(site), "site still binds its own shortcut");
  expect(/\(e\.metaKey\s*\|\|\s*e\.ctrlKey\)/.test(exp) && /['"]k['"]/.test(exp), "explorer binds a search shortcut");
  expect(/e\.preventDefault\(\)/.test(exp), "explorer prevents default on its shortcut");
  const palette = await text(join(NET, "components", "CommandK.tsx"));
  expect(palette.includes("cma-palette"), "explorer palette wrapper class present");
  expect(page.includes('/"network/"') || page.includes('"network"') || existsSync(join(ROOT, "src", "app", "[locale]", "network", "page.tsx")), "network route file exists");
  const entries = await text(join(ROOT, "src", "components", "command", "SiteCommand.tsx"));
  expect(entries.includes('"/network"'), "site palette routes to /network");
} else if (mode === "--improve") {
  const exp = await text(join(NET, "NetworkExplorer.tsx"));
  const drawer = await text(join(NET, "components", "DetailDrawer.tsx"));

  // keyboard: single-key commands gated behind a no-modifier early return
  expect(/if \(e\.metaKey \|\| e\.ctrlKey \|\| e\.altKey\) return/.test(exp), "modifier guard present");
  const guardIdx = exp.search(/if \(e\.metaKey \|\| e\.ctrlKey \|\| e\.altKey\) return/);
  const fIdx = exp.search(/e\.key === 'f'/);
  const arrowIdx = exp.search(/e\.key\.startsWith\('Arrow'\)/);
  expect(guardIdx > 0 && guardIdx < fIdx && guardIdx < arrowIdx, "guard precedes f/arrow commands");
  // positive control: the same scanner must reject an ungated handler
  const ungated = "if (e.target instanceof HTMLInputElement) return\nif (e.key === 'f') fit()";
  expect(!(ungated.includes("e.metaKey || e.ctrlKey || e.altKey") && ungated.indexOf("e.metaKey") < ungated.indexOf("e.key === 'f'")),
    "control: ungated handler is rejected");

  // URL sync: first run skipped so deep-link params survive
  expect(/urlSynced\.current = true; return/.test(exp), "url sync skips first run");
  expect(/const urlSynced = useRef\(false\)/.test(exp), "urlSynced ref declared");

  // StrictMode safety: no setHistory/setState side effects inside updaters
  expect(!/setSelectedId\(\(prevSel\)/.test(exp), "select() does not push history inside updater");
  expect(!/setHistory\(\(h\) => \{[\s\S]{0,120}select\(/.test(exp), "back() does not call select inside updater");
  // control: the old shape must be detected
  const oldShape = "setSelectedId((prevSel) => { setHistory((h) => [...h, prevSel]); return id })";
  expect(/setSelectedId\(\(prevSel\)/.test(oldShape), "control: updater-nested history is detected");

  // hover timer cleared on unmount
  expect(/useEffect\(\(\) => \(\) => \{[\s\S]{0,80}clearTimeout\(hoverTimer\.current\)/.test(exp), "hover timer cleanup effect");

  // a11y wiring
  expect(/aria-pressed=\{on\}/.test(exp), "bus chips expose aria-pressed");
  expect(/aria-pressed=\{showPeripherals\}/.test(exp), "peripherals chip exposes aria-pressed");
  expect(/aria-expanded=\{filtersOpen\}/.test(exp) && /aria-controls="cma-filters"/.test(exp), "filter toggle wired");
  expect(/role="img" aria-label=\{BUSES\[b\]\.label\}/.test(exp), "trace bus dots carry labels");
  expect(/helpCloseRef\.current\?\.focus\(\)/.test(exp), "help overlay focuses close button");
  expect(/aria-label=\{`\$\{eyebrow\}: \$\{title\}`\}/.test(drawer), "drawer region is named");
  expect(!/Columns2|pinned/.test(drawer), "dead compare/pinned branch removed");
  // control: the dead-branch scanner fires on the old drawer
  expect(/Columns2/.test("import { Columns2 } from 'lucide-react'"), "control: compare import is detected");
} else if (mode === "--improve2") {
  const exp = await text(join(NET, "NetworkExplorer.tsx"));
  const graph = await text(join(NET, "graph.ts"));
  const drawer = await text(join(NET, "components", "DetailDrawer.tsx"));
  const palette = await text(join(NET, "components", "CommandK.tsx"));

  // edges must leave the tab order (v12 defaults them focusable)
  expect(/edgesFocusable=\{false\}/.test(exp), "edges not focusable");
  // control: the scanner fires on the unfixed shape
  expect(!/edgesFocusable/.test("<ReactFlow nodesDraggable={false} />"), "control: missing prop is detected");

  // meaningful aria-labels for all three node kinds in buildGraph
  expect((graph.match(/ariaLabel:/g) || []).length >= 3, "module, rail and zone nodes carry ariaLabel", String((graph.match(/ariaLabel:/g) || []).length));
  expect(/Press Enter to open details/.test(graph) && /drops\. Press Enter/.test(graph) && /Press Enter to collapse or expand/.test(graph), "labels describe the action");

  // reduced motion gates the JS-driven camera moves
  expect(/const reduce = useReducedMotion\(\)/.test(exp), "explorer reads reduced motion");
  expect(/duration: 600 \* motion/.test(exp) && /duration: 500 \* motion/.test(exp), "fitView durations scale with reduced motion");
  expect(/behavior: reduce \? 'auto' : 'smooth'/.test(drawer), "drawer scroll respects reduced motion");

  // trace result is announced
  expect(/<Panel position="top-center" role="status">/.test(exp), "trace banner is a live status");

  // palette focus discipline
  expect(/prevActiveRef\.current\?\.focus\(\)/.test(palette), "palette restores focus on close");
  expect(!/const prev = document\.activeElement/.test(palette), "opener captured at render, not at effect (autoFocus guard)");
  expect(/window\.addEventListener\('keydown', onKey\)[\s\S]{0,120}removeEventListener/.test(palette), "palette tab trap registered and removed");
  expect(/'input, button, a\[href\], \[tabindex\]:not\(\[tabindex="-1"\]\)'/.test(palette), "trap enumerates focusable elements");

  // dead class gone
  expect(!/className=.b-[" ]/.test(drawer) && !/`b- \$\{/.test(drawer), "no vestigial b- class in drawer");
  // control: scanner fires on the old shape
  expect(/`b- \$\{/.test("className={`b- ${x}`}"), "control: vestigial class is detected");
} else {
  console.log("usage: node scripts/gates/check-explorer.mjs --data|--out|--css|--keys|--improve|--improve2");
  process.exit(2);
}

console.log(`explorer checks (${mode}): ${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log("  FAIL " + f);
if (failures.length) {
  console.log("EXPLORER_FAILED");
  process.exit(1);
}
console.log({ "--data": "EXPLORER_DATA_PASSED", "--out": "EXPLORER_OUT_PASSED", "--css": "EXPLORER_CSS_PASSED", "--keys": "EXPLORER_KEYS_PASSED", "--improve": "EXPLORER_IMPROVE_PASSED", "--improve2": "EXPLORER_IMPROVE2_PASSED" }[mode]);
