import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../src/components/learn/react/stepper.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const s = {};
new Function('exports', compiled)(s);

test('frame indexes are clamped to the trace', () => {
  assert.equal(s.clampFrame(-3, 5), 0);
  assert.equal(s.clampFrame(9, 5), 4);
  assert.equal(s.clampFrame(2.4, 5), 2);
  assert.equal(s.clampFrame(3, 0), 0);
  assert.deepEqual(s.forward({ index: 4, playing: false }, 5), { index: 4, playing: false });
  assert.deepEqual(s.back({ index: 0, playing: true }, 5), { index: 0, playing: false });
  assert.deepEqual(s.seek({ index: 1, playing: true }, 99, 5), { index: 4, playing: false });
});

test('reset returns to the first frame and stops playback', () => {
  assert.deepEqual(s.resetStepper(), { index: 0, playing: false });
});

test('play stops on the last frame and restarts from the beginning', () => {
  let state = s.togglePlay({ index: 0, playing: false }, 3);
  assert.equal(state.playing, true);
  state = s.playTick(state, 3);
  assert.deepEqual(state, { index: 1, playing: true });
  state = s.playTick(state, 3);
  assert.deepEqual(state, { index: 2, playing: false });
  assert.deepEqual(s.playTick(state, 3), state);
  assert.deepEqual(s.togglePlay(state, 3), { index: 0, playing: true });
  assert.equal(s.togglePlay({ index: 0, playing: false }, 1).playing, false);
});
