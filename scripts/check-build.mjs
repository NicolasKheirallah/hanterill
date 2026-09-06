import { execSync } from "node:child_process";

try {
  const out = execSync("npx next build", {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", CI: "1" },
    maxBuffer: 64 * 1024 * 1024,
  });
  process.stdout.write(out);
  if (!/Compiled successfully|Generating static pages|Route \(app\)/.test(out)) {
    console.error("FAIL: build finished without a success marker");
    process.exit(1);
  }
  console.log("next production build passed");
} catch (err) {
  process.stdout.write(err.stdout || "");
  process.stderr.write(err.stderr || "");
  console.error("FAIL: next build exited nonzero");
  process.exit(1);
}
