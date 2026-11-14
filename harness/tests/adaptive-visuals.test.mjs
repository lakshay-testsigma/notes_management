import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adaptiveVisualProblems } from '../lib/visual-policy.mjs';
import { loadComponentKinds } from '../lib/components.mjs';
import { checkLessonPage } from '../lib/validators/lesson.mjs';
import { DOMAIN, init, lessonPage, makeRoot, planFor, removeRoot, setPlan, tutorJson, write, writeLessons } from './support/helpers.mjs';

const kinds = loadComponentKinds(process.cwd());
const basic = {
  order: 1, slug: 'page-1', title: 'A familiar command', activity: 'Quiz',
  complexity: 'basic', importance: 'supporting', spatial: false, visual: null,
  visual_reason: 'The developer already knows this syntax; a decision exercise is sufficient.',
};
const advanced = { ...basic, complexity: 'advanced', spatial: true, visual: 'Graph3D',
  visual_reason: 'Changing graph edges exposes dependency reachability.',
  interaction_goal: 'Add an edge and predict which nodes become reachable.',
};

test('adaptive basic pages omit decorative visuals while legacy pages require them', () => {
  const text = lessonPage({ visual: false });
  assert.deepEqual(checkLessonPage('01-page-1.mdx', text, kinds, { adaptive: true, outline: basic }).failures, []);
  assert.ok(checkLessonPage('01-page-1.mdx', text, kinds).failures.some(f => f.problem === 'has no visual component'));
});

test('importance and complexity require appropriate visual decisions', () => {
  assert.match(adaptiveVisualProblems({ ...basic, importance: 'critical' }, kinds).join('|'), /requires a visual/);
  assert.match(adaptiveVisualProblems({ ...basic, complexity: 'intermediate' }, kinds).join('|'), /requires a visual/);
  assert.match(adaptiveVisualProblems({ ...advanced, visual: 'Chart' }, kinds).join('|'), /requires Graph3D or VectorSpace3D/);
  assert.match(adaptiveVisualProblems({ ...advanced, spatial: false }, kinds).join('|'), /nonspatial mechanism requires/);
  assert.deepEqual(adaptiveVisualProblems({ ...advanced, spatial: false, visual: 'ParamPlayground' }, kinds), []);
  assert.match(adaptiveVisualProblems({ ...advanced, interaction_goal: '' }, kinds).join('|'), /interaction_goal/);
  assert.match(adaptiveVisualProblems({ ...basic, visual: 'VectorSpace3D', interaction_goal: 'Move query.' }, kinds).join('|'), /3D requires/);
});

test('adaptive lesson checks the planned visual on its own page and graph editability', () => {
  const missing = checkLessonPage('01-page-1.mdx', lessonPage(), kinds, { adaptive: true, outline: advanced });
  assert.ok(missing.failures.some(f => /does not use its planned visual/.test(f.problem)));
  const graphText = lessonPage({ visual: false, extra: '<Graph3D nodes={[]} links={[]} />' });
  assert.ok(checkLessonPage('01-page-1.mdx', graphText, kinds, { adaptive: true, outline: advanced }).failures.some(f => /no editable interaction/.test(f.problem)));
  const editable = graphText.replace('<Graph3D ', '<Graph3D editable ');
  assert.deepEqual(checkLessonPage('01-page-1.mdx', editable, kinds, { adaptive: true, outline: advanced }).failures, []);
  assert.deepEqual(checkLessonPage('01-page-1.mdx', graphText.replace('<Graph3D ', '<Graph3D editable={true} '), kinds, { adaptive: true, outline: advanced }).failures, []);
});

test('adaptive lessons retain activities, prose bounds, no-box style and explicit omissions', () => {
  const check = options => checkLessonPage('01-page-1.mdx', lessonPage({ visual: false, ...options }), kinds, { adaptive: true, outline: basic }).failures;
  assert.ok(check({ activity: false }).some(f => /no activity/.test(f.problem)));
  assert.ok(check({ words: 60 }).some(f => /minimum is 110/.test(f.problem)));
  assert.ok(check({ extra: '> A box.' }).some(f => /blockquote/.test(f.problem)));
  assert.ok(check({ visual: true }).some(f => /adaptive plan omits/.test(f.problem)));
  assert.ok(checkLessonPage('01-other.mdx', lessonPage({ visual: false }), kinds, { adaptive: true, outline: basic }).failures.some(f => /planned file/.test(f.problem)));
});

test('CLI gates allow all-basic adaptive topics without a blanket flow and reject malformed decisions', () => {
  const root = makeRoot();
  const id = `${DOMAIN}/messaging/redis-streams`;
  try {
    init(root);
    const plan = planFor(5);
    plan.visual_policy = 'adaptive';
    plan.lesson_outline = plan.lesson_outline.map(entry => ({ ...basic, ...entry, visual: null }));
    assert.equal(setPlan(root, id, plan).data.intake_gate.ok, true);
    writeLessons(root, id, 5);
    const lessons = `site/src/content/lessons/${id}`;
    for (let i = 1; i <= 5; i++) write(root, `${lessons}/0${i}-page-${i}.mdx`, lessonPage({ order: i, visual: false, last: i === 5 }));
    const result = tutorJson(root, ['validate', id, 'lesson', '--structure-only']);
    assert.equal(result.code, 0, JSON.stringify(result.data));
    plan.lesson_outline[0].complexity = 'advanced';
    assert.equal(setPlan(root, id, plan).data.intake_gate.ok, false);
    const failed = tutorJson(root, ['validate', id, 'lesson', '--files', `${lessons}/01-page-1.mdx`]);
    assert.equal(failed.code, 1);
    assert.ok(failed.data.failures.some(f => /requires a visual/.test(f.problem)));
  } finally { removeRoot(root); }
});

test('full adaptive lesson gates require every outlined page, including hard and final pages', () => {
  const root = makeRoot(), id = `${DOMAIN}/messaging/redis-streams`;
  try {
    init(root);
    const plan = planFor(7);
    plan.visual_policy = 'adaptive';
    plan.lesson_outline = plan.lesson_outline.map(entry => ({ ...basic, ...entry, visual: null }));
    plan.lesson_outline[5] = { ...advanced, order: 6, slug: 'page-6' };
    assert.equal(setPlan(root, id, plan).data.intake_gate.ok, true);
    writeLessons(root, id, 5);
    const lessons = `site/src/content/lessons/${id}`;
    for (let i = 1; i <= 5; i++) write(root, `${lessons}/0${i}-page-${i}.mdx`, lessonPage({ order: i, visual: false }));
    const full = tutorJson(root, ['validate', id, 'lesson', '--structure-only']);
    assert.equal(full.code, 1);
    for (const name of ['06-page-6.mdx', '07-page-7.mdx']) assert.ok(full.data.failures.some(f => f.problem.includes(name)));
    assert.equal(tutorJson(root, ['validate', id, 'lesson', '--files', `${lessons}/01-page-1.mdx`]).code, 0);
  } finally { removeRoot(root); }
});
