---
title: "nodejs/undici — pattern: fail closed on odd headers"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# Pattern: Fail closed on odd headers

## The problem

A cache or client reads headers that a server, or an attacker, controls. If the parser guesses on odd input, it can store a private response, reuse a wrong variant, or accept a smuggled directive. A wrong guess costs more than a missed cache hit.

## What they do

When a header is odd, undici picks the choice that does less. Bad numbers in `Cache-Control` delete the directive and make freshness 0. A broken `no-store`, `private` or `no-cache` still counts as present. An invalid `Vary` makes the response unusable. A 304 whose ETag, URL or `Vary` does not match is not trusted, and the entry is refetched. Cookies follow the same idea: a string with a control character is ignored whole, and a size cap drops oversize cookies.

## Evidence

- `lib/util/cache.js:123-147 @ 011d947` and `lib/util/cache.js:398-441 @ 011d947` — restrictive directive names and the strict `Cache-Control` parser.
- `lib/handler/cache-handler.js:1046-1048 @ 011d947` — invalid directive makes freshness 0.
- `lib/util/cache.js:600-683 @ 011d947` — `Vary` and 304 checks.
- `lib/interceptor/cache.js:586-602 @ 011d947` — a mismatched 304 is refetched.
- `lib/web/cookies/parse.js:18-20,67-75 @ 011d947` — control characters and size cap in the cookie parser.
- `test/cache-interceptor/utils.js:53-74,103-136 @ 011d947` — tests that quoted values cannot smuggle `public`, and that a non-breaking space in `no-store` still counts.
- `test/cache-interceptor/cache-tests.mjs:99-108 @ 011d947` — the team keeps its stricter `Age` handling and skips the suite tests that disagree.

## When to use it, and when not to

Use it for anything that decides whether data may be shared, stored or trusted: caches, auth checks, redirects. Do not use it where a wrong refusal is worse than a wrong accept, for example a lint tool that should only warn. Keep a list of the cases where you are deliberately stricter than the standard, as undici does.

## Related

- [[Fail closed]] — the idea behind it.
- [[Strict output, lenient input]] — the cookie module reads leniently but writes strictly; fail closed is the cache's version.
- [[Untrusted input]] — every header here comes from outside.
- [[undici-findings|Findings]]

## My insights
