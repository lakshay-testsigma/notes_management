---
title: "Internet & networking — digests"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: digest
tags: [frontend-engineering, how-the-web-works, digest]
created: 2026-11-18
sources: [whatwg-url-standard, rfc-9846-tls13, rfc-9114-http3, rfc-9111-http-caching]
---

# Digests for Internet & networking

These are the standards worth reading in full one day, each reduced to a ten-minute note.
Read them in this order. Each one builds on the one before it.

1. [[whatwg-url-standard-internet-and-networking|WHATWG URL Standard]] — it defines how a browser parses a URL into parts and how it computes an origin. Every request, cookie and security check starts from that record.
2. [[rfc-9846-tls13-internet-and-networking|RFC 9846: TLS 1.3]] — it defines the handshake that makes HTTPS private and authentic, so you can read a slow first connection or a certificate error.
3. [[rfc-9114-http3-internet-and-networking|RFC 9114: HTTP/3]] — it maps HTTP onto QUIC streams, so you can explain why HTTP/3 removes TCP head-of-line blocking.
4. [[rfc-9111-http-caching-internet-and-networking|RFC 9111: HTTP Caching]] — it defines freshness, validation and `Vary`, so you can choose `Cache-Control` headers that make repeat visits fast and stay correct.

Back to the map: [[00-start-here-internet-and-networking|Start here]].

## My insights
