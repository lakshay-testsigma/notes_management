---
title: "GoogleChrome/lighthouse — pattern: declare inputs explicitly"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Declare inputs explicitly

## The problem

When every piece of code can read the whole shared state, nobody knows what a check really needs. Caches then key on too much or too little, and a hidden dependency breaks something far away.

## What they do

Three places in Lighthouse list inputs by name. The runner copies only an audit's `requiredArtifacts` into the object the audit receives, and uses the same list for the missing-artifact check. Computed metrics declare the exact keys that make the cache key, and an `undefined` key is an error. Gatherers name each other through symbols in `dependencies`. See [[Explicit dependencies]].

## Evidence

- `core/runner.js:395-421 @ 3b399f6`, `core/runner.js:430-442 @ 3b399f6` — required artifacts checked, then narrowed.
- `core/computed/computed-artifact.js:36-49 @ 3b399f6` — only the declared keys build the cache key.
- `core/computed/computed-artifact.js:58-65 @ 3b399f6` — the cached promise is returned on a hit.
- `core/gather/gatherers/main-document-content.js:16-20 @ 3b399f6` — a gatherer declares `DevtoolsLog` as a dependency.
- `core/audits/metrics/total-blocking-time.js:30 @ 3b399f6` — an audit's declared list.

## When to use it, and when not to

Use it when results are cached or reused, or when several people add checks. For a small tool, a plain typed object passed to each function gives most of the benefit without a cache layer.

## Related

- [[Explicit dependencies]] — the idea behind it
- [[lighthouse-findings|Findings]]

## My insights
