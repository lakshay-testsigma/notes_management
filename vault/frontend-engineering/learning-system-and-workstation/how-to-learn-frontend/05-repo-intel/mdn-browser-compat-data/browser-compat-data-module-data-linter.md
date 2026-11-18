---
title: "mdn/browser-compat-data — module data-linter"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — module data-linter

## Responsibility

This module checks the browser support data before it ships. A "supported since version N" claim is only JSON, so a typo could publish a false claim. The linter reads every data file, runs a list of small checks, and fails the build with a message that tells the contributor how to fix it. A second tool, `fix`, repairs the problems a machine can repair.

## Key files

- `lint/lint.js` — the runner. It loads files, runs the checks in four scopes, and prints the report.
- `lint/linter/index.js` — the list of all checks (21 exports), `lint/linter/index.js:4-24 @ 8f942b4`.
- `lint/linter/test-schema.js` — checks each file against the JSON Schema.
- `lint/linter/test-versions.js` — checks `version_added` and `version_removed`.
- `lint/linter/test-status.js` — checks the `status` flags (experimental, deprecated, standard track).
- `lint/linter/test-mirror.js`, `test-obsolete.js`, `test-consistency.js`, `test-mdn-urls.js` — more checks.
- `lint/fix.js` — the auto-fixer.
- `scripts/lib/ajv.js` — one shared schema validator setup.
- `docs/testing.md` — contributor guide.

## How it works

In plain words: the linter first reads all files and checks each one alone. Then it checks each browser, then each feature, then the whole tree at once. A check is a small object with a name, a scope and a `check` function.

1. `main` starts with the data folders, or with the files you pass. `lint/lint.js:118-124 @ 8f942b4`.
2. `loadAndCheckFiles` parses each `.json` file, runs the `file` scope checks on it, and merges it into one tree. A read or parse error is stored as a "File Read Error", not thrown. `lint/lint.js:76-97 @ 8f942b4`.
3. The `browser` scope runs once per browser in `data.browsers`. `lint/lint.js:127-137 @ 8f942b4`.
4. The `feature` scope runs on each feature found by `walk`. `lint/lint.js:140-150 @ 8f942b4`.
5. The `tree` scope runs once on all data, for checks that compare features (for example parent and child). `lint/lint.js:153-160 @ 8f942b4`.
6. The report groups messages by check, counts errors, warnings and info, and sets `hasErrors`. `lint/lint.js:162-184 @ 8f942b4`.
7. The process exits 1 if any error exists. `lint/lint.js:288 @ 8f942b4`.

How a version claim is checked (`test-versions.js`):

- A version string must be a real release of that browser in `browsers/*.json`; `preview` is allowed only if the browser has a `preview_name`. `lint/linter/test-versions.js:35-46 @ 8f942b4`.
- `version_removed` must be greater than `version_added`; equal values fail. `lint/linter/test-versions.js:55-85 @ 8f942b4`, `lint/linter/test-versions.js:152-162 @ 8f942b4`.
- `version_added: false` (no support) may carry only `notes` and `impl_url`. `lint/linter/test-versions.js:170-180 @ 8f942b4`.
- `version_last` is generated, so a human must not write it. `lint/linter/test-versions.js:191-195 @ 8f942b4`.

## Beyond the textbook

1. **Ranged versions have a deadline.** The textbook says "store the first version that supports it". BCD also allows "at most N" values written `≤37`, but only for releases on or before 2020-05-19, and never for a release with no known date. Why: old history is hard to prove exactly; new data must be exact. Evidence: `lint/linter/test-versions.js:15-16 @ 8f942b4`, `lint/linter/test-versions.js:137-149 @ 8f942b4`. The stats doc names "exact and ranged values" as a tracked measure. `docs/testing.md:33 @ 8f942b4`.
2. **Errors that teach.** The textbook returns "invalid". This code lists valid versions and adds per-browser tips, such as Safari iOS using the iOS number. Evidence: `lint/linter/test-versions.js:19-26 @ 8f942b4`, `lint/linter/test-versions.js:130-135 @ 8f942b4`.
3. **Duplicated data is an error.** If a browser's entry equals what upstream mirroring would produce, the linter says to write `"mirror"` instead, and marks it fixable. Evidence: `lint/linter/test-mirror.js:31-40 @ 8f942b4`. A `mirror` browser must have an upstream browser. `lint/linter/test-versions.js:114-121 @ 8f942b4`.
4. **Flags follow the Baseline "core browser set".** The status check marks a feature `experimental` as wrong when two of the three engines (Blink, Gecko, WebKit) ship it in a core browser. Evidence: `lint/linter/test-status.js:16-25 @ 8f942b4`, `lint/linter/test-status.js:75-84 @ 8f942b4`. This is the data behind the Baseline idea you learn in the lesson.
5. **Time-based rules.** Data for a feature removed everywhere is an error after 2.5 years, info after 2 years. Evidence: `lint/linter/test-obsolete.js:29-33 @ 8f942b4`, `lint/linter/test-obsolete.js:86-98 @ 8f942b4`. A rule that depends on today's date means old data can start failing with no code change.
6. **Exception lists that must shrink.** A known violation can be listed as an exception. If the exception is no longer needed, the lint fails ("Unnecessary exception"). Evidence: `lint/lint.js:224-240 @ 8f942b4`, `lint/linter/test-obsolete.js:134-137 @ 8f942b4`. For standard-track features without a spec link, a stale exception is a fixable warning. `lint/linter/test-status.js:145-158 @ 8f942b4`.
7. **Fix, then lint.** `fix.js` runs 14 named fixers over each file in a fixed order and rewrites the file only if the text changed. With explicit file arguments it then runs the linter, so a pre-commit hook fails for problems the fixer cannot solve. Evidence: `lint/fix.js:38-53 @ 8f942b4`, `lint/fix.js:98-100 @ 8f942b4`, `lint/fix.js:151-153 @ 8f942b4`. The fixer sorts files before folders so a parent feature is fixed before its children. `lint/fix.js:107-116 @ 8f942b4`.
8. **Bot suggestions on pull requests.** When lint fails, CI runs `lint:fix` and posts inline review suggestions. `docs/testing.md:27 @ 8f942b4`.

## Tests and what they protect

The tests use the Node built-in `node:test` runner and `assert/strict`. `lint/linter/test-versions.test.js:6-7 @ 8f942b4`. Each test builds a small fake support block and checks the logger messages.

- Versions: mirror without upstream, removed not after added, flags on a browser that has none, `false` with extra keys, `false` inside an array. `lint/linter/test-versions.test.js:58-123 @ 8f942b4`.
- Status: experimental in many engines, experimental plus deprecated, non-standard with spec link, missing spec link, exception list behaviour. `lint/linter/test-status.test.js:99-307 @ 8f942b4`.
- Mirror: reports data that could be mirrored and stays quiet when it cannot. `lint/linter/test-mirror.test.js:19-84 @ 8f942b4`.
- Not tested here: `test-consistency.js`, `test-obsolete.js`, `test-mdn-urls.js` have no test file in this slice.

## Error handling, performance, and security

- Errors in one file do not stop the run; they are collected and reported. `lint/lint.js:90-96 @ 8f942b4`.
- Missing paths give a warning and are skipped. `lint/lint.js:67-74 @ 8f942b4`.
- Windows paths are normalised so messages match on every system. `lint/lint.js:40-43 @ 8f942b4`.
- Warnings fail the run only with `--fail-on-warnings`. `lint/lint.js:182-184 @ 8f942b4`.
- Schema errors are logged one by one because the error-formatting library wrongly joins messages (the code comment links the upstream pull request). `lint/linter/test-schema.js:30-34 @ 8f942b4`.
- The Ajv setup collects all errors, uses the lax `fast` URI mode so URLs with characters like ① pass, and adds custom keywords used by the type generator. `scripts/lib/ajv.js:10-20 @ 8f942b4`.
- The MDN URL check builds expected page addresses from an inventory of known slugs. `lint/linter/test-mdn-urls.js:59 @ 8f942b4`.

## Technologies and services seen

- Ajv, ajv-errors, ajv-formats — JSON Schema validation. `scripts/lib/ajv.js:1-3 @ 8f942b4`.
- better-ajv-errors — readable schema messages. `lint/linter/test-schema.js:4 @ 8f942b4`.
- compare-versions — semver-like comparison of version strings. `lint/linter/test-versions.js:6 @ 8f942b4`.
- yargs and es-main — command line and "run only when called directly". `lint/lint.js:9-11 @ 8f942b4`.
- Node `node:test` — test runner. `lint/linter/test-versions.test.js:6 @ 8f942b4`.
- MDN Web Docs addresses — the target of the URL check. `lint/linter/test-mdn-urls.js:59 @ 8f942b4`.
- web-features Baseline docs — the source of the core browser set. `lint/linter/test-status.js:16 @ 8f942b4`.
- EditorConfig — editor formatting. `docs/testing.md:8 @ 8f942b4`.

## Worth exploring interactively

1. Lint run through four scopes (`FlowAnimation`): `main` → `loadAndCheckFiles` parses and runs `file` checks (`lint/lint.js:56-97 @ 8f942b4`) → `browser` checks (`lint/lint.js:127-137 @ 8f942b4`) → `feature` checks via `walk` (`lint/lint.js:140-150 @ 8f942b4`) → `tree` checks (`lint/lint.js:153-160 @ 8f942b4`) → grouped report and exit code (`lint/lint.js:162-184 @ 8f942b4`, `lint/lint.js:288 @ 8f942b4`).
2. One support statement through the versions check (`AlgorithmStepper`): release exists (`lint/linter/test-versions.js:35-46 @ 8f942b4`) → ranged value allowed only before cutoff (`lint/linter/test-versions.js:137-149 @ 8f942b4`) → removed after added (`lint/linter/test-versions.js:152-162 @ 8f942b4`) → `false` with no extra keys (`lint/linter/test-versions.js:170-180 @ 8f942b4`).

## Open questions

- What does `lint/utils.js` do with `exceptions` and `missingExpectedFailures`? It is outside this slice (used at `lint/lint.js:227 @ 8f942b4`).
- How often is the 2020-05-19 ranged cutoff moved?

## My insights
