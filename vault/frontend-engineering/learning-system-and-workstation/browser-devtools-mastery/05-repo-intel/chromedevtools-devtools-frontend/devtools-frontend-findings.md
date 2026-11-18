---
title: "ChromeDevTools/devtools-frontend — findings"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — findings

What the DevTools code does beyond the textbook version of each feature, ranked by how much a beginner gains from knowing it. Findings about DevTools features rank above general engineering hygiene.

## 1. HAR timing phases are computed, with fallbacks

- Textbook version: copy start and end times of DNS, connect, send, wait and receive into the file.
- What they do: each phase starts at `-1` (not applicable) or `0`. Queue is the gap from issue to start. Blocked, DNS, connect, SSL and send come from end minus start. SSL is inside connect, so it is not counted twice. The total sums only non-negative phases. With no response, all time goes to blocked.
- Why: comments name legacy rules and a QUIC bug that reports a send start before connection end.
- Evidence: `front_end/models/har/Log.ts:265-353 @ 572bfc0`, `front_end/models/har/Log.ts:333-337 @ 572bfc0`, `front_end/models/har/Log.test.ts:205-218 @ 572bfc0`
- Borrow it when: you turn raw timestamps into a waterfall or a budget check, as the capstone does.
- More: [[devtools-frontend-module-har|har]], [[devtools-frontend-pattern-derived-data-with-unknowns|derived data pattern]]

## 2. A HAR import treats the file as untrusted

- Textbook version: `JSON.parse` and read the fields.
- What they do: every HAR class rejects non-objects. `safeDate` and `safeNumber` throw on bad data. Malformed custom fields become `undefined`. Priorities must be real protocol values. Negative sizes become 0. URLs from initiators stay inert text.
- Why: HAR files come from other people, usually in bug reports.
- Evidence: `front_end/models/har/HARFormat.ts:13-34 @ 572bfc0`, `front_end/models/har/Importer.ts:185-195 @ 572bfc0`, `front_end/models/har/Importer.ts:115-123 @ 572bfc0`, `front_end/models/har/Importer.test.ts:659-670 @ 572bfc0`
- Borrow it when: your tool reads a file you did not create.
- More: [[devtools-frontend-module-har|har]], [[devtools-frontend-pattern-untrusted-input|untrusted input pattern]]

## 3. Retained size comes from a dominator tree

- Textbook version: retained size is everything reachable from a node, found by a walk per node.
- What they do: build the dominator tree once (Lengauer-Tarjan), then add sizes up the tree in one pass. Only "essential" edges count: weak edges, self edges, WeakMap table edges and some debugger edges are dropped.
- Why: one linear sum replaces a walk per node; the edge filter gives more useful owners.
- Evidence: `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2127-2129 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2329-2339 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2046-2089 @ 572bfc0`
- Borrow it when: you must rank objects by what they keep alive.
- More: [[devtools-frontend-module-heap-snapshot|heap-snapshot]]

## 4. Detached DOM state is propagated through the graph

- Textbook version: "detached" is a flag read from the node.
- What they do: V8 marks only some native nodes. A worklist pass spreads "attached", then "detached", and prefixes names with `Detached `. It stops at JavaScript nodes. Old snapshots fall back to the name prefix.
- Why: each embedder entry point knows only its own state.
- Evidence: `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:3053-3065 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:3136-3159 @ 572bfc0`, `front_end/models/heap_snapshot/HeapSnapshotModel.ts:347-350 @ 572bfc0`
- Borrow it when: a flag is known for some items and must be inferred for the rest.
- More: [[devtools-frontend-module-heap-snapshot|heap-snapshot]]

## 5. Sanitized HAR export removes secrets

- Textbook version: export everything and warn the user.
- What they do: with `sanitize: true`, cookies are emptied, `set-cookie`, `authorization` and `cookie` headers are removed, and event-stream message data is dropped. Import knows data may be missing.
- Why: HAR files are shared in bug reports.
- Evidence: `front_end/models/har/Log.ts:139-148 @ 572bfc0`, `front_end/models/har/Log.ts:190-193 @ 572bfc0`, `front_end/models/har/Importer.ts:147 @ 572bfc0`, `front_end/models/har/Log.test.ts:144 @ 572bfc0`
- Borrow it when: your report quotes request data.
- More: [[devtools-frontend-module-har|har]]

## 6. Source maps are parsed lazily and decoded strictly

- Textbook version: parse the whole map when it loads.
- What they do: the constructor reads only `sources`. The `mappings` string is decoded at the first lookup, and the raw JSON is dropped afterwards. A second decoder rejects numbers over 32 bits and truncated or non-Base64 input. Lookups use binary search.
- Why: big bundles have huge maps that are often never queried; the limit stops corrupt input (the memory reason is inferred).
- Evidence: `front_end/core/sdk/SourceMap.ts:188 @ 572bfc0`, `front_end/core/sdk/SourceMap.ts:472-496 @ 572bfc0`, `front_end/core/sdk/SourceMap.ts:984-1012 @ 572bfc0`, `front_end/core/sdk/SourceMap.ts:273-282 @ 572bfc0`
- Borrow it when: you handle large files that may not be used.
- More: [[devtools-frontend-module-source-map|source-map]], [[devtools-frontend-pattern-lazy-and-off-thread-work|lazy pattern]]

## 7. The ignore list can start inside the map

- Textbook version: the user lists files to skip in settings.
- What they do: the map's `ignoreList` becomes a hint per source. The older `x_google_ignoreList` is read only when `ignoreList` is absent. `findRanges` converts matching sources to generated-code ranges.
- Why: build tools know which files are vendor code.
- Evidence: `front_end/core/sdk/SourceMap.ts:551 @ 572bfc0`, `front_end/core/sdk/SourceMap.ts:572 @ 572bfc0`, `front_end/core/sdk/SourceMap.ts:824-857 @ 572bfc0`, `front_end/core/sdk/SourceMap.test.ts:961 @ 572bfc0`
- Borrow it when: a tool can learn a setting from the artifact itself.
- More: [[devtools-frontend-module-source-map|source-map]]

## 8. Chrome-only HAR data rides in underscore fields

- Textbook version: write only the spec fields.
- What they do: HAR 1.2 allows custom fields that start with an underscore. Export adds `_initiator`, `_priority`, `_resourceType`, `_fromCache` and more. Import reads them back with defensive helpers.
- Why: other tools can still read the file; a DevTools round trip loses little.
- Evidence: `front_end/models/har/Log.ts:123-137 @ 572bfc0`, `front_end/models/har/Log.ts:150-199 @ 572bfc0`, `front_end/models/har/HARFormat.ts:44-70 @ 572bfc0`
- Borrow it when: you read HAR files from Chrome and need resource type or priority.
- More: [[devtools-frontend-module-har|har]]

## 9. The protocol client matches replies, checks sessions and fails pending calls

- Textbook version: open a WebSocket, send, and hope.
- What they do: each command gets an id and a stored promise. A reply is dropped if its session differs. When a session ends, every pending call resolves with `SESSION_NOT_FOUND`. Errors are values, and expected codes are not logged. Messages sent before the socket opens are queued. A failed connection mentions `--remote-allow-origins`.
- Why: panels await these promises, so a lost reply would freeze a panel. Remote debugging often fails on origin rules.
- Evidence: `front_end/core/protocol_client/DevToolsCDPConnection.ts:55-81 @ 572bfc0`, `front_end/core/protocol_client/DevToolsCDPConnection.ts:84-96 @ 572bfc0`, `front_end/core/protocol_client/DevToolsCDPConnection.ts:123-135 @ 572bfc0`, `front_end/core/sdk/Connections.ts:131-140 @ 572bfc0`, `front_end/core/sdk/Connections.ts:19-23 @ 572bfc0`
- Borrow it when: you build any request and reply protocol. Note there is no timeout on pending commands in the studied slice.
- More: [[devtools-frontend-module-cdp-client|cdp-client]], [[devtools-frontend-pattern-fail-soft-parsing|fail-soft pattern]]

## 10. Heavy graph work uses flat arrays, transfer and a second thread

- Textbook version: one object per node, one thread, recursive search.
- What they do: nodes and edges stay in typed arrays. Detachedness and class index share one slot. Retainer and dominator work runs in a second worker and returns buffers by transfer. DFS is iterative to avoid stack overflow. Broken graphs are repaired and reported, not fatal.
- Why: snapshots can hold millions of objects.
- Evidence: `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:900-904 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:1220-1221 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2163-2166 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2240-2270 @ 572bfc0`
- Borrow it when: data is too large for plain objects. A learning project rarely needs this.
- More: [[devtools-frontend-module-heap-snapshot|heap-snapshot]], [[devtools-frontend-pattern-lazy-and-off-thread-work|lazy and off-thread pattern]]

## My insights
