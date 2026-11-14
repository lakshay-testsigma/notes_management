import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { stageDigest } from '../lib/freshness.mjs';
import { DOMAIN, makeRoot, removeRoot, init, setPlan, planFor, tutorJson, write, read, readTopic, paths } from './support/helpers.mjs';

const id = `${DOMAIN}/messaging/redis-streams`;
function fixture(fn) {
  const root = makeRoot();
  try {
    init(root);
    setPlan(root, id, { ...planFor(5), curriculum: { schema: 1 } });
    return fn(root);
  } finally { removeRoot(root); }
}
function packet(root) { return tutorJson(root, ['review', id]).data; }
function reviewFor(root, scope = 'content', run = 'fresh-content-worker') {
  const p = packet(root), checks = p.required_checks[scope];
  return {
    scope, reviewer: 'Independent fixture reviewer', verdict: 'pass', checks,
    findings: [], not_checked: [], independent: true, reviewer_run_id: run,
    input_fingerprint: p.input_fingerprint,
    assessments: Object.fromEntries(checks.map(c => [c, `${c}: inspected fixture paths and source ids; no errors found.`])),
  };
}
function record(root, review) {
  write(root, 'tmp/review.json', JSON.stringify(review));
  return tutorJson(root, ['review', id, '--file', path.join(root, 'tmp/review.json')]);
}

test('review packet exposes all current checks without changing topic state', () => fixture(root => {
  const before = readTopic(root, id), p = packet(root);
  assert.equal(p.requires_isolated_review, true);
  for (const check of ['research-coverage', 'practical-depth', 'visual-usefulness', 'learner-fit']) assert.ok(p.required_checks.content.includes(check));
  assert.equal(p.input_fingerprint.length, 64);
  assert.deepEqual(readTopic(root, id), before);
}));
test('curriculum review rejects missing isolation, assessments, and stale evidence', () => fixture(root => {
  const review = reviewFor(root);
  delete review.independent;
  assert.match(record(root, review).data.error, /independent/);
  review.independent = true;
  review.assessments['research-coverage'] = '';
  assert.match(record(root, review).data.error, /assessments/);
  review.assessments['research-coverage'] = 'Inspected source-1 and concept note; valid.';
  write(root, `vault/${id}/concepts/new-redis-streams.md`, 'New generated concept content.');
  assert.match(record(root, review).data.error, /inputs changed/);
  assert.equal(record(root, reviewFor(root)).code, 0);
}));
test('standard curriculum content and projects require distinct reviewer runs', () => fixture(root => {
  assert.equal(record(root, reviewFor(root)).code, 0);
  assert.match(record(root, reviewFor(root, 'projects', 'fresh-content-worker')).data.error, /separate isolated/);
  assert.equal(record(root, reviewFor(root, 'projects', 'fresh-project-worker')).code, 0);
}));
test('unreviewed requirements and unresolved errors cannot be certified', () => fixture(root => {
  const review = reviewFor(root);
  review.not_checked = ['research-coverage'];
  assert.match(record(root, review).data.error, /left unreviewed/);
  review.not_checked = [];
  review.findings = [{ severity: 'error', problem: 'Source does not support claim' }];
  assert.match(record(root, review).data.error, /unresolved errors/);
}));
test('invalid review documents fail with a usage error', () => fixture(root => {
  for (const value of [null, [], { ...reviewFor(root), reviewer: 42 }, { ...reviewFor(root), checks: 'sources' }, { ...reviewFor(root), findings: [null] }]) {
    assert.equal(record(root, value).code, 2);
  }
  for (const scope of ['constructor', '__proto__', 'toString', ['content'], ['projects'], {}, null]) {
    assert.equal(record(root, { ...reviewFor(root), scope }).code, 2);
  }
}));
test('lesson fingerprints include supplemental concept notes and custom visual code', () => fixture(root => {
  const topic = readTopic(root, id);
  const before = stageDigest(root, topic, 'lesson');
  write(root, `vault/${id}/concepts/stream-redis-streams.md`, 'Concept content.\n\n## My insights\n');
  const after = stageDigest(root, topic, 'lesson');
  assert.notEqual(after, before);
  write(root, 'site/src/components/topics/redis-streams/Memory.tsx', 'export const value = 1;');
  assert.notEqual(stageDigest(root, topic, 'lesson'), after);
}));
test('lesson unit checks validate supplemental note frontmatter and insights', () => fixture(root => {
  const p = paths(root, id), note = `${p.curriculum_dir}/stream-redis-streams.md`;
  write(root, note, '# Unstructured generated content');
  const result = tutorJson(root, ['validate', id, 'lesson', '--files', note]);
  assert.equal(result.code, 1);
  assert.ok(result.data.failures.some(f => f.path === note && /frontmatter/.test(f.problem)));
}));
test('topic map lists supplied curriculum scope, available notes and deferrals', () => fixture(root => {
  const p = paths(root, id), note = `${p.curriculum_dir}/stream-redis-streams.md`;
  write(root, note, 'Generated concept note.');
  setPlan(root, id, { curriculum: { scope: 'Bounded delivery behavior', concepts: [
    { id: 'stream', title: 'Stream', disposition: 'included', coverage: [{ path: note }] },
    { id: 'cluster', title: 'Cluster', disposition: 'deferred', reason: 'Separate cluster topic required.' },
  ], discovery: [{ stop_reason: 'scope-boundary', note: 'Single-node only.' }] } });
  const text = read(root, p.start_here);
  assert.match(text, /Bounded delivery behavior/);
  assert.match(text, /\[\[stream-redis-streams\|Stream\]\]/);
  assert.match(text, /Cluster: deferred — Separate cluster topic/);
}));
