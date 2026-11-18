---
title: "Browser DevTools mastery (used in every phase) — mini projects"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: mini-projects
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser DevTools mastery (used in every phase) — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you
what to write, the last tells you only what must work. Start in the `starter/`
folder, run the tests, and make them pass. Open `solution/` only after your
tests pass or after you have used the hints. Read the
[[02-lesson-browser-devtools-mastery|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | Source map stack resolver | A support engineer maps a minified production stack trace back to original files and lines | 2.5 h | guided | `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-01-source-map-stack-resolver/README.md` |
| 2 | HAR waterfall report | A developer reads a saved HAR file and lists the slowest phases, uncached requests and render-blocking candidates | 2 h | less guided | `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-02-har-waterfall-report/README.md` |
| 3 | Trace long task finder | A developer reads a saved Performance trace and lists long tasks over 50 ms and layout shifts | 2 h | independent | `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-03-trace-long-task-finder/README.md` |

## What each project proves

- **Project 1** proves that a source map links generated code to original lines through base64 VLQ mappings, and that `ignoreList` folds third-party frames. How it runs: [[visual-mini-01-flow-source-map-stack-resolver-browser-devtools-mastery]].
  Related: [[Source maps]], [[Base64 VLQ]], [[Ignore listing]].
- **Project 2** proves that each request splits into timing phases, and that `-1` means "not applicable", not zero. How it runs: [[visual-mini-02-flow-browser-devtools-mastery]].
  Related: [[HAR file]], [[Network waterfall]].
- **Project 3** proves that a trace is data you can query: RunTask events over 50 ms are long tasks, and LayoutShift events explain CLS. How it runs: [[visual-mini-03-flow-trace-long-task-finder-browser-devtools-mastery]].

## My insights
