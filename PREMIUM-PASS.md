# Premium and Motion Pass: research and plan

A fourth-pass research note on making the openCMA site feel more premium: better
motion, better 3D, current libraries. Written against the tree at `5ad9178`.

The short version: the foundation is already good. The gap is **craft and
calibration**, not more effects, and not more libraries. The 2026 platform has
also moved enough that some of what the site does in JavaScript can move to the
compositor for free. This note is the case for each change, and the case against
the ones that look tempting but are wrong for this brand.

---

## 1. The bar

The brief's target is "high-end automotive engineering software presented with
Apple / Polestar-level interaction restraint", and "do not turn it into a flashy
marketing site". The 2026 award-site writing lands in the same place: restraint
reads as premium, loud micro-animation reads as cheap. So "more premium" here
means:

- **Precision.** Motion that starts and stops cleanly, on a shared curve, with no
  drift or overshoot where overshoot is not meaningful.
- **Materiality.** Surfaces that look considered: real light, real shadow
  contact, real depth, without a single postprocessing gimmick.
- **One moment.** A single orchestrated entrance, then the page is calm and
  responds only to the pointer and keyboard.
- **Weightlessness.** Nothing janks, nothing blocks the main thread, the 3D and
  the chart cost nothing when they are not on screen.

Anything that fails those tests is not premium here even if it wins an award
somewhere else.

---

## 2. Where the site already is

Worth stating plainly so the pass targets the real gaps:

| Concern | State |
|---|---|
| Motion system | `motion` 13.2.0 (current). Shared `DUR` / `EASE` / `SPRING` tokens mirrored to CSS custom properties. No per-component timing. |
| Reduced motion | Honoured everywhere: a global `@media (prefers-reduced-motion: reduce)` clamp plus per-component `useReducedMotion` branches. |
| Reveal-on-scroll | `Reveal` keeps opacity at 1 (content readable even if JS never runs) and only rises 14px. Correct, but it is the generic per-section fade-and-rise the design guidance calls a tell. |
| Hero | Pointer parallax (max 1.5 deg, off for touch and reduced motion), one load sequence, `AnimatePresence` tab swap. Good. |
| Live telemetry | Hand-rolled `<canvas>` 2D on `requestAnimationFrame`, deterministic drive-cycle signal, loop stops off screen / tab-hidden / paused / reduced-motion. This is already the uPlot philosophy: no library, no per-frame React. |
| 3D battery | R3F 9.7 / three r185, lazy + WebGL-gated + 2D fallback, `frameloop="demand"` when off screen. Geometry and interaction are right. **Lighting and material are prototype-grade:** `ambientLight` + two `directionalLight`s, flat `meshStandardMaterial`, one `ContactShadows`. No environment, no AO, no soft shadow. This is the biggest single visual gap. |
| Numbers | `tnum` tabular figures; `AnimatedNumber` interpolates on discrete changes (scan totals, report), not per frame. |
| Page / view transitions | None. Locale switch, docs navigation and the session stages are plain swaps or `AnimatePresence`. |

---

## 3. Package landscape, September 2026

| Area | Site now | Latest / notable | Verdict |
|---|---|---|---|
| React animation | `motion` 13.2.0 | `motion` 13.x is current; hardware-accelerated `backgroundColor`, better React 19 strict-mode guarding, `AnimateNumber` in the paid Motion+ | **Stay.** Already current. Do not buy Motion+ for one number component we already have. |
| 3D | `three` r185, `@react-three/fiber` 9.7, `@react-three/drei` 10.7 | three **r182+ makes `WebGPURenderer` the recommended renderer**; TSL compiles to WGSL + GLSL. R3F 9 takes an async `gl` prop but **does not fully support the WebGPU renderer yet** (Poimandres in progress) | **Stay on WebGL2.** Watch WebGPU; do not adopt for R3F until it is first-class. Our scene is 27 lightly shaded boxes; WebGPU buys nothing here today and adds a fallback path. |
| 3D helpers | drei 10.7 | `Environment`, `Lightformer`, `AccumulativeShadows`, `MeshTransmissionMaterial`, `ContactShadows` all current in drei 10 | **Use more of what we already depend on.** See 4.1. |
| Postprocessing | none | `@react-three/postprocessing` (N8AO, bloom, DoF, chromatic aberration) | **Do not add.** Bloom and chromatic aberration on a diagnostic tool are the opposite of the brief. N8AO (ambient occlusion) is the only tasteful option and even that is marginal at this fidelity, see 4.1. |
| Charting | hand-rolled canvas | `uPlot` (10% CPU / 12MB RAM for 3.6k pts at 60fps vs Chart.js 40% / 77MB, ECharts 70% / 85MB). `Chart.js` 5 is "the default for small dashboards". `ECharts` for "many chart types / product dashboards". | **Do not adopt Chart.js or ECharts.** Both are heavier, and their default look is rounded-marketing, not instrument. If the telemetry strip needs real axes / legend / tooltip plumbing, move it to **uPlot**, which keeps our current performance profile and matches the aesthetic. Otherwise keep the hand-rolled canvas. See 4.3. |
| Smooth scroll | native | `Lenis` is the 2026 "premium scroll" standard (with GSAP + three) | **Reject.** The brief forbids scroll hijacking; the brand is precision instrumentation, where exact native scroll *is* the aesthetic. Lenis adds JS, a rAF loop that never sleeps, and a scroll model assistive tech and power users do not expect. See 5. |
| Scroll-linked motion | `motion` `useInView` per block | **CSS scroll-driven animations** (`animation-timeline: view()`): 90%+ browser support in 2026, compositor-run, zero JS | **Adopt for `Reveal`.** See 4.2. |
| Page transitions | none | **View Transitions API** via React 19.2 `unstable_ViewTransition` + Next 16 `experimental.viewTransition`: cross-browser now, zero JS, compositor. One production report: -38KB JS, -320ms LCP replacing framer-motion with native. | **Adopt, narrowly.** Locale switch and docs prev/next only. See 4.4. |
| GSAP / ScrollTrigger | none | still the tool for timeline-orchestrated pinned sequences | **Reject** unless a specific pinned architecture walkthrough is designed. Motion covers everything the site does; a second animation engine is not worth the weight. |

---

## 4. What to actually do

Ranked. Each is scoped so it cannot become decoration.

### 4.1 (P0) Make the 3D battery look like a product render, not a prototype

The single highest-leverage change. Same geometry, same interaction, real light.

- **`<Environment>` with inline `<Lightformer>`s** instead of `ambientLight` +
  `directionalLight`. Two or three soft rectangular lformers (a key, a fill, a
  low rim) give the modules a gradient across each face and a specular edge, the
  thing that reads as "photographed in a studio". No HDRI file to ship;
  Lightformers are geometry in the scene. `Environment` runs a tiny offscreen
  cube camera once, not per frame.
- **Refine the material.** Keep `meshStandardMaterial` or move to
  `meshPhysicalMaterial` for a faint `clearcoat` (0.3-0.5) and `clearcoatRoughness`.
  Nudge `envMapIntensity` so the Lightformers actually show. The current
  `roughness: 0.72, metalness: 0.05` is close; the missing part is something for
  it to reflect.
- **Ground it.** Keep `ContactShadows` but tune `blur` / `opacity` / `resolution`
  so the contact is soft, not a hard smudge. Optionally add **N8AO** at low
  intensity for occlusion in the gaps between modules; evaluate whether it is
  visible at this scale before keeping it (it may not be worth the effect pass).
- **Selection.** The lifted module should cast a slightly longer contact shadow
  and pick up a touch more key light, not just change colour. The spring is
  already there; give it something physical to do.
- **Restraint check:** no bloom, no DoF, no chromatic aberration, no vignette.
  `dpr={[1, 1.6]}` and `powerPreference: "low-power"` stay. The whole point is it
  looks expensive while costing almost nothing.

Risk: low. Everything here is already in `@react-three/drei`. The 2D fallback and
the off-screen `frameloop="demand"` are unchanged.

### 4.2 (P0) Move `Reveal` to CSS scroll-driven animation

`Reveal` currently mounts a `motion` component per block and runs a JS
`useInView`. In 2026 this is a `@supports (animation-timeline: view())` one-liner
that runs on the compositor with zero JavaScript, and degrades to "just visible"
where unsupported or where reduced motion is set.

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 40%;
    }
  }
}
@keyframes reveal-rise { from { opacity: .001; transform: translateY(14px); } to { opacity: 1; transform: none; } }
```

Keep a `motion` fallback only if we still support a browser without
`animation-timeline` at a level that matters. This removes ~16 client components'
worth of scroll observers and makes the reveal feel tied to the scroll rather
than triggered by it. Opacity still resolves to 1 with no CSS support, so the
"readable if nothing runs" guarantee holds.

### 4.3 (P1) Decide the telemetry chart deliberately: keep canvas, or uPlot

Do **not** reach for Chart.js. The hand-rolled canvas is the right architecture
and the benchmarks back it (uPlot-class CPU and memory, which Chart.js and
ECharts are 4-7x above). Two honest options:

1. **Keep the hand-rolled canvas.** It works, it is the lightest possible thing,
   and it already handles the window, the crosshair, multi-series, reduced
   motion and off-screen pause. Spend the effort on 4.1 instead.
2. **Adopt `uPlot`** if we want real axis ticks and labels, a legend, and
   pointer tooltips without hand-maintaining them, *and* we are willing to own a
   small dependency and its imperative API inside a `useEffect`. uPlot keeps the
   current performance profile. It is the only charting library that fits both
   the perf budget and the instrument aesthetic.

Recommendation: **option 1 for now.** Revisit uPlot only if the chart's feature
list grows (multiple stacked panes, brush-to-zoom, exported PNG).

Not in scope regardless: `chartjs-plugin-streaming` (last real release 2020),
ECharts (weight + look), SciChart / commercial (licensing, and overkill for a
6-channel 30-second window).

### 4.4 (P1) Native view transitions for locale switch and docs navigation

Enable `experimental.viewTransition` in `next.config.ts` and wrap exactly two
flows:

- **Locale switch.** Today `LocaleSwitcher` calls `router.replace`. A crossfade
  (or a very short slide keyed to reading direction) makes the language change
  feel like a setting, not a reload. Give the `<main>` a `view-transition-name`
  so only the content region animates; the header stays put.
- **Docs prev / next.** A directional slide keyed to `transitionTypes` so
  "next" moves left and "previous" moves right. This is the one place a page
  transition genuinely aids orientation.

Do **not** blanket-wrap every navigation. Home, features, vehicles, download etc.
should still be instant. Reduced motion must fall back to an instant swap
(`@media (prefers-reduced-motion) { ::view-transition-group(*) { animation: none } }`).

Keep it behind the experimental flag consciously; document that we accept the
flag in exchange for zero animation JS on these flows.

### 4.5 (P1) One orchestrated hero sequence, and calm everywhere else

The hero already has a load sequence. Tighten it into a single deliberate
beat: eyebrow, then headline, then the sub and CTAs, then the interface panel
settling in, on staggered delays off the shared `EASE.out`, total under ~900ms,
skipped entirely under reduced motion. Then nothing else on the page animates on
scroll except 4.2's reveal. Audit for and remove any second "attention" motion
(a marquee, a second parallax, a looping accent) if one has crept in.

### 4.6 (P2) Micro-interaction polish, measured

- **Press physics.** A consistent `scale: 0.98` / `translateY(1px)` on `:active`
  for buttons and toggles (`@media (hover: hover)` so it does not fire on tap
  ghosting). Cheap, tactile, brand-appropriate.
- **Focus choreography.** The `focus-visible` ring should animate in on the
  shared fast curve, not snap. One transition, defined once.
- **Number transitions on selection.** When a battery module or ECU is selected,
  the values in the detail panel should count to their new figure with
  `AnimatedNumber` (already built) rather than swap. Extend its use to the
  matrix detail panel and the platform capability panel. Keep it off for
  anything that changes more than about twice a second.
- **Pointer-follow on the connection diagram packet.** The request/response dot
  already animates along the rail; make its easing match a real signal (quick
  out, settle in) rather than `easeInOut`.

### 4.7 (P2) Variable-font weight on the wordmark and section headings

If the display face is variable, a 20-30ms weight settle (e.g. 560 -> 600) as a
heading enters view, via 4.2's scroll timeline, adds a hint of craft that is
almost subliminal. Skip if the face is not variable; do not add a font to get it.

---

## 5. Considered and rejected

| Idea | Why it is tempting | Why not here |
|---|---|---|
| **Lenis smooth scroll** | The 2026 "premium" default; momentum feels designed | Adds a never-sleeping rAF loop and a non-native scroll model; fights the brief's "native scrolling must remain intact"; precision-instrument brand wants exact scroll. A rejected default, not an oversight. |
| **Chart.js / ECharts** | "Just use a chart library"; batteries included | 4-7x the CPU and memory of the current canvas; default visual language is rounded-marketing; ECharts is ~1MB. The hand-rolled canvas already is the lightweight option. |
| **WebGPU renderer now** | three r182 makes it the recommended renderer | R3F 9 does not fully support it yet; our scene gains nothing at 27 boxes; it would add a WebGL2 fallback path we do not need. Revisit when R3F ships first-class support. |
| **GSAP + ScrollTrigger** | Timeline orchestration, pinned scroll sequences | Motion covers every interaction the site has; no pinned sequence is designed; a second animation engine is dead weight. Only reconsider if an exploded-architecture walkthrough is actually specced. |
| **Postprocessing bloom / DoF / chromatic aberration** | Instant "expensive 3D" look | Directly against "not a flashy marketing site"; makes an engineering tool look like a game menu. N8AO is the only defensible effect and is marginal here. |
| **Particle field / shader background** | Awwwards-standard hero | The brief bans decorative particles and glowing blobs by name. The hero is product-led. |
| **Motion+ (paid)** | `AnimateNumber`, cursor, ticker components | We already have `AnimatedNumber`; the rest are marketing-site components. Not worth a licence. |
| **Page transitions on every route** | Cohesive "app-like" feel | Adds latency and motion where none aids the user; only locale and docs-sequential navigation benefit. |

---

## 6. Rollout

Order by leverage and independence:

1. **4.1** 3D material and lighting. Self-contained, biggest visible lift, no new
   dependency. One component, one afternoon, screenshot before/after.
2. **4.2** `Reveal` to CSS scroll-driven animation. Removes code, improves feel,
   needs a `@supports` + reduced-motion guard and a quick cross-browser check.
3. **4.5** Hero sequence tightening + calm audit. Copy/timing only.
4. **4.4** View transitions for locale + docs, behind the experimental flag.
   Needs the reduced-motion fallback and a note in the delivery gate that we
   accept the flag.
5. **4.6 / 4.7** Micro-polish. Small, do last, each one independently revertible.
6. **4.3** Revisit only if the chart's requirements grow. No change otherwise.

Every step keeps the reduced-motion path, the 2D / no-WebGL fallback, and the
off-screen pause. Nothing here adds a library except, conditionally, uPlot in
4.3, and that only if the chart's scope expands.

## 7. Verification additions

- `scripts/check-motion.mjs`: also assert the CSS reveal is guarded by both
  `@supports (animation-timeline: view())` and `prefers-reduced-motion`.
- New `scripts/check-premium.mjs`: fail on `@react-three/postprocessing`,
  `lenis`, `gsap`, `chart.js`, `echarts` in `package.json` (they are rejected by
  decision, not by accident); assert `<Environment` and a soft-shadow helper are
  present in the 3D battery; assert `next.config.ts` view-transition scope is
  limited (no global page-transition wrapper).
- Delivery gate: a line recording that `experimental.viewTransition` is on by
  choice, scoped to two flows.
