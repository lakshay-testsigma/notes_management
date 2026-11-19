---
title: "ChromeDevTools/devtools-frontend — pattern: tolerate incomplete events"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: tolerate incomplete events

## The problem

A tool that watches a page does not always start before the page. Events can arrive late, twice, in a new order, or not at all. Code that assumes "request, then response, then finished" crashes on real pages, or invents numbers.

## What they do

Each handler checks that the earlier piece exists, and takes a safe path if it does not ([[Out-of-order events]]). `responseReceived` for an unknown request emits `RequestUpdateDropped` and carries on; the comment says "We missed the requestWillBeSent". `loadingFailed` for an unknown id returns quietly. The extra-info events (raw headers and cookies) can arrive before the main event, so they are paired by position, with `null` padding. Timing code skips ranges with an invalid start and ignores `-1` offsets, because the browser leaves unused fields at -1 or 0 ([[Request timing phases]]). The trace network handler drops requests with missing events and does not invent data. The trace window also drops a no-navigation set that has nothing to report.

## Evidence

- `front_end/core/sdk/NetworkManager.ts:1052-1118 @ 92a1ec4` — unknown-request paths for response, data and finish events.
- `front_end/core/sdk/NetworkManager.ts:2690-2735 @ 92a1ec4` — extra-info pairing with padding.
- `front_end/models/network_time_calculator/RequestTimeRanges.ts:51-174 @ 92a1ec4` — defensive phase building and a coarse fallback.
- `front_end/models/trace/handlers/NetworkRequestsHandler.ts:224-229 @ 92a1ec4` — incomplete requests are dropped.
- `front_end/core/sdk/NetworkManager.test.ts:222 @ 92a1ec4` — a test named "does nothing if no request exists".

## When to use it, and when not to

Use it whenever you read events from outside your control, which includes every CDP-driven inspector. Do not hide the gap: DevTools emits a "dropped" event so the missing data stays visible. Report incomplete requests as incomplete in your own output.

## Related

- [[Out-of-order events]] — why order and completeness cannot be assumed
- [[Request timing phases]] — the numbers that can be -1 or 0
- [[devtools-frontend-findings|Findings]]

## My insights
