// Visual-first learning: the visual registry, the vault export, the lesson and
// note gates, and the HyperFrames video pipeline. Representative topics from
// three domains (distributed systems, deep learning, marketing) run through
// the same gates, so the standard is checked for reuse across domains.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { probeMp4, probeWav, parseVtt } from '../lib/media-files.mjs';
import { requiredReviewChecks } from '../lib/quality.mjs';
import { styleReport } from '../lib/style.mjs';
import { loadTopic } from '../lib/topic-store.mjs';
import { buildVideo, captionCues, checkVideo, renderVideo, sceneTiming, videoSpecProblems } from '../lib/video.mjs';
import { conceptMapMermaid, mermaidProblems, svgProblems, visualEntryProblems } from '../lib/visuals.mjs';
import { diagramCount } from '../lib/validators/visuals.mjs';
import { addSource, makeRoot, paths, prose, read, removeRoot, setPlan, sourceEntry, TODAY, tutor, tutorJson, write } from './support/helpers.mjs';

const EXAMPLES = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'examples', 'videos');
const example = (name) => JSON.parse(fs.readFileSync(path.join(EXAMPLES, name), 'utf8'));

// --- fixtures ----------------------------------------------------------------------

/** Three representative topics. Each has its own sequence, concepts and visuals. */
const DOMAINS = [
  {
    name: 'distributed systems',
    domain: 'test-engineering', subdomain: 'messaging', title: 'Raft Consensus', slug: 'raft-consensus',
    concept: 'log-replication', video: 'raft-write-commit.json', simulation: '<ClusterSim mode="replication" servers={5} latency={2} intro="Fail two servers, then send a write." />',
    simulationName: 'ClusterSim',
  },
  {
    name: 'deep learning',
    domain: 'test-ai', subdomain: 'deep-learning', title: 'Backpropagation', slug: 'backpropagation',
    concept: 'chain-rule-gradient', video: 'backprop-weight-update.json',
    simulation: '<AlgorithmStepper title="One gradient step" frames={[{ caption: "Forward pass gives 1.", vars: { w: 0.5, loss: 2 } }, { caption: "Gradient is -4.", vars: { w: 0.5, grad: -4 } }, { caption: "Update gives 0.9.", vars: { w: 0.9 } }]} />',
    simulationName: 'AlgorithmStepper',
  },
  {
    name: 'marketing',
    domain: 'no-code', subdomain: 'marketing', title: 'Marketing Funnels', slug: 'marketing-funnels',
    concept: 'funnel-conversion', video: 'marketing-funnel.json',
    simulation: '<CompareView left={{ label: "Fix sign-up", points: ["Doubles every later stage"] }} right={{ label: "Fix checkout", points: ["Changes only the last stage"] }} verdict="Fix the largest relative drop first." />',
    simulationName: 'CompareView', complexity: 'intermediate',
  },
];

function addAiDomain(root) {
  const from = path.join(root, 'harness', 'domains', 'test-engineering');
  const to = path.join(root, 'harness', 'domains', 'test-ai');
  fs.cpSync(from, to, { recursive: true });
  const pack = JSON.parse(fs.readFileSync(path.join(to, 'pack.json'), 'utf8'));
  pack.id = 'test-ai';
  pack.title = 'Test AI';
  pack.subdomains = [{ id: 'deep-learning', title: 'Deep learning', examples: ['Backpropagation'] }];
  fs.writeFileSync(path.join(to, 'pack.json'), JSON.stringify(pack));
}

function fixtureRoot() {
  const root = makeRoot();
  addAiDomain(root);
  // The video generator copies the site fonts into each project.
  for (const font of ['atkinson-regular.woff', 'atkinson-bold.woff']) write(root, `site/src/assets/fonts/${font}`, 'font');
  return root;
}

const ADVANCED_REASON = 'Changing the inputs and watching the outcome exposes the mechanism.';

function visualFirstPlan(d) {
  const page = (order, slug, extra) => ({ order, slug, title: `Page ${order}`, activity: 'Quiz', ...extra });
  return {
    summary: `${d.title} explained visually.`,
    prerequisites: [],
    outcomes: ['explain the mechanism', 'predict a failure'],
    visual_policy: 'adaptive',
    visual_first: true,
    multi_stage: true,
    lesson_outline: [
      page(1, 'why-it-matters', { complexity: 'basic', importance: 'supporting', spatial: false, visual: null, visual_reason: 'A concrete example is enough.' }),
      page(2, 'the-whole-process', {
        complexity: 'intermediate', importance: 'core', spatial: false, visual: 'Diagram', visual_reason: 'The process has several dependent stages.',
        interaction_goal: 'Zoom into the stage that decides the outcome and predict it.', video: { id: example(d.video).id, reason: 'The order of the stages is the idea.' },
      }),
      page(3, 'try-it', { complexity: d.complexity ?? 'advanced', importance: 'critical', spatial: false, visual: d.simulationName, visual_reason: ADVANCED_REASON, interaction_goal: 'Change one input and predict the outcome.' }),
    ],
    mini_projects: [{ n: 1, slug: 'build-it', use_case: 'A small real use case.' }],
  };
}

function frontmatter(id, stage, title) {
  const [domain, subdomain] = id.split('/');
  return `---\ntitle: ${title}\ntopic: ${id}\nstage: ${stage}\ntags: [${domain}, ${subdomain}]\ncreated: ${TODAY}\n---\n`;
}

const lessonPage = (order, body, last = false) => [
  '---', `title: Page ${order}`, 'description: One idea.', `order: ${order}`, 'concepts: [mechanism]', '---', '',
  prose(150), '', body, '',
  '<Quiz question="Which step decides the outcome?" options={["The last one", "The first one"]} answer={0} />', '',
  last ? '<Resources />\n' : '',
].join('\n');

const SOURCE = (d) => `${d.slug}-source`;

/** A complete, passing visual-first lesson stage for one domain. Returns { id, p }. */
function buildTopic(root, d) {
  const created = tutorJson(root, ['init', d.title, '--domain', d.domain, '--subdomain', d.subdomain, '--depth', 'quick']);
  assert.equal(created.code, 0, JSON.stringify(created.data));
  const id = `${d.domain}/${d.subdomain}/${d.slug}`;
  for (let i = 1; i <= 3; i++) {
    const r = addSource(root, id, sourceEntry(i === 1 ? SOURCE(d) : `${d.slug}-extra-${i}`, i === 1 ? {} : { tier: 'B', type: 'paper', evidence: { stars: null, last_commit: null, citations: 900, venue: 'Venue', publisher: 'Publisher', used_by: ['Adopter'] } }));
    assert.equal(r.code, 0, JSON.stringify(r.data));
  }
  const plan = visualFirstPlan(d);
  const planned = setPlan(root, id, plan);
  assert.equal(planned.data.intake_gate.ok, true, JSON.stringify(planned.data.intake_gate));
  const p = paths(root, id);
  const pages = ['01-why-it-matters.mdx', '02-the-whole-process.mdx', '03-try-it.mdx'].map((n) => `${p.lessons_dir}/${n}`);

  // Video storyboard from the shared example, pointed at this topic.
  const spec = example(d.video);
  spec.source_ids = [SOURCE(d)];
  spec.scenes.forEach((scene) => { if (scene.source_ids) scene.source_ids = [SOURCE(d)]; });
  spec.used_in = [pages[1]];
  spec.narration = { engine: 'none' };
  write(root, `${p.videos_dir}/${spec.id}/video.json`, JSON.stringify(spec));

  // End-to-end workflow diagram asset + registry entry.
  const asset = `${p.visual_assets_dir}/the-whole-process-${d.slug}.mmd`;
  write(root, asset, 'flowchart LR\n  a[Start] --> b[Middle]\n  b --> c[Decision]\n  c --> d[Outcome]\n');
  write(root, pages[0], lessonPage(1, 'A concrete example of the mechanism.'));
  write(root, pages[1], lessonPage(2, `<Diagram id="the-whole-process" />\n\n<Video id="${spec.id}" />`));
  write(root, pages[2], lessonPage(3, d.simulation, true));
  write(root, p.lesson, [frontmatter(id, 'lesson', 'Lesson'), `Open \`${p.site_url}\`.`, '', '## My insights', ''].join('\n'));

  const built = tutorJson(root, ['video', id, 'build', spec.id]);
  assert.equal(built.code, 0, JSON.stringify(built.data));
  register(root, id, {
    id: 'the-whole-process', title: `${d.title}: the whole process`, kind: 'workflow', scope: 'end-to-end', format: 'mermaid',
    file: asset, concept_ids: [d.concept], source_ids: [SOURCE(d)],
    purpose: 'See every stage before studying one.', explanation: 'Each stage hands its result to the next; the decision stage sets the outcome.',
    alt: 'Four boxes in a row, start, middle, decision and outcome, joined left to right by arrows.',
    learning_check: { question: 'Which stage sets the outcome?', answer: 'The decision stage.' }, used_in: [pages[1]],
  });
  register(root, id, {
    id: 'try-it-simulation', title: `${d.title} simulation you can change`, kind: 'simulation', format: 'component', component: d.simulationName,
    concept_ids: [d.concept], source_ids: [SOURCE(d)], purpose: 'Change one input and see the effect.',
    explanation: 'Each control changes one input; the explanation line names the cause of the outcome.',
    alt: 'An interactive simulation with controls, a result line and an explanation of why the result happened.',
    learning_check: { question: 'What happens when the deciding input changes?', answer: 'The outcome changes as the explanation states.' }, used_in: [pages[2]],
  });
  return { id, p, pages, spec };
}

function register(root, id, entry) {
  write(root, 'tmp/visual.json', JSON.stringify(entry));
  const r = tutorJson(root, ['visuals', id, 'add', '--file', path.join(root, 'tmp/visual.json')]);
  assert.equal(r.code, 0, JSON.stringify(r.data));
  return r;
}

/** A minimal but structurally real MP4: ftyp, and moov with mvhd and one video trak. */
export function fakeMp4(seconds, { width = 1920, height = 1080 } = {}) {
  const box = (type, ...parts) => {
    const body = Buffer.concat(parts);
    const head = Buffer.alloc(8);
    head.writeUInt32BE(body.length + 8, 0);
    head.write(type, 4, 'latin1');
    return Buffer.concat([head, body]);
  };
  const mvhd = Buffer.alloc(100);
  mvhd.writeUInt32BE(1000, 12);
  mvhd.writeUInt32BE(Math.round(seconds * 1000), 16);
  const tkhd = Buffer.alloc(84);
  tkhd.writeUInt32BE(width * 65536, 76);
  tkhd.writeUInt32BE(height * 65536, 80);
  const hdlr = Buffer.alloc(24);
  hdlr.write('vide', 8, 'latin1');
  return Buffer.concat([
    box('ftyp', Buffer.from('isom\0\0\x02\0isomiso2', 'latin1')),
    box('moov', box('mvhd', mvhd), box('trak', box('tkhd', tkhd), box('mdia', box('hdlr', hdlr)))),
  ]);
}

function fakeWav(seconds, rate = 22050) {
  const data = Buffer.alloc(Math.round(seconds * rate) * 2);
  const head = Buffer.alloc(44);
  head.write('RIFF', 0, 'latin1'); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8, 'latin1');
  head.write('fmt ', 12, 'latin1'); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24); head.writeUInt32LE(rate * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34);
  head.write('data', 36, 'latin1'); head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

// --- three domains through the same gates ----------------------------------------------

describe('visual-first lessons in three domains', () => {
  for (const d of DOMAINS) {
    test(`${d.name}: registered visuals, a planned video and a simulation pass the lesson gate`, () => {
      const root = fixtureRoot();
      try {
        const { id, p } = buildTopic(root, d);
        const result = tutorJson(root, ['validate', id, 'lesson', '--structure-only']);
        assert.equal(result.code, 0, JSON.stringify(result.data.failures ?? result.data, null, 1));
        // The video is a storyboard (no renderer in tests): reported honestly as a warning.
        assert.ok(result.data.warnings.some((w) => /is not rendered/.test(w.problem)), JSON.stringify(result.data.warnings));

        // The vault export ties each visual to its concepts and sources.
        assert.equal(tutor(root, ['map', id]).code, 0);
        const index = read(root, p.visuals_index);
        for (const name of ['the-whole-process', 'try-it-simulation', example(d.video).id]) assert.match(index, new RegExp(`\\[\\[visual-${name}-${d.slug}\\|`));
        const note = read(root, `${p.visuals_dir}/visual-the-whole-process-${d.slug}.md`);
        assert.match(note, /stage: visual/);
        assert.match(note, /```mermaid\nflowchart LR/);
        assert.match(note, new RegExp(`## Sources[\\s\\S]*${SOURCE(d)}`));
        assert.match(note, /## Check yourself/);
        const video = read(root, `${p.visuals_dir}/visual-${example(d.video).id}-${d.slug}.md`);
        assert.match(video, /## Transcript/);
        assert.match(video, /Video status: \*\*storyboard\*\*/);
        assert.match(read(root, p.start_here), new RegExp(`\\[\\[visuals-${d.slug}\\|Visuals\\]\\]`));

        // Every exported note has valid frontmatter and resolving links.
        const all = tutorJson(root, ['validate', id, '--all', '--structure-only']);
        const visualProblems = all.data.stages.flatMap((r) => r.failures).filter((f) => f.path.includes('/visuals/'));
        assert.deepEqual(visualProblems, []);
      } finally {
        removeRoot(root);
      }
    });
  }

  test('the gate fails unregistered ids, missing planned videos, too few visuals and oversized Depth blocks', () => {
    const root = fixtureRoot();
    try {
      const d = DOMAINS[0];
      const { id, pages } = buildTopic(root, d);
      const lesson = () => tutorJson(root, ['validate', id, 'lesson', '--structure-only']).data.failures.map((f) => f.problem).join('\n');

      write(root, pages[1], lessonPage(2, '<Diagram id="not-registered" />'));
      let problems = lesson();
      assert.match(problems, /<Diagram id="not-registered"> is not registered/);
      assert.match(problems, /does not embed its planned video/);

      write(root, pages[1], lessonPage(2, `<Diagram id="the-whole-process" />\n\n<Video id="raft-write-commit" />\n\n<Depth level="internals">\n\n${prose(200)}\n\n</Depth>`));
      assert.match(lesson(), /<Depth level="internals"> has 200 words/);

      write(root, pages[1], lessonPage(2, '<Video id="the-whole-process" />\n\n<Diagram id="raft-write-commit" />'));
      problems = lesson();
      assert.match(problems, /<Video id="the-whole-process"> names a mermaid visual/);
      assert.match(problems, /<Diagram id="raft-write-commit"> names a hyperframes visual/);

      tutor(root, ['visuals', id, 'remove', 'the-whole-process', '--reason', 'test']);
      tutor(root, ['visuals', id, 'remove', 'try-it-simulation', '--reason', 'test']);
      write(root, pages[1], lessonPage(2, '<Video id="raft-write-commit" />'));
      problems = lesson();
      assert.match(problems, /registers 1 lesson visuals, depth "quick" needs at least 2/);
      assert.match(problems, /does not use its planned visual <Diagram>/);
      assert.match(problems, /no end-to-end workflow diagram/);
    } finally {
      removeRoot(root);
    }
  });

  test('registry entries are checked against sources, concepts, files and asset safety', () => {
    const root = fixtureRoot();
    try {
      const { id, p, pages } = buildTopic(root, DOMAINS[1]);
      const unsafe = `${p.visual_assets_dir}/unsafe-${DOMAINS[1].slug}.svg`;
      write(root, unsafe, '<svg><script>alert(1)</script><rect/></svg>');
      write(root, 'tmp/visual.json', JSON.stringify({
        id: 'unsafe', title: 'An unsafe drawing here', kind: 'illustration', format: 'svg', file: unsafe,
        concept_ids: ['x'], source_ids: ['not-a-source'], purpose: 'p', explanation: 'too short', alt: 'short alt',
        learning_check: { question: 'q' }, used_in: [pages[0], 'missing/file.md'],
      }));
      const r = tutorJson(root, ['visuals', id, 'add', '--file', path.join(root, 'tmp/visual.json')]);
      assert.equal(r.code, 1);
      const problems = r.data.failures.map((f) => f.problem).join('\n');
      for (const expected of [/not in sources.json: not-a-source/, /explanation/, /`alt`/, /learning_check/, /viewBox/, /<title>/, /scripts or event handlers/, /missing\/file.md does not exist/]) {
        assert.match(problems, expected);
      }
    } finally {
      removeRoot(root);
    }
  });

  test('re-exporting a visual note keeps the learner insights byte for byte', () => {
    const root = fixtureRoot();
    try {
      const { id, p } = buildTopic(root, DOMAINS[2]);
      tutor(root, ['map', id]);
      const file = `${p.visuals_dir}/visual-the-whole-process-${DOMAINS[2].slug}.md`;
      const mine = '## My insights\n\n- 2026-11-17: sign-up was the real bottleneck in my last campaign.\n';
      write(root, file, read(root, file).replace(/## My insights[\s\S]*$/, mine));
      write(root, 'tmp/patch.json', JSON.stringify({ explanation: 'Each stage keeps only part of the people from the stage before it.' }));
      assert.equal(tutor(root, ['visuals', id, 'update', 'the-whole-process', '--file', path.join(root, 'tmp/patch.json')]).code, 0);
      const after = read(root, file);
      assert.ok(after.endsWith(mine), after.slice(-200));
      assert.match(after, /Each stage keeps only part/);
    } finally {
      removeRoot(root);
    }
  });

  test('visual-first notes, projects and capstone need diagrams; recall points to a visual', () => {
    const root = fixtureRoot();
    try {
      const { id, p } = buildTopic(root, DOMAINS[0]);
      write(root, p.brief, [frontmatter(id, 'brief', 'Brief'), '## What it is', '', prose(60), '', '## The problem it solves', '', prose(60), '', '## Where it is used', '', prose(60), '', '## My insights', ''].join('\n'));
      const brief = tutorJson(root, ['validate', id, 'brief', '--structure-only']);
      assert.ok(brief.data.failures.some((f) => /a visual-first brief needs at least 1/.test(f.problem)));
      write(root, p.final_notes, [frontmatter(id, 'final-notes', 'Final notes'), prose(300), '', '## My insights', ''].join('\n'));
      write(root, p.recall, [frontmatter(id, 'recall', 'Recall'), '<!-- card: rc-01 -->', 'Q?', '?', 'A.', '', '## My insights', ''].join('\n'));
      const notes = tutorJson(root, ['validate', id, 'notes', '--structure-only']).data.failures.map((f) => f.problem).join('\n');
      assert.match(notes, /does not link the visual index/);
      assert.match(notes, /no card points to a visual/);
      write(root, `${p.projects_dir}/mini-01-build-it/README.md`, '# Build it\n\nNo diagram yet.\n');
      const minis = tutorJson(root, ['validate', id, 'mini-projects', '--structure-only']).data.failures.map((f) => f.problem).join('\n');
      assert.match(minis, /mini-project README \(architecture or execution flow\)/);
    } finally {
      removeRoot(root);
    }
  });

  test('a visual registered by another stage does not stale the lesson receipt', async () => {
    const { stageDigest } = await import('../lib/freshness.mjs');
    const root = fixtureRoot();
    try {
      const { id, p } = buildTopic(root, DOMAINS[0]);
      const before = stageDigest(root, loadTopic(root, id), 'lesson');
      const capstoneBefore = stageDigest(root, loadTopic(root, id), 'capstone');
      write(root, `${p.capstone_dir}/ARCHITECTURE.md`, '# Architecture\n');
      const asset = `${p.visual_assets_dir}/capstone-layers-${DOMAINS[0].slug}.mmd`;
      write(root, asset, 'flowchart TD\n  api[API] --> svc[Service]\n  svc --> db[(Store)]\n');
      register(root, id, {
        id: 'capstone-layers', title: 'Capstone layers and responsibilities', kind: 'architecture', format: 'mermaid', file: asset,
        concept_ids: [DOMAINS[0].concept], source_ids: [SOURCE(DOMAINS[0])], purpose: 'See which layer owns which job.',
        explanation: 'The API validates, the service decides, the store keeps the replicated log.',
        alt: 'Three layers from top to bottom: the API calls the service, and the service writes to the store.',
        learning_check: { question: 'Which layer decides?', answer: 'The service layer.' }, used_in: [`${p.capstone_dir}/ARCHITECTURE.md`],
      });
      assert.equal(stageDigest(root, loadTopic(root, id), 'lesson'), before);
      assert.notEqual(stageDigest(root, loadTopic(root, id), 'capstone'), capstoneBefore);
    } finally {
      removeRoot(root);
    }
  });

  test('review checks grow for visual-first plans and videos', () => {
    const root = fixtureRoot();
    try {
      const { id } = buildTopic(root, DOMAINS[0]);
      const topic = loadTopic(root, id);
      const content = requiredReviewChecks(topic, 'content', root);
      for (const check of ['visual-accuracy', 'visual-efficacy', 'interaction-behavior', 'interactive-topic-fit', 'accessibility-responsive', 'writing-standard', 'video-consistency']) assert.ok(content.includes(check), check);
      assert.ok(requiredReviewChecks(topic, 'projects', root).includes('project-diagrams'));
      assert.ok(!requiredReviewChecks({ plan: {} }, 'content', root).includes('visual-accuracy'));
    } finally {
      removeRoot(root);
    }
  });
});

// --- the HyperFrames pipeline ----------------------------------------------------------

describe('HyperFrames video pipeline', () => {
  test('every example storyboard is valid and fits its narration into its scenes', () => {
    for (const file of fs.readdirSync(EXAMPLES).filter((f) => f.endsWith('.json'))) {
      const spec = example(file);
      const { problems } = videoSpecProblems(spec);
      assert.deepEqual(problems, [], `${file}: ${problems.join('; ')}`);
      const total = spec.scenes.reduce((t, s) => t + s.duration, 0);
      assert.ok(total >= 30 && total <= 90, `${file} lasts ${total} s`);
    }
  });

  test('storyboard problems: pace, flow hops, missing reason, consistency warning', () => {
    const spec = example('raft-write-commit.json');
    spec.sequence_reason = '';
    spec.scenes[1].narration = prose(40);
    spec.scenes[1].visual.path.push({ from: 'leader', to: 'ghost' });
    spec.scenes[3].narration = 'Nothing on screen is named in this sentence at all.';
    const { problems, warnings } = videoSpecProblems(spec, { sourceIds: new Set(['raft-paper']) });
    const text = problems.join('\n');
    assert.match(text, /sequence_reason/);
    assert.match(text, /narration has 40 words for 9 s/);
    assert.match(text, /hop leader→ghost/);
    assert.ok(warnings.some((w) => /names none of the labels/.test(w)));
  });

  test('captions follow the narration, cover each scene, and grow with narration audio', () => {
    const spec = example('backprop-weight-update.json');
    const timing = sceneTiming(spec, { forward: { duration: 9.6 } });
    assert.equal(timing[1].duration, 10.4);
    assert.equal(timing[2].start, timing[0].duration + 10.4);
    const cues = captionCues(spec, timing);
    assert.equal(cues.map((c) => c.text).join(' '), spec.scenes.map((s) => s.narration).join(' '));
    assert.ok(cues.every((c) => c.text.split(' ').length <= 12 && c.end > c.start));
    for (const [i, scene] of timing.entries()) {
      const own = cues.filter((c) => c.scene === spec.scenes[i].id);
      assert.ok(own[0].start >= scene.start && own.at(-1).end <= scene.start + scene.duration + 0.01);
    }
  });

  test('build, stubbed render, cache, change detection and honest blocking', () => {
    const root = fixtureRoot();
    try {
      const d = DOMAINS[0];
      const { id, p, spec } = buildTopic(root, d);
      const topic = loadTopic(root, id);
      const project = path.join(root, p.videos_dir, spec.id);
      const html = fs.readFileSync(path.join(project, 'index.html'), 'utf8');
      assert.match(html, /data-composition-id="main"/);
      assert.match(html, /window\.__timelines\["main"\] = tl/);
      assert.equal((html.match(/class="clip scene"/g) ?? []).length, spec.scenes.length);
      const vtt = parseVtt(fs.readFileSync(path.join(project, 'captions.vtt'), 'utf8'));
      assert.equal((html.match(/class="clip caption"/g) ?? []).length, vtt.length);
      assert.equal(checkVideo(root, topic, spec.id).ok, true);

      // No renderer: the registry says why, nothing claims an MP4.
      const blocked = renderVideo(root, topic, spec.id, { tools: { npx: true, renderer: null, blocker: 'FFmpeg is not installed and Docker is not running', docker: false } });
      assert.equal(blocked.ok, false);
      let entry = JSON.parse(read(root, p.visuals_json)).find((e) => e.id === spec.id);
      assert.equal(entry.video.status, 'storyboard');
      assert.match(entry.video.blocker, /FFmpeg is not installed/);

      // A stubbed HyperFrames CLI: lint passes, render writes an MP4 of the storyboard's length.
      const calls = [];
      const spawn = (command, args, options) => {
        calls.push(args.slice(2, 3)[0]);
        if (args.includes('lint')) return { status: 0, stdout: JSON.stringify({ ok: true, errorCount: 0, findings: [] }) };
        fs.mkdirSync(path.join(options.cwd, 'renders'), { recursive: true });
        fs.writeFileSync(path.join(options.cwd, args[args.indexOf('-o') + 1]), fakeMp4(entry.video.duration_s));
        return { status: 0, stdout: '', stderr: '' };
      };
      const tools = { npx: true, renderer: 'docker', docker: true, blocker: null };
      const rendered = renderVideo(root, topic, spec.id, { tools, spawn });
      assert.equal(rendered.ok, true, JSON.stringify(rendered));
      assert.deepEqual(calls, ['lint', 'render']);
      entry = JSON.parse(read(root, p.visuals_json)).find((e) => e.id === spec.id);
      assert.equal(entry.video.status, 'rendered');
      assert.equal(entry.video.renderer, 'docker');
      assert.ok(fs.existsSync(path.join(root, p.media_dir, `${spec.id}.mp4`)));
      assert.ok(fs.existsSync(path.join(root, p.media_dir, `${spec.id}.vtt`)));
      assert.equal(entry.video.url, `/media/${id}/${spec.id}.mp4`);
      assert.equal(checkVideo(root, topic, spec.id).ok, true);
      const lesson = tutorJson(root, ['validate', id, 'lesson', '--structure-only']);
      assert.equal(lesson.code, 0, JSON.stringify(lesson.data.failures));
      assert.ok(!lesson.data.warnings.some((w) => /is not rendered/.test(w.problem)));

      // Unchanged storyboard: no second render.
      const again = renderVideo(root, topic, spec.id, { tools, spawn });
      assert.equal(again.cached, true);
      assert.deepEqual(calls, ['lint', 'render']);

      // Changed storyboard: the old MP4 is no longer claimed as current.
      const changed = { ...spec, title: `${spec.title} again` };
      write(root, `${p.videos_dir}/${spec.id}/video.json`, JSON.stringify(changed));
      assert.equal(buildVideo(root, topic, spec.id).ok, true);
      entry = JSON.parse(read(root, p.visuals_json)).find((e) => e.id === spec.id);
      assert.equal(entry.video.status, 'storyboard');
      assert.match(entry.video.blocker, /storyboard changed/);

      // A render whose MP4 is shorter than the storyboard is rejected.
      const short = (command, args, options) => {
        if (args.includes('lint')) return { status: 0, stdout: JSON.stringify({ errorCount: 0 }) };
        fs.writeFileSync(path.join(options.cwd, args[args.indexOf('-o') + 1]), fakeMp4(3));
        return { status: 0 };
      };
      const bad = renderVideo(root, topic, spec.id, { tools, spawn: short, force: true });
      assert.equal(bad.ok, false);
      assert.match(bad.problems[0], /lasts 3\.0 s/);
    } finally {
      removeRoot(root);
    }
  });
});

// --- small readers and checks -------------------------------------------------------------

describe('media readers and writing standard', () => {
  test('MP4, WAV and WebVTT readers', () => {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR ?? '/tmp'), 'media-'));
    try {
      fs.writeFileSync(path.join(dir, 'a.mp4'), fakeMp4(42.5, { width: 1280, height: 720 }));
      const mp4 = probeMp4(path.join(dir, 'a.mp4'));
      assert.deepEqual([mp4.ok, mp4.duration, mp4.width, mp4.height, mp4.hasVideo], [true, 42.5, 1280, 720, true]);
      fs.writeFileSync(path.join(dir, 'b.mp4'), Buffer.from('not a video'));
      assert.equal(probeMp4(path.join(dir, 'b.mp4')).ok, false);
      fs.writeFileSync(path.join(dir, 'a.wav'), fakeWav(1.5));
      assert.equal(probeWav(path.join(dir, 'a.wav')).duration, 1.5);
      assert.deepEqual(parseVtt('WEBVTT\n\n1\n00:00:01.000 --> 00:00:02.500\nHello\n'), [{ start: 1, end: 2.5, text: 'Hello' }]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('mermaid and SVG checks, diagram counting, concept map', () => {
    assert.deepEqual(mermaidProblems('flowchart LR\n  a --> b\n  b --> c'), []);
    assert.match(mermaidProblems('hello\nworld\nagain').join(), /not a diagram type/);
    assert.deepEqual(svgProblems('<svg viewBox="0 0 10 10"><title>T</title><text>x</text></svg>'), []);
    assert.equal(diagramCount('```mermaid\nflowchart LR\n  a --> b\n```\n\n![[x-slug.svg]]\n'), 2);
    const map = conceptMapMermaid({ plan: { curriculum: { concepts: [
      { id: 'root', title: 'Root', parent: null, disposition: 'included' },
      { id: 'child', title: 'Child', parent: 'root', disposition: 'included', prerequisites: ['root'] },
      { id: 'later', title: 'Later', parent: 'root', disposition: 'deferred' },
    ] } } });
    assert.match(map, /root --> child/);
    assert.match(map, /root -. needed for .-> child/);
    assert.doesNotMatch(map, /later/);
  });

  test('writing standard: short active sentences pass, long passive academic prose warns', () => {
    const good = styleReport('The leader sends the entry. Each follower stores it. The leader waits for a majority. Then it replies.');
    assert.deepEqual(good.warnings, []);
    assert.equal(good.score, 100);
    const bad = styleReport([
      'The entry is replicated by the leader to every follower in the cluster so that the state of the system can be utilized by numerous clients later.',
      'It was decided that the methodology would be applied in order to facilitate a consistent view of the log across the replicas of the system.',
      'The request is handled and the result is returned once a quorum of the participating replicas has been reached by the coordinating node in the system.',
    ].join(' '));
    assert.ok(bad.warnings.some((w) => /average sentence/.test(w)));
    assert.ok(bad.warnings.some((w) => /"utilize|"facilitate|"methodology|"numerous/.test(w)));
    assert.ok(bad.score < 50);
  });

  test('visual entry shape checks run without a repository', () => {
    const ok = {
      id: 'a-b', title: 'A complete title here', kind: 'workflow', scope: 'end-to-end', format: 'component', component: 'FlowAnimation',
      purpose: 'p', explanation: 'An explanation that is long enough to pass.', alt: 'A text alternative that names the parts, the order and the conclusion of it.',
      concept_ids: ['c'], source_ids: ['s'], learning_check: { question: 'q', answer: 'a' }, used_in: ['x.mdx'],
    };
    assert.deepEqual(visualEntryProblems(ok), []);
    assert.match(visualEntryProblems({ ...ok, scope: undefined }).join(), /workflow needs `scope`/);
    assert.match(visualEntryProblems({ ...ok, kind: 'video' }).join(), /kind `video` and format `hyperframes`/);
  });
});
