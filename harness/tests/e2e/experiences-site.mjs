#!/usr/bin/env node
/**
 * End-to-end check of adaptive experiences on a real build of the site.
 *
 *   node harness/tests/e2e/experiences-site.mjs [--render] [--keep]
 *
 * In a temporary copy of the repository (harness + site, site/node_modules
 * linked; never the learner's state, vault or projects) it builds the four
 * representative topics from harness/examples/experiences:
 *
 *   HTTP request lifecycle     → explainer    (Mode A)
 *   Binary search              → interactive  (Mode B)
 *   Distributed consensus      → hybrid       (Mode D)
 *   Marketing funnel strategy  → branching    (Mode C)
 *
 * For each: the intake gate (selector, budget), `tutor experience build` with
 * the real `hyperframes lint`, `tutor deck check` with the real `hyperframes
 * check`, the lesson gate, the vault export; then the site build, `smoke`, and
 * a browser run that uses every tab of every experience on its lesson page.
 * `--render` also renders the explainer MP4 (FFmpeg or Docker).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildCase, CASES } from '../support/experience-fixtures.mjs';
import { tutorJson } from '../support/helpers.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const render = process.argv.includes('--render');
const keep = process.argv.includes('--keep');
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'tutor-e2e-exp-')));
const step = (name) => console.log(`\n== ${name}`);
const fail = (message) => {
	console.error(`e2e FAILED: ${message}\n(root kept at ${root})`);
	process.exit(1);
};
function run(command, args, { cwd = root, allowFail = false } = {}) {
	const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, TUTOR_ROOT: root, TUTOR_REPO_ROOT: root }, maxBuffer: 64 * 1024 * 1024 });
	if (result.status !== 0 && !allowFail) fail(`${command} ${args.join(' ')}\n${(result.stdout ?? '').slice(-2500)}\n${(result.stderr ?? '').slice(-2500)}`);
	return result;
}

// Real domain packs, so the site lists the topics under real domains.
const TOPICS = {
	'http-request-lifecycle': { domain: 'system-design', subdomain: 'networking' },
	'binary-search': { domain: 'general', subdomain: 'mathematics' },
	'distributed-consensus': { domain: 'system-design', subdomain: 'consistency-consensus' },
	'marketing-funnel-strategy': { domain: 'general', subdomain: 'marketing-growth' },
};

step('copy harness and site');
fs.cpSync(path.join(repo, 'harness'), path.join(root, 'harness'), { recursive: true });
fs.cpSync(path.join(repo, 'site'), path.join(root, 'site'), {
	recursive: true,
	filter: (src) => !/[/\\](node_modules|dist|\.astro)([/\\]|$)/.test(src.slice(repo.length))
		&& !src.includes(`${path.sep}content${path.sep}lessons${path.sep}`)
		&& !/[/\\]public[/\\]media[/\\](?!_demo|_hf)/.test(src.slice(repo.length)),
});
fs.symlinkSync(path.join(repo, 'site', 'node_modules'), path.join(root, 'site', 'node_modules'), 'dir');
for (const dir of ['state/topics', 'vault', 'projects']) fs.mkdirSync(path.join(root, dir), { recursive: true });
fs.writeFileSync(path.join(root, 'state/registry.json'), JSON.stringify({ schema: 1, topics: [] }));

const built = [];
for (const c of CASES) {
	const where = TOPICS[c.key];
	step(`${c.key}: plan, build, gate (${c.expected})`);
	const { id, p, spec, planned } = buildCase(root, { ...c, ...where });
	if (!planned.data.intake_gate?.ok) fail(`intake gate: ${JSON.stringify(planned.data.intake_gate)}`);
	const plan = tutorJson(root, ['experience', id, 'plan']);
	const mode = plan.data.pages.find((x) => x.order === 2)?.mode;
	if (mode !== c.expected) fail(`selector chose ${mode}, expected ${c.expected}`);
	const result = tutorJson(root, ['experience', id, 'build', spec.id]);
	if (result.code !== 0) fail(`experience build (with hyperframes lint): ${JSON.stringify(result.data)}`);
	console.log(`built ${spec.id}: ${result.data.mode}, tabs ${result.data.tabs.join(', ')}${result.data.warnings?.length ? `; warnings: ${result.data.warnings.join(' | ')}` : ''}`);
	if (spec.deck) {
		const check = tutorJson(root, ['deck', id, 'check', spec.deck]);
		if (check.code !== 0 || check.data.skipped) fail(`deck check: ${JSON.stringify(check.data)}`);
		console.log(`deck ${spec.deck}: hyperframes check passes (${check.data.errors} errors)`);
	}
	if (render && spec.watch) {
		const r = run(process.execPath, [path.join(root, 'harness/bin/tutor.mjs'), 'video', id, 'render', spec.watch.video], { allowFail: true });
		console.log(r.stdout.trim().split('\n')[0]);
		if (r.status !== 0) fail('render failed; run without --render to check the composition path');
		tutorJson(root, ['experience', id, 'build', spec.id]);
	}
	const gate = tutorJson(root, ['validate', id, 'lesson', '--structure-only']);
	if (gate.code !== 0) fail(`lesson gate: ${JSON.stringify(gate.data.failures, null, 1)}`);
	tutorJson(root, ['map', id]);
	if (!fs.existsSync(path.join(root, `${p.visuals_dir}/visual-${spec.id}-${p.slug}.md`))) fail('experience vault note missing');
	tutorJson(root, ['start', id, 'lesson', '--force']);
	built.push({ key: c.key, mode: c.expected, id, url: `${p.site_url}lesson/02-the-mechanism/`, spec });
}

step('site build and smoke');
run('npm', ['run', 'build'], { cwd: path.join(root, 'site') });
const smoke = run('npm', ['run', 'smoke'], { cwd: path.join(root, 'site') });
console.log(smoke.stdout.trim().split('\n').at(-1));

step('drive every experience in a browser');
fs.writeFileSync(path.join(root, 'tmp-experiences.json'), JSON.stringify(built));
const drive = run(process.execPath, [path.join(root, 'site/scripts/interact.mjs'), '--experiences', path.join(root, 'tmp-experiences.json')], { cwd: path.join(root, 'site'), allowFail: true });
console.log(drive.stdout.trim().split('\n').slice(-12).join('\n'));
if (drive.status !== 0) fail(`browser checks failed:\n${drive.stderr.slice(-2500)}`);

console.log(`\ne2e OK: four experiences (${built.map((b) => `${b.key} → ${b.mode}`).join(', ')}) selected, built, linted, checked, gated, exported, built into the site and driven in a browser${render ? ', with a rendered explainer MP4' : ''}.`);
if (keep) console.log(`root: ${root}`);
else fs.rmSync(root, { recursive: true, force: true });
