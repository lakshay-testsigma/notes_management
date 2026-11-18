---
title: "Browser DevTools mastery (used in every phase) — lesson"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: lesson
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser DevTools mastery (used in every phase) — interactive lesson

## Open the lesson

The lesson pages live on the local site at
`/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/`. Start the
site with `npm run site:dev`, then open that path. Read the pages in order; each one takes
about five minutes. Read the [[01-brief-browser-devtools-mastery|brief]] first.

## Pages

1. `01-elements-and-styles` — Elements and Styles. The cascade turns every matching rule into one computed value. Visual: diagram from Styles to Computed. Serves outcome 1.
2. `02-console-power-use` — Console power use. Console utilities read and change live page state. Visual: diagram of the console utilities. Serves outcome 2.
3. `03-sources-and-breakpoints` — Sources panel. Pick the right breakpoint type, then read the async call stack to find a race. Visual: hybrid debugger lab. Serves outcome 2.
4. `04-source-maps-and-overrides` — Source maps and local overrides. A source map links minified code back to your original lines. Visual: diagram of a source map lookup. Serves outcome 2.
5. `05-network-waterfall` — Network panel. Each request splits into timing phases, and throttling changes which phase grows. Visual: interactive waterfall lab. Serves outcome 3.
6. `06-performance-traces` — Performance panel. A long task over 50 ms blocks input and raises INP. Visual: hybrid trace lab. Serves outcome 4.
7. `07-memory-leaks` — Memory panel. A reference path from a GC root keeps a leaked object alive. Visual: explainer video (storyboard) and retainer-path diagram. Serves outcome 4.
8. `08-application-storage` — Application panel. It shows the state a page saves: storage, service workers, caches and bfcache. Visual: diagram of storage areas. Supports outcome 4.
9. `09-audits-and-more-panels` — Lighthouse, Coverage, Rendering and other panels. Pick the panel from the symptom. Visual: symptom-to-panel diagram. Serves outcome 5.
10. `10-firefox-and-safari-devtools` — Firefox and Safari tools. Choose the browser tool by task. Visual: tool-choice diagram. Serves outcome 6.
11. `11-remote-device-debugging` — Real phones and device clouds. Attach desktop DevTools to Android Chrome and iOS Safari. Visual: remote-debugging paths diagram. Serves outcome 6.

## What you can do after it

1. Explain how the cascade produces an element's computed styles. Page 1.
2. Debug async code with breakpoints, the async call stack and source maps. Pages 2–4 and mini project 1.
3. Explain each timing phase of a request in the network waterfall. Page 5 and mini project 2.
4. Find a long task and a memory leak from traces and heap snapshots. Pages 6–8 and mini project 3.
5. Build a CLI that triages HAR, trace and Lighthouse files against budgets. Page 9 and the capstone.
6. Decide when to use Firefox, Safari or a real device instead of desktop Chrome. Pages 10–11.

Continue with the [[03-mini-projects-browser-devtools-mastery|mini projects]].

## My insights
