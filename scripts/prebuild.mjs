// Prebuild: everything the static export needs but cannot generate itself.
//  1. Responsive screenshot sets (AVIF + WebP) under public/assets/gen/,
//     because `images: { unoptimized: true }` means next/image ships sources
//     untouched on a static export.
//  2. public/assets/og.png, a 1200x630 brand card for social embeds.
//  3. src/lib/generated/docs-index.json, the command-palette search corpus
//     (docs body text is only on disk at build time).
//  4. src/lib/docs-registry.generated.ts, the static import map the docs
//     bundler needs, generated from the files on disk.
//
// Run via `npm run prebuild`; `npm run build` and `npm run dev` trigger it
// automatically.

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import sharp from "sharp";
import { extractDoc } from "./docs-text.mjs";
import { readDocsRegistry } from "./docs-registry.mjs";

const ROOT = process.cwd();
const ASSETS = join(ROOT, "public", "assets");
const GEN = join(ASSETS, "gen");
const WIDTHS = [480, 640, 1024, 1600, 2400];

/** Docs tokens, kept in sync with the dark theme in globals.css. */
const OG = {
  bg: "#12151a",
  text: "#edebe7",
  sec: "#b9b7b2",
  line: "#2e3036",
  accent: "#cb8e72",
};

// ---------------------------------------------------------------- images ----

async function pngFiles(dir, base = "") {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "gen" || e.name === "og.png") continue;
    const p = join(dir, e.name);
    const r = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await pngFiles(p, r)));
    else if (/\.(png|jpe?g)$/i.test(e.name)) out.push([p, r]);
  }
  return out;
}

async function buildImages() {
  const files = await pngFiles(ASSETS);
  // EPERM here usually means another process (dev server, indexer) holds a
  // handle; rm retries transiently before giving up.
  await rm(GEN, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  let count = 0;
  for (const [file, r] of files) {
    const { width } = await sharp(file).metadata();
    const key = r.replace(/\.[^.]+$/, "");
    const dir = join(GEN, key);
    // Shot.tsx references renditions as gen/<key>/<key>-<w>w.*, and the
    // filename prefix reuses the full key, slashes included. For a nested
    // source that puts the file one directory below `dir`; create it.
    await mkdir(join(dir, key), { recursive: true });
    // Never upscale a screenshot; widths wider than the source are skipped.
    for (const w of WIDTHS.filter((x) => x <= width)) {
      const base = sharp(file).resize({ width: w, withoutEnlargement: true });
      for (const [ext, opts] of [
        ["avif", { quality: 46 }],
        ["webp", { quality: 72 }],
      ]) {
        const out = join(dir, `${key}-${w}w.${ext}`);
        // Sharp does not create directories, and a concurrent build's
        // `rm(GEN)` can land between ours and the write — recreate the
        // parent and retry once if the path vanishes under us.
        for (let attempt = 0; ; attempt++) {
          await mkdir(dirname(out), { recursive: true });
          try {
            await base.clone()[ext](opts).toFile(out);
            break;
          } catch (err) {
            if (attempt > 0 || !/ENOENT|No such file/i.test(String(err))) throw err;
          }
        }
        count += 1;
      }
    }
  }
  console.log(`prebuild: images -> ${count} renditions in assets/gen (${files.length} sources)`);
}

// ------------------------------------------------------------------- og -----

async function buildOg() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${OG.bg}"/>
  <rect x="0" y="0" width="6" height="630" fill="${OG.accent}"/>
  <line x1="80" y1="410" x2="1120" y2="410" stroke="${OG.line}" stroke-width="1"/>
  <text x="80" y="240" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="104" font-weight="600" letter-spacing="-3" fill="${OG.text}">Hanterill</text>
  <text x="80" y="304" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="38" fill="${OG.sec}">Vehicle diagnostics for Volvo and Polestar</text>
  <text x="80" y="356" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="24" letter-spacing="2" fill="${OG.accent}">DoIP &#183; UDS &#183; BATTERY HEALTH &#183; LIVE TELEMETRY</text>
  <text x="80" y="466" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="22" fill="${OG.sec}">108 cell-group potentials &#183; 49-ECU catalogue &#183; ISO 13400 / 14229</text>
  <text x="80" y="506" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="22" fill="${OG.sec}">Runs locally. No cloud, no subscription.</text>
  <text x="1120" y="580" text-anchor="end" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="22" fill="${OG.sec}">hanterill.com</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(ASSETS, "og.png"));
  console.log("prebuild: assets/og.png (1200x630)");
}

// ----------------------------------------------------------- command index --

/**
 * The static import map the docs bundler resolves at build time. Generated
 * from the files on disk: en lists every doc, sv lists the translated subset,
 * both in docs.json order. Committed, so lint/typecheck work on a fresh
 * checkout before the first prebuild has run.
 */
async function buildDocsRegistry({ metas }) {
  const entry = (slug, dir = "") =>
    `    "${slug}": () => import("@/content/docs/${dir}${slug}.mdx"),`;
  const en = metas.map((d) => entry(d.slug)).join("\n");
  const sv = metas
    .filter((d) => d.titleSv)
    .map((d) => entry(d.slug, "sv/"))
    .join("\n");
  const out = `// GENERATED by scripts/prebuild.mjs — do not edit by hand.
// Regenerate with \`npm run prebuild\`. The maps list exactly what is on disk:
// en holds every doc, sv holds the translated subset (a translation exists
// when src/content/docs/sv/<slug>.mdx exists), both in docs.json order.
import type { ComponentType } from "react";

type MDXModule = { default: ComponentType };

export type DocLoaderMap = Record<string, Record<string, () => Promise<MDXModule>>>;

export const docLoaders: DocLoaderMap = {
  en: {
${en}
  },
  sv: {
${sv}
  },
};
`;
  await writeFile(join(ROOT, "src/lib/docs-registry.generated.ts"), out);
  console.log(
    `prebuild: docs-registry.generated.ts (${metas.length} en, ${metas.filter((d) => d.titleSv).length} sv loaders)`,
  );
}

async function buildCommandIndex({ metas }) {
  const dir = join(ROOT, "src/content/docs");
  const entries = [];
  for (const d of metas) {
    let raw = "";
    try {
      raw = await readFile(join(dir, `${d.slug}.mdx`), "utf8");
    } catch {
      /* body stays empty; the entry is still findable by title */
    }
    entries.push({ ...d, ...extractDoc(raw) });
    // The Swedish translation, when one exists: same fields under *Sv so the
    // palette can index titles, summaries, headings and body text in the
    // reader's language instead of only the English corpus.
    if (!d.titleSv) continue;
    let svRaw = "";
    try {
      svRaw = await readFile(join(dir, "sv", `${d.slug}.mdx`), "utf8");
    } catch {
      /* translated title/summary still apply; no Swedish body to index */
    }
    const sv = extractDoc(svRaw);
    entries.at(-1).headingsSv = sv.headings;
    entries.at(-1).textSv = sv.text;
  }
  const outDir = join(ROOT, "src/lib/generated");
  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, "docs-index.json"),
    JSON.stringify({ generated: "prebuild", entries }),
  );
  const chars = entries.reduce((n, e) => n + e.text.length + (e.textSv?.length ?? 0), 0);
  const svDocs = entries.filter((e) => e.textSv !== undefined).length;
  console.log(
    `prebuild: docs-index.json (${entries.length} docs, ${svDocs} with Swedish text, ${entries.reduce((n, e) => n + e.headings.length, 0)} headings, ${chars} searchable chars)`,
  );
}

// ---------------------------------------------------------------- routes ----

// The sitemap lists every page the app router can emit, and the filesystem is
// the truth about that. Walk src/app/[locale] and record each directory that
// holds a page.tsx, so a page is in the sitemap the moment it exists instead
// of being typed into a parallel list and only caught by a gate. Route groups
// and dynamic segments are skipped; the docs' [...slug] pages are added by
// sitemap.ts from the docs registry.
async function buildRoutes() {
  const LOCALE_DIR = join(ROOT, "src/app", "[locale]");
  const routes = [];
  if (existsSync(join(LOCALE_DIR, "page.tsx"))) routes.push("");
  async function walk(dir, prefix) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith("_") || e.name.startsWith(".") || /^[([]/.test(e.name)) continue;
      const child = join(dir, e.name);
      const path = `${prefix}/${e.name}`;
      if (existsSync(join(child, "page.tsx"))) routes.push(path);
      await walk(child, path);
    }
  }
  await walk(LOCALE_DIR, "");
  routes.sort((a, b) => a.length - b.length || a.localeCompare(b));
  const outDir = join(ROOT, "src/lib/generated");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "routes.json"), JSON.stringify({ generated: "prebuild", routes }, null, 2) + "\n");
  console.log(`prebuild: routes.json (${routes.length} pages)`);
}

if (!existsSync(join(ASSETS, "overview.png"))) {
  console.error("prebuild: public/assets missing, run from the repo root");
  process.exit(1);
}
await buildImages();
await buildOg();
const registry = await readDocsRegistry();
await buildDocsRegistry(registry);
await buildCommandIndex(registry);
await buildRoutes();
