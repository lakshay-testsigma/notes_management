---
title: "ChromeDevTools/devtools-frontend — pattern: Derived data with unknowns"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: Derived data with unknowns

## The problem

Raw measurements do not match the form users need. A waterfall needs phases, and a memory view needs retained sizes. If a missing value is stored as zero, it looks like a fast phase. If a total is recomputed in many places, the copies drift.

## What they do

They compute the derived value in one place and keep "unknown" separate from zero. HAR phases start at `-1` for "not applicable" and the total counts only non-negative values. Import reverses the math so an imported waterfall matches the original. Retained size is computed once for all nodes from the dominator tree and then read from an array. Detached state is inferred for nodes that V8 did not mark.

## Evidence

- `front_end/models/har/Log.ts:265-353 @ 572bfc0` — phase computation with `-1` and clamps
- `front_end/models/har/Log.ts:96-101 @ 572bfc0` — total sums non-negative phases
- `front_end/models/har/Importer.ts:284-345 @ 572bfc0` — import rebuilds phases by adding them up
- `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2329-2339 @ 572bfc0` — retained size summed once
- `front_end/models/har/Log.test.ts:205-218 @ 572bfc0` — a test pins the no-response case

## When to use it, and when not to

Use it when one raw record feeds several reports or budgets: compute the numbers once and mark gaps explicitly. Do not copy the Chrome-specific fixes (legacy send rules, QUIC clamps) unless your input has those cases.

## Related

- [[Derived data]] — values computed from raw records
- [[Network waterfall]] — the phases being derived
- [[Dominator tree]] — how retained size is derived
- [[devtools-frontend-findings|Findings]]

## My insights
