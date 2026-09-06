# openCMA website

Public marketing and documentation site for openCMA, a source-available,
dealer-grade vehicle diagnostic and high-voltage telemetry application for Volvo,
Polestar and compatible CMA-platform vehicles. openCMA is provided for personal,
non-commercial use under the project license.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 with a tokenised CSS-variable design system (`src/app/globals.css`)
- Motion (`motion/react`) for state-communicating animation
- Lucide icons
- MDX + Shiki for the documentation section

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Structure

```
src/
  app/                 routes (App Router)
    page.tsx           homepage: the full narrative
    features/          overview + battery-health, vehicle-diagnostics, live-data, service-functions
    vehicles/ download/ safety/ privacy/ about/
    docs/[...slug]/    MDX documentation
    sitemap.ts robots.ts
  components/
    layout/            Header, Footer, ThemeToggle, ScrollSentinel, Wordmark
    hero/ architecture/ battery/ features/ product/ opensource/ vehicles/ download/ sections/
    ui/                Button, Reveal, Code, Prose, PageHeader, layout primitives, StatusBadge
  content/docs/        11 MDX documents
  lib/                 site config, github API, platform detection, vehicle + ECU data, demo data
scripts/               verification scripts used by GATES.md
```

## Configuration

`src/lib/site.ts` holds the site config. The GitHub repository slug
(`repo: "opencma/opencma"`) is a **placeholder**. Set it to the real
`owner/name` and every source link, releases link, and the GitHub API calls in
`src/lib/github.ts` follow. The Download and Open Source sections fetch the
latest release and repository stats at request time (`revalidate: 3600`) and
render an offline fallback if GitHub cannot be reached, so the page never blocks
on the API and never shows fabricated numbers.

## Content

- Vehicle support and status labels: `src/lib/vehicles.ts`
- CMA ECU reference (codes, names, part numbers): `src/lib/ecus.ts`
- Simulated interface values (clearly labelled representative data, not a vehicle
  reading): `src/lib/demo-data.ts`
- Documentation: `src/content/docs/*.mdx`, registered in `src/lib/docs.ts` and
  `src/lib/docs-registry.ts`

## Verification

`GATES.md` is an acceptance ledger. The `scripts/check-*.mjs` files verify routes,
homepage composition, types, lint, anti-slop static checks, theme system,
reduced-motion handling, SEO metadata, GitHub integration resilience, legal and
accessibility content, the production build, and a running-server render of every
route. `DELIVERY-GATE.md` is the anti-slop Delivery Gate report.

## Independence

openCMA is an independent project. It is not affiliated with, maintained by,
sponsored by or authorised by Volvo Cars, Polestar or Geely. Manufacturer and
model names are used only to describe compatibility. The source is available to
read; the project is licensed for private, non-commercial use.
