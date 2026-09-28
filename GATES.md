# Gates: antislop + unlazy pass over all documentation

OWNS: src/content/docs/**, scripts/antislop-scan.mjs, GATES.md

Scope: every page under src/content/docs (EN and SV) reads as human-written prose — no banned slop vocabulary or phrases, em dashes within budget, no uniform-length sentence runs — and the corrected content from the 0.3.0 documentation pass survives the rebuild.

- [x] G1: scanner positive control — the checker actually detects slop when present
  CHECK: node scripts/antislop-scan.mjs --selftest
  EXPECT: ANTISLOP_SELFTEST_PASSED
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/nicolaskheirallah/Documents/GitHub/hanterill; path=be7a81e70570/29 entries; EXPECT=matched; output-sha256=74fdb8dc370dd7191ef7e6fe2166d3146cb642fc1472de53894f51f3a312521b; output-bytes=25

- [x] G2: zero slop findings across all EN+SV docs (banned words, phrases, openers, Swedish slop, em-dash budget, uniform sentence runs)
  CHECK: node scripts/antislop-scan.mjs
  EXPECT: ANTISLOP_CLEAN
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/nicolaskheirallah/Documents/GitHub/hanterill; path=be7a81e70570/29 entries; EXPECT=matched; output-sha256=da1c7bf0ac615f1a50b09b2ebc3d9fa0e453ffdf09e6a9f62124d36d4cc6fdfb; output-bytes=15

- [x] G3: full site build + all 13 gate suites pass after the edits
  CHECK: bash -c "npm run build >/dev/null 2>&1 && npm run gates 2>&1 | grep -c '_PASSED'"
  EXPECT: 13
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/nicolaskheirallah/Documents/GitHub/hanterill; path=be7a81e70570/29 entries; EXPECT=matched; output-sha256=1a252402972f6057fa53cc172b52b9ffca698e18311facd0f3b06ecaaef79e17; output-bytes=3

- [x] G4: prior corrections survive the rebuild — no simulated-vehicle or CLI CAN-lane wording in any built docs page, and the two new pages exist in both locales
  CHECK: node -e "const fs=require('fs'),p=require('path');let bad=[],found=0;const re=/SocketCAN|CANsub|choose a simulated vehicle|built-in .?Simulated vehicles|simulated readings|välj ett inbyggt simulerat fordon|inbyggda fordonsprofilerna|Starta demosession|Väckningssekvens|Direkt-IP|femstegs/i;const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name==='index.html'&&f.includes('/docs/')){const t=fs.readFileSync(f,'utf8');if(re.test(t))bad.push(f);if(/module-data|driving-display/.test(f))found++;}}};walk('out');if(bad.length||found<4){console.error('bad='+bad.length+' new='+found);process.exit(1);}console.log('REGRESSIONS_CLEAN')"
  EXPECT: REGRESSIONS_CLEAN
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/nicolaskheirallah/Documents/GitHub/hanterill; path=be7a81e70570/29 entries; EXPECT=matched; output-sha256=e872ff5117b9f9c6d756f1e2ea9b1a7f5b67605003b834ff192a7277be68cca3; output-bytes=18

- [x] G5: manual read-through of the prose authored this session for patterns no regex can judge — rule-of-three defaults, hedging seesaws, identical paragraph shapes, slop translates in Swedish
  EVIDENCE: Read module-data, driving-display, charging, parasitic-drain and subsystem-telemetry (EN+SV) plus sv/workspace-tour and sv/connection end to end. Fixed: the rule-of-three intro questions in module-data and driving-display (EN+SV) cut to two; "TCAM:s backup-batteri" aligned to the house term "reservbatteri"; pre-existing phantom-UI claims found during the read and removed (sv/architecture five-step "Väckningssekvens", sv/troubleshooting "Direkt-IP" tab and wake-button step, replaced with the app's real automatic gateway fallback and "Läs om saknade moduler" retry, mirroring the EN page). Checked and left alone: three-item enumerations that reflect genuinely three distinct items (readout callout, module-group bullets), paragraph-opener variety (stat-tile/page-lead sections start differently), no hedging seesaws — the docs take sides ("A 'likely' label is not noise; it is the difference between a checked number and an unchecked one"). A suspected "laddräknare" compound typo was byte-compared and confirmed already correct Swedish; no change made.
