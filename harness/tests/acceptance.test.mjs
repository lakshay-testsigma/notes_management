// Tests for the fixes that came out of the first end-to-end run: per-file
// validation, the final lesson page, `words`, concept backlinks, `sources
// update`, honest skipped stages, `depth`, unknown props, diagram warnings,
// the slug rule, the template fixes, and the brief inputs.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { slugify } from '../lib/markdown.mjs';
import { countArrayItems, parseAttributes } from '../lib/mdx.mjs';
import {
  addSource, addSources, DOMAIN, init, lessonPage, makeRoot, paths, planFor, prose, read, readTopic, removeRoot,
  setPlan, sourceEntry, tutor, tutorJson, write, writeBrief, writeCapstone, writeDigests, writeLessons,
  writeMiniProjects, writeNotes, writeRepoIntel, prepareFinalReview,
} from './support/helpers.mjs';

const ID = `${DOMAIN}/messaging/redis-streams`;
const LESSONS = `site/src/content/lessons/${ID}`;
const problems = (result) => result.data.failures.map((f) => f.problem);

/** Run every stage of a topic to `done` with valid artifacts. */
function finishTopic(root, id, { depth }) {
  const quick = depth === 'quick';
  const run = (stage, build) => {
    assert.equal(tutor(root, ['start', id, stage]).code, 0, `start ${stage}`);
    build?.();
    const result = tutorJson(root, ['done', id, stage]);
    assert.equal(result.code, 0, `${stage}: ${JSON.stringify(result.data.failures)}`);
  };
  run('intake', () => setPlan(root, id, planFor(quick ? 3 : 5, { miniProjects: quick ? 1 : 2 })));
  run('research', () => addSources(root, id, quick ? 3 : 5));
  run('brief', () => writeBrief(root, id));
  run('digest', () => writeDigests(root, id, quick ? 1 : 2));
  if (!quick) run('repo-intel', () => writeRepoIntel(root, id));
  run('lesson', () => writeLessons(root, id, quick ? 3 : 5));
  run('mini-projects', () => writeMiniProjects(root, id, quick ? 1 : 2));
  if (!quick) run('capstone', () => writeCapstone(root, id));
  run('notes', () => writeNotes(root, id, { cards: quick ? 5 : 8 }));
  prepareFinalReview(root,id);
  run('finalize');
}

// --- 1. validate --files --------------------------------------------------------

describe('validate --files: the view of one unit worker', () => {
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root);
    setPlan(root, ID, planFor(5));
    p = paths(root, ID);
    // A lesson worker has written pages 1 and 2 of 5. Nothing else exists yet.
    write(root, `${LESSONS}/01-page-1.mdx`, lessonPage({ order: 1 }));
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2 }));
  });
  after(() => removeRoot(root));

  const validateFiles = (stage, files) => tutorJson(root, ['validate', ID, stage, '--files', files]);

  test('the stage gate fails on things the worker does not own', () => {
    const whole = tutorJson(root, ['validate', ID, 'lesson']);
    assert.equal(whole.code, 1);
    assert.match(problems(whole).join('|'), /has 2 lesson pages/);
    assert.match(problems(whole).join('|'), /scaffold placeholder/);
  });

  test('clean files pass: no page count, no pointer note, no "final page" failure', () => {
    const result = validateFiles('lesson', `${LESSONS}/01-page-1.mdx,${LESSONS}/02-page-2.mdx`);
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
    assert.equal(result.data.ok, true);
    assert.deepEqual(result.data.files, [`${LESSONS}/01-page-1.mdx`, `${LESSONS}/02-page-2.mdx`]);
    assert.equal(result.data.failure_count, 0);
  });

  test('a directory covers the files under it, and stage-level counts stay out', () => {
    const result = validateFiles('lesson', `./${LESSONS}/`);
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
    assert.deepEqual(result.data.files, [LESSONS]);
  });

  test('a problem in a listed file is reported; a problem in another file is not', () => {
    write(root, `${LESSONS}/01-page-1.mdx`, lessonPage({ order: 1, words: 20 }));
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2, activity: false }));
    const one = validateFiles('lesson', `${LESSONS}/02-page-2.mdx`);
    assert.equal(one.code, 1);
    assert.deepEqual(problems(one), ['has no activity component']);
    assert.ok(one.data.failures.every((f) => f.path === `${LESSONS}/02-page-2.mdx`));

    const text = tutor(root, ['validate', ID, 'lesson', '--files', `${LESSONS}/02-page-2.mdx`]);
    assert.match(text.stdout, /Only these files/);
    write(root, `${LESSONS}/01-page-1.mdx`, lessonPage({ order: 1 }));
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2 }));
  });

  test('a listed file that does not exist is a failure', () => {
    const result = validateFiles('lesson', `${LESSONS}/03-page-3.mdx`);
    assert.equal(result.code, 1);
    assert.deepEqual(problems(result), ['does not exist']);
  });

  test('--files needs a stage and at least one path', () => {
    assert.equal(tutor(root, ['validate', ID, '--files', `${LESSONS}/01-page-1.mdx`]).code, 2);
    assert.equal(tutor(root, ['validate', ID, '--all', '--files', `${LESSONS}/01-page-1.mdx`]).code, 2);
    assert.equal(tutor(root, ['validate', ID, 'lesson', '--files', ',']).code, 2);
  });

  test('a digest worker sees its own note, not the index or the count', () => {
    addSources(root, ID, 5);
    const note = `${p.digests_dir}/source-1-${p.slug}.md`;
    write(root, note, `---\ntitle: Digest 1\ntopic: ${ID}\nstage: digest\ntags: [${DOMAIN}, messaging]\ncreated: 2026-11-14\n---\n\n${prose(40)}\n`);

    const whole = tutorJson(root, ['validate', ID, 'digest']);
    assert.match(problems(whole).join('|'), /has 1 digest notes, the plan needs 2/);
    assert.ok(whole.data.failures.some((f) => f.path === p.digests_index));

    const own = validateFiles('digest', note);
    assert.equal(own.code, 1);
    assert.deepEqual(problems(own), ['does not cite its source id']);

    write(root, note, read(root, note).replace('created: 2026-11-14\n', 'created: 2026-11-14\nsources: [source-1]\n'));
    assert.equal(validateFiles('digest', note).code, 0);
  });

  test('a project worker passes its folder', () => {
    const folder = `${p.projects_dir}/mini-01-job-queue`;
    write(root, `${folder}/README.md`, '# Job queue\n');
    write(root, `${folder}/starter/index.js`, '// TODO\n');
    const result = validateFiles('mini-projects', folder);
    assert.equal(result.code, 1);
    assert.deepEqual(result.data.failures.map((f) => f.path), [`${folder}/solution`]);
    write(root, `${folder}/solution/index.js`, 'export const done = true;\n');
    assert.equal(validateFiles('mini-projects', folder).code, 0);
  });
});

// --- 2. the final lesson page comes from the plan ----------------------------------

describe('the final lesson page is the highest order in plan.lesson_outline', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root);
    setPlan(root, ID, planFor(5));
  });
  after(() => removeRoot(root));

  const lessonProblems = (file) => tutorJson(root, ['validate', ID, 'lesson']).data.failures.filter((f) => f.path.endsWith(file)).map((f) => f.problem);

  test('the last page on disk is not "final" while later pages are still unwritten', () => {
    write(root, `${LESSONS}/01-page-1.mdx`, lessonPage({ order: 1 }));
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2 }));
    assert.deepEqual(lessonProblems('02-page-2.mdx'), []);
  });

  test('<Resources /> on a page that is not the final one fails', () => {
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2, last: true }));
    assert.deepEqual(lessonProblems('02-page-2.mdx'), ['has `<Resources />` but is not the final lesson page']);
    write(root, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2 }));
  });

  test('the final page of the plan must end with <Resources />, and only it has it', () => {
    writeLessons(root, ID, 5);
    assert.equal(tutorJson(root, ['validate', ID, 'lesson']).code, 0);

    write(root, `${LESSONS}/05-page-5.mdx`, lessonPage({ order: 5 }));
    assert.deepEqual(lessonProblems('05-page-5.mdx'), ['is the final lesson page but does not end with `<Resources />`']);

    write(root, `${LESSONS}/05-page-5.mdx`, lessonPage({ order: 5, last: true }));
    write(root, `${LESSONS}/03-page-3.mdx`, lessonPage({ order: 3, last: true }));
    const failures = tutorJson(root, ['validate', ID, 'lesson']).data.failures;
    assert.equal(failures.length, 1);
    assert.match(failures[0].fix, /only at the end of the final page 05-page-5\.mdx/);
  });

  test('without an outline the last file on disk is the final page', () => {
    const other = makeRoot();
    try {
      init(other);
      write(other, `${LESSONS}/01-page-1.mdx`, lessonPage({ order: 1 }));
      write(other, `${LESSONS}/02-page-2.mdx`, lessonPage({ order: 2 }));
      const failures = tutorJson(other, ['validate', ID, 'lesson']).data.failures.filter((f) => f.path.endsWith('.mdx'));
      assert.deepEqual(failures.map((f) => [path.basename(f.path), f.problem]), [['02-page-2.mdx', 'is the final lesson page but does not end with `<Resources />`']]);
    } finally {
      removeRoot(other);
    }
  });
});

// --- 3. words ---------------------------------------------------------------------

describe('words: the count the gate uses', () => {
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root);
    p = paths(root, ID);
  });
  after(() => removeRoot(root));

  const words = (file) => tutorJson(root, ['words', file]);

  test('a brief: frontmatter, code, and "My insights" are not counted; the range is printed', () => {
    write(root, p.brief, [
      '---', 'title: Brief', `topic: ${ID}`, 'stage: brief', `tags: [${DOMAIN}, messaging]`, 'created: 2026-11-14', '---',
      '# Redis Streams in brief', '', '## What it is', '', prose(200), '',
      '```mermaid', 'flowchart LR', '  A[these words] --> B[are never counted]', '```', '',
      '## My insights', '', '- a backlink line that is not counted either',
    ].join('\n'));
    const { code, data } = words(p.brief);
    assert.equal(code, 0);
    assert.equal(data.words, 207);
    assert.equal(data.kind, 'vault-note');
    assert.equal(data.stage, 'brief');
    assert.deepEqual(data.range, [150, 400]);
    assert.equal(data.within, true);

    // The same number the gate reports when it fails.
    write(root, p.brief, read(root, p.brief).replace(prose(200), prose(500)));
    const over = words(p.brief);
    assert.equal(over.data.words, 507);
    assert.equal(over.data.within, false);
    assert.match(tutorJson(root, ['validate', ID, 'brief']).data.failures.map((f) => f.problem).join('|'), /has 507 words, the maximum is 400/);
    assert.match(tutor(root, ['words', p.brief]).stdout, /507 words\n.*\n\s+Allowed by the brief gate: 150–400 words\. Over the maximum by 107/);
  });

  test('a lesson page: only prose is counted, as the lesson gate counts', () => {
    const file = `${LESSONS}/01-page-1.mdx`;
    write(root, file, lessonPage({ order: 1, words: 300 }));
    const { data } = words(file);
    assert.equal(data.words, 300);
    assert.equal(data.kind, 'lesson-page');
    assert.equal(data.stage, 'lesson');
    assert.deepEqual(data.range, [110, 260]);
    assert.equal(data.within, false);
    assert.match(tutorJson(root, ['validate', ID, 'lesson', '--files', file]).data.failures[0].problem, /has 300 words of prose, the maximum is 260/);
  });

  test('final notes have a range; another note has none; a missing file is a usage error', () => {
    assert.deepEqual(words(p.final_notes).data.range, [200, 600]);
    const recall = words(p.recall).data;
    assert.equal(recall.range, null);
    assert.equal(recall.within, null);
    assert.equal(recall.topic, ID);
    assert.equal(tutor(root, ['words', 'vault/nope.md']).code, 2);
    assert.equal(tutor(root, ['words']).code, 2);
  });
});

// --- 4. concept backlinks -----------------------------------------------------------

describe('concept notes: backlinks and letter case', () => {
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root);
    p = paths(root, ID);
  });
  after(() => removeRoot(root));

  test('the new note has the placeholder under the title, and the message says what to replace', () => {
    const result = tutor(root, ['concept', 'Consumer group']);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /replace the placeholder line under the title/);
    const lines = read(root, 'vault/_concepts/Consumer group.md').split('\n');
    const title = lines.indexOf('# Consumer group');
    assert.deepEqual(lines.slice(title, title + 4), ['# Consumer group', '', '<!-- tutor:placeholder -->', lines[title + 3]]);
    assert.match(lines[title + 3], /^_Not written yet\. Replace this line/);
  });

  test('a name that differs only by letter case does not create a second note', () => {
    const { code, data } = tutorJson(root, ['concept', 'consumer Group']);
    assert.equal(code, 0);
    assert.equal(data.created, false);
    assert.equal(data.case_mismatch, true);
    assert.equal(data.path, 'vault/_concepts/Consumer group.md');
    assert.equal(data.link, '[[Consumer group]]');
    assert.deepEqual(fs.readdirSync(path.join(root, 'vault/_concepts')), ['Consumer group.md']);
    assert.match(tutor(root, ['concept', 'CONSUMER GROUP']).stdout, /already exists with different letter case: "Consumer group"\. No second note was created/);
    assert.equal(tutorJson(root, ['concept', 'Consumer group']).data.case_mismatch, false);
  });

  test('map adds one bullet per linking note under "Where it shows up", once', () => {
    tutor(root, ['concept', 'Redis', '--tech']);
    writeBrief(root, ID);
    write(root, p.brief, read(root, p.brief).replace('## What it is\n', '## What it is\n\nA [[Consumer group]] reads it. It lives in [[Redis]].\n'));
    write(root, p.final_notes, read(root, p.final_notes).replace('<!-- tutor:placeholder -->', 'See [[Consumer group|consumer groups]] again.'));

    const { code, data } = tutorJson(root, ['map', ID]);
    assert.equal(code, 0);
    assert.deepEqual(data.backlinks, [
      { note: 'vault/_concepts/Consumer group.md', added: ['01-brief-redis-streams', '07-final-notes-redis-streams'] },
      { note: 'vault/_tech/Redis.md', added: ['01-brief-redis-streams'] },
    ]);
    const concept = read(root, 'vault/_concepts/Consumer group.md');
    assert.ok(concept.includes('## Where it shows up\n\n- [[01-brief-redis-streams]]\n- [[07-final-notes-redis-streams]]\n\n## My insights\n'));
    assert.ok(read(root, 'vault/_tech/Redis.md').includes('## Where it shows up\n\n- [[01-brief-redis-streams]]\n\n## My insights\n'));

    const again = tutorJson(root, ['map', ID]);
    assert.deepEqual(again.data.backlinks, []);
    assert.equal(read(root, 'vault/_concepts/Consumer group.md'), concept);
  });

  test('lines that are already there are kept, also when written with an alias', () => {
    const file = 'vault/_concepts/Pending entries.md';
    tutor(root, ['concept', 'Pending entries']);
    write(root, file, read(root, file).replace('## Where it shows up\n', '## Where it shows up\n\n- [[01-brief-redis-streams|The brief]] — where the idea is introduced\n- my own line\n'));
    write(root, p.brief, read(root, p.brief).replace('## What it is\n', '## What it is\n\n[[Pending entries]] matter.\n'));
    write(root, p.recall, read(root, p.recall).replace('<!-- tutor:placeholder -->', 'About [[Pending entries]].'));

    const { data } = tutorJson(root, ['map', ID]);
    assert.deepEqual(data.backlinks, [{ note: file, added: ['08-recall-redis-streams'] }]);
    assert.ok(read(root, file).includes([
      '## Where it shows up', '',
      '- [[01-brief-redis-streams|The brief]] — where the idea is introduced',
      '- my own line',
      '- [[08-recall-redis-streams]]', '',
      '## My insights',
    ].join('\n')));
  });

  test('a missing heading is created above "My insights"; `done` syncs too', () => {
    const file = 'vault/_concepts/Stream.md';
    write(root, file, `---\ntitle: Stream\ntopic: shared\nstage: concept\ntags: [concept]\ncreated: 2026-11-14\n---\n\n# Stream\n\nAn append-only log.\n\n## My insights\n\n- mine\n`);
    write(root, p.brief, read(root, p.brief).replace('## What it is\n', '## What it is\n\nA [[Stream]] is a log.\n'));
    setPlan(root, ID, planFor(5));
    tutor(root, ['start', ID, 'intake']);
    assert.equal(tutorJson(root, ['done', ID, 'intake']).code, 0);
    assert.ok(read(root, file).endsWith('An append-only log.\n\n## Where it shows up\n\n- [[01-brief-redis-streams]]\n\n## My insights\n\n- mine\n'));
  });
});

// --- 5. sources update --------------------------------------------------------------

describe('sources update', () => {
  let root;
  let p;
  const patch = (value) => {
    write(root, 'tmp/patch.json', JSON.stringify(value));
    return ['sources', ID, 'update', 'source-2', '--file', path.join(root, 'tmp/patch.json')];
  };
  before(() => {
    root = makeRoot();
    init(root);
    p = paths(root, ID);
    addSources(root, ID, 3);
    addSource(root, ID, sourceEntry('source-9', { evidence: { stars: 500, last_commit: '2026-10-01', citations: null, venue: null, publisher: 'Test publisher', used_by: ['A'] } }));
  });
  after(() => removeRoot(root));

  test('merges the patch, evidence one level deep, and keeps the position', () => {
    write(root, 'tmp/patch.json', JSON.stringify({ title: 'Renamed source', evidence: { stars: null, citations: 12 } }));
    const { code, data } = tutorJson(root, ['sources', ID, 'update', 'source-9', '--file', path.join(root, 'tmp/patch.json')]);
    assert.equal(code, 0);
    assert.deepEqual(data.changed, ['title', 'evidence.stars', 'evidence.citations']);
    assert.equal(data.position, 3);

    const entries = JSON.parse(read(root, p.sources_json));
    assert.deepEqual(entries.map((e) => e.id), ['source-1', 'source-2', 'source-3', 'source-9']);
    assert.equal(entries[3].title, 'Renamed source');
    assert.deepEqual(entries[3].evidence, { stars: null, last_commit: '2026-10-01', citations: 12, venue: null, publisher: 'Test publisher', used_by: ['A'] });
    assert.equal(entries[3].url, 'https://example.com/source-9');

    assert.match(read(root, p.resources), /Renamed source/, '09-resources is regenerated');
    const log = readTopic(root, ID).log.at(-1);
    assert.equal(log.event, 'source-update');
    assert.match(log.message, /updated source-9: title, evidence\.stars, evidence\.citations/);
  });

  test('the entry gate runs again: a patch that breaks the entry changes nothing', () => {
    const before = read(root, p.sources_json);
    const noProof = tutorJson(root, patch({ evidence: { publisher: null, used_by: null } }));
    assert.equal(noProof.code, 1);
    assert.match(noProof.data.failures.map((f) => f.problem).join('|'), /evidence\.used_by needs named production adoption/);

    const badTier = tutorJson(root, patch({ tier: 'C' }));
    assert.equal(badTier.code, 1);
    assert.match(badTier.data.failures[0].problem, /tier must be "A" or "B"/);

    assert.equal(tutorJson(root, patch({ id: 'other-id' })).code, 1);
    assert.equal(tutorJson(root, patch({ url: 'https://example.com/source-1/' })).code, 1);
    assert.equal(read(root, p.sources_json), before);
  });

  test('usage errors and an unknown id', () => {
    assert.equal(tutor(root, ['sources', ID, 'update', 'source-2']).code, 2);
    assert.equal(tutor(root, ['sources', ID, 'update']).code, 2);
    write(root, 'tmp/patch.json', '{}');
    assert.equal(tutor(root, ['sources', ID, 'update', 'nope', '--file', path.join(root, 'tmp/patch.json')]).code, 1);
    write(root, 'tmp/patch.json', '[1]');
    assert.equal(tutor(root, ['sources', ID, 'update', 'source-2', '--file', path.join(root, 'tmp/patch.json')]).code, 2);
  });

  test('a patch that changes nothing is not logged', () => {
    const entries = readTopic(root, ID).log.length;
    const { code, data } = tutorJson(root, patch({ tier: 'B' }));
    assert.equal(code, 0);
    assert.deepEqual(data.changed, []);
    assert.equal(readTopic(root, ID).log.length, entries);
  });
});

// --- 6. skipped stages are honest -----------------------------------------------------

describe('skipped stages are honest', () => {
  const QUICK = `${DOMAIN}/storage/bloom-filter`;
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root, 'Bloom Filter', { depth: 'quick', subdomain: 'storage' });
    p = paths(root, QUICK);
  });
  after(() => removeRoot(root));

  test('the note of a skipped stage says so and how to add it; never "Not written yet"', () => {
    for (const file of [p.capstone, p.repo_intel_index]) {
      const text = read(root, file);
      assert.doesNotMatch(text, /Not written yet/);
      assert.doesNotMatch(text, /tutor:placeholder/);
      assert.ok(text.includes('<!-- tutor:skipped -->\nThis step is not part of this topic at its depth (quick). To add it, ask Claude: `/learn bloom-filter --depth standard`.\n'), text);
      assert.match(text, /\n## My insights\n$/);
    }
    assert.match(read(root, p.brief), /Not written yet/, 'active stages keep the normal placeholder');
  });

  test('00-start-here lists a skipped step as plain text, without a link', () => {
    const text = read(root, p.start_here);
    assert.ok(text.includes('5. Repository deep dive — not part of this topic at its depth (quick). To add it: `/learn bloom-filter --depth standard`.'));
    assert.ok(text.includes('6. Capstone — not part of this topic at its depth (quick). To add it: `/learn bloom-filter --depth standard`.'));
    assert.doesNotMatch(text, /\[\[06-capstone-bloom-filter/);
    assert.doesNotMatch(text, /\[\[00-repo-intel-bloom-filter/);
    assert.match(text, /4\. \[\[00-digests-bloom-filter\|Digests\]\]/);
    assert.doesNotMatch(text, /projects\/.*\/capstone\//);
  });

  test('the placeholder returns when the stage becomes active, and the skip text when it is skipped again', () => {
    tutor(root, ['reset', QUICK, 'capstone']);
    let text = read(root, p.capstone);
    assert.doesNotMatch(text, /tutor:skipped|not part of this topic/);
    assert.ok(text.includes('<!-- tutor:placeholder -->\n_Not written yet. The capstone stage replaces this line'));
    assert.match(read(root, p.start_here), /6\. \[\[06-capstone-bloom-filter\|Capstone\]\]/);

    tutor(root, ['skip', QUICK, 'capstone', '--reason', 'depth "quick" has no capstone']);
    text = read(root, p.capstone);
    assert.ok(text.includes('<!-- tutor:skipped -->\nThis step is not part of this topic at its depth (quick). To add it, ask Claude: `/learn bloom-filter --depth standard`.'), text);
    assert.doesNotMatch(text, /Not written yet|tutor:placeholder/);
  });

  test('a stage of this depth that was skipped by hand names the reason and the reset command', () => {
    tutor(root, ['skip', QUICK, 'digest', '--reason', 'no source was worth a digest.']);
    const text = read(root, p.digests_index);
    assert.ok(text.includes(`<!-- tutor:skipped -->\nThis required step remains undelivered: it was waived (no source was worth a digest). To add it, run \`node harness/bin/tutor.mjs reset ${QUICK} digest\` and then ask Claude: \`/learn bloom-filter\`.`), text);
    assert.match(read(root, p.start_here), /4\. Digests — required work remains undelivered: it was waived \(no source was worth a digest\)/);
    tutor(root, ['reset', QUICK, 'digest']);
    assert.ok(read(root, p.digests_index).includes('<!-- tutor:placeholder -->\n_Not written yet. The digest stage'));
  });

  test('real content is never replaced, in either direction', () => {
    const real = read(root, p.capstone).replace(/<!-- tutor:skipped -->\n.*\n/, 'The project lives in `projects/x/capstone/`. It was built by hand.\n');
    write(root, p.capstone, real);
    tutor(root, ['map', QUICK]);
    assert.equal(read(root, p.capstone), real);
    tutor(root, ['reset', QUICK, 'capstone']);
    assert.equal(read(root, p.capstone), real);
    tutor(root, ['skip', QUICK, 'capstone', '--reason', 'again']);
    assert.equal(read(root, p.capstone), real);
  });

  test('a skip sentence written by hand is replaced; one with more content is kept', () => {
    const body = (sentence) => read(root, p.repo_intel_index).replace(/<!-- tutor:skipped -->\n.*\n/, `${sentence}\n`);
    write(root, p.repo_intel_index, body('This step is not part of a quick topic: no production repository was analyzed. To add it, ask for the topic again at standard depth.'));
    const { data } = tutorJson(root, ['map', QUICK]);
    assert.deepEqual(data.stage_notes, [p.repo_intel_index]);
    assert.ok(read(root, p.repo_intel_index).includes('<!-- tutor:skipped -->\nThis step is not part of this topic at its depth (quick). To add it, ask Claude: `/learn bloom-filter --depth standard`.'));

    const longer = body('This step is not part of a quick topic: no production repository was analyzed. A good one to study later is BullMQ. To add it, ask for the topic again at standard depth.');
    write(root, p.repo_intel_index, longer);
    assert.deepEqual(tutorJson(root, ['map', QUICK]).data.stage_notes, []);
    assert.equal(read(root, p.repo_intel_index), longer);
  });

  test('a stage the domain pack switches off names the domain, not a depth', () => {
    const { data } = init(root, 'Positioning', { domain: 'no-code', subdomain: 'marketing' });
    const other = paths(root, data.topic);
    assert.ok(read(root, other.repo_intel_index).includes('<!-- tutor:skipped -->\nThis step is not part of this topic: the No Code domain does not have it.\n'));
    assert.ok(read(root, other.start_here).includes('5. Repository deep dive — not part of this topic (the No Code domain does not have it).'));
  });
});

describe('next when everything is finished: the reading order of this topic', () => {
  const QUICK = `${DOMAIN}/storage/bloom-filter`;
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root, 'Bloom Filter', { depth: 'quick', subdomain: 'storage' });
    p = paths(root, QUICK);
    finishTopic(root, QUICK, { depth: 'quick' });
  });
  after(() => removeRoot(root));

  const OPEN = 'Run `npm run site:dev` in the repository root, then open `/test-engineering/storage/bloom-filter/` on the local address it prints.';

  test('reading_order holds only the steps that exist', () => {
    const { data } = tutorJson(root, ['next', QUICK]);
    assert.equal(data.complete, true);
    assert.deepEqual(data.reading_order.map((s) => `${s.n} ${s.step}`), ['01 brief', '02 lesson', '03 mini projects', '04 digests', '07 final notes', '08 recall cards', '09 resources']);
    assert.equal(data.reading_order_line, '01 brief → 02 lesson → 03 mini projects → 04 digests → 07 final notes → 08 recall cards → 09 resources');
    assert.deepEqual(data.reading_order[0], { n: '01', step: 'brief', label: 'Brief', path: p.brief, note: '01-brief-bloom-filter' });
    assert.deepEqual(data.not_part_of_topic, ['repo-intel', 'capstone']);
    assert.equal(data.open_lesson, OPEN);

    const text = tutor(root, ['next', QUICK]).stdout;
    assert.ok(text.includes(`Reading order of this topic (only the steps it has):\n  ${data.reading_order_line}\n  Not part of this topic: repo-intel, capstone.`));
    assert.ok(text.includes(OPEN));
    assert.doesNotMatch(text, /localhost/);
  });

  test('one canonical "open the lesson" line: next, paths, 00-start-here, and the 02-lesson scaffold', () => {
    assert.equal(paths(root, QUICK).open_lesson, OPEN);
    assert.ok(read(root, p.start_here).includes(`## Open the lesson\n\n${OPEN}\n`));

    const { data } = init(root, 'Cuckoo Filter', { depth: 'quick', subdomain: 'storage' });
    const scaffold = read(root, paths(root, data.topic).lesson);
    assert.ok(scaffold.includes('## Open the lesson\n\nRun `npm run site:dev` in the repository root, then open `/test-engineering/storage/cuckoo-filter/` on the local address it prints.\n\n<!-- tutor:placeholder -->\n_Not written yet.'));
    assert.match(scaffold, /_Not written yet\.[^\n]*\n\n## My insights\n$/, 'nothing dangles between the placeholder and My insights');
  });

  test('00-start-here lists the lesson pages as their site paths', () => {
    const text = read(root, p.start_here);
    assert.ok(text.includes('## Lesson pages\n\n1. Page 1 — `/test-engineering/storage/bloom-filter/lesson/01-page-1/`\n2. Page 2 — `/test-engineering/storage/bloom-filter/lesson/02-page-2/`\n3. Page 3 — `/test-engineering/storage/bloom-filter/lesson/03-page-3/`\n'));
  });

  test('a standard topic has all nine steps', () => {
    const other = makeRoot();
    try {
      init(other);
      finishTopic(other, ID, { depth: 'standard' });
      const { data } = tutorJson(other, ['next', ID]);
      assert.equal(data.reading_order.length, 9);
      assert.match(data.reading_order_line, /04 digests → 05 repo deep dive → 06 capstone → 07 final notes/);
      assert.deepEqual(data.not_part_of_topic, []);
    } finally {
      removeRoot(other);
    }
  });
});

// --- 7. depth -----------------------------------------------------------------------

describe('depth: change the depth of an existing topic', () => {
  const QUICK = `${DOMAIN}/storage/bloom-filter`;
  let root;
  let p;
  before(() => {
    root = makeRoot();
    init(root, 'Bloom Filter', { depth: 'quick', subdomain: 'storage' });
    p = paths(root, QUICK);
    finishTopic(root, QUICK, { depth: 'quick' });
  });
  after(() => removeRoot(root));

  test('quick -> standard opens the stages the depth adds and touches nothing that is done', () => {
    const brief = read(root, p.brief);
    fs.rmSync(path.join(root, p.capstone));
    const { code, data } = tutorJson(root, ['depth', QUICK, 'standard']);
    assert.equal(code, 0);
    assert.equal(data.previous, 'quick');
    assert.equal(data.depth, 'standard');
    assert.deepEqual(data.stages.map((c) => [c.stage, c.from, c.to]), [['repo-intel', 'skipped', 'pending'], ['capstone', 'skipped', 'pending']]);
    assert.deepEqual(data.profile.lesson_pages, [5, 7]);
    assert.deepEqual(data.plan, [{ key: 'digest_targets', from: 1, to: 2 }, { key: 'repo_targets', from: 0, to: 1 }]);
    assert.deepEqual(data.files_created, [p.capstone]);
    assert.deepEqual(data.lesson_pages, { planned: 3, wanted: [5, 7], fits: false });
    assert.deepEqual(data.runnable, ['intake']);

    const topic = readTopic(root, QUICK);
    assert.equal(topic.depth, 'standard');
    assert.deepEqual(topic.profile, data.profile);
    const status = Object.fromEntries(topic.stages.map((s) => [s.id, s.status]));
    assert.deepEqual(status, {
      intake: 'done', research: 'done', brief: 'done', digest: 'done', 'repo-intel': 'pending',
      lesson: 'done', 'mini-projects': 'done', capstone: 'pending', notes: 'done', finalize: 'done',
    });
    assert.equal(topic.stages.find((s) => s.id === 'capstone').note, '');
    assert.equal(topic.log.at(-1).event, 'depth');
    assert.match(topic.log.at(-1).message, /depth quick -> standard; repo-intel: skipped -> pending, capstone: skipped -> pending/);
    assert.equal(JSON.parse(read(root, 'state/registry.json')).topics[0].depth, 'standard');

    // Notes: real content untouched, skip text back to the normal placeholder, missing scaffold restored.
    assert.equal(read(root, p.brief), brief);
    assert.ok(read(root, p.repo_intel_index).includes('<!-- tutor:placeholder -->\n_Not written yet. The repo-intel stage'));
    assert.ok(read(root, p.capstone).includes('<!-- tutor:placeholder -->\n_Not written yet. The capstone stage'));
    assert.match(read(root, p.start_here), /\*\*Depth:\*\* standard/);
    assert.match(read(root, p.start_here), /5\. \[\[00-repo-intel-bloom-filter\|Repository deep dive\]\]/);

    // Done stages whose gate fails at the new depth are reported, not reset.
    const rework = Object.fromEntries(data.needs_rework.map((item) => [item.stage, item]));
    assert.deepEqual(Object.keys(rework), ['intake', 'research', 'digest', 'lesson', 'mini-projects', 'notes', 'finalize']);
    assert.match(rework.lesson.problems.join('|'), /has 3 lesson pages, depth "standard" needs 5–7/);
    assert.equal(rework.lesson.redo, `node harness/bin/tutor.mjs reset ${QUICK} lesson`);
  });

  test('the text says what changed, that the plan needs more pages, and what is next', () => {
    tutor(root, ['depth', QUICK, 'quick']);
    const { code, stdout } = tutor(root, ['depth', QUICK, 'standard']);
    assert.equal(code, 0);
    assert.match(stdout, /Depth of .*bloom-filter: quick -> standard\./);
    assert.match(stdout, /repo-intel: skipped -> pending/);
    assert.match(stdout, /The plan has 3 lesson pages; this depth needs 5–7\. Add pages to plan\.lesson_outline/);
    assert.match(stdout, /Next: node harness\/bin\/tutor\.mjs next .*\(wave 0: intake\)/);
  });

  test('standard -> quick skips stages that have not started and keeps started ones', () => {
    tutor(root, ['start', QUICK, 'repo-intel','--force']);
    const { data } = tutorJson(root, ['depth', QUICK, 'quick']);
    assert.deepEqual(data.stages.map((c) => [c.stage, c.from, c.to]), [['capstone', 'pending', 'skipped']]);
    assert.deepEqual(data.kept.map((k) => [k.stage, k.status]), [['repo-intel', 'in_progress']]);
    const topic = readTopic(root, QUICK);
    assert.equal(topic.stages.find((s) => s.id === 'capstone').note, 'depth "quick" has no capstone');
    assert.equal(topic.stages.find((s) => s.id === 'repo-intel').status, 'in_progress');
    assert.ok(read(root, p.capstone).includes('<!-- tutor:skipped -->\nThis step is not part of this topic at its depth (quick).'));
    assert.equal(topic.plan.repo_targets, 0);
  });

  test('the same depth changes nothing; a stage skipped for another reason stays skipped', () => {
    const same = tutorJson(root, ['depth', QUICK, 'quick']);
    assert.equal(same.code, 0);
    assert.equal(same.data.changed, false);

    tutor(root, ['reset', QUICK, 'capstone']);
    tutor(root, ['skip', QUICK, 'capstone', '--reason', 'the learner does not want it']);
    const { data } = tutorJson(root, ['depth', QUICK, 'deep']);
    assert.deepEqual(data.stages, []);
    assert.deepEqual(data.kept.map((k) => k.stage), ['capstone']);
    assert.equal(readTopic(root, QUICK).stages.find((s) => s.id === 'capstone').status, 'skipped');
  });

  test('usage errors', () => {
    assert.equal(tutor(root, ['depth', QUICK]).code, 2);
    assert.equal(tutor(root, ['depth', QUICK, 'huge']).code, 2);
    assert.equal(tutor(root, ['depth', 'nope', 'quick']).code, 2);
  });
});

// --- 8 and 9. unknown props and diagram size ------------------------------------------

describe('lesson gate: unknown props and diagram size', () => {
  let root;
  const MANIFEST = {
    visual: ['FlowAnimation', 'SystemDiagram', 'SequenceDiagram'],
    activity: ['Quiz'],
    utility: ['Resources'],
    props: {
      FlowAnimation: ['nodes', 'steps', 'title'],
      SystemDiagram: ['nodes', 'edges', 'title'],
      SequenceDiagram: ['actors', 'messages', 'title'],
      Quiz: ['question', 'options', 'answer'],
      Resources: [],
    },
  };
  const nodes = (count) => Array.from({ length: count }, (_, i) => `    { id: "n${i}", label: "Node > ${i}", detail: 'a } brace, a "quote"' },`).join('\n');
  const page = (extra) => lessonPage({ order: 2, extra });
  const check = (extra) => {
    write(root, `${LESSONS}/02-page-2.mdx`, page(extra));
    return tutorJson(root, ['validate', ID, 'lesson']);
  };

  before(() => {
    root = makeRoot();
    init(root);
    setPlan(root, ID, planFor(5));
    writeLessons(root, ID, 5);
    write(root, 'site/components.manifest.json', JSON.stringify(MANIFEST));
  });
  after(() => removeRoot(root));

  test('known props pass, across lines and with braces, quotes, and > inside values', () => {
    const result = check(`<SystemDiagram\n  title="A > B, said 'x'"\n  nodes={[\n${nodes(3)}\n  ]}\n  edges={[{ from: "n0", to: "n1", label: \`\${1 > 0 ? "}" : "{"}\` }]}\n/>`);
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
    assert.deepEqual(result.data.warnings, []);
  });

  test('an unknown prop fails, names the allowed props, and points to COMPONENTS.md', () => {
    const result = check(`<SystemDiagram\n  nodes={[\n${nodes(2)}\n  ]}\n  edges={[]}\n  initial="n0"\n  highlight\n/>`);
    assert.equal(result.code, 1);
    assert.equal(result.data.failures.length, 1);
    assert.equal(result.data.failures[0].problem, '<SystemDiagram> has unknown props `initial`, `highlight`');
    assert.equal(result.data.failures[0].fix, 'use only the props of SystemDiagram: nodes, edges, title — see site/COMPONENTS.md');
  });

  test('text that looks like a prop inside a value is not a prop; client: keeps its own failure', () => {
    const inside = check(`<SystemDiagram nodes={[{ id: "a", label: 'bogus="1" other={2}' }]} edges={[]} title="wrong=3 >" />`);
    assert.equal(inside.code, 0, JSON.stringify(inside.data.failures));

    const client = check('<SystemDiagram client:load nodes={[]} edges={[]} />');
    assert.deepEqual(client.data.failures.map((f) => f.problem), ['<SystemDiagram> has a `client:` directive']);

    const none = check('<Quiz question="Second quiz?" options={["a", "b"]} answer={0} hint="no such prop" />');
    assert.deepEqual(none.data.failures.map((f) => f.problem), ['<Quiz> has an unknown prop `hint`']);
  });

  test('without "props" in the manifest the check is off', () => {
    const { props, ...kindsOnly } = MANIFEST;
    write(root, 'site/components.manifest.json', JSON.stringify(kindsOnly));
    const result = check('<SystemDiagram nodes={[]} edges={[]} anything="goes" />');
    assert.equal(result.code, 0, JSON.stringify(result.data.failures));
    write(root, 'site/components.manifest.json', JSON.stringify(MANIFEST));
  });

  test('a diagram with more than 7 nodes is a warning, not a failure', () => {
    const result = check(`<SystemDiagram\n  nodes={[\n${nodes(9)}\n  ]}\n  edges={[]}\n/>\n\n<SequenceDiagram actors={["A", "B", "C", "D", "E", "F", "G", "H"]} messages={[]} />\n\n<FlowAnimation nodes={[\n${nodes(7)}\n  ]} steps={[]} />`);
    assert.equal(result.code, 0);
    assert.equal(result.data.ok, true);
    assert.equal(result.data.failure_count, 0);
    assert.equal(result.data.warning_count, 2);
    assert.deepEqual(result.data.warnings.map((w) => w.problem), ['<SystemDiagram> has 9 nodes, more than 7', '<SequenceDiagram> has 8 actors, more than 7']);
    assert.ok(result.data.warnings.every((w) => w.path === `${LESSONS}/02-page-2.mdx` && w.stage === 'lesson' && w.line));
    assert.deepEqual(result.data.stages[0].warnings.length, 2);

    const text = tutor(root, ['validate', ID, 'lesson']);
    assert.equal(text.code, 0);
    assert.match(text.stdout, /PASS {2}lesson\n\nWarnings \(2\) — they do not fail the gate/);
    assert.match(text.stdout, /02-page-2\.mdx: <SystemDiagram> has 9 nodes, more than 7\. merge or drop nodes/);
    assert.match(text.stdout, /All checks passed\./);

    const all = tutorJson(root, ['validate', ID, '--all']);
    assert.equal(all.data.warnings.length, 2);
    const files = tutorJson(root, ['validate', ID, 'lesson', '--files', `${LESSONS}/01-page-1.mdx`]);
    assert.deepEqual(files.data.warnings, []);
  });

  test('doctor reports whether props are listed', () => {
    const { data } = tutorJson(root, ['doctor']);
    assert.match(data.checks.find((c) => c.check === 'components manifest').detail, /props listed for all 5 components/);
  });

  test('attribute parsing and array counting', () => {
    const tag = '<Flow a="x > y" b={{ k: "}" }} c d={[1, [2, 3], { e: "," },]} {...rest} e=\'q "z"\' />';
    assert.deepEqual(parseAttributes(tag).map((a) => a.name), ['a', 'b', 'c', 'd', null, 'e']);
    assert.equal(parseAttributes(tag)[1].value, '{{ k: "}" }}');
    assert.equal(countArrayItems(parseAttributes(tag)[3].value), 3);
    assert.equal(countArrayItems('{[]}'), 0);
    assert.equal(countArrayItems('{nodes}'), null);
    assert.equal(countArrayItems('{["a, b", `c, ${[1, 2]}`]}'), 2);
  });
});

// --- 10, 11, 12 -----------------------------------------------------------------------

describe('slug rule, templates, brief inputs', () => {
  let root;
  before(() => {
    root = makeRoot();
  });
  after(() => removeRoot(root));

  test('slugify drops a trailing acronym in parentheses', () => {
    assert.equal(slugify('Retrieval-Augmented Generation (RAG)'), 'retrieval-augmented-generation');
    assert.equal(slugify('Simple Storage Service (S3)'), 'simple-storage-service');
    assert.equal(slugify('Continuous Delivery (CI/CD) '), 'continuous-delivery');
    assert.equal(slugify('Remote Procedure Calls (gRPC)'), 'remote-procedure-calls');
    assert.equal(slugify('Kafka (basics)'), 'kafka-basics');
    assert.equal(slugify('State of AI (2026)'), 'state-of-ai-2026');
    assert.equal(slugify('(RAG)'), 'rag');
    assert.equal(slugify('RAG (Retrieval) Systems'), 'rag-retrieval-systems');

    const { data } = init(root, 'Retrieval-Augmented Generation (RAG)', { subdomain: 'rag' });
    assert.equal(data.topic, `${DOMAIN}/rag/retrieval-augmented-generation`);
    assert.equal(data.title, 'Retrieval-Augmented Generation (RAG)');
  });

  test('the digest index scaffold matches the index template of the digest skill', () => {
    const p = paths(root, `${DOMAIN}/rag/retrieval-augmented-generation`);
    const text = read(root, p.digests_index);
    assert.ok(text.startsWith([
      '---',
      'title: "Retrieval-Augmented Generation (RAG) — digests"',
      `topic: ${DOMAIN}/rag/retrieval-augmented-generation`,
      'stage: digest',
      `tags: [${DOMAIN}, rag, digest]`,
      'created: 2026-11-14',
      'sources: []',
      '---',
      '',
      '# Digests for Retrieval-Augmented Generation (RAG)',
      '',
    ].join('\n')), text);
  });

  test('next lists for the brief exactly what the brief skill reads: no rubric', () => {
    const id = `${DOMAIN}/rag/retrieval-augmented-generation`;
    setPlan(root, id, planFor(5));
    tutor(root, ['start', id, 'intake']);
    assert.equal(tutor(root, ['done', id, 'intake']).code, 0);
    addSources(root,id,5);
    assert.equal(tutor(root,['done',id,'research']).code,0);
    const brief = tutorJson(root, ['next', id]).data.stages.find((s) => s.id === 'brief');
    assert.deepEqual(brief.inputs.map((i) => i.path), [
      `state/topics/${id}/topic.json`,
      `state/topics/${id}/sources.json`,
      `harness/domains/${DOMAIN}/playbook.md`,
      `vault/${id}/01-brief-retrieval-augmented-generation.md`,
      'vault/_concepts',
    ]);
    assert.equal(brief.inputs[2].section, '## Safety and ethics');
    assert.ok(!brief.inputs.some((i) => i.path.includes('rubrics')));
  });
});
