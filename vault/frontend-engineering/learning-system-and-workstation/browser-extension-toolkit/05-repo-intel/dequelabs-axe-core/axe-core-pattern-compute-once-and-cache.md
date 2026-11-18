---
title: "dequelabs/axe-core — pattern: Compute once, reuse many times"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# Pattern: Compute once, reuse many times

## The problem

A check that runs on every matched element can redo a full-page scan each time. With hundreds of elements the cost grows with the square of the page size.

## What they do

The first element builds the page-wide list (headings, or nodes outside landmarks) and stores it in a shared cache. Later elements return at once. Colour code memoizes the background on the virtual node and replays the incomplete reason. Reply handlers for frame messages live in a per-audit cache, so they vanish when the audit ends.

## Evidence

- `lib/checks/navigation/heading-order-evaluate.js:46-49 @ e80f6b7` — later headings find the cache
- `lib/checks/navigation/region-evaluate.js:15-17 @ e80f6b7` — same for the regionless nodes
- `lib/commons/color/get-background-color.js:30-47 @ e80f6b7` — per-node memoization
- `lib/core/utils/frame-messenger/channel-store.js:4-5 @ e80f6b7` — cache lifetime equals audit lifetime

## When to use it, and when not to

Use it when many items need the same expensive whole-page answer. Do not cache across runs unless the page cannot change: axe ties its caches to one audit so stale data cannot leak.

## Related

- [[Memoization]] — remember a result instead of recomputing it
- [[axe-core-findings|Findings]]

## My insights
