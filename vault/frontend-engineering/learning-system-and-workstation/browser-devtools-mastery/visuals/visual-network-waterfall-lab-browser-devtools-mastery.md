---
title: "Slow down a request and read its waterfall"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-network-docs, chromedevtools-devtools-frontend-repo]
---
# Slow down a request and read its waterfall

**Interactive experiences** · teaches Network panel, Waterfall timing phases, Network throttling and blocking, Initiator and priority, HAR export

**Why this visual.** Predict which timing phase of a request grows when throttling, server time, payload size or connection limits change.

**Interactive video lesson (Mode B)** · level intermediate · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/05-network-waterfall/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-network-waterfall-walkthrough-browser-devtools-mastery|network-waterfall-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-chrome-devtools-network-docs-mechanism-browser-devtools-mastery|chrome-devtools-network-docs-mechanism]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/network-waterfall-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build network-waterfall-lab`).

## Checkpoints

- **predict.** You switch the Throttling menu from No throttling to Slow 4G and reload. Which bars grow the most? Answer: Waiting (TTFB) and Content Download. Waiting is one round trip of latency plus server time, and Content Download depends on network speed. A slower network makes the round trip and the body transfer slower, so both bars grow.
- **experiment.** Load the slow-server preset in Explore and step until the request finishes. Which bar is long, and which stays short? Waiting (TTFB) is long while Content Download stays short. The network is fast, so the round trip is short, and the extra time is the server preparing the response.
- **predict.** Six connections to one HTTP/1.1 origin are already open. A seventh request starts. Which phase is long for it? Answer: Queueing. On HTTP/1.0 and 1.1 the browser delays a request when six TCP connections are already open for the origin. That delay is Queueing, before any byte goes to the server.
- **verify.** You hold Shift and hover over a request row. What do the green rows show? Answer: The initiators that caused this request. Shift plus hover marks the initiator chain of the request: its initiators turn green and its dependencies turn red.
- **verify.** You export a HAR file with the default settings and attach it to a bug report. Which headers are not in the file? Answer: Cookie, Set-Cookie and Authorization. The default HAR export is sanitized: it leaves out Cookie, Set-Cookie and Authorization. Only the setting Allow to generate HAR with sensitive data adds them, and such a file can leak credentials.

Needs first: Network panel.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict which timing phase of a request grows when throttling, server time, payload size or connection limits change.

Text alternative: A guided walkthrough of one request in the Chrome DevTools Network panel: the Timing tab phases Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting (TTFB) and Content Download, then the same request under Slow 4G throttling, a slow server, a large body and a full HTTP/1.1 connection pool. A bar stepper lets the learner load each condition, predict the long bar and step through the phases. All bar lengths are example values, not measurements. The walkthrough ends with the Initiator and Priority columns and a HAR export that leaves out Cookie, Set-Cookie and Authorization headers by default.

## Check yourself

You switch the Throttling menu from No throttling to Slow 4G and reload. Which bars grow the most?

Answer: Waiting (TTFB) and Content Download. Waiting is one round trip of latency plus server time, and Content Download depends on network speed. A slower network makes the round trip and the body transfer slower, so both bars grow.

## Sources

- Chrome DevTools: Network features reference — https://developer.chrome.com/docs/devtools/network/reference (`chrome-devtools-network-docs`)
- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend (`chromedevtools-devtools-frontend-repo`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/05-network-waterfall/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/05-network-waterfall.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
