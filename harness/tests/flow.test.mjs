import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  prepareFinalReview, write, addSources, DOMAIN, init, makeRoot, planFor, read, readTopic, removeRoot, setPlan, tutor, tutorJson,
  writeBrief, writeCapstone, writeDigests, writeLessons, writeMiniProjects, writeNotes, writeRepoIntel,
} from './support/helpers.mjs';

const ID = `${DOMAIN}/messaging/redis-streams`;

function next(root) {
  return tutorJson(root, ['next', ID]).data;
}

function start(root, stage) {
  return tutorJson(root, ['start', ID, stage]);
}

function done(root, stage, ...flags) {
  return tutorJson(root, ['done', ID, stage, ...flags]);
}

describe('next / start / done through all waves (standard depth)', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root);
  });
  after(() => removeRoot(root));

  test('wave 0: next describes intake completely', () => {
    const data = next(root);
    assert.equal(data.complete, false);
    assert.equal(data.wave, 0);
    assert.deepEqual(data.stages.map((s) => s.id), ['intake']);

    const intake = data.stages[0];
    assert.equal(intake.skill, 'learn-intake');
    assert.equal(intake.status, 'pending');
    assert.equal(intake.gate, `node harness/bin/tutor.mjs validate ${ID} intake`);
    assert.equal(intake.commands.start, `node harness/bin/tutor.mjs start ${ID} intake`);
    assert.equal(intake.commands.done, `node harness/bin/tutor.mjs done ${ID} intake`);
    assert.ok(intake.inputs.some((i) => i.path === `harness/domains/${DOMAIN}/playbook.md` && i.section === '## How this domain is learned' && i.exists));
    assert.ok(intake.outputs.some((o) => o.path === `state/topics/${ID}/topic.json`));
    assert.deepEqual(intake.targets.lesson_pages, [5, 7]);
  });

  test('a later wave cannot start before the earlier one is finished', () => {
    const result = start(root, 'brief');
    assert.equal(result.code, 1);
    assert.match(result.data.error, /earlier stages are not finished: intake/);
    assert.equal(readTopic(root, ID).stages.find((s) => s.id === 'brief').status, 'pending');
  });

  test('done refuses while the gate fails, and leaves the stage in progress', () => {
    assert.equal(start(root, 'intake').code, 0);
    const result = done(root, 'intake');
    assert.equal(result.code, 1);
    assert.equal(result.data.ok, false);
    assert.equal(result.data.status, 'in_progress');
    assert.ok(result.data.failures.length >= 3);
    for (const failure of result.data.failures) {
      assert.ok(failure.path && failure.problem && failure.fix);
      assert.equal(failure.line, `${failure.path}: ${failure.problem}. ${failure.fix}.`);
    }
    assert.match(tutor(root, ['done', ID, 'intake']).stdout, /topic\.json: plan\.summary is empty\. /);
  });

  test('wave 0: intake passes once the plan is set', () => {
    const plan = setPlan(root, ID, planFor(5));
    assert.equal(plan.data.intake_gate.ok, true);
    const result = done(root, 'intake');
    assert.equal(result.code, 0);
    assert.equal(result.data.status, 'done');
    assert.deepEqual(result.data.runnable, ['research']);
    assert.match(read(root, `vault/${ID}/00-start-here-redis-streams.md`), /Redis Streams is an append-only log/);
  });

  test('wave 1: research and brief', () => {
    assert.deepEqual(next(root).stages.map((s) => s.id), ['research']);
    start(root, 'research');

    assert.equal(done(root, 'research').code, 1);
    addSources(root, ID, 5);
    assert.equal(done(root, 'research').code, 0);
    assert.deepEqual(next(root).stages.map((s) => s.id), ['brief']);

    assert.equal(done(root, 'brief').code, 1);
    writeBrief(root, ID);
    const brief = done(root, 'brief');
    assert.equal(brief.code, 0, JSON.stringify(brief.data.failures));
  });

  test('wave 2: digest and repo-intel, with units', () => {
    assert.deepEqual(next(root).stages.map((s) => s.id), ['digest', 'repo-intel']);
    start(root, 'digest');
    start(root, 'repo-intel');

    tutor(root, ['unit', ID, 'digest', 'add', 'source-1']);
    tutor(root, ['unit', ID, 'digest', 'add', 'source-2']);
    tutor(root, ['unit', ID, 'digest', 'start', 'source-1']);
    tutor(root, ['unit', ID, 'digest', 'done', 'source-1']);
    write(root,`state/topics/${ID}/handoffs/digest-source-2.md`,'# Remaining\nFinish digest.');
    const failed = tutorJson(root, ['unit', ID, 'digest', 'fail', 'source-2', '--handoff', `state/topics/${ID}/handoffs/digest-source-2.md`]);
    assert.deepEqual(failed.data.units, [
      { id: 'source-1', status: 'done', handoff: null },
      { id: 'source-2', status: 'failed', handoff: `state/topics/${ID}/handoffs/digest-source-2.md` },
    ]);

    assert.equal(done(root, 'digest').code, 1);
    writeDigests(root, ID, 2);
    assert.equal(done(root,'digest').code,1,'failed unit blocks completion');
    tutor(root,['unit',ID,'digest','done','source-2']);
    const digest = done(root, 'digest');
    assert.equal(digest.code, 0, JSON.stringify(digest.data.failures));

    assert.equal(done(root, 'repo-intel').code, 1);
    writeRepoIntel(root, ID);
    const repoIntel = done(root, 'repo-intel');
    assert.equal(repoIntel.code, 0, JSON.stringify(repoIntel.data.failures));
  });

  test('wave 3: lesson and mini-projects', () => {
    assert.deepEqual(next(root).stages.map((s) => s.id), ['lesson', 'mini-projects']);
    start(root, 'lesson');
    start(root, 'mini-projects');

    assert.equal(done(root, 'lesson').code, 1);
    writeLessons(root, ID, 5);
    const lesson = done(root, 'lesson');
    assert.equal(lesson.code, 0, JSON.stringify(lesson.data.failures));

    writeMiniProjects(root, ID, 1);
    const tooFew = done(root, 'mini-projects');
    assert.equal(tooFew.code, 1);
    assert.match(tooFew.data.failures[0].problem, /has 1 mini projects, depth "standard" needs 2/);
    writeMiniProjects(root, ID, 2);
    const mini = done(root, 'mini-projects');
    assert.equal(mini.code, 0, JSON.stringify(mini.data.failures));
  });

  test('wave 4: capstone', () => {
    assert.deepEqual(next(root).stages.map((s) => s.id), ['capstone']);
    start(root, 'capstone');
    assert.equal(done(root, 'capstone').code, 1);
    writeCapstone(root, ID);
    const capstone = done(root, 'capstone');
    assert.equal(capstone.code, 0, JSON.stringify(capstone.data.failures));
  });

  test('wave 5: notes registers the recall cards, finalize validates everything', () => {
    assert.deepEqual(next(root).stages.map((s) => s.id), ['notes']);
    start(root, 'notes');
    writeNotes(root, ID, { cards: 7 });
    const tooFew = done(root, 'notes');
    assert.equal(tooFew.code, 1);
    assert.match(tooFew.data.failures[0].problem, /has 7 valid recall cards/);

    writeNotes(root, ID, { cards: 8 });
    const notes = done(root, 'notes');
    assert.equal(notes.code, 0, JSON.stringify(notes.data.failures));
    assert.equal(notes.data.recall.total, 8);
    assert.equal(Object.keys(readTopic(root, ID).recall.cards).length, 8);

    prepareFinalReview(root,ID);
    start(root, 'finalize');
    const all = tutorJson(root, ['validate', ID, '--all']);
    assert.equal(all.code, 0, JSON.stringify(all.data.failures));
    const finalize = done(root, 'finalize');
    assert.equal(finalize.code, 0, JSON.stringify(finalize.data.failures));
  });

  test('when everything is done, next says so and points to the site and the vault', () => {
    const data = next(root);
    assert.equal(data.complete, true);
    assert.deepEqual(data.stages, []);
    assert.equal(data.site_url, `/${ID}/`);
    assert.equal(data.start_here, `vault/${ID}/00-start-here-redis-streams.md`);

    const status = tutorJson(root, ['status', ID]).data;
    assert.deepEqual(status.progress, { finished: 10, total: 10 });
    assert.match(read(root, `vault/${ID}/00-start-here-redis-streams.md`), /10 of 10 steps ready/);
    assert.match(read(root, `vault/${ID}/09-resources-redis-streams.md`), /\[\[source-1-redis-streams\|read the digest\]\]/);
  });

  test('every state change was logged', () => {
    const events = readTopic(root, ID).log.map((entry) => entry.event);
    for (const event of ['init', 'plan', 'start', 'gate-failed', 'done', 'source-add', 'unit-add', 'unit-fail']) {
      assert.ok(events.includes(event), `log has "${event}"`);
    }
  });
});

describe('stage outcomes', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root);
  });
  after(() => removeRoot(root));

  test('done --force marks a failing stage done and logs that it was forced', () => {
    const result = done(root, 'intake', '--force');
    assert.equal(result.code, 0);
    assert.equal(result.data.status, 'done');
    assert.equal(result.data.forced, true);
    const topic = readTopic(root, ID);
    assert.equal(topic.log.at(-1).event, 'done-forced');
    assert.match(topic.stages[0].note, /forced/);
  });

  test('skip and fail need a reason; reset returns to pending', () => {
    assert.equal(tutor(root, ['skip', ID, 'research']).code, 2);
    const skipped = tutorJson(root, ['skip', ID, 'research', '--reason', 'no sources passed the gate']);
    assert.equal(skipped.data.status, 'skipped');
    assert.equal(skipped.data.note, 'no sources passed the gate');

    assert.equal(tutor(root, ['fail', ID, 'brief']).code, 2);
    write(root,`state/topics/${ID}/handoffs/digest-source-2.md`,'# Remaining\nFinish digest.');
    const failed = tutorJson(root, ['fail', ID, 'brief', '--reason', 'gate kept failing']);
    assert.equal(failed.data.status, 'failed');
    assert.deepEqual(next(root).stages.map((s) => [s.id, s.status]), [['intake','done']]); // required research waiver blocks its dependent brief

    const reset = tutorJson(root, ['reset', ID, 'brief']);
    assert.equal(reset.data.status, 'pending');
    assert.equal(reset.data.previous, 'failed');
  });

  test('a required skipped stage fails validation', () => {
    const { code, data } = tutorJson(root, ['validate', ID, 'research']);
    assert.equal(code, 1);
    assert.equal(data.stages[0].skipped, false);
  });

  test('the topic log keeps only the last 200 entries', () => {
    for (let i = 1; i <= 205; i++) {
      assert.equal(tutor(root, ['log', ID, `entry ${i}`]).code, 0);
    }
    const log = readTopic(root, ID).log;
    assert.equal(log.length, 200);
    assert.equal(log.at(-1).message, 'entry 205');
    assert.match(log.at(-1).at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  test('unknown stage is a usage error', () => {
    assert.equal(tutor(root, ['start', ID, 'nope']).code, 2);
    assert.equal(tutor(root, ['validate', ID, 'nope']).code, 2);
  });

  test('log appends a message and plan prints the plan', () => {
    assert.equal(tutor(root, ['log', ID, 'research: only 3 sources verified']).code, 0);
    assert.equal(readTopic(root, ID).log.at(-1).message, 'research: only 3 sources verified');
    const plan = tutorJson(root, ['plan', ID]).data;
    assert.equal(plan.depth, 'standard');
    assert.equal(plan.plan.digest_targets, 2);
    assert.equal(plan.plan.repo_targets, 1);
  });
});

describe('quick depth flow', () => {
  let root;
  const QUICK = `${DOMAIN}/storage/bloom-filter`;
  before(() => {
    root = makeRoot();
    init(root, 'Bloom Filter', { depth: 'quick', subdomain: 'storage' });
  });
  after(() => removeRoot(root));

  test('waves skip repo-intel and capstone, and use the quick thresholds', () => {
    const run = (stage) => tutorJson(root, ['done', QUICK, stage]);
    setPlan(root, QUICK, planFor(3, { miniProjects: 1 }));
    assert.equal(run('intake').code, 0);

    addSources(root, QUICK, 3);
    assert.equal(run('research').code, 0);
    writeBrief(root, QUICK);
    assert.equal(run('brief').code, 0);

    assert.deepEqual(tutorJson(root, ['next', QUICK]).data.stages.map((s) => s.id), ['digest']);
    writeDigests(root, QUICK, 1);
    assert.equal(run('digest').code, 0);

    writeLessons(root, QUICK, 3);
    assert.equal(run('lesson').code, 0);
    writeMiniProjects(root, QUICK, 1);
    assert.equal(run('mini-projects').code, 0);

    assert.deepEqual(tutorJson(root, ['next', QUICK]).data.stages.map((s) => s.id), ['notes']);
    writeNotes(root, QUICK, { cards: 5 });
    assert.equal(run('notes').code, 0);
    prepareFinalReview(root,QUICK);
    const finalize = run('finalize');
    assert.equal(finalize.code, 0, JSON.stringify(finalize.data.failures));
    assert.deepEqual(tutorJson(root, ['status', QUICK]).data.progress, { finished: 8, total: 8 });
  });
});
