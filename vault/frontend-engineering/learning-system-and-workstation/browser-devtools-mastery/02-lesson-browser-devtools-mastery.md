---
title: "Browser DevTools mastery (used in every phase) — lesson"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: lesson
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-19
---

# Browser DevTools mastery (used in every phase) — interactive lesson

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/` on the local address it prints.

Read the pages in order; each one takes about five minutes. Read the [[01-brief-browser-devtools-mastery|brief]] first.

## Pages

1. `01-what-devtools-are-for` — What DevTools are for. Start from the symptom to pick the panel. Visual: panel map diagram. Serves outcome 5.
2. `02-elements-and-styles` — Elements & Styles. The Styles tab shows the cascade; Computed shows the final value and the box model. Visual: before/after of a live CSS edit. Serves outcome 5.
3. `03-console-power-use` — Console power use. console.table, console.dir, `$0`, `$$`, copy, monitorEvents, live expressions and logpoints. Visual: code playground. Serves outcome 5.
4. `04-breakpoints-and-async-debugging` — Breakpoints and async debugging. A conditional breakpoint and the async call stack expose a race between two fetches. Visual: hybrid lab and pause/step/resume state machine. Serves outcome 2.
5. `05-source-maps-overrides-and-workspaces` — Source maps, overrides and workspaces. A source map turns a minified position back into your original line. Visual: position lookup diagram. Serves outcome 2.
6. `06-network-panel-waterfall` — Network panel: reading the waterfall. Each bar splits into queueing, DNS, connection, TLS, waiting (TTFB) and download. Visual: interactive waterfall lesson and timing phases sequence. Serves outcome 1.
7. `07-performance-panel-traces` — Performance panel: traces and Core Web Vitals. A trace finds the long task over 50 ms that slows a click. Visual: hybrid trace lab and main-thread flow. Serves outcomes 1 and 5.
8. `08-memory-leaks-and-heap-snapshots` — Memory leaks and heap snapshots. A leak is a retainer path from a GC root to a detached node. Visual: editable 3D retainer graph. Serves outcome 3.
9. `09-application-panel-storage` — Application panel. Which store holds the data and how long it lives, plus service workers, bfcache and speculative loads. Visual: storage map. Serves outcome 5.
10. `10-lighthouse-and-audit-panels` — Lighthouse and the audit panels. The score is a weighted average, so fix the costliest metric first. Visual: points-lost chart. Serves outcomes 4 and 5.
11. `11-firefox-safari-and-remote-devices` — Firefox, Safari and remote devices. Each phone browser has its own desktop inspector. Visual: connection diagram. Serves outcome 5.
12. `12-a-production-debugging-workflow` — A production debugging workflow. Symptom, panel, evidence, fix, then automate with Puppeteer and Lighthouse. Visual: branching triage deck. Serves outcomes 4 and 5.

## What you can do after it

1. Explain the phases of a network request shown in the waterfall. Pages 6 and 7, mini project 2.
2. Debug async JavaScript with conditional breakpoints and async call stacks. Pages 4 and 5, mini project 1.
3. Find a memory leak by comparing heap snapshots and reading retainers. Page 8, mini project 3.
4. Build a scripted page health report with the Chrome DevTools Protocol. Pages 10 and 12, the capstone.
5. Decide which DevTools panel to open first for a given symptom. Pages 1, 2, 3, 9, 11 and 12.

Continue with the [[03-mini-projects-browser-devtools-mastery|mini projects]].

## My insights
