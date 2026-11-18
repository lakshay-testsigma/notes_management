---
title: "Browser DevTools mastery (used in every phase) — recall cards"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-18
---

# Browser DevTools mastery (used in every phase) — recall cards

## Cards

<!-- card: bdm-01 -->
A button is blue, but your stylesheet sets it to green. How do you find out why, using the Styles and Computed panes?
?
Open Computed to see the value the browser actually uses, then follow it back to the winning rule. In Styles, the green declaration is crossed out because a rule with higher priority in the cascade (a later layer, a higher specificity or later source order) won.

<!-- card: bdm-02 -->
A search box sometimes shows results for an old query. Which breakpoint and which panel part help you prove it is a race between two fetch responses?
?
Use a conditional breakpoint (or a logpoint, if pausing hides the race) where the results render, with a condition such as the query differs from the input value. Then read the async call stack to see which fetch started the stale response.

<!-- card: bdm-03 -->
A request has a long Waiting (TTFB) bar and a short Content Download bar. Where is the time going, and what is not the cause?
?
The server takes long to start its response. The network transfer and the response size are not the cause, because Content Download is short.

<!-- card: bdm-04 -->
A click feels slow on phones but fine on your laptop. How do you find the cause with the Performance panel?
?
Record a trace with CPU throttling, find the task over 50 ms that the click starts (marked red as a long task), and see which function takes the time in the flame chart. Split that work and record again to confirm that INP drops.

<!-- card: bdm-05 -->
Memory grows each time you open and close a dialog. Describe the heap snapshot procedure that finds the leak.
?
Take a snapshot, repeat the action several times, take a second snapshot and use the Comparison view. Select a leaked object (often a Detached node) and read its Retainers to find the reference that keeps it alive, then remove that reference.

<!-- card: bdm-06 -->
You want a CLI that triages HAR, trace and Lighthouse files against budgets. Which design idea from Lighthouse lets you re-check old reports without a browser?
?
Separate gathering from auditing: save the recorded artifacts once, then run audits on them as data. The perf-triage capstone reads the files as artifacts and only judges them.

<!-- card: bdm-07 -->
A layout bug appears only in Safari on an iPhone. Why is desktop Chrome device mode not enough, and what do you use instead?
?
Device mode only changes the viewport and user agent in Chrome's engine; it does not run WebKit. Turn on Web Inspector on the iPhone, connect it to a Mac, and inspect the tab from Safari's Develop menu.

<!-- card: bdm-08 -->
When do you pick Firefox DevTools over Chrome for a layout problem?
?
For grid, flex and font problems: Firefox overlays grid and flex layouts in detail and has a font editor that shows the fonts actually used. Chrome stays the choice for Lighthouse and Chromium-only panels.

<!-- card: bdm-09 -->
Why must a tool decode source map segments in order instead of reading one segment alone?
?
Each segment stores its values relative to the previous segment (relative base64 VLQ). You need the running totals to know the absolute line and column. [[visual-source-map-lookup-browser-devtools-mastery]]

<!-- card: bdm-10 -->
Which section of a heap snapshot shows what keeps a selected object alive, and what do you look for in it?
?
The Retainers section. Follow the path from a GC root down to the object and find the one reference your code can remove. [[visual-detached-node-retainer-path-browser-devtools-mastery]]

<!-- card: bdm-11 -->
You switch throttling from No throttling to Slow 4G and reload. Predict which waterfall bars grow the most for a large script.
?
The transfer phases grow most, mainly Content Download, and connection setup grows too. A slow server shows up in Waiting instead. [[visual-network-waterfall-lab-browser-devtools-mastery]]

<!-- card: bdm-12 -->
After a breakpoint shows the code is correct but the page is still slow, which step of the DevTools loop comes next?
?
Measure: open Performance for slow scripts or rendering, Network for slow requests, or Memory for growing memory. [[visual-how-it-works-browser-devtools-mastery]]

<!-- card: bdm-13 -->
You want to share a HAR file with another team. What risk must you handle first?
?
A HAR file can contain cookies, authorization headers and tokens. Export it sanitized (DevTools removes cookies, authorization and set-cookie in the sanitized export) and check it before you share it.

<!-- card: bdm-14 -->
You need every product card on the page as an array in the Console. What do you type, and why not `document.querySelectorAll`?
?
`$$('.card')`. It returns a real array, so you can use `map` and `filter` directly; `querySelectorAll` returns a NodeList.

<!-- card: bdm-15 -->
Local overrides fixed your CSS, but you edited a DOM node in Elements and the change is gone after reload. Why?
?
Local overrides save edited files (served responses), not DOM edits. Change the file through Sources with overrides enabled, so the saved copy is served on reload.

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| bdm-01 | outcome 1: explain how the cascade produces computed styles | [[visual-styles-to-computed-browser-devtools-mastery]], then lesson page `01-elements-and-styles`, listed in [[02-lesson-browser-devtools-mastery]] |
| bdm-02 | outcome 2: debug async code with breakpoints and the async call stack | [[visual-debugger-lab-browser-devtools-mastery]], then lesson page `03-sources-and-breakpoints` |
| bdm-03 | outcome 3: explain each timing phase in the waterfall | [[visual-network-waterfall-lab-browser-devtools-mastery]], then lesson page `05-network-waterfall` |
| bdm-04 | outcome 4: find a long task from a trace | [[visual-perf-trace-lab-browser-devtools-mastery]], then lesson page `06-performance-traces` |
| bdm-05 | outcome 4: find a memory leak from heap snapshots | [[visual-heap-snapshot-compare-browser-devtools-mastery]], then lesson page `07-memory-leaks` |
| bdm-06 | outcome 5: build a CLI that triages HAR, trace and Lighthouse files | [[06-capstone-browser-devtools-mastery]] and [[lighthouse-findings]] |
| bdm-07 | outcome 6: decide when to use Safari or a real device | [[visual-remote-debug-paths-browser-devtools-mastery]], then lesson page `11-remote-device-debugging` |
| bdm-08 | outcome 6: decide when to use Firefox | [[visual-browser-tool-choice-browser-devtools-mastery]], then lesson page `10-firefox-and-safari-devtools` |
| bdm-09 | outcome 2: source maps | [[visual-source-map-lookup-browser-devtools-mastery]], then lesson page `04-source-maps-and-overrides` |
| bdm-10 | outcome 4: retainers | [[visual-detached-node-retainer-path-browser-devtools-mastery]], then lesson page `07-memory-leaks` |
| bdm-11 | outcome 3: throttling and phases | [[visual-network-waterfall-lab-browser-devtools-mastery]], then lesson page `05-network-waterfall` |
| bdm-12 | the DevTools loop | [[visual-how-it-works-browser-devtools-mastery]], then [[01-brief-browser-devtools-mastery]] |
| bdm-13 | outcome 3: HAR export | lesson page `05-network-waterfall` and [[devtools-frontend-findings]] |
| bdm-14 | Console utilities | [[visual-console-utilities-map-browser-devtools-mastery]], then lesson page `02-console-power-use` |
| bdm-15 | outcome 2: local overrides | lesson page `04-source-maps-and-overrides`, listed in [[02-lesson-browser-devtools-mastery]] |

## My insights
