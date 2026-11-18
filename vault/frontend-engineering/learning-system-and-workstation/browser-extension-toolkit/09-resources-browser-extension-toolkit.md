---
title: "Browser extension toolkit (install once, used across phases) — resources"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: resources
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser extension toolkit (install once, used across phases) — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**12 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Anatomy of a WebExtension (MDN)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension)** — MDN Web Docs (Mozilla), 2026 · tier A
  - Why it is trusted: MDN's WebExtensions reference, maintained by Mozilla, defines manifest.json, background scripts, content scripts, popups and web accessible resources for the cross-browser API.
  - Used for: brief, digest, lesson
  - Verified: 2026-11-18
  - Digest: [[mdn-webextensions-anatomy-docs-browser-extension-toolkit|read the digest]]
- **[chrome.declarativeNetRequest API reference](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)** — Chrome for Developers, Google, 2026 · tier A
  - Why it is trusted: The official Chrome extensions API reference for the API that block, redirect and header-modifying extensions use; it defines the rule action types block, redirect, allow, upgradeScheme, modifyHeaders and allowAllRequests, plus rule limits and the Header modification section.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Configuring Your Store (Redux, Redux DevTools Extension integration)](https://redux.js.org/usage/configuring-your-store)** — Redux maintainers, 2026 · tier A
  - Why it is trusted: Official Redux documentation on redux.js.org; it states that configureStore enables the Redux DevTools Extension by default and documents the devTools option. Its 'prior art' page links to reduxjs/redux-devtools (MIT, 14.4k stars, last commit 2026-11-10) as the developer tools.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Content scripts (Chrome for Developers)](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)** — Chrome Extensions team, Google, 2026 · tier A
  - Why it is trusted: Official Chrome extension documentation; its sections on isolated worlds, injection methods, run_at and 'Stay secure' define how content scripts touch pages and what permissions injection needs.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Content Security Policy (CSP) (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)** — MDN Web Docs (Mozilla), 2026 · tier A
  - Why it is trusted: MDN's reference guide to the Content-Security-Policy header, covering delivery, strict CSP, clickjacking, Trusted Types and report-only testing.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Performance features reference / overview (Chrome DevTools)](https://developer.chrome.com/docs/devtools/performance/overview)** — Chrome DevTools team, Google, 2026 · tier A
  - Why it is trusted: Official Chrome DevTools documentation; its sections 'Observe Core Web Vitals live' and 'Compare your experience to the experience of your users' show live metrics and CrUX field data built into the Performance panel.
  - Used for: lesson
  - Verified: 2026-11-18
- **[React Developer Tools](https://react.dev/learn/react-developer-tools)** — Meta / React team, 2026 · tier A
  - Why it is trusted: The official react.dev page for the React DevTools browser extension (Components and Profiler panels), maintained by the React team.
  - Used for: brief, lesson
  - Verified: 2026-11-18
- **[Selecting Web Accessibility Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)** — W3C WAI (EOWG), 2024 · tier A
  - Why it is trusted: W3C Web Accessibility Initiative guidance; its section 'What Evaluation Tools Can Do and Can Not Do' states tools cannot check all accessibility aspects automatically and human judgement is required.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Understand JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)** — Google Search Central, 2026 · tier A
  - Why it is trusted: Google's own Search Central documentation of how Googlebot crawls, renders and indexes JavaScript pages; sections cover rendered HTML, status codes, soft 404, and JSON-LD.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[google-js-seo-basics-docs-browser-extension-toolkit|read the digest]]

## Repositories

- **[dequelabs/axe-core](https://github.com/dequelabs/axe-core)** — Deque Systems, 2026 · tier A
  - Why it is trusted: The open-source accessibility rules engine (MPL-2.0, specialised niche: automated web accessibility testing) maintained by Deque Systems; it powers the axe browser extensions and is embedded in Lighthouse, Accessibility Insights for Web, Cypress-axe, Storybook a11y and Jest-axe per the project's own doc/projects.md.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-18
- **[RetireJS/retire.js](https://github.com/RetireJS/retire.js)** — RetireJS, 2026 · tier B
  - Why it is trusted: Widely used open-source scanner (Apache-2.0, 4.2k stars) for JavaScript libraries with known vulnerabilities, with CLI, browser extension, Burp and ZAP integrations.
  - Used for: lesson
  - Verified: 2026-11-18

## Standards

- **[Understanding SC 1.4.3: Contrast (Minimum) (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)** — W3C WAI (AG WG), 2026 · tier A
  - Why it is trusted: The W3C Understanding document for the AA contrast criterion: 4.5:1 for normal text, 3:1 for large text; it lists Colour Contrast Analyser as a measuring tool.
  - Used for: lesson
  - Verified: 2026-11-18
<!-- tutor:generated:end -->

## My insights
