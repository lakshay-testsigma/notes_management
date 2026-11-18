import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { DOMAIN, makeRoot, read, readTopic, removeRoot, tutor, tutorJson, write } from './support/helpers.mjs';

const ROADMAP = {
  title: 'Test Engineering Mastery',
  intro: ['One path through test engineering.'],
  phases: [
    {
      id: 'p00', num: '00', title: 'Foundations (Start Here)', blurb: 'Basics first.',
      sections: [
        { num: '00.1', title: 'Unit testing basics', notes: [], items: [
          { id: 'assertions', title: 'Assertions', level: 'core', desc: 'Check one result.', details: [] },
          { id: 'test-doubles', title: 'Test doubles', level: 'adv', desc: 'Fakes, stubs, mocks.', details: [{ key: 'Docs', value: 'See the guide.' }] },
        ] },
        { num: '00.2', title: 'Reference table', notes: ['| Tool | Use |', '| --- | --- |', '| x | y |'], items: [] },
      ],
    },
    {
      id: 'p01', num: '01', title: 'Integration', blurb: '',
      sections: [
        { num: '01.1', title: 'Contract tests', notes: [], items: [
          { id: 'consumer-contracts', title: 'Consumer contracts', level: 'opt', desc: '', details: [] },
        ] },
      ],
    },
  ],
};

const asHtml = (data) => `<!doctype html><html><head><title>x</title></head><body><script>\nconst DATA = ${JSON.stringify(data)};\n</script></body></html>`;

function fixture(fn) {
  const root = makeRoot();
  try { return fn(root); } finally { removeRoot(root); }
}

function addFromHtml(root) {
  write(root, 'input/roadmap.html', asHtml(ROADMAP));
  return tutorJson(root, ['roadmap', 'add', '--file', 'input/roadmap.html', '--domain', DOMAIN, '--slug', 'testing']);
}

function curriculum(items, override = {}) {
  const concepts = [{ id: 'unit-testing', title: 'Unit testing', parent: null, complexity: 'basic', importance: 'core', disposition: 'included' }];
  for (const item of items) {
    concepts.push({ id: item.id, title: item.title, parent: 'unit-testing', complexity: item.level === 'adv' ? 'intermediate' : 'basic', importance: 'core', disposition: 'included', roadmap_items: [item.id], ...(override[item.id] ?? {}) });
  }
  return { curriculum: { schema: 1, scope: 'Unit testing basics.', max_depth: 2, max_concepts: 30, concepts } };
}

test('roadmap add imports an HTML roadmap, plans one topic per section with items, and writes the views', () => fixture((root) => {
  const added = addFromHtml(root);
  assert.equal(added.code, 0, JSON.stringify(added.data));
  assert.equal(added.data.totals.topics, 2, 'the reference section has no topic');
  assert.equal(added.data.totals.items, 3);

  const stored = JSON.parse(read(root, 'state/roadmaps/testing/roadmap.json'));
  assert.equal(stored.phases[0].subdomain, 'foundations');
  assert.equal(stored.phases[0].sections[0].topic.id, `${DOMAIN}/foundations/unit-testing-basics`);
  assert.equal(stored.phases[0].sections[1].topic, null);
  assert.ok(fs.existsSync(path.join(root, 'state/roadmaps/testing/source.html')));

  const html = read(root, 'site/public/roadmaps/testing.html');
  assert.match(html, /<title>Test Engineering Mastery<\/title>/);
  assert.match(html, /tutor-roadmap:testing:v1/);
  assert.match(html, /Not generated yet/);
  assert.doesNotMatch(html, /\/\*ROADMAP_/);

  const note = read(root, 'vault/_roadmaps/testing.md');
  assert.match(note, /## My insights/);
  assert.match(note, /\*\*00\.1\*\* Unit testing basics — Not generated yet · 2 items/);
  assert.match(read(root, 'vault/Home.md'), /\[\[_roadmaps\/testing\|Test Engineering Mastery\]\] — 0\/2 topics ready/);

  const again = addFromHtml(root);
  assert.equal(again.code, 2, 'an existing roadmap is never overwritten');
}));

test('roadmap next names the first open section with its exact init command; init links only the planned topic', () => fixture((root) => {
  addFromHtml(root);
  const next = tutorJson(root, ['roadmap', 'next', 'testing']);
  assert.equal(next.code, 0);
  assert.equal(next.data.next.section, '00.1');
  assert.deepEqual(next.data.next.items.map((i) => i.id), ['assertions', 'test-doubles']);
  assert.match(next.data.next.action.command, /--roadmap testing --section 00\.1$/);

  const wrong = tutor(root, ['init', 'Other', '--domain', DOMAIN, '--subdomain', 'misc', '--roadmap', 'testing', '--section', '00.1']);
  assert.equal(wrong.code, 2);
  assert.match(wrong.stderr, /is planned as topic/);
  const reference = tutor(root, ['init', 'Ref', '--domain', DOMAIN, '--subdomain', 'foundations', '--roadmap', 'testing', '--section', '00.2']);
  assert.equal(reference.code, 2);

  const created = tutorJson(root, ['init', 'Unit testing basics', '--domain', DOMAIN, '--subdomain', 'foundations', '--slug', 'unit-testing-basics', '--roadmap', 'testing', '--section', '00.1']);
  assert.equal(created.code, 0, JSON.stringify(created.data));
  assert.deepEqual(readTopic(root, `${DOMAIN}/foundations/unit-testing-basics`).roadmap, { id: 'testing', section: '00.1' });

  const status = tutorJson(root, ['roadmap', 'status', 'testing']);
  assert.equal(status.data.sections[0].status, 'in-progress');
  assert.equal(status.data.sections[1].status, 'not-started');
  const resumed = tutorJson(root, ['roadmap', 'next', 'testing']).data;
  assert.equal(resumed.next.action.kind, 'resume');
  assert.equal(resumed.lookahead.section, '01.1', 'one in-progress section allows one lookahead');
  assert.match(resumed.lookahead.init_command, /--roadmap testing --section 01\.1$/);
  assert.match(read(root, 'site/public/roadmaps/testing.html'), /Being generated/);

  tutorJson(root, ['init', 'Contract tests', '--domain', DOMAIN, '--subdomain', 'integration', '--slug', 'contract-tests', '--roadmap', 'testing', '--section', '01.1']);
  const both = tutorJson(root, ['roadmap', 'next', 'testing']).data;
  assert.equal(both.next.section, '00.1', 'the earlier in-progress section stays first');
  assert.equal(both.lookahead, null, 'never more than two topics active');
}));

test('roadmap inbox lists inputs/ files as new, imported, changed, or needing conversion', () => fixture((root) => {
  assert.equal(tutorJson(root, ['roadmap', 'inbox']).data.count, 0);
  write(root, 'inputs/README.md', 'ignored');
  write(root, 'inputs/testing.html', asHtml(ROADMAP));
  write(root, 'inputs/topics.md', '- Assertions\n- Mocks\n');
  const before = tutorJson(root, ['roadmap', 'inbox']).data.files;
  assert.deepEqual(before.map((f) => [f.file, f.kind, f.status]), [['inputs/testing.html', 'roadmap-html', 'new'], ['inputs/topics.md', 'needs-conversion', 'new']]);
  assert.match(before[0].next, /roadmap add --file inputs\/testing\.html/);

  tutorJson(root, ['roadmap', 'add', '--file', 'inputs/testing.html', '--domain', DOMAIN, '--slug', 'testing']);
  const after = tutorJson(root, ['roadmap', 'inbox']).data.files[0];
  assert.equal(after.status, 'imported');
  assert.equal(after.roadmap, 'testing');

  write(root, 'inputs/testing.html', asHtml({ ...ROADMAP, title: 'Changed' }));
  assert.equal(tutorJson(root, ['roadmap', 'inbox']).data.files[0].status, 'changed-since-import');
}));

test('the intake gate requires every roadmap item to be an included concept at a fitting complexity', () => fixture((root) => {
  addFromHtml(root);
  tutorJson(root, ['init', 'Unit testing basics', '--domain', DOMAIN, '--subdomain', 'foundations', '--slug', 'unit-testing-basics', '--roadmap', 'testing', '--section', '00.1']);
  const id = 'unit-testing-basics';
  const roadmapFailures = () => tutorJson(root, ['validate', id, 'intake']).data.failures.map((f) => f.problem).filter((p) => p.startsWith('roadmap:'));

  assert.match(roadmapFailures().join('\n'), /plan\.curriculum is required for a roadmap topic/);

  const items = ROADMAP.phases[0].sections[0].items;
  write(root, 'plan.json', JSON.stringify(curriculum(items.slice(0, 1))));
  tutor(root, ['plan', id, '--set', path.join(root, 'plan.json')]);
  assert.match(roadmapFailures().join('\n'), /item test-doubles .* is not mapped to an included curriculum concept/);

  write(root, 'plan.json', JSON.stringify(curriculum(items, { 'test-doubles': { complexity: 'basic' } })));
  tutor(root, ['plan', id, '--set', path.join(root, 'plan.json')]);
  assert.match(roadmapFailures().join('\n'), /test-doubles is level adv/);

  write(root, 'plan.json', JSON.stringify(curriculum(items, { assertions: { disposition: 'deferred', reason: 'later' } })));
  tutor(root, ['plan', id, '--set', path.join(root, 'plan.json')]);
  assert.match(roadmapFailures().join('\n'), /item assertions .* is not mapped to an included/);

  write(root, 'plan.json', JSON.stringify(curriculum(items)));
  tutor(root, ['plan', id, '--set', path.join(root, 'plan.json')]);
  assert.deepEqual(roadmapFailures(), []);
}));

test('roadmap add rejects malformed data and doctor reports roadmaps', () => fixture((root) => {
  write(root, 'bad.json', JSON.stringify({ title: 'Bad', phases: [{ title: 'P', sections: [{ title: 'S', items: [{ title: 'A', level: 'expert' }] }] }] }));
  const bad = tutorJson(root, ['roadmap', 'add', '--file', 'bad.json', '--domain', DOMAIN]);
  assert.equal(bad.code, 1);
  assert.match(JSON.stringify(bad.data.failures), /level must be one of core, adv, opt/);

  write(root, 'good.json', JSON.stringify(ROADMAP));
  assert.equal(tutorJson(root, ['roadmap', 'add', '--file', 'good.json', '--domain', DOMAIN, '--depth', 'quick']).code, 0);
  const listed = tutorJson(root, ['roadmap', 'list']);
  assert.equal(listed.data.roadmaps[0].id, 'test-engineering-mastery');
  const doctor = tutorJson(root, ['doctor']);
  const row = doctor.data.checks.find((c) => c.check === 'roadmaps');
  assert.equal(row.status, 'ok', JSON.stringify(row));
}));

test('roadmap phases lists one parallel lane per phase with open sections and exact commands', () => fixture((root) => {
  addFromHtml(root);
  const all = tutorJson(root, ['roadmap', 'phases', 'testing']);
  assert.equal(all.code, 0, JSON.stringify(all.data));
  assert.deepEqual(all.data.phases.map((p) => p.phase), ['00', '01']);
  assert.equal(all.data.phases[0].sections.length, 1, 'the reference section is not a lane entry');
  assert.match(all.data.phases[0].sections[0].command, /init .*--roadmap testing --section 00\.1/);
  assert.match(all.data.phases[0].branch, /^phase-00-/);
  const ranged = tutorJson(root, ['roadmap', 'phases', 'testing', '--from', '01']);
  assert.deepEqual(ranged.data.phases.map((p) => p.phase), ['01']);
}));

test('research worksheet writes a step-by-step checklist from the roadmap items', () => fixture((root) => {
  addFromHtml(root);
  const lane = tutorJson(root, ['roadmap', 'phases', 'testing']).data.phases[0].sections[0];
  const args = lane.command.match(/"[^"]+"|\S+/g).slice(2).map((a) => a.replace(/^"|"$/g, ''));
  assert.equal(tutor(root, args).code, 0);
  const sheet = tutorJson(root, ['research', 'worksheet', lane.topic, '--unit', 'discovery-01']);
  assert.equal(sheet.code, 0, JSON.stringify(sheet.data));
  assert.deepEqual(sheet.data.subjects, ['assertions', 'test-doubles']);
  const text = read(root, sheet.data.file);
  assert.match(text, /"Assertions specification"/);
  assert.match(text, /Q6\. What small, checkable example/);
  assert.match(text, /## Step 6 — Self-check/);
}));
