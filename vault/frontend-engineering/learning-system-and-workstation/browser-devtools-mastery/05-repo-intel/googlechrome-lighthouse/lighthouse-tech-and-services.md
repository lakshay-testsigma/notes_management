---
title: "GoogleChrome/lighthouse — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — technologies and services

Coverage: only the four analyzed slices under `core/` plus manifest lines the scout read. Build and CI tooling was not analyzed in depth.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Node.js]] | Runtime for the whole tool; Node 22.19 or newer | `package.json:13 @ 3b399f6` |
| [[TypeScript]] | Type checks through JSDoc `LH.*` types, with no compile step | `core/gather/base-gatherer.js:7-14 @ 3b399f6` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Puppeteer]] | Gives the browser connection and CDP session (`puppeteer-core`) | `core/gather/navigation-runner.js:7 @ 3b399f6`, `core/gather/navigation-runner.js:282 @ 3b399f6` |
| [[Chrome DevTools Protocol]] | The wire protocol: `Network.enable`, `Target.setAutoAttach`, `Tracing.start`, `IO.read` | `core/gather/driver/target-manager.js:161-167 @ 3b399f6`, `core/gather/gatherers/trace.js:154-159 @ 3b399f6` |
| [[Perfetto]] | The trace stream shape that the incremental parser relies on | `core/gather/gatherers/trace.js:94-97 @ 3b399f6` |
| [[Lantern]] | In-repo simulation that predicts metrics for slower devices | `core/computed/metrics/lantern-metric.js:7 @ 3b399f6` |
| [[axe-core]] | Accessibility rules; its impact levels set audit weights | `core/config/default-config.js:483-499 @ 3b399f6` |
| `@paulirish/trace_engine` | Shared trace parser run next to the CLS code to check it | `core/computed/metrics/cumulative-layout-shift.js:162 @ 3b399f6` |
| ICU message formatting | Localizes titles and values | `core/runner.js:14 @ 3b399f6`, `core/runner.js:151 @ 3b399f6` |
| Node `EventEmitter` | Base of the session, target manager, network monitor and recorder | `core/gather/session.js:7 @ 3b399f6`, `core/lib/network-recorder.js:7 @ 3b399f6` |

## Data stores, queues, and external services

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[HTTP Archive]] | Source of the percentiles behind score curves (named in comments only; the tool does not call it) | `core/audits/metrics/largest-contentful-paint.js:41-42 @ 3b399f6` |

There is no database or queue. Artifacts and results are local files (`core/runner.js:206-209 @ 3b399f6`).

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Mocha]] | Test runner style (`describe` and `it`), with fake timers and Jest-style `expect` | `package.json:55 @ 3b399f6`, `core/test/gather/gatherers/trace-test.js:7-11 @ 3b399f6`, `core/test/computed/metrics/total-blocking-time-test.js:19 @ 3b399f6` |
| [[GitHub Actions]] | CI, including a smoke workflow (read by the scout only) | `.github/workflows/smoke.yml:1 @ 3b399f6` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Sentry]] | Reports failing gatherers, audits, fatal runner errors and CLS engine mismatches | `core/gather/runner-helpers.js:123 @ 3b399f6`, `core/runner.js:452 @ 3b399f6`, `core/computed/metrics/cumulative-layout-shift.js:223 @ 3b399f6` |

Security tooling was not a focus of the analyzed slices.

## My insights
