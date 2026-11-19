---
title: "Pause, step and resume: the states of the Sources panel debugger"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Pause, step and resume: the states of the Sources panel debugger

**State machine** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** See which debugger control moves the page from running to paused, between functions, and back to running.

Interactive `StateMachine`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/`. Run `npm run site:dev` first.

## What it shows

A breakpoint moves running code to paused. Step into enters the called function. Step out finishes it and pauses in the caller again. Resume runs until the next breakpoint. A breakpoint in a callback pauses later, and the Call Stack then links the callback to the code that scheduled it.

Text alternative: Four states: Running, Paused in updateHeader, Paused in getName and Paused in a .then callback. A breakpoint moves Running to a paused state, Step into and Step out move between caller and callee, and Resume returns to Running, so the debugger is always either running or paused at one line.

## Check yourself

You are paused inside getName and want to get back to updateHeader without reading the rest of getName. Which control do you press?

Answer: Step out. It runs the rest of getName and pauses again in the function that called it.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/04-breakpoints-and-async-debugging.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
