---
title: "Head-of-line blocking"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Head-of-line blocking

Head-of-line blocking happens when one stalled item holds up everything queued behind it. In HTTP/2 over TCP, one lost packet delays every request on the connection. In HTTP/3, a lost packet delays only its own QUIC stream.

## Where it shows up

- [[rfc-9114-http3-internet-and-networking]]

## My insights
