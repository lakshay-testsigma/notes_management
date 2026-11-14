import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { DOMAIN, init, makeRoot, read, readTopic, removeRoot, tutor, tutorJson, write } from './support/helpers.mjs';

const ID = `${DOMAIN}/messaging/redis-streams`;

describe('init', () => {
  let root;
  before(() => {
    root = makeRoot();
  });
  after(() => removeRoot(root));

  test('standard depth creates state, registry, and every scaffolded file', () => {
    const { code, data } = init(root);
    assert.equal(code, 0);
    assert.equal(data.topic, ID);
    assert.equal(data.created, true);

    const topic = readTopic(root, ID);
    assert.equal(topic.schema, 1);
    assert.equal(topic.slug, 'redis-streams');
    assert.equal(topic.depth, 'standard');
    assert.deepEqual(topic.paths, {
      state: `state/topics/${ID}`,
      vault: `vault/${ID}`,
      lessons: `site/src/content/lessons/${ID}`,
      projects: `projects/${ID}`,
      cache: '.cache',
    });
    assert.deepEqual(topic.stages.map((s) => [s.id, s.wave, s.status]), [
      ['intake', 0, 'pending'],
      ['research', 1, 'pending'],
      ['brief', 1, 'pending'],
      ['digest', 2, 'pending'],
      ['repo-intel', 2, 'pending'],
      ['lesson', 3, 'pending'],
      ['mini-projects', 3, 'pending'],
      ['capstone', 4, 'pending'],
      ['notes', 5, 'pending'],
      ['finalize', 5, 'pending'],
    ]);
    assert.deepEqual(topic.recall, { cards: {} });
    assert.equal(topic.log.at(-1).event, 'init');
    assert.match(topic.created_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    assert.equal(read(root, `state/topics/${ID}/sources.json`).trim(), '[]');
    const registry = JSON.parse(read(root, 'state/registry.json'));
    assert.deepEqual(registry.topics.map((t) => t.id), [ID]);

    const vault = `vault/${ID}`;
    const expected = [
      '00-start-here-redis-streams.md',
      '01-brief-redis-streams.md',
      '02-lesson-redis-streams.md',
      '03-mini-projects-redis-streams.md',
      '04-digests/00-digests-redis-streams.md',
      '05-repo-intel/00-repo-intel-redis-streams.md',
      '06-capstone-redis-streams.md',
      '07-final-notes-redis-streams.md',
      '08-recall-redis-streams.md',
      '09-resources-redis-streams.md',
      'my-insights-redis-streams.md',
    ];
    for (const name of expected) {
      const text = read(root, `${vault}/${name}`);
      assert.match(text, /^---\ntitle: /, `${name} starts with frontmatter`);
      assert.match(text, new RegExp(`\\ntopic: ${ID}\\n`), `${name} has the topic id`);
      assert.match(text, /\ncreated: 2026-11-14\n/);
      if (!name.startsWith('my-insights')) {
        assert.match(text.trimEnd(), /## My insights$/, `${name} ends with ## My insights`);
      }
    }
    assert.match(read(root, `${vault}/01-brief-redis-streams.md`), /\nstage: brief\n/);
    assert.match(read(root, `${vault}/01-brief-redis-streams.md`), /## What it is/);

    assert.ok(fs.statSync(path.join(root, `site/src/content/lessons/${ID}`)).isDirectory());
    assert.ok(fs.statSync(path.join(root, `projects/${ID}`)).isDirectory());
    assert.ok(fs.statSync(path.join(root, `state/topics/${ID}/handoffs`)).isDirectory());
    assert.match(read(root, 'vault/Home.md'), /\[\[00-start-here-redis-streams\|Redis Streams\]\]/);
    assert.match(read(root, `vault/${DOMAIN}/${DOMAIN}.md`), /## Messaging & Streaming/);
  });

  test('running init again overwrites nothing', () => {
    const brief = `vault/${ID}/01-brief-redis-streams.md`;
    write(root, brief, 'my own edit\n');
    const before = read(root, `state/topics/${ID}/topic.json`);

    const { code, data } = init(root, 'Redis Streams', { depth: 'deep' });
    assert.equal(code, 0);
    assert.equal(data.created, false);
    assert.equal(data.depth, 'standard');
    assert.equal(data.files_created.length, 0);
    assert.equal(read(root, brief), 'my own edit\n');
    assert.equal(read(root, `state/topics/${ID}/topic.json`), before);
    assert.equal(JSON.parse(read(root, 'state/registry.json')).topics.length, 1);
  });

  test('quick depth skips repo-intel and capstone', () => {
    const { data } = init(root, 'Bloom Filter', { depth: 'quick', subdomain: 'storage' });
    const topic = readTopic(root, data.topic);
    const status = Object.fromEntries(topic.stages.map((s) => [s.id, s.status]));
    assert.equal(status['repo-intel'], 'skipped');
    assert.equal(status.capstone, 'skipped');
    assert.equal(status.digest, 'pending');
    assert.deepEqual(topic.profile.lesson_pages, [3, 4]);
    assert.equal(topic.profile.mini_projects, 1);
    assert.equal(topic.plan.repo_targets, 0);
  });

  test('deep depth keeps every stage and uses the deep profile', () => {
    const { data } = init(root, 'Kafka', { depth: 'deep' });
    const topic = readTopic(root, data.topic);
    assert.ok(topic.stages.every((s) => s.status === 'pending'));
    assert.deepEqual(topic.profile.lesson_pages, [8, 12]);
    assert.deepEqual(topic.profile.repos, [2, 3]);
    assert.equal(topic.profile.mini_projects, 3);
  });

  test('the domain pack can switch a stage off and override the depth profile', () => {
    const { data } = init(root, 'Positioning', { domain: 'no-code', subdomain: 'marketing' });
    const topic = readTopic(root, data.topic);
    const repoIntel = topic.stages.find((s) => s.id === 'repo-intel');
    assert.equal(repoIntel.status, 'skipped');
    assert.match(repoIntel.note, /no-code domain pack/);
    assert.equal(topic.stages.find((s) => s.id === 'capstone').status, 'pending');
    assert.deepEqual(topic.profile.lesson_pages, [4, 5]);
    assert.equal(topic.profile.mini_projects, 1);
  });

  test('an unknown domain is a usage error that lists the available domains', () => {
    const result = tutor(root, ['init', 'X', '--domain', 'nope', '--subdomain', 'a']);
    assert.equal(result.code, 2);
    assert.match(result.stderr, /Unknown domain "nope"/);
    assert.match(result.stderr, /test-engineering/);
  });

  test('an unknown subdomain is allowed and noted', () => {
    const { code, data } = init(root, 'Raft', { subdomain: 'Consensus Algorithms' });
    assert.equal(code, 0);
    assert.equal(data.topic, `${DOMAIN}/consensus-algorithms/raft`);
    assert.match(data.notes.join(' '), /new for test-engineering/);
  });

  test('missing flags and unknown depth are usage errors', () => {
    assert.equal(tutor(root, ['init', 'X', '--domain', DOMAIN]).code, 2);
    assert.equal(tutor(root, ['init', 'X', '--domain', DOMAIN, '--subdomain', 'a', '--depth', 'huge']).code, 2);
    assert.equal(tutor(root, ['init', 'X', '--domain', DOMAIN, '--subdomain', 'a', '--bogus', '1']).code, 2);
    assert.equal(tutor(root, ['nonsense']).code, 2);
  });
});

describe('topic addressing', () => {
  let root;
  before(() => {
    root = makeRoot();
    init(root, 'Redis Streams');
    init(root, 'Indexes', { subdomain: 'storage' });
    init(root, 'Indexes', { subdomain: 'messaging' });
  });
  after(() => removeRoot(root));

  test('a unique slug resolves to the full id', () => {
    const { code, data } = tutorJson(root, ['status', 'redis-streams']);
    assert.equal(code, 0);
    assert.equal(data.topic, ID);
  });

  test('the full id always works', () => {
    const { data } = tutorJson(root, ['status', `${DOMAIN}/storage/indexes`]);
    assert.equal(data.topic, `${DOMAIN}/storage/indexes`);
  });

  test('an ambiguous slug is a usage error that lists the candidates', () => {
    const result = tutor(root, ['status', 'indexes']);
    assert.equal(result.code, 2);
    assert.match(result.stderr, /ambiguous/);
    assert.match(result.stderr, new RegExp(`${DOMAIN}/storage/indexes`));
    assert.match(result.stderr, new RegExp(`${DOMAIN}/messaging/indexes`));
  });

  test('an unknown topic is a usage error', () => {
    const { code, data } = tutorJson(root, ['status', 'nope']);
    assert.equal(code, 2);
    assert.equal(data.ok, false);
    assert.equal(data.code, 'usage');
  });

  test('list shows every topic with progress', () => {
    const { data } = tutorJson(root, ['list']);
    assert.equal(data.count, 3);
    assert.deepEqual(data.topics[0].progress, { finished: 0, total: 10 });
    assert.deepEqual(data.topics[0].runnable, ['intake']);
  });

  test('paths returns every path by key', () => {
    const { data } = tutorJson(root, ['paths', 'redis-streams']);
    const vault = `vault/${ID}`;
    assert.equal(data.state_dir, `state/topics/${ID}`);
    assert.equal(data.topic_json, `state/topics/${ID}/topic.json`);
    assert.equal(data.sources_json, `state/topics/${ID}/sources.json`);
    assert.equal(data.handoffs_dir, `state/topics/${ID}/handoffs`);
    assert.equal(data.vault_dir, vault);
    assert.equal(data.start_here, `${vault}/00-start-here-redis-streams.md`);
    assert.equal(data.brief, `${vault}/01-brief-redis-streams.md`);
    assert.equal(data.lesson, `${vault}/02-lesson-redis-streams.md`);
    assert.equal(data.mini_projects, `${vault}/03-mini-projects-redis-streams.md`);
    assert.equal(data.digests_dir, `${vault}/04-digests`);
    assert.equal(data.digests_index, `${vault}/04-digests/00-digests-redis-streams.md`);
    assert.equal(data.repo_intel_dir, `${vault}/05-repo-intel`);
    assert.equal(data.repo_intel_index, `${vault}/05-repo-intel/00-repo-intel-redis-streams.md`);
    assert.equal(data.capstone, `${vault}/06-capstone-redis-streams.md`);
    assert.equal(data.final_notes, `${vault}/07-final-notes-redis-streams.md`);
    assert.equal(data.recall, `${vault}/08-recall-redis-streams.md`);
    assert.equal(data.resources, `${vault}/09-resources-redis-streams.md`);
    assert.equal(data.insights, `${vault}/my-insights-redis-streams.md`);
    assert.equal(data.lessons_dir, `site/src/content/lessons/${ID}`);
    assert.equal(data.projects_dir, `projects/${ID}`);
    assert.equal(data.cache_dir, '.cache');
    assert.equal(data.pack_json, `harness/domains/${DOMAIN}/pack.json`);
    assert.equal(data.playbook, `harness/domains/${DOMAIN}/playbook.md`);
    assert.equal(data.site_url, `/${ID}/`);
    assert.equal(data.abs.brief, path.join(root, data.brief));
  });

  test('doctor passes on a healthy root and notices a stale registry', () => {
    assert.equal(tutor(root, ['doctor']).code, 0);

    write(root, 'state/registry.json', '{ "schema": 1, "topics": [] }\n');
    const broken = tutorJson(root, ['doctor']);
    assert.equal(broken.code, 1);
    assert.equal(broken.data.checks.find((c) => c.check === 'registry').status, 'fail');

    const fixed = tutorJson(root, ['doctor', '--fix']);
    assert.equal(fixed.code, 0);
    assert.equal(JSON.parse(read(root, 'state/registry.json')).topics.length, 3);
  });
});
