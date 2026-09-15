// Gate oracle: Swedish doc terminology matches the app's shipped vocabulary.
//
// The app translates its UI under an explicit policy (openCMA sv.ts): Swedish
// workshop convention, so styrenhet not ECU, felkod not fault code, frysta
// ramdata not freeze frame, vilström for drain. The docs must speak the same
// language as the product. This gate fails when a doc uses an invented synonym
// or keeps an English calque.
//
// It also enforces the app's own fordon/bil ratio in the docs, because the app
// says fordon far more often, and a docs page that says bil everywhere reads
// over-familiar next to the product it describes.
//
// Prints SV_TERMS_PASSED only when all assertions hold.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];
let passed = 0;
function expect(cond, name, detail) {
  if (cond) passed++;
  else failures.push(`${name}: ${detail}`);
}

const dir = join(ROOT, "src/content/docs/sv");
const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
const blobs = files.map((f) => [f, readFileSync(join(dir, f), "utf8")]);

// 1. Rejected forms must not appear anywhere in the Swedish docs.
const termsSrc = readFileSync(join(ROOT, "src/lib/sv-terms.ts"), "utf8");
const rejected = [...termsSrc.matchAll(/reject:\s*\[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));

expect(rejected.length > 5, "rejected-form list parsed", `got ${rejected.length}`);

let invented = 0;
for (const [f, c] of blobs) {
  for (const form of rejected) {
    const re = new RegExp(`\\b${form}\\b`, "i");
    if (re.test(c)) {
      invented++;
      failures.push(`invented Swedish in ${f}: "${form}"`);
    }
  }
}
expect(invented === 0, "no invented Swedish terms", `${invented} occurrences`);

// 2. English calques: English function words inside a Swedish sentence.
//    Catches "Den här sidan för dig ansluten" style errors, where the sentence
//    is Swedish words in English word order with a wrong verb.
const calques = [
  /\bför dig ansluten\b/i,
  /\bför dig igångsatt\b/i,
  /\bär på tändning\b/i,
  /\bgör det till ditt\b/i,
];
let calqueHits = 0;
for (const [f, c] of blobs) {
  for (const re of calques) {
    if (re.test(c)) {
      calqueHits++;
      failures.push(`English calque in ${f}: ${re}`);
    }
  }
}
expect(calqueHits === 0, "no English calques", `${calqueHits} occurrences`);

// 3. Voice: the app uses "fordon" far more than "bil". The docs must not
//    invert that ratio and read over-familiar.
const whole = blobs.map(([, c]) => c).join("\n");
const fordon = (whole.match(/\bfordon(en|ets|et)?\b/gi) ?? []).length;
const bil = (whole.match(/\bbil(en|ar|arna)?\b/gi) ?? []).length;
expect(
  fordon >= bil,
  "fordon/bil balance",
  `fordon=${fordon} bil=${bil} (app uses fordon ~7x more often)`,
);

// 4. Terms the app owns must actually be used somewhere, so a doc set that
//    translated around them is caught.
for (const term of ["styrenhet", "felkod", "skrivskyddad", "fordon"]) {
  expect(whole.includes(term), `canonical term used: ${term}`, "not found in any sv doc");
}

// 5. Swedish compounds that are not Swedish. These read as literal calques of
//    English noun stacks; Swedish splits them.
const badCompounds = [
  /\bhelelektrisk\w*/i,
  /\bskrivbordsapp\w*/i,
  /\bskrivbordsvyn\b/i,
  /\bsömndrift\w*/i,
  /\bfrysbild\w*/i,
  /\bupptäcktsbroadcast\w*/i,
];
let compoundHits = 0;
for (const [f, c] of blobs) {
  for (const re of badCompounds) {
    const m = c.match(re);
    if (m) {
      compoundHits++;
      failures.push(`non-Swedish compound in ${f}: "${m[0]}"`);
    }
  }
}
expect(compoundHits === 0, "no non-Swedish compounds", `${compoundHits} occurrences`);

// 6. Screen names must match the app's shipped navigation labels, so a reader
//    who follows the docs to the app finds the same word in both.
const navNames = [
  // docs must use the app's form, not the alternative
  { want: "Inspektionsrapport", bad: /\bBesiktningsrapport/ },
  { want: "Styrmodulregister", bad: /\bStyrenhetsregister/ },
  { want: "Livedata", bad: /\bRealtidsdata/ },
];
let navHits = 0;
for (const [f, c] of blobs) {
  for (const { bad } of navNames) {
    const m = c.match(bad);
    if (m) {
      navHits++;
      failures.push(`screen name differs from app in ${f}: "${m[0]}"`);
    }
  }
}
expect(navHits === 0, "screen names match the app", `${navHits} occurrences`);

// 7. The Swedish message catalog must not carry the same always-wrong forms,
//    since the task router and other UI strings are read from it. Valid but
//    differently-spelled alternatives (Realtidstelemetri) are deliberately not
//    checked here: those are fine in prose and only matter in screen names.
const svMsgs = readFileSync(join(ROOT, "src/messages/sv.json"), "utf8");
let msgHits = 0;
for (const form of rejected) {
  if (new RegExp(`\\b${form}\\b`, "i").test(svMsgs)) {
    msgHits++;
    failures.push(`invented Swedish in sv.json: "${form}"`);
  }
}
expect(msgHits === 0, "no invented Swedish in the catalog", `${msgHits} occurrences`);

// 8. The docs registry carries Swedish titles and summaries that render in the
//    sidebar and in page metadata, so it is held to the same vocabulary.
const registry = readFileSync(join(ROOT, "src/lib/docs.ts"), "utf8");
let regHits = 0;
for (const form of rejected) {
  if (new RegExp(`\\b${form}\\b`, "i").test(registry)) {
    regHits++;
    failures.push(`invented Swedish in docs.ts registry: "${form}"`);
  }
}
expect(regHits === 0, "no invented Swedish in the registry", `${regHits} occurrences`);

console.log(`sv terminology checks: ${passed} passed, ${failures.length} failed`);
for (const f of failures.slice(0, 40)) console.log("  FAIL " + f);
if (failures.length) {
  console.log("SV_TERMS_FAILED");
  process.exit(1);
}
console.log(`SV_TERMS_PASSED fordon=${fordon} bil=${bil}`);
