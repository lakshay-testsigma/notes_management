---
title: "nodejs/undici — module cache-tests"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# nodejs/undici — module: cache-tests

## Responsibility

These are the tests of undici's HTTP cache interceptor (the code that stores responses and reuses them). They check three layers: the parsers for `Cache-Control`, `Vary` and `ETag`; the two storage back ends (memory and SQLite); and a conformance run of an outside HTTP caching test suite against the whole interceptor. Together they show which caching rules the team treats as worth locking down (commit `011d947`, MIT license).

## Key files

| File | Role |
|------|------|
| `test/cache-interceptor/cache-tests.mjs` | Launcher: builds a matrix of cache type x store and forks one worker each |
| `test/cache-interceptor/cache-tests-worker.mjs` | Worker: starts the external test server, runs the suite through the cache interceptor |
| `test/cache-interceptor/utils.js` | Unit tests for `parseCacheControlHeader`, `parseVaryHeader`, `isEtagUsable` |
| `test/cache-interceptor/cache-utils.js` | Unit tests for `normalizeHeaders` |
| `test/cache-interceptor/issue-4209.js` | Regression test: query strings must not share a cache entry |
| `test/cache-interceptor/cache-store-test-utils.js` | One shared test suite run against any store |
| `test/cache-interceptor/memory-cache-store-tests.js` | Size and count limits, eviction order |
| `test/cache-interceptor/sqlite-cache-store-tests.js` | Format migration, Vary variants, zstd, locked database |

## How it works

1. `npm run test:cache-tests` runs `node test/cache-interceptor/cache-tests.mjs --ci` (`package.json:103 @ 011d947`).
2. The launcher exits quietly if the `cache-tests` git submodule is missing, so installs without submodules do not fail (`test/cache-interceptor/cache-tests.mjs:11-24 @ 011d947`). The submodule is the public `http-tests/cache-tests` repo (`.gitmodules:4-6 @ 011d947`).
3. It joins two cache types (`shared`, `private`) with the stores (Memory, and SQLite when `node:sqlite` exists) into environments (`test/cache-interceptor/cache-tests.mjs:122-152 @ 011d947`).
4. Each environment runs in a forked child process with its own port and a JSON `TEST_ENVIRONMENT` (`test/cache-interceptor/cache-tests.mjs:173-191 @ 011d947`).
5. The worker starts the suite's server, then wraps an `Agent` with `interceptors.cache(...)` and sets it as the global dispatcher, so `fetch` goes through the cache (`test/cache-interceptor/cache-tests-worker.mjs:31-62 @ 011d947`).
6. It runs the whole suite and prints results (`test/cache-interceptor/cache-tests-worker.mjs:62-68 @ 011d947`).

## Beyond the textbook

### A conformance matrix from an outside suite, with a documented skip list

- Textbook version: write your own tests for the cache rules you remember.
- What they do: run a community HTTP cache conformance suite against every combination of shared/private cache and every store, and keep a named list of tests they deliberately do not pass. Each group of skips has a comment: invalid unquoted ETags "go against the spec", `no-cache` responses may be reused if revalidated, 304 header updates are "not caching 304s currently", and a few are marked "Broken?".
- Why: the list is honest about gaps, so a new failure stands out. The `shared` type also skips two `s-maxage`/`private` tests that only a private cache may pass.
- Evidence: `test/cache-interceptor/cache-tests.mjs:80-133 @ 011d947`

### Hardening beats strict spec reading for the `Age` header

- Textbook version: ignore a bad `Age` value, or use the first valid one.
- What they do: treat malformed or duplicate `Age` values as stale. The eight `age-parse-*` suite tests are skipped because the code is stricter than the suite expects.
- Why: the comment says "The hardening treats malformed or duplicate Age values as stale".
- Evidence: `test/cache-interceptor/cache-tests.mjs:99-108 @ 011d947`

### Header parsers tested like security boundaries

- Textbook version: split `Cache-Control` on commas and read `max-age`.
- What they do: tests show a quoted extension value cannot smuggle in `public, s-maxage=60`; an unterminated quote drops the directives after it but keeps restrictive ones like `no-store`; a non-breaking space in `no-store` still counts as `no-store`; duplicate numeric values pick the most restrictive; a 400-digit `max-age` is capped at 2147483647; unknown directives are ignored.
- Why: when input is odd, the cache fails toward not storing. A parser that mis-reads a header could cache private data.
- Evidence: `test/cache-interceptor/utils.js:53-74 @ 011d947`, `test/cache-interceptor/utils.js:103-136 @ 011d947`, `test/cache-interceptor/utils.js:138-160 @ 011d947`

### `Vary` parsing rejects invalid field names

- Textbook version: `Vary` is a comma list of header names; match them against the request.
- What they do: a name list with a space inside a token (`Cookie Authorization`) or a trailing non-breaking space makes the parser return `undefined` (do not use this entry). `Vary: *` keeps the request headers as-is. A SQLite test also checks that an expired `gzip` variant is skipped while a valid `br` variant of the same URL is served.
- Why: an invalid `Vary` cannot be matched safely, so the response is not reused.
- Evidence: `test/cache-interceptor/utils.js:551-561 @ 011d947`, `test/cache-interceptor/sqlite-cache-store-tests.js:303-357 @ 011d947`

### Regression test that makes a collision visible

- Textbook version: key the cache by URL.
- What they do: issue #4209 asserts the cache key path includes the query (`/?i=1` vs `/?i=2`). The server body embeds a request counter and URL, so a wrong cache hit would show the wrong counter. The test also checks the first query is still cached after a different query arrives.
- Why: the comment says the counter makes "a cache collision immediately observable".
- Evidence: `test/cache-interceptor/issue-4209.js:15-33 @ 011d947`, `test/cache-interceptor/issue-4209.js:53-102 @ 011d947`

### Strict ETag validity, with spec deviations written down

- Textbook version: any `ETag` string is a validator.
- What they do: only `"asd"` and `W/"ads"` are usable. `""` and `W/""` are rejected under a comment "Spec deviations".
- Evidence: `test/cache-interceptor/utils.js:564-586 @ 011d947`

### A best-effort cache must not throw when its database is locked

- Textbook version: let a database error bubble up.
- What they do: a second connection holds a write lock (`BEGIN IMMEDIATE`); `set`, `get` and `delete` must not throw, the entry just is not cached, and the store works again after `COMMIT`.
- Why: comment: "Contention is transient and the cache is best effort".
- Evidence: `test/cache-interceptor/sqlite-cache-store-tests.js:504-557 @ 011d947`

### Format changes invalidate old stored data

- Textbook version: assume the table schema never changes.
- What they do: create an old-format table (`cacheInterceptorV4`) holding a row, open the new store, and expect `get` to return `undefined` and `size` 0.
- Evidence: `test/cache-interceptor/sqlite-cache-store-tests.js:14-43 @ 011d947`

## Tests and what they protect

- Parsing: `Cache-Control` (all 16 directives in one header, spacing, case, `no-cache` and `private` with field lists, repeated headers), `Vary`, and ETag (`test/cache-interceptor/utils.js:7-30 @ 011d947`).
- Header normalization: plain objects, `Map`, flat arrays, repeated headers with different casing; an odd-length flat array throws. It survives a polluted `Object.prototype[Symbol.iterator]` and a header named `__proto__` (`test/cache-interceptor/cache-utils.js:7-31 @ 011d947`, `test/cache-interceptor/cache-utils.js:142-157 @ 011d947`).
- Store behaviour shared by all stores: stale entries are returned before `deleteAt`, using fake timers (`test/cache-interceptor/cache-store-test-utils.js:150-155 @ 011d947`); streamed bodies at the `maxEntrySize` boundary (`test/cache-interceptor/cache-store-test-utils.js:111 @ 011d947`).
- Memory store: default limits, with 1025 writes forcing eviction back under the default count (`test/cache-interceptor/memory-cache-store-tests.js:36-58 @ 011d947`), and a `maxSizeExceeded` event (`test/cache-interceptor/memory-cache-store-tests.js:171-200 @ 011d947`). Eviction-order tests: a read entry counts as recently used (`test/cache-interceptor/memory-cache-store-tests.js:267 @ 011d947`).
- SQLite store: `maxEntries`, oldest-first prune (`test/cache-interceptor/sqlite-cache-store-tests.js:227 @ 011d947`), zstd compression of big files (`test/cache-interceptor/sqlite-cache-store-tests.js:416 @ 011d947`).
- Conformance: the outside suite runs through a real `Agent` and `fetch` (`test/cache-interceptor/cache-tests-worker.mjs:56-62 @ 011d947`).

## Error handling, performance, and security

- Unit tests in this slice are conditional: SQLite tests skip when `node:sqlite` is missing (`test/cache-interceptor/sqlite-cache-store-tests.js:14 @ 011d947`), and the launcher warns and skips SQLite (`test/cache-interceptor/cache-tests.mjs:142-146 @ 011d947`).
- Performance and reliability of the tests themselves: on Windows the environment workers run one at a time because of intermittent crashes (`test/cache-interceptor/cache-tests.mjs:155-160 @ 011d947`).
- Security: prototype pollution and `__proto__` header tests, quoted-directive injection tests (see above).

## Technologies and services seen

- `node:test` style `test`/`describe` and `borp` runner — runs the unit tests (`package.json:78 @ 011d947`).
- `node:sqlite` `DatabaseSync` — real database for store tests (`test/cache-interceptor/sqlite-cache-store-tests.js:15 @ 011d947`).
- `http-tests/cache-tests` git submodule — external HTTP cache conformance suite (`.gitmodules:4-6 @ 011d947`).
- `@sinonjs/fake-timers` (`FakeTimers.install`) — controls the clock in stale tests (`test/cache-interceptor/cache-store-test-utils.js:151 @ 011d947`).
- `node:child_process` `fork` — isolates each environment (`test/cache-interceptor/cache-tests.mjs:179 @ 011d947`).

## Worth exploring interactively

- Cache test matrix run — launcher builds environments (`test/cache-interceptor/cache-tests.mjs:151-152 @ 011d947`), forks a worker per environment (`test/cache-interceptor/cache-tests.mjs:179 @ 011d947`), worker starts server (`test/cache-interceptor/cache-tests-worker.mjs:31 @ 011d947`), installs the cache interceptor (`test/cache-interceptor/cache-tests-worker.mjs:56-57 @ 011d947`), runs suite (`test/cache-interceptor/cache-tests-worker.mjs:62 @ 011d947`) — fits FlowAnimation because the learner sees a request go through the cache layer to the test server.
- Query-string collision test — first `?i=0` hits origin, repeat is a cache hit, `?i=1` hits origin, `?i=0` is still cached (`test/cache-interceptor/issue-4209.js:80-102 @ 011d947`) — fits AlgorithmStepper because the cache contents and the request counter change step by step.

## Open questions

- The cache interceptor source (`lib/interceptor/cache.js`) is outside this slice, so how `Age` hardening is implemented is not shown here.

## My insights
