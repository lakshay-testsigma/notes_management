---
title: "Drop one packet in HTTP/1.1, HTTP/2 and HTTP/3"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9110-http-semantics, rfc-9114-http3, mdn-http-docs, hpbn-book, nodejs-undici-repo]
---
# Drop one packet in HTTP/1.1, HTTP/2 and HTTP/3

**Interactive experiences** · teaches HTTP/1.1, HTTP/2 and HTTP/3, Head-of-line blocking and multiplexing, Why domain sharding and sprites are anti-patterns now, Header compression and stream priorities, QUIC, 0-RTT and connection migration

**Why this visual.** Predict which responses stall after one lost packet in each HTTP version, and explain why.

**Interactive video lesson (Mode B)** · level intermediate · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/05-http-versions/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-http-versions-walkthrough-internet-and-networking|http-versions-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-rfc-9114-http3-mechanism-internet-and-networking|rfc-9114-http3-mechanism]]

Lesson definition: `projects/frontend-engineering/how-the-web-works/internet-and-networking/experiences/http-versions-lab/experience.json` (rebuild with `tutor experience frontend-engineering/how-the-web-works/internet-and-networking build http-versions-lab`).

## Checkpoints

- **experiment.** Load HTTP/1.1 on one connection. Step until the browser finally sends GET B. How many responses waited for A? One HTTP/1.1 connection carries one request and response at a time, so B and C cannot start until A is complete. That is head-of-line blocking at the HTTP layer, and it is why browsers open several connections per host.
- **predict.** On HTTP/2, one TCP packet that carries a frame of response A is lost. Which responses stall? Answer: A, B and C. HTTP/2 streams share one TCP byte stream. TCP releases bytes only in order, so the bytes of B and C that arrived after the gap wait until the lost packet is retransmitted.
- **predict.** The same packet of response A is lost, now on HTTP/3. Which responses stall? Answer: Only A. Each HTTP/3 request uses its own QUIC stream, and QUIC tracks loss per stream. Streams 4 and 8 have no gap, so B and C arrive; only stream 0 waits for the retransmission.
- **verify.** Who chooses whether a TLS connection speaks HTTP/2 or HTTP/1.1? Answer: The server picks one name from the client's ALPN list. With ALPN the client offers protocol names in its TLS handshake, in an order it chooses, and the server selects one. Node's undici offers http/1.1 first by default, so a server that follows the client's order picks HTTP/1.1.
- **verify.** A company network blocks UDP. What does a browser that supports HTTP/3 do? Answer: It falls back to HTTP/2 or HTTP/1.1 over TCP. HTTP/3 needs QUIC, and QUIC runs on UDP. RFC 9114 says clients should fall back to a TCP-based HTTP version when QUIC cannot connect, for example because of UDP filtering.

Needs first: HTTP request and response messages.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict which responses stall after one lost packet in each HTTP version, and explain why.

Text alternative: A guided walkthrough follows three files, A style.css, B app.js and C logo.png, through HTTP/1.1, HTTP/2 and HTTP/3 and drops one packet of response A in each. On HTTP/1.1, B and C wait behind A on the connection. On HTTP/2, all three stall because TCP releases bytes only in order. On HTTP/3, only A waits because each QUIC stream recovers its own loss. The walkthrough ends with ALPN and Alt-Svc, which choose the version. A stepper lets the learner replay the loss in each version.

## Check yourself

On HTTP/2, one TCP packet that carries a frame of response A is lost. Which responses stall?

Answer: A, B and C. HTTP/2 streams share one TCP byte stream. TCP releases bytes only in order, so the bytes of B and C that arrived after the gap wait until the lost packet is retransmitted.

## Sources

- RFC 9110: HTTP Semantics — https://www.rfc-editor.org/rfc/rfc9110 (`rfc-9110-http-semantics`)
- RFC 9114: HTTP/3 — https://www.rfc-editor.org/rfc/rfc9114 (`rfc-9114-http3`)
- HTTP (MDN Web Docs documentation set) — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- High Performance Browser Networking — https://hpbn.co/ (`hpbn-book`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/05-http-versions/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/05-http-versions.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
