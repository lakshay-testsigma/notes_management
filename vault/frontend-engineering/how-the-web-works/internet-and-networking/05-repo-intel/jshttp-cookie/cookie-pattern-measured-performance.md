---
title: "jshttp/cookie — pattern: measured performance"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# Pattern: measured performance

## The problem

A small library can grow or slow down one pull request at a time, and no reviewer notices. Every app that uses it pays for the change.

## What they do

A size limit of 1.4 KB runs inside `npm test`, so a bigger build fails. Benchmarks exist for every public function, with worst-case input of 100,000 semicolons. A benchmark file holds eight versions of the trim function, so the choice is based on numbers. The release job runs the same tests before it publishes.

## Evidence

- `package.json:33 @ a437ef0` — `npm test` includes the size check.
- `package.json:48-53 @ a437ef0` — the size limit setting.
- `benchmarks/value-slice.bench.ts:42-177 @ a437ef0` — the candidate trim functions.
- `src/parse-cookie.bench.ts:37-40 @ a437ef0` — the 100,000 semicolon case.
- `.github/workflows/release.yml:26-28 @ a437ef0` — tests run before publish.

## When to use it, and when not to

Use it for a package or function that many users share. Skip it for a one-off script: a limit with no real user is only noise.

## Related

- [[Performance budget]] — a fixed limit that fails the build
- [[Supply-chain hardening]] — the other release-time guard in the same workflows
- [[cookie-findings|Findings]]

## My insights
