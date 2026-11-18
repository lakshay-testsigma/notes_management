---
title: "jshttp/cookie — overview"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# jshttp/cookie — overview

## What it is

`cookie` is a small TypeScript library that reads and writes HTTP cookie headers for servers. It has four public functions: `parseCookie`, `stringifyCookie`, `parseSetCookie` and `stringifySetCookie` (`src/index.ts:112 @ a437ef0`, `src/index.ts:159 @ a437ef0`, `src/index.ts:286 @ a437ef0`, `src/index.ts:399 @ a437ef0`). The package description is "HTTP server cookie parsing and serialization" (`package.json:4 @ a437ef0`). All the logic sits in one 533-line file.

## Why this repository

It is a tier B source in `sources.json`: a small MIT-licensed library owned by the jshttp organization, listed as a dependency of Express. It is small enough to read in full, and it shows how the `Set-Cookie` attributes (Domain, Path, Max-Age, Secure, HttpOnly, SameSite, Partitioned) are validated in code. That is what the mini project 3 cookie-attribute linter and the capstone report must check.

## What was analyzed

- Repository: https://github.com/jshttp/cookie
- Commit: `a437ef03993af559900010f62c294647589c29db` (short `a437ef0`), cloned 2026-11-18
- License: MIT (`LICENSE:1 @ a437ef0`, `package.json:14 @ a437ef0`)
- Size: 27 tracked files; 4 slices analyzed, listed in the slice plan

## Stack

- Language: TypeScript, published as ES modules (`package.json:20 @ a437ef0`), Node 22 or newer (`package.json:46 @ a437ef0`)
- Tests and benchmarks: vitest (`package.json:43 @ a437ef0`)
- Size guard: `size-limit` with a 1.4 KB cap on `dist/index.js` (`package.json:51 @ a437ef0`)
- CI: GitHub Actions, Node 22 and latest (`.github/workflows/ci.yml:18 @ a437ef0`)
- No runtime dependencies: `package.json` lists only `devDependencies` (`package.json:35 @ a437ef0`)

## My insights
