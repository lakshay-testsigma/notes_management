import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

// Render the production React component in a real browser without rebuilding the
// Astro site or changing a preview that another reviewer may still be using.
const entry = '/__match-pairs-test.tsx';
let server;
let browser;
let origin;
before(async () => {
	server = await createServer({
		root: fileURLToPath(new URL('..', import.meta.url)),
		configFile: false,
		logLevel: 'error',
		server: { host: '127.0.0.1', port: 0 },
		optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime'] },
		plugins: [{
			name: 'match-pairs-test-fixture',
			resolveId(id) { if (id === entry) return id; },
			load(id) {
				if (id !== entry) return;
				return `
					import React from 'react';
					import { createRoot } from 'react-dom/client';
					import MatchPairs from '/src/components/learn/react/MatchPairs.tsx';
					const root = createRoot(document.getElementById('root'));
					window.mountPairs = pairs => root.render(<MatchPairs pairs={pairs} />);
				`;
			},
			configureServer(vite) {
				vite.middlewares.use((req, res, next) => {
					if (req.url !== '/__match-pairs-test') return next();
					res.setHeader('Content-Type', 'text/html');
					res.end(`<div id="root"></div><script type="module" src="${entry}"></script>`);
				});
			},
		}],
	});
	await server.listen();
	origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	browser = await chromium.launch({ headless: true });
});
after(async () => {
	await browser?.close();
	await server?.close();
});

async function mount(pairs) {
	const page = await browser.newPage();
	page.setDefaultTimeout(5000);
	page.on('pageerror', error => console.error(error.message));
	await page.goto(`${origin}/__match-pairs-test`);
	await page.waitForFunction(() => typeof window.mountPairs === 'function');
	await page.evaluate(pairs => window.mountPairs(pairs), pairs);
	const activity = page.locator('.lc-matchpairs');
	await activity.waitFor();
	return { page, activity, terms: activity.getByRole('group', { name: 'Terms' }).getByRole('button') };
}

for (const count of [3, 5]) {
	test(`${count} pairs: explicit term clicks retain initial/automatic selection and complete the activity`, async () => {
		const pairs = Array.from({ length: count }, (_, i) => ({ term: `Term ${i}`, definition: `Meaning ${i}` }));
		const { page, activity, terms } = await mount(pairs);
		try {
			assert.equal(await terms.first().getAttribute('aria-pressed'), 'true');
			for (let i = 0; i < count; i++) {
				await terms.nth(i).click();
				assert.equal(await terms.nth(i).getAttribute('aria-pressed'), 'true');
				const meaning = activity.getByRole('button', { name: pairs[i].definition, exact: true });
				await meaning.click();
				assert.equal(await activity.getByRole('button', { name: `${pairs[i].definition}. Matched with ${pairs[i].term}`, exact: true }).count(), 1);
			}
			assert.equal(await activity.getByRole('button', { name: 'Clear', exact: true }).isEnabled(), true);
			await activity.getByRole('button', { name: 'Check matches', exact: true }).click();
			assert.match(await activity.locator('.lc-feedback').innerText(), /All matched\./);
			await activity.getByRole('button', { name: 'Clear', exact: true }).click();
			assert.equal(await activity.getByRole('button', { name: 'Check matches', exact: true }).isEnabled(), false);
			assert.equal(await activity.getByRole('button', { name: 'Clear', exact: true }).isEnabled(), false);
			// Clear restores the initial selection; clicking it twice must still
			// select A and allow its definition to be assigned.
			await terms.first().click();
			await terms.first().click();
			await activity.getByRole('button', { name: pairs[0].definition, exact: true }).click();
			assert.equal(await activity.getByRole('button', { name: 'Clear', exact: true }).isEnabled(), true);
		} finally { await page.close(); }
	});
}

test('automatic advancement, wrong answers, and reassignment keep one owner per meaning', async () => {
	const pairs = [0, 1, 2].map(i => ({ term: `Term ${i}`, definition: `Meaning ${i}` }));
	const { page, activity, terms } = await mount(pairs);
	try {
		// Initial/automatic selection also supports clicking meanings directly.
		for (const i of [1, 0, 2]) await activity.getByRole('button', { name: pairs[i].definition, exact: true }).click();
		await activity.getByRole('button', { name: 'Check matches', exact: true }).click();
		assert.match(await activity.locator('.lc-feedback').innerText(), /1 of 3 pairs are right/);
		await terms.first().click();
		await activity.getByRole('button', { name: /^Meaning 0/ }).click();
		assert.equal(await activity.getByRole('button', { name: 'Check matches', exact: true }).isEnabled(), false);
		assert.equal(await activity.getByRole('button', { name: 'Meaning 0. Matched with Term 0', exact: true }).count(), 1);
		await terms.nth(1).click();
		await activity.getByRole('button', { name: 'Meaning 1', exact: true }).click();
		await activity.getByRole('button', { name: 'Check matches', exact: true }).click();
		assert.match(await activity.locator('.lc-feedback').innerText(), /All matched\./);
	} finally { await page.close(); }
});
