---
title: "ChromeDevTools/devtools-frontend — pattern: Lazy and off-thread work"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: Lazy and off-thread work

## The problem

Debug data is large: bundle maps, tens of megabytes of HAR, millions of heap objects. Doing all the work at load time freezes the page and wastes effort on data nobody opens.

## What they do

They delay, move or slice the work. The source-map constructor reads only `sources` and decodes `mappings` at the first lookup. A setting can delay the map download itself. The heap snapshot is parsed and analyzed in a Web Worker, with dominators in a second worker, and buffers move by transfer. HAR export builds entries in parallel, writes 100,000-character chunks, and checks for cancel between chunks.

## Evidence

- `front_end/core/sdk/SourceMap.ts:472-496 @ 572bfc0` — decode on first lookup, drop raw JSON
- `front_end/core/sdk/SourceMapManager.ts:176-181 @ 572bfc0` — lazy download behind a setting
- `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:882-893 @ 572bfc0` — second thread, transferred results
- `front_end/models/har/Writer.ts:132-136 @ 572bfc0` — chunked write with progress and cancel

## When to use it, and when not to

Use it when the data is large and often unused, or when a UI must stay responsive. Skip threads and typed arrays for small inputs: for a CLI that reads a few files, streaming a big file and parsing only the needed part is enough.

## Related

- [[Lazy evaluation]] — do the work at first need
- [[Web Workers]] — a second thread for heavy work
- [[devtools-frontend-findings|Findings]]

## My insights
