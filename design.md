# Design - Hanterill website

A locked design system for this site. Every page reads this file before emitting
code. Do not regenerate per page - extend or amend this file when the system
needs to grow.

Current direction: **dark-tech instrument panel on Fluent 2 colour**. The
layout, chrome devices, type and motion are the 2026-09-06 instrument-panel
system; on 2026-09-28 the colour and theming were remapped to Microsoft
Fluent 2 (the desktop app shipped the same direction in 0.2.2), replacing the
bronze accent and the warm-ink neutrals. Token names, the dark-base /
light-remap structure and every consumer are unchanged - only the values
moved. Every text / surface pair passes WCAG 2.x (4.5:1 normal text, 3:1
large text and UI) in BOTH themes; the Fluent values were checked with a
contrast script before landing.

## Fluent 2 colour anchors (2026-09-28)

Dark is Fluent's dark theme: page `#292929`, inset bands `#1F1F1F`, cards
`#2C2C2C`, flyouts `#313131`, text `#FFFFFF / #E0E0E0 / #AEAEAE`, hairlines
`#3D3D3D` / `#5C5C5C`. Light is Fluent's light theme: page `#FFFFFF`, inset
bands `#F5F5F5`, text `#242424 / #424242 / #616161`, hairlines `#E0E0E0` /
`#D1D1D1`. Brand is communication blue: `#0F6CBD` (light links and filled
CTAs, white label) and `#479EF5` (dark links and focus, near-black
brand-10 `#061724` label on filled CTAs - the WinUI accent-button pairing).
Accent tint: `#EBF3FC` light, `#082338` dark. Status, lifted for dark text
usage: green `#0E700E` / `#54B054`, amber `#BC5006` / `#F9AE45`, red
`#C50F1F` / `#F1707B` (Fluent's own `#C50F1F` is 2.4:1 on `#292929`), info
blue `#0F6CBD` / `#6CB8F6`. Telemetry series (readable ≥3:1 on both
canvases): `#3D96E8`, `#21A19A`, `#F7630C`. Canvas / 3D scene background and
theme-color meta: `#292929` dark, `#FFFFFF` light. Print keeps a deepened
accent (`#0F548C`) on white paper.

Where this file's older rules conflict with Fluent's published neutrals -
"never pure white" (Fluent light background and dark foreground are
`#FFFFFF`), the warm-hue neutrals (hue 265/85), and the bronze accent - the
Fluent values win as of this amendment. "Never pure black" still holds: no
surface or text in either system ships `#000000`.

## Genre

Dark-tech instrument panel. Deep ink base, precision grotesk display, IBM Plex
Mono for every identifier and number, hairline rules, tick marks, mono channel
legends, bezel frames around the live diagnostic instruments. One desaturated
bronze accent that reads as a warm instrument backlight. No glow, no gradient,
no SaaS gloss. This is not an official design system - it is a web treatment
inspired by oscilloscope and ECU-tool chrome, and `globals.css` says so in its
stamp. Dark is the base; light is a deliberate re-map, not an inversion.

## Macrostructure family

- **Marketing pages** (home, features hub + 4 subpages, vehicles, download):
  **Workbench**. The live instruments (battery matrix, scan simulator, telemetry
  canvas, 3D pack, connection diagram, session walkthrough) are the primary
  content. Each sits in a `.bezel`-framed figure with a short mono channel
  legend ("what you do with it" + the sample-data disclaimer). Marketing prose
  is the minority. The variable archetypes are the hero (split diptych,
  instrument on the right, the measurement grid behind the instrument only) and
  the section head (a serif-free grotesk heading; a mono legend appears only
  where it labels an instrument, never as a decorative eyebrow above prose).
- **Content pages** (about, safety, privacy, license): **Long Document**.
  Continuous prose in a single `--measure` (~68ch) column, grotesk section
  heads, `.rule-ticks` dividers between major parts, no cards, no enrichment.
  Out of scope for the overhaul; inherits tokens + display face only.

## Theme

Values are OKLCH, defined in `src/app/globals.css` under the existing token
names. Dark is the base; light is the re-map. sRGB / hex anchors are given for
canvas / 3D code, which cannot read CSS custom properties.

| Token | Dark (base) | Light (re-map) |
| --- | --- | --- |
| `--bg-primary` | `#292929` Fluent bg1 | `#FFFFFF` |
| `--bg-secondary` | `#1F1F1F` Fluent bg2 (inset) | `#F5F5F5` Fluent bg3 |
| `--surface` | `#2C2C2C` card | `#FFFFFF` |
| `--surface-raised` | `#313131` flyout | `#FFFFFF` |
| `--text-primary` | `#FFFFFF` | `#242424` |
| `--text-secondary` | `#E0E0E0` | `#424242` |
| `--text-muted` | `#AEAEAE` | `#616161` |
| `--line` | `#3D3D3D` hairline | `#E0E0E0` |
| `--line-strong` | `#5C5C5C` bezel | `#D1D1D1` |
| `--accent` | `#479EF5` brand on dark | `#0F6CBD` brand |
| `--accent-hover` | `#62ABF5` | `#115EA3` |
| `--accent-fg` | `#061724` brand-10 label on filled CTA | `#FFFFFF` |
| `--accent-tint` | `#082338` | `#EBF3FC` |

sRGB anchors (canvas / 3D / OG card, which cannot read CSS custom
properties): dark panel `#292929`, text `#f5f5f5`, secondary `#d6d6d6`, line
`#3d3d3d`, brand `#479ef5`; light page `#ffffff`, ink `#242424`, brand
`#0f6cbd`.

Carried rules:

- Never pure black, never pure white. Darkest panel `#12151a`; brightest text
  `#edebe7` (~15:1 on the base panel - AAA without halation).
- Elevation is a lighter surface, never a shadow. The four panel tokens step
  ~3-4 lightness points apart. One shadow exists on the whole site (docs search
  popover); nothing else casts one.
- The accent is desaturated on dark: bronze ships at C 0.085 on ink, deepens to
  C 0.1 on bone, never the reverse. It never glows.
- Dark body copy carries `letter-spacing: 0.011em` and `line-height: 1.65` (set
  once on `body`, dark only). Display type sets its own tracking in `globals.css`.

Accent shows on `<= 5%` of any viewport: the wordmark brackets, one link colour
(active nav + typographic links), the focus ring, one status marker per
instrument, the filled primary CTA, and the selected-module emissive in the 3D
scene. Never a fill behind a whole section, never a gradient.

Status hues (both themes lift lightness in dark; values in the Fluent 2
anchors section above). Tone plus a word, never colour alone. Canvas / 3D
telemetry series: Fluent blue `#3D96E8`, teal `#21A19A`, orange `#F7630C`
(≥3:1 on both canvases); 3D pack scene background is the dark-panel anchor
`#292929`.

## Typography

- **Display**: Geist, weights 400 / 500 / 600 (headings 500). Loaded via
  `next/font/google` as `--font-geist`; `--font-display` resolves to it.
  Tracking is set in `globals.css`: `-0.022em` on `h1`, `-0.019em` on `h2`,
  `-0.017em` on `h3/h4`. A precision grotesk in the instrument-panel register.
  No serif anywhere on the site, ever. No italic display.
- **Body**: Inter, weight 400 / 450 / 500. `--font-sans`. Measure 60-75ch. On
  dark only: `letter-spacing: 0.011em`, `line-height: 1.65`.
- **Mono / identifier**: IBM Plex Mono, weight 400 / 500 / 600. `--font-mono`.
  Carries every number, every protocol identifier (DoIP, UDS, ISO 13400/14229,
  DIDs, DTC codes), the nav link row, instrument channel legends, status
  notices, and the footer meta row. IBM drafting heritage, not a trend pick.
- **Type scale**: six steps plus the display anchor, all in `globals.css` and
  mirrored to Tailwind. Every size on the site resolves to one of these.

  | Token | Value | Used for |
  | --- | --- | --- |
  | `--text-micro` | 11px | mono channel legends, tick labels, table meta |
  | `--text-meta` | 12px | mono row meta, status notices |
  | `--text-ui` | 13px | dense instrument chrome |
  | `--text-body` | 15px | UI body copy, list rows, buttons |
  | `--text-prose` | 17px | long-form prose and leads |
  | `--text-title` | 22px | minor section headings |

- **Type scale anchor**: `--text-display = clamp(2.5rem, 4.5vw + 1rem, 4.25rem)`.
  **Every page `h1` uses it, without exception** - home, interior pages, the
  docs index and articles, and `/network`. Before this the home page h1 capped
  at 2.75rem, interior pages reached 3.75rem, docs sat at 2.25rem and
  `/network` at 1.6rem: four treatments, a 2.4x spread, and `--text-display`
  used nowhere at all. A page that wants a smaller title does not get one; it
  gets a shorter title.
- **Tracking is owned by `globals.css`** for `h1`-`h4` (`-0.022em` / `-0.019em`
  / `-0.017em`). Components do not set their own; a local override is a bug.
  `--track-label` (`0.12em`) is the one value for every uppercase mono label.
  11px is the floor: nothing on the site sets type below it. The network
  explorer's vendored chrome used to carry 9px and 10px labels; those were
  lifted to the floor, not grandfathered.

## Spacing

4-point named scale in `src/app/globals.css`, mirrored to Tailwind `--spacing-*`
in `@theme inline`:

```
--space-3xs .25rem  --space-2xs .5rem  --space-xs .75rem
--space-sm 1rem  --space-md 1.5rem  --space-lg 2rem
--space-xl 3rem  --space-2xl 4.5rem  --space-3xl 7rem  --space-4xl 10rem
```

Section rhythm: `--space-3xl` block padding between major sections on desktop,
`--space-2xl` on mobile. Whitespace is the luxury material - when in doubt, more
air, not more rules. `--measure: 68ch` for prose columns. No raw rem section
paddings; use the named tokens or the Tailwind utilities that map to them.

The `<Section>` primitive in `src/components/ui/layout.tsx` owns that rhythm and
wraps a `Container`. Every page body uses it. It existed unused while twelve
pages retyped the padding on a raw `Container`, and two rhythms had already
grown - marketing at 7rem, every content and feature page at 4.5rem, 36% apart.

## Motion

`MOTION_INTENSITY 5` - motion communicates running state only, nothing decorative.

- Easings: `--ease-standard cubic-bezier(0.2, 0.8, 0.2, 1)`,
  `--ease-out cubic-bezier(0.16, 1, 0.3, 1)`. Mirrored in `src/lib/motion.ts` as
  `EASE.standard` / `EASE.out`. No third curve, no overshoot.
- Durations: `--motion-instant/fast/base/slow/explain` (100 / 160 / 240 / 420 /
  700 ms), mirrored as `DUR.*`. One spring, `SPRING` in `src/lib/motion.ts`, for
  selection / layout movement.
- Reveal: one native `.reveal` (`animation-timeline: view()`), double-guarded by
  `@supports` and `prefers-reduced-motion: no-preference`, base `opacity: 1`.
  Fade + 14px rise. No JS scroll observer, ever. No `window.addEventListener("scroll")`.
- One orchestrated entrance: `.hero-seq` load stagger (70ms step, <= 900ms total),
  skipped entirely under reduced motion.
- Reduced-motion fallback: **two tiers, not one blanket kill.** Colour and
  opacity transitions survive, capped at 200ms - they aid comprehension and
  carry no vestibular risk. Every spatial transition (`transform`, `height`,
  `width`, `top`, `left`) is removed by narrowing `transition-property` to an
  allowlist; loops collapse to their end state. Global CSS is implemented in
  `globals.css`; anything JS-driven (a canvas repaint, a `setInterval`) must
  check `useReducedMotionSafe()` from `src/lib/use-motion-prefs.ts` itself,
  because no CSS rule can reach it. `LiveTelemetryChart` used to keep stepping
  its window every 2s under reduced motion for exactly that reason.
- **Anything the clamp removes that carried meaning needs a static
  equivalent.** A match marker that only exists as motion is not a match
  marker; `[data-flash]` is the worked example.
- **Anything that starts moving on its own and runs past five seconds needs a
  pause control** (WCAG 2.2.2). The scan simulator and the telemetry chart each
  carry one, in the panel header, using the `pause` / `resume` / `*Aria` keys
  that already existed in both catalogs.
- `prefers-reduced-transparency` solidifies the glass surfaces rather than
  removing them; `prefers-contrast: more` lifts the muted text step and firms
  the hairlines; `forced-colors` hands the palette to the OS.

## Microinteractions

- **Control targets.** Every interactive control clears the touch floor:
  44px (`h-11`) for the header utility cluster, download rows, the network
  explorer's top-bar buttons, filter chips and graph zoom controls, and the
  docs selectors. Denser secondary controls (copy buttons, drawer chips) sit at
  40px. A control may look compact; its hit area may not drop below this.
- Silent success - no celebratory toasts. Optimistic update + Undo over confirm
  dialogs. Hover tooltips delay 800ms; focus tooltips 0ms.
- `.press`: a 1px push on `:active`, pointer devices only
  (`@media (hover: hover) and (prefers-reduced-motion: no-preference)`).
- Focus ring: `2px solid var(--accent)`, `2px` offset, instant, never animated.
  Verified `>= 3:1` against both panels (6.7:1 dark, 5.1:1 light).

## CTA voice

- **Primary**: filled rectangle, `--radius-sm` (2px), `--accent` with
  `--accent-fg` text, weight 500, verb-led label ("Download Hanterill", "Read the
  docs"). Height 44px (`md`) / 36px (`sm`). No pill, no gradient. Label fits one
  line at desktop.
- **Secondary**: bordered rectangle, `--line-strong` border, `--radius-sm`.
- **Typographic link**: the word, a `lucide-react` `ArrowUpRight` / `ArrowRight`
  (never a literal arrow glyph - the antislop oracle rejects `U+2190..U+21FF` in
  non-diagram `.tsx`), a 1px underline that thickens on hover. Accent colour.

## Chrome archetypes

- **Nav - N9 edge rail**. One `h-16` row on a hairline: wordmark hard left, then
  a mono uppercase link row (11.5px, `0.12em` tracking) pushed to the far edge,
  then the utilities (locale, theme, download). A 1px instrument rail with edge
  tick marks sits along the top of the band. Active link is bronze; the drawn
  underline grows on hover. Sticky; on scroll the band gets a `--bg-primary`
  wash + hairline (`[data-scrolled]` hook), no frosted pill. Below `lg` the link
  row folds behind a "Menu" disclosure carrying locale + theme + the links.
  Marker: `data-edge-nav` on `<header>`.
- **Footer - statement**. One large grotesk closing line (`footer.tagline`, max
  ~24ch), then a hairline, then a mono meta row laid as columns (not a
  bar-chained strip): repository, licence line, platform coverage, `<time>`
  year. The independence disclaimer in muted small print. A flat link `nav` of
  the masthead destinations sits beneath. Nothing becomes a link grid. Marker:
  `data-statement-footer` on `<footer>`.

## What pages MUST share

- The `[Hanterill]` bracket wordmark and its bronze brackets.
- `--accent` and its `<= 5%` placement rule.
- Geist display + Inter body + IBM Plex Mono identifier. No serif.
- The CTA voice (filled 2px rectangle primary, typographic-link secondary).
- Section heads: a grotesk heading, optionally a lede. A mono legend appears
  only where it labels a live instrument (channel / units / source / sample-data
  disclaimer) - never a decorative uppercase eyebrow above prose. `01 -`
  numerals only where the content is genuinely ordinal (the 7-stage session
  walkthrough keeps `01..07` via `data-ordinal`).
- Instrument figures use `.bezel`; section dividers use `.rule-ticks`.

## What pages MAY differ on

- Which instrument is the hero figure, and whether the page leads with an
  instrument or a short prose block (both are the Workbench shape).
- Prose measure on content pages (`--measure` default; narrower for the licence
  page is fine).

## Exports

The design tokens and their Tailwind `@theme inline` mirror live in
`src/app/globals.css`.

## Antislop register (dose caps + written reasons)

Every dose-limited device, with its reason. Stay under the cap or amend this
register first.

- **Accent ledger.** Bronze appears only at: wordmark brackets, one link colour
  (active nav + typographic links), the focus ring, the filled primary CTA, one
  status marker per instrument, and the selected-module emissive in the 3D
  scene. Combined `<= 5%` of any viewport. No gradient anywhere.
- **Measurement grid (`.hairline-grid`).** One placement: behind the home hero
  instrument figure, `<= 80%` mask, ink-on-ink. It frames a real readout; it is
  not a page-wide "feel technical" texture.
- **Bezel (`.bezel`).** Instrument figures and interactive panels only. One
  corner-notch treatment, `--line-strong` hairline. Prose and layout containers
  do not get a bezel.
- **Glass.** Two sanctioned surfaces: the scrolled nav wash
  (`backdrop-filter: blur(8px)` behind an 88% panel fill) and the scrim behind a
  modal (the ⌘K palette, the screenshot lightbox). A modal scrim is functional,
  not decorative - it is what separates a blocking task from the page - and both
  carry `data-material` so `prefers-reduced-transparency` can solidify them.
  Nothing else is translucent. The network explorer alone had five, which is why
  "scrim" is now spelled out as its own category rather than an exception.
- **Shadow.** One elevation: the docs search popover. Dark mode carries
  elevation by lighter surfaces; nothing else casts a shadow. The network
  explorer's private `--shadow` and its two accent glow rings were removed;
  selection there is a border hue and a surface step, like everywhere else.
- **Accent is not a data colour.** It never fills a category, never carries a
  heat value, and never marks a node that is not selected. The network
  explorer's drive-domain nodes were a solid bronze fill - so "drivetrain
  module" and "selected module" looked identical - and its documented-pin dot
  was bronze on all ~40 nodes.
- **Glow.** None, by rule.
- **Radius.** Five steps, 1-6px (`--radius-*`). Primary CTA is a 2px rectangle;
  pills are banned except genuine status dots (1.5px, functional).
- **Icon set.** `lucide-react`, 1.75px stroke, functional only (menu, theme,
  locale, download, direction arrows in typographic links). No decorative
  sparkle / star / magic glyphs; no emoji. A relevant icon beats a generic one;
  none beats decoration.
- **Mono labels.** IBM Plex Mono uppercase tracking is one value across the
  system (`0.12em`) on functional surfaces only: the nav row, instrument
  channel legends, status notices. Sentence-carrying labels ("Work in progress",
  "On this page") are sentence-case mono. No numeral prefixes outside the
  genuinely ordinal session walkthrough.
- **Loops.** At most two looping signals per view, all functional status: the
  ScanSimulator stage marker and the SessionSimulator live-stage marker, plus
  one `motion-safe` shimmer on the 3D loading placeholder. The connection
  diagram's packet is a single compositor transform on `alternate`, and the
  hero mini-chart's live dot is a CSS animation rather than an SVG `<animate>`
  (SMIL is invisible to the reduced-motion contract and broke hydration here).
  Every loop communicates a running state, stops when the state ends, and
  collapses to a static dot under reduced motion.
- **Honest data.** Every instrument runs on labelled sample data. **One
  formula**: "[what it is] · sample data, not a vehicle reading", and the
  negation is never dropped. The long form is `common.representative`; the
  instrument footers are `telemetry.footerNote`, `scan.footerNote` and
  `features.reportsCaption`. Nine phrasings had grown, three without the
  negation. The download page's failed GitHub fetch names the cause and the
  next action; no invented metrics, feeds, or testimonials anywhere.
