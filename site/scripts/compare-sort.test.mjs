import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

// Pure logic of CompareView, SortBuckets and CodePlayground
// (src/components/learn/react/activity-logic.ts), transpiled on the fly.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const load = (relative, modules = {}) => {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: (name) => modules[name] ?? {}, Object, Number, Math, JSON, String, Array });
  return exports;
};
// Values from the vm realm have foreign prototypes; compare plain copies.
const plain = (value) => JSON.parse(JSON.stringify(value));
const hooks = load('../src/components/learn/react/hooks.ts', { react: {} });
const logic = load('../src/components/learn/react/activity-logic.ts', { './hooks': hooks });

test('metric winner respects lowerIsBetter and ties', () => {
  assert.equal(logic.metricWinner(10, 5), 'left');
  assert.equal(logic.metricWinner(10, 5, true), 'right');
  assert.equal(logic.metricWinner(3, 9, true), 'left');
  assert.equal(logic.metricWinner(4, 4), 'tie');
  assert.equal(logic.metricWinner(4, 4, true), 'tie');
  assert.equal(logic.metricWinner(NaN, 4), 'tie');
});

test('shared metrics keep only measures both sides report, with bar shares', () => {
  const rows = logic.sharedMetrics({ 'p99 latency': 120, cost: 3, only: 1 }, { cost: 6, 'p99 latency': 40 }, true);
  assert.deepEqual(plain(rows.map((r) => r.name)), ['p99 latency', 'cost']);
  assert.equal(rows[0].winner, 'right');
  assert.equal(rows[1].winner, 'left');
  assert.equal(rows[0].leftShare, 1);
  assert.equal(Math.round(rows[0].rightShare * 100), 33);
  assert.deepEqual(plain(logic.sharedMetrics(undefined, { a: 1 })), []);
});

test('sort grading counts right, wrong and unplaced items', () => {
  const items = [
    { text: 'TCP', bucket: 'Transport' },
    { text: 'HTTP', bucket: 'Application' },
    { text: 'UDP', bucket: 'Transport' },
  ];
  const grade = logic.gradeSort(items, { 0: 'Transport', 1: 'Transport' });
  assert.deepEqual(plain(grade.verdicts), { 0: true, 1: false });
  assert.equal(grade.correct, 1);
  assert.equal(grade.placed, 2);
  assert.equal(grade.total, 3);
  assert.equal(logic.gradeSort(items, { 0: 'Transport', 1: 'Application', 2: 'Transport' }).correct, 3);
});

test('the unsorted pool is shuffled deterministically', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((text) => ({ text, bucket: 'x' }));
  const first = logic.initialPool('Sort these', items);
  assert.deepEqual(plain(first), plain(logic.initialPool('Sort these', items)));
  assert.deepEqual(plain(first).sort(), [0, 1, 2, 3, 4]);
  assert.notDeepEqual(plain(first), [0, 1, 2, 3, 4]);
});

test('output comparison ignores line endings and trailing spaces', () => {
  assert.equal(logic.normalizeOutput('a  \r\nb\r\n\n'), 'a\nb');
  assert.equal(logic.compareOutput('1\r\n2 \n', '1\n2'), null);
  assert.deepEqual(plain(logic.compareOutput('1\n3', '1\n2')), { line: 2, got: '3', want: '2' });
  assert.deepEqual(plain(logic.compareOutput('1', '1\n2')), { line: 2, got: '(no line)', want: '2' });
});

test('the sandbox document blocks network and cannot close its script early', () => {
  const doc = logic.buildSrcdoc('console.log("</script><b>x</b>"); await 1;', 'run-1');
  assert.match(doc, /http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'"/);
  assert.doesNotMatch(doc, /allow-same-origin/);
  assert.doesNotMatch(doc, /unsafe-eval/);
  assert.equal(doc.match(/<\/script>/g).length, 2, 'only the two harness scripts close');
  assert.match(doc, /\(async function \(\) \{/);
  assert.match(doc, /"run-1"/);
});
