# How a browser cache reuses one response

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
