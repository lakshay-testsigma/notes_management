---
title: "ChromeDevTools/devtools-frontend — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — technologies and services

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[TypeScript]] | All studied code is typed TypeScript, including generated protocol typings | `package.json:86 @ 572bfc0`, `front_end/core/protocol_client/CDPConnection.ts:5 @ 572bfc0` |
| [[V8]] | Supplies the raw `sourceMappingURL` and the heap snapshot that the Memory panel reads | `front_end/core/sdk/SourceMapManager.ts:286 @ 572bfc0`, `front_end/core/sdk/HeapProfilerModel.ts:99 @ 572bfc0` |
| [[Web Workers]] | Run the heap graph work off the main thread, with a second worker for dominators | `front_end/models/heap_snapshot/HeapSnapshotProxy.ts:32 @ 572bfc0`, `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:882-893 @ 572bfc0` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Chrome DevTools Protocol]] | The JSON wire format between DevTools and the browser | `front_end/core/protocol_client/CDPConnection.ts:13-31 @ 572bfc0` |
| [[WebSocket]] | Transport for remote debugging when the page URL has a `ws` parameter | `front_end/core/sdk/Connections.ts:99 @ 572bfc0`, `front_end/core/sdk/Connections.ts:235-240 @ 572bfc0` |
| [[Puppeteer]] | Alternative connection source; imported as types only so the bundle stays small | `front_end/core/protocol_client/PuppeteerDevToolsConnection.ts:5-13 @ 572bfc0` |
| [[Source maps]] (Source Map V3 and range-mappings proposal) | The format the source-map module parses | `front_end/core/sdk/SourceMap.ts:21-30 @ 572bfc0` |
| [[HAR file]] (HAR 1.2) | The format the har module reads and writes | `front_end/models/har/Log.ts:5 @ 572bfc0`, `front_end/models/har/Log.ts:32 @ 572bfc0` |
| [[Dominator tree]] (Lengauer-Tarjan algorithm) | Gives retained size in one pass | `front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts:2127-2129 @ 572bfc0` |

## Data stores, queues, and external services

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Cache API]] | Saves parsed source maps by Debug ID; a `Map` replaces it when the host has none | `front_end/core/sdk/SourceMapCache.ts:13-17 @ 572bfc0`, `front_end/core/sdk/SourceMapCache.ts:74-90 @ 572bfc0` |

No database, queue, or cloud service appears in the studied slices. The browser being inspected is the only peer.

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[GN and gclient]] | Build files and pinned dependency fetching | `DEPS:7 @ 572bfc0`, `DEPS:33 @ 572bfc0` |
| [[Mocha]] | Test framework (`describe`/`it`) with tests beside the source | `package.json:68 @ 572bfc0`, `front_end/models/har/Writer.test.ts:27 @ 572bfc0` |
| [[Karma]] | Runs tests in a browser | `package.json:76 @ 572bfc0` |
| [[Chai]] | Assertions in tests | `front_end/core/sdk/SourceMapCache.test.ts:5 @ 572bfc0` |
| [[Sinon]] | Stubs for dispatch tests | `front_end/core/protocol_client/InspectorBackend.test.ts:5-6 @ 572bfc0` |
| [[ESLint]] | Lint | `package.json:59 @ 572bfc0` |
| [[GitHub Actions]] | A workflow publishes to npm on version tags | `.github/workflows/publish-to-npm-on-tag.yml:3-6 @ 572bfc0` |
| [[npm]] | Package name `chrome-devtools-frontend` and the publish target | `package.json:14 @ 572bfc0` |

## Observability and security tooling

No scanner, fuzzer, or metrics service was seen in the studied slices. Security lives in code: the sanitize option in HAR export (`front_end/models/har/Log.ts:139-148 @ 572bfc0`) and the origin-keyed cache (`front_end/core/sdk/SourceMapCache.ts:33-35 @ 572bfc0`). The protocol monitor reads raw traffic through `DebuggableCDPConnection` (`front_end/core/protocol_client/CDPConnection.ts:81-92 @ 572bfc0`).

## My insights
