---
title: "Internet & networking — resources"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: resources
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
---

# Internet & networking — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**12 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[HTTP (MDN Web Docs documentation set)](https://developer.mozilla.org/en-US/docs/Web/HTTP)** — MDN contributors (Mozilla), 2026 · tier A
  - Why it is trusted: MDN is the browser-vendor reference for the web platform; its HTTP set has guides on caching, cookies (prefixes), compression, Compression Dictionary Transport, HTTP/1.x connection management (domain sharding), content negotiation, HSTS and mixed content (pages modified Sep to Nov 2026).
  - Used for: brief, lesson
  - Verified: 2026-11-18
- **[Learn GraphQL (graphql.org)](https://graphql.org/learn/)** — GraphQL Foundation, 2026 · tier A
  - Why it is trusted: The official GraphQL documentation from the GraphQL Foundation (copyright 2026): schemas, queries, mutations, subscriptions, serving over HTTP, caching.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Cloudflare developer documentation (DNS, Cache, Workers, Images)](https://developers.cloudflare.com/)** — Cloudflare, 2026 · tier B
  - Why it is trusted: Official documentation of a major CDN and DNS provider; its DNS docs list A, AAAA, CNAME, MX, TXT, CAA, HTTPS, SVCB and NS records and TTL rules, and its Cache docs define cache keys and purge methods.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Connect RPC documentation](https://connectrpc.com/docs/introduction)** — The Connect Authors (created by Buf), 2026 · tier B
  - Why it is trusted: Docs of a CNCF sandbox RPC project that supports gRPC, gRPC-Web and the Connect protocol from browsers over fetch.
  - Used for: lesson
  - Verified: 2026-11-18

## Books

- **[High Performance Browser Networking](https://hpbn.co/)** — Ilya Grigorik, 2013 · tier A
  - Why it is trusted: O'Reilly Media book by Ilya Grigorik (Google web performance engineer, W3C Web Performance WG co-chair), with the full text online under CC BY-NC-ND 4.0; chapters cover TCP, UDP, TLS, HTTP/1.X, HTTP/2, SSE, WebSocket and WebRTC.
  - Used for: lesson
  - Verified: 2026-11-18

## Repositories

- **[nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies)](https://github.com/nodejs/undici)** — Node.js project, 2026 · tier A
  - Why it is trusted: The HTTP client that powers Node.js built-in fetch() since v18, owned by the nodejs organization (MIT); 7.7k stars is above the 2,000 niche bar for Node HTTP clients.
  - Used for: lesson, repo-intel
  - Verified: 2026-11-18
- **[jshttp/cookie: RFC 6265 cookie parse and serialize for Node.js](https://github.com/jshttp/cookie)** — jshttp (HTTP working group of the Express ecosystem), 2026 · tier B
  - Why it is trusted: Small, MIT-licensed TypeScript library owned by the jshttp organization that parses and serializes Set-Cookie and Cookie headers per RFC 6265; Express lists it as a dependency; 1.5k stars is above the 1,000 niche bar for cookie libraries.
  - Used for: lesson, repo-intel
  - Verified: 2026-11-18

## Standards

- **[RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)** — R. Fielding, M. Nottingham, J. Reschke (IETF), 2022 · tier A
  - Why it is trusted: The IETF Internet Standard that defines HTTP methods, status codes, headers, content negotiation and content coding for all HTTP versions; rfc-editor.org lists it as current and not obsoleted.
  - Used for: lesson
  - Verified: 2026-11-18
- **[RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)** — R. Fielding, M. Nottingham, J. Reschke (IETF), 2022 · tier A
  - Why it is trusted: The IETF Internet Standard that defines HTTP caches, freshness, validation, Vary and Cache-Control; it obsoletes RFC 7234 and is itself not obsoleted.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[rfc-9111-http-caching-internet-and-networking|read the digest]]
- **[RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)** — M. Bishop (IETF), 2022 · tier A
  - Why it is trusted: The IETF standard that maps HTTP semantics onto QUIC streams and defines QPACK use, early data and migration notes; not obsoleted per rfc-editor.org.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[rfc-9114-http3-internet-and-networking|read the digest]]
- **[RFC 9846: The Transport Layer Security (TLS) Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc9846)** — E. Rescorla (IETF), 2026 · tier A
  - Why it is trusted: The IETF Standards Track specification of TLS 1.3 that obsoletes RFC 8446; every browser and server TLS stack follows it.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[rfc-9846-tls13-internet-and-networking|read the digest]]
- **[URL Standard (WHATWG Living Standard)](https://url.spec.whatwg.org/)** — WHATWG, 2026 · tier A
  - Why it is trusted: The living standard that defines URL parsing, percent-encoding, host parsing and the origin concept, which browsers implement.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[whatwg-url-standard-internet-and-networking|read the digest]]
<!-- tutor:generated:end -->

## My insights
