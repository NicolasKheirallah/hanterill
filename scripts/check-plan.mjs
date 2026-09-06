import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const path = join(root, "INTERACTION-UPGRADE-PLAN.md");
if (!existsSync(path)) fail("INTERACTION-UPGRADE-PLAN.md is missing");
const src = readFileSync(path, "utf8");

const problems = [];

for (const tier of ["## P0", "## P1", "## P2"]) {
  if (!src.includes(tier)) problems.push(`no ${tier} section`);
}

// Every P0 row must carry a resolved status token.
const p0 = src.split("## P0")[1]?.split("## P1")[0] ?? "";
const rows = p0
  .split("\n")
  .filter((l) => /^\|\s*P0-\d/.test(l));
if (rows.length < 5) problems.push(`only ${rows.length} P0 rows found, expected the full triage`);
for (const r of rows) {
  if (!/\b(DONE|PARTIAL|DEFERRED)\b/.test(r))
    problems.push(`P0 row without a status token: ${r.slice(0, 60)}...`);
  // A PARTIAL or DEFERRED P0 must say why (non-empty Notes cell).
  if (/\b(PARTIAL|DEFERRED)\b/.test(r)) {
    const cells = r.split("|").map((c) => c.trim());
    if (!cells[cells.length - 2] || cells[cells.length - 2].length < 12)
      problems.push(`P0 row is PARTIAL/DEFERRED with no rationale: ${r.slice(0, 60)}...`);
  }
}

// The i18n boundary has to be written down somewhere in the plan.
if (!/i18n boundary/i.test(src)) problems.push("no i18n boundary section");

if (problems.length) fail(`interaction upgrade plan issues:\n  ${problems.join("\n  ")}`);
pass(`interaction upgrade plan verification passed (${rows.length} P0 items)`);
