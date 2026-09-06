import { execSync } from "node:child_process";
try {
  const out = execSync("npx eslint . --max-warnings=0", { cwd: process.cwd(), stdio: "pipe", encoding: "utf8" });
  process.stdout.write(out);
  console.log("lint passed");
} catch (err) {
  process.stdout.write(err.stdout || "");
  process.stderr.write(err.stderr || "");
  console.error("FAIL: eslint reported problems");
  process.exit(1);
}
