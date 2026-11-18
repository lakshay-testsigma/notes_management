---
title: "Browser extension toolkit (install once, used across phases) — lesson"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: lesson
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser extension toolkit (install once, used across phases) — interactive lesson

## Open the lesson

The lesson pages live on the local site at
`/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/`. Start the
site with `npm run site:dev`, then open that path. Read the pages in order; each one takes
about five minutes. Read the [[01-brief-browser-extension-toolkit|brief]] first.

## Pages

1. `01-why-an-extension-toolkit` — Why an extension toolkit. An extension is a set of parts, and its manifest permissions decide what it can read. Visual: how-it-works diagram. Serves outcome 5.
2. `02-framework-devtools` — Framework devtools. React DevTools shows components and records renders; Redux DevTools shows each action and the store. Visual: interactive framework DevTools lab. Serves outcome 1.
3. `03-performance-extensions` — Performance extensions. Lab data from one load and field data from real users answer different questions. Visual: lab and field comparison. Serves outcome 5.
4. `04-accessibility-extensions` — Accessibility extensions. Automated checks pass, fail or return "needs review", so keyboard and screen reader tests stay manual. Visual: interactive accessibility checks lab. Serves outcome 2.
5. `05-seo-extensions` — SEO extensions. Google indexes the rendered page, so compare source HTML, rendered DOM and status codes. Visual: SEO read-points diagram. Serves outcome 2.
6. `06-security-privacy-extensions` — Security and privacy extensions. One tool per layer: libraries, CSP and headers, request blocking and extension permissions. Visual: branching security pass deck. Serves outcomes 3 and 5.
7. `07-team-toolkit-in-practice` — The team toolkit. Design and API helpers, request rules, and a vetted team extension profile. Visual: team extension profile diagram. Serves outcomes 3 and 5.

## What you can do after it

1. Explain what framework devtools extensions show (component tree, renders, store actions) and use them to trace a bug. Page 2.
2. Explain what automated accessibility and SEO checks catch and what they miss. Pages 4–5 and mini project 2.
3. Build a script that audits extension manifests for risky permissions. Pages 1, 6–7 and mini project 1.
4. Build an accessibility and SEO check that runs on every release page. Pages 4–5, mini project 2 and the capstone.
5. Decide when to use an extension instead of a built-in DevTools panel. Pages 1, 3, 6 and 7.

Continue with the [[03-mini-projects-browser-extension-toolkit|mini projects]].

## My insights
