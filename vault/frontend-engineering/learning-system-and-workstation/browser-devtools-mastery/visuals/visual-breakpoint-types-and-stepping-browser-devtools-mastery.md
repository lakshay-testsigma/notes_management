---
title: "Breakpoint types and stepping"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Breakpoint types and stepping

**Branching presentations** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** Choose the breakpoint type that answers your question, and choose how to step once the code is paused.

Branching presentation (HyperFrames slideshow), 4 main slides and 2 deep dives: "Catch the stale response", "Step through render". Status: **built**.

Editable project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoint-types-and-stepping` (change `deck.json`, then `tutor deck frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build breakpoint-types-and-stepping`). Present it live: `npx --yes hyperframes@0.9.59 present projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/videos/breakpoint-types-and-stepping/composition`.

On the site it opens in the Deep dive tab of its experience; composition `/media/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/breakpoint-types-and-stepping/composition/index.html`.

## Outline

A short deck asks which breakpoint to set for a bug. The main path compares line-of-code, conditional, logpoint, DOM change, XHR/fetch and event listener breakpoints, then the three stepping buttons. Two deep dives show how a conditional breakpoint catches the stale search response and how step into, over and out move through render.

**Purpose.** Choose the breakpoint type that answers your question, and choose how to step once the code is paused.

### Main path

### 1. Which breakpoint do you set?

**On screen.** Title card with "Start from what you already know".

**Notes.** Ask the learner what they know about the bug: the line, the element, the request URL or the event. The answer chooses the breakpoint type.

### 2. One type per question

**On screen.** Numbered steps appear one at a time: Line-of-code: pause on an exact line → Conditional: pause on a line only when true → Logpoint: log to the Console, no pause → DOM change: pause on code that changes a node → XHR/fetch: pause when a URL has a string → Event listener: pause on code after an event.

**Notes.** Reveal the types one at a time. Each one pauses on a different kind of event, so each answers a different question.

**Branches.** deep dive "Catch the stale response".

### 3. Three ways to step

**On screen.** Two columns, "The function is related" and "The function is not related", fill in pairs; verdict: Resume runs until the next breakpoint..

**Notes.** Once paused, choose how far to move. Step over skips a function that is not related to the bug; step into enters one that is; step out finishes the current function.

**Branches.** deep dive "Step through render".

### 4. Pause, read, move

**On screen.** Two columns, "Read" and "Move", fill in pairs; verdict: Evidence first, then the next step..

**Notes.** At every pause read Scope for local values, Watch for your own expressions and the Call Stack for how the code got there.

### Deep dive: Catch the stale response

### 1. A line breakpoint pauses every time

**On screen.** Two columns, "Pause 1" and "Pause 2", fill in pairs; verdict: Only pause 2 shows the bug..

**Notes.** On line 5 a plain breakpoint pauses for the fresh react response and for the stale re response, so you resume past pauses you do not need.

### 2. A condition skips the fresh pause

**On screen.** The expression query !== input.value with "query", "input.value" highlighted in turn and explained.

**Notes.** Right-click the line number, choose Add conditional breakpoint and enter query !== input.value. DevTools now pauses only on the stale response.

### Deep dive: Step through render

### 1. Step into render

**On screen.** Numbered steps appear one at a time: Paused on line 5 in onInput → Step into: line 8 in render → Call Stack: render above onInput.

**Notes.** Paused on line 5, step into moves the pause to line 8 inside render. The Call Stack now has render on top of onInput.

### 2. Step over, then step out

**On screen.** Numbered steps appear one at a time: Step over: line 8 writes the re items → Step over: label says Results for re → Step out: back in onInput.

**Notes.** Step over runs line 8 and line 9 one at a time; the label then says Results for re. Step out returns to onInput on line 6.

## What it shows

Each breakpoint type answers one question: where in the code, under which condition, on which element, on which request or after which event. Stepping then moves one line or one function at a time.

Text alternative: A short deck asks which breakpoint to set for a bug. The main path compares line-of-code, conditional, logpoint, DOM change, XHR/fetch and event listener breakpoints, then the three stepping buttons. Two deep dives show how a conditional breakpoint catches the stale search response and how step into, over and out move through render.

## Check yourself

You want to log a value on every call without pausing and without editing the code. Which breakpoint type do you use?

Answer: A logpoint. It logs a message to the Console and does not pause.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/04-breakpoints-and-async-debugging.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
