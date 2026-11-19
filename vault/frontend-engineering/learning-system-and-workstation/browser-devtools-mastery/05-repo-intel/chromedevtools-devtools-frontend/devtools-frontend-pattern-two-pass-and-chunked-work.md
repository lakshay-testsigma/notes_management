---
title: "ChromeDevTools/devtools-frontend — pattern: two-pass and chunked work"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: two-pass and chunked work

## The problem

A trace can hold a million events. One loop that both reads and joins them cannot join until every event is seen. A loop that runs for seconds freezes the page that shows the result, which is the failure a [[Long task]] describes.

## What they do

The trace processor reads in two passes ([[Two-pass processing]]). Pass one sends every event to every handler, and a handler only stores what it needs. Pass two calls `finalize`, when the whole trace is available, and the handler joins its pieces. Handlers declare dependencies and are sorted so each runs after the ones it needs; a cycle throws with the path. The loop yields to the browser with `setTimeout(0)` every 50,000 events, counted by events and not by clock because `performance.now()` is costly in a hot loop. Progress is weighted 25% for reading and 75% for finalizing, from measured time. A code comment reports a measured gain (about 2.9 s to 2.1 s on a 1M-event trace) from reading each `handleEvent` once before the loop. State lives in module variables, so a `finally` block resets it after success and after failure.

## Evidence

- `front_end/models/trace/Processor.ts:205-267 @ 92a1ec4` — sort, event loop, finalize and collect.
- `front_end/models/trace/Processor.ts:195-228 @ 92a1ec4` — yield every 50,000 events.
- `front_end/models/trace/Processor.ts:30-46 @ 92a1ec4` — weighted progress.
- `front_end/models/trace/Processor.ts:212-217 @ 92a1ec4` — measured micro-optimisation.
- `front_end/models/trace/Processor.ts:178-187 @ 92a1ec4` — reset in `finally`.
- `front_end/models/trace/Processor.test.ts:121-141 @ 92a1ec4` — a 106,110-event trace must give at least two progress updates.

## When to use it, and when not to

Use two passes when a result needs facts from later in the data, such as joining a request's start with its end. Use chunking for any heavy loop on a thread that also serves a UI. A headless script has no UI to freeze, so keep two passes but skip the yielding unless you stream live data.

## Related

- [[Two-pass processing]] — collect first, join second
- [[Long task]] — why one long loop hurts
- [[devtools-frontend-findings|Findings]]

## My insights
