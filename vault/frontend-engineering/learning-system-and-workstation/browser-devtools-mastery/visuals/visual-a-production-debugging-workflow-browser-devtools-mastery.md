---
title: "Triage a production bug: pick the first panel"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs, chrome-devtools-network-reference, chrome-devtools-performance-reference, chrome-devtools-memory-docs, webkit-web-inspector-docs]
---
# Triage a production bug: pick the first panel

**Interactive experiences** · teaches Debugging workflow, Browser DevTools

**Why this visual.** Choose the first DevTools panel from a reported symptom and explain what evidence it gives and what a wrong first choice costs.

**Branching presentation (Mode C)** · level beginner · modes Deep dive, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/12-a-production-debugging-workflow/`. Run `npm run site:dev` first.

## Parts

- Branching deep dives: [[visual-debugging-triage-paths-browser-devtools-mastery|debugging-triage-paths]]
- Static fallback: [[visual-debugging-triage-decision-browser-devtools-mastery|debugging-triage-decision]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/a-production-debugging-workflow/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build a-production-debugging-workflow`).

## Checkpoints

- **predict.** A page loads slowly for new visitors but fast on a reload. Which panel do you open first? Answer: Network, with Disable cache ticked, then the slow request's Timing tab. A reload can use the cache, so the first visit is slower. Disable cache repeats the first visit, and the Timing tab shows whether Waiting or Content Download used the time.
- **predict.** After a deploy, some users still see old prices, even after a normal reload. Where do you look first? Answer: Application: the active service worker and Cache Storage. Old data that survives a reload can come from a cache or a service worker. The Application panel shows which worker is active and what Cache Storage holds, and Bypass for network tests the fresh path.
- **explain.** The tab gets slower each time a user opens and closes a dialog. Why does one heap snapshot not prove a leak? Answer: A leak is growth, so you compare a snapshot before and after the same action. Progressive slowdown points to a leak. Take a snapshot, open and close the dialog, take another, and the Comparison view shows what grew, such as detached DOM nodes.
- **verify.** A checkout button throws an error only on iPhones. Chrome device mode with an iPhone preset shows no error. What next? Answer: Attach Safari Web Inspector to a real iPhone and read its Console. Device mode is a first-order approximation that runs on your laptop. Remote debugging with Web Inspector reads the error from the phone's own browser.

## What it shows

Choose a path through the deck and open the deep dives. Choose the first DevTools panel from a reported symptom and explain what evidence it gives and what a wrong first choice costs.

Text alternative: A branching deck starts from six real symptoms: a slow first load, slow clicks, growing memory, a broken layout, old data after a deploy and an error only on an iPhone. Each branch opens the panel that records the matching evidence (Network, Performance, Memory, Elements, Application or remote debugging), shows what to read there, and compares it with a tempting wrong first panel.

## Check yourself

A page loads slowly for new visitors but fast on a reload. Which panel do you open first?

Answer: Network, with Disable cache ticked, then the slow request's Timing tab. A reload can use the cache, so the first visit is slower. Disable cache repeats the first visit, and the Timing tab shows whether Waiting or Content Download used the time.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)
- Network features reference — https://developer.chrome.com/docs/devtools/network/reference (`chrome-devtools-network-reference`)
- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-performance-reference`)
- Fix memory problems — https://developer.chrome.com/docs/devtools/memory-problems (`chrome-devtools-memory-docs`)
- Web Inspector Reference (WebKit) — https://webkit.org/web-inspector/ (`webkit-web-inspector-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/12-a-production-debugging-workflow/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/12-a-production-debugging-workflow.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
