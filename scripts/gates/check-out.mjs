// Gate oracle: SEO checks against the built out/ directory.
// Prints SEO_PASSED only when all assertions pass.
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const failures = [];
let passed = 0;
function expect(cond, name, detail) {
  if (cond) passed++;
  else failures.push(`${name}: ${detail}`);
}

// The canonical host is whatever site.ts declares, so the gate cannot keep
// asserting one domain while the config moves to another.
const siteSrc = await readFile(join(ROOT, "src/lib/site.ts"), "utf8");
const SITE_URL = siteSrc.match(/url:\s*"(https:\/\/[^"]+)"/)?.[1];
if (!SITE_URL) {
  console.log("seo checks: site.ts has no url");
  console.log("SEO_FAILED");
  process.exit(1);
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

function head(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

let pageCount = 0;
for await (const f of htmlFiles(OUT)) {
  const rel = relative(OUT, f).replaceAll("\\", "/");
  if (rel === "index.html") continue; // root locale bounce (noindex)
  // Next's export-time 404 scaffolding; the user-facing 404 is checked below.
  if (rel === "404/index.html" || rel === "404.html" || rel === "_not-found/index.html") continue;
  const html = await readFile(f, "utf8");
  pageCount++;
  const pathFromOut = rel.replace(/\/index\.html$/, "");
  const pagePath = `/${pathFromOut}/`;

  const canonical = head(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = head(html, /<meta property="og:url" content="([^"]*)"/);
  // Next emits the React prop casing (`hrefLang`); HTML attribute names are
  // case-insensitive, so the gate matches either.
  const hreflangEn = head(html, /<link rel="alternate" hreflang="en" href="([^"]*)"/i);
  const hreflangSv = head(html, /<link rel="alternate" hreflang="sv" href="([^"]*)"/i);
  const xDefault = head(html, /<link rel="alternate" hreflang="x-default" href="([^"]*)"/i);
  const ogImage = head(html, /<meta property="og:image" content="([^"]*)"/);
  const twImage = head(html, /<meta name="twitter:image" content="([^"]*)"/);
  // Next merges metadata shallowly: a page-level `openGraph` object replaces the
  // layout's entirely. These three were declared in the layout, absent from all
  // 80 built pages, and nothing asserted them - which is exactly why they
  // shipped missing for as long as they did.
  const ogType = head(html, /<meta property="og:type" content="([^"]*)"/);
  const ogSiteName = head(html, /<meta property="og:site_name" content="([^"]*)"/);
  const ogLocale = head(html, /<meta property="og:locale" content="([^"]*)"/);
  const ogTitle = head(html, /<meta property="og:title" content="([^"]*)"/);
  const ogDesc = head(html, /<meta property="og:description" content="([^"]*)"/);
  const desc = head(html, /<meta name="description" content="([^"]*)"/);
  const title = head(html, /<title>([^<]*)<\/title>/);

  const isLocaleRoot = pagePath === "/en/" || pagePath === "/sv/";
  expect(!!canonical, `${rel} canonical`, "missing");
  expect(!!title, `${rel} title`, "missing");
  if (canonical) {
    expect(canonical === `${SITE_URL}${pagePath}`, `${rel} canonical value`, canonical);
  }
  if (ogUrl) expect(ogUrl === `${SITE_URL}${pagePath}`, `${rel} og:url`, ogUrl);
  expect(hreflangEn === `${SITE_URL}${pagePath.replace("/sv/", "/en/")}`, `${rel} hreflang en`, String(hreflangEn));
  expect(hreflangSv === `${SITE_URL}${pagePath.replace("/en/", "/sv/")}`, `${rel} hreflang sv`, String(hreflangSv));
  expect(xDefault === `${SITE_URL}${pagePath.replace("/sv/", "/en/")}`, `${rel} x-default`, String(xDefault));
  expect(!!ogImage, `${rel} og:image`, "missing");
  expect(!!twImage, `${rel} twitter:image`, "missing");
  expect(ogType === "website", `${rel} og:type`, String(ogType));
  expect(ogSiteName === "Hanterill", `${rel} og:site_name`, String(ogSiteName));
  expect(ogLocale === (rel.startsWith("sv/") ? "sv_SE" : "en"), `${rel} og:locale`, String(ogLocale));
  expect(!!ogTitle && !!ogDesc, `${rel} og:title/description`, "missing");
  // Descriptions beyond ~160 characters are truncated in a SERP; titles under
  // 15 are too thin to identify a page.
  if (desc) expect(desc.length <= 200, `${rel} description length`, `${desc.length} chars`);
  if (title) expect(title.length >= 15, `${rel} title length`, `${title.length} chars`);
  // titles must differ per locale for marketing pages
  if (/^sv\//.test(rel) && !/\/docs\//.test(rel) && !isLocaleRoot && pagePath !== "/sv/") {
    expect(!/^(About|Download|Features|Privacy|Safety|Screenshots|Vehicles|Other projects)\b/.test(title || ""), `${rel} localized title`, title);
  }
}
expect(pageCount > 40, "page count", String(pageCount));

// sitemap: trailing slashes and every loc resolves to a built file
const sitemap = await readFile(join(OUT, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
expect(new Set(locs).size === locs.length, "sitemap duplicate urls", String(locs.length - new Set(locs).size));
expect(locs.length > 40, "sitemap size", String(locs.length));
for (const loc of locs) {
  expect(loc.endsWith("/"), `sitemap url ${loc}`, "missing trailing slash");
  const p = loc.replace(`${SITE_URL}/`, "").replace(/\/$/, "");
  let exists = false;
  try {
    exists = (await readFile(join(OUT, p || ".", "index.html"), "utf8")).length > 100;
  } catch {
    exists = false;
  }
  expect(exists, `sitemap url resolves ${loc}`, "no built page");
}

// root redirect page exists and points at ./en/
const root = await readFile(join(OUT, "index.html"), "utf8");
expect(root.includes("./en/"), "root redirect", "no ./en/ bounce");

// Every sitemap <lastmod> used to be the identical build timestamp, which tells
// a crawler nothing. Assert they are at least not all one instant.
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
expect(lastmods.length > 0, "sitemap has lastmod values", "none");
// Either there is no lastmod (nothing in the repo records a per-page date, so
// omitting it is honest) or the values genuinely differ. What must never ship
// again is 152 URLs all claiming the build instant.
// The invariant is that a lastmod, when present, is a real per-URL fact rather
// than the build instant. Today only the two changelog entries carry one (the
// newest release date). What must never ship again is every URL claiming the
// same timestamp, which is what `lastModified: new Date()` produced.
expect(
  lastmods.length < 10 || new Set(lastmods).size > 1,
  "sitemap lastmod is not one identical build stamp",
  `${new Set(lastmods).size} distinct value(s) across ${lastmods.length} urls`,
);

// no og:image points at a missing asset
for await (const f of htmlFiles(OUT)) {
  const html = await readFile(f, "utf8");
  const m = html.match(/<meta property="og:image" content="([^"]*)"/);
  if (m && m[1].includes(SITE_URL)) {
    const assetPath = m[1].replace(`${SITE_URL}/`, "").split("?")[0];
    try {
      await readFile(join(OUT, assetPath));
    } catch {
      expect(false, `og:image asset exists (${relative(OUT, f)})`, m[1]);
      break;
    }
  }
}

console.log(`seo checks: ${passed} passed, ${failures.length} failed`);
for (const f of failures.slice(0, 40)) console.log("  FAIL " + f);
if (failures.length) {
  console.log("SEO_FAILED");
  process.exit(1);
}
console.log(`SEO_PASSED pages=${pageCount} sitemap_urls=${locs.length}`);
