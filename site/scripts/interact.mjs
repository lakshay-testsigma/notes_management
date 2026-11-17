#!/usr/bin/env node
/**
 * Behaviour, accessibility and responsiveness check of the built site:
 * `npm run build && npm run interact`.
 *
 * `smoke` proves that every page loads and hydrates. This proves that the
 * interactive lesson components *do* something and can be undone: it drives
 * the playground like a learner and fails when
 *
 *   - a control does not change what the learner sees (ClusterSim, AlgorithmStepper,
 *     CompareView, CodePlayground, SortBuckets, Diagram zoom, Depth control),
 *   - Reset does not restore the first state,
 *   - the sandboxed CodePlayground can read the page or reach the network,
 *   - a <video> has no captions track, its MP4 does not load, or its transcript toggle fails,
 *   - a button has no accessible name, or a role="img" element has no label,
 *   - any page scrolls sideways at a 375 px phone width,
 *   - reduced-motion mode produces a console error.
 *
 * It also drives every <Experience> mode (scripts/experience-checks.mjs): on
 * the playground demos by default, or with `--experiences <file.json>` (an
 * array of { key, mode, id, url, spec }) on real lesson pages only.
 *
 * Usage:  node scripts/interact.mjs [--dist <dir>] [--experiences <file.json>]
 * Exit code: 0 all fine · 1 a check failed · 2 could not run (no build or no browser)
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runExperienceChecks } from './experience-checks.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const at = args.indexOf('--dist');
const dist = path.resolve(at === -1 ? path.join(siteDir, 'dist') : args[at + 1]);
const expAt = args.indexOf('--experiences');
const experienceFile = expAt === -1 ? null : path.resolve(args[expAt + 1] ?? '');
if (!fs.existsSync(path.join(dist, experienceFile ? '' : 'playground', 'index.html'))) {
	console.error(`interact: no build at ${dist}; run \`npm run build\` first`);
	process.exit(2);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
	const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
	let file = path.join(dist, url);
	if (!file.startsWith(dist)) return res.writeHead(403).end();
	if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
	if (!fs.existsSync(file)) return res.writeHead(404).end();
	const stat = fs.statSync(file);
	const type = TYPES[path.extname(file)] ?? 'application/octet-stream';
	const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
	if (range) {
		const start = Number(range[1] || 0);
		const end = range[2] ? Number(range[2]) : stat.size - 1;
		res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
		return fs.createReadStream(file, { start, end }).pipe(res);
	}
	res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
	fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.error('interact: playwright is not installed; run `npm install` in site/');
	process.exit(2);
}
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }).catch((error) => {
	console.error(`interact: cannot start Chromium (${error.message.split('\n')[0]}); run \`npx playwright install chromium\``);
	process.exit(2);
});

const problems = [];
const passed = [];
const check = async (name, fn) => {
	try {
		await fn();
		passed.push(name);
	} catch (error) {
		problems.push(`${name}: ${error.message.split('\n')[0]}`);
	}
};
const expect = (condition, message) => {
	if (!condition) throw new Error(message);
};

async function open(page, url) {
	const errors = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto(`${base}${url}`, { waitUntil: 'networkidle' });
	// Scroll so every client:visible island hydrates.
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 500) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 30));
		}
		window.scrollTo(0, 0);
	});
	await page.waitForFunction(() => [...document.querySelectorAll('astro-island')].every((i) => !i.hasAttribute('ssr')), null, { timeout: 15000 });
	return errors;
}

const report = () => {
	for (const name of passed) console.log(`  ok    ${name}`);
	for (const problem of problems) console.log(`  FAIL  ${problem}`);
	console.log(problems.length ? `interact: ${problems.length} problem(s)` : `interact: OK, ${passed.length} checks`);
};

// Real lesson pages only: the experiences the e2e script built.
if (experienceFile) {
	let entries;
	try {
		entries = JSON.parse(fs.readFileSync(experienceFile, 'utf8'));
	} catch (error) {
		console.error(`interact: cannot read ${experienceFile}: ${error.message}`);
		process.exit(2);
	}
	await runExperienceChecks({ browser, base, open, check, expect, entries });
	await browser.close();
	server.close();
	report();
	process.exit(problems.length ? 1 : 0);
}

// ------------------------------------------------------------- behaviour ----

const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = await open(page, '/playground/');
const text = (locator) => locator.innerText();

await check('ClusterSim: a write changes the log and metrics; Reset restores them', async () => {
	const sim = page.locator('.lc-sim').first();
	const before = await text(sim);
	await sim.getByRole('button', { name: /^Send write$/ }).click();
	for (let i = 0; i < 8; i++) await sim.getByRole('button', { name: /^Step$/ }).click().catch(() => {});
	await page.waitForTimeout(200);
	const after = await text(sim);
	expect(after !== before, 'nothing changed after Send write and Step');
	expect(/commit/i.test(after), 'the outcome never mentions a commit');
	await sim.getByRole('button', { name: /^Reset$/ }).click();
	await page.waitForTimeout(200);
	expect((await text(sim)) === before, 'Reset did not restore the first state');
});

await check('ClusterSim: failing a majority blocks the write and explains why', async () => {
	const sim = page.locator('.lc-sim').first();
	const nodes = sim.locator('[role="button"][aria-label*="s"]');
	const count = await nodes.count();
	expect(count >= 5, `expected 5 clickable servers, found ${count}`);
	for (const id of ['s3', 's4', 's5']) await sim.locator(`[role="button"][aria-label*="${id}"]`).first().click();
	await sim.getByRole('button', { name: /^Send write$/ }).click();
	for (let i = 0; i < 10; i++) await sim.getByRole('button', { name: /^Step$/ }).click().catch(() => {});
	expect(/majority/i.test(await text(sim)), 'no explanation mentions the majority');
	await sim.getByRole('button', { name: /^Reset$/ }).click();
});

await check('AlgorithmStepper: Forward changes the caption; Reset returns to step 1', async () => {
	const algo = page.locator('.lc-algo').first();
	const first = await text(algo);
	await algo.getByRole('button', { name: /^Forward$/ }).click();
	expect((await text(algo)) !== first, 'Forward did not change the frame');
	await algo.getByRole('button', { name: /^Reset$/ }).click();
	expect((await text(algo)) === first, 'Reset did not return to the first frame');
});

await check('CompareView: the verdict appears on request and Reset hides it', async () => {
	const cmp = page.locator('.lc-compare').first();
	await cmp.getByRole('button', { name: /Show the trade-off/ }).click();
	expect(/Write-through costs/.test(await text(cmp)), 'verdict not shown');
	await cmp.getByRole('button', { name: /^Reset$/ }).click();
	expect(!/Write-through costs/.test(await text(cmp)), 'verdict still shown after Reset');
});

await check('CodePlayground: runs in a sandbox, reports a mismatch, then a match after the fix', async () => {
	const play = page.locator('.lc-playground').first();
	await play.getByRole('button', { name: /^Run$/ }).click();
	await play.locator('.lc-play-output').getByText('100 200 300 400').waitFor({ timeout: 5000 });
	const editor = play.locator('textarea');
	const code = await editor.inputValue();
	await editor.fill(code.replace('delay = delay + 100', 'delay = delay * 2'));
	await play.getByRole('button', { name: /^Run$/ }).click();
	await play.getByText(/Matches the expected output/).waitFor({ timeout: 5000 });
	await editor.fill('console.log(typeof parent.document);\ntry { await fetch("https://example.com"); console.log("network"); } catch { console.log("no network"); }');
	await play.getByRole('button', { name: /^Run$/ }).click();
	await page.waitForTimeout(1500);
	const out = await text(play.locator('.lc-play-output'));
	expect(!/^object$/m.test(out), 'sandboxed code could read the parent document');
	expect(!/^network$/m.test(out), 'sandboxed code reached the network');
	await play.getByRole('button', { name: /^Reset code$/ }).click();
	expect((await editor.inputValue()) === code, 'Reset code did not restore the starting code');
});

await check('SortBuckets: Check grades placed items; Reset empties the groups', async () => {
	const sort = page.locator('.lc-sortbuckets').first();
	const moves = sort.locator('.lc-sort-moves button');
	expect((await moves.count()) > 0, 'items have no keyboard move buttons');
	await moves.first().click();
	await sort.getByRole('button', { name: /^Check$/ }).click();
	expect(/correct|right|of \d/i.test(await text(sort)), 'Check gave no result');
	await sort.getByRole('button', { name: /^Reset$/ }).click();
});

await check('Diagram: zoom in changes the scale and Reset view restores it', async () => {
	const figure = page.locator('figure.lc-diagram').first();
	const content = figure.locator('[data-zoom-content]');
	await figure.getByRole('button', { name: 'Zoom in' }).click();
	expect(/scale\(1\.25\)/.test((await content.getAttribute('style')) ?? ''), 'zoom did not scale the diagram');
	await figure.getByRole('button', { name: 'Reset view' }).click();
	expect(/scale\(1\)/.test((await content.getAttribute('style')) ?? ''), 'reset did not restore the scale');
	expect(((await figure.locator('.lc-zoom').getAttribute('aria-label')) ?? '').split(' ').length >= 12, 'diagram has no real text alternative');
});

await check('Video: plays from the MP4, has English captions, and the transcript toggles', async () => {
	const figure = page.locator('figure.lc-video').first();
	const video = figure.locator('video');
	expect((await figure.locator('track[kind="captions"]').count()) === 1, 'no captions track');
	const duration = await video.evaluate(async (v) => {
		if (v.readyState < 1) await new Promise((resolve, reject) => { v.addEventListener('loadedmetadata', resolve, { once: true }); v.addEventListener('error', () => reject(new Error('video error')), { once: true }); v.load(); });
		return v.duration;
	});
	expect(duration > 20 && duration < 120, `video duration ${duration}`);
	const cues = await video.evaluate(async (v) => {
		const track = v.textTracks[0];
		track.mode = 'showing';
		for (let i = 0; i < 40 && !(track.cues?.length); i++) await new Promise((r) => setTimeout(r, 50));
		return track.cues?.length ?? 0;
	});
	expect(cues > 3, `captions track has ${cues} cues`);
	expect(!(await video.getAttribute('autoplay') !== null), 'video autoplays');
	const toggle = figure.getByRole('button', { name: /transcript/i });
	await toggle.click();
	expect((await toggle.getAttribute('aria-expanded')) === 'true', 'transcript toggle did not open');
	await toggle.click();
});

await check('Depth control: Essentials hides internals, + Production shows production notes', async () => {
	const control = page.locator('.lc-depth-control');
	await control.getByRole('button', { name: 'Essentials' }).click();
	expect(!(await page.locator('.lc-depth[data-level="internals"]').first().isVisible()), 'internals still visible on Essentials');
	await control.getByRole('button', { name: '+ Production' }).click();
	expect(await page.locator('.lc-depth[data-level="production"]').first().isVisible(), 'production notes hidden on + Production');
	await control.getByRole('button', { name: '+ Internals' }).click();
});

await check('Accessibility: every button has a name and every role="img" has a label', async () => {
	const unnamed = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => !(b.getAttribute('aria-label') || b.textContent?.trim())).length);
	expect(unnamed === 0, `${unnamed} buttons without an accessible name`);
	const unlabeled = await page.evaluate(() => [...document.querySelectorAll('[role="img"]')].filter((e) => !(e.getAttribute('aria-label') || e.getAttribute('aria-labelledby'))).length);
	expect(unlabeled === 0, `${unlabeled} role="img" elements without a label`);
});

await check('No console errors while interacting', async () => {
	expect(errors.length === 0, errors.slice(0, 3).join(' | '));
});
await context.close();

// ----------------------------------------------------------- experiences ----

const demoDir = path.join(siteDir, 'src/data/demo/experiences');
const demoEntries = fs.existsSync(demoDir)
	? fs.readdirSync(demoDir).filter((f) => f.endsWith('.json')).map((f) => {
			const { config } = JSON.parse(fs.readFileSync(path.join(demoDir, f), 'utf8'));
			return { key: f.replace(/\.json$/, ''), mode: config.mode, url: '/playground/', spec: config };
		})
	: [];
await runExperienceChecks({ browser, base, open, check, expect, entries: demoEntries });

// --------------------------------------------------------- responsiveness ----

const pages = [];
const walk = (dir, prefix = '/') => {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory() && !['_astro', 'media'].includes(entry.name)) walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
		else if (entry.name === 'index.html') pages.push(prefix);
	}
};
walk(dist);
const phone = await browser.newContext({ viewport: { width: 375, height: 800 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
for (const url of pages) {
	await check(`375 px + reduced motion: ${url} has no sideways scroll and no errors`, async () => {
		const p = await phone.newPage();
		const pageErrors = await open(p, url);
		const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		expect(overflow <= 1, `page is ${overflow}px wider than the screen`);
		expect(pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
		await p.close();
	});
}
await phone.close();
await browser.close();
server.close();

report();
process.exit(problems.length ? 1 : 0);
