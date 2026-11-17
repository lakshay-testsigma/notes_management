#!/usr/bin/env node
/**
 * Regenerate the playground demos of <Experience>: one per mode, from the
 * examples in harness/examples/experiences (HTTP request lifecycle → explainer,
 * binary search → interactive lesson, distributed consensus → hybrid lab,
 * marketing funnel strategy → branching deck).
 *
 *   node scripts/demo-experiences.mjs
 *
 * It builds the four topics through the tutor CLI in a temporary root (the
 * same fixtures as harness/tests/experiences.test.mjs), then copies:
 *  - each experience.built.json to src/data/demo/experiences/<key>.json, with
 *    its media URLs moved to /media/_demo/, plus the fallback diagram source;
 *  - each published composition to public/media/_demo/<part>/composition/;
 *  - the pinned runtime files to public/media/_hf/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(site, '..');
const { buildCase, CASES, fixtureRoot } = await import(path.join(repo, 'harness/tests/support/experience-fixtures.mjs'));

const root = fixtureRoot();
// The fixtures write placeholder fonts; demos inline the real site fonts.
for (const font of ['atkinson-regular.woff', 'atkinson-bold.woff']) fs.copyFileSync(path.join(site, 'src/assets/fonts', font), path.join(root, 'site/src/assets/fonts', font));
const outData = path.join(site, 'src/data/demo/experiences');
const outMedia = path.join(site, 'public/media/_demo');
fs.mkdirSync(outData, { recursive: true });

function tutor(args) {
	const r = spawnSync(process.execPath, [path.join(repo, 'harness/bin/tutor.mjs'), ...args, '--json'], { encoding: 'utf8', env: { ...process.env, TUTOR_ROOT: root } });
	if (r.status !== 0) throw new Error(`tutor ${args.join(' ')} failed:\n${r.stdout}\n${r.stderr}`);
	return JSON.parse(r.stdout);
}

try {
	for (const c of CASES) {
		const { id, p, spec } = buildCase(root, c);
		tutor(['experience', id, 'build', spec.id, '--skip-lint']);
		const built = JSON.parse(fs.readFileSync(path.join(root, p.experiences_dir, spec.id, 'experience.built.json'), 'utf8'));
		const mediaPrefix = `/media/${id}/`;
		const moved = JSON.parse(JSON.stringify(built).split(mediaPrefix).join('/media/_demo/'));
		// Fixture sources are placeholders (example.com); the demo shows none.
		moved.sources = [];
		// Every published composition this experience uses.
		for (const part of [built.watch, built.guided, built.summary_video, built.deck ? { video_id: built.deck.deck_id } : null].filter(Boolean)) {
			const from = path.join(root, 'site/public/media', id, part.video_id, 'composition');
			if (!fs.existsSync(from)) continue;
			const to = path.join(outMedia, part.video_id, 'composition');
			fs.rmSync(to, { recursive: true, force: true });
			fs.cpSync(from, to, { recursive: true });
			const index = path.join(to, 'index.html');
			fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace(/(\.\.\/)+_hf\//g, '../../../_hf/'));
		}
		const visuals = JSON.parse(fs.readFileSync(path.join(root, 'state/topics', id, 'visuals.json'), 'utf8'));
		const fallback = visuals.find((v) => v.id === built.fallback_visual) ?? null;
		const fallbackSource = fallback?.file ? fs.readFileSync(path.join(root, fallback.file), 'utf8') : null;
		fs.writeFileSync(path.join(outData, `${c.key}.json`), `${JSON.stringify({ config: moved, fallback, fallbackSource }, null, 2)}\n`);
		console.log(`${c.key}: ${built.mode}, tabs ${built.tabs.join(' ')}`);
	}
	const vendorFrom = path.join(root, 'site/public/media/_hf');
	const vendorTo = path.join(site, 'public/media/_hf');
	fs.mkdirSync(vendorTo, { recursive: true });
	for (const f of fs.readdirSync(vendorFrom)) fs.copyFileSync(path.join(vendorFrom, f), path.join(vendorTo, f));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
