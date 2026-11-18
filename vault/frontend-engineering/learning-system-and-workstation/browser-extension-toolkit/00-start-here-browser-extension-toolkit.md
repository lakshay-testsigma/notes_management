---
title: "Browser extension toolkit (install once, used across phases) — start here"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: map
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser extension toolkit (install once, used across phases) — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** standard · **Progress:** 5 of 10 steps ready

A browser extension toolkit adds framework, performance, accessibility, SEO and security views that built-in DevTools does not give.

## Read in this order

1. [[01-brief-browser-extension-toolkit|Brief]] — what it is, why it exists, where it is used · *ready*
2. [[02-lesson-browser-extension-toolkit|Interactive lesson]] — the animated lesson pages on the local site · *in progress*
3. [[03-mini-projects-browser-extension-toolkit|Mini projects]] — small builds with a real use case · *ready*
4. [[00-digests-browser-extension-toolkit|Digests]] — short summaries of the key papers and docs · *ready*
5. [[00-repo-intel-browser-extension-toolkit|Repository deep dive]] — how a production open-source project does it · *ready*
6. [[06-capstone-browser-extension-toolkit|Capstone]] — the production-style project · *ready*
7. [[07-final-notes-browser-extension-toolkit|Final notes]] — the one-page refresher · *ready*
8. [[08-recall-browser-extension-toolkit|Recall cards]] — flashcards for spaced review · *ready*
9. [[09-resources-browser-extension-toolkit|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-browser-extension-toolkit|My insights]].

Every diagram, simulation and video, with its concepts and sources: [[visuals-browser-extension-toolkit|Visuals]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/` on the local address it prints.

## Before you start

- **Browser developer tools** (new for you) — Built-in browser panels that inspect and debug a live page.
- **Browser extension** (new for you) — A small add-on program that adds features to the browser.
- **Document Object Model** (new for you) — The DOM is the tree of objects the browser builds from HTML.
- **HTTP request and response** (new for you) — The browser sends a request; the server returns status, headers and body.

## What you will be able to do

- Explain how a framework devtools extension reads component state from a page.
- Explain what automated accessibility and SEO checks catch and what they miss.
- Build a script that audits extension manifests for risky permissions.
- Build an accessibility and SEO check that runs on every release page.
- Decide when to use an extension instead of a built-in DevTools panel.

## Lesson pages

1. Why an extension toolkit: what built-in DevTools does not show — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/01-why-an-extension-toolkit/`
2. Framework devtools: see components, state and renders — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/02-framework-devtools/`
3. Performance extensions: wasted renders and field data — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/03-performance-extensions/`
4. Accessibility extensions: automated checks and their limits — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/04-accessibility-extensions/`
5. SEO extensions: rendered source, redirects and structured data — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/05-seo-extensions/`
6. Security and privacy extensions: libraries, headers and cookies — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/06-security-privacy-extensions/`
7. Design, API helpers and a team extension profile in practice — `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/07-team-toolkit-in-practice/`

## Research scope and concept notes

Browser extensions a frontend developer installs once and uses across the roadmap: framework devtools, performance, accessibility, SEO, security and privacy, design and CSS, and API and data helpers, plus how extensions work and how to vet them.
- Extension architecture and permissions: included
- Content scripts and DevTools pages: included
- Extension risk and vetting: included
- Framework devtools extensions: included
- React DevTools Components and Profiler: included
- Redux DevTools actions and time travel: included
- Vue, Angular, Svelte and Apollo devtools: deferred — Vue, Angular, Svelte, Solid, Apollo, Preact and Module Federation devtools had no verified official page in this run; the lesson names them only as equivalents of React DevTools, and each framework section of the roadmap covers its own devtools.
- Performance extensions: included
- Detecting wasted renders with React Scan: deferred — No verified React Scan source in this run; wasted renders are taught with the React DevTools Profiler here and in the React performance section of the roadmap.
- CrUX field data and lab data: included
- Accessibility extensions: included
- What automated accessibility rules can and cannot catch: included
- Contrast and vision emulation checks: included
- Headings and landmarks structure: included
- SEO extensions: included
- Rendered HTML versus source HTML: included
- Redirect chains and structured data: included
- Security and privacy extensions: included
- Vulnerable library and tech fingerprint detection: included
- Security headers, cookies and CSP inspection: included
- Ad-block resilience and proxy testing: included
- Design and CSS helper extensions: included
- API and data extensions: included
- Request header modification and mocking: included
- A team extension profile: included

Research stopped: budget-limit. Coverage audit round 1: widened W3C WAI, react.dev, Redux and Google Search Central entries into documentation sets (still 12 sources). headings-and-landmarks and ad-block-and-proxy-testing re-included with evidence. other-framework-devtools stays deferred (no free source slot; Angular and Vue pages verified but unrecorded); react-scan-wasted-renders stays deferred (repository fails the source bar).

## Projects

- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/mini-01-extension-permission-audit/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/mini-02-release-a11y-seo-check/`
- Capstone: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/capstone/` — toolkit-profile CLI

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | ready |
| 2 | digest | ready |
| 2 | repo-intel | ready |
| 3 | lesson | in progress |
| 3 | mini-projects | ready |
| 4 | capstone | ready |
| 5 | notes | ready |
| 5 | finalize | not started |

Next to generate: `lesson`, `mini-projects`. Ask Claude to continue this topic, or run `node harness/bin/tutor.mjs next frontend-engineering/learning-system-and-workstation/browser-extension-toolkit`.
<!-- tutor:generated:end -->

## My insights
