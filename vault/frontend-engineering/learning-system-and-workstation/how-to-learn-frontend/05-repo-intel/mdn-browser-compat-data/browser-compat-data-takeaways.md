---
title: "mdn/browser-compat-data — takeaways"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — takeaways for the capstone

The capstone is "TIL learning journal": a web app that logs a today-I-learned note per roadmap item, links primary sources, shows the Baseline status of web features a note mentions, and lists notes due for review. Mini project 1 (baseline-checker) feeds it. These are the things worth borrowing.

1. **Compute the Baseline-style status yourself, in one function.** The package has no Baseline field, so write `statusFor(featureKey, browserSet)` from per-browser `version_added`, and keep the browser set as data. From [[browser-compat-data-findings|finding 1]].
2. **Walk the tree by dotted path and treat `__compat` as the feature marker.** Your note's feature key (for example `css.properties.gap`) is a path; split on `.` and throw a clear error naming the failing part. From [[browser-compat-data-findings|finding 2]].
3. **Loop over `support[browser]` as an array.** Wrap it in a helper that returns an array and turns a missing browser into `version_added: false`. From [[browser-compat-data-findings|finding 2]] and [[browser-compat-data-pattern-honest-uncertainty|honest uncertainty]].
4. **Read the published `data.json`, never the source files.** Source files still hold `"mirror"`; the package root gives resolved values. If you do see `"mirror"`, report "unknown", not "no". From [[browser-compat-data-findings|finding 3]] and [[browser-compat-data-pattern-derive-dont-copy|derive, don't copy]].
5. **Parse versions into three kinds: exact, at-most (`≤N`), and `preview`/`false`.** Show a "maybe earlier" badge in the journal rather than a false precise number. From [[browser-compat-data-findings|finding 4]].
6. **Show `status` flags next to support.** A feature can be supported everywhere and still be `deprecated` or `experimental`; a journal note should say so. From [[browser-compat-data-findings|finding 2]].
7. **Validate a saved note with a schema, with messages that say how to fix it.** One short schema for a note (title, source URL, feature keys, review date) with friendly errors. From [[browser-compat-data-pattern-schema-first-data|schema first]] and [[browser-compat-data-findings|finding 5]].
8. **Write a tiny test for each edge case you handle.** Copy the style of the BCD tests: a small made-up tree, one test per case (missing browser, array, `≤`). From [[browser-compat-data-findings|finding 6]].

## What not to copy

- The release machinery (label-driven bumps, draft release pull requests, provenance, bots). It suits a package with many contributors; a learning app needs one test workflow.
- Generated TypeScript types from the schema and 21 lint checks. Use a small hand-written schema for one note instead.
- Mirroring logic. Read the resolved published data and skip the engine-version mapping.

## My insights
