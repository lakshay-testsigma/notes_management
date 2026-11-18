---
title: "How browsers work — start here"
topic: frontend-engineering/how-the-web-works/how-browsers-work
stage: map
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
---

# How browsers work — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** standard · **Progress:** 2 of 10 steps ready

How a browser turns a URL into pixels: its processes, navigation and lifecycle, the critical rendering path and compositing, the JavaScript engine, the event loop, storage and the same-origin policy.

## Read in this order

1. [[01-brief-how-browsers-work|Brief]] — what it is, why it exists, where it is used · *not started*
2. [[02-lesson-how-browsers-work|Interactive lesson]] — the animated lesson pages on the local site · *not started*
3. [[03-mini-projects-how-browsers-work|Mini projects]] — small builds with a real use case · *not started*
4. [[00-digests-how-browsers-work|Digests]] — short summaries of the key papers and docs · *not started*
5. [[00-repo-intel-how-browsers-work|Repository deep dive]] — how a production open-source project does it · *not started*
6. [[06-capstone-how-browsers-work|Capstone]] — the production-style project · *not started*
7. [[07-final-notes-how-browsers-work|Final notes]] — the one-page refresher · *not started*
8. [[08-recall-how-browsers-work|Recall cards]] — flashcards for spaced review · *not started*
9. [[09-resources-how-browsers-work|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-how-browsers-work|My insights]].

Every diagram, simulation and video, with its concepts and sources: [[visuals-how-browsers-work|Visuals]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/how-the-web-works/how-browsers-work/` on the local address it prints.

## Before you start

- **Browser developer tools** (you already know this)
- **HTTP request and response** (you already know this)
- **Document Object Model** (new for you) — The DOM is the tree of objects the browser builds from HTML.
- **Call stack** (new for you) — The list of functions running now, newest on top.

## What you will be able to do

- Explain which browser process does which job and why sites are isolated.
- Explain each step from a navigation to the first paint, and the lifecycle events that follow.
- Find and fix render-blocking and parser-blocking resources on a page.
- Choose CSS properties that animate on the compositor only.
- Predict the order in which tasks, microtasks and rendering steps run.
- Choose the right browser storage API and explain what the same-origin policy isolates.

## Lesson pages

1. Browser architecture: processes, site isolation and engines — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/01-browser-architecture/`
2. Navigation and the page lifecycle — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/02-navigation-and-page-lifecycle/`
3. The critical rendering path: from bytes to pixels — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/03-critical-rendering-path/`
4. Rendering pipeline: layout, paint and composite — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/04-rendering-pipeline-and-compositing/`
5. The event loop: tasks, microtasks and rendering — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/05-event-loop/`
6. Inside the JavaScript engine: JIT, hidden classes and GC — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/06-javascript-engine-internals/`
7. Browser storage and the same-origin policy in practice — `/frontend-engineering/how-the-web-works/how-browsers-work/lesson/07-storage-and-same-origin-in-practice/`

## Research scope and concept notes

How a browser works for a frontend developer: process architecture and site isolation, navigation and lifecycle, critical rendering path, rendering pipeline and compositing, JavaScript engine internals, the event loop, storage and quotas, and the same-origin policy at a glance.
- Browser architecture: included
- The multi-process model: included
- Site isolation: included
- Rendering engines and JavaScript engines: included
- Navigation and page lifecycle: included
- From URL to first paint: included
- DOMContentLoaded, load, pagehide and visibilitychange: included
- Back/forward cache, freeze and resume: included
- Critical rendering path: included
- DOM, CSSOM and the render tree: included
- Parser-blocking and render-blocking resources: included
- The preload scanner: included
- Rendering pipeline and compositing: included
- Layout, paint and composite triggers: included
- Layers, will-change and layer explosion: included
- JavaScript engine internals: included
- Parsing, bytecode and JIT tiers: included
- Hidden classes and stable object shapes: included
- Generational garbage collection: included
- The event loop: included
- Tasks, microtasks and the call stack: included
- Rendering steps and requestAnimationFrame: included
- Long tasks and input delay: included
- Browser storage and quotas: included
- Cookies, Web Storage, IndexedDB, Cache API and OPFS: included
- Quotas, eviction and persistent storage: included
- Same-origin policy: included
- What the same-origin policy isolates and allows: included
- CORS and cross-origin isolation: included

Research stopped: budget-limit. Children expanded against the same sources. Inline-cache mechanics, lazy parsing and standalone COOP/COEP have no direct verified source in this run, so the concepts were narrowed to hidden classes and to CORS with cross-origin isolation; the coverage audit may add sources.

## Projects

- Mini project (planned): `projects/frontend-engineering/how-the-web-works/how-browsers-work/mini-01-render-blocking-audit/` — A developer speeding up a landing page lists which scripts and stylesheets block parsing or rendering, from the saved HTML and a HAR file, and suggests async, defer or media fixes.
- Mini project (planned): `projects/frontend-engineering/how-the-web-works/how-browsers-work/mini-02-event-loop-order-predictor/` — A team lead writes a small tool that predicts the log order of setTimeout, Promise and queueMicrotask code, and checks it against Node's real output, to teach new hires the event loop.
- Capstone: `projects/frontend-engineering/how-the-web-works/how-browsers-work/capstone/` — page-load inspector CLI

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | not started |
| 2 | digest | not started |
| 2 | repo-intel | not started |
| 3 | lesson | not started |
| 3 | mini-projects | not started |
| 4 | capstone | not started |
| 5 | notes | not started |
| 5 | finalize | not started |

Next to generate: `brief`. Ask Claude to continue this topic, or run `node harness/bin/tutor.mjs next frontend-engineering/how-the-web-works/how-browsers-work`.
<!-- tutor:generated:end -->

## My insights
