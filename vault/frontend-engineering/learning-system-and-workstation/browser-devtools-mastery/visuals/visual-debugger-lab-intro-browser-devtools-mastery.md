---
title: "A search race in the Sources panel"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-docs]
---
# A search race in the Sources panel

**Video** · teaches Sources panel debugging, Breakpoint types, Logpoints

**Why this visual.** See why a slow response can overwrite a newer one, and which parts of the Sources panel help you catch it.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-intro/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-intro` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build debugger-lab-intro`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-intro/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/debugger-lab-intro/composition/index.html`.

## Transcript

A search box sends a request for re and then for react. The react response arrives first and the late re response renders last, so the list shows the wrong results. The Sources panel has a Navigator, an Editor and a Debugger with the Breakpoints, Scope and Call Stack panes. A breakpoint pauses the page; a logpoint prints to the Console and does not pause.

**00:00 The search box shows the wrong results.** You type react, but the list shows results for re. Why?

**00:06 Two requests race.** The Search box calls onInput twice, for re and then for react. The Server answers react first. The re response comes back late.

**00:17 The Sources panel has three parts.** The Sources panel has three parts. The Navigator lists the files. The Editor shows the code. The Debugger shows Breakpoints, Scope and Call Stack.

**00:28 Breakpoint or logpoint.** A Breakpoint pauses the page, so you can read Scope and the Call Stack. A Logpoint never pauses. It prints a message in the Console.

**00:38 Your plan in this lab.** In this lab you run the race, pause on the stale response, and read the async call stack.

Sources:

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools

## What it shows

A race bug depends on timing, so you must stop the code at the right moment. Breakpoints pause it there; Scope and the Call Stack then show the values and the callers.

Text alternative: A search box sends a request for re and then for react. The react response arrives first and the late re response renders last, so the list shows the wrong results. The Sources panel has a Navigator, an Editor and a Debugger with the Breakpoints, Scope and Call Stack panes. A breakpoint pauses the page; a logpoint prints to the Console and does not pause.

## Check yourself

What is the difference between a breakpoint and a logpoint?

Answer: A breakpoint pauses the page so you can read Scope and the Call Stack. A logpoint prints a message in the Console and does not pause.

## Sources

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-sources-and-breakpoints/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/03-sources-and-breakpoints.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
