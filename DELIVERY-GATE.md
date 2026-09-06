# antislop Delivery Gate: openCMA website

Mode 1 (during the build). Every line is PASS with concrete evidence, or N/A with a
reason. Static evidence is a `scripts/check-*.mjs` run; visual evidence is the browser
QA recorded in `GATES.md` (G14).

## Group 1: Hard Gate (absolute)

| Rule | Item | Verdict | Evidence |
| --- | --- | --- | --- |
| R-02 | No em dash (`—`) in UI copy or committed `.md` | PASS | `scripts/check-antislop.mjs` scans `src/**` and root `.md`; commas / colons / parentheses only. `AGENTS.md` is Next.js-generated and exempt. |
| R-03 | No fabricated statistics or metrics | PASS | GitHub stars / forks / release come from the API with a null fallback (`scripts/check-github.mjs`); no hard-coded counts. Diagnostic figures are labelled "Simulated session" / "Representative session" / fixed sample data. |
| R-05 | No fake testimonials, no invented trust badges | PASS | None on the site. No "trusted by", no logo wall, no review blocks. |
| R-09 | Every interactive element works | PASS | Connection nodes, ECU topology, platform explorer, 108-grid, scan simulator, session timeline, docs search and TOC, theme and locale toggles all act. No `href="#"`. `scripts/check-interactions.mjs`, `scripts/check-routes.mjs`. |
| R-17 | Real states: empty, loading, error | PASS | GitHub panel has a null/unavailable state; download panel has a "could not load from GitHub" line; docs search has a no-results state; 3D view has a checking / unavailable state. |
| R-18 | Keyboard reachable, visible focus | PASS | Skip link to `#main-content`; grid arrow-key navigation; `aria-current` on nav and stage; focus-visible rings. Confirmed in browser QA (G14). |
| R-23..R-28 | No dark-pattern copy, no forced urgency, honest CTAs | PASS | Primary CTA is "Download openCMA"; it never auto-starts a download. No countdowns, no "only today". |
| R-32..R-38 | No impersonation; independence stated; licensing honest | PASS | Footer and `/about` state openCMA is independent and not affiliated with Volvo Cars, Polestar or Geely. Licensing is "source-available, for private use", never "open source" in the OSI sense (`content/docs/license.mdx`, `scripts/check-content.mjs`). |

## Group 2: Purpose-Gate (technique needs a written reason)

| Rule | Technique | Purpose | Evidence |
| --- | --- | --- | --- |
| R-07 | Motion | Reveal information, show system state, indicate interactivity. Section reveals keep opacity 1 if animation never runs; scan and telemetry motion communicate a diagnostic process. | `scripts/check-motion.mjs` (16/16 motion components gate on `prefers-reduced-motion`; no raw scroll listeners). |
| R-11 | 3D (React Three Fiber) | Spatial understanding of a 27-module pack: rotate, hover, isolate, switch voltage / temperature. Not decorative. | `BatteryPack3D.tsx`; lazy, WebGL-gated, 2D fallback, render loop paused when idle. |
| R-12 | Mono type for data labels | Instrument-panel convention; used for values and identifiers, not body copy. | Consistent across panels; body copy is the sans face. |
| R-14 | Hairline borders / low radius | Engineering-instrument look chosen in the brief. | One radius scale; borders group data, they do not decorate. |
| R-19 | Command palette | Fast navigation for a keyboard-first audience (developers). | `CommandPalette.tsx`, `DocsSearch.tsx`. |
| R-31 | Code comments | Kept only where they explain a non-obvious reason (protocol detail, why a value is not scaled from one field, render-loop gating). | `antislop-code` checklist applied; no decorative banners, no line-by-line narration. |

## Group 3: Quality Locks (consistency)

| Rule | Item | Verdict | Evidence |
| --- | --- | --- | --- |
| R-01 | One accent colour, locked | PASS | `--accent` only; status colours are semantic (ok / warning / error / info), not a second brand accent. |
| R-04 | One type system | PASS | Inter + IBM Plex Mono, two roles, no third family. |
| R-06 | One corner-radius scale | PASS | Tokens in `globals.css`; no pill buttons in a square layout. |
| R-10 | Sections exist because the content needs them | PASS | Each homepage section maps to a product capability (`scripts/check-homepage.mjs`, 13 sections). No template filler. |
| R-15 | Contrast AA both themes | PASS | Tokens verified >= 4.5:1 for body, >= 3:1 for large text, light and dark. Browser QA (G14). |
| R-16 | No horizontal overflow, mobile intact | PASS | `min-w-0` on grid/flex children, `overflow-x-auto` wrappers on wide tables and the matrix. Browser QA at 375 / 430 / 768 / 1024 / 1440 / 1920 (G14). |
| R-37 | Direction is real, not "draft without direction" | PASS | Scandinavian / instrument direction is set by the brief and followed; dials are not at 1/1/1. |

## Phase 2 and 3 addendum

| Item | Verdict | Evidence |
| --- | --- | --- |
| Battery Health carries no hex identifier in the primary view | PASS | `scripts/check-interactions.mjs` fails on any `0x..` in `BatteryHealthPanel.tsx`; provenance chain + docs link replace it. |
| Interactive visualisations work by mouse, keyboard and touch | PASS | Grid `role="grid"` + arrow keys; scan rows clickable mid-run; session timeline arrow-key navigable; mobile module lists for touch. Browser QA (G18). |
| Representative session never presents as a live connection | PASS | "Representative session, simulated vehicle" label on the walkthrough; report tagged "Example report"; downloads are user-clicked. |
| 3D view degrades and pauses | PASS | `BatteryPackView.tsx` renders the canvas only when WebGL is present, reduced motion is off, and the section is in view; `frameloop="demand"` otherwise. |
| English and Swedish both resolve; identifiers not localised | PASS | `scripts/check-i18n.mjs`: both locales build statically, switcher preserves the path, protocol tokens appear verbatim in `sv.json`, sample homepage keys differ from English. i18n boundary documented in `INTERACTION-UPGRADE-PLAN.md`. |
| Docs read like a modern wiki | PASS | `scripts/check-docs.mjs`: three-pane layout, Cmd/Ctrl-K search over an index, on-this-page rail, `Callout` / `SpecList` components used in `.mdx`, copy buttons on code. |
| Licensing language is consistent | PASS | "Source-available, for private use" everywhere; `scripts/check-content.mjs` checks the phrase in `en.json`, `sv.json` and the license doc, and fails on "open source" used as a licence claim. |

## Result

All Delivery Gate items PASS. Manual browser gates (G14, G15, G18, G21, G22) are tracked
in `GATES.md` and carry their own evidence lines.
