// Shared fixtures of the adaptive-experience tests and the experiences e2e
// script: four representative topics built through the tutor CLI from the
// examples in harness/examples/experiences.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addSource, makeRoot, paths, prose, setPlan, sourceEntry, TODAY, tutorJson, write } from './helpers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(here, '..', '..', '..');
export const EXAMPLES = path.join(REPO, 'harness', 'examples', 'experiences');
export const VIDEO_EXAMPLES = path.join(REPO, 'harness', 'examples', 'videos');
export const json = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export const CASES = [
  { key: 'http-request-lifecycle', expected: 'explainer', title: 'HTTP Request Lifecycle', slug: 'http-request-lifecycle', domain: 'test-engineering', subdomain: 'messaging', depth: 'quick', concept: 'http-request-lifecycle' },
  { key: 'binary-search', expected: 'interactive', title: 'Binary Search', slug: 'binary-search', domain: 'test-engineering', subdomain: 'messaging', depth: 'quick', concept: 'binary-search' },
  { key: 'distributed-consensus', expected: 'hybrid', title: 'Distributed Consensus', slug: 'distributed-consensus', domain: 'test-engineering', subdomain: 'messaging', depth: 'standard', concept: 'leader-election' },
  { key: 'marketing-funnel-strategy', expected: 'branching', title: 'Marketing Funnel Strategy', slug: 'marketing-funnel-strategy', domain: 'no-code', subdomain: 'marketing', depth: 'quick', concept: 'funnel-conversion' },
];
export const STATIC = { complexity: 1, concepts: 1, dependent_steps: 0, changes_over_time: false, spatial: false, parameters: 0, decision_paths: 0, benefit: 'low' };

export function fixtureRoot() {
  const root = makeRoot();
  for (const font of ['atkinson-regular.woff', 'atkinson-bold.woff']) write(root, `site/src/assets/fonts/${font}`, 'font');
  // Publishing copies the pinned GSAP and HyperFrames runtime from the site's dependencies.
  fs.mkdirSync(path.join(root, 'site'), { recursive: true });
  fs.symlinkSync(path.join(REPO, 'site', 'node_modules'), path.join(root, 'site', 'node_modules'));
  return root;
}

const fill = (value, map) => JSON.parse(JSON.stringify(value).replace(/"(SOURCE|LESSON_PAGE)"/g, (_, k) => JSON.stringify(map[k])));

export const lessonPage = (order, body, last = false) => [
  '---', `title: Page ${order}`, 'description: One idea.', `order: ${order}`, 'concepts: [mechanism]', '---', '',
  prose(150), '', body, '',
  last ? '<Resources />\n' : '',
].join('\n');
export const QUIZ = '<Quiz question="Which step decides the outcome?" options={["The last one", "The first one"]} answer={0} />';

/** Build one representative topic through the CLI. Returns { id, p, page, spec }. */
export function buildCase(root, c, { depth = c.depth } = {}) {
  const created = tutorJson(root, ['init', c.title, '--domain', c.domain, '--subdomain', c.subdomain, '--depth', depth]);
  assert.equal(created.code, 0, JSON.stringify(created.data));
  const id = `${c.domain}/${c.subdomain}/${c.slug}`;
  const source = `${c.slug}-source`;
  for (let i = 1; i <= 3; i++) {
    const r = addSource(root, id, sourceEntry(i === 1 ? source : `${c.slug}-extra-${i}`, i === 1 ? {} : { tier: 'B', type: 'paper', evidence: { stars: null, last_commit: null, citations: 900, venue: 'Venue', publisher: 'Publisher', used_by: ['Adopter'] } }));
    assert.equal(r.code, 0, JSON.stringify(r.data));
  }
  const dir = path.join(EXAMPLES, c.key);
  const { signals } = json(path.join(dir, 'signals.json'));
  const experience = json(path.join(dir, 'experience.json'));
  const pageCount = depth === 'quick' ? 3 : 5;
  const main = 2;
  const outline = [];
  for (let order = 1; order <= pageCount; order++) {
    const slug = order === main ? 'the-mechanism' : `part-${order}`;
    if (order !== main) {
      outline.push({ order, slug, title: `Part ${order}`, activity: 'Quiz', complexity: 'basic', importance: 'supporting', spatial: false, visual: null, visual_reason: 'A short example is enough here.', experience: { signals: STATIC } });
      continue;
    }
    const explainer = c.expected === 'explainer';
    outline.push({
      order, slug, title: 'The mechanism', activity: 'Quiz',
      complexity: explainer ? 'intermediate' : 'advanced', importance: 'critical', spatial: false,
      visual: 'Experience', visual_reason: 'The mechanism changes over time and the learner should act on it.',
      interaction_goal: 'Predict the next state, then check it.',
      ...(explainer ? { video: { id: experience.watch.video, reason: 'The order of the steps is the idea.' } } : {}),
      experience: { signals, id: experience.id, concept_ids: [c.concept] },
    });
  }
  const plan = {
    summary: `${c.title} explained with the experience that fits.`, prerequisites: [], outcomes: ['explain the mechanism', 'predict its behavior'],
    visual_policy: 'adaptive', visual_first: true, experience_policy: 'adaptive', multi_stage: true, lesson_outline: outline,
    mini_projects: [{ n: 1, slug: 'build-it', use_case: 'A small real use case.' }],
  };
  const planned = setPlan(root, id, plan);
  const p = paths(root, id);
  const page = `${p.lessons_dir}/02-the-mechanism.mdx`;
  const map = { SOURCE: source, LESSON_PAGE: page };

  // Parts: videos (incl. the shared Raft intro), decks, the fallback diagram, the experience.
  const videoFiles = fs.existsSync(path.join(dir, 'videos')) ? fs.readdirSync(path.join(dir, 'videos')).map((f) => path.join(dir, 'videos', f)) : [];
  if (experience.watch?.video === 'raft-write-commit') videoFiles.push(path.join(VIDEO_EXAMPLES, 'raft-write-commit.json'));
  for (const file of videoFiles) {
    const spec = fill(json(file), map);
    spec.source_ids = [source];
    spec.scenes.forEach((s) => { if (s.source_ids) s.source_ids = [source]; });
    spec.used_in = [page];
    spec.concept_ids = [c.concept];
    spec.narration = { engine: 'none' };
    write(root, `${p.videos_dir}/${spec.id}/video.json`, JSON.stringify(spec));
  }
  const decks = path.join(dir, 'decks');
  for (const f of fs.existsSync(decks) ? fs.readdirSync(decks) : []) {
    const spec = fill(json(path.join(decks, f)), map);
    spec.concept_ids = [c.concept];
    write(root, `${p.videos_dir}/${spec.id}/deck.json`, JSON.stringify(spec));
  }
  const spec = fill(experience, map);
  spec.concept_ids = [c.concept];
  spec.checkpoints.forEach((cp) => { cp.concept_ids = [c.concept]; });
  for (const h of spec.inspect ?? []) h.concept_id = c.concept;
  write(root, `${p.experiences_dir}/${spec.id}/experience.json`, JSON.stringify(spec));

  for (let order = 1; order <= pageCount; order++) {
    const file = order === main ? page : `${p.lessons_dir}/${String(order).padStart(2, '0')}-part-${order}.mdx`;
    const body = order === main ? `<Experience id="${spec.id}" />` : `A concrete example.\n\n${QUIZ}`;
    write(root, file, lessonPage(order, body, order === pageCount));
  }
  const fallback = spec.fallback_visual ?? 'the-whole-process';
  const asset = `${p.visual_assets_dir}/${fallback}-${c.slug}.mmd`;
  write(root, asset, fs.readFileSync(path.join(dir, 'fallback.mmd'), 'utf8'));
  write(root, 'tmp/visual.json', JSON.stringify({
    id: fallback, title: `${c.title}: the whole process`, kind: 'workflow', scope: 'end-to-end', format: 'mermaid', file: asset,
    concept_ids: [c.concept], source_ids: [source], purpose: 'See every step before studying one.',
    explanation: 'Each step hands its result to the next one, and the last step gives the outcome the learner predicts.',
    alt: 'A diagram of every step of the mechanism in order, from the first input to the final outcome, joined by arrows.',
    learning_check: { question: 'Which step decides the outcome?', answer: 'The comparison step.' }, used_in: [page],
  }));
  const reg = tutorJson(root, ['visuals', id, 'add', '--file', path.join(root, 'tmp/visual.json')]);
  assert.equal(reg.code, 0, JSON.stringify(reg.data));

  write(root, p.lesson, ['---', 'title: Lesson', `topic: ${id}`, 'stage: lesson', `tags: [${c.domain}, ${c.subdomain}]`, `created: ${TODAY}`, '---', '', `Open \`${p.site_url}\`.`, '', '## My insights', ''].join('\n'));
  return { id, p, page, spec, planned };
}

