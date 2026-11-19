---
title: "Catch the search race with breakpoints"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Catch the search race with breakpoints

**Video** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** Use fetch, line and conditional breakpoints, stepping and async frames to find which response makes the list stale.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-guided/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-guided` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build breakpoints-race-guided`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-guided/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/breakpoints-race-guided/composition/index.html`.

## Transcript

A fetch breakpoint pauses on line 12 each time a request to search?q= starts. A line-of-code breakpoint on line 5 pauses for both responses. A conditional breakpoint with query !== input.value pauses only on the stale re response. Step into enters render, step over runs one line, step out returns. After an await the stack holds only the resumed code; async frames link it back to the code that started the fetch.

**00:00 The code under test.** The onInput function reads the box on line 3, awaits getJSON on line 4, and calls render on line 5.

**00:08 A fetch breakpoint.** An XHR or fetch breakpoint with the text search?q= pauses on line 12 when a request URL contains it. It pauses twice: for re, then for react.

**00:19 A line-of-code breakpoint.** A line-of-code breakpoint on line 5 pauses for every response. First react arrives, and query matches the box. Then re arrives, but the box still says react.

**00:31 A conditional breakpoint.** A conditional breakpoint pauses only when its condition is true. With query !== input.value, it skips the fresh react response and stops on the stale re response.

**00:43 Step into, over and out.** Step into enters render, so render goes on top of the Call Stack. Step over runs one line. Step out finishes render and returns to onInput.

**00:55 Async frames link the call history.** After an await, the stack holds only the resumed code. Async frames link it back to the code that started the fetch, so the Call Stack shows the whole history.

Sources:

- Chrome DevTools — https://developer.chrome.com/docs/devtools

## What it shows

A conditional breakpoint skips the pauses you do not need. Async frames in the Call Stack show which earlier call started the code that is paused now.

Text alternative: A fetch breakpoint pauses on line 12 each time a request to search?q= starts. A line-of-code breakpoint on line 5 pauses for both responses. A conditional breakpoint with query !== input.value pauses only on the stale re response. Step into enters render, step over runs one line, step out returns. After an await the stack holds only the resumed code; async frames link it back to the code that started the fetch.

## Check yourself

Which breakpoint pauses only on the stale response?

Answer: A conditional breakpoint on line 5 with the condition query !== input.value.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/04-breakpoints-and-async-debugging.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
