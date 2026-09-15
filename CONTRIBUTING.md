# Contributing

Hanterill is source-available rather than open source: the licence permits
reading, running and sharing it for personal, non-commercial use, and prohibits
commercial use and distributing modified versions. See [LICENSE.md](LICENSE.md).
Contributions are welcome, and the terms below are what make them possible.

## Before you write code

Open an issue first for anything larger than a typo. The project has firm
opinions about its safety boundaries, its decoder contracts and its interface
register, and a discussion before the work starts is cheaper than a rejected
pull request.

If you are reporting a security problem, **do not open a public issue** — follow
[SECURITY.md](SECURITY.md) instead.

## What is genuinely useful

**Verification data.** The single most valuable contribution is a confirmed
reading from a vehicle that is currently marked *Catalogued* or *Research* on
[hanterill.com/en/vehicles](https://hanterill.com/en/vehicles). A platform map
that has been exercised against real hardware is worth more than any amount of
new code. Include the model year, the variant, the identifier you read, and what
the car reported.

**Decoder corrections.** If a value Hanterill shows disagrees with the
manufacturer's own tool, that is a bug worth filing. Include the raw bytes, the
identifier, the platform and what you expected.

**Documentation fixes.** The docs live in this repository under
`src/content/docs`. Each page exists in `en` and in `sv`; a change to one needs
the matching change in the other, and the build fails if the two catalogues
drift apart.

**Interface work.** Read [design.md](design.md) first. It is the design system,
it is locked, and it is specific — it names the accent budget, the glass budget,
the type scale and the motion contract. A pull request that adds a shadow, a
gradient or a glow will be sent back to that file.

## Running the site locally

```sh
npm install
npm run dev      # prebuilds assets, then next dev on :3000
npm run build    # static export to out/
```

The site is a fully static export; there is no server component that reads a
request, and there is no runtime backend to configure.

## Before you open a pull request

```sh
npm run typecheck
npm run lint
npm run build
```

The repository also carries a set of gate scripts under `scripts/gates/`. They
check message-catalogue parity, Swedish terminology, accessibility invariants,
source hygiene, asset references and the built output. CI runs all of them, and
a pull request that trips one will not merge. Run them with:

```sh
for f in scripts/gates/check-*.mjs; do node "$f" || echo "FAILED: $f"; done
```

## The rules that will get a pull request sent back

- **No new claim about the vehicle without a source.** Every protocol identifier,
   ECU address and decoder rule traces to a public standard or to a capture in
  the provenance repository. "It works on my car" is a data point, not a spec.
- **No write operation without a confirmation.** The read/write boundary is the
  product's central safety property.
- **No invented metrics, feeds, testimonials or sample data labelled as live.**
  Every instrument on the site says what it is showing and that it is not a
  vehicle reading.
- **No new dependency without a reason.** The site ships a large JavaScript
  payload already, and each addition has to earn its place.
- **No emoji, no decorative icons, no "delight" for its own sake.** The register
  is an instrument panel.

## Author

Hanterill is written and maintained by Nicolas Kheirallah. Decisions about the
product's direction are his; everything else is open to argument in an issue.
