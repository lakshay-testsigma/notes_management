import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../src/lib/experience-logic.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const logic = {};
new Function('exports', compiled)(logic);
const { emptyStore, reduce, loadStore, saveStore, storageKey, answerChoice, evalCondition, sceneAt, crossedCheckpoint, deckPosition, exportProgress, weakSummary, islandJson } = logic;

const scenes = [
  { id: 'intro', start: 0, duration: 5 },
  { id: 'idea', start: 5, duration: 10 },
  { id: 'trace', start: 15, duration: 12 },
];
const predict = {
  id: 'which-half', kind: 'predict', at: { scene: 'trace' }, prompt: 'Which half?', explanation: 'Because sorted.', concept_ids: ['binary-search'],
  choices: [{ text: 'Right', correct: true }, { text: 'Left', misconception: 'Keeps the smaller half' }],
};

test('answers are graded and wrong answers carry their misconception', () => {
  assert.deepEqual({ ...answerChoice(predict, 0), choice: undefined }, { status: 'correct', correct: true, misconception: null, choice: undefined });
  const wrong = answerChoice(predict, 1);
  assert.equal(wrong.status, 'wrong');
  assert.equal(wrong.misconception, 'Keeps the smaller half');
  assert.equal(answerChoice(predict, 9).status, 'skipped');
});

test('goal conditions read dotted paths and every operator', () => {
  const snap = { live: 2, pending: 1, failed: ['s3', 's4', 's5'], vars: { found: 'no' }, done: true };
  assert.equal(evalCondition({ all: [{ path: 'live', op: 'lte', value: 2 }, { path: 'pending', op: 'gte', value: 1 }] }, snap), true);
  assert.equal(evalCondition({ path: 'vars.found', op: 'eq', value: 'no' }, snap), true);
  assert.equal(evalCondition({ path: 'failed', op: 'includes', value: 's4' }, snap), true);
  assert.equal(evalCondition({ path: 'live', op: 'gt', value: 2 }, snap), false);
  assert.equal(evalCondition({ path: 'live', op: 'ne', value: 3 }, snap), true);
  assert.equal(evalCondition({ path: 'missing.deep', op: 'eq', value: 1 }, snap), false);
  assert.equal(evalCondition({ path: 'done', op: 'eq', value: true }, null), false);
  assert.equal(evalCondition({ all: [] }, snap), false);
});

test('scenes and checkpoints follow the timeline; seeking back never fires a checkpoint', () => {
  assert.equal(sceneAt(scenes, 0).id, 'intro');
  assert.equal(sceneAt(scenes, 14.9).id, 'idea');
  assert.equal(sceneAt(scenes, 99).id, 'trace');
  assert.equal(crossedCheckpoint(14.5, 15.1, scenes, [predict], {}).id, 'which-half');
  assert.equal(crossedCheckpoint(15.1, 15.4, scenes, [predict], {}), null);
  assert.equal(crossedCheckpoint(20, 10, scenes, [predict], {}), null);
  assert.equal(crossedCheckpoint(14.5, 15.1, scenes, [predict], { 'which-half': true }), null);
  assert.equal(crossedCheckpoint(0, 30, scenes, [predict], {}).id, 'which-half', 'a jump over the scene start still pauses');
  const deck = [{ id: 'q', start: 0, duration: 4, sequence: null }, { id: 'b1', start: 4, duration: 4, sequence: 'traffic' }];
  assert.deepEqual(deckPosition(deck, 5), { scene: 'b1', sequence: 'traffic' });
  assert.deepEqual(deckPosition(deck, 1), { scene: 'q', sequence: null });
});

test('the store records attempts, slides and branches; export matches the harness format', () => {
  let s = emptyStore();
  s = reduce(s, { type: 'tab', tab: 'guided' });
  s = reduce(s, { type: 'record', id: 'which-half', status: 'wrong', answer: 1, misconception: 'Keeps the smaller half', at: '2026-11-14T10:00:00Z' });
  s = reduce(s, { type: 'record', id: 'which-half', status: 'correct', answer: 0, at: '2026-11-14T10:01:00Z' });
  s = reduce(s, { type: 'slide', scene: 'b1', sequence: 'traffic' });
  s = reduce(s, { type: 'slide', scene: 'b1', sequence: 'traffic' });
  s = reduce(s, { type: 'watched', video: 'v', seconds: 12.34 });
  s = reduce(s, { type: 'watched', video: 'v', seconds: 3 });
  assert.equal(s.checkpoints['which-half'].history.length, 2);
  assert.deepEqual(s.visited_slides, ['b1']);
  assert.deepEqual(s.branches, ['traffic']);
  assert.equal(s.watched.v, 12.3);
  const weak = weakSummary([predict], s);
  assert.deepEqual(weak, [{ concept: 'binary-search', wrong: 1, misconceptions: ['Keeps the smaller half'] }]);
  const out = exportProgress('a/b/c', { lab: s }, '2026-11-14T11:00:00Z');
  assert.equal(out.format, 'tutor-progress');
  assert.equal(out.v, 1);
  assert.equal(out.experiences.lab.checkpoints['which-half'].status, 'correct');
  assert.equal(out.experiences.lab.checkpoints['which-half'].history[0].misconception, 'Keeps the smaller half');
  assert.equal(reduce(s, { type: 'reset' }).checkpoints['which-half'], undefined);
});

test('storage failures fall back to an empty store', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {} };
  assert.deepEqual(loadStore(broken, 't', 'e'), emptyStore());
  assert.equal(saveStore(broken, 't', 'e', emptyStore()), false);
  const map = new Map();
  const memory = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v), removeItem: (k) => map.delete(k) };
  const s = reduce(emptyStore(), { type: 'tab', tab: 'explore' });
  assert.equal(saveStore(memory, 't', 'e', s), true);
  assert.equal(loadStore(memory, 't', 'e').tab, 'explore');
  assert.equal(storageKey('t', 'e'), 'tutor:exp:t:e');
  map.set('tutor:exp:t:e', '{not json');
  assert.deepEqual(loadStore(memory, 't', 'e'), emptyStore());
  assert.ok(!islandJson({ a: '</script>' }).includes('</'));
});
