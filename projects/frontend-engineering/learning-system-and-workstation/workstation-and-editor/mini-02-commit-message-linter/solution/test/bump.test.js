import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parse.js";
import { bumpFor } from "../src/bump.js";

test("fix is a patch", () => assert.equal(bumpFor(parse("fix: a")), "patch"));
test("feat is a minor", () => assert.equal(bumpFor(parse("feat: a")), "minor"));
test("! makes a major", () => assert.equal(bumpFor(parse("fix!: a")), "major"));
test("BREAKING CHANGE footer makes a major", () => {
  assert.equal(bumpFor(parse("feat: a\n\nBREAKING CHANGE: b")), "major");
});
test("other types need no release", () => assert.equal(bumpFor(parse("docs: a")), "none"));
