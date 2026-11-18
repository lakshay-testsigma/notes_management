---
title: "Internet & networking — recall cards"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: recall
tags: [frontend-engineering, how-the-web-works, flashcards]
created: 2026-11-18
---

# Internet & networking — recall cards

## Cards

<!-- card: ian-01 -->
You press Enter on `https://example.com`. Name the network steps before the first response byte, in order.
?
DNS turns the name into an IP address. TCP (or QUIC) opens a connection. TLS encrypts it and checks the certificate. The browser sends the HTTP request, and a cache or the origin server answers. [[visual-how-it-works-internet-and-networking]]

<!-- card: ian-02 -->
A packet is lost on a TCP connection. What happens to the bytes that arrived after it?
?
TCP holds them back until the lost packet is sent again, because TCP delivers bytes in order. UDP would hand the later packets on at once. [[visual-packet-journey-internet-and-networking]]

<!-- card: ian-03 -->
You move a site to a new host tomorrow. Which DNS setting do you change today, and why?
?
Lower the TTL of the records you will change. Resolvers cache an answer for its TTL, so a low TTL makes the switch reach users fast and makes a mistake short. [[visual-dns-resolution-chain-internet-and-networking]]

<!-- card: ian-04 -->
When do you use a CNAME record instead of an A record?
?
A CNAME points a name at another name (for example a CDN host name) that manages its own addresses. An A record holds an IPv4 address directly.

<!-- card: ian-05 -->
What is the origin of `https://shop.example.com:8443/cart`, and what is its site?
?
Origin: `https://shop.example.com:8443` (scheme, host and port). Site: `https://example.com` (scheme plus registrable domain). [[visual-url-anatomy-internet-and-networking]]

<!-- card: ian-06 -->
HTTP/2 multiplexes many streams. Why can one lost packet still slow all of them, and how does HTTP/3 fix it?
?
HTTP/2 runs on one TCP connection, so TCP head-of-line blocking stops every stream until the packet is resent. HTTP/3 runs on QUIC, which recovers loss per stream, so only the affected stream waits. [[visual-http-versions-lab-internet-and-networking]]

<!-- card: ian-07 -->
How many round trips does a full TLS 1.3 handshake take, and what is the risk of 0-RTT data?
?
One round trip. 0-RTT data can be replayed by an attacker, so send only safe, idempotent requests in it. [[visual-tls13-handshake-internet-and-networking]]

<!-- card: ian-08 -->
What does the certificate chain prove to the browser?
?
That a certificate authority the browser trusts vouches for the server's public key and host name, through intermediate certificates up to a trusted root.

<!-- card: ian-09 -->
`no-cache` versus `no-store`: which one still keeps a copy?
?
`no-cache` keeps the copy but revalidates before each use. `no-store` keeps nothing. [[visual-http-cache-lab-internet-and-networking]]

<!-- card: ian-10 -->
A stale response has `ETag: "v42"`. What does the browser send, and what does an unchanged server return?
?
It sends `If-None-Match: "v42"`. The server returns `304 Not Modified` with no body, and the cache reuses its copy.

<!-- card: ian-11 -->
Which caching headers do you give a hashed asset (`app.3f9c.js`) and the HTML page that loads it?
?
The asset: `Cache-Control: public, max-age=31536000, immutable`, because a new build gets a new name. The HTML: `no-cache` (or a short max-age) so users get the new asset names.

<!-- card: ian-12 -->
A CDN serves German text to an English user. Which header was probably missing?
?
`Vary: Accept-Language`. Without it the CDN stores one copy per URL, not one per language. [[visual-cdn-request-path-internet-and-networking]]

<!-- card: ian-13 -->
A user on another site submits a form (POST) to your site. Does a `SameSite=Lax` cookie go with it?
?
No. Lax cookies go with same-site requests and with top-level GET navigations, not with a cross-site POST. [[visual-cookie-send-lab-internet-and-networking]]

<!-- card: ian-14 -->
What does the `__Host-` prefix force on a cookie?
?
It must have `Secure`, `Path=/` and no `Domain` attribute, so it is locked to the exact host that set it over HTTPS.

<!-- card: ian-15 -->
A dashboard needs one-way live updates from the server. Which transport do you choose, and why not WebSockets?
?
Server-Sent Events: one-way, plain HTTP, automatic reconnect. WebSockets are for two-way messages such as chat. [[visual-realtime-transport-deck-internet-and-networking]]

<!-- card: ian-16 -->
Why can a CDN cache a REST GET response more easily than a GraphQL query?
?
REST gives each resource its own URL, and caches key on the URL. GraphQL usually sends queries to one endpoint, often as POST, so the URL does not identify the data. [[visual-api-style-map-internet-and-networking]]

<!-- card: ian-17 -->
undici follows a redirect to another origin. Which request headers does it remove, and why?
?
`Authorization`, `Proxy-Authorization`, `Cookie` and `Host`, so credentials for one origin never leak to another. [[undici-findings]]

<!-- card: ian-18 -->
An API moves `POST /orders` to a new URL for good. Which redirect status keeps the POST and its body, and which one may turn it into a GET?
?
308 Permanent Redirect keeps the method and body (307 for a temporary move). 301 and 302 may change a POST into a GET, and 303 always does.

<!-- card: ian-19 -->
A logged-in user calls an admin-only endpoint. Should the server answer 401 or 403?
?
403. The credentials are valid but not enough. 401 means the credentials are missing or invalid, and it comes with `WWW-Authenticate` so the client can try again.

<!-- card: ian-20 -->
How does a video player jump to minute 30 without downloading the first 30 minutes?
?
It sends `Range: bytes=<start>-<end>`. A server that sends `Accept-Ranges: bytes` answers `206 Partial Content` with that part only; an out-of-bounds range gets 416.

<!-- card: ian-21 -->
Your client gets `429 Too Many Requests` with `Retry-After: 3600`. What should it do?
?
Stop sending requests to that server (or resource) for 3600 seconds, then retry. Retrying at once makes the rate limit last longer.

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| ian-01 | outcome 1: the request journey | [[visual-how-it-works-internet-and-networking]], then lesson page `01-how-the-internet-works`, listed in [[02-lesson-internet-and-networking]] |
| ian-02 | outcome 1: packets and TCP | lesson page `01-how-the-internet-works` |
| ian-03 | outcome 2: TTL | [[visual-dns-resolution-chain-internet-and-networking]], then lesson page `02-domains-dns-and-hosting` |
| ian-04 | outcome 2: record types | lesson page `02-domains-dns-and-hosting` and [[03-mini-projects-internet-and-networking]] |
| ian-05 | outcome 6: origin and site | lesson page `03-urls-and-origins` and [[whatwg-url-standard-internet-and-networking]] |
| ian-06 | outcome 3: head-of-line blocking | [[visual-http-versions-lab-internet-and-networking]], then lesson page `05-http-versions` |
| ian-07 | outcome 4: TLS 1.3 handshake | [[rfc-9846-tls13-internet-and-networking]], then lesson page `06-tls-and-https` |
| ian-08 | outcome 4: chain of trust | lesson page `06-tls-and-https` |
| ian-09 | outcome 5: no-cache and no-store | [[visual-http-cache-lab-internet-and-networking]], then lesson page `07-http-caching` |
| ian-10 | outcome 5: revalidation | [[rfc-9111-http-caching-internet-and-networking]] |
| ian-11 | outcome 5: hashed assets | lesson page `07-http-caching` and [[03-mini-projects-internet-and-networking]] |
| ian-12 | outcome 5: CDN cache keys | lesson page `08-cdns-and-the-edge` |
| ian-13 | outcome 6: SameSite | [[visual-cookie-send-lab-internet-and-networking]], then lesson page `10-cookies` |
| ian-14 | outcome 6: cookie prefixes | lesson page `10-cookies` and [[cookie-findings]] |
| ian-15 | outcome 7: realtime transports | lesson page `11-realtime-transports` |
| ian-16 | outcome 7: API styles | lesson page `12-api-styles-in-production` |
| ian-17 | outcome 6: credentials on redirects | [[undici-findings]] and [[06-capstone-internet-and-networking]] |
| ian-18 | outcome 1: redirects | lesson page `04-http-messages` |
| ian-19 | outcome 1: authentication status codes | lesson page `04-http-messages` |
| ian-20 | outcome 1: range requests | lesson page `04-http-messages` |
| ian-21 | outcome 1: rate limits | lesson page `04-http-messages` |

## My insights
