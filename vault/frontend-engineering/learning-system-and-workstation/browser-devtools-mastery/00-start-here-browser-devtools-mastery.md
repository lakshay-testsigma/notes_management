---
title: "Browser DevTools mastery (used in every phase) — start here"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: map
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser DevTools mastery (used in every phase) — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** deep · **Progress:** 9 of 10 steps ready

Browser developer tools let a frontend developer inspect, debug, measure and fix a live page in the browser.

## Read in this order

1. [[01-brief-browser-devtools-mastery|Brief]] — what it is, why it exists, where it is used · *ready*
2. [[02-lesson-browser-devtools-mastery|Interactive lesson]] — the animated lesson pages on the local site · *ready*
3. [[03-mini-projects-browser-devtools-mastery|Mini projects]] — small builds with a real use case · *ready*
4. [[00-digests-browser-devtools-mastery|Digests]] — short summaries of the key papers and docs · *ready*
5. [[00-repo-intel-browser-devtools-mastery|Repository deep dive]] — how a production open-source project does it · *ready*
6. [[06-capstone-browser-devtools-mastery|Capstone]] — the production-style project · *ready*
7. [[07-final-notes-browser-devtools-mastery|Final notes]] — the one-page refresher · *ready*
8. [[08-recall-browser-devtools-mastery|Recall cards]] — flashcards for spaced review · *ready*
9. [[09-resources-browser-devtools-mastery|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-browser-devtools-mastery|My insights]].

Every diagram, simulation and video, with its concepts and sources: [[visuals-browser-devtools-mastery|Visuals]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/` on the local address it prints.

## Before you start

- **Browser developer tools** (you already know this)
- **Document Object Model** (new for you) — The DOM is the tree of objects the browser builds from HTML.
- **HTTP request and response** (new for you) — The browser sends a request; the server returns status, headers and body.
- **Call stack** (new for you) — The call stack lists the functions running now, newest on top.

## What you will be able to do

- Explain how the cascade produces an element's computed styles.
- Debug async code with breakpoints, the async call stack and source maps.
- Explain each timing phase of a request in the network waterfall.
- Find a long task and a memory leak from traces and heap snapshots.
- Build a CLI that triages HAR, trace and Lighthouse files against budgets.
- Decide when to use Firefox, Safari or a real device instead of desktop Chrome.

## Lesson pages

1. Elements and Styles: from the DOM to computed styles — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/01-elements-and-styles/`
2. Console power use — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/02-console-power-use/`
3. Sources panel: breakpoints and async call stacks — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-sources-and-breakpoints/`
4. Source maps and local overrides — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-source-maps-and-overrides/`
5. Network panel: reading the waterfall — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/05-network-waterfall/`
6. Performance panel: traces, long tasks and Web Vitals — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-performance-traces/`
7. Memory panel: finding a leak with heap snapshots — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-memory-leaks/`
8. Application panel: storage, service workers and bfcache — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/08-application-storage/`
9. Lighthouse, Coverage, Rendering and the other panels — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/09-audits-and-more-panels/`
10. Firefox and Safari developer tools — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/10-firefox-and-safari-devtools/`
11. Debugging on real phones and device clouds — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/11-remote-device-debugging/`

## Research scope and concept notes

Browser developer tools for a frontend developer: Chrome DevTools panels (Elements, Console, Sources, Network, Performance, Memory, Application, Lighthouse and the other panels), Firefox and Safari tools, and remote debugging on real devices.
- Elements styles panel: included
- Box model and computed styles: included
- Flex and grid overlays: included
- Force element state: included
- Console power use: included
- Console utilities: included
- Live expressions: included
- Sources panel debugging: included
- Breakpoint types: included
- Async call stack: included
- Source maps: included
- Local overrides: included
- Network panel: included
- Waterfall timing phases: included
- Network throttling and blocking: included
- HAR export: included
- Initiator and priority: included
- Performance panel: included
- Flame chart and long tasks: included
- Live Core Web Vitals: included
- CPU throttling: included
- Memory panel: included
- Heap snapshots: included
- Retainers and detached dom: included
- Allocation timeline: included
- Application panel: included
- Storage inspection: included
- Service worker and cache storage: included
- Back/forward cache test: included
- Lighthouse panel and other panels: included
- Lighthouse audits: included
- Coverage panel: included
- Rendering emulation: included
- Recorder and issues: included
- Firefox and Safari DevTools: included
- Firefox layout and font tools: included
- Safari Web Inspector: included
- Remote device debugging: included
- Android Chrome remote inspection: included
- iOS Safari remote inspection: included
- Device clouds and low-end devices: deferred — Research 2026-11-18: no tier A/B source verified for device clouds or low-end device testing; page 11 names them only as options without claims.
- Cascade layers in the Styles pane: included
- Layout shifts track: included
- Speculative loads: included
- Logpoints: included
- Ignore-listed frames in the call stack: included
- How a source map encodes positions: included
- Override a fetch or XHR response: included

Research stopped: scope-boundary. Leaves taught on pages 01-11; deeper trace internals belong to the later performance phase.

## Projects

- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-01-source-map-stack-resolver/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-02-har-waterfall-report/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-03-trace-long-task-finder/`
- Capstone: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/capstone/` — perf-triage CLI

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | ready |
| 2 | digest | ready |
| 2 | repo-intel | ready |
| 3 | lesson | ready |
| 3 | mini-projects | ready |
| 4 | capstone | ready |
| 5 | notes | ready |
| 5 | finalize | not started |

Next to generate: `finalize`. Ask Claude to continue this topic, or run `node harness/bin/tutor.mjs next frontend-engineering/learning-system-and-workstation/browser-devtools-mastery`.
<!-- tutor:generated:end -->

## My insights
