---
title: "How to learn frontend (and keep improving) — start here"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: map
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-17
---

# How to learn frontend (and keep improving) — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** standard · **Progress:** 9 of 10 steps ready

A repeatable system for learning frontend: read primary sources, build small demos, measure them in DevTools, explain them, and check browser support before shipping.

## Read in this order

1. [[01-brief-how-to-learn-frontend|Brief]] — what it is, why it exists, where it is used · *ready*
2. [[02-lesson-how-to-learn-frontend|Interactive lesson]] — the animated lesson pages on the local site · *ready*
3. [[03-mini-projects-how-to-learn-frontend|Mini projects]] — small builds with a real use case · *ready*
4. [[00-digests-how-to-learn-frontend|Digests]] — short summaries of the key papers and docs · *ready*
5. [[00-repo-intel-how-to-learn-frontend|Repository deep dive]] — how a production open-source project does it · *ready*
6. [[06-capstone-how-to-learn-frontend|Capstone]] — the production-style project · *ready*
7. [[07-final-notes-how-to-learn-frontend|Final notes]] — the one-page refresher · *ready*
8. [[08-recall-how-to-learn-frontend|Recall cards]] — flashcards for spaced review · *ready*
9. [[09-resources-how-to-learn-frontend|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-how-to-learn-frontend|My insights]].

Every diagram, simulation and video, with its concepts and sources: [[visuals-how-to-learn-frontend|Visuals]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/` on the local address it prints.

## Before you start

- **Browser developer tools** (new for you) — DevTools let you inspect and measure a live page.
- **Web standards** (new for you) — WHATWG and W3C write the specs that browsers implement.
- **Git and GitHub** (new for you) — Git tracks code changes; GitHub hosts repositories and issues.

## What you will be able to do

- Explain the read, build, measure, explain loop and run it on one feature.
- Explain why primary sources beat tutorials, and find the right spec section.
- Decide whether a web feature can ship today using Baseline and caniuse.
- Build a feature check that falls back when an API is missing.
- Build a weekly routine of practice, news, code reading and teaching.

## Lesson pages

1. The learning loop: read, build, measure, explain — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/01-the-learning-loop/`
2. Primary sources over tutorials — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/02-primary-sources-first/`
3. Can I ship it? Baseline and caniuse — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/03-can-i-ship-it/`
4. Feature detection, polyfills and experimental features — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/04-feature-detection-and-polyfills/`
5. Read other people's code — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/05-read-other-peoples-code/`
6. A weekly routine: practice and staying current — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/06-a-weekly-practice-routine/`
7. Build in public and teach — `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/07-build-in-public-and-teach/`

## Research scope and concept notes

How a developer learns frontend and keeps improving: the learning loop, primary sources, browser support literacy, feature detection, staying current, practice, code reading and teaching.
- Learning loop: read, build, measure, explain: included
- Primary sources over tutorials: included
- Spec maturity stages (TC39 Stage 0 to 4): included
- Browser support literacy: Baseline and caniuse: included
- Baseline lifecycle: limited, newly, widely available: included
- Reading caniuse support tables: included — [[caniuse-tables-how-to-learn-frontend|Reading caniuse support tables]]
- Feature detection, polyfills and experimental features: included
- Polyfills only when needed, and their supply-chain risk: included — [[polyfills-when-needed-how-to-learn-frontend|Polyfills only when needed, and their supply-chain risk]]
- Experimental features and origin trials: included
- Progressive enhancement vs graceful degradation: deferred — Definitions were read live on MDN Glossary pages, but the 12-source ceiling was reached; pages explain feature detection fallbacks without naming the two strategies. Deferred to a later topic with a free source slot.
- core-js polyfill strategy: deferred — The core-js README did not load and Babel claims came only from a search snippet; unverified, so not taught.
- Browser test channels: Canary, Nightly, Technology Preview, flags: deferred — Only a Chrome search snippet was found; no live verified page for Nightly, Safari Technology Preview or flags within the source ceiling.
- Staying current: release notes, blogs, surveys: included
- Practice and interview prep: included
- Reading other people's code: included
- Build in public and teach: included
- Write a bug report with steps to reproduce: included

Research stopped: budget-limit. Leaf confirmed in the same guide section; no further in-scope children. 12-source ceiling reached; three children remain deferred (see their reasons).

## Projects

- Mini project: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/mini-01-baseline-checker/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/mini-02-share-button-fallback/`
- Capstone: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/capstone/` — TIL learning journal

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
| 5 | finalize | needs another try |

Everything is generated. Review due cards with `node harness/bin/tutor.mjs recall due how-to-learn-frontend`.
<!-- tutor:generated:end -->

## My insights
