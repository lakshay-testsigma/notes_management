/**
 * Pure logic shared by CompareView, SortBuckets and CodePlayground. Kept free of
 * React and the DOM so `scripts/compare-sort.test.mjs` can test it directly.
 */
import { hashString, seededShuffle } from './hooks';

// ---------------------------------------------------------------- CompareView ----

export type Winner = 'left' | 'right' | 'tie';

/** Which side wins one metric. Higher wins unless `lowerIsBetter`. */
export function metricWinner(left: number, right: number, lowerIsBetter = false): Winner {
	if (!Number.isFinite(left) || !Number.isFinite(right) || left === right) return 'tie';
	const leftBetter = lowerIsBetter ? left < right : left > right;
	return leftBetter ? 'left' : 'right';
}

export interface MetricRow {
	name: string;
	left: number;
	right: number;
	winner: Winner;
	/** Bar lengths as a share of the larger value, 0..1. */
	leftShare: number;
	rightShare: number;
}

/** Metrics that both sides report, in the order the left side lists them. */
export function sharedMetrics(
	left: Record<string, number> | undefined,
	right: Record<string, number> | undefined,
	lowerIsBetter = false,
): MetricRow[] {
	if (!left || !right) return [];
	return Object.keys(left)
		.filter((name) => Object.hasOwn(right, name) && Number.isFinite(left[name]) && Number.isFinite(right[name]))
		.map((name) => {
			const a = left[name];
			const b = right[name];
			const max = Math.max(Math.abs(a), Math.abs(b)) || 1;
			return { name, left: a, right: b, winner: metricWinner(a, b, lowerIsBetter), leftShare: Math.abs(a) / max, rightShare: Math.abs(b) / max };
		});
}

// ---------------------------------------------------------------- SortBuckets ----

export interface SortItem {
	text: string;
	bucket: string;
}

/** The starting order of the unsorted pool: shuffled, but the same on server and client. */
export function initialPool(prompt: string, items: SortItem[]): number[] {
	return seededShuffle(
		items.map((_, i) => i),
		hashString(`${prompt}|${items.map((item) => item.text).join('|')}`),
	);
}

export interface Grade {
	/** item index -> right or wrong; unplaced items are absent */
	verdicts: Record<number, boolean>;
	correct: number;
	placed: number;
	total: number;
}

/** Grade the placement `placement` (item index -> bucket name, or undefined while unsorted). */
export function gradeSort(items: SortItem[], placement: Record<number, string | undefined>): Grade {
	const verdicts: Record<number, boolean> = {};
	let correct = 0;
	let placed = 0;
	items.forEach((item, i) => {
		const bucket = placement[i];
		if (bucket === undefined) return;
		placed++;
		verdicts[i] = bucket === item.bucket;
		if (verdicts[i]) correct++;
	});
	return { verdicts, correct, placed, total: items.length };
}

// ------------------------------------------------------------- CodePlayground ----

/** Normalize program output for comparison: unify line endings, trim line ends and the whole text. */
export function normalizeOutput(text: string): string {
	return String(text ?? '')
		.replace(/\r\n?/g, '\n')
		.split('\n')
		.map((line) => line.replace(/\s+$/, ''))
		.join('\n')
		.trim();
}

/** null when the output matches; otherwise the first differing line (1-based) and both texts. */
export function compareOutput(actual: string, expected: string): { line: number; got: string; want: string } | null {
	const a = normalizeOutput(actual).split('\n');
	const b = normalizeOutput(expected).split('\n');
	if (a.join('\n') === b.join('\n')) return null;
	const length = Math.max(a.length, b.length);
	for (let i = 0; i < length; i++) {
		if (a[i] !== b[i]) return { line: i + 1, got: a[i] ?? '(no line)', want: b[i] ?? '(no line)' };
	}
	return { line: 1, got: a[0] ?? '', want: b[0] ?? '' };
}

export const PLAYGROUND_CSP = "default-src 'none'; script-src 'unsafe-inline'";

/**
 * The document the sandboxed iframe runs. The CSP forbids every network request
 * and `eval`, so the learner's code is placed in its own inline script, wrapped
 * in an async function (top-level `await` works). A syntax error in that script
 * reaches `window.onerror`. Every message carries `runId` so the parent can
 * ignore stale runs. `</script` inside the code is escaped so it cannot end the tag.
 */
export function buildSrcdoc(code: string, runId: string): string {
	const id = JSON.stringify(runId).replace(/</g, '\\u003c');
	const body = String(code).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
	return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${PLAYGROUND_CSP}"></head><body><script>
var __runId = ${id};
var __send = function (type, text) { parent.postMessage({ source: 'tutor-playground', runId: __runId, type: type, text: text }, '*'); };
var __show = function (value) {
  if (typeof value === 'string') return value;
  try { var json = JSON.stringify(value); return json === undefined ? String(value) : json; } catch (e) { return String(value); }
};
var __join = function (args) { return Array.prototype.map.call(args, __show).join(' '); };
console.log = function () { __send('out', __join(arguments)); };
console.info = console.log;
console.warn = function () { __send('err', __join(arguments)); };
console.error = console.warn;
window.onerror = function (message) { __send('err', String(message)); __send('done', ''); return true; };
</script><script>
(async function () {
${body}
})().then(function () { __send('done', ''); }, function (error) { __send('err', String(error && error.message ? error.name + ': ' + error.message : error)); __send('done', ''); });
</script></body></html>`;
}
