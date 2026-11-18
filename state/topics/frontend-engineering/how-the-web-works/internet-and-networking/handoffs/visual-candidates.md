# Visual candidates (merged from research units)

## from visual-candidates-docs-dns-tls-urls-cookies.md
- sequence | type mozilla.org -> browser checks local DNS cache -> asks DNS server -> gets IP -> connects to web server | mdn-domain-names-docs, "How does a DNS request work?" | candidate for Video
- number | new domain info reaches all DNS servers within a few hours; cached records persist until they expire | mdn-domain-names-docs, "DNS refreshing" | experiment for an interactive TTL simulation
- sequence | TLS 1.3 handshake in three phases: Key Exchange, Server Parameters, Authentication | rfc-9846-tls13, §2 Protocol Overview | candidate for Video
- comparison | 1-RTT data vs 0-RTT early data (0-RTT not forward secret, weaker replay protection) | rfc-9846-tls13, §2.3 | branch for a deck
- parameter | SameSite value Strict / Lax / None decides whether a cookie is sent on a cross-site request; None requires Secure | mdn-cookies-guide-docs, "Controlling third-party cookies with SameSite" | experiment for an interactive cookie lab
- comparison | __Secure- requires Secure; __Host- requires Secure, no Domain, Path=/; __Http- requires Secure and HttpOnly | mdn-cookies-guide-docs, "Cookie prefixes" | candidate for CompareView
- dependency | a URL has parts (scheme, host, port, path, query, fragment) with percent-encoding of bytes | whatwg-url-standard, §4.1 and §1.3 | candidate for Diagram

## from visual-candidates-docs-edge-realtime-api.md
- comparison | default cache key parts: full URL (scheme, host, URI+query), Origin header, method-override headers, forwarding headers | cloudflare-cache-keys-docs, "Default cache key" | candidate for CompareView
- parameter | cache key template (query string, headers, cookie, host, device/geo/language) fragments one URL into many files or consolidates requests | cloudflare-cache-keys-docs, "Customize cache keys" | experiment for an interactive cache-hit simulator
- comparison | WebSocket (no backpressure, bidirectional) vs WebTransport (backpressure, unidirectional streams, datagrams, out-of-order) | mdn-websockets-api-docs, "Limitations" and alternatives | candidate for CompareView
- state change | message flood without backpressure fills memory or pins CPU | mdn-websockets-api-docs, "Limitations" | candidate for Video

## from visual-candidates-docs-http-core.md
- comparison | HTTP/2 over TCP: one lost packet stalls all active transactions; HTTP/3 each request on its own QUIC stream | rfc-9114-http3 §1.1, §2 | candidate for CompareView / Video
- dependency | each HTTP/3 request-response pair uses a single QUIC stream | rfc-9114-http3 §2 | candidate for Diagram
- architecture | QPACK uses separate unidirectional streams to update field table state | rfc-9114-http3 §2, §4.2.1 | candidate for Diagram
- state change | 0-RTT early data exposes requests to replay | rfc-9114-http3 §10.9 | candidate for Video
- decision | idempotent requests can be retried automatically after connection failure | rfc-9110-http-semantics §9.2.2 | branch for a deck
- sequence | cache hit fresh -> stale -> validation request -> 304 refreshes stored response | rfc-9111-http-caching §4.2, §4.3 | candidate for Video
- parameter | max-age and Age decide freshness lifetime | rfc-9111-http-caching §4.2.1, §4.2.3 | experiment for interactive CacheSim
- dependency | Vary header fields form part of the cache key | rfc-9111-http-caching §4.1 | candidate for Diagram
- comparison | private cache vs shared cache (proxy, managed) | mdn-http-caching-docs Types of caches | candidate for CompareView
- sequence | ETag sent; browser sends If-None-Match; server returns 304 | mdn-http-caching-docs Validation | candidate for Video
- decision | URL with hash and long max-age (immutable) vs revalidation for main HTML | mdn-http-caching-docs Common caching patterns | branch for a deck
- parameter | changing the hash in the URL makes a new cache entry | mdn-http-caching-docs Cache Busting | experiment for interactive lesson

## from visual-candidates-gap-01.md
- sequence | HSTS: first HTTPS visit sets max-age, later HTTP requests upgraded to HTTPS | mdn-http-docs, Reference/Headers/Strict-Transport-Security | candidate for Video
- number | HSTS preload needs max-age >= 31536000 and includeSubDomains | mdn-http-docs, Strict-Transport-Security | candidate for CompareView
- parameter | DNS TTL (default 300 s, min 60 s, max 1 day): longer is faster lookups, slower changes | cloudflare-docs, DNS TTL reference | experiment for an interactive experience
- decision | purge by URL vs tag vs hostname vs prefix vs everything | cloudflare-docs, Cache purge page | branch for a deck
- comparison | domain sharding on HTTP/1.x vs HTTP/2 (sharding deprecated, can hurt) | mdn-http-docs, Connection management in HTTP/1.x | candidate for CompareView
- sequence | certificate to CT log, SCT returned, SCT delivered via cert extension, TLS extension or OCSP stapling | mdn-http-docs, Certificate_Transparency | candidate for Video
- comparison | __Secure- vs __Host- prefix rules | mdn-http-docs, Cookies guide, Cookie prefixes | candidate for CompareView

## from visual-candidates-repos.md
- architecture | undici lib/ components: api, core, dispatcher, handler, interceptor, cache, web, mock | nodejs-undici-repo, directory listing of lib/ | candidate for Diagram
- architecture | cache stores: memory-cache-store and sqlite-cache-store behind the cache interceptor | nodejs-undici-repo, lib/cache listing | candidate for Diagram
- dependency | Express depends on cookie ^0.7.1 | jshttp-cookie-repo, express package.json dependencies | key fact only
