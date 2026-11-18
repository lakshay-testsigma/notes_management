---
title: "Conditional request validation"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Conditional request validation

Validation is a check a cache makes with the origin before reusing a stale response. It sends the stored ETag or Last-Modified value, and a 304 answer means the stored copy is still good.

## Where it shows up

- [[rfc-9111-http-caching-internet-and-networking]]
- [[undici-module-cache-semantics]]

## My insights
