# Delivery Gate: openCMA website (brief section 113 validation matrix)

Authoritative validation record, written by the reviewer session (`opencma-website-5d`). It maps
the brief's section-113 test matrix and verify list, and the section-114 definition of done, onto
concrete evidence. The implementer's antislop-rules Delivery Gate is in git history at `96868bf`.

Evidence sources:
- **reviewer static** - a `scripts/check-*.mjs` run re-executed by the reviewer, 2026-09-06.
- **reviewer source** - the reviewer read the component and confirmed the behaviour in code.
- **implementer QA** - the implementer's agent-browser pass on the production build at `96868bf`,
  with an evidence paragraph in `GATES.md` history.

Status: **verified against head `16d539e`**. AUDIT F1/F2/F3 (Swedish scan, telemetry, connection
popover) closed at `5ad9178`; F9 (hero caption, product-frame tabs) closed at `16d539e`. All 17
runnable checks re-run to exit 0, `next build` clean, and a live browser pass drove the
interactions. The one item still source-only is reduced-motion behaviour (G26) - the browser tool
could not apply the emulation this session.

---

## 1. Viewport x theme x locale grid

Six viewports (375x812, 430x932, 768x1024, 1024x768, 1440x900, 1920x1080), light + dark, `/en` +
`/sv`.

| Check | en / light | en / dark | sv / light | sv / dark | Evidence |
|---|---|---|---|---|---|
| No horizontal overflow at any of the six widths | PASS | PASS | PASS | PASS | reviewer source (`min-w-0` on every grid/flex child, `overflow-x-auto` wrappers on the matrix, ECU tables, code blocks, session timeline) + implementer QA |
| Navigation usable, no clipped items | PASS | PASS | PASS | PASS | implementer QA; Header switches to the mobile menu at `lg` after a `/sv` overflow fix in `96868bf` |
| Text not clipped or truncated unexpectedly | PASS | PASS | PASS | PASS | implementer QA |
| Contrast: body >= 4.5:1, large text >= 3:1 | PASS | PASS | PASS | PASS | implementer QA against the token set in `globals.css` |
| Interactive controls reachable and sized for touch at 375/430 | PASS | PASS | PASS | PASS | reviewer source (mobile module list, compact scan list, full-width canvas, wrapped toggles) |
| Homepage journey coherent | PASS | PASS | PASS | PASS | reviewer live at 16d539e: `/sv` renders "Skannar styrenheter", "Packspänning", "Diagnostikgateway", "Representativt gränssnitt med exempelvärden...", tabs "Översikt / Batteri / DTC / Styrenheter / Realtid / Loggar". Identifiers stay verbatim. |

## 2. Input-mode matrix

| Mode | Result | Evidence |
|---|---|---|
| Mouse | PASS | reviewer source + implementer QA across every interactive section |
| Trackpad | PASS | implementer QA |
| Keyboard only | PASS with one gap | reviewer source: 108-grid arrow/Enter/Escape + roving tabindex; scan rows are buttons; session panel arrow keys on a focused `role="group"`; platform toggles; connection Popover on focus. GAP: telemetry crosshair point-inspection is pointer-only (AUDIT F6, gate G27). |
| Touch | PASS | reviewer source: every hover has a tap equivalent (module lists, tap-to-inspect, Popover on tap) |
| Reduced motion | PASS | reviewer source: scan seeds end state; telemetry = static window + 2000ms tick; 3D `frameloop="demand"`; nav underline `layoutId` skipped; `globals.css` `@media (prefers-reduced-motion: reduce)` clamps all animation/transition. Full per-page browser emulation is gate G26 (PARTIAL). |
| Dark mode | PASS | reviewer static (`check-theme.mjs`) + implementer QA |
| Light mode | PASS | reviewer static + implementer QA |
| English | PASS | reviewer static (`check-i18n.mjs`) + `check-render.mjs` 17 routes 200 |
| Swedish | PASS | reviewer live at 16d539e + `check-i18n-consume.mjs` 24/24 namespaces consumed. Scan, telemetry, connection popover, hero caption, product-frame tabs all confirmed Swedish in a browser. Deferred by design (namespace consumed, some values English): doc bodies (P1-6), per-vehicle notes (P1-5), interior prose (P1-8), representative DTC text (P1-7). |
| Slow device | PASS (by design) | 3D is lazy + `low-power` + `demand`; telemetry loop is canvas-only; no blocking main-thread work. Not profiled on real low-end hardware. |
| WebGL unavailable | PASS | reviewer source: `hasWebGL()` gate -> "3D unavailable / the 2D matrix has the same data" note, no console error |
| JS hydration delay | PASS | Server Components render the content; interactive islands hydrate progressively; no layout shift on hydrate (reviewer source, `next build` shows the pages as static/SSG) |

## 3. Section-113 verify list

| Item | Verdict | Evidence |
|---|---|---|
| No dead controls | PASS | reviewer static (`check-interactions.mjs`, `check-routes.mjs`) + reviewer source: no `href="#"`; every button has a handler; chart legend selects series; download is a real menu |
| No inaccessible hover-only data | PARTIAL | 108-grid, scan, platform, connection all expose their data on focus / tap too. Exception: telemetry crosshair values are pointer-only (F6 / G27). |
| No animation-induced layout shift | PASS | reviewer source: scan totals row is a fixed 3-col grid with an `AnimatedNumber`; "Scanning..." -> count does not reflow; `AnimatePresence` swaps use `mode="wait"` with reserved min-heights |
| No severe CPU use while idle | PASS | reviewer source: scan rAF stops at `complete`, when off screen, paused, or tab-hidden; telemetry loop stops off screen / paused / tab-hidden; 3D `frameloop="demand"` when not visible |
| No continuous offscreen WebGL rendering | PASS | reviewer source: `BatteryPackView` mounts the canvas only after it scrolls in (`useInView once`) and passes a live `useInView` as `active` -> `frameloop="demand"` when scrolled away |
| No chart memory leak | PASS | reviewer source: `LiveTelemetryChart` cancels its rAF and clears its interval on cleanup; no accumulating arrays (the signal is a pure function of `t`, not a growing buffer) |
| No localization overflow | PASS | implementer QA; the `/sv` Header overflow at 768px was fixed in `96868bf` by moving to the mobile menu earlier |
| No contradictory licensing language | PARTIAL | on-site: PASS after the `license.mdx` rewrite (gate G25). Upstream repo still says MIT (gate G24) - a visitor who opens GitHub sees the contradiction. Owner: user, outside this repo. |
| No WIP vehicle represented as supported | PASS | reviewer source: `PlatformExplorer` + `vehicles.ts` - status is a word plus a tone; `statusMeta` maps `wip`/`research` to "info", never "ok"; `check-interactions.mjs` fails on `0/n` or `% complete` |
| No fake diagnostic data presented as real | PASS | reviewer source: "Simulated session" / "Representative session, simulated vehicle" / "Example report" labels; DTC records are synthetic fixtures authored for the site (AUDIT F7), never claimed as verified codes; VIN redacted in the session Identify stage (implementer QA, reviewer RE-CONFIRM) |

## 4. Section-114 definition of done (user journey)

| The visitor can... | Verdict | Evidence |
|---|---|---|
| Hover the battery -> get data | PASS | `BatteryMatrixSection` hover/focus -> instrument panel |
| Select a module -> inspect it | PASS | persistent selection, animated summary->detail, Clear button |
| Start the scan -> watch ECUs respond | PASS | `ScanSimulator` staged discovery with timing variation |
| Select a fault -> understand it | PASS | ECU row expands to code, status class, last-observed, snapshot flag |
| Open live data -> see the signal moving | PASS | `LiveTelemetryChart` canvas loop, deterministic drive cycle |
| Select a potential -> compare it with the pack | PASS | detail panel shows value, pack mean, deviation, module delta; pack-scale marker moves |
| Step through the session | PASS | `SessionSimulator` 7 stages, button / click / arrow-key navigation |
| Select SPA or SEA -> see development is in progress | PASS | `PlatformExplorer` WIP / Research status, "current research" list, no percentages |
| Open Docs -> a searchable engineering knowledge base | PASS | 3-pane layout, Cmd/Ctrl+K palette over a heading+body index, on-this-page rail, MDX data components |
| Switch to Svenska -> the product stays coherent | PASS | reviewer live at 16d539e: homepage spine, chrome, platform explorer, session walkthrough (01 Anslut ... 06 Realtidsdata), scan simulator, telemetry chart, connection popover, hero product frame + tabs, docs chrome all Swedish. Long-form doc bodies and interior-page prose deferred by design (P1-6 / P1-8). |

---

## 4b. Premium and motion pass (G28-G32)

| Check | Verdict | Evidence |
|---|---|---|
| No rejected library present (postprocessing / lenis / gsap / chart.js / echarts) | PASS | `scripts/check-premium.mjs` scans `package.json`; the pass added zero runtime dependencies |
| 3D battery reads as a product render | PASS (dark) | reviewer live screenshot at 16d539e: 1134x320 canvas, grounded 27-module pack, warm PBR deviation gradient, module 14 isolated and lifted with the accent emissive, soft contact shadow, no glow / post-processing. Reads as a product render. Light theme peer-attested. Nitpick: blank box with no skeleton before `useInView` mounts it (G30, section-98). |
| Scroll reveal runs on the compositor, double-guarded | PASS | `check-motion.mjs`: `.reveal` under `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`, base `opacity: 1`. `Reveal.tsx` no longer imports `motion/react`. |
| One orchestrated load moment, calm elsewhere | PASS | reviewer live at 16d539e: one `.hero-seq` container; `.reveal` x7 compute `animation-timeline: view()` + `animation-name: reveal-rise` + `opacity: 1` base (compositor-driven, readable fallback). No other scroll animation observed. The sub-900ms hero stagger itself was source-verified only (finished before query time). |
| View transitions scoped to locale + docs prev/next, off under reduced motion | PASS (wiring) | reviewer live at 16d539e: `typeof document.startViewTransition === "function"`, `<main>` computes `view-transition-name: page-main`, `<html>` computes `root` - scoping exactly as designed. `LocaleSwitcher` + `DocNavLink` use `addTransitionType` in `startTransition`; `globals.css` kills `::view-transition-*` under reduced motion. The crossfade / slide itself is not captured in a static screenshot. Next 16.3.4 has no framework flag; progressive enhancement. |
| Press feedback pointer-only and motion-gated | PASS | `check-premium.mjs`: `.press` is inside `@media (hover: hover) and (prefers-reduced-motion: no-preference)`. |
| Heading weight settle is gated and degradable | PASS (source) | `.heading-settle` interpolates `font-variation-settings` 440 -> 500 via `@starting-style`, inside `prefers-reduced-motion: no-preference`; a no-op without `@starting-style` or a variable font. |
| Chart library decision recorded | PASS | hand-rolled canvas kept; `check-premium.mjs` fails on `chart.js` / `echarts`. `uPlot` is the only revisit candidate, and only if the chart's scope grows. See `PREMIUM-PASS.md` section 4.3. |

## 5. Result

The site meets the brief. Verified against head `16d539e` (17 runnable checks exit 0, `next build`
clean, live browser pass). Outstanding, none blocking ship:

1. **G24 (upstream, user)** - the openCMA repo's `LICENSE` / `Cargo.toml` / README badge /
   `DISCLAIMER.md` still say MIT while the site says private-use. The site side is consistent.
2. **G26 (reduced-motion)** - source-confirmed only; the browser tool could not apply the
   reduced-motion emulation this session, so a per-page behavioural pass is still owed.
3. **G27 (minor)** - the telemetry crosshair has no keyboard point-inspection path.
4. **G30 polish** - the 3D pack shows a blank box (no skeleton or label) in the brief window
   before `useInView` mounts it (section-98 loading state).
5. **RE-CONFIRM** - VIN redaction in the session Identify stage (reviewer did not open that source);
   the <=1-2deg hero perspective cap; a real Lighthouse run for the section-88 >95 targets;
   the 3D pack and view transitions in light theme.

The premium pass added zero dependencies and every path keeps its reduced-motion and no-support
fallback.
