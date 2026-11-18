---
title: "Internet & networking — lesson"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: lesson
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
---

# Internet & networking — interactive lesson

## Open the lesson

The lesson pages live on the local site at
`/frontend-engineering/how-the-web-works/internet-and-networking/`. Start the site with
`npm run site:dev`, then open that path. Read the pages in order; each one takes about five
minutes, and the pages with a lab take about fifteen. Read the
[[01-brief-internet-and-networking|brief]] first.

## Pages

1. `01-how-the-internet-works` — How the internet moves your request. A request travels as packets through routers, and TCP and UDP treat a lost packet differently. Visual: packet journey diagram. Serves outcome 1.
2. `02-domains-dns-and-hosting` — Domains, DNS resolution and hosting. A resolver walks root, TLD and authoritative servers, and the record type and TTL decide what it caches. Visual: DNS resolution chain. Serves outcomes 1 and 2.
3. `03-urls-and-origins` — URLs, origins and sites. A parser turns a URL into parts; scheme, host and port make the origin. Visual: URL anatomy. Serves outcome 6.
4. `04-http-messages` — HTTP messages. Requests and responses share one structure of start line, headers and body. Visual: HTTP message anatomy. Serves outcome 1.
5. `05-http-versions` — HTTP/1.1, HTTP/2 and HTTP/3. Each version moves head-of-line blocking to a different layer. Visual: interactive HTTP versions lab. Serves outcome 3.
6. `06-tls-and-https` — TLS and HTTPS. The TLS 1.3 handshake takes one round trip, and the certificate chain proves the server's name. Visual: handshake animation and explainer video. Serves outcome 4.
7. `07-http-caching` — HTTP caching. Freshness, revalidation with validators, and cache busting for hashed assets. Visual: hybrid HTTP cache lab. Serves outcome 5.
8. `08-cdns-and-the-edge` — CDNs and the edge. A CDN point of presence answers from its cache by cache key and goes to the origin on a miss. Visual: CDN request path. Serves outcome 5.
9. `09-compression` — Compression. Client and server negotiate a content coding; the codecs trade size for CPU. Visual: compression comparison. Serves outcome 5.
10. `10-cookies` — Cookies. Domain, Path, Secure and SameSite decide which requests carry a cookie; prefixes lock its scope. Visual: interactive cookie send lab. Serves outcome 6.
11. `11-realtime-transports` — Realtime transports. Choose polling, Server-Sent Events, WebSockets or WebRTC by who sends the data and how much delay is fine. Visual: branching realtime transport deck. Serves outcome 7.
12. `12-api-styles-in-production` — REST, GraphQL and RPC in production. Where each style puts its contract decides what HTTP caching can do. Visual: API style map. Serves outcome 7.

## What you can do after it

1. Explain what happens on the network between typing a URL and the first byte of the page. Pages 1, 2 and 4.
2. Explain how DNS resolves a name and choose the right record type and TTL. Page 2 and mini project 1.
3. Compare HTTP/1.1, HTTP/2 and HTTP/3 and explain head-of-line blocking at each layer. Page 5.
4. Explain the TLS 1.3 handshake and the certificate chain of trust. Page 6.
5. Configure HTTP caching, CDN caching and compression for a static site with hashed assets. Pages 7–9 and mini project 2.
6. Set cookies with safe attributes and explain origin versus site. Pages 3 and 10 and mini project 3.
7. Choose a realtime transport and an API style for a product feature. Pages 11–12.

Continue with the [[03-mini-projects-internet-and-networking|mini projects]].

## My insights
