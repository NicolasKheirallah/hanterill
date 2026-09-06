# openCMA Website: Independent Implementation Audit

Reviewer: session `opencma-website-5d` (QA / gap-audit role).
Implementer: session `opencma-website-5b`.
Scope: the "Interaction, Motion, 3D, Documentation & Platform Expansion Pass" brief (114 sections),
audited against the working tree at commit `96868bf` plus the reviewer's own docs changes.
Source-of-truth repo consulted: `C:\Users\NicolasKheirallah\Documents\GitHub\openCMA` (the Rust app).

Verdict legend: `PASS` meets the brief · `PARTIAL` meets it with a named shortfall · `DIVERGENCE`
deliberate departure from a brief preference, judged acceptable · `GAP` not met · `DEFERRED`
consciously postponed with rationale · `N/A` optional and not taken.

---

## 1. Executive summary

The implementation is substantially complete and high quality. Phase 1 (full marketing + docs
site), phase 2 (interactive engineering visualisations, scan simulator, live telemetry, platform
explorer, licensing, micro-interactions) and most of phase 3 (en/sv i18n, modern docs, 7-stage
session simulator, restrained 3D battery) are in the tree, type-checked, linted and building. The
reviewer independently re-ran all 16 runnable static checks plus `next build` and the 17-route
render check (all green), and read the ten load-bearing interactive components in full.

Findings that matter, most significant first:

1. **F1 / F2 - two homepage sections render English under `/sv`.** `ScanSimulator` and
   `LiveTelemetryChart` call no translation API; their Swedish catalogs (`scan.*`, `telemetry.*`)
   exist but are unused. This contradicts the plan's claim that the homepage journey is fully
   Swedish. Small fix (catalogs are done). *Being addressed by the implementer as of this writing.*
2. **F3 - `ConnectionDiagram` partial i18n.** Node popover facts, link labels and the
   protocol-details list are hardcoded English; only the trigger labels are translated.
3. **Licensing (P0, resolved).** The upstream repo is still MIT (`LICENSE`, `Cargo.toml`, README
   badge, `DISCLAIMER.md`). The website says "source-available, private use". Per the user's
   decision the website deliberately leads a planned relicense. The website is now internally
   consistent (the reviewer rewrote `license.mdx`). Upstream metadata is the user's follow-up.
4. **F5 / F6 / F7 - minor.** 2D matrix and 3D pack selections are not cross-synchronised (F5);
   the telemetry crosshair is pointer-only, no keyboard path (F6); the simulated DTC codes are
   realistic-looking and should be confirmed against project data or made obviously synthetic (F7).
5. **DEFERRED - Swedish doc bodies (P1-6) and Swedish interior-page prose (P1-8),** both with
   written rationale; `/sv` shows coherent pages with an "available in English" notice, not 404s.
6. **Library divergences (accepted): `<canvas>` not ECharts (§18); `@next/mdx` + `cmdk` + Shiki
   not Fumadocs (§53); custom grid state not TanStack Table (§25); no GSAP (§4).**

No blocking correctness defect was found. Nothing here should hold ship; the failing gates are the
two `/sv` sections, an upstream metadata mismatch the user owns, and a minor chart-a11y affordance.

---

## 2. Inputs inspected (brief section 110)

| # | Input | Finding |
|---|---|---|
| 1 | Existing website | Next 16 App Router, `src/app/[locale]/**`, ~57 components, 12 MDX docs |
| 2 | Interactive components | Read in full: `BatteryHealthPanel`, `BatteryMatrixSection`, `BatteryPackView`, `BatteryPack3D`, `ScanSimulator`, `LiveTelemetryChart`, `ConnectionDiagram`, `PlatformExplorer`, `SessionSimulator`. Structural: `EcuTopology`, `ProtocolStack`, `HeroInterface`, `DocsSearch`. |
| 3 | Static product demos | `product/views.tsx` (i18n), `MiniChart` (sparklines only), `PanelChrome` |
| 4 | Dependencies | `motion` 13, `next-intl` 4, `three` + R3F 9 + drei 10, `@radix-ui/react-{popover,tooltip,toggle-group}`, `cmdk`, `shiki`, `@next/mdx`. No `gsap`, `echarts`, `@tanstack/react-table`, `fumadocs`. |
| 5 | Assets | `public/` present; not exhaustively reviewed |
| 6 | Vehicle support data | `src/lib/vehicles.ts` structured model; platform names cross-checked against upstream README (CMA + SPA2 named there; SPA/SEA treated as research/WIP) |
| 7 | LICENSE | Upstream `LICENSE` = MIT verbatim. Website licensing is private-use by design. Section 4. |
| 8 | README claims | Website `README.md` modified; upstream README carries the MIT badge + "Licensed under the MIT License" |
| 9 | Existing docs | 12 MDX files, real technical content, on-voice |
| 10 | i18n structure | `next-intl` v4, `src/i18n/{routing,navigation,request}.ts`, `src/middleware.ts`, `[locale]` segment, `messages/{en,sv}.json` 445/445 parity |
| 11 | Performance baseline | Not independently Lighthouse-measured; `next build` output inspected, no warnings |

---

## 3. Findings

### F1 - Full Vehicle Scan renders English under `/sv` (brief §65, §13-17, P0-10)

`src/components/features/ScanSimulator.tsx` and `src/lib/scan-sim.ts` call no `next-intl` API.
Rendered literals: stage names via `stageLabel` ("Discovering vehicle", "Scanning ECUs", "Scan
complete"), "Vehicle" / "detecting" / "Polestar 2 · CMA", "Scanning...", "READY", "N stored
fault(s)", "Last observed", "snapshot available", "Simulated session · fixed sample data, not a
vehicle reading", plus button `aria-label`s ("Pause scan" etc.). `sv.json` has the complete
`scan.*` namespace (`stageIdle` "Vilar" ... `snapshotAvailable`), unconsumed. The component appears
on the homepage (via `FeatureBlocks`) and on `/sv/features/vehicle-diagnostics`.
Severity: medium. `check-i18n.mjs` is green because it checks key parity, not key consumption.
Status: **implementer wiring in progress** (tree shows `ScanSimulator.tsx`, `scan-sim.ts`,
`en.json`, `sv.json` modified).

### F2 - Live Telemetry renders English under `/sv` (brief §65, §18-22, P0-10)

`src/components/telemetry/LiveTelemetryChart.tsx` calls no `next-intl` API. Rendered literals:
`aria-label`s "Telemetry channels" / "Time window" / "Pause telemetry" / "Resume telemetry", the
"Live" / "Resume" button text, the `{s}s` window labels, and every channel name via
`telemetry-sim.ts` `channels[].label` ("Pack voltage", "Battery temperature", ...). `sv.json` has
the full `telemetry.*` namespace including `channelNames.*`, unconsumed. Also `new
Date().toLocaleTimeString("en-GB")` hardcodes the readout locale. On the homepage and
`/sv/features/live-data`. Severity: medium.

### F3 - Connection diagram partially localised (brief §45-46, §66)

`src/components/architecture/ConnectionDiagram.tsx`: `nodes[].facts` ("Diagnostic gateway", "DoIP
capable", "No active electronics", ...), `linkLabels` ("OBD-II", "Ethernet", "USB / socket") and
the protocol-details `<dl>` rows ("Vehicle identification", "Read data by identifier", ...) are
hardcoded English. The node trigger labels/subs use `tt("nodes.*")` and are translated. Protocol
identifiers ("UDP 13400", "UDS 0x22", "ISO 13400 / 14229") must stay verbatim (§66) and do; only
the human-readable descriptions need Swedish. Severity: low.

### F4 - Session simulator stage sub-labels English (brief §32, §95, P1-7)

`SessionSimulator.tsx` shell is fully translated (`ts("session.*")`, 7-stage timeline, arrow-key
nav, "Representative session, simulated vehicle" label, report `exampleTag`). The inner
`ConnectStage` uses hardcoded pairs `["Ethernet link", "Connected"]`, `["DoIP gateway",
"Detected"]`, `["Routing activation", "Accepted"]`. This falls inside the plan's documented P1-7
boundary ("deepest instrument sub-labels stay English") but sits on its edge: "Connected" /
"Detected" are system-state words (§95) and `sv.json` already has `views.connected` "Ansluten".
Severity: low. Recommendation: pull these three into the `session` namespace.

### F5 - 2D matrix and 3D pack selections are not synchronised (brief §29)

`BatteryMatrixSection` keeps `selected: {m,g}` and syncs table focus + detail panel + `PackScale`
marker within itself (that part is correct and animated). `BatteryPackView` / `BatteryPack3D` keep
an independent `selected: number` (default 14). Selecting M14 G3 in the matrix does not lift module
14 in the 3D pack, and isolating a module in 3D does not move the matrix. §29 asks the table, the
battery module, the detail panel and the pack marker to stay synchronised; three of the four are,
across a single component. Severity: low (the brief's list is plausibly per-component).
Recommendation: lift a shared `selectedModule` to a context or the section wrapper if the two views
are ever shown together.

### F6 - Telemetry crosshair is pointer-only (brief §92, §93)

`LiveTelemetryChart` updates the crosshair readout on `onPointerMove` / `onPointerDown` only. There
is no keyboard way to move the inspection point along the series. The `<canvas>` has a descriptive
`aria-label` (channels + window), so it is not opaque to assistive tech, but per-point values are
unreachable without a pointer. Severity: low. Recommendation: focusable wrapper, Left/Right steps
`hoverX`, mirror the readout into an `aria-live="polite"` region on keypress.

### F7 - Simulated DTC records look real (brief §15, §40)

`scan-sim.ts` `FAULTS`: `P1A2E-71` "High-voltage battery, internal communication" (BECM, stored),
`U110B-87` "Lost communication with telematics module" (TCAM, historical), `B1C15-13` "Cabin
temperature sensor, circuit open" (CCM, pending). These are realistic DTC formats with plausible
descriptions. The section is prominently labelled "Simulated session · fixed sample data, not a
vehicle reading" and the site never claims a live connection, which satisfies the letter of §15 and
§40. Still worth confirming the codes are drawn from openCMA project data (`live_report.json`, the
`DID/` dir) or are deliberately synthetic; if invented, a note in `scan-sim.ts` saying so removes
any doubt. Severity: low. Awaiting implementer confirmation.

### F8 - `check-i18n.mjs` verifies parity, not consumption (gate weakness)

The i18n gate proves `sv.json` has every `en.json` key and that sample homepage keys differ and
protocol tokens survive. It does not prove any component reads a namespace, which is how F1/F2
passed CI. Proposed gate `G23` / `scripts/check-i18n-consume.mjs`: for each top-level namespace
present in `sv.json`, assert at least one `.tsx` references `useTranslations("<ns>")` or
`getTranslations("<ns>")` or `t("<ns>.`.

---

## 4. Licensing finding in full (brief §69-73, §70, §113)

**Upstream facts (`C:\Users\NicolasKheirallah\Documents\GitHub\openCMA`):**
`LICENSE` = verbatim MIT ("Permission is hereby granted, free of charge ... to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell"); `Cargo.toml` `[workspace.package]`
`license = "MIT"`; `README.md` `![License: MIT]` badge -> `opensource.org/licenses/MIT`, "Licensed
under the **MIT License**"; `DISCLAIMER.md` section 1 "openCMA is an independent, community-
developed **open-source** diagnostic and telemetry tool"; repo-wide search: no "non-commercial",
"private use", "source-available", "proprietary".

**Brief position:** §69-73 direct "PRIVATE USE ONLY" / "source-available, not open source" and to
remove "MIT licensed" and "free and open source". §70/§71 also say the LICENSE file is the source
of truth and the site must show no contradictory license language; §113 lists "no contradictory
licensing language".

**User decision (recorded):** the website deliberately leads a planned relicensing of openCMA away
from MIT. Keep "private use only / source-available". The implementer's user reached the same call.

**Actions taken by this audit** in `src/content/docs/license.mdx` (reviewer's file):
removed "The `LICENSE` file in the repository is the authoritative text" and the "Always defer to
the `LICENSE` file ... the `LICENSE` file wins" section (that file currently contradicts the page);
reframed the page as the project's stated current terms with a note that the formal `LICENSE` text
is being updated; kept the "not OSI open source" / "source-available" language and the strings
`check-render.mjs` asserts ("source-available", "private use", "OSI").

**Open follow-up (user, outside this repo):** update `LICENSE`, `Cargo.toml`, the README badge and
`DISCLAIMER.md`. Until then a visitor who opens the GitHub repo sees MIT. Tracked as gate `G24`.

---

## 5. Section-by-section verdicts

### P0 (brief §111)

| Brief | Area | Verdict | Evidence / gap |
|---|---|---|---|
| §8 | Remove hex from primary Battery Health | PASS | `BatteryHealthPanel.tsx` shows no `0x` at any level; Simple/Detailed = values only; Engineering = provenance ladder + `/docs/battery-diagnostics` link. `check-interactions.mjs` asserts `0x496D` never precedes the engineering level (it never appears). |
| §9-11, §96-97 | Battery Health interactive + provenance + Simple/Detailed/Engineering | PASS | Radix `ToggleGroup`, three levels, `AnimatePresence` gated by `useReducedMotion`, default metrics SoH/SoC/cell delta/pack V, "Source / Vehicle BMS", provenance chain Reported by / Read via / Decoded against / Refresh. |
| §10 | Hover reveals per-module values, others de-emphasise | PASS | `BatteryMatrixSection` `hover` state drives an instrument detail panel (avg/high/low/delta/temp); `exploring` dims non-emphasised cells to `opacity-35`; row/column headers cross-highlight. |
| §11 | Click selects, persists, Escape / Clear clears | PASS | `selected` persists; `Clear selection` button; Escape in `onCellKey`; animated summary<->detail via `AnimatePresence`. Mobile: `MobileModules` tap-select. |
| §13-17 | Full Vehicle Scan simulator | PASS (behaviour); GAP (i18n, F1) | Deterministic `stageAt(elapsed)` rAF clock; stages discovering -> "Polestar 2 · CMA" -> routing -> scanning with baked `JITTER` timing variation; faults expand with status classification; layout-stable totals with `AnimatedNumber`; Replay/Pause/Resume/Start + 1x/2x; ECUs clickable mid-run; `visibilitychange` pause; reduced-motion seeds the end state. English under `/sv` (F1). |
| §18-22 | Live Telemetry moving chart | PASS (behaviour) + DIVERGENCE + GAP (i18n F2, a11y F6) | `<canvas>` + rAF, zero per-frame React render; `sample()` = base + sine + `drivePhase` drive-cycle + seeded `noise`; 30s window default, 15/30/60; multi-select metric toggles starting at 2 of 6 (exact §19 list); crosshair readout on move; `onPointerDown` locks (pauses) the cursor; reduced-motion = static window + 2000ms tick; pauses off-screen + tab-hidden. Not ECharts (D1). English under `/sv` (F2). Crosshair pointer-only (F6). |
| §23-29 | 108-potential explorer | PASS (mostly); PARTIAL §29 (F5) | 27x4 grid, `role="grid"`/`row`/`gridcell`, arrow keys + Enter/Space + Escape, roving `tabIndex`, `aria-label={srText}` with mV offset, view modes Voltage/Deviation/Module, subtle 3-band colour (neutral / muted amber >3mV / restrained red >5mV) with legend and numeric detail so it reads without colour, `PackScale` marker springs to the selected potential, mobile module list + Prev/Next. Not synced to the 3D pack (F5). |
| §30-40 | Representative session simulator | PASS; F4 minor | `session-sim.ts` stages 01-07; timeline buttons `aria-current="step"`; Prev/Next/Replay; ArrowLeft/Right on the focused `role="group"`; "Representative session, simulated vehicle" on every stage; report `exampleTag` "Example report"; `reportCsv`/`reportJson` user-clicked. VIN redaction in Identify: implementer-attested, RE-CONFIRM. Stage sub-labels partly English (F4). |
| §47-52, §103-105 | Platform explorer + SPA/SEA WIP + capability explorer + data model | PASS | `PlatformExplorer` `ToggleGroup` CMA/SPA/SEA/SPA2, `AnimatePresence mode="popLayout"` card animation, per-vehicle capability list + research bullets, `StatusMarker` tone from `statusMeta` (WIP -> "info", never "ok"); `vehicles.ts` has `SupportStatus` union, `CapStatus`, `research[]`, no invented percentages (`check-interactions.mjs` greps `0/n` and `% complete`). |
| §61-67 | English + Swedish architecture | PASS (arch); GAP (coverage F1-F4) | `next-intl` v4 locale routing `/en` `/sv`, `localePrefix: "always"`, `deepMerge` fallback, `LocaleSwitcher` `router.replace(pathname, {locale})`, `check-i18n.mjs` enforces parity + identifier survival + real Swedish. Coverage holes: F1, F2, F3, F4. |
| §69-73 | License / private-use messaging | PASS (by user decision) | See section 4. Website internally consistent after the `license.mdx` fix; upstream mismatch tracked as G24. |

### P1 (brief §111)

| Brief | Area | Verdict | Evidence / gap |
|---|---|---|---|
| §53-58 | Modern docs | DIVERGENCE (accepted) + PASS | `@next/mdx` + `src/lib/docs.ts` index + `DocsSearch` (`cmdk`, Cmd/Ctrl+K, routes to slug+hash) + `TableOfContents` (IntersectionObserver, hides < 2 headings, no scroll listener) + `Code` (Shiki dual-theme, copy button, filename, flat). 3-pane `docs/layout.tsx`. `check-docs.mjs` enforces all of it. Behaviourally meets §54-58. |
| §59 | Reusable MDX data components | PASS (completed by this audit) | Was `Callout` + `SpecList`. Added `SafetyNotice`, `Wip`, `Experimental`, `EcuReference`, `VehicleSupport`, `PlatformSupport`, `DidReference`, `ProtocolFlow`, `DiagnosticExample` in `src/components/docs/mdx/`, each exercised in a doc. `supported-vehicles.mdx` and `ecu-reference.mdx` now render from `src/lib` instead of hand tables. `tsc` clean, all edited MDX compiles, `check-antislop`/`check-docs`/`check-content` green. |
| §60 | Cross-link marketing <-> docs | PARTIAL | Docs->features and features->docs both exist for battery (`battery-diagnostics.mdx` <-> `/features/battery-health`, `BatteryHealthPanel` -> `/docs/battery-diagnostics`). No gate asserts the round trip for every feature. Proposed as a check in DELIVERY-GATE. |
| §41-44 | Improved hero product demo | PASS (structural) | `HeroInterface.tsx`: `onSelect` tabs, `AnimatePresence`, `useMotionValue` for a small pointer parallax; delegates labels to the i18n'd `product/views.tsx`. RE-CONFIRM the <=1-2deg perspective cap and region (not full-screenshot) transitions in a browser. |
| §45-46 | Connection diagram interaction | PASS (behaviour); F3 (i18n) | Four Radix `Popover` nodes with facts; packet `phase` alternates request<->response; protocol hex behind `Disclosure`; reduced-motion gates the packet; mobile vertical list. Popover content English under `/sv` (F3). |
| §12 | 3D battery pack | PASS | `BatteryPack3D` via `next/dynamic({ssr:false})`; `hasWebGL()` + checking state; explicit 2D-fallback note when `!webgl || reduce`; `useInView` latches mount and live-tracks visibility; `frameloop="demand"` when idle or reduced-motion; `powerPreference: "low-power"`, `dpr={[1,1.6]}`, `ContactShadows` only, no post-processing; hover tooltip + click-isolate lift with restrained displacement; Voltage(deviation)/Temperature modes. |

### P2

| Brief | Area | Verdict | Note |
|---|---|---|---|
| §44 | 3D architecture / hero vehicle | N/A | Brief marks "evaluate"; not taken. Acceptable. |
| §82 | Native View Transitions | N/A | Optional with fallback; not adopted. Acceptable. |
| §4 | GSAP timeline sequences | N/A | Not installed; no pinned sequence was built, so nothing needs it. Correct, not a gap. |

---

## 6. Divergences from brief library preferences

| # | Preference | Implementation | Assessment |
|---|---|---|---|
| D1 | §18 Apache ECharts | Raw `<canvas>` + rAF, `telemetry-sim.ts` | ACCEPT. §20/§22 require a real moving graph with updates kept out of React; canvas meets both and ships less JS. ECharts would also satisfy the brief. |
| D2 | §53 Fumadocs | `@next/mdx` + index + `cmdk` + Shiki | ACCEPT. §54-58 are behaviours; all implemented and gated by `check-docs.mjs`. |
| D3 | §25 TanStack Table | Custom grid + selection state | ACCEPT. §25 says "where useful"; a fixed 108-cell grid does not need a table engine. Interaction bar (§24-29, §92) is met. |
| D4 | §4 GSAP + ScrollTrigger | Not installed | ACCEPT. Restricted by the brief to genuine timeline orchestration; none was built. |

---

## 7. Re-verification checklist for the implementer's final commit

Run against the settled tree once the F1/F2 wiring lands, then fold into `GATES.md` /
`DELIVERY-GATE.md`:

- [ ] `node scripts/check-*.mjs` all green (17 runnable), plus a new i18n-consumption check (G23)
- [ ] `npx next build` clean; record first-load JS for `/` and `/en/docs`; confirm `three` is not in `/`'s first-load chunk
- [ ] `/sv` visual pass of the homepage, `/sv/features/vehicle-diagnostics`, `/sv/features/live-data`: scan + telemetry now Swedish
- [ ] Lighthouse Perf / A11y / Best Practices / SEO on `/en` and `/en/docs`, target > 95 (§88)
- [ ] Six viewports x light/dark x en/sv, no overflow / no hover-only data / no animation CLS (§113)
- [ ] Keyboard-only: 108 grid, scan, session, docs search, and the telemetry crosshair once F6 is fixed (§92)
- [ ] `prefers-reduced-motion` behavioural pass on every page (§94)
- [ ] WebGL-disabled: 3D battery -> 2D fallback, no console errors (§99)
- [ ] Idle-CPU + offscreen-render check for telemetry and the 3D canvas (§113)
- [ ] `license.mdx` fix intact; no `MIT` string or `/blob/*/LICENSE` link under `src/content/docs` or `src/app` (G25)
- [ ] Confirm F5 (matrix<->3D sync) and F7 (DTC provenance) dispositions

---

## 7b. Live browser verification (2026-09-06, commit `5ad9178` + fresh prod build, port 4477)

Driven with agent-browser against `next start`. Reduced-motion emulation could not be applied
through the tool this run, so G26 stays PARTIAL (source-confirmed only).

| Interaction | Result |
|---|---|
| Hero product-frame tabs (Overview / Battery / DTC / Modules / Live / Logs) | PASS - clicking `Battery` swaps the panel to SoH / SoC / pack V / pack A / cell delta / min-max / pack temp + the mini deviation grid |
| Connection diagram node popovers | PASS - `data-state=open`, `aria-expanded=true`, facts render ("Diagnostic gateway / DoIP capable / TCP / UDP on port 13400"). agent-browser's snapshot does not portal-capture Radix content, which made it *look* inert; JS confirms it works |
| Protocol details disclosure | PASS - expands to the UDP/TCP/routing/UDS rows |
| Full Vehicle Scan simulator | PASS - "Idle" while off screen (no premature autoplay), then `Idle -> Vehicle detected -> Scanning ECUs -> Scan complete` over ~3-4 s on scroll-in; `Replay` appears at the end; ECU rows and 3 fault rows populate |
| Live Telemetry chart | PASS - canvas ImageData hash changes frame to frame (`MOVING=true`); `Pause` freezes it (`MOVING=false`); channel toggle `Motor torque` off->on; crosshair readout populates on pointer move ("08:32:21 - Pack voltage 398.1 V - Battery temperature 23.8 C") |
| 108-potential matrix | PASS - cell click exposes `aria-label` "Module 14, group 2, 3.725 volts, 4 millivolts above pack average"; ArrowRight x2 + ArrowDown moves roving focus to M15 G4; Enter sets `aria-selected=true`; Escape clears the selection |
| Locale switch EN -> SV | PASS - URL `/` -> `/sv`, page preserved |
| F1 scan under /sv | PASS - stage label renders "Skannar styrenheter"; section title "Fullständig fordonsskanning" |
| F2 telemetry under /sv | PASS - channel buttons "Packspänning / Batteritemperatur / Motormoment"; window control present |
| F3 connection popover under /sv | PASS - "Fordon / Diagnostikgateway / DoIP-kapabel / TCP / UDP på port 13400" (identifiers stay verbatim) |
| Session simulator under /sv | PASS - "Klicka dig igenom en representativ session", stages "01 Anslut ... 06 Realtidsdata" |
| Docs command palette | PASS (partial) - Ctrl+K opens the dialog with the input focused; filtered-result capture failed on a selector, not verified end to end |

### F9 (new, low) - hero caption hardcoded English under /sv

`src/components/hero/HeroInterface.tsx:71` renders the literal
"Representative interface with sample values. Not a live vehicle reading." The catalog key
`common.representative` already holds the Swedish and is unused here. Not caught by
`check-i18n-consume.mjs` because the `common` namespace is consumed elsewhere. One-line fix:
`t("common.representative")`. Reported to the implementer.

### Not a bug - things that looked broken but work

- Connection popovers appeared inert in the accessibility snapshot; they open correctly (Radix
  portals outside the snapshot scope).
- The scan simulator shows "Idle" and does nothing until its section is ~40% in view; that is the
  intended `useInView` autoplay gate, not a dead control.

## 8. Change log for this audit

- Added `src/components/docs/mdx/`: `tone.ts`, `index.ts`, and 9 components
  (`SafetyNotice`, `Wip`, `Experimental`, `EcuReference`, `VehicleSupport`, `PlatformSupport`,
  `DidReference`, `ProtocolFlow`, `DiagnosticExample`).
- Wired those into `architecture.mdx`, `battery-diagnostics.mdx`, `safety.mdx`, `dtc-scanning.mdx`,
  `supported-vehicles.mdx`, `ecu-reference.mdx`; replaced 5 hand-maintained platform tables and
  4 hand-maintained ECU tables with data-driven components.
- Rewrote `src/content/docs/license.mdx` to remove the self-contradiction with the upstream MIT
  `LICENSE` file (section 4). Committed by the implementer within `96868bf`.
- Sent the implementer five Swedish `sv.json` consistency corrections (`views.stateOfCharge`,
  `views.stateOfHealth`, three FAQ "WIP" mentions); all applied.
- Reported F1-F8 to the implementer. F1 wiring is in progress on the implementer side.
- Verified after each reviewer change: `npx tsc --noEmit` exit 0; `@mdx-js/mdx` compile of all
  edited MDX; `node scripts/check-antislop.mjs` / `check-docs.mjs` / `check-content.mjs` pass;
  and a full re-run of all 16 runnable check scripts + `check-build` + `check-render` (all green).
