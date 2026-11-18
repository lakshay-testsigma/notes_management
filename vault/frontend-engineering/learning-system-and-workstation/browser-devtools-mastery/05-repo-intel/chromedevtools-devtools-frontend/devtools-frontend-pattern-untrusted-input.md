---
title: "ChromeDevTools/devtools-frontend — pattern: Untrusted input"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: Untrusted input

## The problem

A HAR file, a source map or a heap snapshot is written by another tool or another person. If your code trusts its shape, one bad number or missing array can crash the tool or show wrong results. A decoder with no limits can also loop on hostile data.

## What they do

Each importer checks shape and limits at the edge. HAR classes reject non-objects, and `safeDate` and `safeNumber` throw on bad values. Enum-like fields are accepted only from a fixed set. The unsigned VLQ decoder refuses numbers over 32 bits and truncated input. The heap loader throws named errors for a missing token or truncated JSON. The protocol client drops replies with unknown ids or wrong sessions.

## Evidence

- `front_end/models/har/HARFormat.ts:13-34 @ 572bfc0` — base class rejects non-objects and converts dates and numbers safely
- `front_end/models/har/Importer.ts:185-195 @ 572bfc0` — only a real protocol priority is accepted
- `front_end/core/sdk/SourceMap.ts:984-1012 @ 572bfc0` — 32-bit limit, truncation and character checks
- `front_end/entrypoints/heap_snapshot_worker/HeapSnapshotLoader.ts:121 @ 572bfc0` — loader error on incomplete input
- `front_end/core/protocol_client/DevToolsCDPConnection.ts:123-135 @ 572bfc0` — foreign replies ignored

## When to use it, and when not to

Use it for every file or message that crosses your program edge. Do not repeat the same checks deep inside code that only sees already-checked data. Note that the `ws` value in the connection code is used without validation in that file (`front_end/core/sdk/Connections.ts:235-238 @ 572bfc0`), so the browser's origin rule is the real guard there.

## Related

- [[Untrusted input]] — why outside data needs checks
- [[Schema validation]] — one way to check shape
- [[devtools-frontend-findings|Findings]]

## My insights
