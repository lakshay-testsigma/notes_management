import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parse.js";

test("parses type, scope and description", () => {
  const p = parse("feat(api): add search");
  assert.equal(p.type, "feat");
  assert.equal(p.scope, "api");
  assert.equal(p.description, "add search");
  assert.equal(p.breaking, false);
});

test("scope is null when missing", () => {
  assert.equal(parse("fix: typo").scope, null);
});

test("a ! before the colon marks a breaking change", () => {
  const p = parse("feat(api)!: drop v1 routes");
  assert.equal(p.breaking, true);
  assert.equal(p.scope, "api");
});

test("a BREAKING CHANGE footer marks a breaking change", () => {
  const p = parse("feat: new config\n\nBREAKING CHANGE: the old file is ignored");
  assert.equal(p.breaking, true);
  assert.deepEqual(p.footers, [{ token: "BREAKING CHANGE", value: "the old file is ignored" }]);
  assert.equal(p.body, "");
});

test("splits body and footers", () => {
  const p = parse("fix: retry\n\nThe first call often fails.\n\nRefs: #7\nReviewed-by: Sam");
  assert.equal(p.body, "The first call often fails.");
  assert.deepEqual(p.footers, [
    { token: "Refs", value: "#7" },
    { token: "Reviewed-by", value: "Sam" },
  ]);
});

test("a header that is not conventional gives null type and description", () => {
  const p = parse("Added a thing");
  assert.equal(p.type, null);
  assert.equal(p.description, null);
});

test("an empty description is an empty string", () => {
  assert.equal(parse("feat:").description, "");
});
