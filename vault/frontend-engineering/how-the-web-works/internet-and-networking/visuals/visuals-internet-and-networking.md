---
title: "Visuals of Internet & networking"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
---
# Visuals of Internet & networking

Every diagram, simulation and video of this topic, with the concepts it teaches and the sources behind it. Open one, answer its check question, then read the explanation.

- [[concept-map-internet-and-networking|Concept map]] — how the concepts of this topic depend on each other

## Workflow

- [[visual-how-it-works-internet-and-networking|The journey of one web request]] — Show the order of the network steps behind every page load, so each later page has a place in one picture.
- [[visual-rfc-9111-mechanism-internet-and-networking|How a cache answers one request]] — See the three outcomes of a cache lookup: fresh hit, validated reuse, or full fetch.
- [[visual-rfc-9846-tls13-mechanism-internet-and-networking|The full TLS 1.3 handshake in three phases]] — Show which message belongs to which handshake phase and where encryption starts.
- [[visual-whatwg-url-standard-mechanism-internet-and-networking|From a URL string to a URL record, a serialization and an origin]] — Show that every URL string goes through one parser into a record of parts, and that the origin comes from that record, not from the raw text.
- [[visual-cdn-request-path-internet-and-networking|One request through a CDN]] — Show which layer of a CDN answers a request, where the cache key decides hit or miss, and what a purge removes.

## Comparison

- [[visual-rfc-9114-http3-mechanism-internet-and-networking|Why HTTP/3 avoids transport head-of-line blocking]] — Show why one lost packet hurts every request on HTTP/2 over TCP but only one request on HTTP/3 over QUIC.
- [[visual-api-style-map-internet-and-networking|One request in REST, GraphQL and Connect RPC, and which one HTTP caches]] — Show where each API style puts its contract in the HTTP request, and why only URL-based requests fit HTTP caching by default.
- [[visual-compression-compare-internet-and-networking|gzip compared with Brotli and Zstandard]] — Let the learner choose a content coding for a static bundle and for per-request HTML, and see the size against CPU trade-off.

## Architecture

- [[visual-cookie-module-map-internet-and-networking|jshttp/cookie: module map]] — Show how the four parts of the cookie library relate, so the learner knows where each rule lives.
- [[visual-undici-module-map-internet-and-networking|nodejs/undici: module map]] — Show which part of undici does which job in the HTTP message path, so the learner knows where cache, version and cookie rules live.
- [[visual-capstone-layers-internet-and-networking|Site network report: layers]] — Show the four layers of the capstone and that every dependency points inward to the domain.

## Sequence

- [[visual-cookie-request-flow-internet-and-networking|jshttp/cookie: read a Cookie header, write a Set-Cookie header]] — Show the order of calls when a server reads the cookies of a request and sets one in the response.
- [[visual-undici-request-flow-internet-and-networking|nodejs/undici: a cached GET that needs revalidation]] — Show the order of calls for one GET through the cache interceptor, the connector and the origin.
- [[visual-packet-journey-internet-and-networking|A request crosses the internet as packets]] — Show that a request travels as packets through routers, that TCP spends one round trip on a handshake, and that TCP resends a lost packet before the browser can read later bytes.
- [[visual-dns-resolution-chain-internet-and-networking|How a resolver finds the IP address for developer.mozilla.org]] — Show the fixed order of a DNS lookup on a cache miss, and that the TTL of the answer decides how long the resolver reuses it.
- [[visual-http-message-anatomy-internet-and-networking|One HTTP request and its response, part by part]] — Show that a request and a response have the same parts: a start line, header fields, an empty line and an optional body. Only the start line differs.
- [[visual-capstone-request-flow-internet-and-networking|Site network report: one run]] — Show one run from Cli to Report, including the invalid-input path and the crashing-check path.

## Video

- [[visual-tls13-handshake-internet-and-networking|How TLS 1.3 sets up HTTPS in one round trip]] — See which messages a TLS 1.3 handshake sends, in what order, and why the browser can send its first request after one round trip. · video storyboard
- [[visual-http-cache-intro-internet-and-networking|How a browser cache reuses one response]] — See when a stored response is reused, revalidated with a 304, or fetched again from the origin. · video storyboard
- [[visual-http-versions-walkthrough-internet-and-networking|One lost packet in HTTP/1.1, HTTP/2 and HTTP/3]] — See at which layer head-of-line blocking happens in each HTTP version, and how ALPN picks the version. · video storyboard
- [[visual-http-cache-walkthrough-internet-and-networking|Change the cache headers and watch the outcome]] — Predict how max-age, no-cache, no-store, heuristics, s-maxage, Vary and hashed file names change hit, revalidate and miss. · video storyboard
- [[visual-http-cache-summary-internet-and-networking|Three questions decide every cached response]] — Connect the cache key, the freshness check and revalidation into one decision for HTML pages and hashed assets. · video storyboard
- [[visual-cookie-send-walkthrough-internet-and-networking|How the browser picks the cookies for one request]] — Apply the Domain, Path, Secure and SameSite checks to decide which stored cookies one request carries. · video storyboard

## Interactive experiences

- [[visual-http-versions-lab-internet-and-networking|Drop one packet in HTTP/1.1, HTTP/2 and HTTP/3]] — Predict which responses stall after one lost packet in each HTTP version, and explain why. · Interactive video lesson (Mode B)
- [[visual-realtime-transport-deck-internet-and-networking|Choose a realtime transport for each feature]] — Pick polling, long polling, Server-Sent Events or WebSocket for a product feature and justify the choice by data direction and tolerated delay. · Branching presentation (Mode C)
- [[visual-http-cache-lab-internet-and-networking|HTTP cache lab: hit, revalidate or miss]] — Predict whether a request hits the cache, revalidates with a 304, or goes to the origin, from its headers and its age. · Hybrid learning lab (Mode D)
- [[visual-cookie-send-lab-internet-and-networking|Decide which cookies a request carries]] — Predict which stored cookies a request carries from Domain, Path, Secure and SameSite, and say what HttpOnly and the __Host- prefix change. · Interactive video lesson (Mode B)

## Decision tree

- [[visual-realtime-transport-decision-internet-and-networking|Choosing a realtime transport by who sends]] — Show how the direction of the data and the tolerated delay pick polling, long polling, Server-Sent Events or WebSocket.
- [[visual-cookie-send-checks-internet-and-networking|Which checks a stored cookie passes before a request carries it]] — Show the Domain, Path, Secure and SameSite checks that decide whether a request carries a stored cookie.

## Branching presentations

- [[visual-realtime-transport-paths-internet-and-networking|Pick a realtime transport for each feature]] — Decide between periodic polling, long polling, Server-Sent Events and WebSockets for four product features: a notification feed, a stock ticker, a chat and a collaborative cursor. · deck built

## Concept map

- [[visual-url-anatomy-internet-and-networking|The parts of https://shop.example.com:8443/cart?id=7#top]] — Show which parts of a parsed URL form the origin, which parts do not, and how the host gives the registrable domain that a site uses.

## Data flow

- [[visual-mini-01-flow-internet-and-networking|DNS record inspector flow]] — Show how the inspector turns one domain name into five record lookups, a report and a list of findings.
- [[visual-mini-02-flow-internet-and-networking|Cache header auditor: from HAR file to report]] — Show how one HAR response becomes findings, so the learner sees which function owns each rule.
- [[visual-mini-03-flow-internet-and-networking|Cookie attribute linter flow]] — Show how the linter turns raw Set-Cookie header strings into findings and an exit code.

## Deployment

- [[visual-capstone-deployment-internet-and-networking|Site network report: run recipe]] — Show what the process reads and writes when it runs locally or in the Docker container.

## My insights
