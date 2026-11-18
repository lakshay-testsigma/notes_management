# Three questions decide every cached response

A cache answers three questions in order: is there a stored copy for this key, is it fresh, and if not, does the origin answer 304 or 200. The directives set the answers: no-store, no-cache, max-age and s-maxage. A common pattern gives HTML no-cache with an ETag and hashed assets a one-year max-age with immutable.

**00:00 Three questions, every request.** Three questions decide every cached response. The cache asks them in the same order each time.

**00:06 The cache asks in this order.** First, is there a stored copy for this key? Second, is it fresh? Third, if stale, does the origin answer 304 or 200?

**00:18 Directives set the answers.** no-store means never store. no-cache means store, but check first. max-age gives seconds of freshness, and s-maxage does so for shared caches.

**00:30 HTML page versus hashed asset.** Give the HTML page no-cache and an ETag, so it is never stale. Give hashed assets a one-year max-age and immutable.

Sources:

- RFC 9111: HTTP Caching — https://www.rfc-editor.org/rfc/rfc9111
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP
