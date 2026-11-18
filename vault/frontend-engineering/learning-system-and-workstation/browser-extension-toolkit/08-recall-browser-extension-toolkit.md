---
title: "Browser extension toolkit (install once, used across phases) — recall cards"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-18
---

# Browser extension toolkit (install once, used across phases) — recall cards

## Cards

<!-- card: bet-01 -->
A "color picker" extension asks for access to all sites. Which part of the extension could read your pages, and which manifest field allows it?
?
A content script reads and changes the page DOM. The host permissions (or the content script `matches`) in `manifest.json` decide on which sites it runs; `<all_urls>` means every page you open. [[visual-how-it-works-browser-extension-toolkit]]

<!-- card: bet-02 -->
Why can built-in DevTools not show you a React component's props, while React DevTools can?
?
Built-in DevTools shows the DOM the browser built. React DevTools reads React's own component tree from the page, so it shows components, props and state, and its Profiler records each render.

<!-- card: bet-03 -->
You dispatch an action and the screen shows the wrong item. What does Redux DevTools show that helps, and what must the store allow?
?
It lists each action and the store state after it, so you find the first action that produced the wrong state. The store must connect to the extension through the `devTools` option of `configureStore` (on by default).

<!-- card: bet-04 -->
Your Lighthouse score is good, but real users report a slow page. Which data answers them, and why does the lab not?
?
Field data from real users (CrUX). A lab run is one load on one machine and one network; field data covers real devices and networks.

<!-- card: bet-05 -->
axe reports no violations on a page. Can you call the page accessible? What do you do next?
?
No. Automated checks find only some problems, and some results are "incomplete" (needs review). Test with the keyboard and a screen reader, and review every incomplete result. [[visual-a11y-check-outcomes-browser-extension-toolkit]]

<!-- card: bet-06 -->
Normal body text has a contrast ratio of 4.47:1. Does it pass WCAG AA?
?
No. Normal text needs at least 4.5:1, and the ratio is not rounded up, so 4.47:1 (and 4.499:1) fails. Large text needs 3:1. [[visual-a11y-checks-lab-browser-extension-toolkit]]

<!-- card: bet-07 -->
When does axe return "incomplete" for color contrast instead of a pass or fail?
?
When it cannot work out the background color, for example text over a background image or an overlapping element. A person must check it.

<!-- card: bet-08 -->
A single-page app sets its `<title>` only after JavaScript runs. Which view shows the problem and why does it matter for Google?
?
Compare the source HTML with the rendered DOM. Google indexes the rendered HTML, so check that the title, description and canonical are present after rendering. [[visual-seo-read-points-browser-extension-toolkit]]

<!-- card: bet-09 -->
A "page not found" view in your single-page app returns status 200. What is this called, and how do you fix it?
?
A soft 404. Return a real 404 status from the server, or redirect with JavaScript to a URL that returns 404, or add a `noindex` robots meta tag.

<!-- card: bet-10 -->
A site loads an old jQuery version and has no Content-Security-Policy header. Which two checks of a quick security pass find each problem?
?
A library scanner (Retire.js) finds the known-vulnerable library. Reading the response headers finds the missing CSP. [[visual-security-pass-deck-browser-extension-toolkit]]

<!-- card: bet-11 -->
Why does a strict CSP use nonces or hashes instead of a list of allowed hosts?
?
An allowed host can serve other scripts an attacker can use. A nonce or hash allows only the exact scripts the page meant to run.

<!-- card: bet-12 -->
A header-editing extension uses `declarativeNetRequest`. What is the benefit over reading every request?
?
The extension declares rules and the browser applies them, so the extension never reads the request contents. The `WithHostAccess` variant also needs host permissions for the sites.

<!-- card: bet-13 -->
Your team wants one shared extension list. How do you decide to keep, replace or reject an extension?
?
Keep it when it shows a layer the built-in panels cannot show and its permissions fit the job. Replace it when a built-in panel does the same job. Reject it when it asks for broad access you cannot justify. [[visual-team-extension-profile-browser-extension-toolkit]]

<!-- card: bet-14 -->
Why does the toolkit-profile CLI give every check three outcomes instead of pass or fail?
?
Some checks cannot decide, as in axe-core's "incomplete" result. A third outcome, needs review, sends those cases to a person instead of reporting a false pass or a false fail. [[axe-core-takeaways]]

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| bet-01 | outcome 3: audit manifests for risky permissions | [[visual-how-it-works-browser-extension-toolkit]], then lesson page `01-why-an-extension-toolkit`, listed in [[02-lesson-browser-extension-toolkit]] |
| bet-02 | outcome 1: how a framework devtools extension reads component state | [[visual-framework-devtools-lab-browser-extension-toolkit]], then lesson page `02-framework-devtools` |
| bet-03 | outcome 1: store state and actions | lesson page `02-framework-devtools` |
| bet-04 | outcome 5: extension or built-in panel, lab or field data | lesson page `03-performance-extensions` |
| bet-05 | outcome 2: what automated accessibility checks miss | [[visual-a11y-check-outcomes-browser-extension-toolkit]], then lesson page `04-accessibility-extensions` |
| bet-06 | outcome 2: contrast thresholds | [[visual-a11y-checks-lab-browser-extension-toolkit]], then lesson page `04-accessibility-extensions` |
| bet-07 | outcome 2: incomplete results | [[axe-core-findings]] |
| bet-08 | outcome 2: what SEO checks catch | [[visual-seo-read-points-browser-extension-toolkit]], then lesson page `05-seo-extensions` |
| bet-09 | outcome 2: soft 404 | [[google-js-seo-basics-docs-browser-extension-toolkit]] |
| bet-10 | outcome 5: security extensions | [[visual-security-pass-deck-browser-extension-toolkit]], then lesson page `06-security-privacy-extensions` |
| bet-11 | outcome 5: strict CSP | lesson page `06-security-privacy-extensions` |
| bet-12 | outcome 3: request-modifying extensions | lesson page `07-team-toolkit-in-practice` |
| bet-13 | outcome 5: the team extension profile | [[visual-team-extension-profile-browser-extension-toolkit]], then lesson page `07-team-toolkit-in-practice` |
| bet-14 | outcome 4: a release check with three outcomes | [[06-capstone-browser-extension-toolkit]] and [[03-mini-projects-browser-extension-toolkit]] |

## My insights
