---
title: "jshttp/cookie — pattern: strict write, lenient read"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, cookies]
sources: [jshttp-cookie-repo]
created: 2026-11-18
---

# Pattern: strict write, lenient read

## The problem

If the writer accepts bad input, a header can break or carry a smuggled attribute. If the reader rejects bad input, one odd cookie from a client or a server can break a request.

## What they do

The writer checks the name, the value and every attribute, and throws a `TypeError` with the field name. The reader never throws: it skips a bad attribute, keeps a bad escape as raw text, and ignores pieces without `=`. The reader is also the place that normalizes: it lower-cases `SameSite` and `Priority`.

## Evidence

- `src/index.ts:172-180 @ a437ef0` — `stringifyCookie` throws on a bad name or a bad custom-encoded value.
- `src/index.ts:292-300 @ a437ef0` — `stringifySetCookie` checks the name and a custom-encoded value.
- `src/index.ts:439-468 @ a437ef0` — `parseSetCookie` stores only valid attributes.
- `src/index.ts:521-525 @ a437ef0` — `defaultDecode` falls back to the raw text.
- `src/stringify-set-cookie.spec.ts:103-114 @ a437ef0` — injection attempts must throw.

## When to use it, and when not to

Use it where you control the output and do not control the input, such as an HTTP library. Do not use a lenient reader where a silent drop hides a real fault: a checker tool should report what was dropped.

## Related

- [[Strict output, lenient input]] — the idea behind it
- [[Header injection]] — what the strict writer prevents
- [[Set-Cookie attributes]] — the fields that are checked
- [[cookie-findings|Findings]]

## My insights
