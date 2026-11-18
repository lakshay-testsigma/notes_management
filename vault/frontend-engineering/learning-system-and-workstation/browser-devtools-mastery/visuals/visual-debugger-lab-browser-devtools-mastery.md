---
title: "Debugger lab: catch the search race"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-docs, ecma-426-source-map]
---
# Debugger lab: catch the search race

**Interactive experiences** · teaches Sources panel debugging, Breakpoint types, Async call stack, Logpoints, Ignore-listed frames in the call stack

**Why this visual.** Choose a breakpoint type for a race bug, pause on the stale response, and read the async call stack to find the cause.

**Hybrid learning lab (Mode D)** · level advanced · modes Watch, Explore, Guided, Deep dive, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-sources-and-breakpoints/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-debugger-lab-intro-browser-devtools-mastery|debugger-lab-intro]]
- Guided walkthrough (HyperFrames composition): [[visual-debugger-lab-guided-browser-devtools-mastery|debugger-lab-guided]]
- Simulation: `AlgorithmStepper` with named presets
- Branching deep dives: [[visual-debugger-lab-deck-browser-devtools-mastery|debugger-lab-deck]]
- Final animated summary: [[visual-debugger-lab-summary-browser-devtools-mastery|debugger-lab-summary]]
- Static fallback: [[visual-debugger-lab-fallback-browser-devtools-mastery|debugger-lab-fallback]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/debugger-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-devtools-mastery build debugger-lab`).

## Checkpoints

- **predict.** You set a line-of-code breakpoint on line 6 and run the race: re, then react. How often does it pause, and what is q at the last pause? Answer: Twice; q is re at the last pause. A line-of-code breakpoint pauses every time line 6 runs. Each response runs line 6 once, and the slow re response arrives last, so the last pause has q re and render then shows stale results.
- **experiment.** In the stepper, choose the breakpoint type that pauses only on the stale response, and step until it pauses with q re while the input says react. A conditional breakpoint pauses only when its expression is true. q !== input.value is true only for the late re response, so the one pause lands on the bug.
- **verify.** At the pause, the Call Stack shows onInput app.js:6, then await, then onInput app.js:5. What do the frames below await tell you? Answer: Which call started the wait that has now resumed. The async call stack keeps the stack from the moment the code started waiting. The frames below await show the onInput call on line 5 that sent this request.
- **verify.** Pausing changes the timing, and the race disappears. Which type shows q at line 6 on every call? Answer: A logpoint. A logpoint prints its message in the Console each time the line runs and never pauses, so the order of the two responses stays the same.
- **predict.** You add vendor/events.js to the ignore list. What changes at the next pause? Answer: The vendor frames disappear from the Call Stack; your frames stay. Ignore listing is a debugging view setting. The library still runs, but its frames are hidden from the Call Stack and stepping skips them, so you see only your own code.
- **verify.** Something empties a list on the page and you do not know which script does it. Which breakpoint do you set? Answer: A DOM change breakpoint (subtree modifications) on the list. A DOM change breakpoint pauses on the code that changes the node, so the Call Stack then shows the unknown script and line.
- **explain.** In one or two sentences: how did the conditional pause and the async call stack lead you to the fix? The pause showed q re while the input said react, and the frames below await showed it came from the older onInput call. So render must return early when q !== input.value.

Needs first: Sources panel debugging, Breakpoint types, Async call stack.

## What it shows

Watch, experiment with the simulation, step through the walkthrough, explore the deep dives and practice. Choose a breakpoint type for a race bug, pause on the stale response, and read the async call stack to find the cause.

Text alternative: An intro video shows a search box whose late re response overwrites the newer react results and names the Sources panel parts. A stepper lets the learner choose a line-of-code breakpoint, a conditional breakpoint, a logpoint, an XHR/fetch breakpoint or the ignore list and step through the race while the Call Stack and Scope change. A guided walkthrough pauses at each breakpoint type, a deck compares the types, and a summary video connects each bug to its breakpoint.

## Check yourself

You set a line-of-code breakpoint on line 6 and run the race: re, then react. How often does it pause, and what is q at the last pause?

Answer: Twice; q is re at the last pause. A line-of-code breakpoint pauses every time line 6 runs. Each response runs line 6 once, and the slow re response arrives last, so the last pause has q re and render then shows stale results.

## Sources

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)
- ECMA-426: Source map format specification — https://tc39.es/ecma426/ (`ecma-426-source-map`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-sources-and-breakpoints/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/03-sources-and-breakpoints.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
