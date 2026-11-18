---
title: "HTTP cache lab: hit, revalidate or miss"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9111-http-caching, mdn-http-docs, cloudflare-docs, nodejs-undici-repo]
---
# HTTP cache lab: hit, revalidate or miss

**Interactive experiences** · teaches [[HTTP caching]], [[Cache-Control directives]], Revalidation with ETag and Last-Modified, Vary, browser caches and shared caches, Cache busting with hashed filenames

**Why this visual.** Predict whether a request hits the cache, revalidates with a 304, or goes to the origin, from its headers and its age.

**Hybrid learning lab (Mode D)** · level intermediate · modes Watch, Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/07-http-caching/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-http-cache-intro-internet-and-networking|http-cache-intro]]
- Guided walkthrough (HyperFrames composition): [[visual-http-cache-walkthrough-internet-and-networking|http-cache-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Final animated summary: [[visual-http-cache-summary-internet-and-networking|http-cache-summary]]
- Static fallback: [[visual-rfc-9111-mechanism-internet-and-networking|rfc-9111-mechanism]]

Lesson definition: `projects/frontend-engineering/how-the-web-works/internet-and-networking/experiences/http-cache-lab/experience.json` (rebuild with `tutor experience frontend-engineering/how-the-web-works/internet-and-networking build http-cache-lab`).

## Checkpoints

- **explain.** In one sentence: why could the cache answer at 30 seconds without asking the origin? The copy was fresh: its lifetime from max-age=60 was greater than its age of 30 seconds. A fresh copy may be reused with no request to the origin.
- **predict.** The copy has max-age=60 and ETag "v1" and is now 90 seconds old. The file has not changed. What happens? Answer: The cache sends If-None-Match: "v1" and the origin answers 304. A stale copy needs validation before reuse. The cache sends the stored ETag in If-None-Match. The file is unchanged, so the origin answers 304 and the cache keeps the stored body.
- **predict.** An HTML page says Cache-Control: no-cache and has an ETag. What does the browser do on the next visit? Answer: It uses its stored copy only after the origin answers 304. no-cache lets a cache store the response but forbids reuse without validation. The browser sends If-None-Match, and a 304 lets it reuse the stored page. Only no-store forbids storing.
- **experiment.** In the simulation, step to the request that misses even though the old file is cached for a year. Which URL does it ask for? The cache key includes the URL. A new build gets a new hashed name, so the cache has no stored copy for it and must fetch it once. The year-long lifetime of the old URL does not matter.
- **experiment.** Load the Vary preset and step until the cache holds two copies of the same URL. Which request header made the second copy? Vary: Accept-Encoding says the stored response fits only requests with the same Accept-Encoding. The gzip request does not match the br copy, so the cache misses and stores a second copy.
- **verify.** A response says max-age=60, s-maxage=600. At 120 seconds, which cache still serves it as fresh? Answer: The CDN, a shared cache. Only shared caches read s-maxage, and for them it overrides max-age. The browser cache uses max-age=60, so its copy is stale at 120 seconds. The CDN copy is fresh until 600 seconds.

Needs first: HTTP request and response messages.

## What it shows

Watch, experiment with the simulation, step through the walkthrough, explore the deep dives and practice. Predict whether a request hits the cache, revalidates with a 304, or goes to the origin, from its headers and its age.

Text alternative: An intro video follows one stylesheet through a miss, a fresh hit and a stale revalidation with If-None-Match and 304. A simulation steps through request traces for seven header sets: max-age, no-cache, no-store, a heuristic lifetime, s-maxage at a CDN, Vary: Accept-Encoding, and hashed file names with immutable. A guided walkthrough loads each trace and pauses for predictions, and a summary video connects the cache key, the freshness check and revalidation.

## Check yourself

The copy has max-age=60 and ETag "v1" and is now 90 seconds old. The file has not changed. What happens?

Answer: The cache sends If-None-Match: "v1" and the origin answers 304. A stale copy needs validation before reuse. The cache sends the stored ETag in If-None-Match. The file is unchanged, so the origin answers 304 and the cache keeps the stored body.

## Sources

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111 (`rfc-9111-http-caching`)
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- Cloudflare developer documentation (DNS, Cache, Workers, Images) — https://developers.cloudflare.com/ (`cloudflare-docs`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/07-http-caching/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/07-http-caching.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
