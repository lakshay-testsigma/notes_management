---
title: "Change the conditions and watch the request phases grow"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-network-reference]
---
# Change the conditions and watch the request phases grow

**Interactive experiences** · teaches [[Network panel]], [[Request timing phases]]

**Why this visual.** Name the timing phases of one request in order and say which phase a slow network, a slow server or the cache changes.

**Interactive video lesson (Mode B)** · level beginner · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-network-panel-waterfall/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-network-waterfall-walkthrough-browser-devtools-mastery|network-waterfall-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-request-timing-phases-sequence-browser-devtools-mastery|request-timing-phases-sequence]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/network-panel-waterfall/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build network-panel-waterfall`).

## Checkpoints

- **predict.** Which phase must finish before Request sent can start on a new HTTPS connection? Answer: Initial connection, with its TCP handshakes and SSL negotiation. The Timing tab lists the phases in order. The request travels over the connection, so Initial connection, which covers the TCP handshakes and SSL negotiation, comes before Request sent.
- **experiment.** Load the Slow server preset and step to the last phase. Which bar is now the longest, and how does it compare with the No throttling preset? Waiting (TTFB) is one round trip plus server processing time. A slow server adds processing time, so only Waiting grows while Content Download stays short.
- **predict.** You switch Throttling from No throttling to Slow 4G. Which phases grow the most? Answer: Waiting (TTFB) and Content Download. Waiting includes one round trip and Content Download reads the body over the network. A slower network makes each round trip and each byte slower, so these two phases grow.
- **predict.** Disable cache is off and you reload a page you visited before. What happens to a cached file? Answer: It loads from the browser cache, as on a repeat visit. Repeat visits normally load files from the browser cache. Disable cache turns that off, so the page loads like a first-time visit and every request goes to the network.
- **verify.** One request shows Queueing 900 ms and every other phase short. What is the most likely cause? Answer: Too many requests compete, for example for the six connections per origin of HTTP/1.1. Queueing is the time before the request starts: it waits for higher-priority requests, a free connection or disk cache space. A slow server shows in Waiting (TTFB), and a large file in Content Download.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Name the timing phases of one request in order and say which phase a slow network, a slow server or the cache changes.

Text alternative: A guided walkthrough of the Network panel Timing tab, paused for predictions, and a stepper that draws one request phase by phase: Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting (TTFB) and Content Download. Presets switch between no throttling, Fast 4G, Slow 4G, a slow server and a repeat visit with Disable cache off, so the learner sees which phases grow. All millisecond values are example numbers.

## Check yourself

Which phase must finish before Request sent can start on a new HTTPS connection?

Answer: Initial connection, with its TCP handshakes and SSL negotiation. The Timing tab lists the phases in order. The request travels over the connection, so Initial connection, which covers the TCP handshakes and SSL negotiation, comes before Request sent.

## Sources

- Network features reference — https://developer.chrome.com/docs/devtools/network/reference (`chrome-devtools-network-reference`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-network-panel-waterfall/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/06-network-panel-waterfall.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
