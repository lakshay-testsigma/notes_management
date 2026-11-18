---
title: "Finding a leak with two heap snapshots"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-memory-docs, chromedevtools-devtools-frontend-repo]
---
# Finding a leak with two heap snapshots

**Video** · teaches Memory panel, Heap snapshots, Retainers and detached dom, Allocation timeline

**Why this visual.** Find a leaked object by comparing two heap snapshots and reading its retainer path.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker. The storyboard, captions and transcript are ready; render later with `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery render heap-snapshot-compare`. The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/heap-snapshot-compare/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/heap-snapshot-compare` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build heap-snapshot-compare`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/heap-snapshot-compare/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/heap-snapshot-compare/composition/index.html`.

## Transcript

In the Memory panel you take a heap snapshot, do a suspect action and undo it a few times, then take a second snapshot. The Comparison view lists objects that were added and are still alive. You select one, read its Retainers to see which reference keeps it alive, and clear that reference. A detached DOM node is the common case: it is removed from the page, but JavaScript still points to it.

**00:00 Two snapshots find a leak.** A leak is memory that stays after you undo an action. Two heap snapshots show it.

**00:06 The recipe in the Memory panel.** Take Snapshot 1. Do the suspect action, then undo it, a few times. Take Snapshot 2 and open the Comparison view.

**00:16 What the Comparison view shows.** Each snapshot starts with a garbage collection, so only reachable objects stay. Objects added after the undo should be gone. If they are still there, something holds them.

**00:27 Follow the retainer path.** Select the added object. The Retainers section lists who points to it. Here a JavaScript variable still holds a list that the page removed, so it is a Detached ul.

**00:39 Which object is worth fixing.** Shallow size is the memory the object holds itself. Retained size is what you free by deleting it. A small object can retain a lot.

**00:49 Clear the reference, then check again.** Clear the variable that holds the list. Repeat the action and undo, take a new snapshot, and the Detached ul is gone.

**00:58 When you do not know the action.** The Allocation Timeline records new memory over time. Each blue bar is a candidate leak. Zoom on a bar to see what was allocated then.

Sources:

- Chrome DevTools: Fix memory problems and heap snapshots — https://developer.chrome.com/docs/devtools/memory-problems
- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend

## What it shows

Do the action and then undo it before the second snapshot. Anything still added after the undo is a leak candidate, and the Retainers section names the reference that keeps it alive.

Text alternative: In the Memory panel you take a heap snapshot, do a suspect action and undo it a few times, then take a second snapshot. The Comparison view lists objects that were added and are still alive. You select one, read its Retainers to see which reference keeps it alive, and clear that reference. A detached DOM node is the common case: it is removed from the page, but JavaScript still points to it.

## Check yourself

You remove a list from the page, but the second snapshot still shows a Detached ul. Where do you look to find what keeps it alive?

Answer: In the Retainers section of the selected object: it lists the objects that point to it, for example a JavaScript variable that still holds the list.

## Sources

- Chrome DevTools: Fix memory problems and heap snapshots — https://developer.chrome.com/docs/devtools/memory-problems (`chrome-devtools-memory-docs`)
- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend (`chromedevtools-devtools-frontend-repo`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-memory-leaks/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/07-memory-leaks.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
