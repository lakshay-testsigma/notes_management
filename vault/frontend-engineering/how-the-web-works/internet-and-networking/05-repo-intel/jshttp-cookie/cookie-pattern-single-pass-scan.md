---
title: "jshttp/cookie — pattern: single-pass scan"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# Pattern: single-pass scan

## The problem

Splitting a header into pieces, then splitting each piece, then trimming, makes many small arrays and strings. A server does this on every request.

## What they do

The parsers keep one `index` and use `indexOf` to find the next `=` and `;`. A hand-written `valueSlice` trims spaces and tabs by moving two indexes, then cuts one substring. The decoder and encoder skip the native call when the text has no special character.

## Evidence

- `src/index.ts:121-141 @ a437ef0` — the `parseCookie` loop.
- `src/index.ts:412-421 @ a437ef0` — the `parseSetCookie` segment loop.
- `src/index.ts:480-513 @ a437ef0` — `endIndex`, `eqIndex` and `valueSlice`.
- `src/index.ts:518-533 @ a437ef0` — fast paths in `defaultDecode` and `defaultEncode`.

## When to use it, and when not to

Use it on code that runs for every request and that a benchmark shows to be slow. Do not use it elsewhere: the code is harder to read, and `split` is clear. The module notes record no stated speed goal for the parsers, so the benchmark files are the proof of intent.

## Related

- [[Percent-encoding]] — the encoding that the fast paths skip when it is not needed
- [[cookie-pattern-measured-performance]]
- [[cookie-findings|Findings]]

## My insights
