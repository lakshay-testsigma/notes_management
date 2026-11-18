---
title: "GoogleChrome/lighthouse — pattern: memoized computed artifacts"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Memoized computed artifacts

## The problem

Many audits need the same parsed trace and the same list of network requests. If each audit parses them again, a large trace is parsed many times, and the run is slow.

## What they do

A wrapper adds a `request()` method to a class. It stores the promise for each artifact name and each set of input keys. A second caller gets the same promise, even while the first computation still runs. Each artifact lists the keys that matter; a key that is `undefined` throws in tests and logs an error in production. Main-thread tasks reuse the same cache by asking for the processed trace and not parsing again. The runner passes one shared cache map to every audit.

## Evidence

- `core/computed/computed-artifact.js:51-76 @ 3b399f6` — check the cache, call `compute_` on a miss, store the promise
- `core/computed/computed-artifact.js:36-49 @ 3b399f6` — the key allow-list and the missing-key check
- `core/computed/main-thread-tasks.js:18-20 @ 3b399f6` — a computed artifact built on another one
- `core/runner.js:353-356 @ 3b399f6` — one `computedCache` shared by all audits
- `core/test/computed/metrics/largest-contentful-paint-test.js:24 @ 3b399f6` — each test makes a fresh cache

## When to use it, and when not to

Use it when several checks need the same expensive parse and the inputs are plain data. Do not use it when inputs change during a run or when memory matters more than time, because a cache holds results alive. A capstone that reads a trace, a HAR and a report once each needs only a small version: parse each file a single time and pass the result around.

## Related

- [[Memoization]] — the idea behind it
- [[Performance trace]] — the large input that makes it worth it
- [[lighthouse-findings|Findings]]

## My insights
