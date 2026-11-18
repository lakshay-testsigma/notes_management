import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parse.js";
import { typeEnum, headerMaxLength, subjectEmpty, breakingHasDescription } from "../src/rules.js";

const types = ["feat", "fix"];

test("type-enum passes for a listed type and fails for others", () => {
  assert.equal(typeEnum(parse("fix: a"), "always", types)[0], true);
  assert.equal(typeEnum(parse("wip: a"), "always", types)[0], false);
  assert.equal(typeEnum(parse("not conventional"), "always", types)[0], false);
});

test("type-enum 'never' flips the answer", () => {
  assert.equal(typeEnum(parse("fix: a"), "never", types)[0], false);
});

test("header-max-length counts the whole header", () => {
  const header = "fix: " + "x".repeat(10);
  assert.equal(headerMaxLength(parse(header), "always", 15)[0], true);
  assert.equal(headerMaxLength(parse(header), "always", 14)[0], false);
});

test("subject-empty 'never' rejects an empty description", () => {
  assert.equal(subjectEmpty(parse("fix:"), "never")[0], false);
  assert.equal(subjectEmpty(parse("fix: a"), "never")[0], true);
});

test("breaking-has-description needs a footer with text", () => {
  assert.equal(breakingHasDescription(parse("feat!: a"), "always")[0], false);
  assert.equal(breakingHasDescription(parse("feat!: a\n\nBREAKING CHANGE: gone"), "always")[0], true);
  assert.equal(breakingHasDescription(parse("feat: a"), "always")[0], true);
});

test("every rule returns a message", () => {
  assert.equal(typeof headerMaxLength(parse("fix: a"), "always", 5)[1], "string");
});
