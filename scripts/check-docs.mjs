import { join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

// Pane 1 + 2: sidebar layout. A sticky left rail with search over an index and
// the grouped nav, then the article column.
need(
  "src/app/[locale]/docs/layout.tsx",
  "getDocsIndex",
  "DocsSearch",
  "DocsSidebar",
  /grid-cols-\[220px_minmax\(0,1fr\)\]|lg:grid-cols/,
  "sticky",
);

// Pane 3: every doc page has its own on-this-page rail beside the article.
need(
  "src/app/[locale]/docs/[...slug]/page.tsx",
  "TableOfContents",
  "getDocToc",
  "generateStaticParams",
  /xl:grid-cols|grid-cols-\[minmax\(0,1fr\)_180px\]/,
);

// Command search: keyboard-openable, filters an index, routes to slug + hash.
need(
  "src/components/docs/DocsSearch.tsx",
  "cmdk",
  /e\.metaKey \|\| e\.ctrlKey|\(e\.metaKey \|\| e\.ctrlKey\)/,
  '"k"',
  "index",
  /router\.push\(`\/docs\/\$\{hit\.slug\}/,
  "Escape",
);

// On-this-page nav: observer-driven active state, no scroll listener, hides when
// there is nothing to navigate.
const toc = read("src/components/docs/TableOfContents.tsx");
if (toc) {
  if (!toc.includes("IntersectionObserver"))
    problems.push("TableOfContents.tsx: expected IntersectionObserver");
  if (/addEventListener\(\s*["']scroll["']/.test(toc))
    problems.push("TableOfContents.tsx: uses a raw scroll listener");
  if (!/headings\.length < 2|headings\.length <= 1/.test(toc))
    problems.push("TableOfContents.tsx: does not hide itself for a short page");
}

// Index builder: real heading extraction with slug ids and an excerpt.
need("src/lib/docs.ts", "getDocsIndex", "getDocToc", "DocHeading", /#{1,3}|headings/);

// Reusable MDX data components exist and are registered.
need("src/components/docs/DocData.tsx", "export function Callout", "export function SpecList");
need("src/mdx-components.tsx", "Callout", "SpecList", "@/components/docs/DocData");

// And at least one doc actually uses one, so the mapping is exercised.
const docsDir = join(root, "src/content/docs");
let usesComponent = false;
try {
  for (const f of readdirSync(docsDir)) {
    if (!f.endsWith(".mdx")) continue;
    const src = readFileSync(join(docsDir, f), "utf8");
    if (/<Callout\b|<SpecList\b/.test(src)) usesComponent = true;
  }
} catch {
  problems.push("src/content/docs is not readable");
}
if (!usesComponent) problems.push("no .mdx file uses <Callout> or <SpecList>");

// Code blocks are copyable (modern-wiki affordance).
need("src/components/ui/Code.tsx", "CopyButton");

if (problems.length) fail(`docs experience issues:\n  ${problems.join("\n  ")}`);
pass("docs experience verification passed");
