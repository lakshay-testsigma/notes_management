import { test } from "node:test";
import assert from "node:assert/strict";
import { stripComments, exitCodeFor } from "../src/hook.js";

test("stripComments removes lines that start with #", () => {
  assert.equal(stripComments("fix: a\n# hint\n# more\n"), "fix: a");
});

test("stripComments keeps a # inside a line", () => {
  assert.equal(stripComments("fix: close #4"), "fix: close #4");
});

test("exit code is 1 when an error exists", () => {
  assert.equal(exitCodeFor({ errors: [{}], warnings: [] }), 1);
});

test("exit code is 0 for warnings only", () => {
  assert.equal(exitCodeFor({ errors: [], warnings: [{}] }), 0);
});
