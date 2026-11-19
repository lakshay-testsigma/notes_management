import assert from "node:assert/strict";
import { test } from "node:test";
import { ConsoleErrorAnalyzer } from "../../src/analysis/ConsoleErrorAnalyzer.js";
import { HeapAnalyzer } from "../../src/analysis/HeapAnalyzer.js";
import { loadCapture } from "../fixtures/loadFixture.js";

const capture = loadCapture();

test("groups repeated console errors and ignores logs and warnings", () => {
  const result = new ConsoleErrorAnalyzer().analyze(capture.events);
  assert.equal(result.total, 4);
  assert.equal(result.errors[0].message, "Failed to load cart");
  assert.equal(result.errors[0].count, 2);
  assert.deepEqual(result.errors.map((e) => e.kind).sort(), ["browser-log", "console.error", "exception"]);
});

test("cuts a very long message", () => {
  const long = "x".repeat(1000);
  const result = new ConsoleErrorAnalyzer().analyze([{ method: "Runtime.consoleAPICalled", params: { type: "error", args: [{ value: long }] } }]);
  assert.equal(result.errors[0].message.length, 300);
});

test("heap delta compares the first and last sample", () => {
  const result = new HeapAnalyzer().analyze(capture.heapSamples);
  assert.equal(result.deltaBytes, 2_500_000);
  assert.equal(result.deltaPercent, 25);
});

test("heap analysis throws when fewer than two samples exist", () => {
  assert.throws(() => new HeapAnalyzer().analyze([capture.heapSamples[0]]), /heap samples/);
});
