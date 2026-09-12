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
  const title = head(html, /<title>([^<]*)<\/title>/);

  const isLocaleRoot = pagePath === "/en/" || pagePath === "/sv/";
  expect(!!canonical, `${rel} canonical`, "missing");
  expect(!!title, `${rel} title`, "missing");
  if (canonical) {
    expect(canonical === `https://hanterill.org${pagePath}`, `${rel} canonical value`, canonical);
  }
  if (ogUrl) expect(ogUrl === `https://hanterill.org${pagePath}`, `${rel} og:url`, ogUrl);
  expect(hreflangEn === `https://hanterill.org${pagePath.replace("/sv/", "/en/")}`, `${rel} hreflang en`, String(hreflangEn));
  expect(hreflangSv === `https://hanterill.org${pagePath.replace("/en/", "/sv/")}`, `${rel} hreflang sv`, String(hreflangSv));
  expect(xDefault === `https://hanterill.org${pagePath.replace("/sv/", "/en/")}`, `${rel} x-default`, String(xDefault));
  expect(!!ogImage, `${rel} og:image`, "missing");
  expect(!!twImage, `${rel} twitter:image`, "missing");
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
  const p = loc.replace("https://hanterill.org/", "").replace(/\/$/, "");
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

// no og:image points at a missing asset
for await (const f of htmlFiles(OUT)) {
  const html = await readFile(f, "utf8");
  const m = html.match(/<meta property="og:image" content="([^"]*)"/);
  if (m && m[1].includes("hanterill.org")) {
    const assetPath = m[1].replace("https://hanterill.org/", "").split("?")[0];
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
