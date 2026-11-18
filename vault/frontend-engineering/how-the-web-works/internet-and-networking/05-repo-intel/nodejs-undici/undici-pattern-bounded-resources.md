---
title: "nodejs/undici — pattern: bounded resources"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# Pattern: Bounded resources

## The problem

Network input has no natural size. A tiny compressed body can expand to gigabytes. A peer that refuses every connection can cause an endless retry loop. One header with thousands of empty parts can overflow the stack. Without a cap, one bad response harms the whole process.

## What they do

Every loop, buffer and retry has a number. Decoding stops at 5 stacked codings and, when `maxSize` is set, at a decoded size limit; the zstd window is capped. A GOAWAY replay happens once. Redirects stop at 20. The memory cache holds at most 1024 entries, 100 MB and 5 MB per entry. Cookies cap an attribute at 1024 and name plus value at 4096. The cookie attribute parser is a loop, not recursion, after an advisory. The HTTP/2 stream limit follows the smaller of the client's and the server's value. Default connect timeout is 10 seconds.

## Evidence

- `lib/interceptor/decompress.js:291-296,317-326 @ 011d947` — coding count and size limiters.
- `lib/dispatcher/client-h2.js:56-61,211-221 @ 011d947` — one GOAWAY replay.
- `lib/web/fetch/index.js:1304-1306 @ 011d947` — redirect limit.
- `lib/cache/memory-cache-store.js:19-21,175-193 @ 011d947` — memory store limits and eviction.
- `lib/web/cookies/constants.js:3-7 @ 011d947` — cookie size caps.
- `lib/web/cookies/parse.js:94-96 @ 011d947` and `test/cookie/cookies.js:713-725 @ 011d947` — loop, with a 5000-attribute test.
- `lib/dispatcher/client-h2.js:630-635 @ 011d947` — stream cap.
- `lib/core/connect.js:75 @ 011d947` — connect timeout.

## When to use it, and when not to

Use a cap wherever the input size or the retry count is set by someone else. Choose the default on purpose: the decompress `maxSize` defaults to 0 (no limit), so the guard is opt-in there (`lib/interceptor/decompress.js:291-296 @ 011d947`). A guard that is off by default protects nobody who does not read the docs.

## Related

- [[Resource limits]] — the idea behind it.
- [[Fail closed]] — what to do when a cap is hit.
- [[undici-findings|Findings]]

## My insights
