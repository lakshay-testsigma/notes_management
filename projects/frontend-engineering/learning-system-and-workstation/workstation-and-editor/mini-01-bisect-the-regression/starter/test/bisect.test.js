import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { classify, GOOD, BAD, SKIP } from "../src/check.js";
import { createDemoRepo } from "../src/make-demo-repo.js";
import { findRegression, parseFirstBadCommit } from "../src/find-regression.js";

async function withPriceFile(source, run) {
  const dir = mkdtempSync(join(tmpdir(), "check-"));
  try {
    if (source !== null) writeFileSync(join(dir, "price.js"), source);
    return await run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const goodSource = `export const formatPrice = (c) => "$" + Math.floor(c / 100) + "." + String(c % 100).padStart(2, "0");`;
const badSource = `export const formatPrice = (c) => "$" + Math.floor(c / 100) + "." + (c % 100);`;

test("classify returns 0 for a correct formatter", () =>
  withPriceFile(goodSource, async (dir) => assert.equal(await classify(dir), GOOD)));

test("classify returns 1 for the buggy formatter", () =>
  withPriceFile(badSource, async (dir) => assert.equal(await classify(dir), BAD)));

test("classify returns 125 when the module has a syntax error", () =>
  withPriceFile("export const = ;", async (dir) => assert.equal(await classify(dir), SKIP)));

test("classify returns 125 when price.js is missing", () =>
  withPriceFile(null, async (dir) => assert.equal(await classify(dir), SKIP)));

test("parseFirstBadCommit reads the SHA from bisect output", () => {
  const text = "running node check.js\nabc1234def is the first 'bad' commit\ncommit abc1234def\n";
  assert.equal(parseFirstBadCommit(text), "abc1234def");
  assert.throws(() => parseFirstBadCommit("nothing here"));
});

test("the demo repo has a commit that check.js must skip", async () => {
  const demo = createDemoRepo();
  try {
    spawnSync("git", ["checkout", "-q", demo.skipSha], { cwd: demo.dir });
    assert.equal(await classify(demo.dir), SKIP);
    spawnSync("git", ["checkout", "-q", demo.badSha], { cwd: demo.dir });
    assert.equal(await classify(demo.dir), BAD);
  } finally {
    demo.cleanup();
  }
});

test("findRegression finds the planted commit and skips the broken one", () => {
  const demo = createDemoRepo();
  try {
    assert.notEqual(demo.skipSha, demo.badSha);
    const { sha, output } = findRegression({ repoDir: demo.dir, goodRef: demo.goodSha });
    assert.ok(demo.badSha.startsWith(sha), `expected ${demo.badSha}, got ${sha}`);
    assert.match(output, /is the first .bad. commit/);
  } finally {
    demo.cleanup();
  }
});

test("findRegression resets the repo afterwards", () => {
  const demo = createDemoRepo();
  try {
    findRegression({ repoDir: demo.dir, goodRef: demo.goodSha });
    const log = spawnSync("git", ["bisect", "log"], { cwd: demo.dir, encoding: "utf8" });
    assert.notEqual(log.status, 0, "bisect should no longer be running");
    const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: demo.dir, encoding: "utf8" });
    assert.equal(head.stdout.trim(), demo.headSha);
  } finally {
    demo.cleanup();
  }
});
