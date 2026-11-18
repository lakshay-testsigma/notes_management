---
title: "mdn/browser-compat-data — findings"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — findings

What this production codebase does beyond the textbook version of "read a support table", ranked by how much a beginner gains from knowing it.

## 1. The package has no Baseline field; Baseline is a separate layer

- Textbook version: Baseline and caniuse numbers come from one place, so look up "Baseline: yes or no".
- What they do: a feature's `status` block holds only `experimental`, `standard_track` and `deprecated`. A script adds a tag `web-features:<id>` that links a feature to the `web-features` package, where Baseline status lives. The linter uses the Baseline "core browser set" idea to judge the `experimental` flag.
- Why: browser data (who shipped what, when) and the Baseline judgement (is it widely available) are kept apart, so the judgement can change without editing thousands of files.
- Evidence: `scripts/build/index.js:231-245 @ 8f942b4` (applyTransforms: only derived fields are added, no Baseline), `scripts/tag-web-features.js:22-30 @ 8f942b4`, `scripts/tag-web-features.js:87-109 @ 8f942b4`, `lint/linter/test-status.js:16-25 @ 8f942b4`, `schemas/compat-data.schema.json:131-148 @ 8f942b4`
- Borrow it when: you need a "can I ship this" answer. Compute it yourself from per-browser `version_added` plus your own browser set, and keep the rule in one function.
- More: [[browser-compat-data-module-build-and-infra|build-and-infra]], [[browser-compat-data-module-data-linter|data-linter]], [[browser-compat-data-module-consumer-api|consumer-api]]

## 2. Support is a tree with a reserved key, and each cell is one-or-many

- Textbook version: a table with one row per feature and one cell per browser holding one number.
- What they do: a nested tree. A node is a feature when it holds `__compat`. Keys starting with `__` are not children. A browser's value is one statement, a list of statements, or `"mirror"`. `iterSupport` always returns an array.
- Why: features have sub-features, and browsers ship under prefixes or alternative names over time. A list holds that history, and one return shape means readers write one loop.
- Evidence: `utils/walkingUtils.js:18 @ 8f942b4`, `utils/walkingUtils.js:38-40 @ 8f942b4`, `utils/iter-support.js:15-20 @ 8f942b4`, `scripts/traverse.js:124-129 @ 8f942b4`
- Borrow it when: you read this data. Always loop over the array and decide what to do with the rows that have a prefix, a flag, or `partial_implementation`.
- More: [[browser-compat-data-module-consumer-api|consumer-api]], [[browser-compat-data-pattern-honest-uncertainty|honest uncertainty]]

## 3. Many support cells are derived, not typed

- Textbook version: store each browser's value as a plain table cell.
- What they do: a downstream browser says `"mirror"`. The build copies the upstream data and maps versions by engine version. The published file has the real numbers, the source files do not.
- Why: one upstream fact stored once; the linter rejects typed copies that mirroring would produce.
- Evidence: `api/AbortController.json:17 @ 8f942b4`, `scripts/build/mirror.js:105-141 @ 8f942b4`, `scripts/build/index.js:82-86 @ 8f942b4`, `lint/linter/test-mirror.js:31-40 @ 8f942b4`
- Borrow it when: you read the repository's source JSON directly. Treat `"mirror"` as unresolved (`utils/iter-support.js:7-9 @ 8f942b4`) or read the published `data.json` instead.
- More: [[browser-compat-data-pattern-derive-dont-copy|derive, don't copy]], [[browser-compat-data-module-build-pipeline|build-pipeline]]

## 4. Versions admit what is unknown: `≤N`, `preview`, `false`, and missing

- Textbook version: a version is a number, and a blank cell is "no".
- What they do: `≤79` means "at most 79, maybe earlier". `preview` means beta only. `false` means unsupported. Ranges are allowed only for releases up to 2020-05-19. A missing browser becomes `version_added: false` on read.
- Why: old history is hard to prove exactly; new data must be exact (`schemas/compat-data-schema.md:324 @ 8f942b4`).
- Evidence: `schemas/compat-data.schema.json:13 @ 8f942b4`, `lint/linter/test-versions.js:15-16 @ 8f942b4`, `lint/linter/test-versions.js:137-149 @ 8f942b4`, `utils/iter-support.js:20 @ 8f942b4`
- Borrow it when: you compare versions. Strip a leading `≤` before comparing, and decide whether "maybe earlier" counts as supported for your rule.
- More: [[browser-compat-data-pattern-honest-uncertainty|honest uncertainty]], [[browser-compat-data-module-schema-and-types|schema-and-types]]

## 5. The schema teaches contributors and also generates the types

- Textbook version: a schema returns "invalid", and types are written by hand.
- What they do: `errorMessage` keys give a fix hint. `additionalProperties: false` rejects typos. Types are generated from the schema, with a "DO NOT MODIFY BY HAND" banner, and type-checked.
- Why: thousands of drive-by contributors edit the data, and one source of truth cannot drift.
- Evidence: `schemas/compat-data.schema.json:59-61 @ 8f942b4`, `schemas/compat-data.schema.json:93 @ 8f942b4`, `scripts/generate-types.js:19-21 @ 8f942b4`, `scripts/generate-types.js:139-145 @ 8f942b4`
- Borrow it when: any user or file feeds your app. Write the schema once and validate where data enters.
- More: [[browser-compat-data-pattern-schema-first-data|schema first]], [[browser-compat-data-module-schema-and-types|schema-and-types]]

## 6. Rules go beyond the schema: dates, exceptions that must shrink, fixers

- Textbook version: validate the shape and stop.
- What they do: the linter checks that a version is a real release, that removed is after added, and that data for a feature removed everywhere is flagged after 2 years (error at 2.5). An exception list entry that is no longer needed fails the lint. `fix.js` runs 14 fixers in a fixed order, then lints.
- Why: data rots, and exception lists tend to grow forever; failing on stale exceptions keeps them honest.
- Evidence: `lint/linter/test-versions.js:35-46 @ 8f942b4`, `lint/linter/test-obsolete.js:29-33 @ 8f942b4`, `lint/lint.js:224-240 @ 8f942b4`, `lint/fix.js:38-53 @ 8f942b4`
- Borrow it when: you keep a list of known problems. Make the check fail when an entry is no longer needed. Remember a date-based rule can fail with no code change.
- More: [[browser-compat-data-module-data-linter|data-linter]]

## 7. Reviewers see the published output, not only the source diff

- Textbook version: review the changed source files.
- What they do: a CI job builds the base branch and the pull request, formats both `build/` folders and prints the diff. For the release branch the base is the last published npm version.
- Why: one data edit can change many generated entries (for example every mirror result).
- Evidence: `.github/workflows/test.yml:113-123 @ 8f942b4`, `.github/workflows/test.yml:127-165 @ 8f942b4`
- Borrow it when: your build turns inputs into a file users download.
- More: [[browser-compat-data-pattern-guarded-release|guarded release]], [[browser-compat-data-module-build-and-infra|build-and-infra]]

## 8. A line to read twice: `compat.tags.pop(index)`

- Textbook version: `pop(index)` removes the item at `index`.
- What they do: the tagging script finds the index of an old `web-features:` tag, then calls `pop(index)`. In JavaScript `Array.pop` takes no argument and removes the last item. I confirmed the line in the clone. I did not run the script, so I cannot say whether it ever removes a wrong tag; it would matter only when the matched tag is not last.
- Why: it is a reminder that a passing review does not prove a line does what its author meant. `splice(index, 1)` removes by position.
- Evidence: `scripts/tag-web-features.js:98-116 @ 8f942b4` (the line itself is `scripts/tag-web-features.js:115 @ 8f942b4`)
- Borrow it when: you read any source code. Check what a method does with its arguments, and look for a test that covers the case.
- More: [[browser-compat-data-module-build-and-infra|build-and-infra]]

## 9. Releases come from labels, a draft pull request and a human, with provenance

- Textbook version: bump the version by hand and run `npm publish` with a token.
- What they do: a script picks major, minor or patch from pull request labels and opens a draft release pull request. A human merge starts `create-release`, then publish runs tests, builds, and publishes `build/` with `--provenance` and no stored token. The package has `exports` for import, require, a legacy entry and types.
- Why: the docs say release is manual so that ready pull requests join it. Provenance lets consumers verify the builder.
- Evidence: `scripts/release/index.js:113-121 @ 8f942b4`, `.github/workflows/release.yml:18 @ 8f942b4`, `.github/workflows/release.yml:55-63 @ 8f942b4`, `docs/publishing.md:10 @ 8f942b4`, `package.json:7-26 @ 8f942b4`
- Borrow it when: you publish a package others depend on.
- More: [[browser-compat-data-pattern-guarded-release|guarded release]]

## 10. Bots refresh the data, and the supply chain is locked down

- Textbook version: people edit data; actions are `uses: actions/checkout@v4`.
- What they do: two weekday cron jobs open pull requests for new browser releases and for `web-features` tags, limited to the files they should touch. Actions are pinned to commit SHAs, permissions are read-only, and Dependabot waits 3 days except for data packages.
- Why: new browser versions arrive without hand edits, and a cooldown avoids freshly published bad versions while data packages need freshness.
- Evidence: `.github/workflows/update-browser-releases.yml:7 @ 8f942b4`, `.github/workflows/update-web-features.yml:59-61 @ 8f942b4`, `.github/workflows/test.yml:9-10 @ 8f942b4`, `.github/dependabot.yml:9-14 @ 8f942b4`
- Borrow it when: part of your data changes on a schedule you do not control. See [[Software supply chain]].
- More: [[browser-compat-data-module-build-and-infra|build-and-infra]], [[browser-compat-data-pattern-guarded-release|guarded release]]

## My insights
