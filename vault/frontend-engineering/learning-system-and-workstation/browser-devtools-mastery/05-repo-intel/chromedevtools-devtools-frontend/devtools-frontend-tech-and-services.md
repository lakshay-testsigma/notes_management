---
title: "ChromeDevTools/devtools-frontend — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — technologies and services

Coverage: the four analyzed slices plus the manifest lines named in the overview. The build, CI and deployment files were not read, so this list is not a full inventory of the repository.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[TypeScript]] | The whole app is typed, with types generated from the protocol so wrong calls fail at compile time | `package.json:36 @ 92a1ec4`, `front_end/core/protocol_client/CDPConnection.ts:5-11 @ 92a1ec4` |
| [[V8]] | The engine whose step-over skip list receives source map ranges | `front_end/core/sdk/SourceMap.ts:438 @ 92a1ec4` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Chrome DevTools Protocol]] | The JSON command, reply and event format between the UI and the browser | `front_end/core/protocol_client/CDPConnection.ts:13-31 @ 92a1ec4` |
| [[Lantern]] | In-repo simulator that estimates metrics under throttling | `front_end/models/trace/Processor.ts:8 @ 92a1ec4` |
| [[Lighthouse]] | Its scoring curve weighs insights by effect on Core Web Vitals | `front_end/models/trace/Processor.ts:378-382 @ 92a1ec4` |
| Source map format v3 (see [[Source map]], [[Base64 VLQ]]) | How built code maps to original code; plus range-mapping and scopes proposals | `front_end/core/sdk/SourceMap.ts:107 @ 92a1ec4`, `front_end/core/sdk/SourceMap.ts:653-657 @ 92a1ec4` |
| DOM `EventTarget` and `Common.ObjectWrapper` | Progress events and request events without an extra library | `front_end/models/trace/Processor.ts:20-28 @ 92a1ec4`, `front_end/models/network_time_calculator/NetworkTimeCalculator.ts:92-95 @ 92a1ec4` |

## Data stores, queues, and external services

None: this repository is a user interface. It reads data from the browser it inspects and fetches source maps through its own `PageResourceLoader` (`front_end/core/sdk/SourceMapManager.ts:137-145 @ 92a1ec4`). A source map cache is used, keyed by debug ID and origins (`front_end/core/sdk/SourceMapManager.ts:252-266 @ 92a1ec4`). The Chromium `crdtp` dispatcher is the C++ source of the error codes (`front_end/core/protocol_client/CDPConnection.ts:34 @ 92a1ec4`).

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[esbuild]] | Bundler; the build itself runs through GN and `vpython3` wrappers | `package.json:58 @ 92a1ec4`, `package.json:21 @ 92a1ec4` |
| [[Mocha]] | Test runner for the `*.test.ts` files | `package.json:68-76 @ 92a1ec4`, `front_end/core/protocol_client/InspectorBackend.test.ts:5-6 @ 92a1ec4` |
| [[Karma]] | Runs the tests in a real Chrome | `package.json:68-76 @ 92a1ec4` |
| [[sinon]] | Spies and stubs, for example for the static log methods | `front_end/models/trace/Processor.test.ts:195 @ 92a1ec4` |
| [[Puppeteer]] (`puppeteer-core`) | Browser automation in tests | `package.json:79 @ 92a1ec4` |
| Gzipped JSON trace fixtures | Recorded traces make parser tests repeatable | `front_end/models/trace/Processor.test.ts:95 @ 92a1ec4` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[ESLint]] with custom plugins | Lint rules for the code base | `package.json:64 @ 92a1ec4` |
| Protocol test hooks (`dumpProtocol`, `onMessageSent`) | Let tests and the protocol monitor see traffic | `front_end/core/protocol_client/InspectorBackend.ts:149-184 @ 92a1ec4` |

## My insights
