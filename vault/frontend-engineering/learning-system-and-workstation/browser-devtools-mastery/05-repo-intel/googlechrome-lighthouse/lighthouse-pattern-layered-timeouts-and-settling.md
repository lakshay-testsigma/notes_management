---
title: "GoogleChrome/lighthouse — pattern: layered timeouts and settling"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Layered timeouts and settling

## The problem

"Wait until the page has loaded" is not one thing. The load event can fire early. Analytics pixels and open sockets mean the network is never fully quiet. A hung tab never answers. Without limits a run never ends, and without clear errors you cannot tell a slow page from a broken one.

## What they do

Lighthouse uses layers. Each protocol command races a timer (default 30 s) and a crash signal, and Puppeteer's own timer is 50 ms longer so the Lighthouse error wins. The next command can get a one-shot timeout. The page wait combines FCP, load, three kinds of network idle and CPU idle, then races a maximum wait and an abort signal. On timeout it pings the page: no answer means `PAGE_HUNG`; an answer means the page was only slow. See [[Network idle]].

## Evidence

- `core/gather/session.js:12-14 @ 3b399f6`, `core/gather/session.js:126-134 @ 3b399f6` — command timeout and the 50 ms buffer.
- `core/gather/session.js:97-113 @ 3b399f6` — one-shot timeout for the next command.
- `core/gather/driver/network-monitor.js:147-161 @ 3b399f6` — fully idle, semi idle and critical idle.
- `core/gather/driver/wait-for-condition.js:433-453 @ 3b399f6` — combined waiters.
- `core/gather/driver/wait-for-condition.js:497-527 @ 3b399f6` — timeout, ping, hang or slow.
- `core/test/gather/session-test.js:134-173 @ 3b399f6` — fake-timer tests of the rules.

## When to use it, and when not to

Use it for any tool that drives a browser. Pick one idle definition that matches the metric you report. Do not copy all three idle states if you only need "stop when the page is quiet enough", but always keep a hard limit and a hang check.

## Related

- [[Network idle]] — why zero requests is the wrong rule
- [[lighthouse-findings|Findings]]

## My insights
