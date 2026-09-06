import { join } from "node:path";
import { readFileSync } from "node:fs";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const problems = [];

const en = JSON.parse(readFileSync(join(root, "src/messages/en.json"), "utf8"));
const namespaces = Object.keys(en);

// Every .ts/.tsx source, concatenated once.
const src = walk(join(root, "src"), [".ts", ".tsx"])
  .filter((f) => !f.endsWith(".json"))
  .map(read)
  .join("\n");

// A namespace counts as consumed if a component/module names it in a
// useTranslations / getTranslations call, or reads a key under it with t("ns.").
for (const ns of namespaces) {
  const patterns = [
    `useTranslations("${ns}")`,
    `getTranslations("${ns}")`,
    `namespace: "${ns}"`,
    `("${ns}.`,
    `\`${ns}.`,
  ];
  if (!patterns.some((p) => src.includes(p)))
    problems.push(`message namespace "${ns}" is in the catalog but no source consumes it`);
}

if (problems.length) fail(`i18n consumption issues:\n  ${problems.join("\n  ")}`);
pass(`i18n consumption verification passed (${namespaces.length} namespaces consumed)`);
