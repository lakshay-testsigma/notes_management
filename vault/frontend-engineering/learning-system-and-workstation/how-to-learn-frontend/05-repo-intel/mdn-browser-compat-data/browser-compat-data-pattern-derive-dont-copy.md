---
title: "mdn/browser-compat-data — pattern: Derive, don't copy"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# Pattern: Derive, don't copy

## The problem

A support table has hundreds of thousands of cells. Many browsers share an engine, so most cells repeat the upstream value. If people type each copy, the copies drift and nobody can tell which one is the original.

## What they do

A contributor writes the string `"mirror"` for a downstream browser. The build looks up the upstream browser, copies its data, and maps each version to the downstream release with the same engine version. The same build also adds `version_last` so readers do not need the release list. This is [[Derived data]]: one fact stored once, copies computed. The linter closes the loop: if a typed entry equals what mirroring would give, it is an error that says to write `"mirror"`.

## Evidence

- `api/AbortController.json:17 @ 8f942b4` — a `chrome_android` entry that is just `"mirror"`
- `scripts/build/index.js:82-86 @ 8f942b4` — the build finds the `mirror` string and calls `mirrorSupport`
- `scripts/build/mirror.js:105-141 @ 8f942b4` — versions mapped by engine version
- `scripts/build/index.js:97-109 @ 8f942b4` — `version_last` derived at build time
- `lint/linter/test-mirror.js:31-40 @ 8f942b4` — duplicated data is reported as fixable
- `scripts/build/mirror.test.js:48-70 @ 8f942b4` — tables of expected version pairs

## When to use it, and when not to

Use it when many records share one source and the rule that maps them is exact. Do not use it when the rule has many exceptions: BCD needs a hand-written table for Safari on iOS (`scripts/build/mirror.js:48-65 @ 8f942b4`). In your own app, keep derived fields out of the stored note and compute them when you read.

## Related

- [[Derived data]] — the idea behind it
- [[browser-compat-data-findings|Findings]]
- [[browser-compat-data-module-build-pipeline|build-pipeline]]

## My insights
