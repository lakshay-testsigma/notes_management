---
title: "nodejs/undici — overview"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# nodejs/undici — overview

## What it is

Undici is the HTTP client for Node.js. The package describes itself as an HTTP/1.1 client written from scratch (`package.json:4 @ 011d947`). It also speaks HTTP/2 through a separate client file that loads `node:http2` (`lib/dispatcher/client-h2.js:77 @ 011d947`). It ships the fetch API, a cookie parser, and an HTTP cache layer. One codebase therefore shows how messages, versions, caching and cookies work in real code.

## Why this repository

The source entry says it powers the built-in `fetch()` of Node.js, is owned by the nodejs organization, and has about 7.7k stars (source `nodejs-undici-repo`, tier A). For the capstone it is a reference for HTTP caching rules (Cache-Control, validators, Vary), HTTP/1.1 versus HTTP/2 negotiation, compression and cookies, all in plain JavaScript.

## What was analyzed

- Repository: https://github.com/nodejs/undici
- Commit: `011d947edad2eb7c08371a91ceb23ed7549601ee` (short `011d947`), cloned 2026-11-18
- License: MIT (`package.json:13 @ 011d947`)
- Size: 906 tracked files; 6 slices planned (cache-semantics, cache-tests, http-versions-dispatcher, fetch-and-compression, cookies, build-and-infra), listed in the slice plan
- Skipped: websocket, eventsource, webidl, vendored parser code, mocks, proxies and most of the test tree

## Stack

- Language: JavaScript for Node.js, with TypeScript type definitions checked by `tsd` and `tsc` (`package.json:96 @ 011d947`).
- Test runner: `borp`, with separate scripts for fetch, cache, cookies and HTTP/2 (`package.json:77-87 @ 011d947`). `jest` also runs (`package.json:90 @ 011d947`).
- Cache storage: an in-memory store and a SQLite store typed against `node:sqlite` (`lib/cache/sqlite-cache-store.js:62 @ 011d947`).
- CI: GitHub Actions with a Node.js version matrix of 22, 24, 25 and 26 (`.github/workflows/ci.yml:62 @ 011d947`), plus CodeQL and Scorecard workflows (`.github/workflows/codeql.yml:1 @ 011d947`).
- HTTP/1 parser: a WebAssembly build of llhttp, produced by a build script (`package.json:68 @ 011d947`).

## My insights
