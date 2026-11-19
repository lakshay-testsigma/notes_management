---
title: "Browser DevTools mastery (used in every phase) — start here"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: map
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-19
---

# Browser DevTools mastery (used in every phase) — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** deep · **Progress:** 8 of 10 steps ready

Browser DevTools are the inspectors built into every browser that show the live page, its code, network, performance and memory, so you can find the cause of a bug from evidence.

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

- **Basic programming** (you already know this)
- **Command line** (you already know this)
- **DOM** (new for you) — The DOM is the live tree of objects for page elements.
- **HTTP** (new for you) — HTTP is how a browser asks a server for files.

## What you will be able to do

- Explain the phases of a network request shown in the waterfall.
- Debug async JavaScript with conditional breakpoints and async call stacks.
- Find a memory leak by comparing heap snapshots and reading retainers.
- Build a scripted page health report with the Chrome DevTools Protocol.
- Decide which DevTools panel to open first for a given symptom.

## Lesson pages

1. What DevTools are for — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/01-what-devtools-are-for/`
2. Elements & Styles: the live DOM and cascade — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/02-elements-and-styles/`
3. Console power use — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/03-console-power-use/`
4. Breakpoints and async debugging — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/04-breakpoints-and-async-debugging/`
5. Source maps, overrides and workspaces — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/05-source-maps-overrides-and-workspaces/`
6. Network panel: reading the waterfall — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/06-network-panel-waterfall/`
7. Performance panel: traces and Core Web Vitals — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/07-performance-panel-traces/`
8. Memory leaks and heap snapshots — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/08-memory-leaks-and-heap-snapshots/`
9. Application panel: storage, service workers and bfcache — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/09-application-panel-storage/`
10. Lighthouse and the audit panels — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/10-lighthouse-and-audit-panels/`
11. Firefox, Safari and remote device debugging — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/11-firefox-safari-and-remote-devices/`
12. A production debugging workflow — `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/12-a-production-debugging-workflow/`

## Research scope and concept notes

Use the browser DevTools of Chrome, Firefox and Safari to inspect, debug, measure and audit web pages on desktop and real devices, as the evidence tool for every later frontend topic.
- Browser DevTools: included
- Elements and Styles panel: included
- Box model and layout overlays: included
- Console API and utilities: included
- Breakpoint debugging: included
- Async call stacks: included
- Source maps: included
- Local overrides and workspaces: included
- Network panel: included
- Request timing phases: included
- Performance panel: included
- Flame chart and long tasks: included
- Core Web Vitals in DevTools: included
- Memory panel: included
- Heap snapshot retainers: included
- Detached DOM nodes: included
- Application panel: included
- Service worker and cache inspection: included
- Lighthouse and other audit panels: included
- Lighthouse audits: included
- Rendering and emulation tools: included
- Firefox and Safari DevTools: included
- Remote device debugging: included
- Debugging workflow: included
- Back/forward cache and speculative loads: included

Research stopped: scope-boundary. Discovery units proposed further children (breakpoint-types, call-stack-and-scope-stepping, ignore-list, network-throttling-and-cache, cpu-throttling, long-animation-frames, shallow-vs-retained-size, allocation-timeline, force-state-and-computed-styles, cascade-layers-and-scope-views, console-selection-utilities, console-monitoring-utilities, storage-quota-and-clear-site-data, coverage-panel, device-mode-emulation, firefox-grid-and-accessibility-inspectors, safari-web-inspector-setup). They are folded into their parent concepts and taught on the parent page. Open: container-query badge evidence not found on the Chrome CSS reference page; source-map security not investigated; v8.dev fast-async verified but not recorded (source limit 12); web-dev-vitals-docs removed for the source limit.

## Projects

- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-01-debug-an-async-race/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-02-audit-a-slow-page/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-03-find-the-memory-leak/`
- Capstone: `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/capstone/` — Page health inspector

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
| 5 | finalize | in progress |

Next to generate: `lesson`. Ask Claude to continue this topic, or run `node harness/bin/tutor.mjs next frontend-engineering/learning-system-and-workstation/browser-devtools-mastery`.
<!-- tutor:generated:end -->

## My insights
