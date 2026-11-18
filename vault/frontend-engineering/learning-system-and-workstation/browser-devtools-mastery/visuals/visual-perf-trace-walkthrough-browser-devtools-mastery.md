---
title: "Find the long task in a trace"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-measure-docs, web-dev-vitals-docs]
---
# Find the long task in a trace

**Video** · teaches Performance panel, Flame chart and long tasks, Live Core Web Vitals, CPU throttling, Layout shifts track

**Why this visual.** Find the long task in the Main track, read the interaction's INP, and see how CPU throttling and a split task change it.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build perf-trace-walkthrough`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/perf-trace-walkthrough/composition/index.html`.

## Transcript

A guided walkthrough of one example trace: at 20x CPU slowdown a 15 ms click handler becomes a 300 ms long task, the interaction takes 360 ms, and splitting the work so the page paints first brings it down to 100 ms. The numbers are an example.

**00:00 Find the long task.** Here is one example trace of a single click.

**00:05 Read the flame chart.** The Main track is a flame chart. The x-axis is time. The y-axis is the call stack. Events on top cause the events below.

**00:17 One long task.** At 20x slowdown the click handler takes 300 milliseconds. A red triangle marks it, and the part over 50 milliseconds is red.

**00:29 The interaction's time.** The Interactions track splits the click into input delay, processing time and presentation delay. Here they add up to 360 milliseconds.

**00:43 Why throttle the CPU.** Without throttling, the same handler takes 15 milliseconds and INP is 18. The 20x slowdown shows what a slower device feels.

**00:57 Split the work.** Before: one 300 millisecond task. After: update the page in 40 milliseconds, then yield. The browser paints, the rest runs in short tasks, and INP drops to 100.

**01:11 Layout shifts track.** The Layout shifts track shows each shift as a purple diamond, grouped in clusters. Keep CLS at 0.1 or less.

Sources:

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals

## What it shows

CPU throttling makes main-thread work longer, so a handler that is short on a fast laptop can become a long task that delays the next paint.

Text alternative: A guided walkthrough of one example trace: at 20x CPU slowdown a 15 ms click handler becomes a 300 ms long task, the interaction takes 360 ms, and splitting the work so the page paints first brings it down to 100 ms. The numbers are an example.

## Check yourself

Why can a click handler that takes 15 ms on your laptop still give a poor INP for real users?

Answer: On a slower CPU the same work takes longer; at 20x slowdown it becomes a 300 ms long task that delays the next paint.

## Sources

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-measure-docs`)
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals (`web-dev-vitals-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-performance-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/06-performance-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
