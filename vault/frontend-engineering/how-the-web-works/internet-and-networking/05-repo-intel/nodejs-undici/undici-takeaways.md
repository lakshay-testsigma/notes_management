---
title: "nodejs/undici — takeaways"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: repo-intel
tags: [frontend-engineering, how-the-web-works, repo-intel]
created: 2026-11-18
sources: [nodejs-undici-repo]
---

# nodejs/undici — takeaways for the capstone

The capstone is the "site network report CLI": it reads saved DNS answers, TLS certificate data and HAR responses and reports problems in DNS, HTTPS and HSTS, HTTP version, caching, compression and cookies against a policy. These are the things worth borrowing. Undici is a client, so you borrow its rules, not its network code.

1. **Report which freshness rule won.** Write a small function that checks `s-maxage`, `max-age`, `Expires`, then a 10% `Last-Modified` heuristic, and returns the rule name with the lifetime. From [[undici-findings|finding 1]].
2. **Treat an unreadable header as its own result.** "Could not parse `Cache-Control`" is a finding, not a pass. Keep three results: ok, problem, unknown. From [[undici-pattern-fail-closed-parsing|fail closed]] and [[undici-findings|finding 2]].
3. **Flag shared-cache leaks.** A response with `Set-Cookie` and `public`, or `Authorization` traffic without `private`, `public`, `s-maxage` or `must-revalidate`, is a policy problem. From [[undici-findings|finding 3]].
4. **Check `Vary` against the encoding.** A compressed response needs `Vary: Accept-Encoding`; `Vary: *` defeats caching. From [[undici-findings|finding 4]].
5. **Read the negotiated HTTP version from the HAR data, not from guesses.** The server picks the version from the client's ALPN offer, so a report must say which client produced the data. From [[undici-findings|finding 5]].
6. **Check compression by coding and by type.** Flag a large text response without a coding, more than one stacked coding, and `compress`. Skip 204, 304 and HEAD. From [[undici-findings|finding 8]].
7. **Check cookie attributes the way the writer does.** `__Host-` needs `Secure`, `Path=/` and no `Domain`; `SameSite` must be an exact value; a name plus value over 4096 bytes is dropped by clients. From [[undici-findings|finding 9]].
8. **Test with fixtures and a written skip list.** Save sample HAR entries, store the expected findings next to them, and note every rule you do not check. From [[undici-findings|finding 10]] and [[undici-pattern-best-effort-cache|best-effort cache]].

## What not to copy

- Streaming a body into a store with backpressure, HTTP/2 PING probes and TLS session caches. A report CLI reads saved files and has no live connection.
- A persistent SQLite store. A plain JSON file or no store is enough for a learning project.
- The 12-way CI matrix and Node.js builds without features. One Node.js version on one OS is enough for the capstone.

## My insights
