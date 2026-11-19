import assert from "node:assert/strict";
import { test } from "node:test";
import { RequestTimingAnalyzer } from "../../src/analysis/RequestTimingAnalyzer.js";
import { loadCapture } from "../fixtures/loadFixture.js";

const result = new RequestTimingAnalyzer().analyze(loadCapture().events);
const byId = (id) => result.requests.find((r) => r.id === id);

test("splits a full request into DNS, connect, TLS, wait and download", () => {
  assert.deepEqual(byId("1").phases, { dns: 5, connect: 8, tls: 12, wait: 83.5, download: 50 });
  assert.equal(byId("1").state, "complete");
});

test("shows -1 offsets as null, never as a negative number", () => {
  const phases = byId("2").phases;
  assert.equal(phases.dns, null);
  assert.equal(phases.connect, null);
  assert.equal(phases.tls, null);
  assert.equal(phases.wait, 44.4);
});

test("counts a repeated request id with redirectResponse as a redirect", () => {
  assert.equal(byId("3").redirects, 1);
  assert.equal(byId("3").url, "https://shop.example/logo.png");
  assert.equal(result.totals.redirects, 1);
});

test("marks a failed request with its error text", () => {
  assert.equal(byId("4").state, "failed");
  assert.equal(byId("4").errorText, "net::ERR_NAME_NOT_RESOLVED");
});

test("keeps a response that has no request event, marked incomplete", () => {
  assert.equal(byId("5").state, "incomplete");
  assert.deepEqual(byId("5").missing, ["request"]);
  assert.equal(byId("5").url, "https://shop.example/late.json");
});

test("totals add up", () => {
  assert.equal(result.totals.count, 5);
  assert.equal(result.totals.failed, 1);
  assert.equal(result.totals.incomplete, 1);
  assert.equal(result.totals.bytes, 97000);
});

test("an empty event list gives an empty table", () => {
  assert.equal(new RequestTimingAnalyzer().analyze([]).totals.count, 0);
});

test("ignores events that have no requestId or a different domain", () => {
  const r = new RequestTimingAnalyzer().analyze([{ method: "Network.dataReceived", params: {} }, { method: "Page.loadEventFired", params: { requestId: "x" } }]);
  assert.equal(r.totals.count, 0);
});
