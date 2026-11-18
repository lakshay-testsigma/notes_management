---
title: "nodejs/undici — findings"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# nodejs/undici — findings

What this production HTTP client does beyond the textbook version of HTTP caching, HTTP versions, compression and cookies, ranked by how much you gain from knowing it. Commit `011d947`.

## 1. Freshness is a ladder of rules, and zero freshness is still storable

- Textbook version: a response is fresh for `max-age` seconds.
- What they do: a shared cache tries `s-maxage`, then `max-age`, then `Expires`, then 10% of the time since `Last-Modified`, then one year for `immutable`. A `max-age=0` response with a validator is stored and revalidated on every use. The delete time is later than the stale time, so a stale entry can still be revalidated instead of vanishing.
- Why: the code cites RFC 9111 and RFC 8246 in comments; the delete-time comment says the entry must live long enough "to be revalidated".
- Evidence: `lib/handler/cache-handler.js:1041-1131 @ 011d947`, `lib/handler/cache-handler.js:451-455 @ 011d947`, `lib/handler/cache-handler.js:1157-1176 @ 011d947`
- Borrow it when: your tool judges whether a response is cacheable. Report which rule produced the lifetime, not only the number.
- More: [[undici-module-cache-semantics|cache-semantics]]

## 2. Odd headers make the cache do less (fail closed)

- Textbook version: split `Cache-Control` on commas and read `max-age`.
- What they do: quoted lists are rejoined, bad numbers delete the directive and give freshness 0, numbers are capped at 2147483647, duplicate numbers keep the smaller one, and a malformed `no-store` still counts. An invalid `Vary` makes the response unusable.
- Why: a parser that mis-reads a header could cache private data; restrictive directives are named in `RESTRICTIVE_DIRECTIVE_NAMES`.
- Evidence: `lib/util/cache.js:123-147 @ 011d947`, `lib/util/cache.js:398-441 @ 011d947`, `test/cache-interceptor/utils.js:53-74,103-136 @ 011d947`
- Borrow it when: you parse headers into findings. Report "could not parse" as its own result and do not pass the response silently.
- More: [[undici-module-cache-semantics|cache-semantics]], [[undici-module-cache-tests|cache-tests]], [[undici-pattern-fail-closed-parsing|fail closed]]

## 3. Shared caches refuse private data, and redirects cannot poison the key

- Textbook version: one cache, one set of rules.
- What they do: the `shared` type refuses `private`, any `Set-Cookie` response, and `Authorization` requests unless the response says `public`, `s-maxage` or `must-revalidate`. Nothing is stored under the original key if a redirect left the key's origin or the request carried `authorization`, `cookie` or `proxy-authorization`.
- Why: comments describe one user's data replayed to another, and a redirect target controlling an entry for a trusted URL.
- Evidence: `lib/handler/cache-handler.js:781-847 @ 011d947`, `lib/handler/cache-handler.js:340-394,474-519 @ 011d947`, `lib/cache/sqlite-cache-store.js:10-11 @ 011d947`
- Borrow it when: a policy check asks "is this response safe to cache at a CDN?". `Set-Cookie` plus `public` is a finding.
- More: [[undici-module-cache-semantics|cache-semantics]]

## 4. A 304 is checked before it is trusted, and `Vary` is a stored snapshot

- Textbook version: a 304 means reuse the cache; add `Vary` to the key.
- What they do: the entry stores the request header values named in `Vary`, and a lookup must match each one. A 304 is refused when it came from another URL, its ETag differs, or it adds `no-store`, `private`, `Set-Cookie` or a new `Vary` name.
- Why: a 304 only describes headers, so a mismatch means the stored body may belong to another variant.
- Evidence: `lib/util/cache.js:600-683 @ 011d947`, `lib/interceptor/cache.js:206-245,586-602 @ 011d947`, `test/cache-interceptor/sqlite-cache-store-tests.js:303-357 @ 011d947`
- Borrow it when: you check `Vary` in a report. `Vary: *` or a `Vary` list that does not include `Accept-Encoding` on a compressed response is worth flagging.
- More: [[undici-module-cache-semantics|cache-semantics]], [[undici-module-cache-tests|cache-tests]]

## 5. The server decides the HTTP version, and the client sets the offer order

- Textbook version: HTTPS upgrades to HTTP/2 if the server supports it.
- What they do: the client sends an ALPN list. By default `http/1.1` is first; `preferH2` flips it; `allowH2: false` offers only `http/1.1`. After the handshake `Client` reads `alpnProtocol` and picks the h2 or h1 code. The pool map key gets a `#http1-only` suffix so the two modes never share a connection. Two tests assert the exact arrays.
- Why: HTTP/1.1 stays the safe default for a library that began as an HTTP/1.1 client.
- Evidence: `lib/core/connect.js:98 @ 011d947`, `lib/dispatcher/client.js:557-559 @ 011d947`, `lib/dispatcher/agent.js:86-87 @ 011d947`, `test/connect-h2-alpn-order.js:29-41 @ 011d947`
- Borrow it when: you report the HTTP version of a site. Read the negotiated protocol from the saved data; never infer it from `Alt-Svc` or a guess.
- More: [[undici-module-http-versions-dispatcher|http-versions-dispatcher]]

## 6. HTTP/2 needs a liveness probe, a stream cap and a replay budget

- Textbook version: HTTP/2 allows many parallel streams; retry after GOAWAY.
- What they do: the stream cap is the smaller of client (default 100) and server. A stream timeout is followed by a PING; without an ack the session is dropped and requests move to a fresh connection. A GOAWAY replay happens once. A pool does not open more connections for h2, because that would defeat multiplexing.
- Why: comments name a NAT or load balancer that drops a connection silently, and an endless connect-refuse loop.
- Evidence: `lib/dispatcher/client-h2.js:521-540 @ 011d947`, `lib/dispatcher/client-h2.js:56-61,211-221 @ 011d947`, `lib/dispatcher/client.js:388-399 @ 011d947`
- Borrow it when: you explain why one HTTP/2 connection can fail every request at once.
- More: [[undici-module-http-versions-dispatcher|http-versions-dispatcher]], [[undici-pattern-bounded-resources|bounded resources]]

## 7. Credentials stay with their origin across redirects

- Textbook version: follow `Location` and resend the same headers.
- What they do: on a cross-origin hop both redirect paths delete `authorization`, `proxy-authorization`, `cookie` and `host`. 301 and 302 with POST become GET without a body; 303 becomes GET. A fixed limit of 20 stops loops.
- Why: a redirect to another site must not receive the first site's secrets; a comment records a past bug where pairs read as a flat list "defeats the cross-origin credential stripping".
- Evidence: `lib/web/fetch/index.js:1346-1376 @ 011d947`, `lib/handler/redirect-handler.js:208-223,250-254 @ 011d947`
- Borrow it when: your report follows a redirect chain. Check that a `Set-Cookie` or a cache rule on a middle hop is not lost.
- More: [[undici-module-fetch-and-compression|fetch-and-compression]]

## 8. Decompression has size and chain limits, and some bodies are never decoded

- Textbook version: pipe the body through `gunzip`.
- What they do: at most 5 stacked codings, an optional `maxSize`, a zstd window cap. They skip HEAD, 204, 304 and redirects, refuse `compress`, and remove `content-encoding` and `content-length` after decoding. `Accept-Encoding` adds `br, gzip, deflate, zstd` for HTTPS only. Gzip and deflate decode leniently, like curl.
- Why: comments cite a urllib3 advisory and a curl CVE; a tiny body can expand to gigabytes. The `maxSize` default is 0 (no limit), so the guard is opt-in.
- Evidence: `lib/interceptor/decompress.js:291-296,317-326 @ 011d947`, `lib/interceptor/decompress.js:274-279,455-456 @ 011d947`, `lib/web/fetch/index.js:1586-1591,2301-2314 @ 011d947`
- Borrow it when: you check compression. Compare `Content-Encoding` with the type of the body, and treat a missing coding on a large text file as a finding.
- More: [[undici-module-fetch-and-compression|fetch-and-compression]], [[undici-pattern-bounded-resources|bounded resources]]

## 9. Cookies: strict write, forgiving read, prefix rules, hostile names

- Textbook version: join `name=value; Attr` and split on `;`.
- What they do: the writer throws on bad names, values, paths and domains (the domain is checked against DNS syntax). `__Host-` forces `Secure`, drops `Domain` and sets `Path=/`. The parser never throws, ignores a string with control characters, never percent-decodes, and uses a loop after an advisory about stack overflow. `getCookies` returns a null-prototype object.
- Why: comments cite RFC 6265, RFC 6265bis and the prefix draft; test names state the intent.
- Evidence: `lib/web/cookies/util.js:149-193,283-293 @ 011d947`, `lib/web/cookies/parse.js:18-20,94-96 @ 011d947`, `test/cookie/cookies.js:713-742 @ 011d947`
- Borrow it when: you check `Set-Cookie` attributes. Known gaps to avoid: the parser does not validate `Domain`, and the 400-day `Max-Age` cap is commented out (`lib/web/cookies/parse.js:209-214,231-244 @ 011d947`).
- More: [[undici-module-cookies|cookies]]

## 10. Tests are a conformance matrix with an honest skip list, and CI removes features on purpose

- Textbook version: write tests for the rules you remember; test on a few Node.js versions.
- What they do: an outside cache suite runs for shared and private caches and every store, with named skips and a reason for each. CI also builds Node.js without ICU and without SSL, turns off WebAssembly SIMD, and, when enabled, checks undici inside Node.js itself. Actions are pinned to commit hashes.
- Why: a visible skip list makes a new failure stand out; the no-SSL step is named "Try loading Node.js without Crypto".
- Evidence: `test/cache-interceptor/cache-tests.mjs:80-152 @ 011d947`, `.github/workflows/ci.yml:71-248 @ 011d947`, `.github/workflows/ci.yml:20-28 @ 011d947`
- Borrow it when: you test your own CLI. Keep a fixtures folder of saved responses with an expected-findings file, and write down every case you skip.
- More: [[undici-module-cache-tests|cache-tests]], [[undici-module-build-and-infra|build-and-infra]], [[undici-pattern-best-effort-cache|best-effort cache]]

## My insights
