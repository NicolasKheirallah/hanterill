# Design - openCMA website

A locked design system for this site. Every page reads this file before emitting
code. Do not regenerate per page - extend or amend this file when the system
needs to grow.

Current direction: **dark-tech instrument panel** (overhaul, 2026-09-06). It
replaces the earlier editorial / luxe-technical pass (Fraunces roman serif,
"engineering broadsheet dressed like a maison"). The OKLCH token *values* and
the dark-base / light-remap structure are carried over unchanged, including the
bronze accent; the display face, the section-head voice and the chrome devices
change. Every text / surface pair below still passes WCAG 2.x (4.5:1 normal
text, 3:1 large text and UI, against the lightest surface each colour sits on)
in BOTH themes.

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
| `--bg-primary` | `oklch(19.5% 0.012 265)` deep ink | `oklch(96.2% 0.006 80)` bone |
| `--bg-secondary` | `oklch(23% 0.012 265)` | `oklch(93.5% 0.007 80)` |
| `--surface` | `oklch(25.5% 0.011 265)` | `oklch(98% 0.004 80)` |
| `--surface-raised` | `oklch(28.5% 0.011 265)` | `oklch(99.2% 0.002 80)` |
| `--text-primary` | `oklch(94% 0.006 85)` warm ivory | `oklch(23% 0.012 265)` ink |
| `--text-secondary` | `oklch(78% 0.007 85)` | `oklch(42% 0.011 265)` |
| `--text-muted` | `oklch(66.5% 0.008 85)` | `oklch(50% 0.011 265)` |
| `--line` | `oklch(31% 0.011 265)` hairline | `oklch(87.5% 0.008 80)` |
| `--line-strong` | `oklch(41% 0.013 265)` bezel | `oklch(79% 0.01 80)` |
| `--accent` | `oklch(70% 0.085 45)` bronze backlight | `oklch(50% 0.1 45)` bronze |
| `--accent-hover` | `oklch(76% 0.08 45)` | `oklch(43% 0.095 45)` |
| `--accent-fg` | `oklch(16% 0.02 45)` | `oklch(98.5% 0.008 80)` |
| `--accent-tint` | `oklch(29% 0.035 45)` | `oklch(94% 0.03 45)` |

sRGB anchors: dark panel `#12151a`, ivory `#edebe7`, bronze `#cb8e72`; light
paper `#f5f2ee`, ink `#1a1d23`, bronze `#914f2f`.

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

Status hues (OKLCH, both themes lift lightness in dark): `--status-ok` green
`150`, `--status-warning` amber `80/75`, `--status-error` red `25`,
`--status-info` blue `250`. Tone plus a word, never colour alone. Canvas / 3D
telemetry series: bronze `#cb8e72`, steel `#7ea4cf`, sage `#7fae8e`; 3D pack
scene background is the dark-panel anchor `#12151a`.

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
- **Type scale anchor**: `--text-display = clamp(2.5rem, 4.5vw + 1rem, 4.25rem)`.

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
- Reduced-motion fallback: all animation / transition clamped to ~0ms; spatial
  motion never carries information on its own.

## Microinteractions

- Silent success - no celebratory toasts. Optimistic update + Undo over confirm
  dialogs. Hover tooltips delay 800ms; focus tooltips 0ms.
- `.press`: a 1px push on `:active`, pointer devices only
  (`@media (hover: hover) and (prefers-reduced-motion: no-preference)`).
- Focus ring: `2px solid var(--accent)`, `2px` offset, instant, never animated.
  Verified `>= 3:1` against both panels (6.7:1 dark, 5.1:1 light).

## CTA voice

- **Primary**: filled rectangle, `--radius-sm` (2px), `--accent` with
  `--accent-fg` text, weight 500, verb-led label ("Download openCMA", "Read the
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

- The `[openCMA]` bracket wordmark and its bronze brackets.
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
- **Glass.** One element: the scrolled nav wash (`backdrop-filter: blur(8px)`
  behind an 88% panel fill). Everything else is solid.
- **Shadow.** One elevation: the docs search popover. Dark mode carries
  elevation by lighter surfaces; nothing else casts a shadow.
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
- **Loops.** At most two looping signals per view, both functional status: the
  ScanSimulator stage marker and the SessionSimulator live-stage marker, plus
  one `motion-safe` shimmer on the 3D loading placeholder. Every loop
  communicates a running state, stops when the state ends, and collapses to a
  static dot under reduced motion.
- **Honest data.** Every instrument runs on labelled sample data
  ("Representative interface with sample values. Not a live vehicle reading.");
  the download page's failed GitHub fetch names the cause and the next action;
  no invented metrics, feeds, or testimonials anywhere.
