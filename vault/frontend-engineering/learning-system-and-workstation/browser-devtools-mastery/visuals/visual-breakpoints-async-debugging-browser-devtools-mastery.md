---
title: "Debug a search race with breakpoints and async call stacks"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Debug a search race with breakpoints and async call stacks

**Interactive experiences** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** Choose a breakpoint type, step through paused code and use async call stack frames to find which fetch makes a search box show stale results.

**Hybrid learning lab (Mode D)** · level advanced · modes Watch, Explore, Guided, Deep dive, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-breakpoints-race-intro-browser-devtools-mastery|breakpoints-race-intro]]
- Guided walkthrough (HyperFrames composition): [[visual-breakpoints-race-guided-browser-devtools-mastery|breakpoints-race-guided]]
- Simulation: `AlgorithmStepper` with named presets
- Branching deep dives: [[visual-breakpoint-types-and-stepping-browser-devtools-mastery|breakpoint-types-and-stepping]]
- Final animated summary: [[visual-breakpoints-race-summary-browser-devtools-mastery|breakpoints-race-summary]]
- Static fallback: [[visual-breakpoints-async-race-fallback-browser-devtools-mastery|breakpoints-async-race-fallback]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/breakpoints-async-debugging/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build breakpoints-async-debugging`).

## Checkpoints

- **predict.** Both requests are in flight and the re request is slower. What does the label say at the end? Answer: Results for re, because the slow response arrives last and overwrites the list. Each input event starts its own fetch, and both run at the same time. render runs once per response, in the order the responses arrive, so the slow re response writes the list last.
- **experiment.** In the stepper, use the line-of-code breakpoint and step until DevTools is paused on the stale response. A line-of-code breakpoint pauses for every response. The second pause is the stale one: query is re, the box says react, so the watch query === input.value is false.
- **verify.** You want DevTools to pause only on the stale response. Which breakpoint do you set on line 5? Answer: A conditional breakpoint with query !== input.value. A conditional breakpoint pauses only when its condition is true. The condition is true only when the call read an old query, so DevTools skips the fresh response.
- **predict.** You are paused on line 5 and press Step into. What is on top of the Call Stack? Answer: render, line 8. Step into enters the function called on the current line. render now runs, so DevTools adds its frame on top of onInput and pauses on its first line.
- **explain.** In one sentence: why do you need async frames in the Call Stack to explain this race? After an await, the stack holds only the resumed code, so it cannot show which input event started the request. Async frames link the resumed code back to onInput line 4, where query re was read and the fetch started.

## What it shows

Watch, experiment with the simulation, step through the walkthrough, explore the deep dives and practice. Choose a breakpoint type, step through paused code and use async call stack frames to find which fetch makes a search box show stale results.

Text alternative: An intro video shows a search box whose list shows results for an old query because two fetches race. A stepper lets the learner pause the code with a line-of-code, conditional or XHR/fetch breakpoint, step into, over and out, and compare the Call Stack with and without async frames. A guided walkthrough pauses at each breakpoint, a deck explains the breakpoint types and stepping, and a summary video connects the evidence to the fix.

## Check yourself

Both requests are in flight and the re request is slower. What does the label say at the end?

Answer: Results for re, because the slow response arrives last and overwrites the list. Each input event starts its own fetch, and both run at the same time. render runs once per response, in the order the responses arrive, so the slow re response writes the list last.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/04-breakpoints-and-async-debugging.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
