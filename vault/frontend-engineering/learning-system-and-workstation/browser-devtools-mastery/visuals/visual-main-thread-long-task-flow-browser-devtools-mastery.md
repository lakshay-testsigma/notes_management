---
title: "One slow click on the main thread becomes a long task"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-performance-reference, webdev-optimize-long-tasks]
---
# One slow click on the main thread becomes a long task

**Sequence** · teaches Flame chart and long tasks, Core Web Vitals in DevTools

**Why this visual.** See why one long task on the main thread delays the next paint after a click.

Interactive `FlowAnimation`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/`. Run `npm run site:dev` first.

## What it shows

The main thread runs one task at a time. A 400 ms click handler blocks it, so DevTools marks the task with a red triangle and shades the 350 ms past the 50 ms limit. Style and layout run after it, and the next frame paints late, which raises INP.

Text alternative: A click goes to the main thread, which runs handleClick_ for 400 ms, then style and layout, then the next frame. The trace marks 350 ms of the task red, so the paint after the click comes late.

## Check yourself

A click handler runs for 120 ms. How much of it does DevTools shade red?

Answer: 70 ms, the part past the 50 ms long-task limit.

## Sources

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-performance-reference`)
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks (`webdev-optimize-long-tasks`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/07-performance-panel-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
