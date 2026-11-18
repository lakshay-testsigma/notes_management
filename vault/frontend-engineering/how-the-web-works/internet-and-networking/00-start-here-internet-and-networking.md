---
title: "Internet & networking — start here"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: map
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
---

# Internet & networking — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** deep · **Progress:** 9 of 10 steps ready

The network layers under every web page: packets, DNS, HTTP and its versions, TLS, URLs and origins, caching, CDNs, compression, cookies, realtime transports and API styles.

## Read in this order

1. [[01-brief-internet-and-networking|Brief]] — what it is, why it exists, where it is used · *ready*
2. [[02-lesson-internet-and-networking|Interactive lesson]] — the animated lesson pages on the local site · *ready*
3. [[03-mini-projects-internet-and-networking|Mini projects]] — small builds with a real use case · *ready*
4. [[00-digests-internet-and-networking|Digests]] — short summaries of the key papers and docs · *ready*
5. [[00-repo-intel-internet-and-networking|Repository deep dive]] — how a production open-source project does it · *ready*
6. [[06-capstone-internet-and-networking|Capstone]] — the production-style project · *ready*
7. [[07-final-notes-internet-and-networking|Final notes]] — the one-page refresher · *ready*
8. [[08-recall-internet-and-networking|Recall cards]] — flashcards for spaced review · *ready*
9. [[09-resources-internet-and-networking|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-internet-and-networking|My insights]].

Every diagram, simulation and video, with its concepts and sources: [[visuals-internet-and-networking|Visuals]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/how-the-web-works/internet-and-networking/` on the local address it prints.

## Before you start

- **Browser developer tools** (you already know this)
- **HTTP request and response** (new for you) — The browser sends a request; the server returns status, headers and body.
- **Client and server** (new for you) — A client asks for data; a server listens and answers.
- **Network packet** (new for you) — A small block of data with a header that says where it goes.

## What you will be able to do

- Explain what happens on the network between typing a URL and the first byte of the page.
- Explain how DNS resolves a name and choose the right record type and TTL.
- Compare HTTP/1.1, HTTP/2 and HTTP/3 and explain head-of-line blocking at each layer.
- Explain the TLS 1.3 handshake and the certificate chain of trust.
- Configure HTTP caching, CDN caching and compression for a static site with hashed assets.
- Set cookies with safe attributes and explain origin versus site.
- Choose a realtime transport and an API style for a product feature.

## Lesson pages

1. How the internet moves your request: packets, IP, TCP and UDP — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/01-how-the-internet-works/`
2. Domains, DNS resolution and hosting — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/02-domains-dns-and-hosting/`
3. URLs, origins and sites — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/03-urls-and-origins/`
4. HTTP messages: methods, status codes and headers — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/04-http-messages/`
5. HTTP/1.1, HTTP/2 and HTTP/3: head-of-line blocking — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/05-http-versions/`
6. TLS and HTTPS: the handshake and the chain of trust — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/06-tls-and-https/`
7. HTTP caching: freshness, revalidation and cache busting — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/07-http-caching/`
8. CDNs and the edge — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/08-cdns-and-the-edge/`
9. Compression: gzip, Brotli, Zstandard and dictionaries — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/09-compression/`
10. Cookies: attributes, SameSite and prefixes — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/10-cookies/`
11. Realtime transports: polling, SSE, WebSockets, WebTransport and WebRTC — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/11-realtime-transports/`
12. REST, GraphQL and RPC in production — `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/12-api-styles-in-production/`

## Research scope and concept notes

The network a frontend developer depends on: internet packets and transport, domains and DNS, HTTP messages and versions, TLS, URLs and origins, HTTP and CDN caching, compression, cookies, realtime transports and API styles at a glance.
- How the internet moves packets: included
- IP addresses, IPv4/IPv6 and ports: deferred — No verified source in this run explains IP addressing and ports in depth (HPBN mentions IP only briefly); page 1 names IP addresses and ports inside the packet journey, and the coverage audit may add a source.
- TCP versus UDP: included
- Routing and ISPs: included
- Domain names and hosting: included
- Registrars, TLDs and nameservers: included
- Static, server and serverless hosting: deferred — Taught in roadmap section 27.1 (CI/CD & hosting: hosting platforms, domains and DNS for deploys). No verified hosting-models source fits this topic within the 12-source cap; page 2 names the term only.
- DNS resolution: included
- DNS record types and TTL: included
- DNS prefetch and DNS over HTTPS: included
- HTTP request and response messages: included
- HTTP methods and idempotency: included
- HTTP status codes: included
- Content negotiation, headers and keep-alive: included
- HTTP/1.1, HTTP/2 and HTTP/3: included
- Head-of-line blocking and multiplexing: included
- Header compression and stream priorities: included
- QUIC, 0-RTT and connection migration: included
- Why HTTP/1-era workarounds such as domain sharding are anti-patterns now: included
- TLS and HTTPS: included
- The TLS 1.3 handshake: included
- Certificates, CAs and the chain of trust: included
- HSTS and mixed content: included
- Certificate transparency: included
- URLs and origins: included
- URL parts and encoding: included
- Origin versus site and the public suffix list: included
- HTTP caching: included
- Cache-Control directives: included
- Revalidation with ETag and Last-Modified: included
- Vary, browser caches and shared caches: included
- Cache busting with hashed filenames: included
- CDNs and the edge: included
- PoPs, tiered caching, cache keys and purge: included
- Edge compute and image CDNs: included
- HTTP compression: included
- gzip, Brotli and Zstandard: included
- Compression dictionaries: included
- Cookies: included
- Set-Cookie attributes and SameSite: included
- Cookie prefixes and partitioned cookies (CHIPS): included
- First-party and third-party cookies: included
- Realtime transports: included
- Polling, long polling and Server-Sent Events: included
- WebSockets: included
- WebTransport and WebRTC: included
- REST, GraphQL and RPC: included
- Resource-oriented REST: deferred — No verified REST-style source in this run (RFC 9110 defines resources and methods, not the REST style); the roadmap deep-dives REST in Phase 13.
- Query-based GraphQL: included
- RPC over HTTP: gRPC-web and Connect: included
- HTTP redirects: 301, 302, 303, 307 and 308: included
- HTTP authentication: Authorization, 401 and 403: included
- Range requests and 206 Partial Content: included
- 429 Too Many Requests and Retry-After: included
- CORS: cross-origin requests and preflight: deferred — Taught in roadmap section 01.2 (How browsers work), page 7, concept cors-coop-coep, with its own verified MDN source; this topic links origin to it.
- tRPC: type-safe RPC for TypeScript apps: deferred — The canonical source (trpc.io) was confirmed live, but the topic is at its 12-source cap and no recorded source covers tRPC. The roadmap sub-item stays open here; the TypeScript and backend-for-frontend sections (06.x, 13.x) are the natural place to teach it.

Research stopped: budget-limit. Audit round 1 concepts expanded against the re-verified MDN pages; Bearer token usage and resource-hint syntax have no direct verified page, so they stay out. Review fix: WebTransport re-verified on MDN and taught on page 11; tRPC deferred (no slot); hosting deferred to section 27.1.

## Projects

- Mini project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-01-dns-record-inspector/`
- Mini project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-02-cache-header-auditor/`
- Mini project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-03-cookie-attribute-linter/`
- Capstone: `projects/frontend-engineering/how-the-web-works/internet-and-networking/capstone/` — site network report CLI

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | ready |
| 2 | digest | ready |
| 2 | repo-intel | ready |
| 3 | lesson | ready |
| 3 | mini-projects | ready |
| 4 | capstone | ready |
| 5 | notes | ready |
| 5 | finalize | in progress |

Next to generate: `finalize`. Ask Claude to continue this topic, or run `node harness/bin/tutor.mjs next frontend-engineering/how-the-web-works/internet-and-networking`.
<!-- tutor:generated:end -->

## My insights
