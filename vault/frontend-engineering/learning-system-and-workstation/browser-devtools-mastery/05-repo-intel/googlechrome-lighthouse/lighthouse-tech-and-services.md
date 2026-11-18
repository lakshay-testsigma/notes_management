---
title: "GoogleChrome/lighthouse — technologies and services"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — technologies and services

Coverage: the four analyzed slices only (gather, metrics, audits and scoring, build and CI). Runtime dependencies come from `package.json`. Other first-party code and transitive packages are not covered.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Node.js]] | Runtime; the package needs Node 22.19 or newer, and CI tests Node 22.19, 24 and 26 | `package.json:12-14 @ 3b399f6`, `.github/workflows/unit.yml:23 @ 3b399f6` |
| [[TypeScript]] | Checks plain JavaScript through JSDoc types with `tsc --build`, with an opt-in list for test files | `tsconfig.json:13-22 @ 3b399f6`, `package.json:76 @ 3b399f6` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Puppeteer]] | `puppeteer-core` connects to Chrome on port 9222; it is stubbed out of bundles because the host gives the connection | `core/gather/navigation-runner.js:280-285 @ 3b399f6`, `build/build-bundle.js:104-112 @ 3b399f6` |
| [[Chrome DevTools Protocol]] | The command channel: `Tracing.start`, `Tracing.end`, `IO.read`, `IO.close` | `core/gather/gatherers/trace.js:151-159 @ 3b399f6`, `core/gather/gatherers/trace.js:88 @ 3b399f6` |
| [[chrome-launcher]] | Starts Chrome for the CLI | `package.json:157 @ 3b399f6` |
| [[Lantern]] | In-repo simulator that predicts throttled metrics and byte savings | `core/computed/metrics/lantern-metric.js:23-27 @ 3b399f6`, `core/audits/byte-efficiency/byte-efficiency-audit.js:10-12 @ 3b399f6` |
| [[axe-core]] | Accessibility engine; its version goes into the credits | `core/runner.js:72 @ 3b399f6`, `package.json:156 @ 3b399f6` |
| [[third-party-web]] | Script ownership data; emptied from the DevTools bundle because DevTools has its own copy | `package.json:158-170 @ 3b399f6`, `build/build-bundle.js:126-129 @ 3b399f6` |
| Trace engine (`@paulirish/trace_engine`) | Trace analysis, used when Lantern builds from the trace | `package.json:155 @ 3b399f6`, `core/computed/metrics/lantern-metric.js:40 @ 3b399f6` |
| Other runtime libraries | `speedline-core`, `lighthouse-stack-packs`, `robots-parser`, `csp_evaluator`, `intl-messageformat` | `package.json:158-170 @ 3b399f6` |
| Perfetto trace JSON | The trace format the reader parses | `core/gather/gatherers/trace.js:94-97 @ 3b399f6` |
| ICU message strings | Translated report text, swapped in by the runner | `core/runner.js:14 @ 3b399f6`, `core/runner.js:151 @ 3b399f6` |

## Data stores, queues, and external services

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[HTTP Archive]] | Real-world percentiles for scoring control points, named in comments (read through BigQuery) | `core/audits/metrics/largest-contentful-paint.js:40-48 @ 3b399f6`, `core/audits/byte-efficiency/total-byte-weight.js:50 @ 3b399f6` |
| [[Sentry]] | Error reports tagged with gatherer, phase or audit id; stubbed out of every bundle | `core/gather/runner-helpers.js:122-126 @ 3b399f6`, `core/runner.js:446-458 @ 3b399f6`, `build/build-bundle.js:110 @ 3b399f6` |
| npm registry and GitHub Releases | Delivery, with provenance | `.github/workflows/publish.yml:68-71 @ 3b399f6`, `.github/workflows/publish.yml:118 @ 3b399f6` |
| Firebase libraries, idb-keyval | Dev dependencies, probably for the web viewer; not confirmed in the slices | `package.json:104-105 @ 3b399f6`, `package.json:134 @ 3b399f6` |

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[esbuild]] | Bundles one minified `iife` per target | `package.json:127 @ 3b399f6`, `build/build-bundle.js:138-154 @ 3b399f6` |
| [[GitHub Actions]] | Five workflows: CI, unit, smoke, DevTools, publish; actions pinned by hash | `.github/workflows/ci.yml:31-34 @ 3b399f6` |
| [[Mocha]] | Test runner for unit tests, with testdouble, jsdom and preact testing library | `core/test/gather/gatherers/trace-test.js:11 @ 3b399f6`, `package.json:108 @ 3b399f6` |
| [[ESLint]] | Lints code; `zizmor` lints the workflows | `package.json:40-41 @ 3b399f6` |
| Yarn | Package manager; every workflow installs the same lockfile | `.github/workflows/unit.yml:23 @ 3b399f6` |
| `chrome-devtools-frontend`, depot_tools | Real DevTools is cloned and built with this Lighthouse inside it | `package.json:123 @ 3b399f6`, `.github/workflows/devtools.yml:79-85 @ 3b399f6` |
| protobuf 3.20 and Python | Round-trip check of the result JSON schema | `.github/workflows/unit.yml:47-60 @ 3b399f6` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Sentry]] | Runtime error reporting (above) | `core/runner.js:261-267 @ 3b399f6` |
| zizmor and npm provenance | Workflow linting and token-free publish with OIDC | `package.json:41 @ 3b399f6`, `.github/workflows/publish.yml:64-71 @ 3b399f6` |
| Codecov | Only named in a comment about coverage diffs | `.github/workflows/unit.yml:35 @ 3b399f6` |

## My insights
