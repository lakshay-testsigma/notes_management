---
title: "Record a trace and find the long task"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-performance-reference, webdev-optimize-long-tasks]
---
# Record a trace and find the long task

**Interactive experiences** · teaches Performance panel, Flame chart and long tasks, Core Web Vitals in DevTools

**Why this visual.** Read a main-thread trace, spot long tasks over 50 ms, and predict how CPU throttling and yielding change input delay.

**Hybrid learning lab (Mode D)** · level advanced · modes Watch, Explore, Guided, Deep dive, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-perf-trace-intro-browser-devtools-mastery|perf-trace-intro]]
- Guided walkthrough (HyperFrames composition): [[visual-perf-trace-guided-browser-devtools-mastery|perf-trace-guided]]
- Simulation: `AlgorithmStepper` with named presets
- Branching deep dives: [[visual-perf-deep-dives-browser-devtools-mastery|perf-deep-dives]]
- Final animated summary: [[visual-perf-trace-summary-browser-devtools-mastery|perf-trace-summary]]
- Static fallback: [[visual-chrome-devtools-performance-reference-mechanism-browser-devtools-mastery|chrome-devtools-performance-reference-mechanism]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/performance-panel-traces/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build performance-panel-traces`).

## Checkpoints

- **explain.** In one sentence: why does a 4x CPU slowdown not show you exactly how a phone runs your page? Throttling slows your own CPU by a factor, so the result is relative to your computer. A fast laptop at 4x is still not a given phone. Calibrated presets get closer to low and mid-tier devices.
- **predict.** The handler takes 40 ms with no throttling. You set a 4x slowdown and record again. What does the Main track show? Answer: One task of about 160 ms, marked as a long task. A 4x slowdown makes the CPU run four times as slowly, so the same work takes about 160 ms. That is over 50 ms, so DevTools marks it as a long task and shades the time past 50 ms red.
- **experiment.** Keep the 4x slowdown. Change how the work is split until the trace has no long task and a second click waits at most 20 ms. Yielding ends the task after each 40 ms piece. No piece passes 50 ms, and the browser can run the waiting click between pieces, so the click waits 15 ms instead of 135 ms. The total work is the same.
- **observe.** Load cpu 6x yield 4 pieces and step to the second frame. Watch which bars are highlighted. Yielding helps only when each piece stays under 50 ms on the slow device. A slower CPU makes every piece longer, so the work needs smaller pieces.
- **verify.** A task in the Main track lasts 120 ms. Which part does DevTools shade red? Answer: The last 70 ms, the time past 50 ms. DevTools shades only the part of a long task that is past 50 ms. That part is the blocking period: total time minus 50 ms.
- **verify.** In a trace, which interactions get a red triangle in the Interactions track? Answer: Interactions over 200 ms. The Interactions track marks interactions over 200 ms with a red triangle. Hover over one to see its input delay, processing time and presentation delay.
- **verify.** In the flame chart, handleClick sits directly below an anonymous function. What does that tell you? Answer: The anonymous function called handleClick. The x-axis is time and the y-axis is the call stack. Events on top cause the events below them, so the box under a function is a call it made. Width, not height, shows how long it ran.

## What it shows

Watch, experiment with the simulation, step through the walkthrough, explore the deep dives and practice. Read a main-thread trace, spot long tasks over 50 ms, and predict how CPU throttling and yielding change input delay.

Text alternative: An intro video records a trace of one slow click. A simulated Main track lets the learner pick CPU throttling (none, 4x, 6x) and one big task or yielding pieces, then step through the trace to see which tasks pass 50 ms, how much is shaded red, and how long a second click waits. A guided walkthrough explains the flame chart axes, deep dives cover yielding and the live Core Web Vitals, and a summary video connects the rules. The task times are a simulated example built on the 50 ms rule; real numbers depend on your machine.

## Check yourself

The handler takes 40 ms with no throttling. You set a 4x slowdown and record again. What does the Main track show?

Answer: One task of about 160 ms, marked as a long task. A 4x slowdown makes the CPU run four times as slowly, so the same work takes about 160 ms. That is over 50 ms, so DevTools marks it as a long task and shades the time past 50 ms red.

## Sources

- Performance features reference — https://developer.chrome.com/docs/devtools/performance/reference (`chrome-devtools-performance-reference`)
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks (`webdev-optimize-long-tasks`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/07-performance-panel-traces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
