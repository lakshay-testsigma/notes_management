---
title: "Browser DevTools mastery (used in every phase) — resources"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: resources
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser DevTools mastery (used in every phase) — resources

Every source below was checked against a live page before it was recommended.

<!-- tutor:generated:start -->
**11 vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.

## Official documentation

- **[Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides](https://developer.chrome.com/docs/devtools)** — Chrome DevTools team (Google), Kayce Basques and Sofia Emelianova, 2026 · tier A
  - Why it is trusted: The official documentation of Chrome DevTools, hosted on developer.chrome.com by the Chrome team that builds the tool; the pages read today cover CSS inspection, the Console and its utilities API, breakpoints, source maps and local overrides.
  - Used for: brief, lesson
  - Verified: 2026-11-18
- **[Chrome DevTools: Fix memory problems and heap snapshots](https://developer.chrome.com/docs/devtools/memory-problems)** — Chrome DevTools team, 2026 · tier A
  - Why it is trusted: The official Chrome DevTools guide to memory leaks; covers detached DOM nodes, allocation timelines, heap snapshots, the Retainers section and the Comparison view.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[chrome-devtools-memory-docs-browser-devtools-mastery|read the digest]]
- **[Chrome DevTools: Network features reference](https://developer.chrome.com/docs/devtools/network/reference)** — Kayce Basques, Sofia Emelianova (Chrome DevTools team), 2026 · tier A
  - Why it is trusted: The official Chrome DevTools reference for the Network panel on developer.chrome.com, written by the Chrome team; it lists the timing phases Queueing, Stalled, DNS Lookup, Initial connection, Request sent, Waiting (TTFB) and Content Download, plus throttling and HAR export.
  - Used for: brief, digest, lesson
  - Verified: 2026-11-18
  - Digest: [[chrome-devtools-network-docs-browser-devtools-mastery|read the digest]]
- **[Chrome DevTools: Performance, Application, Coverage, Rendering and Recorder docs](https://developer.chrome.com/docs/devtools/performance/reference)** — Chrome DevTools team, 2026 · tier A
  - Why it is trusted: Official Chrome DevTools references for the Performance panel (live metrics with CrUX, CPU throttling, layout shifts, insights) and the Application, Coverage, Rendering and Recorder panels.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Firefox DevTools User Docs](https://firefox-source-docs.mozilla.org/devtools-user/)** — Mozilla, 2026 · tier A
  - Why it is trusted: The official user documentation of Firefox DevTools, hosted on Mozilla's Firefox Source Docs and covering the Grid and Flexbox inspectors, Edit fonts, Accessibility inspector and about:debugging.
  - Used for: lesson, digest
  - Verified: 2026-11-18
  - Digest: [[firefox-devtools-user-docs-browser-devtools-mastery|read the digest]]
- **[Get started with remote debugging Android devices](https://developer.chrome.com/docs/devtools/remote-debugging)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The official Chrome DevTools documentation for debugging Android Chrome from a desktop via chrome://inspect, maintained by the Chrome team.
  - Used for: lesson
  - Verified: 2026-11-18
- **[Web Inspector Reference (WebKit)](https://webkit.org/web-inspector/)** — WebKit project, 2026 · tier A
  - Why it is trusted: The Web Inspector reference published by the WebKit project, which builds Safari's engine and its inspector, including the Enabling Web Inspector page for iOS devices.
  - Used for: lesson
  - Verified: 2026-11-18
- **[web.dev: Core Web Vitals, long tasks and bfcache](https://web.dev/articles/vitals)** — Philip Walton, Jeremy Wagner, Brendan Kenny, Barry Pollard (Google), 2026 · tier A
  - Why it is trusted: web.dev is Google's official web platform guidance site; the Web Vitals article defines the Core Web Vitals thresholds (LCP 2.5 s, INP 200 ms, CLS 0.1) and sibling articles define long tasks (over 50 ms) and bfcache testing.
  - Used for: lesson
  - Verified: 2026-11-18

## Repositories

- **[ChromeDevTools/devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend)** — Chrome DevTools team, 2026 · tier A
  - Why it is trusted: The client side of Chrome DevTools itself (BSD-3-Clause), per its README; the GitHub repo mirrors chromium.googlesource.com, so study only the narrow subtrees front_end/models/trace, front_end/models/har and front_end/panels/network, not the whole tree.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-18
- **[GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse)** — Google Chrome team, 2026 · tier A
  - Why it is trusted: The Lighthouse project itself (Apache-2.0), owned by the GoogleChrome organization; its README states Lighthouse is integrated into the Chrome DevTools Lighthouse panel, and its JSON report and trace processing (core/lib/tracehouse) are the formats the capstone CLI reads.
  - Used for: repo-intel, lesson
  - Verified: 2026-11-18

## Standards

- **[ECMA-426: Source map format specification](https://tc39.es/ecma426/)** — Ecma International TC39-TG4 (editors Asumu Takikawa, Nicolo Ribaudo, Jon Kuperman), 2026 · tier A
  - Why it is trusted: The Ecma International standard for the source map format that DevTools, bundlers and compilers follow; the full text is freely readable and the live page is dated 11 November 2026.
  - Used for: digest, lesson
  - Verified: 2026-11-18
  - Digest: [[ecma-426-source-map-browser-devtools-mastery|read the digest]]
<!-- tutor:generated:end -->

## My insights
