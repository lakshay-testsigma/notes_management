# Slice plan — nodejs/undici

Repository: https://github.com/nodejs/undici
Clone: .cache/repos/nodejs__undici
Commit: 011d947edad2eb7c08371a91ceb23ed7549601ee (short: 011d947)
License: MIT
Files tracked: 906

## Chosen slices

| Unit id | Module name | What it holds | Est. tokens | Why chosen | File list |
|---------|-------------|---------------|-------------|------------|-----------|
| nodejs-undici-module-cache-semantics | cache-semantics | lib/util/cache.js, lib/interceptor/cache.js, lib/handler/cache-handler.js, cache-revalidation-handler.js, lib/cache/*-store.js | 28,700 | RFC 9111 caching: Cache-Control, ETag/Last-Modified revalidation, Vary, shared caches | .cache/tmp/internet-and-networking/nodejs-undici-module-cache-semantics.files.txt |
| nodejs-undici-module-cache-tests | cache-tests | test/cache-interceptor/* (incl. cache-tests.mjs) | 18,200 | tests of the cache: what behaviour the team protects | .cache/tmp/internet-and-networking/nodejs-undici-module-cache-tests.files.txt |
| nodejs-undici-module-http-versions-dispatcher | http-versions-dispatcher | lib/dispatcher/client.js, client-h1.js, client-h2.js, agent.js, lib/core/connect.js, ALPN tests | 38,500 | HTTP/1.1 versus HTTP/2, ALPN negotiation, keep-alive, connection handling | .cache/tmp/internet-and-networking/nodejs-undici-module-http-versions-dispatcher.files.txt |
| nodejs-undici-module-fetch-and-compression | fetch-and-compression | lib/web/fetch/headers.js, fetch/index.js, interceptor/decompress.js, handler/redirect-handler.js | 35,200 | HTTP messages in fetch: headers, redirects, content-encoding | .cache/tmp/internet-and-networking/nodejs-undici-module-fetch-and-compression.files.txt |
| nodejs-undici-module-cookies | cookies | lib/web/cookies/*, test/cookie/cookies.js | 12,600 | Set-Cookie parsing and validation, cookie attributes | .cache/tmp/internet-and-networking/nodejs-undici-module-cookies.files.txt |
| nodejs-undici-module-build-and-infra | build-and-infra | package.json, workflows, eslint, SECURITY.md, dependabot | 13,100 | technologies, CI matrix, release, security process | .cache/tmp/internet-and-networking/nodejs-undici-module-build-and-infra.files.txt |

## Skipped slices

- lib/web/websocket, lib/web/eventsource, lib/web/webidl, lib/web/subresource-integrity — not part of the HTTP caching and message topic.
- lib/llhttp, lib/milo, deps/ — vendored or generated HTTP/1 parser code (build scripts appear only in build-and-infra via package.json).
- lib/mock, lib/api, lib/interceptor/{dns,dump,retry,deduplicate}, proxy and pool dispatchers — wiring and unrelated features.
- test/ outside cache-interceptor and cookie (about 700 test files), docs/, benchmarks/, types/ — too large or not the topic.

## Notes for module workers

- Topic keywords: cache-control, max-age, s-maxage, etag, if-none-match, last-modified, vary, stale-while-revalidate, ALPN, h2, set-cookie, content-encoding.
- Big slices (http-versions-dispatcher, fetch-and-compression): use `grep -n` first and read only relevant ranges; they exceed a 32k window if read whole.
- Focus from the playbook: testing strategy, error handling, CI and release; capstone needs HTTP version, caching, compression and cookie checks.
