import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { DOMAIN, init, makeRoot, paths, read, removeRoot, tutorJson, write } from './support/helpers.mjs';

const id = `${DOMAIN}/messaging/redis-streams`;
function fixture(fn) {
  const root = makeRoot();
  try { init(root); return fn(root); } finally { removeRoot(root); }
}

test('remove previews without changing notes, learner data or registry', () => fixture(root => {
  const p = paths(root, id);
  write(root, p.insights, 'Learner-owned text');
  const registry = read(root, 'state/registry.json');
  const topic = read(root, p.topic_json);
  const preview = tutorJson(root, ['remove', id]);
  assert.equal(preview.code, 0);
  assert.equal(preview.data.deleted, false);
  assert.ok(preview.data.directories.includes(p.state_dir));
  assert.equal(read(root, p.insights), 'Learner-owned text');
  assert.equal(read(root, 'state/registry.json'), registry);
  assert.equal(read(root, p.topic_json), topic);
}));

test('explicit batch removal deletes packages and learner data, retaining shared infrastructure', () => fixture(root => {
  init(root, 'Delivery protocol', { slug: 'delivery-protocol' });
  const other = `${DOMAIN}/messaging/delivery-protocol`;
  const roots = [paths(root, id), paths(root, other)];
  for (const p of roots) {
    write(root, `${p.lessons_dir}/01-example.mdx`, 'lesson');
    write(root, `${p.projects_dir}/mini-01/example.js`, 'project');
    write(root, `${p.topic_components_dir}/Example.tsx`, 'component');
    write(root, p.insights, 'Explicitly requested deletion includes this text');
  }
  write(root, 'vault/_concepts/Reusable.md', 'Keep this shared note.');
  const result = tutorJson(root, ['remove', id, other, '--delete']);
  assert.equal(result.code, 0, JSON.stringify(result.data));
  assert.equal(result.data.deleted, true);
  for (const p of roots) for (const key of ['state_dir', 'vault_dir', 'lessons_dir', 'projects_dir', 'topic_components_dir']) assert.equal(fs.existsSync(path.join(root, p[key])), false, key);
  assert.deepEqual(JSON.parse(read(root, 'state/registry.json')).topics, []);
  assert.equal(tutorJson(root, ['list']).data.count, 0);
  assert.match(read(root, 'vault/Home.md'), /No topics yet/);
  assert.match(read(root, roots[0].domain_map), /No topics yet/);
  assert.doesNotMatch(read(root, roots[0].domain_map), /00-start-here-redis-streams/);
  assert.equal(read(root, 'vault/_concepts/Reusable.md'), 'Keep this shared note.');
}));

test('removing one topic preserves other topics and components shared by their slug', () => fixture(root => {
  init(root, 'Redis Streams', { subdomain: 'storage' });
  const other = `${DOMAIN}/storage/redis-streams`, p = paths(root, id), q = paths(root, other);
  write(root, `${p.topic_components_dir}/Example.tsx`, 'shared visual');
  assert.equal(tutorJson(root, ['remove', id, '--delete']).code, 0);
  assert.equal(fs.existsSync(path.join(root, q.topic_json)), true);
  assert.equal(read(root, `${p.topic_components_dir}/Example.tsx`), 'shared visual');
  assert.deepEqual(tutorJson(root, ['list']).data.topics.map(t => t.id), [other]);
  assert.ok(read(root, 'vault/Home.md').includes('00-start-here-redis-streams'));
}));

test('bad batch arguments and symlinked roots fail before any deletion', () => fixture(root => {
  const p = paths(root, id), before = read(root, p.topic_json);
  assert.equal(tutorJson(root, ['remove', id, 'unknown', '--delete']).code, 2);
  assert.equal(read(root, p.topic_json), before);
  const external = fs.mkdtempSync(path.join(path.dirname(root), 'remove-external-'));
  try {
    fs.writeFileSync(path.join(external, 'keep.txt'), 'outside');
    fs.rmSync(path.join(root, p.lessons_dir), { recursive: true, force: true });
    fs.symlinkSync(external, path.join(root, p.lessons_dir));
    const result = tutorJson(root, ['remove', id, '--delete']);
    assert.equal(result.code, 1);
    assert.match(result.data.error, /symlink/);
    assert.equal(read(root, p.topic_json), before);
    assert.equal(fs.readFileSync(path.join(external, 'keep.txt'), 'utf8'), 'outside');
  } finally { fs.rmSync(external, { recursive: true, force: true }); }
}));

test('remove rejects corrupted identities and never trusts stored artifact paths', () => fixture(root => {
  const p = paths(root, id), topic = JSON.parse(read(root, p.topic_json));
  topic.domain = '../outside';
  write(root, p.topic_json, JSON.stringify(topic));
  assert.equal(tutorJson(root, ['remove', id, '--delete']).code, 1);
  topic.domain = DOMAIN;
  topic.paths.projects = 'outside';
  write(root, 'outside/keep.txt', 'unrelated');
  write(root, p.topic_json, JSON.stringify(topic));
  assert.equal(tutorJson(root, ['remove', id, '--delete']).code, 0);
  assert.equal(read(root, 'outside/keep.txt'), 'unrelated');
}));
