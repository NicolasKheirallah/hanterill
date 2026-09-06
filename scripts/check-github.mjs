import { join } from "node:path";
import { existsSync } from "node:fs";
import { walk, read, fail, pass } from "./lib-scan.mjs";

const root = process.cwd();
const gh = join(root, "src/lib/github.ts");
if (!existsSync(gh)) fail("src/lib/github.ts does not exist");
const src = read(gh);
const problems = [];

if (!/try\s*\{/.test(src) || !/catch\s*[({]/.test(src)) problems.push("github.ts: no try/catch around fetch");
if (!/return null/.test(src)) problems.push("github.ts: does not return null on failure");
if (!/revalidate/.test(src)) problems.push("github.ts: fetch has no revalidate (caching) option");
if (/AbortSignal|signal:/.test(src) === false) problems.push("github.ts: no request timeout (AbortSignal)");

// No fabricated metrics: a bare integer >= 10 assigned to a stars/forks-like field.
for (const m of src.matchAll(/(stargazers_count|forks_count|stars|watchers)\s*[:=]\s*(\d+)/g)) {
  if (Number(m[2]) >= 10) problems.push(`github.ts: hardcoded metric ${m[1]}=${m[2]}`);
}

// A consumer must render a graceful fallback when data is null.
const consumers = walk(join(root, "src/components"), [".tsx"]).filter((f) =>
  /github|GitHubStats|OpenSource/i.test(f),
);
if (!consumers.length) problems.push("no component consumes github.ts (GitHubStats/OpenSource)");
else {
  const joined = consumers.map(read).join("\n");
  if (!/(null|undefined|!data|data\s*\?|\?\?|catch)/.test(joined))
    problems.push("github consumer has no null/fallback branch");
}

if (problems.length) fail(`GitHub integration issues:\n  ${problems.join("\n  ")}`);
pass("GitHub integration verification passed");
