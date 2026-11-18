---
title: "How a browser cache reuses one response"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9111-http-caching, mdn-http-docs]
---
# How a browser cache reuses one response

**Video** · teaches [[HTTP caching]], Revalidation with ETag and Last-Modified

**Why this visual.** See when a stored response is reused, revalidated with a 304, or fetched again from the origin.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-intro/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-intro` (editable: change `video.json`, then `tutor video frontend-engineering/how-the-web-works/internet-and-networking build http-cache-intro`). Storyboard: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-cache-intro/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/how-the-web-works/internet-and-networking/http-cache-intro/composition/index.html`.

## Transcript

A browser asks for app.css. The first request misses and the cache stores the 200 response with max-age=60 and an ETag. At 30 seconds the copy is fresh and the cache answers alone. At 90 seconds the copy is stale, so the cache sends If-None-Match and the origin answers 304, which keeps the stored body.

**00:00 One stylesheet, one cache.** A cache keeps a copy of a response. Watch one browser cache reuse app.css.

**00:06 First request: a miss.** The first request finds no stored copy. The cache forwards it to the origin and stores the 200 response with its headers.

**00:16 Fresh means lifetime is greater than age.** A stored copy is fresh while its lifetime is greater than its age. Here max-age gives a lifetime of sixty seconds.

**00:26 At 30 seconds: a fresh hit.** At thirty seconds the age is thirty, so the copy is fresh. The cache answers alone, with no trip to the origin.

**00:35 At 90 seconds: stale, so ask first.** At ninety seconds the copy is stale. The cache asks the origin with If-None-Match. A 304 answer means keep your copy.

**00:46 304 or 200 after a revalidation.** A 304 sends only headers, so the cache reuses the stored body. A 200 sends a new body that replaces the copy.

Sources:

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP

## What it shows

A cache reuses a stored copy while its lifetime is greater than its age. After that it asks the origin, and a 304 answer keeps the copy.

Text alternative: A browser asks for app.css. The first request misses and the cache stores the 200 response with max-age=60 and an ETag. At 30 seconds the copy is fresh and the cache answers alone. At 90 seconds the copy is stale, so the cache sends If-None-Match and the origin answers 304, which keeps the stored body.

## Check yourself

A copy has max-age=60 and is 90 seconds old. What does the cache send before it reuses the copy?

Answer: A conditional request with If-None-Match and the stored ETag. A 304 answer lets it reuse the stored body.

## Sources

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111 (`rfc-9111-http-caching`)
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/07-http-caching/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/07-http-caching.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
