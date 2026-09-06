import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

export function walk(dir, exts, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, acc);
    else if (exts.includes(extname(name))) acc.push(full);
  }
  return acc;
}

export function read(file) {
  return readFileSync(file, "utf8");
}

export function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

export function pass(marker) {
  console.log(marker);
  process.exit(0);
}
