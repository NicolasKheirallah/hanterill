import fs from 'node:fs';
import vm from 'node:vm';
import { brotliDecompressSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { test } from 'node:test';

// Exercise the shipped hook without publishing desktop source or modified binaries.
// Usage: node --experimental-vm-modules regression.mjs /path/to/hanterill-desktop [--apply-fix]
const executable = process.argv[2];
if (!executable) throw new Error('Pass the Hanterill 0.2.2 macOS executable path.');
const binary = fs.readFileSync(executable);
const assetName = Buffer.from('/assets/appSettings-BAqacK6a.js');
const assetOffset = binary.indexOf(assetName);
assert.ok(assetOffset >= 0, 'Expected the Hanterill 0.2.2 appSettings asset.');
const pointer = Buffer.alloc(8);
pointer.writeBigUInt64LE(0x100000000n + BigInt(assetOffset));
const entry = binary.indexOf(pointer);
assert.ok(entry >= 0, 'Expected the asset table entry.');
const offset = Number(binary.readBigUInt64LE(entry + 16) - 0x100000000n);
const size = Number(binary.readBigUInt64LE(entry + 24));
assert.ok(offset >= 0 && size > 0 && offset + size <= binary.length);
let code = brotliDecompressSync(binary.subarray(offset, offset + size)).toString('utf8');
if (process.argv.includes('--apply-fix')) {
  const original = 'quietWindowMs:te,provesLiveness:ne,cancel:';
  const fixed = 'quietWindowMs:te,provesLiveness:e=>ne(e)||g.current?.type===`startLive`&&e.event.type===`observationBatch`&&e.event.count>0,cancel:';
  assert.equal(code.split(original).length, 2, 'Expected exactly one original liveness policy.');
  code = code.replace(original, fixed);
}
async function harness(command = { type: 'startLive', channelKeys: ['becm_12v_V'], intervalMs: 500 }) {
  let now = 0, nextTimer = 0, stateIndex = 0, listener;
  const timers = new Map(), state = [], effects = [], commands = [];
  const hooks = {
    useState(initial) { const index = stateIndex++; state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => state[index] = value]; },
    useRef(current) { return { current }; },
    useCallback(callback) { return callback; },
    useEffect(effect) { effects.push(effect); },
  };
  const context = vm.createContext({
    console, __TAURI_INTERNALS__: {},
    window: { location: { pathname: '/live' },
      setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
  });
  const runtime = new vm.SyntheticModule(['r'], function() { this.setExport('r', value => value); }, { context });
  const vendor = new vm.SyntheticModule(['_n', 'mn', 'pn'], function() {
    this.setExport('_n', () => hooks);
    this.setExport('mn', async (_name, { command }) => { commands.push(command); return command.type === 'startLive' || command.type === 'scanDtcs' ? { type: 'accepted', operationId: 68 } : { type: 'done', json: '{}' }; });
    this.setExport('pn', async (_channel, fn) => { listener = fn; return () => {}; });
  }, { context });
  const bundle = new vm.SourceTextModule(code, { context });
  await bundle.link(name => name.includes('rolldown-runtime') ? runtime : vendor);
  await bundle.evaluate();
  const operation = bundle.namespace.f(() => undefined);
  effects.forEach(effect => effect());
  await Promise.resolve();
  await operation.run(command);
  function advance(ms) {
    const target = now + ms;
    for (;;) {
      const next = [...timers].filter(([, value]) => value.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    now = target;
  }
  return { operation, state, commands, advance,
    emit(event, operationId = 68) { listener({ payload: { version: { major: 1, minor: 0 }, operationId, sequence: now, timestamp: now, event } }); },
    cancelled() { return commands.filter(command => command.type === 'cancel').length; },
  };
}
const batch = { type: 'observationBatch', count: 1, json: '[{"channelKey":"becm_12v_V","value":14.8,"capturedMs":1}]' };
test('live samples keep the actual operation hook active for three minutes', async () => {
  const h = await harness();
  for (let i = 0; i < 18; i++) { h.advance(10000); h.emit(batch); }
  assert.equal(h.cancelled(), 0); assert.equal(h.state[0], 'running');
});
test('a silent live stream still cancels at 45 seconds', async () => {
  const h = await harness(); h.advance(44999); assert.equal(h.cancelled(), 0);
  h.advance(1); assert.equal(h.cancelled(), 1); assert.equal(h.state[2].code, 'stalled');
});
test('silence after the last sample starts a fresh 45-second window', async () => {
  const h = await harness(); h.advance(40000); h.emit(batch); h.advance(44999); assert.equal(h.cancelled(), 0);
  h.advance(1); assert.equal(h.cancelled(), 1);
});
test('batches from another operation do not extend the timer', async () => {
  const h = await harness(); h.advance(40000); h.emit(batch, 67); h.advance(5000); assert.equal(h.cancelled(), 1);
});
test('empty sample batches do not extend the timer', async () => {
  const h = await harness(); h.advance(40000); h.emit({ ...batch, count: 0, json: '[]' }); h.advance(5000); assert.equal(h.cancelled(), 1);
});
test('non-live operations retain the original progress-only timeout', async () => {
  const h = await harness({ type: 'scanDtcs' }); h.advance(40000); h.emit(batch); h.advance(5000); assert.equal(h.cancelled(), 1);
});
test('ordinary scan progress still extends the timer', async () => {
  const h = await harness({ type: 'scanDtcs' }); h.advance(40000); h.emit({ type: 'progress', progress: { phase: 'scan', completed: 1, total: 2 } }); h.advance(40000); assert.equal(h.cancelled(), 0);
});
test('terminal completion disarms the timer', async () => {
  const h = await harness(); h.emit({ type: 'terminal', state: { type: 'completed' } }); h.advance(180000); assert.equal(h.cancelled(), 0); assert.equal(h.state[0], 'done');
});
