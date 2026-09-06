import { execSync } from "node:child_process";
try {
  execSync("npx tsc --noEmit -p tsconfig.json", { cwd: process.cwd(), stdio: "pipe", encoding: "utf8" });
  console.log("typecheck passed");
} catch (err) {
  process.stdout.write(err.stdout || "");
  process.stderr.write(err.stderr || "");
  console.error("FAIL: tsc reported type errors");
  process.exit(1);
}
