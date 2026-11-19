---
title: "ChromeDevTools/devtools-frontend — pattern: failures as values"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: failures as values

## The problem

A call to the browser can fail in normal life: the tab closes, a worker disappears, a map file returns 404. If every failure throws, every caller needs a `try/catch`, and one missed handler breaks a whole panel. A promise whose page died can also wait forever.

## What they do

They turn failures into data at the edge of each module. The protocol client resolves each call to `{result}` or `{error}`, and adds `getError()`, so callers check one field ([[Errors as values]]). When a session ends, every pending call is resolved with a `SESSION_NOT_FOUND` error, and a call on a closed connection returns a "Connection is closed" error value at once. The source map manager's `tryLoadSourceMap` never throws: it logs and returns null. A bad source map becomes an empty map. The trace processor catches errors per insight and per Lantern run, and records them in `modelErrors`. Expected errors (page closed) are not logged, so logs stay useful ([[Partial failure]]).

## Evidence

- `front_end/core/protocol_client/InspectorBackend.ts:708-722 @ 92a1ec4` — agent wraps result and error with `getError`.
- `front_end/core/protocol_client/DevToolsCDPConnection.ts:84-96 @ 92a1ec4` — pending calls of a closed session are resolved.
- `front_end/core/protocol_client/InspectorBackend.ts:660-666 @ 92a1ec4` — a small set of error codes is not logged.
- `front_end/core/sdk/SourceMapManager.ts:273-281 @ 92a1ec4` — `tryLoadSourceMap` returns null instead of throwing.
- `front_end/core/sdk/SourceMap.ts:484-487 @ 92a1ec4` — parse error gives an empty map.
- `front_end/models/trace/Processor.ts:476-495 @ 92a1ec4` — each insight in its own try/catch.

## When to use it, and when not to

Use it at a boundary where failure is expected and the caller can carry on with less data, as a page inspector does when one request fails. Do not hide a failure you cannot recover from: the trace processor still rethrows a parse error after it sets its status to `ERRORED_WHILE_PARSING` (`front_end/models/trace/Processor.ts:175-177 @ 92a1ec4`).

## Related

- [[Errors as values]] — the idea behind it
- [[Partial failure]] — keep the good results when one part fails
- [[devtools-frontend-findings|Findings]]

## My insights
