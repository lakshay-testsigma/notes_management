# Storyboard: How a browser cache reuses one response

**Purpose.** See when a stored response is reused, revalidated with a 304, or fetched again from the origin.

**Why a video.** A cached response changes state as time passes, from missing to fresh to stale, so motion shows each step and its cause.

**Length.** 57.0 s, 6 scenes.

## 1. One stylesheet, one cache (0.0–6.0 s)

**On screen.** Title card with "Miss, fresh hit, stale revalidation".

**Narration and caption.** A cache keeps a copy of a response. Watch one browser cache reuse app.css.

**Sources.** rfc-9111-http-caching

## 2. First request: a miss (6.0–16.0 s)

**On screen.** Nodes Browser, Browser cache, Origin. A packet moves browser→cache (GET /app.css), cache→origin (no stored copy), origin→cache (200, max-age=60, ETag v1), cache→browser (store, then answer); each node lights up when the packet arrives.

**Narration and caption.** The first request finds no stored copy. The cache forwards it to the origin and stores the 200 response with its headers.

**Sources.** rfc-9111-http-caching

## 3. Fresh means lifetime is greater than age (16.0–26.0 s)

**On screen.** The expression fresh = lifetime > age with "lifetime", "age" highlighted in turn and explained.

**Narration and caption.** A stored copy is fresh while its lifetime is greater than its age. Here max-age gives a lifetime of sixty seconds.

**Sources.** rfc-9111-http-caching

## 4. At 30 seconds: a fresh hit (26.0–35.0 s)

**On screen.** Nodes Browser, Browser cache, Origin. A packet moves browser→cache (GET /app.css at 30 s), cache→browser (200 from cache, Age: 30); each node lights up when the packet arrives.

**Narration and caption.** At thirty seconds the age is thirty, so the copy is fresh. The cache answers alone, with no trip to the origin.

**Sources.** rfc-9111-http-caching

## 5. At 90 seconds: stale, so ask first (35.0–46.0 s)

**On screen.** Nodes Browser, Browser cache, Origin. A packet moves browser→cache (GET /app.css at 90 s), cache→origin (If-None-Match: v1), origin→cache (304 Not Modified), cache→browser (stored body, new headers); each node lights up when the packet arrives.

**Narration and caption.** At ninety seconds the copy is stale. The cache asks the origin with If-None-Match. A 304 answer means keep your copy.

**Sources.** rfc-9111-http-caching, mdn-http-docs

## 6. 304 or 200 after a revalidation (46.0–57.0 s)

**On screen.** Two columns, "304 Not Modified" and "200 OK", fill in pairs; verdict: Validation is a cheap question: has it changed?.

**Narration and caption.** A 304 sends only headers, so the cache reuses the stored body. A 200 sends a new body that replaces the copy.

**Sources.** rfc-9111-http-caching
