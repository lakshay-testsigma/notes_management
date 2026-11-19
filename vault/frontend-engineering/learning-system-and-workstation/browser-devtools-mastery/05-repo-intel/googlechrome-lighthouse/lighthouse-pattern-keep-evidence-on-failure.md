---
title: "GoogleChrome/lighthouse — pattern: keep evidence on failure"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Keep evidence on failure

## The problem

A page can fail in many ways: it never paints, it hangs, the tab crashes, or one data collector breaks. If the first error stops the program, the user gets one message and no data to debug with. If the error is swallowed, the user gets numbers that look fine but are wrong.

## What they do

Lighthouse turns failures into values and keeps going. A page load error becomes a `navigationError`, and the run keeps the protocol log and trace as error artifacts. A failing gatherer leaves an `Error` object in its artifact slot, and a dependent gatherer gets a "Dependency failed" error. A failing audit returns `score: null` with a message, and a null score makes the whole category null instead of a partial average. The idea is named in [[Partial failure]].

## Evidence

- `core/gather/navigation-runner.js:95-108 @ 3b399f6` — `NO_FCP`, `PAGE_HUNG` and `TARGET_CRASHED` become a value, not an exception.
- `core/gather/navigation-runner.js:156-173 @ 3b399f6` — on a load error only the raw log and trace are kept.
- `core/gather/runner-helpers.js:122-129 @ 3b399f6` and `core/gather/runner-helpers.js:170-173 @ 3b399f6` — a gatherer error is stored and becomes an `Error` value.
- `core/runner.js:392-420 @ 3b399f6` — one audit's error becomes a null-score result.
- `core/scoring.js:22-42 @ 3b399f6` — a null score spreads to the category.

## When to use it, and when not to

Use it when a run is slow or costly, and several independent results come out of one run. Do not use it when the error leaves no useful data, or when a missing result would be shown as a normal number. Always mark the failed slot so the report can show "could not measure".

## Related

- [[Partial failure]] — the idea behind it
- [[lighthouse-findings|Findings]]

## My insights
