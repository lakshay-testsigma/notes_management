---
title: "jshttp/cookie — technologies and services"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# jshttp/cookie — technologies and services

## Languages and runtimes

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[TypeScript]] | Types for `ParseOptions`, `SetCookie` and `Cookies`; compiled to `dist/` | `src/index.ts:85 @ a437ef0`, `package.json:42 @ a437ef0` |
| [[Node.js]] | Runtime; Node 22 or newer is declared in `engines` | `package.json:45-47 @ a437ef0` |

## Libraries and frameworks

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[Vitest]] | Spec tests, snapshots, coverage and benchmarks | `src/parse-cookie.spec.ts:1 @ a437ef0`, `package.json:43 @ a437ef0` |
| [[size-limit]] | Fails the test run when `dist/index.js` passes 1.4 KB | `package.json:33 @ a437ef0`, `package.json:48-53 @ a437ef0` |

The library has no runtime dependency (`package.json:35 @ a437ef0`). The built-in `decodeURIComponent` and `encodeURIComponent` do the value codec (`src/index.ts:522 @ a437ef0`, `src/index.ts:532 @ a437ef0`).

## Data stores, queues, and external services

None: this repository is a pure string library. Only the maintainer script `scripts/update-benchmark.ts` fetches live sites, using the `top-sites` list (`scripts/update-benchmark.ts:3 @ a437ef0`, `package.json:41 @ a437ef0`). [[Codecov]] receives coverage reports from CI through a secret token (`.github/workflows/ci.yml:28-31 @ a437ef0`).

## Build, test, and delivery

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[npm]] | Install with `npm ci`, publish the package | `.github/workflows/release.yml:26-28 @ a437ef0` |
| [[GitHub Actions]] | CI on Node 22 and latest, release on a version tag | `.github/workflows/ci.yml:18-27 @ a437ef0`, `.github/workflows/release.yml:3-6 @ a437ef0` |
| [[npm trusted publishing]] | Publish with an OIDC identity and no stored token | `.github/workflows/release.yml:9 @ a437ef0` |

## Observability and security tooling

| Technology | Why it is used here | Evidence |
|------------|---------------------|----------|
| [[CodeQL]] | Static scan of JavaScript and TypeScript on pushes, pull requests and weekly | `.github/workflows/codeql.yml:14-21 @ a437ef0` |
| [[OpenSSF Scorecard]] | Weekly supply-chain score, results uploaded to code scanning | `.github/workflows/scorecards.yml:39-44 @ a437ef0` |

## My insights
