---
title: "Browser DevTools mastery (used in every phase) — repository deep dive"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo, chromedevtools-devtools-frontend-repo]
---

# Browser DevTools mastery (used in every phase) — repository deep dive

How production codebases implement this topic. Read the notes of a repository in the
order shown.

## GoogleChrome/lighthouse

The audit engine behind the DevTools Lighthouse panel: it records a trace and a network log, computes metrics, and scores audits. Commit 3b399f6.

1. [[lighthouse-overview|Overview]]
2. [[lighthouse-architecture|Architecture]]
3. [[lighthouse-findings|Findings]] — gathering and auditing are separate phases, so one recorded page can be re-audited with no browser
4. [[lighthouse-tech-and-services|Technologies and services]]
5. [[lighthouse-takeaways|Takeaways for the capstone]]

Modules: [[lighthouse-module-gather-pipeline|gather-pipeline]], [[lighthouse-module-metrics-and-trace|metrics-and-trace]], [[lighthouse-module-audits-and-scoring|audits-and-scoring]], [[lighthouse-module-build-and-infra|build-and-infra]]

Patterns: [[lighthouse-pattern-memoized-computed-artifacts|memoized computed artifacts]], [[lighthouse-pattern-fail-soft-pipeline|fail-soft pipeline]], [[lighthouse-pattern-data-fitted-scoring|data-fitted scoring]]

## ChromeDevTools/devtools-frontend

The DevTools user interface itself: source map parsing, HAR import and export, the heap snapshot model, and the protocol client that talks to the browser. Commit 572bfc0.

1. [[devtools-frontend-overview|Overview]]
2. [[devtools-frontend-architecture|Architecture]]
3. [[devtools-frontend-findings|Findings]] — HAR timing phases are computed, and HAR import treats the file as untrusted input
4. [[devtools-frontend-tech-and-services|Technologies and services]]
5. [[devtools-frontend-takeaways|Takeaways for the capstone]]

Modules: [[devtools-frontend-module-source-map|source-map]], [[devtools-frontend-module-har|har]], [[devtools-frontend-module-heap-snapshot|heap-snapshot]], [[devtools-frontend-module-cdp-client|cdp-client]]

Patterns: [[devtools-frontend-pattern-untrusted-input|untrusted input]], [[devtools-frontend-pattern-fail-soft-parsing|fail-soft parsing]], [[devtools-frontend-pattern-lazy-and-off-thread-work|lazy and off-thread work]], [[devtools-frontend-pattern-derived-data-with-unknowns|derived data with unknowns]]

Back to the map: [[00-start-here-browser-devtools-mastery|Start here]].

## My insights
