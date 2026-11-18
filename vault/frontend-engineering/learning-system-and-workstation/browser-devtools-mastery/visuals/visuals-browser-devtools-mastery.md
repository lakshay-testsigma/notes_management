---
title: "Visuals of Browser DevTools mastery (used in every phase)"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
---
# Visuals of Browser DevTools mastery (used in every phase)

Every diagram, simulation and video of this topic, with the concepts it teaches and the sources behind it. Open one, answer its check question, then read the explanation.

- [[concept-map-browser-devtools-mastery|Concept map]] — how the concepts of this topic depend on each other

## Workflow

- [[visual-how-it-works-browser-devtools-mastery|The DevTools inspect, debug, measure and fix loop]] — Show the inspect, debug, measure, fix and verify loop that every DevTools task follows.
- [[visual-chrome-devtools-memory-docs-mechanism-browser-devtools-mastery|Finding a leak with two heap snapshots]] — Learn the order of steps that finds an object that stays in memory and the reference that holds it.
- [[visual-chrome-devtools-network-docs-mechanism-browser-devtools-mastery|Request timing phases in the Network Timing tab]] — Learn the order of the phases a request passes through, so you can name the slow one.
- [[visual-ecma-426-source-map-mechanism-browser-devtools-mastery|How a source map turns generated code positions into original positions]] — Show the order of steps from a generated file to an original source position.
- [[visual-firefox-devtools-user-docs-mechanism-browser-devtools-mastery|Connecting desktop Firefox DevTools to a phone over USB]] — Learn the order of steps that attach desktop DevTools to a tab on an Android phone.
- [[visual-perf-trace-flow-browser-devtools-mastery|From a recorded trace to a faster interaction]] — Learn the order of steps that finds a long task in a trace and checks that a fix brings INP under 200 ms.

## Architecture

- [[visual-lighthouse-module-map-browser-devtools-mastery|Lighthouse module map]] — See which part of Lighthouse records a page load, which computes metrics, which scores, and which packages it.
- [[visual-devtools-frontend-module-map-browser-devtools-mastery|DevTools frontend: four studied modules]] — See which parts of the DevTools frontend own the protocol, source maps, HAR and heap snapshots.
- [[visual-application-storage-map-browser-devtools-mastery|Where the page keeps state: storage areas and the service worker]] — Place each storage area that the Application panel shows, and the service worker between the page and the network.
- [[visual-capstone-layers-browser-devtools-mastery|Perf-triage layers and their dependencies]] — See which layer may depend on which.

## Sequence

- [[visual-lighthouse-request-flow-browser-devtools-mastery|Lighthouse flow from page load to score]] — Follow one page load from recording to a 0 to 1 audit score.
- [[visual-devtools-frontend-request-flow-browser-devtools-mastery|A heap snapshot request across the protocol client]] — Follow one numbered command and its unnumbered events from the model to the worker.
- [[visual-debugger-lab-fallback-browser-devtools-mastery|Pausing on the stale search response]] — Show the search race and the conditional breakpoint pause as one static diagram for readers without JavaScript.
- [[visual-capstone-request-flow-browser-devtools-mastery|Perf-triage request flow with a failed input]] — Follow one triage run, including the path of an unreadable file.

## Video

- [[visual-heap-snapshot-compare-browser-devtools-mastery|Finding a leak with two heap snapshots]] — Find a leaked object by comparing two heap snapshots and reading its retainer path. · video storyboard
- [[visual-network-waterfall-walkthrough-browser-devtools-mastery|Read one request in the network waterfall]] — Name each timing phase of a request and say which phase grows when the network, the server or the queue is slow. · video storyboard
- [[visual-debugger-lab-intro-browser-devtools-mastery|A search race in the Sources panel]] — See why a slow response can overwrite a newer one, and which parts of the Sources panel help you catch it. · video storyboard
- [[visual-debugger-lab-guided-browser-devtools-mastery|Catching the search race with breakpoints]] — Use a line breakpoint, a conditional breakpoint, a logpoint and the ignore list on line 6 of the search code, and read the async call stack at the pause. · video storyboard
- [[visual-debugger-lab-summary-browser-devtools-mastery|Pick the breakpoint for the bug]] — Connect each kind of bug to the breakpoint type that catches it, and recall what to read when the page pauses. · video storyboard
- [[visual-perf-trace-intro-browser-devtools-mastery|Why a click can feel slow]] — See how a busy main thread delays the next paint after a click, and how the Performance panel records it. · video storyboard
- [[visual-perf-trace-walkthrough-browser-devtools-mastery|Find the long task in a trace]] — Find the long task in the Main track, read the interaction's INP, and see how CPU throttling and a split task change it. · video storyboard
- [[visual-perf-trace-summary-browser-devtools-mastery|Traces and Web Vitals in four rules]] — Connect throttling, long tasks, INP and layout shifts into one routine for every performance check. · video storyboard

## Data flow

- [[visual-styles-to-computed-browser-devtools-mastery|From matching rules to one computed value]] — Show why the Styles pane lists many rules for one property while the Computed pane shows one value.
- [[visual-source-map-lookup-browser-devtools-mastery|One paused position traced back through a source map]] — See how DevTools turns a position in a minified bundle into a file and line in the original source.
- [[visual-mini-01-flow-source-map-stack-resolver-browser-devtools-mastery|Source map stack resolver: execution flow]] — Show how a minified stack frame becomes an original file and line in the mini project.
- [[visual-mini-02-flow-browser-devtools-mastery|HAR waterfall report: from file to report]] — See how one HAR file becomes three lists: slowest phases, uncached requests and render-blocking candidates.
- [[visual-mini-03-flow-trace-long-task-finder-browser-devtools-mastery|Trace long task finder: from trace file to report]] — Show how a saved Performance trace becomes a list of long tasks and layout shifts.

## Interactive experiences

- [[visual-network-waterfall-lab-browser-devtools-mastery|Slow down a request and read its waterfall]] — Predict which timing phase of a request grows when throttling, server time, payload size or connection limits change. · Interactive video lesson (Mode B)
- [[visual-debugger-lab-browser-devtools-mastery|Debugger lab: catch the search race]] — Choose a breakpoint type for a race bug, pause on the stale response, and read the async call stack to find the cause. · Hybrid learning lab (Mode D)
- [[visual-perf-trace-lab-browser-devtools-mastery|Performance trace lab: find the long task]] — Record a throttled trace, find the long task in the Main track, and show that splitting it brings INP under 200 ms. · Hybrid learning lab (Mode D)

## Branching presentations

- [[visual-debugger-lab-deck-browser-devtools-mastery|Which breakpoint type fits this bug]] — Choose a breakpoint type from the symptom of a bug: known line, only some calls, no pause allowed, or an unknown line. · deck built

## Dependency graph

- [[visual-console-utilities-map-browser-devtools-mastery|Which Console utility reads which part of the page]] — Show that each Console utility is a shortcut to one part of the live page state.
- [[visual-detached-node-retainer-path-browser-devtools-mastery|The retainer path that keeps a detached list alive]] — See why a node that left the page still uses memory: a chain of references from a GC root still reaches it.

## Comparison

- [[visual-browser-tool-choice-browser-devtools-mastery|Which browser tool fits which debugging task]] — Show that you pick a second browser by the task: Firefox for layout and fonts, Safari for bugs that only Safari shows.
- [[visual-remote-debug-paths-browser-devtools-mastery|How desktop DevTools reach a tab on a phone]] — Show that each phone browser pairs with one desktop entry point, and that the phone must allow debugging first.

## Decision tree

- [[visual-symptom-to-panel-map-browser-devtools-mastery|Pick the panel from the reported problem]] — Match a reported problem to the one panel that measures it, and see that Lighthouse gathers before it audits.

## Deployment

- [[visual-capstone-deployment-browser-devtools-mastery|Perf-triage run recipe: inputs, settings, outputs]] — See the inputs, settings and outputs of one run.

## My insights
