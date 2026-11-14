#!/usr/bin/env node
/**
 * Runtime smoke test of the built site: `npm run build && npm run smoke`.
 *
 * `astro build` proves that every page compiles. This proves that every page
 * also works in a browser. It serves dist/ on a free local port, opens every
 * generated page (each index.html under dist/) in headless Chromium, scrolls
 * each interactive island into view so it hydrates, and fails when a page has
 *
 *   - a console error or an uncaught error,
 *   - a hydration mismatch (server HTML that differs from the browser render),
 *   - an island that never hydrated,
 *   - a request for a local asset that failed or returned 4xx / 5xx,
 *   - a link to a local page that does not exist,
 *   - a mermaid diagram that could not be drawn,
 *   - a 3D view that stayed blank although WebGL is available.
 *
 * Usage:  node scripts/smoke.mjs [filter] [--dist <dir>] [--jobs <n>]
 *   filter   only pages whose URL contains this text, e.g. `lesson/` or a topic slug
 *   --dist   folder to serve (default: dist/ next to this script's parent)
 *   --jobs   pages opened at the same time (default 4)
 *
 * Exit code: 0 all pages fine · 1 at least one problem (listed as page + message)
 *            2 the test could not run (no build, or the browser is not installed)
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
	const at = args.indexOf(name);
	if (at === -1) return fallback;
	const [, value] = args.splice(at, 2);
	return value ?? fallback;
};
const dist = path.resolve(option('--dist', path.join(siteDir, 'dist')));
const jobs = Math.max(1, Number(option('--jobs', 4)) || 4);
const filter = args.find((arg) => !arg.startsWith('--')) ?? '';

/** The whole run must stay well under two minutes; each wait inside a page is shorter. */
const RUN_LIMIT_MS = 100_000;
const WAIT_MS = 8_000;

function stop(code, message) {
	console.error(message);
	process.exit(code);
}

// ---------------------------------------------------------------- pages ----

function findPages(dir, prefix = '/') {
	const pages = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) pages.push(...findPages(path.join(dir, entry.name), `${prefix}${entry.name}/`));
		else if (entry.name === 'index.html') pages.push(prefix);
	}
	return pages.sort();
}

if (!fs.existsSync(path.join(dist, 'index.html'))) {
	stop(2, `smoke: no built site at ${dist}. Run \`npm run build\` first.`);
}
const pages = findPages(dist).filter((url) => url.includes(filter));
if (pages.length === 0) stop(2, `smoke: no page of ${dist} matches "${filter}".`);

/** File that a local URL path is served from, or null when there is none. */
function resolveFile(urlPath) {
	let decoded;
	try {
		decoded = decodeURIComponent(urlPath);
	} catch {
		return null;
	}
	const file = path.join(dist, decoded);
	if (file !== dist && !file.startsWith(dist + path.sep)) return null;
	if (!fs.existsSync(file)) return null;
	if (!fs.statSync(file).isDirectory()) return file;
	const index = path.join(file, 'index.html');
	return fs.existsSync(index) ? index : null;
}

// --------------------------------------------------------------- server ----

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml',
	'.wasm': 'application/wasm',
	'.map': 'application/json',
};

const server = http.createServer((request, response) => {
	const file = resolveFile(new URL(request.url ?? '/', 'http://localhost').pathname);
	if (!file) {
		response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		response.end('Not found');
		return;
	}
	response.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
	fs.createReadStream(file).pipe(response);
});

// -------------------------------------------------------------- browser ----

async function openBrowser() {
	let chromium;
	try {
		({ chromium } = await import('playwright'));
	} catch {
		stop(2, 'smoke: the `playwright` package is not installed. Run `npm install` in site/ and try again.');
	}
	try {
		// The flags let headless Chromium draw WebGL in software, so 3D views can be checked without a GPU.
		return await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
	} catch (error) {
		const text = String(error?.message ?? error);
		if (/Executable doesn't exist|playwright install|browserType\.launch: Failed to find/i.test(text)) {
			stop(
				2,
				[
					'smoke: the Chromium browser that Playwright drives is not downloaded yet.',
					'Run this once in site/, then run the smoke test again:',
					'',
					'    npx playwright install chromium',
					'',
				].join('\n'),
			);
		}
		throw error;
	}
}

/**
 * Runs inside the page. Scrolls every island, 3D view and mermaid diagram into
 * view, waits for each to finish, and reports what did not.
 */
async function inspectPage({ waitMs, webgl }) {
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const until = async (test, limit = waitMs) => {
		const end = performance.now() + limit;
		while (performance.now() < end) {
			if (test()) return true;
			await sleep(40);
		}
		return test();
	};
	const show = (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' });
	const problems = [];
	const counts = { islands: 0, views3d: 0, diagrams: 0 };

	// Islands: Astro removes the `ssr` attribute once an island has hydrated.
	for (const island of document.querySelectorAll('astro-island')) {
		const name = (island.getAttribute('component-url') ?? 'island').split('/').pop().replace(/\.[\w-]+\.js$/, '');
		show(island.firstElementChild ?? island);
		if (await until(() => !island.hasAttribute('ssr'))) counts.islands++;
		else problems.push(`island did not hydrate within ${waitMs / 1000}s: ${name}`);
	}

	// 3D views: the host leaves `is-loading` for `is-webgl` (drawn by three.js) or `is-fallback` (flat picture).
	const drawnPixels = (canvas) =>
		new Promise((resolve) => {
			const probe = document.createElement('canvas');
			probe.width = 200;
			probe.height = 125;
			const context = probe.getContext('2d', { willReadFrequently: true });
			let frames = 0;
			// Read the WebGL canvas inside a frame, right after the scene's own loop has drawn it.
			const tick = () => {
				context.clearRect(0, 0, probe.width, probe.height);
				context.drawImage(canvas, 0, 0, probe.width, probe.height);
				const data = context.getImageData(0, 0, probe.width, probe.height).data;
				let painted = 0;
				for (let i = 3; i < data.length; i += 4) if (data[i] > 16) painted++;
				if (painted >= 20 || ++frames > 150) resolve(painted);
				else requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		});
	for (const host of document.querySelectorAll('.lc-3d')) {
		const name = host.closest('.lc')?.querySelector('.lc-title')?.textContent?.trim() || '3D view';
		show(host);
		if (!(await until(() => !host.classList.contains('is-loading')))) {
			problems.push(`3D view never finished loading: ${name}`);
			continue;
		}
		if (!webgl) continue;
		const canvas = host.querySelector('canvas.lc-3d-canvas');
		if (!host.classList.contains('is-webgl') || !canvas) {
			problems.push(`3D view fell back to the flat picture although WebGL is available: ${name}`);
			continue;
		}
		const painted = await drawnPixels(canvas);
		if (painted >= 20) counts.views3d++;
		else problems.push(`3D canvas stayed blank: ${name}`);
		// Labels are added by the component a moment after the first frame.
		if (!(await until(() => host.querySelector('.lc-3d-label:not(.is-crowded)') !== null, 3000))) problems.push(`3D view shows no labels: ${name}`);
	}

	// Mermaid diagrams (fences in notes and <Mermaid />) get `is-drawn` when the SVG is in place.
	for (const diagram of document.querySelectorAll('.mermaid-diagram')) {
		show(diagram);
		if (await until(() => diagram.classList.contains('is-drawn'))) counts.diagrams++;
		else problems.push(`mermaid diagram could not be drawn: ${(diagram.dataset.mermaidSrc ?? '').trim().split('\n')[0].slice(0, 60)}`);
	}

	window.scrollTo(0, 0);
	await sleep(60);
	const links = [...new Set([...document.querySelectorAll('a[href]')].map((a) => new URL(a.getAttribute('href'), location.href)).filter((u) => u.origin === location.origin).map((u) => u.pathname))];
	return { problems, counts, links, errors: window.__smokeErrors ?? [] };
}

/** A fresh browser profile per page: nothing one page stores (theme, last page read) reaches another. */
async function openPage(browser) {
	const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
	// Errors that never reach the console (reportError, rejected promises) are collected in the page.
	await context.addInitScript(() => {
		window.__smokeErrors = [];
		window.addEventListener('error', (event) => window.__smokeErrors.push(String(event.error?.message ?? event.message ?? 'error')));
		window.addEventListener('unhandledrejection', (event) => window.__smokeErrors.push(`unhandled rejection: ${String(event.reason?.message ?? event.reason)}`));
	});
	return { context, page: await context.newPage() };
}

async function checkPage(browser, origin, url, webgl) {
	const { context, page } = await openPage(browser);
	const problems = [];
	const add = (text) => {
		const line = String(text).replace(/\s+/g, ' ').trim().slice(0, 400);
		if (line && !problems.includes(line)) problems.push(line);
	};
	const local = (address) => address.startsWith(origin);
	const where = (address) => address.slice(origin.length) || '/';
	const hydration = /hydrat|did not match|Minified React error #(418|419|421|422|423|425)\b/i;

	page.on('console', (message) => {
		const text = message.text();
		const kind = message.type();
		// Failed requests are reported once, by the request handlers below (local assets only).
		if (/^Failed to load resource/i.test(text)) return;
		if (hydration.test(text) && (kind === 'error' || kind === 'warning')) add(`hydration mismatch: ${text}`);
		else if (kind === 'error') add(`console error: ${text}`);
	});
	page.on('pageerror', (error) => add(`${hydration.test(error.message) ? 'hydration mismatch' : 'uncaught error'}: ${error.message}`));
	page.on('requestfailed', (request) => {
		if (local(request.url())) add(`request failed: ${where(request.url())} (${request.failure()?.errorText ?? 'unknown error'})`);
	});
	page.on('response', (response) => {
		if (local(response.url()) && response.status() >= 400) add(`request failed: ${where(response.url())} (HTTP ${response.status()})`);
	});

	let counts = { islands: 0, views3d: 0, diagrams: 0 };
	let links = [];
	try {
		await page.goto(origin + url, { waitUntil: 'load', timeout: 20_000 });
		const result = await page.evaluate(inspectPage, { waitMs: WAIT_MS, webgl });
		result.problems.forEach(add);
		for (const text of result.errors) {
			// Most of these were already reported through `pageerror`.
			const message = text.replace(/^unhandled rejection: /, '').replace(/\s+/g, ' ').trim().slice(0, 200);
			if (!problems.some((problem) => problem.includes(message))) add(`${hydration.test(text) ? 'hydration mismatch' : 'uncaught error'}: ${text}`);
		}
		counts = result.counts;
		links = result.links;
		for (const link of links) if (!resolveFile(link)) add(`dead link: ${link}`);
	} catch (error) {
		add(`page could not be checked: ${String(error?.message ?? error).split('\n')[0]}`);
	}
	page.removeAllListeners();
	await context.close().catch(() => {});
	return { url, problems, counts, links: links.length };
}

// ------------------------------------------------------------------ run ----

const started = Date.now();
let browser = null;
let code = 0;
const timer = setTimeout(() => {
	console.error(`smoke: gave up after ${RUN_LIMIT_MS / 1000}s. A page is hanging; run it alone with \`npm run smoke -- <part of its URL>\`.`);
	shutdown().finally(() => process.exit(1));
}, RUN_LIMIT_MS);

async function shutdown() {
	clearTimeout(timer);
	await browser?.close().catch(() => {});
	server.closeAllConnections?.();
	await new Promise((resolve) => server.close(resolve));
}

try {
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	const origin = `http://127.0.0.1:${server.address().port}`;
	browser = await openBrowser();
	const probe = await openPage(browser);
	await probe.page.goto(origin + pages[0], { waitUntil: 'domcontentloaded' });
	const webgl = await probe.page.evaluate(() => {
		try {
			const canvas = document.createElement('canvas');
			return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
		} catch {
			return false;
		}
	});
	await probe.context.close();

	const queue = [...pages];
	const results = [];
	await Promise.all(
		Array.from({ length: Math.min(jobs, queue.length) }, async () => {
			for (let url = queue.shift(); url !== undefined; url = queue.shift()) results.push(await checkPage(browser, origin, url, webgl));
		}),
	);
	results.sort((a, b) => a.url.localeCompare(b.url));

	const seconds = ((Date.now() - started) / 1000).toFixed(1);
	const sum = (pick) => results.reduce((total, result) => total + pick(result), 0);
	const failed = results.filter((result) => result.problems.length > 0);
	const views = webgl ? `${sum((r) => r.counts.views3d)} 3D views drawn` : 'WebGL is not available in this browser, so 3D canvases were not checked';
	if (failed.length > 0) {
		code = 1;
		console.error(`smoke: FAILED, ${sum((r) => r.problems.length)} problem(s) on ${failed.length} of ${results.length} pages (${seconds}s)\n`);
		for (const result of failed) {
			console.error(result.url);
			for (const problem of result.problems) console.error(`  - ${problem}`);
		}
	} else {
		console.log(
			`smoke: OK, ${results.length} pages, ${sum((r) => r.counts.islands)} islands hydrated, ${views}, ${sum((r) => r.counts.diagrams)} diagrams drawn, ${sum((r) => r.links)} local links resolved, ${seconds}s`,
		);
	}
} catch (error) {
	code = 1;
	console.error(`smoke: crashed: ${error?.stack ?? error}`);
} finally {
	await shutdown();
}
process.exit(code);
