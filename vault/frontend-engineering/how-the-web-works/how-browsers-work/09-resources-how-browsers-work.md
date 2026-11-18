---
title: "How browsers work — resources"
topic: frontend-engineering/how-the-web-works/how-browsers-work
stage: resources
tags: [frontend-engineering, how-the-web-works]
created: 2026-11-18
---

# How browsers work — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**11 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Back/forward cache](https://web.dev/articles/bfcache)** — Philip Walton, Barry Pollard, 2023 · tier A
  - Why it is trusted: Google's web.dev reference on bfcache eligibility and the pageshow, pagehide, freeze and resume events, last updated October 2026.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Inside look at modern web browser (parts 1-4)](https://developer.chrome.com/blog/inside-browser-part1)** — Mariko Kosaka (Chrome team), 2018 · tier A
  - Why it is trusted: The Chrome team's own four-part explanation of browser processes, navigation, rendering and compositor input, published on Chrome for Developers.
  - Used for: brief, digest, lesson
  - Verified: 2026-11-18
- **[MDN Web Docs set: same-origin policy, CORS, cross-origin isolation, critical rendering path, DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)** — MDN Web Docs contributors, 2026 · tier A
  - Why it is trusted: MDN reference set that defines origin, lists what the browser allows and blocks across origins, and explains CORS with preflight, the COOP and COEP headers behind crossOriginIsolated, the critical rendering path steps and the DOMContentLoaded versus load order. Pages last modified between 2025-02-25 and 2026-10-28.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Optimize long tasks](https://web.dev/articles/optimize-long-tasks)** — Jeremy Wagner, Brendan Kenny, 2024 · tier A
  - Why it is trusted: Google's web.dev guide that defines a task, the main thread and the 50 ms long-task threshold, and shows yielding with scheduler.yield(). Published 2022-09-30, updated 2024-12-19.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)** — MDN Web Docs contributors, 2026 · tier A
  - Why it is trusted: MDN reference that compares browser storage mechanisms, per-browser quotas, best-effort versus persistent storage and eviction rules. Last modified 2026-01-05.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Don't fight the browser preload scanner](https://web.dev/articles/preload-scanner)** — Jeremy Wagner, 2026 · tier B
  - Why it is trusted: A web.dev article by a Google web performance author that explains the preload scanner and what hides resources from it.
  - Used for: lesson
  - Verified: 2026-11-18

## Repositories

- **[GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The Chrome team's own open-source tool that drives Chrome over the DevTools Protocol, records a trace of a page load and scores render-blocking, LCP, layout shift and main-thread work; it powers PageSpeed Insights and DevTools.
  - Used for: repo-intel
  - Verified: 2026-11-18

## Engineering blogs

- **[RenderingNG architecture](https://developer.chrome.com/docs/chromium/renderingng-architecture)** — Chris Harrelson (illustrations Una Kravets), 2026 · tier A
  - Why it is trusted: First-party Chrome documentation by a Chromium rendering engineer, describing the rendering pipeline stages and which process and thread runs each.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Trash talk: the Orinoco garbage collector](https://v8.dev/blog/trash-talk)** — Peter Marshall, V8 team, 2019 · tier A
  - Why it is trusted: Official V8 project blog post that explains the generational heap, Scavenger, Mark-Compact and the Orinoco project.
  - Used for: lesson
  - Verified: 2026-11-18
- **[V8 documentation and blog set: Ignition and TurboFan, hidden classes, scanner and parsing](https://v8.dev/blog/launching-ignition-and-turbofan)** — V8 team, 2017 · tier A
  - Why it is trusted: Official V8 project site. The Ignition and TurboFan post announces the interpreter and compiler pipeline in Chrome 59. The hidden-classes doc explains maps and mentions inline caches only in passing. The 'Blazingly fast parsing, part 1' post (Toon Verwaest, 2019-03-25) covers the scanner and the parser building an AST, but not lazy parsing.
  - Used for: lesson
  - Verified: 2026-11-18

## Standards

- **[HTML Standard: 8.1.7 Event loops (processing model, update the rendering, microtask checkpoint)](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)** — WHATWG (HTML Living Standard editors), 2026 · tier A
  - Why it is trusted: The living standard that defines the event loop, task queues, microtask checkpoints and the update-the-rendering steps that every browser implements.
  - Used for: digest, lesson
  - Verified: 2026-11-18
<!-- tutor:generated:end -->

## My insights
