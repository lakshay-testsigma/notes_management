---
title: "dequelabs/axe-core — pattern: Cleanup on every exit path"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# Pattern: Cleanup on every exit path

## The problem

A tool that sets a flag when it starts and clears it at the end gets stuck if anything throws in the middle. In a long-lived page, every later call then fails.

## What they do

The running flag and teardown are reset in the success path, the reject path, the reporter-failure path and the error path. `runPartial` does the same and avoids `.finally()` for old runtimes. A second call while one runs fails with a clear message. Tests check that cleanup happens before the user's callback, for callbacks and promises.

## Evidence

- `lib/core/public/run.js:48-49 @ e80f6b7` and `lib/core/public/run.js:57-58 @ e80f6b7` — reset on success and failure
- `lib/core/public/run-rules.js:84-90 @ e80f6b7` — reset on the error path
- `lib/core/public/run-partial.js:50-57 @ e80f6b7` — same reset in the two-stage route
- `test/core/public/run.js:195-209 @ e80f6b7` — cleanup before callback is tested

## When to use it, and when not to

Use it for any tool that keeps state between runs: a CLI with temp files, a browser session, a panel in an extension. For a one-shot script that exits, the process end already cleans up, so this is less needed.

## Related

- [[Cleanup on every exit path]] — the idea behind it
- [[Exit codes]] — how a CLI tells its caller that a run failed
- [[axe-core-findings|Findings]]

## My insights
