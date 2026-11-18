---
title: "Change the cache headers and watch the outcome"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9111-http-caching, mdn-http-docs, cloudflare-docs, nodejs-undici-repo]
---
# Change the cache headers and watch the outcome

**Video** · teaches [[HTTP caching]], [[Cache-Control directives]], Revalidation with ETag and Last-Modified, Vary, browser caches and shared caches, Cache busting with hashed filenames

**Why this visual.** Predict how max-age, no-cache, no-store, heuristics, s-maxage, Vary and hashed file names change hit, revalidate and miss.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/how-the-web-works/internet-and-networking build http-cache-walkthrough`). Storyboard: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/how-the-web-works/internet-and-networking/http-cache-walkthrough/composition/index.html`.

## Transcript

The walkthrough steps through seven cache rules. max-age sets a lifetime; a stale copy revalidates with If-None-Match. no-cache stores but always revalidates, while no-store never stores. Without max-age a cache may guess about 10% of the time since Last-Modified. s-maxage gives shared caches such as a CDN their own lifetime. Vary keeps one copy per request header value. Hashed file names with a one-year max-age and immutable get a new cache key on every build.

**00:00 Change one header at a time.** Now change the headers yourself. Each scene loads a matching preset in the simulation beside the player.

**00:07 max-age=60 over two minutes.** With max-age set to sixty, requests at thirty and fifty-nine seconds are a HIT. At ninety seconds the copy is stale, so the cache must revalidate.

**00:19 Stale copy: If-None-Match, then 304.** The stale copy carries ETag v1. The cache sends If-None-Match v1. The origin answers 304, and the copy is fresh again.

**00:30 no-cache is not no-store.** no-cache stores the response but revalidates before every reuse. no-store never stores it, so every request goes to the origin.

**00:42 No max-age: a heuristic guess.** With no max-age and no Expires, a cache may guess a lifetime. A common guess is ten percent of the time since Last-Modified.

**00:53 s-maxage is for shared caches.** A CDN is a shared cache. For shared caches, s-maxage overrides max-age, so the CDN keeps the copy fresh for ten minutes.

**01:04 Vary: one copy per header value.** Vary Accept-Encoding makes the cache keep one copy per encoding. A gzip request cannot reuse the br copy.

**01:15 Hashed names: a new build is a new URL.** app.3f9a1c.js never changes, so it gets max-age of one year and immutable. A new build gets a new name, so a new cache key.

Sources:

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP
- Cloudflare developer documentation (DNS, Cache, Workers, Images) — https://developers.cloudflare.com/
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici

## What it shows

Every scene loads a matching preset in the simulation, so you can step through the same rule request by request.

Text alternative: The walkthrough steps through seven cache rules. max-age sets a lifetime; a stale copy revalidates with If-None-Match. no-cache stores but always revalidates, while no-store never stores. Without max-age a cache may guess about 10% of the time since Last-Modified. s-maxage gives shared caches such as a CDN their own lifetime. Vary keeps one copy per request header value. Hashed file names with a one-year max-age and immutable get a new cache key on every build.

## Check yourself

Why does a new hashed file name always cause a miss, even when the old file is cached for a year?

Answer: The cache key includes the URL. A new name is a new URL, so the cache has no stored copy for it.

## Sources

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111 (`rfc-9111-http-caching`)
- MDN Web Docs: HTTP and web networking — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- Cloudflare developer documentation (DNS, Cache, Workers, Images) — https://developers.cloudflare.com/ (`cloudflare-docs`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/07-http-caching/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/07-http-caching.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
