import { test } from "node:test";
import assert from "node:assert/strict";
import { lint } from "../src/lint.js";

const config = {
  "type-enum": [2, "always", ["feat", "fix"]],
  "header-max-length": [1, "always", 20],
  "subject-empty": [0, "never"],
};

test("a valid message has no problems", () => {
  const r = lint("fix: short", config);
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test("level 2 goes to errors and makes the message invalid", () => {
  const r = lint("wip: short", config);
  assert.equal(r.valid, false);
  assert.equal(r.errors[0].name, "type-enum");
});

test("level 1 goes to warnings and keeps the message valid", () => {
  const r = lint("fix: " + "x".repeat(30), config);
  assert.equal(r.valid, true);
  assert.equal(r.warnings[0].name, "header-max-length");
});

test("level 0 turns a rule off", () => {
  const r = lint("fix:", config);
  assert.equal(r.errors.length + r.warnings.length, 0);
});

test("an unknown rule name throws", () => {
  assert.throws(() => lint("fix: a", { "no-such-rule": [2, "always"] }), /unknown rule/);
});

test("the result includes the parsed message", () => {
  assert.equal(lint("feat(ui): a", config).parsed.scope, "ui");
});
