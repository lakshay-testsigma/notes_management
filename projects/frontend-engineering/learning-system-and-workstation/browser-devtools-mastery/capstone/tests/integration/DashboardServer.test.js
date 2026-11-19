import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { buildApp } from "../../src/main.js";
import { Config } from "../../src/infrastructure/Config.js";
import { ChromeLaunchError } from "../../src/domain/errors.js";
import { Result } from "../../src/domain/Result.js";
import { loadCapture } from "../fixtures/loadFixture.js";

// The fake driver replaces Chrome: it returns the recorded fixture, or a failure.
class FakeDriver {
  calls = [];
  failWith = null;
  async capture(url) {
    this.calls.push(url);
    if (this.failWith) return Result.err(this.failWith);
    return Result.ok({ ...loadCapture(), url });
  }
}

let app, base, driver;

before(async () => {
  driver = new FakeDriver();
  const captureDir = await mkdtemp(path.join(os.tmpdir(), "dash-"));
  const config = Config.fromEnv({ CAPTURE_DIR: captureDir, PORT: "0" });
  app = buildApp(config, { driver });
  app.logger.write = () => {}; // keep test output quiet
  const port = await app.server.listen(0);
  base = `http://127.0.0.1:${port}`;
});

after(() => app.server.close());

const post = (body) => fetch(`${base}/api/inspect`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("serves the dashboard page and its script", async () => {
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Page health inspector/);
  assert.equal((await fetch(`${base}/app.js`)).status, 200);
  assert.equal((await (await fetch(`${base}/health`)).json()).ok, true);
});

test("POST /api/inspect returns a full report and saves the capture", async () => {
  const response = await post({ url: "https://shop.example/" });
  assert.equal(response.status, 200);
  const report = await response.json();
  assert.equal(report.network.data.totals.count, 5);
  assert.equal(report.vitals.lcp.data.ms, 2900);
  assert.equal(report.heap.data.deltaPercent, 25);
  assert.match(report.captureFile, /\.json$/);
  assert.deepEqual(driver.calls.at(-1), "https://shop.example/");
});

test("the saved capture can be analyzed again with no driver", async () => {
  const { captureFile } = await (await post({ url: "https://shop.example/" })).json();
  const again = await fetch(`${base}/api/captures/${captureFile}/report`);
  assert.equal(again.status, 200);
  assert.equal((await again.json()).console.data.total, 4);
});

test("an invalid or private URL gets 400 and never reaches the driver", async () => {
  const before = driver.calls.length;
  for (const url of ["not a url", "http://localhost:9222/json", "file:///etc/passwd"]) {
    const response = await post({ url });
    assert.equal(response.status, 400, url);
    assert.equal((await response.json()).error.code, "invalid_url");
  }
  assert.equal(driver.calls.length, before);
});

test("a driver failure becomes a 502 with a clear code", async () => {
  driver.failWith = new ChromeLaunchError("Cannot start Chrome");
  const response = await post({ url: "https://shop.example/" });
  driver.failWith = null;
  assert.equal(response.status, 502);
  assert.deepEqual((await response.json()).error, { code: "chrome_launch_failed", message: "Cannot start Chrome" });
});

test("bad JSON gets 400, unknown routes 404, unknown captures 404", async () => {
  const bad = await fetch(`${base}/api/inspect`, { method: "POST", body: "{nope" });
  assert.equal(bad.status, 400);
  assert.equal((await fetch(`${base}/nowhere`)).status, 404);
  assert.equal((await fetch(`${base}/api/captures/missing.json/report`)).status, 404);
});
