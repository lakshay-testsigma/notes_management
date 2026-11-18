---
title: "nodejs/undici — technologies and services"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---


# nodejs/undici — technologies and services

Coverage: the six analyzed slices only (see [[undici-architecture|architecture]], "Not analyzed"). Vendored parser code and `docs/` were not read.

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Node.js]] | Runtime and host. Undici uses `node:tls`, `node:net`, `node:http2`, `node:zlib` and `node:stream`; it needs Node.js 22.19 or newer | `lib/core/connect.js:81 @ 011d947`, `lib/dispatcher/client-h2.js:77-81 @ 011d947`, `package.json:137-139 @ 011d947` |
| [[TypeScript]] | Type definitions for the public API, checked with `tsd` and `tsc` | `package.json:96 @ 011d947` |
| [[llhttp]] | WebAssembly build of the HTTP/1 parser (a Milo parser is an alternative, chosen per client) | `lib/dispatcher/client-h1.js:913-915 @ 011d947`, `package.json:66-68 @ 011d947` |
| [[Zstandard]] | Compresses stored cache bodies and decodes `Content-Encoding: zstd`; the decode window is capped | `lib/cache/sqlite-cache-store.js:21 @ 011d947`, `lib/interceptor/decompress.js:317-326 @ 011d947` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[SQLite]] (`node:sqlite`) | Optional persistent cache store, loaded lazily | `lib/cache/sqlite-cache-store.js:149-152 @ 011d947` |
| [[esbuild]] | Bundles `undici-fetch.js` | `package.json:65 @ 011d947` |
| [[ESLint]] | Lint with a rule that bans the global `fetch` family inside the library | `eslint.config.js:3-4,36-43 @ 011d947` |
| [[Husky]] | Git hooks on `prepare` | `package.json:111 @ 011d947` |

## Data stores, queues, and external services

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| In-memory `Map` store | Default cache store: 1024 entries, 100 MB total, 5 MB per entry | `lib/cache/memory-cache-store.js:19-21 @ 011d947` |
| [[SQLite]] file | Persistent cache; WAL journal, zstd bodies | `lib/cache/sqlite-cache-store.js:155-158 @ 011d947` |
| [[npm]] registry | Publish target for `undici` and `undici-types` | `.github/workflows/release.yml:80-91 @ 011d947` |
| nodejs.org release index | The shared-Node.js job finds and downloads Node.js source | `.github/workflows/ci.yml:120,127 @ 011d947` |
| HackerOne and GitHub Security Advisories | Channels for vulnerability reports | `SECURITY.md:5-7 @ 011d947` |

No network service is called by the library code of the analyzed slices. The `cache-semantics` and `fetch-and-compression` notes found none.

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[GitHub Actions]] | All CI and release jobs; 12-way test matrix | `.github/workflows/ci.yml:56-69 @ 011d947` |
| [[borp]] | Main test runner, one script per suite | `package.json:76-87 @ 011d947` |
| [[Jest]] | Second runner for `test/jest` | `package.json:90,149-153 @ 011d947` |
| [[c8]] and [[Codecov]] | Coverage and upload, from Ubuntu only | `.github/workflows/nodejs.yml:202-211 @ 011d947` |
| [[fast-check]] | Property-based fuzzing | `package.json:126 @ 011d947` |
| [[Web Platform Tests]] | Shared standard tests for fetch and others | `package.json:101-102 @ 011d947` |
| [[HTTP cache conformance suite]] | External cache rule tests, a git submodule, run for shared and private caches and each store | `.gitmodules:4-6 @ 011d947`, `test/cache-interceptor/cache-tests.mjs:122-152 @ 011d947` |
| [[Autobahn test suite]] | WebSocket conformance (outside the analyzed topic) | `package.json:99-100 @ 011d947` |
| [[Sinon]] (`@sinonjs/fake-timers`) | Fake clock for stale-entry tests | `test/cache-interceptor/cache-store-test-utils.js:151 @ 011d947` |
| [[Git]] submodule | Brings in the cache conformance suite | `.gitmodules:4-6 @ 011d947` |
| [[Dependabot]] | Update pull requests that auto-merge when CI is green | `.github/dependabot.yml:1-30 @ 011d947`, `.github/workflows/ci.yml:310-329 @ 011d947` |
| [[Docker]] | Builds llhttp; watched by Dependabot | `package.json:67 @ 011d947`, `.github/dependabot.yml:27-30 @ 011d947` |
| ccache and ninja | Faster builds of Node.js from source in CI | `.github/workflows/ci.yml:129-135 @ 011d947` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| `diagnostics_channel` | Events `beforeConnect`, `connected`, `connectError` for observers | `lib/dispatcher/client.js:512-530 @ 011d947` |
| [[CodeQL]] | Static scan on push, pull request and weekly | `.github/workflows/codeql.yml:14-21,37-38 @ 011d947` |
| [[OpenSSF Scorecard]] | Weekly supply-chain score | `.github/workflows/scorecard.yml:37-41 @ 011d947` |
| [[Harden-Runner]] | Audit of network egress in some CI jobs | `.github/workflows/ci.yml:20-23 @ 011d947` |
| Dependency review action | Checks new dependencies on pull requests | `.github/workflows/ci.yml:30-31 @ 011d947` |

## My insights
