---
title: "Browser DevTools mastery (used in every phase) — recall cards"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-19
---

# Browser DevTools mastery (used in every phase) — recall cards

## Cards

<!-- card: bdm-01 -->
A request bar in the waterfall is mostly "Waiting (TTFB)". What does that tell you, and where do you look next?
?
The browser sent the request and the server was slow to send the first byte. Look at the server or API, not the network or the file size.

<!-- card: bdm-02 -->
A search box sometimes shows results for an older query. Which breakpoint and which DevTools view prove the cause?
?
A conditional breakpoint on the render line (for example `query !== latestQuery`) plus the async call stack, which shows the older fetch that scheduled this callback.

<!-- card: bdm-03 -->
Memory grows on every route change in a single-page app. How do you find what keeps the old view alive?
?
Take a heap snapshot, change routes, take another, compare them, filter for Detached, and read the retainers path back to the listener or cache that holds the nodes.

<!-- card: bdm-04 -->
How can a script check page health the same way you do by hand in DevTools?
?
DevTools and tools like Puppeteer both speak the Chrome DevTools Protocol, so a script can record Network and trace events and analyze them with plain functions.

<!-- card: bdm-05 -->
Decide: users report a broken layout, a slow click, stale stored data, and an error only on iPhone. Which panel or tool first for each?
?
Layout: Elements and Styles. Slow click: Performance trace. Stale data: Application panel. iPhone only: Safari Web Inspector from a Mac.

<!-- card: bdm-06 -->
Why does a task longer than 50 ms hurt a click, and what is the usual fix?
?
The main thread cannot handle input until the task ends, so the click waits. Split the work into smaller pieces and yield between them.

<!-- card: bdm-07 -->
You throttle the CPU 4x on a fast laptop and see no long tasks, yet field INP is poor. Why?
?
CPU throttling is relative to your machine, so it only approximates slow phones. Check field data and test on a real low-end device.

<!-- card: bdm-08 -->
A breakpoint in your source file pauses in unrelated code. What is the likely cause?
?
The source map is missing or stale, so DevTools maps the minified position to the wrong original line. Rebuild and redeploy the map with the bundle.

<!-- card: bdm-09 -->
What does the `mappings` field of a source map store, and how is it encoded?
?
Segments that link a generated line and column to a source file, line, column and optional name, written as Base64 VLQ deltas from the previous segment.

<!-- card: bdm-10 -->
Lighthouse gives a low performance score. Why fix TBT or LCP before Speed Index?
?
The score is a weighted average and TBT (30) and LCP (25) weigh more than Speed Index (10), so they move the score most.

<!-- card: bdm-11 -->
console.table versus console.dir: when do you use each?
?
console.table shows an array of objects as rows and columns for comparison. console.dir shows one object's properties as an expandable tree, also for DOM nodes.

<!-- card: bdm-12 -->
Compare: debugging Android Chrome versus iOS Safari from your desktop.
?
Android Chrome: connect by USB and open chrome://inspect in desktop Chrome. iOS Safari: enable Web Inspector on the device and use Safari's Develop menu on a Mac.

<!-- card: bdm-13 -->
Look at the request timing phases diagram. With network throttling set to slow 4G, which phases grow most?
?
The connection and Content Download phases grow, because each round trip and each byte takes longer; server Waiting time stays about the same. [[visual-request-timing-phases-sequence-browser-devtools-mastery]]

<!-- card: bdm-14 -->
Look at the detached tree retainer graph. If you cut the edge from the cached array to the detached node, what happens to it?
?
No path from a GC root reaches it any more, so the garbage collector can free it. [[visual-detached-tree-retainer-graph-browser-devtools-mastery]]

<!-- card: bdm-15 -->
In the main-thread flow, why does one long task delay the click while yielding pieces do not?
?
Input can be handled only between tasks; yielding creates gaps where the click handler runs. [[visual-main-thread-long-task-flow-browser-devtools-mastery]]

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| bdm-01 | explain the phases of a network request | [[visual-request-timing-phases-sequence-browser-devtools-mastery]], then lesson page `06-network-panel-waterfall` |
| bdm-02 | debug async JavaScript with breakpoints and async call stacks | [[visual-breakpoints-async-debugging-browser-devtools-mastery]], then lesson page `04-breakpoints-and-async-debugging` and mini project 1 |
| bdm-03 | find a memory leak with heap snapshots and retainers | [[visual-detached-tree-retainer-graph-browser-devtools-mastery]], then lesson page `08-memory-leaks-and-heap-snapshots` and mini project 3 |
| bdm-04 | build a scripted page health report with CDP | [[visual-how-it-works-browser-devtools-mastery]], then [[06-capstone-browser-devtools-mastery]] |
| bdm-05 | decide which panel to open first | [[visual-a-production-debugging-workflow-browser-devtools-mastery]], then lesson page `12-a-production-debugging-workflow` |
| bdm-06 | explain the phases of a network request (main thread side) | [[visual-main-thread-long-task-flow-browser-devtools-mastery]], then lesson page `07-performance-panel-traces` |
| bdm-07 | decide which panel to open first (field vs lab) | [[visual-performance-panel-traces-browser-devtools-mastery]], then lesson page `07-performance-panel-traces` |
| bdm-08 | debug async JavaScript (source maps) | [[visual-source-map-position-lookup-browser-devtools-mastery]], then lesson page `05-source-maps-overrides-and-workspaces` |
| bdm-09 | debug async JavaScript (source map format) | [[visual-ecma-426-source-map-mechanism-browser-devtools-mastery]], then the ECMA-426 digest in [[00-digests-browser-devtools-mastery]] |
| bdm-10 | build a scripted page health report (scoring) | [[visual-lighthouse-points-lost-browser-devtools-mastery]], then lesson page `10-lighthouse-and-audit-panels` |
| bdm-11 | decide which panel to open first (Console) | [[visual-console-table-vs-dir-browser-devtools-mastery]], then lesson page `03-console-power-use` |
| bdm-12 | decide which panel to open first (devices) | [[visual-remote-inspector-connections-browser-devtools-mastery]], then lesson page `11-firefox-safari-and-remote-devices` |
| bdm-13 | extra: read the request timing phases diagram | [[visual-request-timing-phases-sequence-browser-devtools-mastery]] |
| bdm-14 | extra: read the retainer graph | [[visual-detached-tree-retainer-graph-browser-devtools-mastery]] |
| bdm-15 | extra: read the main-thread long task flow | [[visual-main-thread-long-task-flow-browser-devtools-mastery]] |

## My insights
