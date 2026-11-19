import assert from "node:assert/strict";
import { test } from "node:test";
import { ChromeLaunchError } from "../../src/domain/errors.js";
import { ChromeCdpDriver } from "../../src/infrastructure/ChromeCdpDriver.js";
import { loadCapture } from "../fixtures/loadFixture.js";

// A fake DevTools connection that replays the recorded fixture when the page navigates.
class ScriptedConnection {
  listeners = [];
  sent = [];
  closed = false;
  constructor({ failOn = null } = {}) {
    this.failOn = failOn;
    this.heap = [...loadCapture().heapSamples];
  }
  onEvent(fn) { this.listeners.push(fn); }
  emit(message) { this.listeners.forEach((fn) => fn(message)); }
  close() { this.closed = true; }

  async send(method, params, sessionId) {
    this.sent.push(method);
    if (method === this.failOn) return { error: new Error(`${method} failed`) };
    const fixture = loadCapture();
    switch (method) {
      case "Target.createTarget": return { result: { targetId: "T1" } };
      case "Target.attachToTarget": return { result: { sessionId: "S1" } };
      case "Page.navigate":
        queueMicrotask(() => {
          for (const e of fixture.events) this.emit({ ...e, sessionId: "S1" });
          this.emit({ method: "Page.loadEventFired", params: {}, sessionId: "S1" });
        });
        return { result: {} };
      case "Runtime.getHeapUsage": return { result: this.heap.shift() };
      case "Tracing.end":
        queueMicrotask(() => {
          this.emit({ method: "Tracing.dataCollected", params: { value: fixture.trace } });
          this.emit({ method: "Tracing.tracingComplete", params: {} });
        });
        return { result: {} };
      default: return { result: {} };
    }
  }
}

function makeDriver(connection, launcher) {
  const closed = { chrome: false };
  const defaultLauncher = { launch: async () => ({ endpoint: "ws://fake", close: async () => { closed.chrome = true; } }) };
  const driver = new ChromeCdpDriver({
    launcher: launcher ?? defaultLauncher, connect: async () => connection,
    config: { navTimeoutMs: 3000, heapWaitMs: 0 }, quietMs: 20, pollMs: 5,
  });
  return { driver, closed };
}

test("collects events, trace and heap samples into a RawCapture", async () => {
  const connection = new ScriptedConnection();
  const { driver, closed } = makeDriver(connection);
  const result = await driver.capture("https://shop.example/");
  assert.equal(result.ok, true);
  const capture = result.value;
  assert.equal(capture.loadOutcome, "loaded");
  assert.equal(capture.events.length, loadCapture().events.length + 1); // plus Page.loadEventFired
  assert.equal(capture.trace.length, loadCapture().trace.length);
  assert.equal(capture.heapSamples.length, 2);
  assert.deepEqual(capture.collectionErrors, {});
  assert.equal(capture.settings.cacheDisabled, true);
  assert.equal(connection.closed, true);
  assert.equal(closed.chrome, true);
});

test("a heap failure is recorded as a collection error, and the rest is kept", async () => {
  const { driver } = makeDriver(new ScriptedConnection({ failOn: "Runtime.getHeapUsage" }));
  const result = await driver.capture("https://shop.example/");
  assert.equal(result.ok, true);
  assert.match(result.value.collectionErrors.heap, /Runtime.getHeapUsage failed/);
  assert.equal(result.value.heapSamples.length, 0);
  assert.ok(result.value.events.length > 0);
});

test("a launch failure comes back as an error value and nothing is left open", async () => {
  const launcher = { launch: async () => { throw new ChromeLaunchError("no chrome"); } };
  const { driver } = makeDriver(new ScriptedConnection(), launcher);
  const result = await driver.capture("https://shop.example/");
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "chrome_launch_failed");
});

test("a command that fails before navigation becomes capture_failed", async () => {
  const connection = new ScriptedConnection({ failOn: "Network.enable" });
  const { driver, closed } = makeDriver(connection);
  const result = await driver.capture("https://shop.example/");
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "capture_failed");
  assert.equal(closed.chrome, true);
});
