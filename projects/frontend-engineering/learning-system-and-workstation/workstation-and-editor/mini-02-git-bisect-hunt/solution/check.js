// check.js — the test that git bisect runs at each commit it checks out.
// It prints a one-line verdict and exits 0 (good) or 1 (bad).
// git bisect runs this from inside the demo repo, so the module path is
// resolved against the current working directory, not this file's location.
"use strict";

const path = require("path");
const { truncate } = require(path.resolve("src/truncate.js"));

const out = truncate("hello", 5);
const expected = "hello";

if (out === expected) {
  console.log("good: truncate('hello', 5) = '" + out + "'");
  process.exit(0);
}

console.log("bad:  truncate('hello', 5) = '" + out + "'");
process.exit(1);
