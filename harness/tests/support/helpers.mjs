// Test helpers: a temporary repository root with fixture domain packs, a
// runner for the CLI, and builders that write valid artifacts for each stage.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const TUTOR = path.resolve(here, '..', '..', 'bin', 'tutor.mjs');
const FIXTURE_DOMAINS = path.resolve(here, '..', 'fixtures', 'domains');

export const NOW = '2026-11-14T10:00:00Z';
export const TODAY = '2026-11-14';
export const DOMAIN = 'test-engineering';

/** A fresh temporary repository root that only contains the fixture domain packs. */
export function makeRoot() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'tutor-test-')));
  fs.cpSync(FIXTURE_DOMAINS, path.join(root, 'harness', 'domains'), { recursive: true });
  return root;
}

export function removeRoot(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

/** Run the CLI against a root. Returns { code, stdout, stderr }. */
export function tutor(root, args, { now = NOW, input } = {}) {
  const result = spawnSync(process.execPath, [TUTOR, ...args], {
    encoding: 'utf8',
    input,
    env: { ...process.env, TUTOR_ROOT: root, TUTOR_NOW: now, TZ: 'UTC' },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

/** Run the CLI with --json and parse the output. Returns { code, data }. */
export function tutorJson(root, args, options) {
  const result = tutor(root, [...args, '--json'], options);
  let data;
  try {
    data = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Not JSON (exit ${result.code}) for "${args.join(' ')}":\n${result.stdout}\n${result.stderr}`);
  }
  return { code: result.code, data };
}

export function write(root, relative, text) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

export function read(root, relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

export function readTopic(root, id) {
  return JSON.parse(read(root, `state/topics/${id}/topic.json`));
}

/** `count` words of plain prose, in sentences of ten words. */
export function prose(count) {
  const words = [];
  for (let i = 0; i < count; i++) words.push(i % 10 === 9 ? 'stream.' : 'entry');
  return words.join(' ');
}

export function init(root, title = 'Redis Streams', { depth = 'standard', domain = DOMAIN, subdomain = 'messaging', slug } = {}) {
  const args = ['init', title, '--domain', domain, '--subdomain', subdomain, '--depth', depth];
  if (slug) args.push('--slug', slug);
  return tutorJson(root, args);
}

export function paths(root, topic) {
  return tutorJson(root, ['paths', topic]).data;
}

// --- artifact builders --------------------------------------------------------

function frontmatter(topic, stage, title, extra = '') {
  const [domain, subdomain] = topic.split('/');
  return `---\ntitle: ${title}\ntopic: ${topic}\nstage: ${stage}\ntags: [${domain}, ${subdomain}]\ncreated: ${TODAY}\n${extra}---\n`;
}

export function planFor(pageCount, { miniProjects = 2 } = {}) {
  return {
    summary: 'Redis Streams is an append-only log inside Redis that groups of workers can read.',
    prerequisites: [
      { concept: 'Redis basics', known: false, bridge: 'Redis is an in-memory key-value store.' },
      { concept: 'Queues', known: true, bridge: '' },
    ],
    outcomes: ['explain how a consumer group delivers entries', 'build a reliable job queue'],
    lesson_outline: Array.from({ length: pageCount }, (_, i) => ({
      order: i + 1,
      slug: `page-${i + 1}`,
      title: `Page ${i + 1}`,
      visual: 'FlowAnimation',
      activity: 'Quiz',
    })),
    mini_projects: Array.from({ length: miniProjects }, (_, i) => ({ n: i + 1, slug: `project-${i + 1}`, use_case: 'A shop hands slow work to a worker.' })),
    capstone: { name: 'Order pipeline', problem: 'Process orders reliably.' },
  };
}

export function setPlan(root, topic, plan) {
  write(root, 'tmp/plan.json', JSON.stringify(plan));
  return tutorJson(root, ['plan', topic, '--set', path.join(root, 'tmp/plan.json')]);
}

export function sourceEntry(id, overrides = {}) {
  return {
    id,
    type: 'official-docs',
    title: `Source ${id}`,
    url: `https://example.com/${id}`,
    authors: 'Redis Ltd.',
    year: 2024,
    tier: 'A',
    why_trusted: 'It is the official documentation maintained by the authors of the system.',
    evidence: { stars: null, last_commit: null, citations: null, venue: null, publisher: 'Redis Ltd.', used_by: ['Example Corp'] },
    verified_at: TODAY,
    verified_via: `https://example.com/${id}/about`,
    use_for: ['brief', 'digest'],
    ...overrides,
  };
}

export function addSource(root, topic, entry) {
  write(root, 'tmp/source.json', JSON.stringify(entry));
  return tutorJson(root, ['sources', topic, 'add', '--file', path.join(root, 'tmp/source.json')]);
}

export function addSources(root, topic, count) {
  for (let i = 1; i <= count; i++) {
    const result = addSource(root, topic, sourceEntry(`source-${i}`, i === 1 ? {} : { tier: 'B', type: i === 2 ? 'repo' : 'paper' }));
    if (result.code !== 0) throw new Error(JSON.stringify(result.data));
  }
}

export function writeBrief(root, topic, { words = 200 } = {}) {
  const p = paths(root, topic);
  const third = Math.floor(words / 3);
  write(root, p.brief, [
    frontmatter(topic, 'brief', 'Redis Streams — brief', 'sources: [source-1]\n'),
    '# Redis Streams in brief',
    '',
    '## What it is',
    '',
    prose(third),
    '',
    '## The problem it solves',
    '',
    prose(third),
    '',
    '## Where it is used in the real world',
    '',
    `${prose(third)} See [[${path.basename(p.resources, '.md')}|the resources]].`,
    '',
    '## My insights',
    '',
  ].join('\n'));
}

export function writeDigests(root, topic, count) {
  const p = paths(root, topic);
  const links = [];
  for (let i = 1; i <= count; i++) {
    const name = `source-${i}-${p.slug}`;
    links.push(`- [[${name}|Digest ${i}]]`);
    write(root, `${p.digests_dir}/${name}.md`, [
      frontmatter(topic, 'digest', `Digest ${i}`, `sources: [source-${i}]\n`),
      '## The claim',
      '',
      prose(60),
      '',
      '## My insights',
      '',
    ].join('\n'));
  }
  write(root, p.digests_index, [frontmatter(topic, 'digest', 'Digests'), '# Digests', '', ...links, '', '## My insights', ''].join('\n'));
}

export function writeRepoIntel(root, topic) {
  const p = paths(root, topic);
  tutor(root, ['concept', 'Lua scripting', '--tech']);
  tutor(root, ['concept', 'At-least-once delivery']);
  const folder = `${p.repo_intel_dir}/taskforcesh-bullmq`;
  const note = (name, body) => write(root, `${folder}/bullmq-${name}.md`, [frontmatter(topic, 'repo-intel', `BullMQ ${name}`), body, '', '## My insights', ''].join('\n'));

  note('overview', 'BullMQ is a queue on Redis. Commit analyzed: `3f2a9c1d`. License: MIT.');
  note('architecture', 'Modules: queue, worker.\n\n```mermaid\nflowchart LR\n  A --> B\n```');
  note('module-worker', 'The worker claims jobs. See [[bullmq-overview|overview]].');
  note('tech-and-services', 'Uses [[Lua scripting]] for atomic moves.');
  note('findings', '1. Jobs are moved atomically, a form of [[At-least-once delivery]]. Evidence: `src/classes/worker.ts:120 @ 3f2a9c1`.');
  note('takeaways', 'Borrow the atomic move for the capstone.');
  write(root, p.repo_intel_index, [frontmatter(topic, 'repo-intel', 'Repository deep dive'), '- [[bullmq-overview|taskforcesh/bullmq]]', '', '## My insights', ''].join('\n'));
}

/** A lesson page that passes §12. Options change one thing to make it fail. */
export function lessonPage({ order = 1, words = 160, visual = true, activity = true, extra = '', last = false, imports = '' } = {}) {
  const parts = [
    '---',
    `title: Page ${order}`,
    'description: One line shown under the title.',
    `order: ${order}`,
    'concepts: [append-only log, message id]',
    '---',
    '',
  ];
  if (imports) parts.push(imports, '');
  parts.push(prose(words), '');
  if (visual) {
    parts.push(
      '<FlowAnimation',
      '  title="How an entry moves"',
      '  steps={[',
      "    { id: 'add', label: 'Producer > Stream', detail: `XADD ${'orders'} appends` },",
      "    { id: 'read', label: 'Group reads', detail: 'a > b is not a quote' },",
      '  ]}',
      '/>',
      '',
    );
  }
  parts.push('```js', '// code is not prose: these words are never counted by the validator', 'const answer = 42;', '```', '');
  if (activity) {
    parts.push(
      '<Quiz question="What does XACK do?" options={["Removes it from the pending list", "Deletes the stream"]} answer={0}>',
      '  These words sit inside a component, so they are not counted as prose either.',
      '</Quiz>',
      '',
    );
  }
  if (extra) parts.push(extra, '');
  if (last) parts.push('<Resources />', '');
  return parts.join('\n');
}

export function writeLessons(root, topic, count) {
  const p = paths(root, topic);
  for (let i = 1; i <= count; i++) {
    const name = `${String(i).padStart(2, '0')}-page-${i}.mdx`;
    write(root, `${p.lessons_dir}/${name}`, lessonPage({ order: i, last: i === count }));
  }
  write(root, p.lesson, [
    frontmatter(topic, 'lesson', 'Lesson'),
    `Open the lesson at \`${p.site_url}\`.`,
    '',
    '## My insights',
    '',
  ].join('\n'));
}

export function writeMiniProjects(root, topic, count) {
  const p = paths(root, topic);
  const lines = [];
  for (let i = 1; i <= count; i++) {
    const name = `mini-${String(i).padStart(2, '0')}-project-${i}`;
    write(root, `${p.projects_dir}/${name}/README.md`, `# Project ${i}\n\nBuild a job queue.\n`);
    write(root, `${p.projects_dir}/${name}/starter/index.js`, '// TODO\n');
    write(root, `${p.projects_dir}/${name}/solution/index.js`, 'export const done = true;\n');
    lines.push(`- \`${p.projects_dir}/${name}/\` — proves that a group delivers each entry once.`);
  }
  write(root, p.mini_projects, [frontmatter(topic, 'mini-projects', 'Mini projects'), ...lines, '', '## My insights', ''].join('\n'));
}

export function writeCapstone(root, topic) {
  const p = paths(root, topic);
  write(root, `${p.capstone_dir}/README.md`, '# Order pipeline\n');
  write(root, `${p.capstone_dir}/ARCHITECTURE.md`, '# Architecture\n\nClasses: OrderQueue, OrderWorker.\n');
  write(root, `${p.capstone_dir}/docs/adr/0001-use-consumer-groups.md`, '# 1. Use consumer groups\n');
  write(root, `${p.capstone_dir}/src/order-queue.js`, 'export class OrderQueue {}\n');
  write(root, `${p.capstone_dir}/tests/order-queue.test.js`, '// tests\n');
  write(root, p.capstone, [frontmatter(topic, 'capstone', 'Capstone'), `The project lives in \`${p.capstone_dir}/\`.`, '', '## My insights', ''].join('\n'));
}

export function recallCards(count, prefix = 'rs') {
  const lines = [];
  for (let i = 1; i <= count; i++) {
    lines.push(`<!-- card: ${prefix}-${String(i).padStart(2, '0')} -->`, `Question number ${i}?`, '?', `Answer number ${i}.`, '');
  }
  return lines.join('\n');
}

export function writeNotes(root, topic, { cards = 8, words = 300 } = {}) {
  const p = paths(root, topic);
  write(root, p.final_notes, [frontmatter(topic, 'final-notes', 'Final notes'), '## In one sentence', '', prose(words), '', '## My insights', ''].join('\n'));
  write(root, p.recall, [frontmatter(topic, 'recall', 'Recall cards'), '# Recall cards', '', recallCards(cards), '## My insights', ''].join('\n'));
}
