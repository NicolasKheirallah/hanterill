// Docs plain-text extraction for the command-palette search corpus.
//
// One implementation, used by scripts/prebuild.mjs (which writes
// src/lib/generated/docs-index.json) and available for reference by
// src/lib/docs.ts. The point is that the palette can match any string a reader
// would search for: a flag (--retry-of), an identifier (0x496D), an OS error
// (SmartScreen), or a term that only appears deep in a page.
//
// The whole stripped body is indexed. There is no truncation: a fixed cap made
// deep content unreachable from search, which is exactly where the interesting
// strings live. The corpus is a few tens of KB of gzipped text.

/** Strip MDX down to searchable prose: no code fences, imports, JSX or markdown marks. */
export function stripDocBody(raw) {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^import[^;]+;/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>|*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Headings (with the ids rehype-slug will generate) plus the plain-text body.
 * `slugify` mirrors github-slugger: unicode letters survive, punctuation
 * drops, whitespace becomes hyphens.
 */
export function extractDoc(raw) {
  const headings = [...raw.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)].map((m) => ({
    level: m[1].length,
    text: m[2].replace(/[*_`]/g, ""),
    id: slugify(m[2].replace(/[*_`]/g, "")),
  }));
  return { headings, text: stripDocBody(raw) };
}

export function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s+/g, "-");
}
