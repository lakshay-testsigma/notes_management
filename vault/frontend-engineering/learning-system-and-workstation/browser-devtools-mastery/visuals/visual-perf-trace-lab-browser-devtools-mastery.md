---
title: "Performance trace lab: find the long task"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-measure-docs, web-dev-vitals-docs]
---
# Performance trace lab: find the long task

**Interactive experiences** · teaches Performance panel, Flame chart and long tasks, Live Core Web Vitals, CPU throttling, Layout shifts track

**Why this visual.** Record a throttled trace, find the long task in the Main track, and show that splitting it brings INP under 200 ms.

**Hybrid learning lab (Mode D)** · level beginner · modes Watch, Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-performance-traces/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-perf-trace-intro-browser-devtools-mastery|perf-trace-intro]]
- Guided walkthrough (HyperFrames composition): [[visual-perf-trace-walkthrough-browser-devtools-mastery|perf-trace-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Final animated summary: [[visual-perf-trace-summary-browser-devtools-mastery|perf-trace-summary]]
- Static fallback: [[visual-perf-trace-flow-browser-devtools-mastery|perf-trace-flow]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/perf-trace-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build perf-trace-lab`).

## Checkpoints

- **explain.** In one sentence: why does a long task make a click feel slow? The main thread runs one task at a time, so the browser cannot paint the answer to the click until the long task ends.
- **predict.** The click handler task lasts 300 ms. Which part does the Performance panel shade red? Answer: The last 250 ms, the part over 50 ms. A long task is any task over 50 ms. DevTools shades only the time after the first 50 ms in red, so the red length shows how much the task went over.
- **predict.** On your laptop the handler takes 15 ms. What happens to it at 20x CPU slowdown? Answer: It runs much longer and can become a long task. CPU throttling makes the CPU slower than its usual ability, so every task on the main thread takes longer. A short handler on a fast laptop can become a long task on a slow device.
- **experiment.** In the simulation, keep 20x CPU and find the version of the handler whose INP is 200 ms or less. Step to its INP frame. Splitting the work lets the handler update the page in 40 ms and yield. The browser paints before the rest runs, so processing time drops from 300 ms to 40 ms and INP from 360 ms to 100 ms.
- **verify.** The Layout shifts track shows a cluster of purple diamonds. What CLS value counts as good? Answer: 0.1 or less. CLS is a score without a unit, built from the layout shifts on the Layout shifts track. A good page keeps it at 0.1 or less; 2.5 s is the LCP limit and 200 ms is the INP limit.

Needs first: Performance panel.

## What it shows

Watch, experiment with the simulation, step through the walkthrough, explore the deep dives and practice. Record a throttled trace, find the long task in the Main track, and show that splitting it brings INP under 200 ms.

Text alternative: An intro video shows Live metrics and how a busy main thread delays the paint after a click. A trace simulation lets the learner switch between no throttling, 20x CPU slowdown and a split handler, and step through the tasks, the long task and the INP breakdown. A guided walkthrough pauses at the long task, the throttling comparison and the fix, and a summary video gives the routine and the good values for LCP, INP and CLS. The numbers are one example trace.

## Check yourself

The click handler task lasts 300 ms. Which part does the Performance panel shade red?

Answer: The last 250 ms, the part over 50 ms. A long task is any task over 50 ms. DevTools shades only the time after the first 50 ms in red, so the red length shows how much the task went over.

## Sources

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-measure-docs`)
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals (`web-dev-vitals-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-performance-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/06-performance-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
