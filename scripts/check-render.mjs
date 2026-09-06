import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 4319;
const root = process.cwd();

if (!existsSync(`${root}/.next/BUILD_ID`)) {
  console.log("no build found, running next build first...");
  execSync("npx next build", { cwd: root, stdio: "inherit", env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" } });
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: root,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
  shell: process.platform === "win32",
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

const routes = [
  ["/", ["openCMA", "Download", "DoIP"]],
  ["/features", ["Battery"]],
  ["/features/battery-health", ["state of health", "Vehicle BMS", "108 potentials"]],
  ["/features/vehicle-diagnostics", ["ECU", "Simulated session"]],
  ["/features/live-data", ["telemetry"]],
  ["/features/service-functions", ["write"]],
  ["/vehicles", ["Polestar 2", "verified support", "What the labels mean"]],
  ["/docs/license", ["source-available", "private use", "OSI"]],
  ["/download", ["Windows"]],
  ["/docs", ["Documentation", "Battery diagnostics"]],
  ["/docs/ecu-reference", ["BECM", "32290432", "Gateway"]],
  ["/docs/connection", ["ENET", "13400"]],
  ["/safety", ["high-voltage"]],
  ["/privacy", ["telemetry"]],
  ["/about", ["independent project", "source is available"]],
  ["/sitemap.xml", ["<urlset"]],
  ["/robots.txt", ["User-Agent", "Sitemap"]],
];

async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/`);
      if (r.ok) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

let failed = [];
try {
  if (!(await waitUp())) {
    console.error("FAIL: server did not come up\n" + serverLog.slice(-2000));
    process.exit(1);
  }
  for (const [path, markers] of routes) {
    let ok = false;
    let detail = "";
    try {
      const res = await fetch(`http://localhost:${PORT}${path}`);
      const body = await res.text();
      const missing = markers.filter((m) => !body.includes(m));
      ok = res.status === 200 && missing.length === 0;
      detail = `status ${res.status}${missing.length ? `, missing ${JSON.stringify(missing)}` : ""}`;
    } catch (e) {
      detail = String(e);
    }
    console.log(`${ok ? "ok  " : "FAIL"} ${path}  (${detail})`);
    if (!ok) failed.push(path);
  }
} finally {
  server.kill("SIGKILL");
}

if (failed.length) {
  console.error(`FAIL: ${failed.length} route(s) failed: ${failed.join(", ")}`);
  process.exit(1);
}
console.log(`render verification passed (${routes.length} routes)`);
