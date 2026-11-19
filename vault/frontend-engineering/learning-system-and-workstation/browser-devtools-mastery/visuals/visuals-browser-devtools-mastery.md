---
title: "Visuals of Browser DevTools mastery (used in every phase)"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
---
# Visuals of Browser DevTools mastery (used in every phase)

Every diagram, simulation and video of this topic, with the concepts it teaches and the sources behind it. Open one, answer its check question, then read the explanation.

- [[concept-map-browser-devtools-mastery|Concept map]] — how the concepts of this topic depend on each other

## Architecture

- [[visual-how-it-works-browser-devtools-mastery|DevTools and scripts read the same page]] — See that the DevTools panels and automation scripts both inspect the page through one protocol.
- [[visual-lighthouse-module-map-browser-devtools-mastery|Lighthouse module map]] — See the four slices of Lighthouse and which one feeds which.
- [[visual-devtools-frontend-module-map-browser-devtools-mastery|DevTools frontend: four modules between the browser and the panels]] — See which module turns raw browser data into what a panel shows.
- [[visual-remote-inspector-connections-browser-devtools-mastery|Which desktop inspector attaches to which phone browser]] — Show that each phone browser pairs with one desktop inspector, and that each pair needs switches on both ends.
- [[visual-mini-02-flow-audit-a-slow-page-browser-devtools-mastery|The slow product page and where you inspect it]] — See which file of the practice server causes which symptom, and which DevTools panel shows it.
- [[visual-capstone-architecture-browser-devtools-mastery|Page health inspector: layers]] — See which layer may depend on which, and which one talks to Chrome.

## Workflow

- [[visual-chrome-devtools-network-reference-mechanism-browser-devtools-mastery|Network panel workflow, from recording to one request's timing]] — See the order of work in the Network panel: record, set loading conditions, narrow the list, then read one request.
- [[visual-chrome-devtools-performance-reference-mechanism-browser-devtools-mastery|From live metrics to a long task in the Performance panel]] — Learn the order of steps: spot a problem in live metrics, record a trace, find the long task in the flame chart, then name its cost.
- [[visual-ecma-426-source-map-mechanism-browser-devtools-mastery|How a source map turns generated code positions into original positions]] — Show the order of steps from a generated file to an original source position.
- [[visual-firefox-devtools-user-docs-mechanism-browser-devtools-mastery|Connecting desktop Firefox DevTools to a phone over USB]] — Learn the order of steps that attach desktop DevTools to a tab on an Android phone.
- [[visual-debugging-triage-decision-browser-devtools-mastery|Which DevTools panel to open first for a symptom]] — Pick the first panel from the symptom, so the first evidence you collect can explain the problem.
- [[visual-source-map-position-lookup-browser-devtools-mastery|Trace one minified position back to the original line]] — Follow how DevTools turns a position in minified code into a file, line and column in the code you wrote.

## Sequence

- [[visual-lighthouse-request-flow-browser-devtools-mastery|One Lighthouse run, from URL to score]] — Follow one page load from the first CDP connection to a category score.
- [[visual-devtools-frontend-request-flow-browser-devtools-mastery|One network event from the browser to a timing bar]] — Follow one request through the real classes, from a protocol message to its phase ranges.
- [[visual-breakpoints-async-race-fallback-browser-devtools-mastery|Two racing fetches make a search list stale]] — Show the order of events in the search race and where a conditional breakpoint pauses.
- [[visual-main-thread-long-task-flow-browser-devtools-mastery|One slow click on the main thread becomes a long task]] — See why one long task on the main thread delays the next paint after a click.
- [[visual-request-timing-phases-sequence-browser-devtools-mastery|The timing phases of one network request, in order]] — Name the Timing tab phases of one request in order and tell which side of the connection spends each one.
- [[visual-capstone-request-flow-browser-devtools-mastery|Page health inspector: one inspection]] — Follow one URL from the dashboard to the report, including the failure path.

## Branching presentations

- [[visual-debugging-triage-paths-browser-devtools-mastery|Triage a production bug: which panel first?]] — Choose the first DevTools panel from the symptom a user reports, and see what evidence each panel gives. · deck built
- [[visual-perf-deep-dives-browser-devtools-mastery|Performance panel deep dives]] — Go deeper into long tasks and yielding, and into the Core Web Vitals that the live metrics view and trace tracks show. · deck built
- [[visual-breakpoint-types-and-stepping-browser-devtools-mastery|Breakpoint types and stepping]] — Choose the breakpoint type that answers your question, and choose how to step once the code is paused. · deck built

## Video

- [[visual-network-waterfall-walkthrough-browser-devtools-mastery|Read the timing phases of one request]] — Name the seven timing phases of one request in order and say what makes each phase grow. · video storyboard
- [[visual-perf-trace-intro-browser-devtools-mastery|One slow click, recorded in a trace]] — See how a Performance recording shows a slow click as a long task on the main thread. · video storyboard
- [[visual-perf-trace-guided-browser-devtools-mastery|Walk through a throttled trace]] — Read the flame chart and see how throttling and yielding change long tasks and input delay. · video storyboard
- [[visual-perf-trace-summary-browser-devtools-mastery|Performance traces in four rules]] — Connect live metrics, traces, long tasks and yielding into one way of working. · video storyboard
- [[visual-breakpoints-race-intro-browser-devtools-mastery|Why a search box shows stale results]] — See how two racing fetches cause stale results, and why a breakpoint finds the cause faster than console.log. · video storyboard
- [[visual-breakpoints-race-summary-browser-devtools-mastery|Breakpoints and async stacks in one minute]] — Recall which breakpoint answers which question, and how the async call stack explains a race. · video storyboard
- [[visual-breakpoints-race-guided-browser-devtools-mastery|Catch the search race with breakpoints]] — Use fetch, line and conditional breakpoints, stepping and async frames to find which response makes the list stale. · video storyboard

## Interactive experiences

- [[visual-network-panel-waterfall-browser-devtools-mastery|Change the conditions and watch the request phases grow]] — Name the timing phases of one request in order and say which phase a slow network, a slow server or the cache changes. · Interactive video lesson (Mode B)
- [[visual-a-production-debugging-workflow-browser-devtools-mastery|Triage a production bug: pick the first panel]] — Choose the first DevTools panel from a reported symptom and explain what evidence it gives and what a wrong first choice costs. · Branching presentation (Mode C)
- [[visual-performance-panel-traces-browser-devtools-mastery|Record a trace and find the long task]] — Read a main-thread trace, spot long tasks over 50 ms, and predict how CPU throttling and yielding change input delay. · Hybrid learning lab (Mode D)
- [[visual-breakpoints-async-debugging-browser-devtools-mastery|Debug a search race with breakpoints and async call stacks]] — Choose a breakpoint type, step through paused code and use async call stack frames to find which fetch makes a search box show stale results. · Hybrid learning lab (Mode D)

## Decision tree

- [[visual-devtools-panel-map-browser-devtools-mastery|Which DevTools panel answers which symptom]] — Pick the first panel to open from the symptom of a bug, instead of opening panels at random.

## Comparison

- [[visual-styles-checkbox-before-after-browser-devtools-mastery|One Styles checkbox: computed padding and box width before and after]] — See how turning off the winning declaration changes the computed value and the box size.
- [[visual-console-table-vs-dir-browser-devtools-mastery|console.table and console.dir on the same request data]] — Compare the table view of an array with the property view of one object, and choose columns for the table.
- [[visual-lighthouse-points-lost-browser-devtools-mastery|Where one page loses Lighthouse performance points]] — Show that the Lighthouse performance score is a weighted average, so the metric that loses the most weighted points is the first fix.

## State machine

- [[visual-debugger-pause-step-resume-browser-devtools-mastery|Pause, step and resume: the states of the Sources panel debugger]] — See which debugger control moves the page from running to paused, between functions, and back to running.

## Dependency graph

- [[visual-detached-tree-retainer-graph-browser-devtools-mastery|Retainer paths that keep a detached #tree alive]] — See that an object is freed only when no path of references connects it to a GC root.

## Concept map

- [[visual-application-storage-map-browser-devtools-mastery|Where a page keeps data, and how long it lives]] — Place each store in the Application panel by what it holds and how long it keeps data.

## Data flow

- [[visual-mini-01-flow-debug-an-async-race-browser-devtools-mastery|A late response returns to onInput]] — Show where a stale search response re-enters onInput and where the id check stops it.
- [[visual-mini-03-flow-find-the-memory-leak-browser-devtools-mastery|How the report view leaks on every route change]] — See which two references keep removed DOM nodes alive after a route change.

## Deployment

- [[visual-capstone-deployment-browser-devtools-mastery|Page health inspector: processes and ports]] — Know which processes run, which ports they use, and which settings the service reads.

## My insights
