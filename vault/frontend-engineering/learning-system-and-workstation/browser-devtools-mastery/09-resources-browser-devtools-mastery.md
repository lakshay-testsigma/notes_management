---
title: "Browser DevTools mastery (used in every phase) — resources"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: resources
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-19
---

# Browser DevTools mastery (used in every phase) — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**12 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Chrome DevTools](https://developer.chrome.com/docs/devtools)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The official documentation of Chrome DevTools on Google's Chrome for Developers site; it lists every panel (Elements, Console, Sources, Network, Performance, Memory, Application, Lighthouse).
  - Used for: brief, lesson
  - Verified: 2026-11-19
- **[Firefox DevTools User Docs](https://firefox-source-docs.mozilla.org/devtools-user/)** — Mozilla, 2026 · tier A
  - Why it is trusted: The official user documentation of Firefox DevTools, hosted on Mozilla's Firefox Source Docs and covering the Grid and Flexbox inspectors, Edit fonts, Accessibility inspector and about:debugging.
  - Used for: lesson, digest
  - Verified: 2026-11-18
- **[Fix memory problems](https://developer.chrome.com/docs/devtools/memory-problems)** — Kayce Basques (Chrome DevTools team), 2026 · tier A
  - Why it is trusted: Official Chrome DevTools guide to memory leaks: heap snapshots, detached DOM nodes, allocation timelines and sampling.
  - Used for: lesson
  - Verified: 2026-11-19
- **[Get started with remote debugging Android devices](https://developer.chrome.com/docs/devtools/remote-debugging)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The official Chrome DevTools documentation for debugging Android Chrome from a desktop via chrome://inspect, maintained by the Chrome team.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Network features reference](https://developer.chrome.com/docs/devtools/network/reference)** — Kayce Basques, Sofia Emelianova (Chrome DevTools team), 2026 · tier A
  - Why it is trusted: Official Chrome DevTools reference for the Network panel: recording, waterfall, timing phases, throttling, disable cache, filtering.
  - Used for: lesson, digest
  - Verified: 2026-11-19
- **[Optimize long tasks](https://web.dev/articles/optimize-long-tasks)** — Google Chrome team (web.dev), 2025 · tier A
  - Why it is trusted: Published on web.dev by the Chrome team that created Core Web Vitals and INP; defines long tasks (over 50 ms), blocking period, and yielding with scheduler.yield().
  - Used for: brief, lesson
  - Verified: 2026-11-19
- **[Performance features reference](https://developer.chrome.com/docs/devtools/performance/reference)** — Kayce Basques, Sofia Emelianova (Chrome DevTools team), 2026 · tier A
  - Why it is trusted: Official Chrome DevTools reference for the Performance panel: live metrics, recording, flame chart, main thread, CPU throttling, insights.
  - Used for: lesson, digest
  - Verified: 2026-11-19
- **[Web Inspector Reference (WebKit)](https://webkit.org/web-inspector/)** — WebKit project, 2026 · tier A
  - Why it is trusted: Web Inspector reference published by the WebKit project, the engine behind Safari; its Enabling Web Inspector page gives the Mac and iOS steps read today.
  - Used for: lesson
  - Verified: 2026-11-19

## Repositories

- **[GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The reference implementation of Lighthouse audits, owned by Google Chrome, Apache-2.0, 31,159 stars; README lists WebPageTest, HTTPArchive, Calibre, DebugBear, SpeedCurve and Treo as services built on it, and has unit and smoke test suites run in GitHub Actions CI.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-19
- **[ChromeDevTools/devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend)** — Chrome DevTools team (Google), 2026 · tier B
  - Why it is trusted: The client-side source of Chrome DevTools itself (TypeScript and CSS), owned by the ChromeDevTools org; the GitHub repo mirrors the primary source on chromium.googlesource.com; BSD-3-Clause; specialised niche (browser developer tooling), 4,104 stars is above the niche threshold of 2,000; Chrome ships it as the built-in DevTools.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-19
- **[puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)** — Puppeteer project (Google Chrome team), 2026 · tier B
  - Why it is trusted: The Node library that drives Chrome or Firefox over the DevTools Protocol or WebDriver BiDi (pptr.dev); Apache-2.0, 95,868 stars, copyright Google, listed among Chrome for Developers ready-made libraries. No named adopter list was found, so tier B.
  - Used for: lesson
  - Verified: 2026-11-19

## Standards

- **[ECMA-426: Source map format specification](https://tc39.es/ecma426/)** — Ecma International TC39 (editors Asumu Takikawa, Nicolo Ribaudo, Jon Kuperman), 2024 · tier A
  - Why it is trusted: The Ecma International standard that defines the source map format, 1st edition published December 2024; the HTML at tc39.es is the live draft of the same standard.
  - Used for: lesson, digest
  - Verified: 2026-11-19
<!-- tutor:generated:end -->

## My insights
