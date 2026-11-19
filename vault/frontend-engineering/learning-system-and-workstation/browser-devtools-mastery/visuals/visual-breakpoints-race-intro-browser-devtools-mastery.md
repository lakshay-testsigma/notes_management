---
title: "Why a search box shows stale results"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Why a search box shows stale results

**Video** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** See how two racing fetches cause stale results, and why a breakpoint finds the cause faster than console.log.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render breakpoints-race-intro`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-intro/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-intro` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build breakpoints-race-intro`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoints-race-intro/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/breakpoints-race-intro/composition/index.html`.

## Transcript

A user types re and then react in a search box. Each input event starts a fetch. The react response arrives first and the slow re response arrives last, so the list shows results for the old query. A breakpoint pauses the code before a line runs, so you can read the Scope, Watch and Call Stack panes instead of guessing with console.log.

**00:00 Stale search results.** This search box shows results for an old query. Breakpoints show you why.

**00:05 Two requests race.** The user types re, then react. Each input event starts a fetch to the server. The react response comes back first. The slow re response comes back last and overwrites the list.

**00:18 console.log or a breakpoint.** A console.log prints only the values you guessed in advance. A breakpoint pauses the code, so you can read every variable in scope.

**00:28 The debugging loop.** In the Sources panel, you set a breakpoint. DevTools pauses before that line runs. You read the Scope, Watch and Call Stack panes, then step or resume.

**00:40 Now catch the race.** Next, you set the breakpoints yourself and catch the stale response.

Sources:

- Chrome DevTools — https://developer.chrome.com/docs/devtools

## What it shows

Two requests can be in flight at the same time. The response that arrives last overwrites the list, even when it belongs to an old query.

Text alternative: A user types re and then react in a search box. Each input event starts a fetch. The react response arrives first and the slow re response arrives last, so the list shows results for the old query. A breakpoint pauses the code before a line runs, so you can read the Scope, Watch and Call Stack panes instead of guessing with console.log.

## Check yourself

Why does the list show results for re when the box says react?

Answer: The re request was slower. Its response arrived after the react response and overwrote the list.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/04-breakpoints-and-async-debugging.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
