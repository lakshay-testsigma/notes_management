#!/usr/bin/env node
/**
 * End-to-end check of the visual-first workflow on a real build of the site.
 *
 *   node harness/tests/e2e/visual-topic-site.mjs [--render] [--keep]
 *
 * In a temporary copy of the repository (harness + site, with site/node_modules
 * linked, never the learner's state, vault or projects) it:
 *
 *  1. creates a visual-first topic (system-design / consistency-consensus / Raft),
 *     records a vetted source and a plan with a planned video,
 *  2. registers an end-to-end workflow SVG and a ClusterSim simulation, builds the
 *     HyperFrames storyboard (and renders it with --render: needs FFmpeg or Docker),
 *  3. writes three lesson pages that use <Diagram>, <Video>, <ClusterSim>, <Depth>,
 *  4. runs the lesson gate, `tutor map` (vault export), the site build, `smoke`
 *     and `interact` against the built topic pages.
 *
 * Exit code 0 when every step passes. It prints the temporary root with --keep.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const render = process.argv.includes('--render');
const keep = process.argv.includes('--keep');
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'tutor-e2e-')));
const step = (name) => console.log(`\n== ${name}`);
const fail = (message) => {
	console.error(`e2e FAILED: ${message}\n(root kept at ${root})`);
	process.exit(1);
};

function run(command, args, { cwd = root, env = {}, allowFail = false } = {}) {
	const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, TUTOR_ROOT: root, TUTOR_REPO_ROOT: root, ...env }, maxBuffer: 64 * 1024 * 1024 });
	if (result.status !== 0 && !allowFail) fail(`${command} ${args.join(' ')}\n${(result.stdout ?? '').slice(-2000)}\n${(result.stderr ?? '').slice(-2000)}`);
	return result;
}
const tutor = (...args) => run(process.execPath, [path.join(root, 'harness/bin/tutor.mjs'), ...args]);
const tutorJson = (...args) => JSON.parse(run(process.execPath, [path.join(root, 'harness/bin/tutor.mjs'), ...args, '--json'], { allowFail: true }).stdout);
const write = (relative, text) => {
	fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
	fs.writeFileSync(path.join(root, relative), text);
};
const json = (relative, value) => write(relative, JSON.stringify(value, null, 2));

step('copy harness and site');
fs.cpSync(path.join(repo, 'harness'), path.join(root, 'harness'), { recursive: true });
fs.cpSync(path.join(repo, 'site'), path.join(root, 'site'), {
	recursive: true,
	filter: (src) => !/[/\\](node_modules|dist|\.astro)([/\\]|$)/.test(src.slice(repo.length)) && !src.includes(`${path.sep}content${path.sep}lessons${path.sep}`),
});
fs.symlinkSync(path.join(repo, 'site', 'node_modules'), path.join(root, 'site', 'node_modules'), 'dir');
for (const dir of ['state/topics', 'vault', 'projects']) fs.mkdirSync(path.join(root, dir), { recursive: true });
json('state/registry.json', { schema: 1, topics: [] });

step('create the topic');
tutor('init', 'Raft Consensus', '--domain', 'system-design', '--subdomain', 'consistency-consensus', '--depth', 'quick');
const id = 'system-design/consistency-consensus/raft-consensus';
const p = tutorJson('paths', id);
json('tmp/source.json', {
	id: 'raft-paper', type: 'paper', title: 'In Search of an Understandable Consensus Algorithm', url: 'https://raft.github.io/raft.pdf',
	authors: 'Diego Ongaro, John Ousterhout', year: 2014, tier: 'A', why_trusted: 'It is the paper that defines Raft, published at USENIX ATC 2014.',
	evidence: { stars: null, last_commit: null, citations: 5000, venue: 'USENIX ATC 2014', publisher: 'USENIX', used_by: ['etcd', 'Consul'] },
	verified_at: new Date().toISOString().slice(0, 10), verified_via: 'https://raft.github.io/', use_for: ['lesson', 'digest'],
});
tutor('sources', id, 'add', '--file', path.join(root, 'tmp/source.json'));
const pages = ['01-why-consensus', '02-the-write-path', '03-break-the-cluster'].map((name) => `${p.lessons_dir}/${name}.mdx`);
json('tmp/plan.json', {
	summary: 'Raft keeps a replicated log consistent by committing an entry only after a majority stores it.',
	prerequisites: [{ concept: 'Replication', known: true, bridge: '' }],
	outcomes: ['explain why a write needs a majority', 'predict what a failure does to writes'],
	visual_policy: 'adaptive', visual_first: true, multi_stage: true,
	lesson_outline: [
		{ order: 1, slug: 'why-consensus', title: 'Why servers must agree', activity: 'PredictReveal', complexity: 'basic', importance: 'supporting', spatial: false, visual: null, visual_reason: 'A concrete failure story is enough.' },
		{ order: 2, slug: 'the-write-path', title: 'The path of one write', activity: 'Quiz', complexity: 'intermediate', importance: 'core', spatial: false, visual: 'Diagram', visual_reason: 'The write passes several dependent stages.', interaction_goal: 'Zoom into the acknowledgement step and predict when the leader replies.', video: { id: 'raft-write-commit', reason: 'The commit is caused by an ordered chain of messages.' } },
		{ order: 3, slug: 'break-the-cluster', title: 'Break the cluster', activity: 'SortBuckets', complexity: 'advanced', importance: 'critical', spatial: false, visual: 'ClusterSim', visual_reason: 'Failing servers and watching writes block exposes the quorum rule.', interaction_goal: 'Fail servers until writes stop committing and predict the threshold.' },
	],
	mini_projects: [{ n: 1, slug: 'quorum-counter', use_case: 'Count acknowledgements and decide when to commit.' }],
});
tutor('plan', id, '--set', path.join(root, 'tmp/plan.json'));

step('register visuals and build the video');
const svg = fs.readFileSync(path.join(repo, 'site/src/data/demo/write-path.svg'), 'utf8');
write(`${p.visual_assets_dir}/write-path-end-to-end-${p.slug}.svg`, svg);
const lessonPage = (order, title, body, last = false) => `---\ntitle: ${title}\ndescription: One idea about Raft.\norder: ${order}\nconcepts: [majority, log replication]\n---\n\n${'A server cluster must agree on one order of writes. The leader sends each entry to every follower. The entry is safe after a majority stores it. '.repeat(6)}\n\n${body}\n${last ? '\n<Resources />\n' : ''}`;
write(pages[0], lessonPage(1, 'Why servers must agree', '<PredictReveal prompt="Two servers accept different writes for the same key. What breaks?" answer="Clients read different values: the replicas diverge." />'));
write(pages[1], lessonPage(2, 'The path of one write', '<Diagram id="write-path-end-to-end" />\n\n<Video id="raft-write-commit" />\n\n<Depth level="internals">\n\nThe leader tracks a matchIndex for each follower. It advances commitIndex to the highest index that a majority of matchIndex values reach, and only for entries of its current term.\n\n</Depth>\n\n<Quiz question="In five servers, how many must store an entry before it commits?" options={["Three", "Five", "Two"]} answer={0} explanation="Three of five is a majority." />'));
write(pages[2], lessonPage(3, 'Break the cluster', '<ClusterSim mode="replication" servers={5} latency={2} intro="Fail s4 and s5, send a write, then fail s3 too." />\n\n<SortBuckets prompt="Sort each cluster state by whether writes still commit." buckets={["Commits", "Blocks"]} items={[{ text: "5 servers, 2 down", bucket: "Commits" }, { text: "5 servers, 3 down", bucket: "Blocks" }, { text: "3 servers, 1 down", bucket: "Commits" }]} explanation="A write commits while a majority of all configured servers is up." />', true));
write(p.lesson, `---\ntitle: Lesson\ntopic: ${id}\nstage: lesson\ntags: [system-design, consistency-consensus]\ncreated: 2026-11-17\n---\n\nOpen \`${p.site_url}\`.\n\n## My insights\n`);
json('tmp/diagram.json', {
	id: 'write-path-end-to-end', title: 'Raft write path, end to end', kind: 'workflow', scope: 'end-to-end', format: 'svg',
	file: `${p.visual_assets_dir}/write-path-end-to-end-${p.slug}.svg`, concept_ids: ['log-replication'], source_ids: ['raft-paper'],
	purpose: 'See the whole path of one write before studying each stage.',
	explanation: 'The leader replies only after a majority of servers stores the entry; follower 2 can lag without blocking the write.',
	alt: 'A client sends a write to the leader, the leader replicates it to two followers, one acknowledges, and the leader replies after a majority of three stores it.',
	learning_check: { question: 'Which message lets the leader reply?', answer: 'The first follower acknowledgement, which makes a majority of three.' }, used_in: [pages[1]],
});
tutor('visuals', id, 'add', '--file', path.join(root, 'tmp/diagram.json'));
json('tmp/sim.json', {
	id: 'break-the-cluster-sim', title: 'A five-server cluster you can break', kind: 'simulation', format: 'component', component: 'ClusterSim',
	concept_ids: ['log-replication'], source_ids: ['raft-paper'], purpose: 'Find the failure count at which writes stop committing.',
	explanation: 'Writes commit while three of five servers are up; with two up the write waits and the explanation line says why.',
	alt: 'Five servers on a circle with a client; controls fail servers, send writes and step time; a log explains each outcome.',
	learning_check: { question: 'How many of five servers can fail before writes stop?', answer: 'Two; the third failure leaves no majority.' }, used_in: [pages[2]],
});
tutor('visuals', id, 'add', '--file', path.join(root, 'tmp/sim.json'));
const spec = JSON.parse(fs.readFileSync(path.join(repo, 'harness/examples/videos/raft-write-commit.json'), 'utf8'));
spec.used_in = [pages[1]];
if (!render) spec.narration = { engine: 'none' };
json(`${p.videos_dir}/raft-write-commit/video.json`, spec);
tutor('video', id, 'build', 'raft-write-commit');
if (render) {
	const result = run(process.execPath, [path.join(root, 'harness/bin/tutor.mjs'), 'video', id, 'render', 'raft-write-commit'], { allowFail: true });
	console.log(result.stdout.trim());
	if (result.status !== 0) fail('render failed; run without --render to check the storyboard path');
}

step('lesson gate and vault export');
const gate = tutorJson('validate', id, 'lesson', '--structure-only');
if (!gate.ok) fail(`lesson gate: ${JSON.stringify(gate.failures ?? gate, null, 1)}`);
console.log(`lesson gate ok; warnings: ${(gate.warnings ?? []).map((w) => w.problem).join(' | ') || 'none'}`);
tutor('map', id);
for (const file of [p.visuals_index, `${p.visuals_dir}/visual-write-path-end-to-end-${p.slug}.md`, `${p.visuals_dir}/visual-raft-write-commit-${p.slug}.md`]) {
	if (!fs.existsSync(path.join(root, file))) fail(`missing vault export ${file}`);
}

// The site publishes lesson pages once the lesson stage has started.
tutor('start', id, 'lesson', '--force');

step('build, smoke, interact');
run('npm', ['run', 'build'], { cwd: path.join(root, 'site') });
const smoke = run('npm', ['run', 'smoke'], { cwd: path.join(root, 'site') });
console.log(smoke.stdout.trim().split('\n').at(-1));
const html = fs.readFileSync(path.join(root, 'site/dist', p.site_url.replace(/^\//, ''), 'lesson/02-the-write-path/index.html'), 'utf8');
if (!/class="lc lc-diagram"/.test(html) || !/data-zoom/.test(html)) fail('the write-path page does not render the registered diagram');
if (render ? !/<track kind="captions"/.test(html) : !/lc-video-storyboard/.test(html)) fail('the write-path page does not render the video (or its honest storyboard fallback)');
if (!/class="lc-depth/.test(html) || !/lc-depth-control/.test(html)) fail('Depth block or depth control missing');
const interact = run('npm', ['run', 'interact'], { cwd: path.join(root, 'site') });
console.log(interact.stdout.trim().split('\n').at(-1));

console.log(`\ne2e OK: topic ${id} validated, exported to the vault, built, smoke-tested and driven in a browser${render ? ' with a rendered HyperFrames video' : ' with the storyboard fallback'}.`);
if (keep) console.log(`root: ${root}`);
else fs.rmSync(root, { recursive: true, force: true });
