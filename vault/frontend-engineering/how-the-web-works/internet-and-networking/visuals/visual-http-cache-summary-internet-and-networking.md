---
title: "Three questions decide every cached response"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9111-http-caching, mdn-http-docs]
---
# Three questions decide every cached response

**Video** · teaches [[HTTP caching]], [[Cache-Control directives]], Revalidation with ETag and Last-Modified, Cache busting with hashed filenames

**Why this visual.** Connect the cache key, the freshness check and revalidation into one decision for HTML pages and hashed assets.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-summary/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-summary` (editable: change `video.json`, then `tutor video frontend-engineering/how-the-web-works/internet-and-networking build http-cache-summary`). Storyboard: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-summary/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/how-the-web-works/internet-and-networking/http-cache-summary/composition/index.html`.

## Transcript

A cache answers three questions in order: is there a stored copy for this key, is it fresh, and if not, does the origin answer 304 or 200. The directives set the answers: no-store, no-cache, max-age and s-maxage. A common pattern gives HTML no-cache with an ETag and hashed assets a one-year max-age with immutable.

**00:00 Three questions, every request.** Three questions decide every cached response. The cache asks them in the same order each time.

**00:06 The cache asks in this order.** First, is there a stored copy for this key? Second, is it fresh? Third, if stale, does the origin answer 304 or 200?

**00:18 Directives set the answers.** no-store means never store. no-cache means store, but check first. max-age gives seconds of freshness, and s-maxage does so for shared caches.

**00:30 HTML page versus hashed asset.** Give the HTML page no-cache and an ETag, so it is never stale. Give hashed assets a one-year max-age and immutable.

Sources:

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP

## What it shows

The key, the lifetime and the validator together decide hit, revalidate or miss for every request.

Text alternative: A cache answers three questions in order: is there a stored copy for this key, is it fresh, and if not, does the origin answer 304 or 200. The directives set the answers: no-store, no-cache, max-age and s-maxage. A common pattern gives HTML no-cache with an ETag and hashed assets a one-year max-age with immutable.

## Check yourself

Which header set fits an HTML page that must never show an old version but should stay cheap to check?

Answer: Cache-Control: no-cache with an ETag, so every reuse is a small conditional request that usually ends in 304.

## Sources

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111 (`rfc-9111-http-caching`)
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/07-http-caching/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/07-http-caching.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
