import { join } from "node:path";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const self = "scripts/check-antislop.mjs";
const files = [
  ...walk(join(root, "src"), [".ts", ".tsx", ".css"]),
  ...walk(join(root, "src/content"), [".mdx", ".md"]),
].filter((f) => !f.replaceAll("\\", "/").endsWith(self));

const violations = [];
const add = (file, line, msg) => violations.push(`${file.replace(root, ".")}:${line}  ${msg}`);

// Buzzwords banned by the brief (section 41) and antislop R-16.
const buzzwords =
  /\b(revolutionary|game[- ]?changing|cutting[- ]?edge|groundbreaking|supercharge|next[- ]generation|unlock your potential|transform your workflow|seamless|effortless|unleash|elevate your)\b/i;

// Decorative emoji / symbol ranges (pictographs, dingbats, transport, flags).
const emoji =
  /[←-⇿⌀-➿⬀-⯿\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}️]/u;
// Arrows/glyphs legitimately used in technical diagrams are allowed only in these files.
const glyphAllow = /(diagram|connection|hardware|arch|topology|stack)/i;

let roundedFull = 0;

for (const file of files) {
  const text = read(file);
  const lines = text.split(/\r?\n/);
  lines.forEach((ln, i) => {
    const n = i + 1;
    if (/[—–]/.test(ln) && !/https?:\/\//.test(ln)) add(file, n, "em/en dash in source text");
    if (buzzwords.test(ln)) add(file, n, `banned marketing buzzword: ${ln.trim().slice(0, 80)}`);
    if (emoji.test(ln) && !glyphAllow.test(file) && !/\/\/\s*allow-glyph/.test(ln))
      add(file, n, `emoji/glyph in source: ${ln.trim().slice(0, 60)}`);
    if (/border-radius:\s*(9999px|50%)/.test(ln) && !file.endsWith(".css") === false) {
      /* css pill radius is allowed for genuine pills; not flagged */
    }
    if (/rounded-full/.test(ln)) roundedFull += (ln.match(/rounded-full/g) || []).length;
    // Hardcoded GitHub metric literals near star/fork wording.
    if (/(\bstars?\b|stargazers|forks?)\b/i.test(ln) && /(=\s*|>\s*|:\s*)\d{2,}/.test(ln) && !/revalidate|status|\.length|count\?/.test(ln))
      add(file, n, `possible hardcoded GitHub metric: ${ln.trim().slice(0, 80)}`);
  });
}

// rounded-full is fine for status dots / small pills but a wall of them is the AI tell.
if (roundedFull > 40) violations.push(`rounded-full used ${roundedFull} times (cap 40) — pill overuse`);

if (violations.length) fail(`antislop static checks found ${violations.length} issue(s):\n  ${violations.join("\n  ")}`);
pass("antislop static checks passed");
