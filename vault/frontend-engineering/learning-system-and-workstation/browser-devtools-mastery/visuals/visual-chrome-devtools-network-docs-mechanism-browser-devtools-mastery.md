---
title: "Request timing phases in the Network Timing tab"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-network-docs]
---
# Request timing phases in the Network Timing tab

**Workflow** · teaches Waterfall timing phases

**Why this visual.** Learn the order of the phases a request passes through, so you can name the slow one.

```mermaid
flowchart LR
  Q[Queueing] --> S[Stalled]
  S --> D[DNS Lookup]
  D --> C[Initial connection]
  C --> R[Request sent]
  R --> W[Waiting TTFB]
  W --> L[Content Download]
```

## What it shows

A request waits in the queue, may stall, resolves the server address, connects, sends the request, waits for the first byte, then downloads the body. The slow phase tells you whether to fix the network, the server or the payload.

Text alternative: Flowchart of seven phases in order: Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting for first byte (TTFB), and Content Download. The widest bar shows where the request lost time.

## Check yourself

Which phase is long when the server is slow to build the response?

Answer: Waiting (TTFB), which includes one round trip plus the server's preparation time.

## Sources

- Chrome DevTools: Network features reference — https://developer.chrome.com/docs/devtools/network/reference (`chrome-devtools-network-docs`)

## Used in

- [[chrome-devtools-network-docs-browser-devtools-mastery]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
