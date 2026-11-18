# Storyboard: Three questions decide every cached response

**Purpose.** Connect the cache key, the freshness check and revalidation into one decision for HTML pages and hashed assets.

**Why a video.** The cache asks its questions in a fixed order, and each answer decides the next question, so a short sequence fits.

**Length.** 42.0 s, 4 scenes.

## 1. Three questions, every request (0.0–6.0 s)

**On screen.** Title card with "Key, freshness, validation".

**Narration and caption.** Three questions decide every cached response. The cache asks them in the same order each time.

**Sources.** rfc-9111-http-caching

## 2. The cache asks in this order (6.0–18.0 s)

**On screen.** Numbered steps appear one at a time: Stored copy for this key? Key: URL plus Vary headers → Fresh? lifetime > age → Stale: If-None-Match, then 304 or 200.

**Narration and caption.** First, is there a stored copy for this key? Second, is it fresh? Third, if stale, does the origin answer 304 or 200?

**Sources.** rfc-9111-http-caching

## 3. Directives set the answers (18.0–30.0 s)

**On screen.** Numbered steps appear one at a time: no-store: never store → no-cache: store, check first → max-age: seconds of freshness → s-maxage: lifetime for shared caches.

**Narration and caption.** no-store means never store. no-cache means store, but check first. max-age gives seconds of freshness, and s-maxage does so for shared caches.

**Sources.** rfc-9111-http-caching

## 4. HTML page versus hashed asset (30.0–42.0 s)

**On screen.** Two columns, "HTML page" and "Hashed asset", fill in pairs; verdict: Pages stay current; assets never wait.

**Narration and caption.** Give the HTML page no-cache and an ETag, so it is never stale. Give hashed assets a one-year max-age and immutable.

**Sources.** rfc-9111-http-caching, mdn-http-docs
