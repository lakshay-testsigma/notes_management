import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
const examples = fileURLToPath(new URL("../examples/", import.meta.url));

function run(args, input) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", input });
}

test("--edit with a good message exits 0", () => {
  const r = run(["--edit", join(examples, "good.txt")]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /ok \(version bump: minor\)/);
});

test("--edit with a bad message exits 1 and names the rule", () => {
  const r = run(["--edit", join(examples, "bad.txt")]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /\[type-enum\]/);
});

test("comment lines in the file are ignored", () => {
  assert.equal(run(["--edit", join(examples, "with-comments.txt")]).status, 0);
});

test("stdin works without --edit", () => {
  assert.equal(run([], "feat: from stdin\n").status, 0);
  assert.equal(run([], "nope\n").status, 1);
});

test("a warning alone exits 0 and prints the warning", () => {
  const file = join(mkdtempSync(join(tmpdir(), "lint-")), "msg.txt");
  writeFileSync(file, "feat!: drop it\n");
  const r = run(["--edit", file]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /warning \[breaking-has-description\]/);
});

test("--edit without a file is a usage error with exit 2", () => {
  assert.equal(run(["--edit"]).status, 2);
});
