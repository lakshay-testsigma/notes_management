---
title: "ChromeDevTools/devtools-frontend — pattern: Fail-soft parsing"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# Pattern: Fail-soft parsing

## The problem

Real data is messy. If one bad field stops everything, the user sees nothing. If an error is thrown across an async call, a waiting caller can hang.

## What they do

They keep going and report. A source map that fails to parse leaves an empty mapping list and logs the error. A malformed range-mapping field never invalidates the map. Bad WebSocket frames in a HAR are skipped. A broken heap graph is repaired and each repair sends a problem report. In the protocol client, `send` returns `{result}` or `{error}`, and a closed session resolves every pending call with an error value. Expected error codes are kept out of the log.

## Evidence

- `front_end/core/sdk/SourceMap.ts:477-487 @ 572bfc0` — parse error caught, empty list kept
- `front_end/models/har/Importer.ts:199-211 @ 572bfc0` — bad WebSocket frames skipped
- `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2240-2270 @ 572bfc0` — unreachable nodes attached and reported
- `front_end/core/protocol_client/DevToolsCDPConnection.ts:84-96 @ 572bfc0` — pending calls resolved with an error
- `front_end/core/protocol_client/InspectorBackend.ts:708-716 @ 572bfc0` — ignored error codes

## When to use it, and when not to

Use it when partial output is more useful than none, as in a triage report. Always make the loss visible (a log line, a warning in the report). Do not use it where wrong output is worse than no output; the HAR import still throws on a bad date or a missing `entries` array.

## Related

- [[Fail-soft pipeline]] — keep going and record what failed
- [[Exit codes]] — a CLI should still signal the failure
- [[devtools-frontend-findings|Findings]]

## My insights
