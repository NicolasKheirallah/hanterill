# openCMA Website: Interaction, Motion, 3D, i18n and Docs Upgrade Plan

Tracks the second and third passes over the openCMA site: richer interaction, premium motion,
meaningful clickability, interactive engineering visualisations, a modern docs experience, English
and Swedish, a representative session walkthrough, and a restrained 3D battery view. The visual
direction (Scandinavian, instrument-like, restrained) is unchanged.

This is the authoritative plan, rewritten by the reviewer session (`opencma-website-5d`) to the
brief section-110 column set after an independent audit (`AUDIT.md`). The implementer session
(`opencma-website-5b`) built the work; its original lighter triage table is in git history at
`e8927b9` / `96868bf`.

Status keys: **DONE** · **PARTIAL** (shipped with a documented boundary) · **DEFERRED** (not
shipped, rationale given) · **IN PROGRESS** (implementer actively finishing).

Columns: Area · Current behaviour (before this pass) · Problem · Proposed interaction · Library ·
Accessibility behaviour · Mobile behaviour · Performance impact · Priority · Status.

---

## P0: core of the request (brief section 111)

| # | Item | Priority | Status | Notes |
|---|---|---|---|---|
| P0-1 | Battery Health identifier area: hex removed, provenance chain, Simple/Detailed/Engineering | P0 | DONE | No `0x` token at any level; `check-interactions.mjs` guards it. |
| P0-2 | Battery Health hover reveals per-module values, others de-emphasise | P0 | DONE | Instrument detail panel driven by hover and focus alike. |
| P0-3 | Full Vehicle Scan simulator: deterministic staged session with DTCs | P0 | PARTIAL | Behaviour done; renders English under `/sv` (AUDIT F1), implementer wiring `useTranslations` now. |
| P0-4 | Live Telemetry: real moving canvas chart with metric toggles and crosshair | P0 | PARTIAL | Behaviour done; English under `/sv` (AUDIT F2) and crosshair pointer-only (F6); both being addressed. |
| P0-5 | 108-potential explorer: grid selection, three-level hover, view modes | P0 | DONE | Synced within the 2D explorer; not cross-synced to the optional 3D pack (AUDIT F5, low). |
| P0-6 | Representative 7-stage session walkthrough | P0 | DONE | Button, stage-click and arrow-key navigation; "simulated vehicle" label; example report export. |
| P0-7 | SPA / SEA / SPA2 shown as WIP with an explicit status hierarchy | P0 | DONE | No invented completion figures; WIP never uses the "ok" tone. |
| P0-8 | Modern docs: 3-pane, command search, on-this-page, MDX data components | P0 | DONE | Not Fumadocs (divergence D2); §59 component set completed by the reviewer. |
| P0-9 | Private-use licensing language, no contradictory "MIT" / "open source" | P0 | DONE | By user decision the site leads a planned relicense; `license.mdx` no longer cites the upstream MIT file. Upstream metadata is the user's follow-up (gate G24). |
| P0-10 | English + Swedish architecture and coverage | P0 | PARTIAL | Architecture done and gated; coverage holes F1-F4 (fixing) plus deferrals P1-6 and P1-8. |
| P0-11 | Everything clickable, no false affordances | P0 | DONE | One residual keyboard gap: telemetry crosshair (F6 / gate G27). |

Detailed per-item breakdown in the brief section-110 column format follows.

### P0-1 Battery Health identifier area
- **Current behaviour:** static card showing `Identifier 0x496D` as a headline field.
- **Problem:** a raw hex DID dominates a view most visitors cannot read (brief §8).
- **Proposed interaction:** replace with `Source / Vehicle BMS` and `Updated / Live`; a
  Simple / Detailed / Engineering toggle; the DID and service only inside the Engineering level,
  behind a plain-language provenance chain (Reported by -> Read via -> Decoded against -> Refresh)
  that links to the identifier reference in the docs.
- **Library:** Radix ToggleGroup; Motion `AnimatePresence` for the level transition.
- **Accessibility:** ToggleGroup is a proper radio group with `aria-label`; the level change is a
  content swap, not a focus trap; reduced motion drops the y-offset and keeps a fade.
- **Mobile:** single column; the toggle wraps; no hover dependency.
- **Performance:** three small static subtrees, one mounted at a time. Negligible.
- **Priority:** P0. **Status:** DONE (`BatteryHealthPanel.tsx`). No `0x` token appears at any
  level; `check-interactions.mjs` fails on any `0x..` before the Engineering level.

### P0-2 Battery Health hover reveals per-module values
- **Current behaviour:** a static battery graphic with no per-region data.
- **Problem:** the battery visual carries no information (brief §10).
- **Proposed interaction:** hover or focus a potential -> instrument detail panel (average,
  highest, lowest, delta, temperature); the pointed row and column gain emphasis, the rest dims to
  `opacity-35`; a spring marker on the pack scale moves to the pointed value.
- **Library:** Motion (`useReducedMotion`, spring); plain React state.
- **Accessibility:** every cell is a `<button role="gridcell">` with an `aria-label` giving module,
  group, volts and the mV offset from pack mean in words; focus drives the same panel as hover.
- **Mobile:** no hover; a module list with tap-select and Previous / Next module (see P0-5).
- **Performance:** state-driven re-render of one panel; no animation loop.
- **Priority:** P0. **Status:** DONE (`BatteryMatrixSection.tsx`).

### P0-3 Full Vehicle Scan simulator
- **Current behaviour:** three lines animating to "Connected".
- **Problem:** it does not resemble a diagnostic scan (brief §13-17).
- **Proposed interaction:** a deterministic simulated session: Discovering -> "Polestar 2 · CMA"
  detected -> routing -> ECUs appear one by one with baked per-ECU timing jitter -> selected ECUs
  return representative DTCs that expand with an ACTIVE / PENDING / STORED / HISTORICAL
  classification; Replay / Pause / Resume / Start and 1x / 2x; ECUs clickable while running; the
  whole panel labelled "Simulated session".
- **Library:** Motion (`AnimatePresence`, `useInView`); `requestAnimationFrame` clock; sim in
  `src/lib/scan-sim.ts`.
- **Accessibility:** stage label in an `aria-live="polite"` region; each ECU row a real button with
  `aria-expanded` when it has faults; totals row is layout-stable so counts do not shift focus.
- **Mobile:** compact mode with a scrollable ECU list; fast transitions.
- **Performance:** one rAF clock that freezes when off screen, paused, tab-hidden or reduced-motion
  (which seeds the end state). No React state per frame beyond the elapsed counter.
- **Priority:** P0. **Status:** DONE (behaviour); i18n IN PROGRESS - the component renders English
  under `/sv` (AUDIT F1); implementer wiring `useTranslations("scan")` now.

### P0-4 Live Telemetry chart
- **Current behaviour:** a hand-drawn static SVG waveform.
- **Problem:** it does not move and is not real data (brief §18-22).
- **Proposed interaction:** a continuously scrolling `<canvas>` fed by a deterministic drive-cycle
  signal (base + sine + 40s drive-cycle envelope + seeded noise); 30s window with 15 / 30 / 60
  options; multi-select metric toggles starting at 2 of 6 (pack voltage, pack current, battery
  temp, inverter temp, motor torque, 12 V rail); hover crosshair with a synchronized readout;
  pointer-down locks (pauses) the cursor for inspection.
- **Library:** raw `<canvas>` 2D + `requestAnimationFrame` (deliberately not ECharts, see P2-3);
  Radix ToggleGroup; sim in `src/lib/telemetry-sim.ts`.
- **Accessibility:** canvas has an `aria-label` naming the active channels and window; toggles are
  keyboard-operable. GAP: the crosshair readout is pointer-only (AUDIT F6) - keyboard point
  inspection is a follow-up (gate G27).
- **Mobile:** full-width canvas; fewer default series; the readout becomes tap-to-inspect.
- **Performance:** the render loop writes straight to the canvas; React never re-renders per frame.
  Loop stops when off screen, paused, tab-hidden, or reduced-motion (static window + a 2000ms
  tick).
- **Priority:** P0. **Status:** DONE (behaviour); i18n IN PROGRESS (AUDIT F2); F6 open as G27.

### P0-5 "108 potentials, one battery" explorer
- **Current behaviour:** a static matrix image.
- **Problem:** the strongest data story on the site is not interactive (brief §23-29).
- **Proposed interaction:** a 27x4 grid; click any potential to select it (persists until another
  click, Escape, or Clear); hover a row to light the module, a column to light the group position,
  a cell for its exact value; Voltage / Deviation / Module view modes; the selected potential stays
  anchored while table focus, the detail panel and the pack-scale marker update together.
- **Library:** Radix ToggleGroup for view modes; Motion for the summary<->detail transition and the
  spring marker; plain React state for selection.
- **Accessibility:** `role="grid"` with `role="row"` / `role="gridcell"`; arrow keys move, Enter or
  Space selects, Escape clears; roving `tabIndex` (only the selected cell, or M1G1, is tabbable);
  per-cell `aria-label` with the spoken mV offset; colour is a 3-band reinforcement with a legend
  and always a numeric readout, so values are legible without colour (brief §28).
- **Mobile:** a scrollable module list (M01-M27); tap a module -> its four groups; Previous / Next
  module.
- **Performance:** 108 buttons, CSS-driven emphasis, one spring on the marker. No loop.
- **Priority:** P0. **Status:** DONE (`BatteryMatrixSection.tsx`). PARTIAL on §29: matrix selection
  is not cross-synced to the optional 3D pack view (AUDIT F5, low severity).

### P0-6 Representative session walkthrough
- **Current behaviour:** a paragraph describing a session.
- **Problem:** the visitor cannot step through the product (brief §30-40).
- **Proposed interaction:** a 7-stage timeline (Connect / Identify / Scan / Inspect / Battery /
  Live data / Report); Previous / Next / Replay; any stage clickable; Left / Right arrows when the
  panel has focus; VIN redacted in Identify; the Report stage shows counts and offers CSV / JSON
  downloads labelled "Example report"; a "Representative session, simulated vehicle" label on every
  stage.
- **Library:** Motion (`AnimatePresence`); sim + report serialisers in `src/lib/session-sim.ts`.
- **Accessibility:** timeline buttons carry `aria-current="step"`; the stage panel is a
  `role="group"` with `aria-roledescription` and `tabIndex={0}` so arrow keys are scoped; explicit
  buttons always present (no swipe-only).
- **Mobile:** the timeline scrolls horizontally; explicit Previous / Next; no scroll-jacking swipe.
- **Performance:** one stage subtree mounted at a time; downloads are `Blob` URLs built on click.
- **Priority:** P0. **Status:** DONE (`SessionSimulator.tsx`). F4: three Connect-stage sub-labels
  are hardcoded English inside the documented P1-7 boundary; RE-CONFIRM VIN redaction in a browser.

### P0-7 SPA / SEA / SPA2 as work-in-progress
- **Current behaviour:** the site implied openCMA is permanently CMA-only.
- **Problem:** no path shown for other platforms; risk of implying support that does not exist
  (brief §47-52).
- **Proposed interaction:** a platform explorer (CMA / SPA / SEA / SPA2); selecting a platform
  animates its vehicle list in; selecting a vehicle shows a capability breakdown (Connection, ECU
  discovery, DTC scan, Battery SoH, Cell potentials, Live data, Service routines) with per-function
  status and a "current research" list; no completion percentages anywhere.
- **Library:** Radix ToggleGroup; Motion (`AnimatePresence mode="popLayout"`); data in
  `src/lib/vehicles.ts`.
- **Accessibility:** toggles are a radio group; vehicle buttons use `aria-pressed`; status is a
  word plus a tone, never colour alone; WIP never uses the "ok" tone.
- **Mobile:** list and detail stack; the platform toggle wraps.
- **Performance:** static data, list animation only. Negligible.
- **Priority:** P0. **Status:** DONE (`PlatformExplorer.tsx`, `vehicles.ts`). `check-interactions`
  greps for `0/n` and `% complete` and fails if present.

### P0-8 Modern docs experience
- **Current behaviour:** flat MDX pages, no search, no on-this-page.
- **Problem:** the docs do not read like an engineering knowledge base (brief §53-60).
- **Proposed interaction:** a 3-pane layout (sidebar / article / on-this-page); a Cmd/Ctrl+K
  command palette that searches a built index of headings and body text and routes to slug+hash;
  an IntersectionObserver on-this-page rail that hides itself on short pages; flat code blocks with
  a copy button, filename and language label; reusable MDX data components.
- **Library:** `@next/mdx` + `cmdk` + Shiki + `rehype-slug` (deliberately not Fumadocs, see D2);
  index builder in `src/lib/docs.ts`.
- **Accessibility:** the palette is a listbox with arrow / Enter / Escape; the TOC uses observers,
  not a scroll listener; code copy buttons have `aria-label`.
- **Mobile:** the sidebar collapses; the palette is full-width; the on-this-page rail is hidden.
- **Performance:** the search index is built at request time from MDX sources and cached; Shiki
  highlighting is build-time.
- **Priority:** P0/P1 boundary. **Status:** DONE. MDX component set completed by the reviewer
  (brief §59: added `SafetyNotice`, `Wip`, `Experimental`, `EcuReference`, `VehicleSupport`,
  `PlatformSupport`, `DidReference`, `ProtocolFlow`, `DiagnosticExample`).

### P0-9 Private-use licensing
- **Current behaviour:** "MIT licensed", "open source" language.
- **Problem:** the project's stated direction is private-use; contradictory license language is a
  compliance risk (brief §69-73).
- **Proposed interaction:** "Source-available, for private use" in the hero principles, footer
  disclaimer and closing CTA; a dedicated `/docs/license` page; the About page states "not open
  source in the OSI sense"; `check-content.mjs` fails the build on "MIT licensed" or "free and open
  source".
- **Library:** none; copy + a static check.
- **Accessibility:** n/a.
- **Mobile:** n/a.
- **Performance:** n/a.
- **Priority:** P0. **Status:** DONE by user decision. The website deliberately leads a planned
  relicense. The reviewer rewrote `license.mdx` so the page no longer cites the (still-MIT)
  upstream `LICENSE` file as governing. Upstream `LICENSE` / `Cargo.toml` / README badge /
  `DISCLAIMER.md` remain MIT - the user's follow-up, tracked as gate G24. See `AUDIT.md` section 4.

### P0-10 English + Swedish
- **Current behaviour:** English only.
- **Problem:** no multilingual architecture (brief §61-68).
- **Proposed interaction:** `next-intl` locale routing `/en` `/sv`, `localePrefix: "always"`; a
  restrained EN / SV switcher that replaces the current pathname with the new locale; browser-
  language detection on first visit with an explicit choice persisted; namespaced keys; protocol
  identifiers never localised; Swedish number formatting where it is user-facing.
- **Library:** `next-intl` v4; `src/i18n/*`; `src/middleware.ts`; `messages/{en,sv}.json`.
- **Accessibility:** `<html lang>` follows the locale; the switcher is a labelled control, not
  flags.
- **Mobile:** the switcher sits in the mobile menu alongside the theme toggle.
- **Performance:** locales are statically generated; `deepMerge` fallback means a partial catalog
  never shows a raw key.
- **Priority:** P0. **Status:** PARTIAL. Architecture DONE and gated (`check-i18n.mjs`: parity
  445/445, identifier survival, real-Swedish sampling). Coverage holes: `ScanSimulator` and
  `LiveTelemetryChart` render English under `/sv` (F1/F2, implementer fixing now);
  `ConnectionDiagram` popover content is English (F3, implementer fixing now); session sub-labels
  (F4). Doc bodies and interior-page prose are separately deferred (P1-6, P1-8).

### P0-11 Everything clickable
- **Current behaviour:** several sections looked interactive but were not.
- **Problem:** false affordances (brief §107).
- **Proposed interaction:** every element that looks interactive acts - connection nodes, ECU
  topology, platform explorer, battery grid, scan rows, session timeline, docs search and TOC,
  theme and locale toggles. No `href="#"`.
- **Library:** as per each section above.
- **Accessibility:** all of the above are keyboard-operable; see per-item rows.
- **Mobile:** tap equivalents for every hover (per item).
- **Performance:** per item.
- **Priority:** P0. **Status:** DONE. One residual keyboard gap: telemetry crosshair (F6 / G27).

---

## P1: depth and polish

| # | Item | Where | Library | A11y | Mobile | Perf | Status |
|---|---|---|---|---|---|---|---|
| P1-1 | Optional 3D battery pack | `BatteryPack3D.tsx`, `BatteryPackView.tsx` | R3F 9 + drei | `hasWebGL` gate + 2D-fallback note; not keyboard-interactive (labelled decorative-plus) | shows the same fallback note; touch-rotate via OrbitControls | `next/dynamic({ssr:false})`, `frameloop="demand"` when idle/reduced-motion, `low-power`, no post-processing | DONE |
| P1-2 | Shared motion tokens | `lib/motion.ts`, `globals.css` | Motion | n/a | n/a | prevents per-component spring drift | DONE |
| P1-3 | Site-wide command palette | `CommandPalette.tsx`, `DocsSearch.tsx` | `cmdk` | listbox, arrow/Enter/Esc, Cmd/Ctrl+K | full-width | index built once | DONE |
| P1-4 | Micro-interactions (tap feedback, active-nav underline, disclosure motion) | Header, `ui/Button`, `ui/Disclosure` | Motion `layoutId` | underline skipped under reduced motion; press states are visual only | same | trivial | DONE |
| P1-5 | Swedish for the vehicle-support data model | `vehicles.ts` -> `platforms.*` catalog | next-intl | n/a | n/a | n/a | PARTIAL - status labels, notes, capability labels, blurbs translated; per-vehicle engineering `note` and `research[]` bullet text stay English (dense protocol prose needing a domain reviewer, inside a drill-down) |
| P1-6 | Swedish docs article bodies | `content/docs/*.mdx` | next-intl / MDX | the doc chrome is translated; each article shows an "available in English" notice under `/sv` (not a 404) | same | n/a | DEFERRED - long-form protocol documentation; a separate editorial pass |
| P1-7 | Swedish for the deepest instrument sub-labels | `views.tsx` live-channel names, `demo-data.ts` DTC text, `SessionSimulator` Connect-stage pairs | next-intl | n/a | n/a | n/a | PARTIAL - reused view field labels translated; live-channel names and representative DTC descriptions stay English by design (they mirror how the vehicle reports them). F4 recommends pulling the three Connect-stage state words in. |
| P1-8 | Swedish for interior-page explanatory prose | `src/app/[locale]/{features/*,download,safety,privacy,about}/page.tsx` `<Prose>` bodies | next-intl | headers, nav and every interactive component on these pages are already translated | same | n/a | DEFERRED - ~70 short secondary-copy fragments across 8 pages; the homepage narrative is fully Swedish; handled in the dedicated Swedish review pass |

---

## P2: considered and not done

| # | Item | Rationale |
|---|---|---|
| P2-1 | GSAP + ScrollTrigger pinned architecture walkthrough | Motion covers every interaction here; a scroll-pinned sequence risks hijacking native scroll, which the brief forbids. Revisit only for a genuine timeline-orchestrated reveal. |
| P2-2 | WebGPU renderer for the 3D pack | WebGL2 is enough for 27 lightly shaded boxes. WebGPU adds a code path and a fallback matrix for no visible gain at this fidelity. |
| P2-3 | Apache ECharts for the live graph | The hand-written canvas loop is smaller, has no dependency, and already gives deterministic replay, a moving window, metric toggles and reduced-motion handling. ECharts would be heavier for the same result. Accepted divergence D1. |
| P2-4 | Locale-aware number and date formatting in every demo | Demo values are fixed sample data in SI units. `next-intl` formatters are available if real localisation of figures is wanted later. The telemetry readout timestamp currently hardcodes `en-GB` (minor). |
| P2-5 | More than two languages | Routing (`localePrefix: "always"`, `hasLocale` guard, `generateStaticParams`) already generalises; a new locale is a `messages/<x>.json` plus a `routing.locales` entry. |

---

## P3: premium and motion pass (from PREMIUM-PASS.md)

A calibration pass, not a feature pass. No new runtime dependency. The bar is
precision, materiality, one orchestrated moment, weightlessness. Full research,
package landscape and the considered-and-rejected list are in `PREMIUM-PASS.md`.

### P3-1 3D battery: product render, not prototype

- **Current behaviour (before P3):** `ambientLight` + two `directionalLight`s, flat
  `meshStandardMaterial` boxes, one untuned `ContactShadows`. Geometry and interaction
  correct; the surface reads as a prototype.
- **Problem:** the highest-value 3D surface on the site looks unfinished next to the
  Apple / Polestar bar the brief sets.
- **Proposed interaction:** unchanged. This is a lighting and material change only.
- **Library:** `@react-three/drei` `Environment` + `Lightformer` (already a dependency).
  No postprocessing.
- **Accessibility:** none affected. The 2D matrix fallback, the WebGL gate and the
  reduced-motion `frameloop="demand"` are unchanged.
- **Mobile:** `dpr={[1, 1.6]}` and `powerPreference: "low-power"` kept; the environment
  renders once, not per frame.
- **Performance:** one extra offscreen cube-camera pass on mount. Negligible; the render
  loop still stops when the canvas is off screen.
- **Priority:** P0 within the pass. **Status:** DONE (`BatteryPack3D.tsx`). `<Environment>`
  with three `<Lightformer>`s (key, fill, rim), `meshPhysicalMaterial` with a faint
  `clearcoat`, `<ContactShadows>` tuned to a soft grounded contact. `check-premium.mjs`
  fails if the environment, the soft shadow, or the "no postprocessing" rule regresses.

### P3-2 Scroll reveal: native CSS, off the main thread

- **Current behaviour (before P3):** `Reveal` mounted a `motion` component per block and
  ran a JS `useInView` observer.
- **Problem:** per-section JS scroll observers for what the 2026 platform does on the
  compositor for free; and a per-section fade-and-rise is the generic tell the design
  guidance calls out.
- **Proposed interaction:** `.reveal` class driven by `animation-timeline: view()`. A
  stack cascades on its own as each element crosses its entry range.
- **Library:** none. `@supports (animation-timeline: view())` + `prefers-reduced-motion:
  no-preference` guards; base `opacity: 1` so content is readable with no support.
- **Accessibility:** reduced motion and no-support both fall to "just visible".
- **Mobile:** identical; compositor-run, no scroll listener.
- **Performance:** removes the observer from every `Reveal`, and `Reveal.tsx` becomes a
  Server Component again (no `motion/react` import).
- **Priority:** P0 within the pass. **Status:** DONE (`Reveal.tsx`, `globals.css`).
  `check-motion.mjs` asserts both guards and the `opacity: 1` base.

### P3-3 One orchestrated load moment

- **Current behaviour (before P3):** the hero had a load sequence; the hero interface
  panel came in at delay 0.1 / `DUR.explain`.
- **Problem:** the sequence was loose and long; the sanctioned single page-load moment
  should be tight and unmistakably deliberate.
- **Proposed interaction:** `.hero-seq` staggers its five children up and in on a 70ms
  step, `var(--motion-slow)` each; the interface panel follows at delay 0.34s /
  `DUR.slow`. Total under ~900ms. Nothing else on the page animates on scroll except the
  reveal.
- **Library:** CSS for the text stagger (Hero stays a Server Component); the panel keeps
  its existing `motion` entrance, retuned.
- **Accessibility / mobile:** the whole sequence is skipped under reduced motion (base
  `opacity: 1`).
- **Performance:** transform + opacity only, compositor-run.
- **Priority:** P1 within the pass. **Status:** DONE (`Hero.tsx`, `HeroInterface.tsx`,
  `globals.css`).

### P3-4 Scoped view transitions

- **Current behaviour (before P3):** locale switch and docs prev / next were plain swaps.
- **Problem:** the language change reads as a reload; docs sequential navigation gives no
  orientation cue.
- **Proposed interaction:** locale switch crossfades the `<main>` content region (header
  and footer fixed); docs Previous / Next slides the content against the reading
  direction, keyed to a `doc-forward` / `doc-back` transition type. Every other route
  change stays instant.
- **Library:** the platform View Transitions API via `React.unstable_addTransitionType`
  inside a `startTransition`. Next 16.3.4 has no `experimental.viewTransition` flag, so
  this is a DOM/React-transition implementation and a progressive enhancement: instant
  swap where the browser or timing does not cooperate. `view-transition-name: page-main`
  scopes it; `globals.css` disables it entirely under reduced motion.
- **Accessibility:** reduced motion swaps instantly; keyboard and screen-reader flow
  unchanged (`DocNavLink` is a real `<a>` with the correct href).
- **Mobile / performance:** compositor-run, zero animation JS on these flows; no library.
- **Priority:** P1 within the pass. **Status:** DONE (`LocaleSwitcher.tsx`,
  `DocNavLink.tsx`, `[...slug]/page.tsx`, `[locale]/layout.tsx`, `globals.css`,
  `next.config.ts` note). Revisit the framework flag on a Next upgrade that ships it.

### P3-5 Micro-polish, measured

- **Press feedback:** a `.press` utility - `translateY(1px) scale(0.985)` on `:active`,
  gated to `(hover: hover) and (prefers-reduced-motion: no-preference)` so it does not
  fire on touch tap-ghosting. Applied to the toggle groups; `Button` already had its own.
- **Connection packet easing:** the request/response dot now uses `[0.65, 0, 0.35, 1]`
  (quick out, settle in) instead of `easeInOut`, so it reads like a signal.
- **Heading weight settle:** section headings interpolate `font-variation-settings`
  "wght" 440 -> 500 once on first paint via `@starting-style` (Inter is a variable face);
  subliminal, off under reduced motion, a no-op without `@starting-style` or a variable
  font.
- **Considered, not done:** a global `:focus-visible` outline-offset transition - risks
  regressing the many existing `transition-colors` rules; revisit with a scoped audit.
  Extending `AnimatedNumber` to the battery / platform detail panels - those panels use
  `AnimatePresence mode="wait"`, and the swap fade is the better transition for a full
  content change; `AnimatedNumber` stays on the persisted counters (scan totals, report).
- **Priority:** P2 within the pass. **Status:** DONE except the two "considered, not done"
  items.

### P3-6 Chart library: keep the hand-rolled canvas

- **Decision:** do not adopt Chart.js or ECharts. The benchmarks put both at 4-7x the CPU
  and memory of the current canvas, and their default visual language is rounded-marketing,
  not instrument. The hand-rolled `<canvas>` already is the lightweight option and handles
  the window, crosshair, multi-series, reduced motion and off-screen pause.
- **Revisit trigger:** only if the chart's feature list grows (stacked panes,
  brush-to-zoom, exported PNG), and then with `uPlot`, which keeps the current performance
  profile. `chartjs-plugin-streaming` (last release 2020), ECharts (~1MB, look) and
  commercial libraries are out regardless.
- **Priority:** P1 within the pass. **Status:** DONE (no change; decision recorded).
  `check-premium.mjs` fails the build if `chart.js`, `react-chartjs-2`, `echarts` or
  `echarts-for-react` is added.

### Considered and rejected in this pass

| Idea | Why not (short) |
|---|---|
| Lenis smooth scroll | Brief forbids scroll hijacking; a precision-instrument brand wants exact native scroll; never-sleeping rAF loop. `check-premium.mjs` fails on `lenis`. |
| WebGPU renderer now | R3F 9 does not fully support it; 27 boxes gain nothing; would add a WebGL2 fallback path. |
| GSAP / ScrollTrigger | Motion covers every interaction; no pinned sequence is designed; a second engine is dead weight. `check-premium.mjs` fails on `gsap`. |
| Postprocessing (bloom / DoF / chromatic aberration) | Directly against "not a flashy marketing site". `check-premium.mjs` fails on `@react-three/postprocessing`. |
| Particle field / shader background | Named-banned in the brief; the hero is product-led. |
| Motion+ (paid) | `AnimatedNumber` already exists; the rest are marketing-site components. |
| Global page transitions | Latency and motion where none aids the user; only locale + docs-sequential benefit. |

---

## i18n boundary (what a `/sv` visitor sees today)

**Swedish:** metadata, navigation, footer, hero, feature blocks, protocol stack, ECU topology,
privacy, open-source, vehicle compatibility and the platform explorer, hardware chain, download
panel, safety section, homepage FAQ, closing CTA, every page header, the session walkthrough shell
and report, the command palette, and the docs chrome (sidebar, search, TOC, prev/next).

**English within `/sv` (known, tracked):** the Full Vehicle Scan simulator and the Live Telemetry
chart (AUDIT F1/F2 - fix in progress), the connection-diagram popover content (F3 - fix in
progress), three session Connect-stage state words (F4), doc article bodies (P1-6, notice shown
in-page), per-vehicle engineering notes and research bullets (P1-5), live-channel names and
representative DTC text (P1-7, by design), interior-page explanatory prose (P1-8), and protocol
identifiers (`DoIP`, `UDS`, `BECM`, `0x...`, `ISO 13400/14229`, `RJ45`, `OBD-II`, `ENET`), which
are never translated by design.

---

## Verification

- `scripts/check-interactions.mjs` (G16): interaction components exist and are wired; no hex in
  Battery Health.
- `scripts/check-i18n.mjs` (G19): both locales resolve, switcher preserves the page, protocol
  identifiers survive verbatim, sample homepage keys differ from English, key parity 445/445.
- `scripts/check-i18n-consume.mjs` (G23, to be added): every Swedish namespace is consumed by a
  component - catches F1/F2-class holes that key parity misses.
- `scripts/check-docs.mjs` (G20): 3-pane layout, keyboard command search, on-this-page nav, MDX
  data components exercised.
- `scripts/check-license-consistency.mjs` (G25, to be added): no `MIT` literal or repo-`LICENSE`
  link on the site.
- G14, G18, G21, G22, G26, G27 are manual browser checks recorded in `GATES.md` and
  `DELIVERY-GATE.md`.
