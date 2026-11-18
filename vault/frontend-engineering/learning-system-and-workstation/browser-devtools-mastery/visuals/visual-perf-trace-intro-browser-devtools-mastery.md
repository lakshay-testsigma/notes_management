---
title: "Why a click can feel slow"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-measure-docs, web-dev-vitals-docs]
---
# Why a click can feel slow

**Video** · teaches Performance panel, Live Core Web Vitals, Flame chart and long tasks

**Why this visual.** See how a busy main thread delays the next paint after a click, and how the Performance panel records it.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render perf-trace-intro`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-intro/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-intro` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build perf-trace-intro`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-intro/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/perf-trace-intro/composition/index.html`.

## Transcript

An intro to the Performance panel: Live metrics show LCP, CLS and INP for the open page, a recorded trace shows every task on the main thread, and a long task between a click and the next paint makes the interaction slow.

**00:00 Why a click can feel slow.** A click feels slow when the main thread is busy. The Performance panel shows why.

**00:06 Live metrics first.** Open the Performance panel. Live metrics show your local LCP and CLS at once. Click on the page, and INP appears too.

**00:18 From click to paint.** A click starts a task on the main thread. The handler runs. Only after it ends can the browser paint the next frame.

**00:32 Record a trace.** To see the cause, record a trace. Set a CPU slowdown in Capture settings, click Record, click the page, then click Stop.

**00:46 What good looks like.** Good values: LCP 2.5 seconds or less, INP 200 milliseconds or less, and CLS 0.1 or less.

Sources:

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals

## What it shows

The main thread runs one task at a time, so a long task holds back the paint that answers a click.

Text alternative: An intro to the Performance panel: Live metrics show LCP, CLS and INP for the open page, a recorded trace shows every task on the main thread, and a long task between a click and the next paint makes the interaction slow.

## Check yourself

What does the Performance panel show before you record anything?

Answer: Live metrics: your local LCP and CLS at once, and INP after you interact with the page.

## Sources

- Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-measure-docs`)
- web.dev: Core Web Vitals, long tasks and bfcache — https://web.dev/articles/vitals (`web-dev-vitals-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-performance-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/06-performance-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
