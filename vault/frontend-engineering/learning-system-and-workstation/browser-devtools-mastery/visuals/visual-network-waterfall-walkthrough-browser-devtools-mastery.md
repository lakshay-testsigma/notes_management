---
title: "Read the timing phases of one request"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-network-reference]
---
# Read the timing phases of one request

**Video** · teaches [[Network panel]], [[Request timing phases]]

**Why this visual.** Name the seven timing phases of one request in order and say what makes each phase grow.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/network-waterfall-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/network-waterfall-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build network-waterfall-walkthrough`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/network-waterfall-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/network-waterfall-walkthrough/composition/index.html`.

## Transcript

The Network panel Timing tab splits one request into Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting (TTFB) and Content Download. A slow server grows Waiting, Slow 4G throttling grows Waiting and Content Download, and a repeat visit with the cache on loads the file from the browser cache.

**00:00 One request, seven phases.** Open the Network panel, click one request, and open the Timing tab. It splits the request into phases.

**00:08 The phases, in order.** The phases run in this order: Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting, and Content Download.

**00:18 Queueing and Stalled are waits.** Queueing and Stalled are waits. The request waits for higher-priority requests, a free connection, or disk cache space.

**00:28 Find the server, then connect.** DNS Lookup finds the server IP address. Initial connection covers the TCP handshakes and the SSL negotiation.

**00:37 A slow server grows Waiting.** Waiting, or TTFB, is one round trip plus server time. In this example, a slow server makes Waiting the longest bar.

**00:47 Throttling grows the network phases.** Now set Throttling to Slow 4G. Waiting and Content Download grow, because each round trip and each byte is slower.

**00:57 Disable cache on or off.** Disable cache makes a first visit. Turn it off and reload: a repeat visit loads files from the browser cache instead.

**01:07 Read the longest phase first.** Read the longest phase first. Long Waiting points at the server, long Content Download at size or network, long Queueing at competition.

Sources:

- Network features reference — https://developer.chrome.com/docs/devtools/network/reference

## What it shows

Read the longest phase first: it tells you where the time goes. The millisecond values in this walkthrough are example numbers, not measurements.

Text alternative: The Network panel Timing tab splits one request into Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting (TTFB) and Content Download. A slow server grows Waiting, Slow 4G throttling grows Waiting and Content Download, and a repeat visit with the cache on loads the file from the browser cache.

## Check yourself

Waiting (TTFB) is long and Content Download is short. Where do you look first?

Answer: At the server: Waiting is one round trip plus server processing time, so a long Waiting with a short download points at server time.

## Sources

- Network features reference — https://developer.chrome.com/docs/devtools/network/reference (`chrome-devtools-network-reference`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-network-panel-waterfall/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/06-network-panel-waterfall.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
