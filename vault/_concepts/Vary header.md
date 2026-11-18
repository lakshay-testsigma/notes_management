---
title: "Vary header"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Vary header

The Vary response header names request headers, such as Accept-Encoding, that changed the response. A cache stores one copy per distinct value and reuses a copy only when those request headers match.

## Where it shows up

- [[rfc-9111-http-caching-internet-and-networking]]
- [[undici-module-cache-semantics]]

## My insights
