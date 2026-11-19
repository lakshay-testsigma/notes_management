---
title: "Performance traces in four rules"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-performance-reference, webdev-optimize-long-tasks]
---
# Performance traces in four rules

**Video** · teaches Performance panel, Flame chart and long tasks, Core Web Vitals in DevTools

**Why this visual.** Connect live metrics, traces, long tasks and yielding into one way of working.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render perf-trace-summary`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-summary/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-summary` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build perf-trace-summary`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-summary/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/perf-trace-summary/composition/index.html`.

## Transcript

A recap. Live metrics show LCP, CLS and INP while you use the page. A recorded trace shows each task on the main thread. A task over 50 ms is a long task, and only the part past 50 ms is red. Yielding splits long work so input can run between pieces. Throttling is relative to your computer, so it is a guide, not a phone.

**00:00 Performance traces in four rules.** Four rules connect everything you tried in this lab.

**00:05 The rules.** Live metrics spot the problem. A trace shows each task. A task over 50 milliseconds is a long task. Yielding splits long work.

**00:15 Same work, shorter wait.** At 4x in our example, one big task made a second click wait 135 milliseconds. Four yielding pieces cut it to 15.

**00:25 Throttling is a guide.** Throttling slows your own computer. It cannot copy a real phone, so check field data when you can.

Sources:

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks

## What it shows

Use live metrics to spot a problem, a trace to find the long task, and yielding to keep tasks short.

Text alternative: A recap. Live metrics show LCP, CLS and INP while you use the page. A recorded trace shows each task on the main thread. A task over 50 ms is a long task, and only the part past 50 ms is red. Yielding splits long work so input can run between pieces. Throttling is relative to your computer, so it is a guide, not a phone.

## Check yourself

You see a high INP in live metrics. What do you do next?

Answer: Repeat the slow interaction while you record a trace, then look for long tasks in the Main track and the Interactions track.

## Sources

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-performance-reference`)
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks (`webdev-optimize-long-tasks`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/07-performance-panel-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
