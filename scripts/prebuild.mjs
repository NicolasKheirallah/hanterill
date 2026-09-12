// Prebuild: everything the static export needs but cannot generate itself.
//  1. Responsive screenshot sets (AVIF + WebP) under public/assets/gen/,
//     because `images: { unoptimized: true }` means next/image ships sources
//     untouched on a static export.
//  2. public/assets/og.png, a 1200x630 brand card for social embeds.
//  3. src/lib/generated/docs-index.json, the command-palette search corpus
//     (docs body text is only on disk at build time).
//
// Run via `npm run prebuild`; CI's `npm run build` triggers it automatically.

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import sharp from "sharp";

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
  <text x="80" y="466" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="22" fill="${OG.sec}">108 cell-group potentials &#183; 43-ECU catalogue &#183; ISO 13400 / 14229</text>
  <text x="80" y="506" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="22" fill="${OG.sec}">Runs locally. No cloud, no subscription.</text>
  <text x="1120" y="580" text-anchor="end" font-family="'IBM Plex Mono', 'Cascadia Mono', 'Courier New', monospace" font-size="22" fill="${OG.sec}">hanterill.org</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(ASSETS, "og.png"));
  console.log("prebuild: assets/og.png (1200x630)");
}

// ----------------------------------------------------------- command index --

function slugify(s) {
  // Mirrors github-slugger (rehype-slug on the built pages): unicode letters
  // survive, punctuation drops, whitespace becomes hyphens.
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s+/g, "-");
}

async function buildCommandIndex() {
  const docsSrc = await readFile(join(ROOT, "src/lib/docs.ts"), "utf8");
  const metas = [...docsSrc.matchAll(/slug:\s*"([a-z-]+)",\s*title:\s*"([^"]+)",\s*summary:\s*"([^"]+)",\s*group:\s*"(\w+)"/g)].map(
    (m) => ({ slug: m[1], title: m[2], summary: m[3], group: m[4] }),
  );
  const dir = join(ROOT, "src/content/docs");
  const entries = [];
  for (const d of metas) {
    let raw = "";
    try {
      raw = await readFile(join(dir, `${d.slug}.mdx`), "utf8");
    } catch {
      /* body stays empty; the entry is still findable by title */
    }
    const headings = [...raw.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)].map((m) => ({
      level: m[1].length,
      text: m[2].replace(/[*_`]/g, ""),
      id: slugify(m[2].replace(/[*_`]/g, "")),
    }));
    const text = raw
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/^import[^;]+;/gm, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>|*_`[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 700);
    entries.push({ ...d, headings, text });
  }
  const outDir = join(ROOT, "src/lib/generated");
  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, "docs-index.json"),
    JSON.stringify({ generated: "prebuild", entries }),
  );
  console.log(`prebuild: docs-index.json (${entries.length} docs, ${entries.reduce((n, e) => n + e.headings.length, 0)} headings)`);
}

if (!existsSync(join(ASSETS, "overview.png"))) {
  console.error("prebuild: public/assets missing, run from the repo root");
  process.exit(1);
}
await buildImages();
await buildOg();
await buildCommandIndex();
