---
title: "Traces and Web Vitals in four rules"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-measure-docs, web-dev-vitals-docs]
---
# Traces and Web Vitals in four rules

**Video** · teaches Performance panel, Flame chart and long tasks, Live Core Web Vitals, CPU throttling, Layout shifts track

**Why this visual.** Connect throttling, long tasks, INP and layout shifts into one routine for every performance check.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render perf-trace-summary`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-summary/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-summary` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build perf-trace-summary`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-summary/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/perf-trace-summary/composition/index.html`.

## Transcript

A recap: throttle the CPU before you record, find tasks over 50 ms in the Main track, read the interaction's input delay, processing time and presentation delay, fix it by splitting the work, and check LCP, INP and CLS against their good values.

**00:00 Four rules.** Four rules for every performance check.

**00:05 The routine.** Throttle the CPU. Record and click. Find tasks over 50 milliseconds. Split the work so the page paints first, then record again.

**00:21 The good values.** Then compare with the good values: LCP 2.5 seconds, INP 200 milliseconds, CLS 0.1.

Sources:

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals

## What it shows

A recording is evidence: measure, change one thing, and record again to see the number move.

Text alternative: A recap: throttle the CPU before you record, find tasks over 50 ms in the Main track, read the interaction's input delay, processing time and presentation delay, fix it by splitting the work, and check LCP, INP and CLS against their good values.

## Check yourself

After you split a long click handler, how do you prove the fix worked?

Answer: Record a new trace with the same CPU throttling and check that no task is over 50 ms and that INP is 200 ms or less.

## Sources

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-measure-docs`)
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals (`web-dev-vitals-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-performance-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/06-performance-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
