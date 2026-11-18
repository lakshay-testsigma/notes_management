---
title: "GoogleChrome/lighthouse — pattern: fail-soft pipeline"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Fail-soft pipeline

## The problem

A run has many independent steps: gatherers, audits and metrics. If one throws, the whole run stops and the user gets nothing, even when 90 percent of the steps worked.

## What they do

Each layer catches its own failures and turns them into data. A failing audit becomes an "error" result with a message and stack, and the loop moves on. A failing gatherer is logged and the next gatherer still runs. On `NO_FCP`, `PAGE_HUNG` or `TARGET_CRASHED`, the error is returned and the trace is saved as `TraceError`. The run reports a typed `LighthouseError` code, so the report can say why. A failure that was already reported earlier is marked `expected` so it is not reported twice. Some results are "not applicable" and not failures, for example TBT in a simulated timespan.

## Evidence

- `core/runner.js:446-458 @ 3b399f6` — the catch that makes an error result
- `core/runner.js:395-420 @ 3b399f6` — a missing or errored artifact becomes a typed error
- `core/gather/runner-helpers.js:122-128 @ 3b399f6` — one gatherer fails, the next runs
- `core/gather/navigation-runner.js:95-108 @ 3b399f6` — page-load errors are returned, not thrown
- `core/audits/metrics/total-blocking-time.js:98-103 @ 3b399f6` — not applicable, score 1
- `core/scoring.js:24-26 @ 3b399f6` — a null score in a weighted audit makes the category null

## When to use it, and when not to

Use it for tools that process many independent inputs, like a triage CLI that reads three files. Do not hide failures: keep the message, the code and the stack in the result, and exit with a non-zero code when the user needs to know. Do not use it for steps where a later step cannot run without the earlier one.

## Related

- [[Fail-soft pipeline]] — the idea behind it
- [[Exit codes]] — how a CLI still signals that something failed
- [[lighthouse-findings|Findings]]

## My insights
