// check.js — the test that git bisect runs at each commit it checks out.
// It must print a one-line verdict and exit 0 (good) or 1 (bad).
// git bisect runs this from inside the demo repo, so the module path is
// resolved against the current working directory, not this file's location.
"use strict";

const path = require("path");
const { truncate } = require(path.resolve("src/truncate.js"));

const out = truncate("hello", 5);

// TODO(1): Set `expected` to what a correct commit returns for truncate("hello", 5).
const expected = "";

// TODO(2): Print a one-line verdict and exit 0 when `out` equals `expected`,
//   and 1 otherwise. git bisect reads 0 as good and 1 as bad.
throw new Error("TODO(2): check.js does not report good or bad yet");
