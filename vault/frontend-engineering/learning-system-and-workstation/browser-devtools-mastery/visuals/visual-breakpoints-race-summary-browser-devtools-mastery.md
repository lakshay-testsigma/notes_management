---
title: "Breakpoints and async stacks in one minute"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Breakpoints and async stacks in one minute

**Video** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** Recall which breakpoint answers which question, and how the async call stack explains a race.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render breakpoints-race-summary`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-summary/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-summary` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build breakpoints-race-summary`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-summary/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/breakpoints-race-summary/composition/index.html`.

## Transcript

The summary replays the session. The symptom was a stale list. A fetch breakpoint showed two requests in flight. A conditional breakpoint paused only on the stale response. Stepping showed render writing the old label, and async frames showed which input event started the stale request.

**00:00 What you found.** The stale list came from a slow response that arrived last.

**00:05 Pick the breakpoint by the question.** Use a line-of-code breakpoint when you know the line. Add a condition to skip pauses you do not need. Use a fetch breakpoint when you know only the URL.

**00:18 Read the pause.** At each pause, Scope shows the local values, Watch tracks your own expression, and the Call Stack shows how the code got there.

**00:30 From evidence to fix.** The evidence points to the fix. The code must ignore a response whose query no longer matches the box.

Sources:

- Chrome DevTools — https://developer.chrome.com/docs/devtools

## What it shows

Choose the breakpoint by the question you ask. The Call Stack with async frames tells you which earlier call caused the code that is paused now.

Text alternative: The summary replays the session. The symptom was a stale list. A fetch breakpoint showed two requests in flight. A conditional breakpoint paused only on the stale response. Stepping showed render writing the old label, and async frames showed which input event started the stale request.

## Check yourself

You see a wrong request URL. Which breakpoint finds the code that sends it?

Answer: An XHR/fetch breakpoint with part of the URL as its string.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/04-breakpoints-and-async-debugging.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
