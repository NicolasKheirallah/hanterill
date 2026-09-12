// Gate oracle: performance budget on the built export. Prints BUDGET_PASSED
// only when all assertions hold.
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const failures = [];
let passed = 0;
function expect(cond, name, detail) {
  if (cond) passed++;
  else failures.push(`${name}: ${detail}`);
}
const read = async (p) => {
  try {
    return await readFile(p, "utf8");
  } catch {
    return "";
  }
};
const size = async (p) => {
  try {
    return (await stat(p)).size;
  } catch {
    return 0;
  }
};

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

// 1. Home initial JS stays under the cap (measured uncompressed).
const HOME_JS_CAP_KB = 1050;
const home = await read(join(OUT, "en/index.html"));
const homeChunks = [...home.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]);
let homeBytes = 0;
for (const c of homeChunks) homeBytes += await size(join(OUT, c));
expect(
  homeBytes / 1024 <= HOME_JS_CAP_KB,
  "home initial JS budget",
  `${Math.round(homeBytes / 1024)} KB > ${HOME_JS_CAP_KB} KB`,
);

// 2. Heavy vendor chunks (three.js) must stay out of every HTML: only the
    // dynamic import on the battery page may pull them.
const chunkDir = join(OUT, "_next/static/chunks");
const chunks = await readdir(chunkDir);
const refsByChunk = new Map();
for await (const f of htmlFiles(OUT)) {
  const html = await read(f);
  for (const c of chunks) {
    const s = await size(join(chunkDir, c));
    if (s > 300 * 1024 && html.includes(c)) refsByChunk.set(c, (refsByChunk.get(c) ?? 0) + 1);
  }
}
for (const [c, n] of refsByChunk)
  expect(n <= 2, `heavy chunk ${c} eager in ${n} pages`, "should be lazy-only (battery views)");

// 3. The screenshot pipeline is live: gallery and hero use gen renditions.
const gallery = await read(join(OUT, "en/screenshots/index.html"));
expect(gallery.includes("image/avif"), "gallery avif srcset", "missing");
expect(gallery.includes("assets/gen/") || gallery.includes("assets%2Fgen"), "gallery gen paths", "missing");
expect(home.includes("assets/gen/overview"), "hero real captures", "missing");

// 4. og:image points at the dedicated brand card and the asset shipped.
const og = home.match(/property="og:image" content="([^"]+)"/);
expect(og?.[1]?.endsWith("/assets/og.png"), "og:image brand card", og?.[1] ?? "missing");
expect((await size(join(OUT, "assets/og.png"))) > 1000, "og.png shipped", "missing");

console.log(`budget checks: ${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log("  FAIL " + f);
if (failures.length) {
  console.log("BUDGET_FAILED");
  process.exit(1);
}
console.log(`BUDGET_PASSED home_js_kb=${Math.round(homeBytes / 1024)} cap=${HOME_JS_CAP_KB}`);
