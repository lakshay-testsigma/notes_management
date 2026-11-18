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
**Depth:** deep · **Progress:** 2 of 10 steps ready

The network layers under every web page: packets, DNS, HTTP and its versions, TLS, URLs and origins, caching, CDNs, compression, cookies, realtime transports and API styles.

## Read in this order

1. [[01-brief-internet-and-networking|Brief]] — what it is, why it exists, where it is used · *not started*
2. [[02-lesson-internet-and-networking|Interactive lesson]] — the animated lesson pages on the local site · *not started*
3. [[03-mini-projects-internet-and-networking|Mini projects]] — small builds with a real use case · *not started*
4. [[00-digests-internet-and-networking|Digests]] — short summaries of the key papers and docs · *not started*
5. [[00-repo-intel-internet-and-networking|Repository deep dive]] — how a production open-source project does it · *not started*
6. [[06-capstone-internet-and-networking|Capstone]] — the production-style project · *not started*
7. [[07-final-notes-internet-and-networking|Final notes]] — the one-page refresher · *not started*
8. [[08-recall-internet-and-networking|Recall cards]] — flashcards for spaced review · *not started*
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
- Routing, ISPs and autonomous systems: included
- Domain names and hosting: included
- Registrars, TLDs and nameservers: included
- Static, server and serverless hosting: deferred — No verified source in this run compares static, server and serverless hosting; the roadmap's deployment and hosting phase teaches it.
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
- Why domain sharding and sprites are anti-patterns now: included
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
- PoPs, origin shield, cache keys and purge: included
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
- RPC: tRPC, gRPC-web and Connect: included

Research stopped: budget-limit. Children expanded against the same sources. Proposed dns-caching-and-ttl, tls-0rtt-replay-risk and samesite-lax-strict-none are taught inside dns-record-types, quic-0rtt-and-migration and set-cookie-attributes. Three children deferred with reasons.

## Projects

- Mini project (planned): `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-01-dns-record-inspector/` — A developer moving a site to a new host checks that A, AAAA, CNAME, CAA and HTTPS records and their TTLs are right before switching nameservers.
- Mini project (planned): `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-02-cache-header-auditor/` — A frontend team checks that hashed assets are immutable and HTML revalidates, by grading Cache-Control, ETag, Vary and Content-Encoding headers from a HAR file.
- Mini project (planned): `projects/frontend-engineering/how-the-web-works/internet-and-networking/mini-03-cookie-attribute-linter/` — A security reviewer reads the Set-Cookie headers of a login flow and flags missing Secure, HttpOnly or SameSite and broken __Host- prefixes.
- Capstone: `projects/frontend-engineering/how-the-web-works/internet-and-networking/capstone/` — site network report CLI

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | not started |
| 2 | digest | not started |
| 2 | repo-intel | not started |
| 3 | lesson | not started |
| 3 | mini-projects | not started |
| 4 | capstone | not started |
| 5 | notes | not started |
| 5 | finalize | not started |

Next to generate: `brief`. Ask Claude to continue this topic, or run `node harness/bin/tutor.mjs next frontend-engineering/how-the-web-works/internet-and-networking`.
<!-- tutor:generated:end -->

## My insights
