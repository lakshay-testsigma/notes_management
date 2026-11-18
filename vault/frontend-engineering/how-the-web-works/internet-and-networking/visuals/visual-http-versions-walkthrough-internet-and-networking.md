---
title: "One lost packet in HTTP/1.1, HTTP/2 and HTTP/3"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [rfc-9110-http-semantics, rfc-9114-http3, mdn-http-docs, hpbn-book, nodejs-undici-repo]
---
# One lost packet in HTTP/1.1, HTTP/2 and HTTP/3

**Video** · teaches HTTP/1.1, HTTP/2 and HTTP/3, Head-of-line blocking and multiplexing, Why HTTP/1-era workarounds such as domain sharding are anti-patterns now, Header compression and stream priorities, QUIC, 0-RTT and connection migration

**Why this visual.** See at which layer head-of-line blocking happens in each HTTP version, and how ALPN picks the version.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-versions-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-versions-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/how-the-web-works/internet-and-networking build http-versions-walkthrough`). Storyboard: `projects/frontend-engineering/how-the-web-works/internet-and-networking/videos/http-versions-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/how-the-web-works/internet-and-networking/http-versions-walkthrough/composition/index.html`.

## Transcript

A page needs three files: A style.css, B app.js and C logo.png. HTTP/1.1 sends one request at a time per connection, so B and C wait behind A. HTTP/2 interleaves all three as frames on one TCP connection, but when one TCP packet is lost, TCP holds back every byte after the gap, so all three stall. HTTP/3 gives each request its own QUIC stream, and QUIC recovers loss per stream, so only A waits. The version is chosen with ALPN during the TLS handshake: the client offers names, the server picks one. A server advertises h3 with Alt-Svc, and clients fall back to TCP when UDP is blocked.

**00:00 Three versions, one lost packet.** Three HTTP versions carry the same three files. Watch what one lost packet does in each version.

**00:07 Same meaning, new framing.** Methods, status codes and headers mean the same in every version. Only the framing and the transport change.

**00:15 HTTP/1.1: one request at a time.** On one HTTP/1.1 connection, the browser sends GET A, waits for response A, and only then sends GET B.

**00:24 Head-of-line blocking in HTTP.** If response A is slow, B and C wait behind it. So browsers open several TCP connections per host instead.

**00:33 HTTP/2: many streams, one TCP connection.** HTTP/2 splits messages into binary frames. Frames of streams A, B and C interleave on one TCP connection.

**00:42 One lost TCP packet stalls every stream.** A TCP packet with a frame of A is lost. TCP delivers bytes only in order, so frames of B and C wait too.

**00:51 HTTP/3: one QUIC stream per request.** HTTP/3 runs over QUIC on UDP. Each request gets its own QUIC stream: A on stream 0, B on 4, C on 8.

**01:00 The same loss stalls only A.** On HTTP/3 over QUIC, the same lost packet delays only stream 0, response A. On HTTP/2 over TCP, all three waited.

**01:10 ALPN picks the version.** During the TLS handshake, the client offers protocol names with ALPN, such as h2 and http/1.1. The server picks one.

**01:19 Finding HTTP/3 with Alt-Svc.** A server advertises h3 with the Alt-Svc header. The client opens QUIC with ALPN h3, and falls back to TCP if UDP is blocked.

Sources:

- RFC 9110: HTTP Semantics — https://www.rfc-editor.org/rfc/rfc9110
- RFC 9114: HTTP/3 — https://www.rfc-editor.org/rfc/rfc9114
- MDN Web Docs: HTTP and web networking — https://developer.mozilla.org/en-US/docs/Web/HTTP
- High Performance Browser Networking — https://hpbn.co/
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici

## What it shows

Head-of-line blocking moves down a layer with each version: HTTP/2 removes it from HTTP, and HTTP/3 removes it from the transport by using QUIC streams instead of one TCP byte stream.

Text alternative: A page needs three files: A style.css, B app.js and C logo.png. HTTP/1.1 sends one request at a time per connection, so B and C wait behind A. HTTP/2 interleaves all three as frames on one TCP connection, but when one TCP packet is lost, TCP holds back every byte after the gap, so all three stall. HTTP/3 gives each request its own QUIC stream, and QUIC recovers loss per stream, so only A waits. The version is chosen with ALPN during the TLS handshake: the client offers names, the server picks one. A server advertises h3 with Alt-Svc, and clients fall back to TCP when UDP is blocked.

## Check yourself

One packet that carries part of response A is lost. Which responses wait on HTTP/2 over TCP, and which on HTTP/3?

Answer: On HTTP/2 over TCP, A, B and C all wait, because TCP releases bytes only in order. On HTTP/3, only A waits, because each QUIC stream recovers its own loss.

## Sources

- RFC 9110: HTTP Semantics — https://www.rfc-editor.org/rfc/rfc9110 (`rfc-9110-http-semantics`)
- RFC 9114: HTTP/3 — https://www.rfc-editor.org/rfc/rfc9114 (`rfc-9114-http3`)
- MDN Web Docs: HTTP and web networking — https://developer.mozilla.org/en-US/docs/Web/HTTP (`mdn-http-docs`)
- High Performance Browser Networking — https://hpbn.co/ (`hpbn-book`)
- nodejs/undici: HTTP/1.1 client for Node.js (fetch, cache interceptor, cookies) — https://github.com/nodejs/undici (`nodejs-undici-repo`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/05-http-versions/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/05-http-versions.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
