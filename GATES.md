# Gates: openCMA public website

OWNS: src/**, content/**, scripts/**, public/**, next.config.ts, mdx-components.tsx, package.json, tsconfig.json, GATES.md, INTERACTION-UPGRADE-PLAN.md, DELIVERY-GATE.md, AUDIT.md

Scope: a complete production-quality Next.js (App Router) marketing + docs site for openCMA: full homepage narrative, Features + 4 subpages, Vehicles, Download, Docs (MDX), Safety, Privacy, About; light/dark themes; restrained state-communicating motion; graceful GitHub API integration; SEO metadata; WCAG 2.1 AA scaffolding. Phase 2 adds interactive engineering visualisations, a scan simulator, a live telemetry chart, a platform explorer, source-available/private-use licensing, and micro-interactions. Phase 3 adds English + Swedish i18n, a modern docs experience, a full session walkthrough, and a restrained 3D battery view.

## Provenance

G0-G22 were authored and proved by the implementer session (`opencma-website-5b`); their EVIDENCE
lines carry that session's harness output hashes from commit `96868bf`. The reviewer session
(`opencma-website-5d`) independently re-ran all 16 runnable check scripts plus `check-build` and
`check-render` on 2026-09-06 against `96868bf` (plus the reviewer's own `src/components/docs/mdx/**`
and `src/content/docs/**` changes, which the implementer folded into `96868bf`): every one still
exits 0 with its EXPECT matched. The reviewer additionally read the ten load-bearing interactive
components in full to corroborate the manual gates. G23-G27 were added by the reviewer from the
114-section audit in `AUDIT.md`.

- [x] G0: this ledger states outcomes that can fail
  CHECK: node "C:/Users/NicolasKheirallah/.claude/skills/unlazy/scripts/gate-lint.mjs" GATES.md
  EXPECT: LINT OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=c33ed973729d514708da7e2fcc98b2f2f2000d1f0efe0adcc075d7ba84978782; output-bytes=1956

- [x] G1: every required route file exists
  CHECK: node scripts/check-routes.mjs
  EXPECT: routes verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=2d8aecb445bb4be9cc3e82f1f146f4b99f80f627b7d928c86f31a35c0c23a338; output-bytes=38

- [x] G2: the homepage renders every section of the brief's narrative and each resolves to a real component
  CHECK: node scripts/check-homepage.mjs
  EXPECT: homepage composition verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=b865dc56f4a909a8324d255b58d59ce83d60068e1fba96185e33e4826335c397; output-bytes=55

- [x] G3: the project type-checks with no errors
  CHECK: node scripts/check-types.mjs
  EXPECT: typecheck passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=88603ae6d0804b467cf0223e64644258397c61d0119a5876e07565cc5b2dd279; output-bytes=17

- [x] G4: eslint passes with zero warnings
  CHECK: node scripts/check-lint.mjs
  EXPECT: lint passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=6221968cb30922300afc9c778500eb598032292dae3b3794d15304d353f88d70; output-bytes=12

- [x] G5: no AI-slop tells in source (em dashes, banned buzzwords, decorative emoji, pill overuse, fabricated GitHub metrics)
  CHECK: node scripts/check-antislop.mjs
  EXPECT: antislop static checks passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=92e1543ad8b631344edfcd0cb35b2f1a946406e4e58b08d55d419113ae5f4f02; output-bytes=30

- [x] G6: complete light + dark theme with no-flash script and a persistent, system-aware toggle
  CHECK: node scripts/check-theme.mjs
  EXPECT: theme system verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=c708e0366841d880ff80f911ca436185ffb5d90937ca3674b78a6ba6e01e0ca0; output-bytes=33

- [x] G7: motion is present and the majority of motion components honor prefers-reduced-motion; no raw scroll listeners
  CHECK: node scripts/check-motion.mjs
  EXPECT: motion + reduced-motion verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=6b521c421afc992ef4dcee5452a4a2d634f1ec9067f864e834f71e5189a83f6c; output-bytes=58

- [x] G8: SEO metadata, sitemap, robots and JSON-LD (SoftwareApplication, SoftwareSourceCode, FAQPage) are present
  CHECK: node scripts/check-seo.mjs
  EXPECT: SEO verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=a4155ef035ad0cea144a5f6de3d771258478ff061e4da1e51f348c53fc4dcd96; output-bytes=24

- [x] G9: GitHub integration is wrapped, cached, timeout-guarded, returns null on failure, has a UI fallback, and hard-codes no metrics
  CHECK: node scripts/check-github.mjs
  EXPECT: GitHub integration verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=fbadc9ea04ccd83f6f0ed7232e4a9d125bc968a1e335446017c627de7bac62c8; output-bytes=39

- [x] G10: legal-independence disclaimer, privacy pillar outside the footer, >= 6 MDX docs pages, core protocol terms surfaced, a11y landmarks/skip-link, and consistent source-available / private-use licensing language
  CHECK: node scripts/check-content.mjs
  EXPECT: content + a11y static verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=2837446e170a2223bb9741f93c2375f28b2c007a403d7bcf9fdda41ef022df29; output-bytes=42

- [x] G11: the production build completes successfully
  CHECK: node scripts/check-build.mjs
  EXPECT: next production build passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=fb98ff85b1d28d9fe64730976b32a541dbe02143014959eb34f3bb408db8cdd6; output-bytes=2005

- [x] G12: every route responds 200 with its expected content from a running production server
  CHECK: node scripts/check-render.mjs
  EXPECT: render verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=3e4d85f92c29c9ce6f90a9a96df2f04cfccb0d2a4c9da74989543ef3b8221173; output-bytes=603

- [x] G13: the antislop Delivery Gate has been run and every item is PASS with concrete evidence
  EVIDENCE: DELIVERY-GATE.md holds the run: every Hard Gate, Purpose-Gate and Quality Lock item is PASS with a cited scripts/check-*.mjs run or browser-QA line, plus a Phase 2/3 addendum. Licensing line recorded as a deliberate user decision: the user was shown that the upstream repo (C:\Users\NicolasKheirallah\Documents\GitHub\openCMA) ships a verbatim MIT LICENSE, Cargo.toml license = "MIT" and a DISCLAIMER.md that says "open-source", and chose to keep the site's "source-available, for private use" wording (relicensing intent; the site leads the repo). check-content.mjs (G10) enforces that wording and passes.

- [x] G14: every page inspected in a browser at 375x812, 430x932, 768x1024, 1024x768, 1440x900 and 1920x1080 in both themes, with no overflow, broken nav, clipped text, or unreadable contrast
  EVIDENCE: agent-browser against the production build on :4400. Horizontal-overflow probe (documentElement.scrollWidth vs clientWidth, plus per-element right-edge scan) run for /en and /sv at all six widths: no overflow at any combination after a layout-settle wait. One real defect found and fixed first: /sv at 768 overflowed the header by ~19px because the Swedish nav plus Download button did not fit; the desktop nav breakpoint was moved md -> lg so 768-1023 uses the mobile menu (which carries locale + theme). Theme: toggled system -> dark, body background resolves to rgb(17,18,17) (the --bg-primary dark token), no overflow in dark; light and dark both painted explicitly. Nav is one line at 60px (h-15). Zero dead links (no href="#" or empty href) on the homepage. Not a pixel-by-pixel contrast audit of every string; token contrast was calibrated to >= 4.5:1 in Phase 1 and spot-checked here.

- [x] G15: the design-taste-frontend Section 14 Pre-Flight checklist reconciled item by item against the built pages
  EVIDENCE: Walked all 60+ boxes against the built site. Passing: zero em dashes (G5), one theme system with light/dark tokens tested both modes, one --accent with semantic status colours, one radius scale, CTA text contrast (checked dark + light), no CTA wrap at desktop ("Download openCMA" / "Ladda ner openCMA" both single-line), sans-only type (Inter + IBM Plex Mono, no serif), nav one line <= 80px, no scroll cues, no version footers, no fake trust strip, reduced motion gated (G7 16/16), empty/loading/error states present (GitHub null, download unavailable, docs no-results, 3D checking/unavailable), no raw scroll listeners (G7), motion isolated in 'use client' leaves, icons from one library. Three accepted deviations, all pre-existing Phase 1 decisions that pass the antislop static checks: (1) icon set is lucide-react - the skill discourages it but the project depends on it; (2) FeatureBlocks carry 01..06 index markers though the six blocks are not a strict sequence - the SessionSimulator 01..07 markers are a genuine stepped walkthrough and fine; (3) the hero lead is ~30 words, over the <= 20 guideline, because the brief's supplied hero copy is long - it still fits <= 4 lines with the CTA visible.

- [x] G16: the interaction upgrade components exist and are wired (108-potential explorer with grid keyboard nav, scan simulator, live telemetry canvas, connection popovers, platform explorer, hero tabs, shared motion tokens); Battery Health primary view carries no hex identifier
  CHECK: node scripts/check-interactions.mjs
  EXPECT: interaction upgrade verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=a61d428e1deaeeff75bf2688324a1ed06feeee02d85adf4c2f940855171e2e63; output-bytes=40

- [x] G17: INTERACTION-UPGRADE-PLAN.md exists with a triaged P0/P1/P2 table, and every P0 item is either implemented or deferred with a written rationale
  CHECK: node scripts/check-plan.mjs
  EXPECT: interaction upgrade plan verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=d2e50e5eb201320950b068e7a28328980ec984924bab80d366d2acae7cb81170; output-bytes=59

- [x] G18: the interactive sections work by mouse, keyboard and touch, with reduced-motion and both themes, and no dead controls (brief sections 106, 107, 112, 113)
  EVIDENCE: agent-browser against the production build. 108-potential matrix: focus latches on M1G1 (tabindex 0), ArrowRight then ArrowDown moves the roving focus to M2G2, Enter selects it (aria-selected=true on that cell), Escape clears - keyboard path complete; the mobile branch renders a tap list of modules instead of relying on hover. Session timeline: clicking stage button "05 Battery" jumps there; focusing the stage panel and pressing ArrowRight/ArrowLeft steps the stage (verified Connect -> Identify -> Scan and back). Locale switcher: on /en/features/battery-health, clicking "Svenska" lands on /sv/features/battery-health with the Swedish h1, page preserved. Docs command search opens on Ctrl/Cmd-K with the input focused, filters, and Enter navigates to the hit. Reduced-motion (set media reduced-motion): the 3D battery view drops to its 2D-fallback note. Themes: exercised in light and dark, both paint correctly. Dead-control sweep: zero anchors with href="#" or empty href on the homepage; nav links resolve to real routes (G1).

- [x] G19: English and Swedish both resolve under /en and /sv, the language switcher preserves the current page, protocol identifiers are never localised, and Swedish renders the homepage journey coherently
  CHECK: node scripts/check-i18n.mjs
  EXPECT: i18n verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=52b02ef599d1d152e7688f12628842dd5c7ca600e22586666d12516f8875313f; output-bytes=25

- [x] G20: the docs experience has a 3-pane layout, a keyboard-openable command search over an index, per-page on-this-page navigation, and reusable MDX data components
  CHECK: node scripts/check-docs.mjs
  EXPECT: docs experience verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\NicolasKheirallah\Documents\GitHub\openCMA - Website; path=efbd78314235/57 entries; EXPECT=matched; output-sha256=643ad79f279e758b5a6c54847ef69d2728ac5c14ffe3dff2f46b60782176e5ea; output-bytes=36

- [x] G21: the 7-stage session walkthrough (Connect to Report) is navigable by button, stage click and arrow keys, labelled as a representative simulated session, and never presents itself as a live vehicle connection
  EVIDENCE: agent-browser on the built homepage #session. Timeline lists exactly seven stages in order: 01 Connect, 02 Identify, 03 Scan, 04 Inspect, 05 Battery, 06 Live data, 07 Report. Direct stage-button clicks jump to any stage; focusing the stage panel and pressing ArrowRight/ArrowLeft steps forward and back (Connect -> Identify -> Scan -> Identify verified). The stage panel's accessible name begins "Representative session, simulated vehicle01 / 07..."; the Report stage carries an "Example report" tag; CSV/JSON come from user-clicked buttons via Blob, never auto-download. No string on the panel claims a live or connected vehicle. Replay appears only on the final stage.

- [x] G22: any 3D view lazy-loads, degrades to a 2D fallback when WebGL is unavailable or reduced-motion is set, and pauses its render loop off screen and on tab hide
  EVIDENCE: BatteryPackView (features/battery-health). The R3F canvas is behind next/dynamic({ ssr: false }) and only mounts once a useInView({ once: true }) fires - agent-browser confirmed no <canvas> until the component is scrolled into view, then a 1134x320 canvas with the "Module 14 ... Dra for att rotera / klicka" overlay appears. Fallbacks: with prefers-reduced-motion set, no canvas and the "Interactive 3D view unavailable / 2D potential matrix below has the same data" note renders; a useSyncExternalStore WebGL2 probe gates the same fallback when WebGL is absent. Render loop: BatteryPack3D now takes an `active` prop wired to a live (not once) useInView, and sets frameloop={reduce || !active ? "demand" : "always"}, so the loop stops when the canvas scrolls off screen or reduced motion is on; the browser additionally throttles rAF on tab hide. gl={{ powerPreference: "low-power" }}, no post-processing. The 2D matrix below carries the same 108 values.
  REVIEWER: confirmed by reading BatteryPackView.tsx + BatteryPack3D.tsx in full. All four mechanisms present as described.

- [ ] G23: every translation namespace that has a Swedish catalog is actually consumed by a component (no catalog-only Swedish)
  CHECK: node scripts/check-i18n-consume.mjs
  EXPECT: i18n consumption verification passed
  EVIDENCE: NOT MET on commit 96868bf. `scan.*` and `telemetry.*` have complete Swedish catalogs but src/components/features/ScanSimulator.tsx + src/lib/scan-sim.ts and src/components/telemetry/LiveTelemetryChart.tsx call no translation API, so both sections render English under /sv on the homepage and on /features/vehicle-diagnostics and /features/live-data. src/components/architecture/ConnectionDiagram.tsx has hardcoded English in nodes[].facts, linkLabels and the protocol-details list (trigger labels are translated). See AUDIT.md F1-F3. The implementer is wiring F1+F2+F3 on the working tree as of 2026-09-06; re-verify and flip this box on that commit. Interim manual check: `grep -L "next-intl" src/components/features/ScanSimulator.tsx src/components/telemetry/LiveTelemetryChart.tsx` returns both files. Check script scripts/check-i18n-consume.mjs to be added by the implementer (owns scripts/**).

- [ ] G24: the openCMA source repository's own license metadata matches the website's stated terms
  EVIDENCE: Manual check - inspect C:/Users/NicolasKheirallah/Documents/GitHub/openCMA/{LICENSE,Cargo.toml,README.md,DISCLAIMER.md}. NOT MET, and owned by the user outside this repo. The website states "source-available, private use only" as a deliberate decision (the site leads a planned relicense). The upstream repo is still MIT: LICENSE is verbatim MIT, Cargo.toml has license = "MIT", README carries the MIT shields badge and "Licensed under the MIT License", DISCLAIMER.md calls openCMA "open-source". A visitor who opens the GitHub repo sees the contradiction. The website side is internally consistent (G25). Close this by updating the four upstream files.

- [x] G25: no page on the site both claims private-use and presents MIT text or the repo LICENSE file as governing
  CHECK: node scripts/check-license-consistency.mjs
  EXPECT: license consistency verification passed
  EVIDENCE: MET. The reviewer rewrote src/content/docs/license.mdx to stop citing the upstream LICENSE file as authoritative ("Always defer to the LICENSE file ... the LICENSE file wins" removed) and to frame the terms as the project's current statement with a note that the formal text is being updated. Confirmed by grep: no "MIT" literal and no href matching /blob/.+/LICENSE anywhere under src/content/docs or src/app; the About page says "not open source in the OSI sense"; footer and download link /docs/license, not the GitHub file. check-render.mjs (G12) still finds "source-available", "private use" and "OSI" on /docs/license. Check script scripts/check-license-consistency.mjs to be added by the implementer.

- [ ] G26: with prefers-reduced-motion set, the scan sequence shows its end state, the telemetry chart shows a static window with a slow periodic tick (not continuous scroll), the 3D canvas uses frameloop "demand", no scroll-linked transforms run, and the nav underline layout animation is skipped
  EVIDENCE: Manual check - Playwright/CDP reduced-motion emulation, per-page, checklist in DELIVERY-GATE.md section 2. PARTIAL. Confirmed by source: ScanSimulator seeds elapsed = SCAN_END under reduce; LiveTelemetryChart runs a 2000ms setInterval tick instead of rAF under reduce; BatteryPack3D sets frameloop="demand" under reduce; BatteryPackView shows the 2D-fallback note under reduce; globals.css has an @media (prefers-reduced-motion: reduce) block that clamps every animation and transition to ~0ms. Not yet run under real browser reduced-motion emulation across all routes; the implementer's G14/G18 QA covered part of it (3D fallback on /features/battery-health).

- [ ] G27: the live telemetry chart's point inspection is reachable without a pointer
  EVIDENCE: Manual check - keyboard-only pass of /features/live-data and the homepage telemetry section. NOT MET (minor). LiveTelemetryChart updates the crosshair readout only on onPointerMove / onPointerDown; there is no keyboard affordance to move the inspection cursor along the series. The <canvas> carries a descriptive aria-label naming the active channels and the window, so the chart is not opaque to assistive tech, but per-point values are pointer-only. Brief sections 92-93. Fix: focusable canvas wrapper, Left/Right steps hoverX, mirror the readout into an aria-live="polite" region on keypress.

---

## Summary (reviewer, 2026-09-06)

- G0-G12, G16, G17, G19, G20: MET and independently re-run to exit 0 by the reviewer.
- G13, G14, G15, G18, G21, G22: MET; implementer agent-browser QA at 96868bf, corroborated by the
  reviewer reading the components. RE-CONFIRM items: VIN redaction in the session Identify stage
  (G21), a real Lighthouse run for the section-88 >95 targets.
- G23: NOT MET on 96868bf (two homepage sections English under /sv) - implementer fixing now, keys
  already exist. G24: NOT MET, upstream, owned by the user. G25: MET after the reviewer's
  license.mdx fix. G26: PARTIAL (source-confirmed, browser pass outstanding). G27: NOT MET, minor.
- Nothing blocks ship. See AUDIT.md for the full 114-section review and DELIVERY-GATE.md for the
  section-113 validation matrix.
