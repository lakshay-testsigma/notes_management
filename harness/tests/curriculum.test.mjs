import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { curriculumProblems, COVERAGE_ASPECTS } from '../lib/curriculum.mjs';
import { createContext } from '../lib/validators/context.mjs';
import { addSources, DOMAIN, init, makeRoot, paths, planFor, readTopic, removeRoot, setPlan, tutorJson, write } from './support/helpers.mjs';

const ID = `${DOMAIN}/messaging/redis-streams`;
const concept = (id = 'streams', parent = null) => ({
  id, parent, title: id, complexity: 'intermediate', importance: 'core', disposition: 'included', source_ids: ['source-1'],
});
const curriculum = () => ({
  schema: 1, scope: 'Stream delivery and consumer groups; unrelated Redis features excluded.', max_depth: 3, max_concepts: 20,
  concepts: [concept(), concept('consumer-groups', 'streams')],
  discovery: [
    { round: 1, frontier: ['streams'], source_ids: ['source-1'], added: ['streams', 'consumer-groups'] },
    { round: 2, frontier: ['consumer-groups'], source_ids: ['source-1'], added: [], stop_reason: 'scope-boundary', note: 'Both core concepts expanded; cluster operations belong to a separate topic.' },
  ],
});

function fixture(run) {
  const root = makeRoot();
  try {
    init(root);
    addSources(root, ID, 5);
    const topic = readTopic(root, ID);
    topic.plan.curriculum = curriculum();
    const ctx = createContext(root, topic);
    run({ root, ctx, curriculum: topic.plan.curriculum });
  } finally { removeRoot(root); }
}

test('legacy plans opt out; intake permits discovery and sources still being collected', () => fixture(({ ctx, curriculum: c }) => {
  delete ctx.topic.plan.curriculum;
  assert.deepEqual(curriculumProblems(ctx, 'finalize'), []);
  ctx.topic.plan.curriculum = c;
  delete c.discovery;
  c.concepts.forEach(item => { item.source_ids = []; });
  assert.deepEqual(curriculumProblems(ctx, 'intake'), []);
  assert.match(curriculumProblems(ctx, 'research').join('\n'), /needs non-empty source_ids/);
}));

test('bounded concept trees reject cycles, dangling parents, duplicate ids and excessive scope', () => fixture(({ ctx, curriculum: c }) => {
  assert.deepEqual(curriculumProblems(ctx, 'intake'), []);
  c.max_depth = 1;
  c.max_concepts = 2;
  c.concepts.push(concept('pending', 'consumer-groups'));
  let problems = curriculumProblems(ctx, 'intake').join('\n');
  assert.match(problems, /exceeding max_concepts/);
  assert.match(problems, /depth 2 exceeds max_depth 1/);
  c.concepts.push(concept('streams', 'missing'));
  c.concepts[0].parent = 'consumer-groups';
  problems = curriculumProblems(ctx, 'intake').join('\n');
  assert.match(problems, /duplicate concept id streams/);
  assert.match(problems, /unknown parent missing/);
  assert.match(problems, /cycle/);
}));

test('nonincluded concepts need an explicit reason and cannot parent included concepts', () => fixture(({ ctx, curriculum: c }) => {
  c.concepts[0].disposition = 'deferred';
  let problems = curriculumProblems(ctx, 'intake').join('\n');
  assert.match(problems, /needs a reason/);
  assert.match(problems, /deferred or excluded parent/);
  c.concepts[0].reason = 'Separate prerequisite topic.';
  c.concepts[1].disposition = 'excluded';
  c.concepts[1].reason = 'Outside this learning scope.';
  problems = curriculumProblems(ctx, 'intake').join('\n');
  assert.match(problems, /at least one included concept/);
}));

test('research requires vetted concept and round sources, all discoveries, expansion and explicit stopping', () => fixture(({ ctx, curriculum: c }) => {
  assert.deepEqual(curriculumProblems(ctx, 'research'), []);
  c.concepts[1].source_ids = ['invented'];
  c.discovery[0].added = ['streams'];
  c.discovery[1].frontier = [];
  c.discovery[1].source_ids = ['invented'];
  delete c.discovery[1].stop_reason;
  const problems = curriculumProblems(ctx, 'research').join('\n');
  assert.match(problems, /concept consumer-groups cites unknown source invented/);
  assert.match(problems, /round 2 cites unknown source invented/);
  assert.match(problems, /not recorded in discovery.added/);
  assert.match(problems, /never expanded/);
  assert.match(problems, /final discovery round needs stop_reason/);
}));

test('malformed concept and discovery shapes report errors without crashing', () => fixture(({ ctx, curriculum: c }) => {
  c.concepts.push(null, 42, {});
  c.discovery[0].added = { includes: 42 };
  c.discovery[1].frontier = { includes: 42 };
  c.discovery.push(null);
  const problems = curriculumProblems(ctx, 'finalize').join('\n');
  assert.match(problems, /must be an object/);
  assert.match(problems, /stable lowercase id/);
}));

test('discovery follows parent frontiers and expands newly found children in later rounds', () => fixture(({ ctx, curriculum: c }) => {
  c.discovery[0].frontier.push('consumer-groups');
  assert.match(curriculumProblems(ctx, 'research').join('\n'), /expands consumer-groups before it was discovered/);
  c.discovery[0].frontier = [];
  assert.match(curriculumProblems(ctx, 'research').join('\n'), /adds consumer-groups without expanding parent streams/);
  c.discovery[0].frontier = ['streams'];
  assert.deepEqual(curriculumProblems(ctx, 'research'), []);
}));

test('coverage proves file traceability for all six teaching aspects in generated regions', () => fixture(({ ctx, root, curriculum: c }) => {
  const file = `${ctx.topic.paths.vault}/concepts/streams-redis-streams.md`;
  write(root, file, '# Stream model\n\n<!-- concept: streams -->\n<!-- concept: consumer-groups -->\nExplanation and practice for both.\n\n## My insights\n');
  for (const item of c.concepts) item.coverage = [{ path: file, aspects: [...COVERAGE_ASPECTS], anchor: '# Stream model' }];
  assert.deepEqual(curriculumProblems(ctx, 'finalize'), []);
  c.concepts[0].coverage[0].aspects.pop();
  assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /coverage omits practice/);
  c.concepts[0].coverage[0].aspects.push('practice');
  write(root, file, '# Stream model\n\n## My insights\n<!-- concept: streams -->\n<!-- concept: consumer-groups -->\n');
  assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /lacks <!-- concept: streams --> in its generated region/);
}));

test('coverage rejects traversal, unrelated topics, learner insights and symlink escape', () => fixture(({ ctx, root, curriculum: c }) => {
  const p = paths(root, ID);
  const symlink = `${p.vault_dir}/concepts/link.md`;
  write(root, 'outside.md', '<!-- concept: streams -->');
  fs.mkdirSync(path.dirname(path.join(root, symlink)), { recursive: true });
  fs.symlinkSync(path.join(root, 'outside.md'), path.join(root, symlink));
  for (const relative of ['../outside.md', 'vault/another/topic.md', p.insights, symlink]) {
    c.concepts[0].coverage = [{ path: relative, aspects: [...COVERAGE_ASPECTS] }];
    assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /must be a generated .md\/.mdx file inside this topic/);
  }
}));

function adaptiveCoverage({ ctx, root, curriculum: c }) {
  ctx.topic.plan.visual_policy = 'adaptive';
  ctx.topic.plan.lesson_outline = [{ order: 1, slug: 'consumer-groups', complexity: 'intermediate', importance: 'core', visual: 'FlowAnimation' }];
  c.concepts[0].complexity = 'basic';
  const note = `${ctx.topic.paths.vault}/concepts/streams-redis-streams.md`;
  const lesson = `${ctx.topic.paths.lessons}/01-consumer-groups.mdx`;
  write(root, note, '# Model\n<!-- concept: streams -->\n<!-- concept: consumer-groups -->\n## My insights\n');
  write(root, lesson, '# Delivery\n<!-- concept: consumer-groups -->\n');
  c.concepts.forEach(item => { item.coverage = [{ path: note, aspects: [...COVERAGE_ASPECTS] }]; });
  return { note, lesson, child: c.concepts[1], page: ctx.topic.plan.lesson_outline[0] };
}

test('adaptive curricula require visual lesson coverage for nonbasic or critical concepts', () => fixture(data => {
  const { ctx, curriculum: c } = data;
  const { child, lesson, page } = adaptiveCoverage(data);
  assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /consumer-groups needs coverage by a planned MDX lesson/);
  child.coverage.push({ path: lesson, aspects: ['mechanism'] });
  assert.deepEqual(curriculumProblems(ctx, 'finalize'), []);
  page.complexity = 'basic';
  assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /complexity at least intermediate/);
  child.complexity = 'basic';
  child.coverage.pop();
  assert.deepEqual(curriculumProblems(ctx, 'finalize'), []);
  c.concepts[0].importance = 'critical';
  assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /streams needs coverage by a planned MDX lesson.*critical importance/);
}));

test('adaptive critical coverage respects advanced complexity, importance and a nonnull visual', () => fixture(data => {
  const { ctx } = data;
  const { child, lesson, page } = adaptiveCoverage(data);
  child.complexity = 'advanced';
  child.importance = 'critical';
  child.coverage.push({ path: lesson, aspects: ['mechanism'] });
  page.complexity = 'advanced';
  page.importance = 'critical';
  assert.deepEqual(curriculumProblems(ctx, 'finalize'), []);
  for (const patch of [{ complexity: 'intermediate' }, { importance: 'core' }, { visual: null }]) {
    const previous = { ...page };
    Object.assign(page, patch);
    assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /consumer-groups needs coverage by a planned MDX lesson/);
    Object.assign(page, previous);
  }
}));

test('adaptive coverage matches the exact outlined filename and generated concept marker', () => fixture(data => {
  const { ctx, root } = data;
  const { child, lesson } = adaptiveCoverage(data);
  child.coverage.push({ path: lesson, aspects: ['mechanism'] });
  assert.deepEqual(curriculumProblems(ctx, 'finalize'), []);
  const wrong = `${ctx.topic.paths.lessons}/01-other-name.mdx`;
  write(root, wrong, '<!-- concept: consumer-groups -->\n');
  child.coverage[1].path = wrong;
  assert.match(curriculumProblems(ctx, 'finalize').join('\n'), /outline's exact NN-slug.mdx filename/);
  child.coverage[1].path = lesson;
  write(root, lesson, '# Delivery without a marker\n');
  const problems = curriculumProblems(ctx, 'finalize').join('\n');
  assert.match(problems, /lacks <!-- concept: consumer-groups -->/);
  assert.match(problems, /needs coverage by a planned MDX lesson/);
}));

test('CLI intake and research gates enforce curriculum through persisted plan projection', () => {
  const root = makeRoot();
  try {
    init(root);
    addSources(root, ID, 5);
    const c = curriculum();
    const plan = { ...planFor(5), curriculum: c };
    setPlan(root, ID, plan);
    assert.equal(tutorJson(root, ['validate', ID, 'intake', '--structure-only']).code, 0);
    assert.equal(tutorJson(root, ['validate', ID, 'research', '--structure-only']).code, 0);
    c.max_concepts = 1;
    setPlan(root, ID, plan);
    const result = tutorJson(root, ['validate', ID, 'intake', '--structure-only']);
    assert.equal(result.code, 1);
    assert.match(result.data.failures.map(f => f.problem).join('\n'), /exceeding max_concepts/);
    c.max_concepts = 20;
    c.discovery = [];
    setPlan(root, ID, plan);
    const research = tutorJson(root, ['validate', ID, 'research', '--structure-only']);
    assert.equal(research.code, 1);
    assert.match(research.data.failures.map(f => f.problem).join('\n'), /live research round/);
  } finally { removeRoot(root); }
});
