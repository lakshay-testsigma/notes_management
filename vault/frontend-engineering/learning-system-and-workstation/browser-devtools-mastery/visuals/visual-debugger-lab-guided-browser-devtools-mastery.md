---
title: "Catching the search race with breakpoints"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-docs, ecma-426-source-map]
---
# Catching the search race with breakpoints

**Video** · teaches Breakpoint types, Async call stack, Logpoints, Ignore-listed frames in the call stack

**Why this visual.** Use a line breakpoint, a conditional breakpoint, a logpoint and the ignore list on line 6 of the search code, and read the async call stack at the pause.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-guided/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-guided` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build debugger-lab-guided`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-guided/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/debugger-lab-guided/composition/index.html`.

## Transcript

Line 6 calls render(items) after await search(q). A line breakpoint there pauses twice: first with q react, then with q re, which leaves the wrong list. A conditional breakpoint with q !== input.value pauses only on the stale re response. At that pause the Call Stack shows onInput line 6, an await separator, and onInput line 5 with two vendor frames below. A logpoint prints the same values in the Console without pausing. Adding vendor/events.js to the ignore list hides the two vendor frames.

**00:00 Line 6 calls render(items).** Line 5 waits for search(q). Line 6 calls render(items). We set breakpoints on line 6.

**00:08 A line breakpoint pauses twice.** A line breakpoint on line 6 pauses twice. Pause 1: q is react. Pause 2: q is re, so the list shows re results.

**00:19 A conditional breakpoint pauses only on the stale response.** Now add a condition to line 6: q !== input.value. Condition false means no pause. Condition true pauses on the stale re response.

**00:31 Read the async call stack.** The Call Stack shows onInput app.js:6, then await, then onInput app.js:5. The frames below await show the call that started the wait.

**00:43 A logpoint watches without pausing.** A logpoint on line 6 prints q and input.value. The Console shows render react react, then render re react. The page never pauses.

**00:54 The ignore list hides library frames.** Add vendor/events.js to the ignore list. Ignore list off: five frames. Ignore list on: only your own frames stay in the Call Stack.

Sources:

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools
- ECMA-426: Source map format specification — https://tc39.es/ecma426/

## What it shows

The async part of the Call Stack, below the await separator, shows the call that started the wait. Its Scope still holds the old q, so you see that a stale response reached render.

Text alternative: Line 6 calls render(items) after await search(q). A line breakpoint there pauses twice: first with q react, then with q re, which leaves the wrong list. A conditional breakpoint with q !== input.value pauses only on the stale re response. At that pause the Call Stack shows onInput line 6, an await separator, and onInput line 5 with two vendor frames below. A logpoint prints the same values in the Console without pausing. Adding vendor/events.js to the ignore list hides the two vendor frames.

## Check yourself

At the conditional pause, q is re and input.value is react. What does that tell you?

Answer: This response belongs to an older request. render is about to replace the newer react results with stale re results.

## Sources

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)
- ECMA-426: Source map format specification — https://tc39.es/ecma426/ (`ecma-426-source-map`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-sources-and-breakpoints/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/03-sources-and-breakpoints.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
