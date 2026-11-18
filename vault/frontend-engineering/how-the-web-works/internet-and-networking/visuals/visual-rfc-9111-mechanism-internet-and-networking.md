---
title: "How a cache answers one request"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9111-http-caching]
---
# How a cache answers one request

**Workflow** · teaches [[HTTP caching]]

**Why this visual.** See the three outcomes of a cache lookup: fresh hit, validated reuse, or full fetch.

```mermaid
flowchart TD
  R[Request arrives] --> K{Stored response with same URI and matching Vary?}
  K -- no --> O[Forward to origin]
  K -- yes --> F{Fresh: lifetime > current_age?}
  F -- yes --> H[Serve from cache with Age]
  F -- no --> V[Conditional request: If-None-Match]
  V --> S{Origin answer}
  S -- 304 --> U[Update stored headers, reuse body]
  S -- 200 --> N[Use new response, may store it]
```

## What it shows

A cache first matches the URI and Vary fields. A fresh match is served at once. A stale match is checked with the origin: a 304 reuses the stored body, a 200 replaces it.

Text alternative: Flowchart: a request is matched against stored responses by URI and Vary. No match goes to the origin. A fresh match is served with an Age header. A stale match sends a conditional request; a 304 updates the stored headers and reuses the body, a 200 brings a new response.

## Check yourself

What does a cache do with a stale response that has an ETag?

Answer: It sends If-None-Match; a 304 lets it reuse the stored body, a 200 replaces it.

## Sources

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111 (`rfc-9111-http-caching`)

## Used in

- [[rfc-9111-http-caching-internet-and-networking]]

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
