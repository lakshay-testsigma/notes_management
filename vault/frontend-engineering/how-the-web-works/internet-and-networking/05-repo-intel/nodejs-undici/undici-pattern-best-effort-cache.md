---
title: "nodejs/undici — pattern: best-effort cache"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# Pattern: Best-effort cache

## The problem

A cache is an optimisation. If it fails, a correct system still works, only slower. A cache that throws on a full disk, a locked database or an old table format turns a speed-up into an outage.

## What they do

Cache errors become cache misses. A failing store deletes the entry but does not break the caller's response. Store deletes never throw into the request path. `SQLITE_BUSY` and `LOCKED` are swallowed. A new table format gets a new name, so old rows are ignored. Oversize bodies are not stored. A body is streamed into the store with backpressure, and the caller reads the other copy.

## Evidence

- `lib/handler/cache-handler.js:695-735 @ 011d947` — body teed to caller and store, with pause on a full buffer.
- `lib/interceptor/cache.js:170-176 @ 011d947` — deletes never throw into the request.
- `lib/interceptor/cache.js:736-757 @ 011d947` — rejected store promises go to `onResponseError`.
- `lib/cache/sqlite-cache-store.js:425-435 @ 011d947` — busy and locked errors swallowed.
- `lib/cache/sqlite-cache-store.js:10-11 @ 011d947` — table name carries `VERSION = 5`.
- `test/cache-interceptor/sqlite-cache-store-tests.js:504-557 @ 011d947` — a second connection holds a write lock; `set`, `get` and `delete` must not throw.
- `test/cache-interceptor/sqlite-cache-store-tests.js:14-43 @ 011d947` — an old-format row is not returned.

## When to use it, and when not to

Use it for any layer that exists only for speed: caches, metrics, logging. Do not use it where the data is the product, such as a primary database. Keep a counter or an event (undici emits `maxSizeExceeded`, `lib/cache/memory-cache-store.js:200-205 @ 011d947`) so silent misses stay visible.

## Related

- [[Fail-soft pipeline]] — the same idea for a report tool: one bad part does not stop the run.
- [[HTTP caching]] — the rules this store serves.
- [[undici-findings|Findings]]

## My insights
