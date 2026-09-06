# openCMA Website: Interaction, Motion, 3D, i18n and Docs Upgrade Plan

Tracks the second and third passes over the openCMA site: richer interaction, premium
motion, meaningful clickability, interactive engineering visualisations, a modern docs
experience, English and Swedish, a representative session walkthrough, and a restrained
3D battery view. The visual direction (Scandinavian, instrument-like, restrained) is not
changed.

Status keys: DONE, PARTIAL (shipped with a documented boundary), DEFERRED (not shipped,
rationale given).

## P0: core of the request

| # | Item | Where | Status | Notes |
| --- | --- | --- | --- | --- |
| P0-1 | Remove the hex identifier from Battery Health; replace with a plain-language provenance chain | `BatteryHealthPanel.tsx` | DONE | Panel carries no `0x...` token. Engineering level shows Reported by / Read via / Decoded against / Refresh, and links to the identifier reference in the docs. |
| P0-2 | Battery Health hover reveals per-module values | `BatteryMatrixSection.tsx`, `BatteryPack3D.tsx` | DONE | Hover/focus a potential: instrument tooltip with voltage, delta, temperature; row and column emphasise, the rest dims. |
| P0-3 | Full vehicle scan: each ECU appears with code, description and status, not a flat list | `ScanSimulator.tsx`, `scan-sim.ts` | DONE | Deterministic rAF clock, staged discovery with timing variation, faults expand with status classification, labelled "Simulated session". |
| P0-4 | Live telemetry: a graph that actually runs | `LiveTelemetryChart.tsx`, `telemetry-sim.ts` | DONE | Canvas render loop, seeded drive-cycle signal, 30 s window, metric toggles, decoupled from React state, paused off screen / tab hidden / reduced motion. |
| P0-5 | 108 potentials, one battery: pressing parts of the table shows different values | `BatteryMatrixSection.tsx` | DONE | `role="grid"`, arrow-key navigation, Enter selects, Escape clears, row / column / cell headers all selectable, mobile module list. |
| P0-6 | Click through a representative session | `SessionSimulator.tsx`, `session-sim.ts` | DONE | 7 stages Connect to Report, navigable by button, stage click and arrow keys, `aria-current="step"`, "Representative session, simulated vehicle" label, Replay. |
| P0-7 | SPA hybrids, SEA and SPA2 (Zeekr) as WIP | `vehicles.ts`, `PlatformExplorer.tsx` | DONE | SPA plug-in hybrids added; SEA (incl. Zeekr) and SPA2 present as Research / under verification. No invented completion figures; sub-designations shown as "under verification". |
| P0-8 | Modern docs / wiki | `docs/layout.tsx`, `DocsSearch.tsx`, `DocsSidebar.tsx`, `TableOfContents.tsx` | DONE | Three-pane layout, Cmd/Ctrl-K command search over a built index, per-page on-this-page rail, `Callout` and `SpecList` MDX components, copy buttons on code. |
| P0-9 | State it is for private use | `content/docs/license.mdx`, footer, hero principles, CTA, `site.ts` | DONE | "Source-available, for private use" in the hero, footer disclaimer, closing CTA, and a dedicated license doc. Not described as OSI open source anywhere. |
| P0-10 | Swedish (multi-language) | `i18n/*`, `messages/{en,sv}.json`, `middleware.ts`, `[locale]/*` | PARTIAL | `/en` and `/sv` both build statically; switcher preserves the page; protocol identifiers never localised. The homepage journey, navigation, footer, page headers, docs chrome, session walkthrough and FAQ are translated. Boundary below. |
| P0-11 | Everything clickable | site-wide | DONE | Connection nodes, ECU topology, platform explorer, battery grid, scan rows, session timeline, docs search and TOC are all interactive. No `href="#"` or dead controls; nav links resolve to real routes. |

## P1: depth and polish

| # | Item | Where | Status | Notes |
| --- | --- | --- | --- | --- |
| P1-1 | Optional 3D battery pack | `BatteryPack3D.tsx`, `BatteryPackView.tsx` | DONE | React Three Fiber, lazy via `next/dynamic({ ssr: false })`, WebGL2 check with a 2D-matrix fallback note, render loop `demand` under reduced motion, `low-power` GPU hint, no post-processing. |
| P1-2 | Shared motion tokens, not per-component timing | `lib/motion.ts`, `globals.css` | DONE | `DUR`, `EASE`, `SPRING` in TS; `--motion-*` and `--ease-*` in CSS. |
| P1-3 | Command palette (site-wide) | `CommandPalette.tsx` | DONE | `cmdk`, Cmd/Ctrl-K, routes and doc entries. |
| P1-4 | Micro-interactions: tap feedback, active nav underline, disclosure motion | Header, buttons, `Disclosure` | DONE | `layoutId` nav underline (skipped under reduced motion), press states, `AnimatePresence` on expanders. |
| P1-5 | Swedish coverage of the vehicle-support data model | `vehicles.ts` status notes, capability labels, per-vehicle notes | PARTIAL | Status labels, status notes, capability labels, capability status and platform blurbs are translated. Per-vehicle engineering notes and research bullet text remain English. Rationale: dense per-car protocol notes that need a domain reviewer; they sit inside a drill-down, not the homepage spine. |
| P1-6 | Swedish docs article bodies | `content/docs/*.mdx` | DEFERRED | Long-form protocol documentation. The doc chrome (nav, search, TOC, prev/next) is translated and each article shows an "available in English" notice under `/sv`. Translating the bodies well is a separate editorial pass. |
| P1-7 | Swedish for the deepest instrument sub-labels | `views.tsx` `liveChannels`, `demo-data.ts` DTC state text | PARTIAL | Field labels in the reused diagnostic views are translated; the live-channel names and representative DTC descriptions stay in English (they mirror how the vehicle reports them). |
| P1-8 | Swedish for interior-page explanatory prose | `src/app/[locale]/{features/*,download,safety,privacy,about}/page.tsx` `<Prose>` bodies | DEFERRED | Every interior page's header, navigation and interactive components (battery panel and matrix, scan simulator, telemetry chart, platform and ECU explorers, download panel) are translated; the homepage narrative is fully Swedish. The remaining ~70 short prose fragments across 8 pages are secondary explanatory copy and are handled in the dedicated Swedish review pass rather than machine-drafted here. |

## P2: considered and not done

| # | Item | Status | Rationale |
| --- | --- | --- | --- |
| P2-1 | GSAP + ScrollTrigger pinned architecture walkthrough | DEFERRED | Motion library covers every interaction here. A scroll-pinned sequence risks hijacking native scroll, which the brief forbids. Revisit only if a genuine timeline-orchestrated reveal is needed. |
| P2-2 | WebGPU renderer for the 3D pack | DEFERRED | WebGL2 path is enough for 27 lightly shaded boxes. WebGPU would add a code path and a fallback matrix for no visible gain at this fidelity. |
| P2-3 | Apache ECharts for the live graph | DEFERRED | The hand-written canvas loop is smaller, has no dependency, and already gives deterministic replay, a moving window, metric toggles and reduced-motion handling. ECharts would be heavier for the same result. |
| P2-4 | Locale-aware number and date formatting in demos | DEFERRED | Demo values are fixed sample data with SI units. `next-intl` formatters are available if real localisation of figures is wanted later. |
| P2-5 | More than two languages | DEFERRED | Routing (`localePrefix: "always"`, `hasLocale` guard, `generateStaticParams`) already generalises; adding a locale is a new `messages/<x>.json` plus a `routing.locales` entry. |

## i18n boundary (what a `/sv` visitor sees)

Swedish: metadata, navigation, footer, hero, connection diagram, feature blocks,
protocol stack, ECU topology, privacy, open-source, vehicle compatibility and the
platform explorer chrome, hardware chain, download panel, safety section, homepage FAQ,
closing CTA, every page header, the session walkthrough shell and report, the command
palette, and the docs chrome.

English within `/sv`: doc article bodies (flagged in-page), per-vehicle engineering
notes, live-channel names, representative DTC description text, and protocol identifiers
(`DoIP`, `UDS`, `BECM`, `0x...`, `ISO 13400/14229`, `RJ45`, `OBD-II`, `ENET`), which are
never translated by design.

## Verification

- `scripts/check-interactions.mjs` (G16): interaction components exist and are wired; no hex in Battery Health.
- `scripts/check-i18n.mjs` (G19): both locales resolve, switcher preserves the page, protocol identifiers survive verbatim, sample homepage keys differ from English.
- `scripts/check-docs.mjs` (G20): three-pane layout, keyboard command search, on-this-page nav, MDX data components exercised.
- G18, G21, G22 are manual browser checks recorded in `GATES.md`.
