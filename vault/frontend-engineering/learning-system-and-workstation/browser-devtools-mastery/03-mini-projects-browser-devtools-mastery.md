---
title: "Browser DevTools mastery (used in every phase) — mini projects"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: mini-projects
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-19
---

# Browser DevTools mastery (used in every phase) — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you what to write, the later ones tell you only what must work. Start in the `starter/` folder, run `npm start` to see the bug in Chrome, then run the tests and make them pass. Open `solution/` only after your tests pass or after you have used the hints. Read the [[02-lesson-browser-devtools-mastery|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | Debug an async race | A support engineer reproduces and fixes a search box that shows stale results because two fetches race | 2 h | guided | `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-01-debug-an-async-race/README.md` |
| 2 | Audit a slow page | A frontend developer finds why a product page loads slowly using the waterfall, a trace and Lighthouse, then fixes LCP | 2–3 h | less guided | `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-02-audit-a-slow-page/README.md` |
| 3 | Find the memory leak | A single-page app grows memory on every route change; the developer finds the detached nodes and the retaining listener | 2 h | independent | `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-03-find-the-memory-leak/README.md` |

## What each project proves

- **Project 1** proves that a conditional breakpoint and the async call stack show which response arrives last, and that a request id check or AbortController fixes the race. How it runs: [[visual-mini-01-flow-debug-an-async-race-browser-devtools-mastery]].
- **Project 2** proves that choosing the right panel finds each cause: the waterfall for the late hero image and slow API, a trace for the long click task, Lighthouse for the overall score. How it runs: [[visual-mini-02-flow-audit-a-slow-page-browser-devtools-mastery]].
- **Project 3** proves that heap snapshots and retainers lead from detached DOM nodes to the listener that keeps them alive. How it runs: [[visual-mini-03-flow-find-the-memory-leak-browser-devtools-mastery]].

## My insights
