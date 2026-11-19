import assert from "node:assert/strict";
import { test } from "node:test";
import { WebVitalsAnalyzer } from "../../src/analysis/WebVitalsAnalyzer.js";
import { MissingTraceDataError } from "../../src/domain/errors.js";
import { loadCapture } from "../fixtures/loadFixture.js";

const analyzer = new WebVitalsAnalyzer();
const { trace } = loadCapture();
const shift = (ts, score, recent = false) => ({ name: "LayoutShift", ts, args: { data: { score, had_recent_input: recent } } });

test("LCP uses the last candidate after navigation start", () => {
  assert.deepEqual(analyzer.lcp(trace), { ms: 2900, rating: "needs-work" });
});

test("LCP throws a named error when the trace has no candidate", () => {
  const noLcp = trace.filter((e) => e.name !== "largestContentfulPaint::Candidate");
  assert.throws(() => analyzer.lcp(noLcp), MissingTraceDataError);
});

test("LCP throws a named error when navigationStart is missing", () => {
  assert.throws(() => analyzer.lcp([]), /navigationStart/);
});

test("CLS takes the largest session and skips shifts after user input", () => {
  const result = analyzer.cls(trace);
  assert.equal(result.value, 0.09); // 0.05 + 0.04 in one session; 0.2 ignored; 0.03 alone
  assert.equal(result.rating, "good");
  assert.equal(result.shifts, 3);
});

test("CLS starts a new session after a gap longer than 1 second", () => {
  assert.equal(analyzer.cls([shift(0, 0.1), shift(1_000_001, 0.1)]).value, 0.1);
  assert.equal(analyzer.cls([shift(0, 0.1), shift(1_000_000, 0.1)]).value, 0.2);
});

test("CLS caps a session at 5 seconds", () => {
  const steady = [0, 1, 2, 3, 4, 5, 6].map((s) => shift(s * 1_000_000, 0.1));
  // The first session holds shifts at 0..5 s (six shifts: the cap is exceeded at 6 s).
  assert.equal(analyzer.cls(steady).value, 0.6);
});

test("CLS of an empty trace is zero", () => {
  assert.equal(analyzer.cls([]).value, 0);
});

test("long tasks sum the time over 50 ms", () => {
  const result = analyzer.longTasks(trace);
  assert.equal(result.count, 2);
  assert.equal(result.totalBlockingMs, 320);
  assert.deepEqual(result.longest, [300, 120]);
  assert.equal(result.rating, "needs-work");
});
