import { join } from "node:path";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const problems = [];

// The site states its own licence (source-available, private use). Prose must
// not cite the upstream MIT file or claim OSI open source, per the user's
// decision that the site leads a planned relicence. Scoped to prose files
// (.mdx / .md) and the message catalogs; component and variable identifiers
// such as `OpenSourceSection` are not licence claims.
const proseFiles = [
  ...walk(join(root, "src/content/docs"), [".mdx", ".md"]),
  join(root, "src/messages/en.json"),
  join(root, "src/messages/sv.json"),
];

for (const f of proseFiles) {
  const rel = f.slice(root.length + 1).replace(/\\/g, "/");
  const text = read(f);
  if (/\bMIT\b/.test(text))
    problems.push(`${rel}: contains the literal "MIT"`);
  if (/\/blob\/[^\s"')]+\/LICENSE/i.test(text))
    problems.push(`${rel}: links to a repository LICENSE file`);
  // "open source" as an unqualified licence claim. Allowed: "source-available",
  // and any mention of "open source" that the same file explicitly disclaims
  // (an "OSI" reference, or a "not ... open source" / "not the same" phrasing).
  const mentionsOpenSource = /\bopen[-\s]source\b/i.test(text);
  const disclaimed =
    /\bOSI\b/i.test(text) ||
    /not[^.]{0,40}open[-\s]source/i.test(text) ||
    /open[-\s]source[^.]{0,40}not the same/i.test(text);
  if (mentionsOpenSource && !disclaimed)
    problems.push(`${rel}: uses "open source" without an OSI / "not open source" disclaimer`);
}

// The positive statement has to exist somewhere in the docs.
const licenseDoc = proseFiles.find((f) => f.replace(/\\/g, "/").endsWith("content/docs/license.mdx"));
if (!licenseDoc) {
  problems.push("src/content/docs/license.mdx is missing");
} else {
  const t = read(licenseDoc);
  if (!/source[-\s]available/i.test(t))
    problems.push("license.mdx: does not say 'source-available'");
  if (!/(private use|personal, non-commercial|personal, non‑commercial)/i.test(t))
    problems.push("license.mdx: does not state private / personal, non-commercial use");
}

if (problems.length) fail(`license consistency issues:\n  ${problems.join("\n  ")}`);
pass("license consistency verification passed");
