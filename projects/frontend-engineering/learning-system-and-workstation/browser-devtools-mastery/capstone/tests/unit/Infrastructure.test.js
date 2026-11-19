import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { CdpTimeoutError, TargetCrashedError } from "../../src/domain/errors.js";
import { CaptureStore } from "../../src/infrastructure/CaptureStore.js";
import { CdpConnection } from "../../src/infrastructure/CdpConnection.js";
import { ChromeLauncher } from "../../src/infrastructure/ChromeLauncher.js";
import { LoadSettler } from "../../src/infrastructure/LoadSettler.js";
import { Logger } from "../../src/infrastructure/Logger.js";
import { loadCapture } from "../fixtures/loadFixture.js";

// A tiny in-memory WebSocket: tests push replies by calling receive().
class FakeSocket {
  sent = [];
  #handlers = {};
  addEventListener(type, fn) { (this.#handlers[type] ??= []).push(fn); }
  send(text) { this.sent.push(JSON.parse(text)); }
  close() { this.emit("close", {}); }
  emit(type, event) { (this.#handlers[type] ?? []).forEach((fn) => fn(event)); }
  receive(obj) { this.emit("message", { data: JSON.stringify(obj) }); }
}

test("CdpConnection matches a reply to its command id", async () => {
  const socket = new FakeSocket();
  const conn = new CdpConnection(socket);
  const pending = conn.send("Page.enable", {}, "S1");
  assert.deepEqual(socket.sent[0], { id: 1, method: "Page.enable", params: {}, sessionId: "S1" });
  socket.receive({ id: 1, result: { ok: true } });
  assert.deepEqual(await pending, { result: { ok: true } });
});

test("CdpConnection returns a CDP error as a value", async () => {
  const socket = new FakeSocket();
  const conn = new CdpConnection(socket);
  const pending = conn.send("Bad.method");
  socket.receive({ id: 1, error: { message: "not found" } });
  assert.equal((await pending).error.message, "not found");
});

test("CdpConnection times out a command with no reply", async () => {
  const conn = new CdpConnection(new FakeSocket(), { commandTimeoutMs: 20 });
  const reply = await conn.send("Slow.method");
  assert.ok(reply.error instanceof CdpTimeoutError);
});

test("CdpConnection fails pending commands when the socket closes", async () => {
  const socket = new FakeSocket();
  const conn = new CdpConnection(socket);
  const pending = conn.send("Page.navigate");
  socket.close();
  assert.ok((await pending).error instanceof TargetCrashedError);
  assert.ok((await conn.send("Later")).error instanceof TargetCrashedError);
});

test("CdpConnection passes events to listeners and survives bad JSON", () => {
  const socket = new FakeSocket();
  const conn = new CdpConnection(socket);
  const seen = [];
  conn.onEvent((m) => seen.push(m.method));
  socket.emit("message", { data: "not json" });
  socket.receive({ method: "Page.loadEventFired", params: {} });
  assert.deepEqual(seen, ["Page.loadEventFired"]);
});

test("LoadSettler needs the load event, a quiet network, and quiet time", () => {
  const s = new LoadSettler({ quietMs: 500, maxInflight: 2 });
  assert.equal(s.isSettled(0), false);
  s.observe({ method: "Page.loadEventFired", params: {} });
  ["a", "b", "c"].forEach((id) => s.observe({ method: "Network.requestWillBeSent", params: { requestId: id } }));
  assert.equal(s.isSettled(100), false); // three requests in flight
  s.observe({ method: "Network.loadingFinished", params: { requestId: "a" } });
  assert.equal(s.isSettled(200), false); // quiet period starts now
  assert.equal(s.isSettled(699), false);
  assert.equal(s.isSettled(700), true);
});

test("ChromeLauncher finds the DevTools address in Chrome output", () => {
  assert.equal(ChromeLauncher.parseEndpoint("noise\nDevTools listening on ws://127.0.0.1:9222/devtools/browser/abc\n"), "ws://127.0.0.1:9222/devtools/browser/abc");
  assert.equal(ChromeLauncher.parseEndpoint("nothing here"), null);
});

test("CaptureStore saves a capture and loads it back", async () => {
  const store = new CaptureStore(await mkdtemp(path.join(os.tmpdir(), "cap-")));
  const name = await store.save(loadCapture());
  assert.match(name, /^2026-11-19T10-00-00-000Z-shop\.example\.json$/);
  const loaded = await store.load(name);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.value.url, "https://shop.example/");
});

test("CaptureStore rejects path tricks and files of the wrong shape", async () => {
  const store = new CaptureStore(await mkdtemp(path.join(os.tmpdir(), "cap-")));
  assert.equal((await store.load("../secret.json")).ok, false);
  assert.equal((await store.load("missing.json")).error.code, "bad_capture");
});

test("Logger writes one JSON line with the request id", () => {
  const lines = [];
  new Logger((l) => lines.push(l), () => new Date("2026-01-01T00:00:00Z")).info("inspect.start", { requestId: "r1" });
  assert.deepEqual(JSON.parse(lines[0]), { time: "2026-01-01T00:00:00.000Z", level: "info", event: "inspect.start", requestId: "r1" });
});
