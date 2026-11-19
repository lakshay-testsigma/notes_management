import assert from "node:assert/strict";
import { test } from "node:test";
import { ConsoleErrorAnalyzer } from "../../src/analysis/ConsoleErrorAnalyzer.js";
import { HeapAnalyzer } from "../../src/analysis/HeapAnalyzer.js";
import { RequestTimingAnalyzer } from "../../src/analysis/RequestTimingAnalyzer.js";
import { WebVitalsAnalyzer } from "../../src/analysis/WebVitalsAnalyzer.js";
import { ReportBuilder } from "../../src/application/ReportBuilder.js";
import { loadCapture } from "../fixtures/loadFixture.js";

const builder = () => new ReportBuilder({ timing: new RequestTimingAnalyzer(), vitals: new WebVitalsAnalyzer(), consoleErrors: new ConsoleErrorAnalyzer(), heap: new HeapAnalyzer() });

test("builds every section from a full capture", () => {
  const report = builder().build(loadCapture());
  assert.equal(report.network.status, "ok");
  assert.equal(report.vitals.lcp.data.ms, 2900);
  assert.equal(report.console.data.total, 4);
  assert.equal(report.heap.data.deltaBytes, 2_500_000);
});

test("a broken heap section is unavailable and the others still print", () => {
  const capture = loadCapture();
  capture.collectionErrors = { heap: "Runtime.getHeapUsage timed out" };
  const report = builder().build(capture);
  assert.deepEqual(report.heap, { status: "unavailable", reason: "Runtime.getHeapUsage timed out" });
  assert.equal(report.network.status, "ok");
  assert.equal(report.vitals.cls.status, "ok");
});

test("a missing trace makes only the vitals unavailable", () => {
  const capture = loadCapture();
  capture.trace = [];
  const report = builder().build(capture);
  assert.equal(report.vitals.lcp.status, "unavailable");
  assert.equal(report.vitals.cls.status, "ok"); // no shifts is a real zero, not a failure
  assert.equal(report.network.status, "ok");
});

test("an analyzer that throws does not sink the report", () => {
  const b = new ReportBuilder({ timing: { analyze() { throw new Error("boom"); } }, vitals: new WebVitalsAnalyzer(), consoleErrors: new ConsoleErrorAnalyzer(), heap: new HeapAnalyzer() });
  const report = b.build(loadCapture());
  assert.deepEqual(report.network, { status: "unavailable", reason: "boom" });
  assert.equal(report.console.status, "ok");
});
