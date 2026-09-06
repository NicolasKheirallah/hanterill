import { join } from "node:path";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const src = walk(join(root, "src"), [".ts", ".tsx"]);
// UI copy now lives partly in message catalogs; include them in the corpus.
const messages = walk(join(root, "src/messages"), [".json"]);
const joined = [...src, ...messages].map(read).join("\n");
const problems = [];

// Legal independence (section 48).
for (const name of ["Volvo", "Polestar", "Geely"]) {
  if (!new RegExp(`[Nn]ot affiliated[^.]*${name}|${name}[^.]*(not affiliated|independent|inte anslut)`, "s").test(joined))
    problems.push(`no independence disclaimer mentioning ${name}`);
}
if (!/[Ii]ndependent project|oberoende projekt/.test(joined))
  problems.push('missing "independent project" statement');

// Licensing language must be consistent: no unqualified "open source" claims in source or catalogs.
for (const f of [...src, ...messages]) {
  const c = read(f);
  const m = c.match(/\b(free and open source|open[- ]source (project|license|licen[cs]ed)|MIT licen[cs]ed)\b/i);
  if (m) problems.push(`${f.replace(root, ".")}: unqualified open-source claim "${m[0]}"`);
}
if (!/[Ss]ource[- ]available|[Kk]ällkodstillgänglig/.test(joined) || !/[Pp]rivate use|personal, non-commercial|privat bruk/.test(joined))
  problems.push("missing source-available / private-use licensing statement");

// Privacy pillar prominent outside the footer.
const nonFooter = [...src, ...messages].filter((f) => !/footer/i.test(f)).map(read).join("\n");
if (!/[Nn]o telemetry|ingen telemetri/i.test(nonFooter) || !/100% local|local only|local[- ]only|endast lokalt|100 % lokalt/i.test(nonFooter))
  problems.push('privacy pillar ("no telemetry" / "100% local") not present outside the footer');

// Real docs content present.
const docs = walk(join(root, "src/content/docs"), [".mdx", ".md"]);
if (docs.length < 6) problems.push(`only ${docs.length} docs pages (need >= 6 per section 37)`);

// Technical grounding.
for (const term of ["DoIP", "UDS", "13400", "14229", "ENET"]) {
  if (!new RegExp(term).test(joined)) problems.push(`technical term "${term}" never referenced in UI`);
}

// Accessibility scaffolding (layout uses a translation key for the skip link label).
const layout = read(join(root, "src/app/[locale]/layout.tsx"));
if (!/lang=\{locale\}|lang="/.test(layout)) problems.push("layout: no lang attribute");
if (!/#main-content/.test(layout) || !/skipToContent/.test(layout))
  problems.push("no skip-to-content link");
if (!/<main[\s>]/.test(layout)) problems.push("no <main> landmark");
if (!/Skip to content/.test(read(join(root, "src/messages/en.json"))))
  problems.push("skip-to-content label missing from en messages");

if (problems.length) fail(`content / a11y issues:\n  ${problems.join("\n  ")}`);
pass("content + a11y static verification passed");
