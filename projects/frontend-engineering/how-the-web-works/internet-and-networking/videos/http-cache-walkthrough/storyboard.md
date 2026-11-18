# Storyboard: Change the cache headers and watch the outcome

**Purpose.** Predict how max-age, no-cache, no-store, heuristics, s-maxage, Vary and hashed file names change hit, revalidate and miss.

**Why a video.** Each header changes what the cache does at the next request, so the walkthrough pauses on one header at a time while the simulation replays it.

**Length.** 87.0 s, 8 scenes.

## 1. Change one header at a time (0.0–7.0 s)

**On screen.** Title card with "Hit, revalidate or miss".

**Narration and caption.** Now change the headers yourself. Each scene loads a matching preset in the simulation beside the player.

**Sources.** rfc-9111-http-caching

## 2. max-age=60 over two minutes (7.0–19.0 s)

**On screen.** A timeline reveals MISS → HIT → HIT → revalidate → HIT.

**Narration and caption.** With max-age set to sixty, requests at thirty and fifty-nine seconds are a HIT. At ninety seconds the copy is stale, so the cache must revalidate.

**Sources.** rfc-9111-http-caching

## 3. Stale copy: If-None-Match, then 304 (19.0–30.0 s)

**On screen.** Nodes Browser cache, Origin. A packet moves cache→origin (If-None-Match: v1), origin→cache (304, update headers, keep body); each node lights up when the packet arrives.

**Narration and caption.** The stale copy carries ETag v1. The cache sends If-None-Match v1. The origin answers 304, and the copy is fresh again.

**Sources.** rfc-9111-http-caching, mdn-http-docs

## 4. no-cache is not no-store (30.0–42.0 s)

**On screen.** Two columns, "no-cache" and "no-store", fill in pairs; verdict: no-cache means check first, not do not store.

**Narration and caption.** no-cache stores the response but revalidates before every reuse. no-store never stores it, so every request goes to the origin.

**Sources.** rfc-9111-http-caching

## 5. No max-age: a heuristic guess (42.0–53.0 s)

**On screen.** The expression lifetime = 10% × (Date − Last-Modified) with "10%", "Last-Modified" highlighted in turn and explained.

**Narration and caption.** With no max-age and no Expires, a cache may guess a lifetime. A common guess is ten percent of the time since Last-Modified.

**Sources.** rfc-9111-http-caching, nodejs-undici-repo

## 6. s-maxage is for shared caches (53.0–64.0 s)

**On screen.** Two columns, "Browser cache (private)" and "CDN (shared)", fill in pairs; verdict: One response, two lifetimes.

**Narration and caption.** A CDN is a shared cache. For shared caches, s-maxage overrides max-age, so the CDN keeps the copy fresh for ten minutes.

**Sources.** rfc-9111-http-caching, cloudflare-docs

## 7. Vary: one copy per header value (64.0–75.0 s)

**On screen.** Numbered steps appear one at a time: br request: MISS, store the br copy → gzip request: no match, MISS, store the gzip copy → br request: HIT on the br copy.

**Narration and caption.** Vary Accept-Encoding makes the cache keep one copy per encoding. A gzip request cannot reuse the br copy.

**Sources.** rfc-9111-http-caching

## 8. Hashed names: a new build is a new URL (75.0–87.0 s)

**On screen.** Numbered steps appear one at a time: app.3f9a1c.js: max-age=31536000, immutable → Every visit: HIT, no trip to the origin → Deploy: the HTML names app.8b2e7d.js → New URL, new key: MISS, fetch once.

**Narration and caption.** app.3f9a1c.js never changes, so it gets max-age of one year and immutable. A new build gets a new name, so a new cache key.

**Sources.** rfc-9111-http-caching, mdn-http-docs, nodejs-undici-repo
