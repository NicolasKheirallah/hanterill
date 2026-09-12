// Gate oracle: message-catalog integrity.
// 1) en/sv key trees identical. 2) Every static translation key used in src/
// exists in the catalog. 3) sv marketing pages do not ship English <title>.
// Prints I18N_PASSED only when all pass.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];
let passed = 0;
function expect(cond, name, detail) {
  if (cond) passed++;
  else failures.push(`${name}: ${detail}`);
}

const en = JSON.parse(await readFile(join(ROOT, "src/messages/en.json"), "utf8"));
const sv = JSON.parse(await readFile(join(ROOT, "src/messages/sv.json"), "utf8"));

function keyTree(obj, p = "", out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const path = p ? `${p}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keyTree(v, path, out);
    else out.push(path);
  }
  return out;
}
const enKeys = new Set(keyTree(en));
const svKeys = new Set(keyTree(sv));
const missingSv = [...enKeys].filter((k) => !svKeys.has(k));
const missingEn = [...svKeys].filter((k) => !enKeys.has(k));
expect(missingSv.length === 0, "sv missing keys", missingSv.slice(0, 20).join(", "));
expect(missingEn.length === 0, "en missing keys", missingEn.slice(0, 20).join(", "));

// collect source files
const files = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
  }
}
await walk(join(ROOT, "src"));

// static key usage: t("a.b") within a namespace, or tNs("a.b"), or getTranslations("ns")
let unresolved = 0;
for (const f of files) {
  const src = await readFile(f, "utf8");
  const rel = f.slice(ROOT.length + 1);
  // find useTranslations("ns") / getTranslations("ns") assignments and their variable names
  const nsByVar = new Map();
  for (const m of src.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:use|get)Translations\(\s*(?:\{[^}]*namespace:\s*)?"([a-zA-Z0-9_.]+)"/g)) {
    nsByVar.set(m[1], m[2]);
  }
  for (const m of src.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:use|get)Translations\(\s*\{[^}]*locale[^}]*namespace:\s*"([a-zA-Z0-9_.]+)"/g)) {
    nsByVar.set(m[1], m[2]);
  }
  for (const [varName, ns] of nsByVar) {
    for (const k of src.matchAll(new RegExp(`${varName}\\(\\s*"([a-zA-Z0-9_.]+)"`, "g"))) {
      const full = `${ns}.${k[1]}`;
      if (!enKeys.has(full)) {
        unresolved++;
        failures.push(`unresolved key ${rel}: ${full}`);
      }
    }
  }
}
expect(unresolved === 0, "unresolved translation keys", `${unresolved} bad refs`);

// built sv marketing pages must not have English titles
const svPages = [
  ["out/sv/about/index.html", "Om"],
  ["out/sv/privacy/index.html", "Integritetsskydd"],
  ["out/sv/projects/index.html", "projekt"],
];
for (const [f, needle] of svPages) {
  try {
    const html = await readFile(join(ROOT, f), "utf8");
    const t = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    expect(t.toLowerCase().includes(needle.toLowerCase()), `${f} localized title`, t);
  } catch {
    expect(false, `${f} exists`, "missing build output");
  }
}

console.log(`i18n checks: ${passed} passed, ${failures.length} failed`);
for (const f of failures.slice(0, 40)) console.log("  FAIL " + f);
if (failures.length) {
  console.log("I18N_FAILED");
  process.exit(1);
}
console.log(`I18N_PASSED keys=${enKeys.size}`);
