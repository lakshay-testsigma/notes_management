---
title: "gzip compared with Brotli and Zstandard"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [mdn-http-docs, rfc-9110-http-semantics, nodejs-undici-repo]
---
# gzip compared with Brotli and Zstandard

**Comparison** · teaches HTTP compression, gzip, Brotli and Zstandard, Compression dictionaries

**Why this visual.** Let the learner choose a content coding for a static bundle and for per-request HTML, and see the size against CPU trade-off.

Interactive `CompareView`. Open it on the lesson site: `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/09-compression/`. Run `npm run site:dev` first.

## What it shows

gzip works with every HTTP client, and undici asks for it even over plain HTTP. Brotli and Zstandard give smaller text bodies at high levels but cost more CPU, and undici asks for them over HTTPS only (lib/web/fetch/index.js:1586-1591 @ 011d947). So compress static files once at build time with a high level, and use a fast level for HTML built per request.

Text alternative: Side-by-side comparison. Left, gzip: every client decodes it, it is offered even over plain HTTP, and it gives larger text bodies. Right, Brotli or Zstandard: smaller text bodies at high levels, high CPU cost at those levels, offered over HTTPS only. The verdict: pre-compress static files at build time and use a fast level for dynamic HTML.

## Check yourself

Why compress a hashed app.js at build time but HTML at request time with a fast level?

Answer: The hashed file never changes, so a slow high-level compression runs once and every user gets the smallest body. HTML changes per request, so slow compression would add CPU time to every response.

## Sources

- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- RFC 9110: HTTP Semantics — https://www.rfc-editor.org/rfc/rfc9110 (`rfc-9110-http-semantics`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/09-compression/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/09-compression.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
