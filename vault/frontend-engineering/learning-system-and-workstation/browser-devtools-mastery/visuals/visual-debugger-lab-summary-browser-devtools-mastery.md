---
title: "Pick the breakpoint for the bug"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-docs]
---
# Pick the breakpoint for the bug

**Video** · teaches Breakpoint types, Logpoints, Async call stack, Ignore-listed frames in the call stack

**Why this visual.** Connect each kind of bug to the breakpoint type that catches it, and recall what to read when the page pauses.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-summary/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-summary` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build debugger-lab-summary`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/debugger-lab-summary/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/debugger-lab-summary/composition/index.html`.

## Transcript

Use a line-of-code breakpoint when you know the line, a conditional breakpoint when only some calls are wrong, and a logpoint when you must not pause. When you do not know the line, break on the cause: an XHR or fetch request, a DOM change, an event listener or an exception. At the pause read Scope and the Call Stack; async frames show who started the wait and the ignore list hides library frames. The search race is fixed by returning early when q !== input.value.

**00:00 Pick the breakpoint for the bug.** Which breakpoint catches which bug?

**00:05 When you know the line.** Know the line? Use a line-of-code breakpoint. Only some calls are wrong? Use a conditional breakpoint. Must not pause? Use a logpoint.

**00:16 When you do not know the line.** When you do not know the line, break on the cause: a fetch request, a DOM change, an event listener, or an exception.

**00:27 Read the pause.** At the pause, read Scope for the values and the Call Stack for the callers. Async frames show who started the wait. The ignore list hides library frames.

**00:39 Fix the race.** The bug: render used a stale response. The fix on line 6: return when q !== input.value.

Sources:

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools

## What it shows

Each breakpoint type answers a different question. Choose the one that pauses closest to the cause, then read the state at that moment.

Text alternative: Use a line-of-code breakpoint when you know the line, a conditional breakpoint when only some calls are wrong, and a logpoint when you must not pause. When you do not know the line, break on the cause: an XHR or fetch request, a DOM change, an event listener or an exception. At the pause read Scope and the Call Stack; async frames show who started the wait and the ignore list hides library frames. The search race is fixed by returning early when q !== input.value.

## Check yourself

A list on the page changes and you do not know which script changes it. Which breakpoint do you set?

Answer: A DOM change breakpoint (subtree modifications) on the list element. It pauses on the code that changes the list.

## Sources

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-sources-and-breakpoints/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/03-sources-and-breakpoints.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
