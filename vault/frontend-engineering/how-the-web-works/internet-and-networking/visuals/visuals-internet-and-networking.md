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

## Comparison

- [[visual-rfc-9114-http3-mechanism-internet-and-networking|Why HTTP/3 avoids transport head-of-line blocking]] — Show why one lost packet hurts every request on HTTP/2 over TCP but only one request on HTTP/3 over QUIC.

## Architecture

- [[visual-cookie-module-map-internet-and-networking|jshttp/cookie: module map]] — Show how the four parts of the cookie library relate, so the learner knows where each rule lives.
- [[visual-undici-module-map-internet-and-networking|nodejs/undici: module map]] — Show which part of undici does which job in the HTTP message path, so the learner knows where cache, version and cookie rules live.

## Sequence

- [[visual-cookie-request-flow-internet-and-networking|jshttp/cookie: read a Cookie header, write a Set-Cookie header]] — Show the order of calls when a server reads the cookies of a request and sets one in the response.
- [[visual-undici-request-flow-internet-and-networking|nodejs/undici: a cached GET that needs revalidation]] — Show the order of calls for one GET through the cache interceptor, the connector and the origin.

## My insights
