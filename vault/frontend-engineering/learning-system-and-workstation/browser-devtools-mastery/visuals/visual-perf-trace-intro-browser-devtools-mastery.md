---
title: "One slow click, recorded in a trace"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-performance-reference, webdev-optimize-long-tasks]
---
# One slow click, recorded in a trace

**Video** · teaches Performance panel, Flame chart and long tasks, Core Web Vitals in DevTools

**Why this visual.** See how a Performance recording shows a slow click as a long task on the main thread.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render perf-trace-intro`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-intro/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-intro` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build perf-trace-intro`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/perf-trace-intro/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/perf-trace-intro/composition/index.html`.

## Transcript

You open the Performance panel, set CPU throttling, record while you click a button, and stop. The Main track shows the click handler as a task. In this example the handler needs 40 ms, 160 ms at 4x and 240 ms at 6x. A task over 50 ms is a long task: DevTools adds a red triangle and shades the time past 50 ms.

**00:00 One slow click, recorded.** A button click feels slow. The Performance panel records a trace, so you can see the slow task.

**00:08 Record a runtime trace.** Open the Performance panel. Set CPU throttling. Click Record, click the button, then click Stop. The Main track shows the tasks.

**00:17 The click becomes a task.** The click starts a task on the main thread. The main thread runs one task at a time, so the next paint waits.

**00:27 Throttling slows the same work.** In this example the handler needs 40 milliseconds. A 4x slowdown makes it 160, and 6x makes it 240.

**00:35 Over 50 ms is a long task.** Any task over 50 milliseconds is a long task. DevTools adds a red triangle and shades only the time past 50 milliseconds red.

Sources:

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks

## What it shows

A trace turns a slow feeling into one task you can measure. The 50 ms limit tells you which tasks block the page.

Text alternative: You open the Performance panel, set CPU throttling, record while you click a button, and stop. The Main track shows the click handler as a task. In this example the handler needs 40 ms, 160 ms at 4x and 240 ms at 6x. A task over 50 ms is a long task: DevTools adds a red triangle and shades the time past 50 ms.

## Check yourself

A task lasts 160 ms. Is it a long task, and how much of it is red?

Answer: Yes. It is over 50 ms, so DevTools marks it and shades the last 110 ms red.

## Sources

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-performance-reference`)
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks (`webdev-optimize-long-tasks`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/07-performance-panel-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
