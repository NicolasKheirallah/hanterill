import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const problems = [];

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    problems.push(`missing ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

function need(rel, ...must) {
  const src = read(rel);
  if (!src) return;
  for (const m of must) {
    if (!(m instanceof RegExp ? m.test(src) : src.includes(m)))
      problems.push(`${rel}: expected ${m}`);
  }
}

// Routing: both locales, English default, prefix always so a shared link keeps its language.
need("src/i18n/routing.ts", 'locales: ["en", "sv"]', 'defaultLocale: "en"', 'localePrefix: "always"');

// Request config deep-merges Swedish over English so a partial catalog never shows a raw key.
need("src/i18n/request.ts", "getRequestConfig", "deepMerge", "routing.defaultLocale");

// Locale-aware navigation wrappers and middleware.
need("src/i18n/navigation.ts", "createNavigation", "Link");
need("src/middleware.ts", "createMiddleware", "matcher");

// The [locale] segment is the real layout: guards unknown locales, primes the
// request locale, wraps the tree in the client provider, and is statically built.
need(
  "src/app/[locale]/layout.tsx",
  "generateStaticParams",
  "hasLocale",
  "notFound()",
  "setRequestLocale",
  "NextIntlClientProvider",
  'lang={locale}',
);

// The language switcher preserves the current page (replaces the same pathname
// with a new locale rather than sending the user home).
need(
  "src/components/layout/LocaleSwitcher.tsx",
  'from "@/i18n/navigation"',
  /router\.replace\(pathname,\s*\{\s*locale\s*\}\)/,
);

// Shell chrome is translated and uses the locale-aware Link.
need("src/components/layout/Header.tsx", 'from "next-intl"', 'from "@/i18n/navigation"', "LocaleSwitcher");
need("src/components/layout/Footer.tsx", "useTranslations", 'from "@/i18n/navigation"');

// Homepage and interior pages prime the request locale so they stay static.
const homepage = read("src/app/[locale]/page.tsx");
if (homepage && !homepage.includes("setRequestLocale"))
  problems.push("src/app/[locale]/page.tsx: missing setRequestLocale(locale)");
for (const p of [
  "features/page.tsx",
  "vehicles/page.tsx",
  "download/page.tsx",
  "safety/page.tsx",
  "privacy/page.tsx",
  "about/page.tsx",
  "features/battery-health/page.tsx",
]) {
  const src = read(`src/app/[locale]/${p}`);
  if (src && !src.includes("setRequestLocale"))
    problems.push(`src/app/[locale]/${p}: missing setRequestLocale(locale)`);
}

// Message catalogs: parse, full key parity, and coherent (not copy-of-English) Swedish.
function leaves(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? leaves(v, `${prefix}${k}.`)
      : [[`${prefix}${k}`, v]],
  );
}

let en, sv;
try {
  en = JSON.parse(read("src/messages/en.json"));
  sv = JSON.parse(read("src/messages/sv.json"));
} catch (e) {
  fail(`message catalog does not parse: ${e.message}`);
}

const enLeaves = leaves(en);
const svMap = new Map(leaves(sv));
const missing = enLeaves.filter(([k]) => !svMap.has(k)).map(([k]) => k);
if (missing.length)
  problems.push(`sv.json missing ${missing.length} keys, e.g. ${missing.slice(0, 8).join(", ")}`);

// Wire and protocol identifiers plus the product name: these are tokens, not
// words, so every English occurrence must survive verbatim in Swedish. Common
// technical nouns with an accepted Swedish form (ECU to styrenhet, and so on)
// are a translator's call and are not listed here.
const FIXED = [
  "DoIP",
  "UDS",
  "ISO 13400",
  "ISO 14229",
  "BECM",
  "ENET",
  "RJ45",
  "OBD-II",
  "0x496D",
  "openCMA",
];
const enText = JSON.stringify(en);
const svText = JSON.stringify(sv);
const countOf = (hay, needle) => hay.split(needle).length - 1;
for (const token of FIXED) {
  const a = countOf(enText, token);
  if (a === 0) continue;
  const b = countOf(svText, token);
  if (b < a)
    problems.push(`protocol identifier "${token}" appears ${a}x in en.json but ${b}x in sv.json (localised away)`);
}

// Swedish must actually be Swedish for the homepage journey, not the English
// string left in place. Sample load-bearing keys across the homepage narrative.
const mustDiffer = [
  "hero.title",
  "hero.lead",
  "connection.title",
  "battery.matrixTitle",
  "privacy.title",
  "privacy.lead",
  "cta.title",
  "footer.disclaimer",
  "session.title",
  "docs.title",
];
for (const key of mustDiffer) {
  const e = enLeaves.find(([k]) => k === key)?.[1];
  const s = svMap.get(key);
  if (e == null || s == null) {
    problems.push(`sample key ${key} missing from a catalog`);
    continue;
  }
  if (e === s) problems.push(`sv.json ${key} is identical to English (not translated)`);
}

// A light signal that the Swedish really reads as Swedish somewhere in the
// homepage copy (å/ä/ö appear in almost any real Swedish paragraph).
if (!/[åäöÅÄÖ]/.test(JSON.stringify(sv.hero) + JSON.stringify(sv.privacy) + JSON.stringify(sv.footer)))
  problems.push("sv.json homepage copy has no å/ä/ö, likely not real Swedish");

// sitemap emits both locales.
need("src/app/sitemap.ts", "routing.locales", /\/\$\{locale\}|`\/\$\{locale\}`|\/\$\{locale\}\$\{path\}/);

if (problems.length) fail(`i18n issues:\n  ${problems.join("\n  ")}`);
pass("i18n verification passed");
