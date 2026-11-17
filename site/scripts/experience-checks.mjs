/**
 * Browser checks of <Experience>, shared by the playground run of
 * `interact.mjs` and its `--experiences <file.json>` mode (real lesson pages
 * built by harness/tests/e2e/experiences-site.mjs).
 *
 * Each entry: { key, mode, url, spec } where `spec` has the fields of
 * experience.json (or of experience.built.json): id, mode, watch, guided,
 * simulation, deck, summary_video, checkpoints.
 */
import fs from 'node:fs';

/** The tabs a spec must produce (same rule as the harness's experienceTabs). */
export function expectedTabs(spec) {
	const tabs = [];
	if (spec.watch || (spec.mode === 'hybrid' && spec.summary_video)) tabs.push('watch');
	if (spec.simulation) tabs.push('explore');
	if (spec.guided) tabs.push('guided');
	if (spec.deck) tabs.push('deepdive');
	tabs.push('practice');
	return tabs;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, { timeout = 15000, every = 150 } = {}) {
	const end = Date.now() + timeout;
	let last;
	while (Date.now() < end) {
		last = await fn();
		if (last) return last;
		await sleep(every);
	}
	return last;
}

export async function runExperienceChecks({ browser, base, open, check, expect, entries }) {
	for (const entry of entries) {
		const { spec, url } = entry;
		const label = `Experience ${entry.key} (${spec.mode})`;
		const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
		const page = await context.newPage();
		const errors = await open(page, url);
		const fig = page.locator(`[data-experience="${spec.id}"]`).first();
		const tab = async (name) => {
			await fig.locator(`[role="tab"][data-tab="${name}"]`).click();
			await page.waitForTimeout(150);
		};
		const panel = () => fig.locator('[role="tabpanel"]');
		const playerState = (scope) => scope.locator('hyperframes-player').first().evaluate((el) => ({ ready: Boolean(el.ready), duration: el.duration ?? 0, t: el.currentTime ?? 0, paused: el.paused }));
		const waitReady = async (scope) => {
			await scope.locator('hyperframes-player').first().waitFor({ state: 'attached', timeout: 15000 });
			return waitFor(async () => {
				const s = await playerState(scope).catch(() => null);
				return s && s.ready && s.duration > 0 ? s : null;
			});
		};
		const wrongChoice = (cp) => cp.choices?.find((c) => !c.correct);

		await check(`${label}: tabs are ${expectedTabs(spec).join(', ')}`, async () => {
			await fig.waitFor({ timeout: 15000 });
			const tabs = await fig.locator('[role="tab"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-tab')));
			expect(JSON.stringify(tabs) === JSON.stringify(expectedTabs(spec)), `tabs are ${tabs.join(', ')}`);
		});

		const answered = [];
		if (spec.watch) {
			await check(`${label}: Watch plays the explainer, toggles its transcript, and asks its question`, async () => {
				await tab('watch');
				const p = panel();
				if (await p.locator('video').count()) {
					expect((await p.locator('video track[kind="captions"]').count()) > 0, 'the MP4 has no captions track');
				} else {
					const s = await waitReady(p);
					expect(s && s.ready, 'the composition player never became ready');
				}
				const toggle = p.getByRole('button', { name: /Show transcript/ }).first();
				expect(await toggle.count(), 'no transcript toggle');
				await toggle.click();
				expect((await p.locator('.lc-video-transcript:not([hidden])').count()) > 0, 'the transcript did not open');
				const cp = spec.checkpoints?.find((c) => c.at?.after === 'watch');
				if (cp) {
					await p.getByRole('button', { name: /Answer the question about this video/ }).click();
					const card = p.locator(`[data-checkpoint="${cp.id}"]`);
					await card.waitFor({ timeout: 5000 });
					const wrong = wrongChoice(cp);
					if (wrong) {
						await card.getByRole('button', { name: wrong.text, exact: true }).click();
						expect((await card.locator('.lc-exp-wrong').innerText()).includes(wrong.misconception), 'the misconception is not shown');
						answered.push(cp.id);
					} else {
						await card.locator('button').first().click();
						answered.push(cp.id);
					}
				}
			});
		}

		if (spec.guided) {
			await check(`${label}: Guided player is ready, Next step moves the time, a checkpoint pauses it`, async () => {
				await tab('guided');
				const p = panel();
				const s0 = await waitReady(p);
				expect(s0 && s0.ready, 'the guided player never became ready');
				const next = p.getByRole('button', { name: 'Next step' });
				await next.click();
				const moved = await waitFor(async () => {
					const s = await playerState(p);
					return s.t > s0.t + 0.5 ? s : null;
				}, { timeout: 6000 });
				expect(moved, 'Next step did not move currentTime');
				const cps = (spec.checkpoints ?? []).filter((c) => c.at?.scene);
				const predict = cps.find((c) => c.choices);
				if (predict) {
					let card = null;
					for (let i = 0; i < 12 && !card; i++) {
						if (await p.locator(`[data-checkpoint="${predict.id}"]`).count()) card = p.locator(`[data-checkpoint="${predict.id}"]`);
						else if (await p.locator('.lc-exp-card').count()) {
							await p.getByRole('button', { name: 'Continue' }).first().click();
							await page.waitForTimeout(200);
						} else {
							await next.click();
							await page.waitForTimeout(300);
						}
					}
					expect(card, `the checkpoint "${predict.id}" never opened`);
					const paused = await playerState(p);
					expect(paused.paused, 'the walkthrough did not pause at the checkpoint');
					const wrong = wrongChoice(predict);
					await card.getByRole('button', { name: wrong.text, exact: true }).click();
					expect((await card.locator('.lc-exp-wrong').innerText()).includes(wrong.misconception), 'the misconception is not shown');
					answered.push(predict.id);
					await card.getByRole('button', { name: 'Continue' }).click();
				}
			});
		}

		const experiment = (spec.checkpoints ?? []).find((c) => c.kind === 'experiment');
		if (spec.simulation && experiment) {
			await check(`${label}: the ${spec.simulation.component} experiment completes when its goal is met`, async () => {
				await tab('explore');
				const p = panel();
				const card = p.locator(`[data-checkpoint="${experiment.id}"]`);
				await card.waitFor({ timeout: 5000 });
				if (experiment.goal?.preset) await card.getByRole('button', { name: 'Load the starting state' }).click();
				await page.waitForTimeout(200);
				if (spec.simulation.component === 'ClusterSim') {
					const sim = p.locator('.lc-sim').first();
					for (const id of ['s3', 's4', 's5']) await sim.locator(`[role="button"][aria-label^="${id},"]`).first().click();
					await sim.getByRole('button', { name: /^Send write$/ }).click();
					for (let i = 0; i < 4; i++) await sim.getByRole('button', { name: /^Step$/ }).click().catch(() => {});
				} else {
					const algo = p.locator('.lc-algo').first();
					for (let i = 0; i < 12; i++) {
						const forward = algo.getByRole('button', { name: /^Forward$/ });
						if (await forward.isDisabled()) break;
						await forward.click();
					}
				}
				const reached = await waitFor(async () => /Goal reached/.test(await card.innerText()), { timeout: 5000 });
				expect(reached, 'the goal was not detected');
				answered.push(experiment.id);
			});
		}

		if (spec.deck) {
			await check(`${label}: Deep dive slideshow navigates, opens a branch and returns`, async () => {
				await tab('deepdive');
				const p = panel();
				const deck = p.locator('.lc-exp-deck');
				await p.locator('hyperframes-slideshow').waitFor({ state: 'attached', timeout: 15000 });
				const s0 = await waitReady(p);
				expect(s0 && s0.ready, 'the slideshow player never became ready');
				await p.locator('hyperframes-slideshow').focus();
				await page.keyboard.press('ArrowRight');
				const moved = await waitFor(async () => ((await playerState(p)).t !== s0.t ? true : null), { timeout: 4000 });
				expect(moved, 'ArrowRight did not move the slideshow');
				const slideCps = (spec.checkpoints ?? []).filter((c) => c.at?.slide);
				const nav = /^(Previous slide|Next slide|Present|Full screen|Mute|Unmute|Sound)/i;
				let hotspot = null;
				let seenSlideCp = false;
				for (let i = 0; i < 20 && !hotspot; i++) {
					const slide = await deck.getAttribute('data-slide');
					const here = slideCps.find((c) => c.at.slide === slide);
					if (here) {
						expect(await p.locator(`[data-checkpoint="${here.id}"]`).count(), `slide checkpoint "${here.id}" is not shown on its slide`);
						seenSlideCp = true;
					}
					const buttons = p.locator('hyperframes-slideshow').getByRole('button');
					const names = await buttons.evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim()));
					const index = names.findIndex((n) => n && !nav.test(n));
					if (index !== -1) hotspot = buttons.nth(index);
					else {
						await p.locator('hyperframes-slideshow').focus();
						await page.keyboard.press('ArrowRight');
						await page.waitForTimeout(350);
					}
				}
				expect(hotspot, 'no hotspot card appeared on the main path');
				if (slideCps.length) expect(seenSlideCp, 'no slide checkpoint was shown');
				const before = (await playerState(p)).t;
				await hotspot.click();
				const inBranch = await waitFor(async () => ((await playerState(p)).t > before + 1 ? true : null), { timeout: 4000 });
				expect(inBranch, 'the hotspot did not open a branch');
				await page.waitForTimeout(400);
				expect(/deep dives:/.test(await p.innerText()), 'the branch was not recorded');
				await p.locator('hyperframes-slideshow').focus();
				await page.keyboard.press('ArrowLeft');
				const back = await waitFor(async () => (Math.abs((await playerState(p)).t - before) < 0.5 ? true : null), { timeout: 4000 });
				expect(back, 'Previous did not return to the main path');
			});
		}

		await check(`${label}: Practice keeps the answers, lists every question, and exports progress`, async () => {
			await tab('practice');
			const p = panel();
			const cards = await p.locator('.lc-exp-card').count();
			expect(cards === (spec.checkpoints ?? []).length, `${cards} cards for ${(spec.checkpoints ?? []).length} questions`);
			for (const id of answered) {
				const status = await p.locator(`[data-checkpoint="${id}"]`).getAttribute('data-status');
				expect(status && status !== 'open', `the answer to "${id}" was lost when the tab changed`);
			}
			if (spec.mode === 'hybrid' && spec.summary_video) expect(await p.locator('.lc-exp-video').count(), 'no final summary video');
			const [download] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), p.getByRole('button', { name: 'Export progress' }).click()]);
			const data = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
			expect(data.format === 'tutor-progress' && data.v === 1, 'the export is not a tutor-progress file');
			expect(data.experiences?.[spec.id], 'the export does not hold this experience');
			for (const id of answered) expect(data.experiences[spec.id].checkpoints[id], `the export misses "${id}"`);
		});

		await check(`${label}: every control has a name and no console error occurred`, async () => {
			const unnamed = await fig.locator('button').evaluateAll((els) => els.filter((e) => !(e.getAttribute('aria-label') || e.textContent || '').trim()).length);
			expect(unnamed === 0, `${unnamed} buttons have no name`);
			expect(errors.length === 0, errors.slice(0, 3).join(' | '));
		});
		await context.close();

		await check(`${label}: 375 px, reduced motion: no sideways scroll and no autoplay`, async () => {
			const phone = await browser.newContext({ viewport: { width: 375, height: 800 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
			const p = await phone.newPage();
			const phoneErrors = await open(p, url);
			const f = p.locator(`[data-experience="${spec.id}"]`).first();
			for (const name of expectedTabs(spec)) {
				await f.locator(`[role="tab"][data-tab="${name}"]`).click();
				await p.waitForTimeout(300);
				const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
				expect(overflow <= 1, `${name} tab is ${overflow}px wider than the screen`);
			}
			if (spec.guided) {
				await f.locator('[role="tab"][data-tab="guided"]').click();
				const scope = f.locator('[role="tabpanel"]');
				await scope.locator('hyperframes-player').first().waitFor({ state: 'attached', timeout: 15000 });
				await p.waitForTimeout(1500);
				const s = await scope.locator('hyperframes-player').first().evaluate((el) => ({ paused: el.paused, t: el.currentTime }));
				expect(s.paused !== false && s.t < 0.5, 'the walkthrough started by itself');
			}
			expect(phoneErrors.length === 0, phoneErrors.slice(0, 2).join(' | '));
			await phone.close();
		});
	}
}
