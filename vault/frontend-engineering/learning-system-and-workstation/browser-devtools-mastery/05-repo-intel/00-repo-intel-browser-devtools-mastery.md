---
title: "Browser DevTools mastery (used in every phase) — repository deep dive"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo, chromedevtools-devtools-frontend-repo]
---

# Browser DevTools mastery (used in every phase) — repository deep dive

How production codebases implement this topic. Read the notes of a repository in the
order shown.

## GoogleChrome/lighthouse

The audit engine behind the Lighthouse panel: it drives Chrome over the DevTools Protocol, records a trace and network log, computes LCP, TBT and CLS, and scores audits. Commit 3b399f6.

1. [[lighthouse-overview|Overview]]
2. [[lighthouse-architecture|Architecture]]
3. [[lighthouse-findings|Findings]] — raw CDP messages are saved and network records are rebuilt later by replay
4. [[lighthouse-tech-and-services|Technologies and services]]
5. [[lighthouse-takeaways|Takeaways for the capstone]]

Modules: [[lighthouse-module-cdp-session-and-navigation|cdp-session-and-navigation]], [[lighthouse-module-gatherers-and-artifacts|gatherers-and-artifacts]], [[lighthouse-module-metrics-lcp-tbt-cls|metrics-lcp-tbt-cls]], [[lighthouse-module-audit-scoring-and-runner|audit-scoring-and-runner]]

Patterns: [[lighthouse-pattern-keep-evidence-on-failure|keep evidence on failure]], [[lighthouse-pattern-record-raw-then-derive|record raw, then derive]], [[lighthouse-pattern-layered-timeouts-and-settling|layered timeouts and settling]], [[lighthouse-pattern-declare-inputs-explicitly|declare inputs explicitly]]

## ChromeDevTools/devtools-frontend

The code of the Chrome DevTools panels themselves: a TypeScript web app that talks CDP and turns protocol data into the Network waterfall, the Performance trace view and source-mapped debugging. Commit 92a1ec4.

1. [[devtools-frontend-overview|Overview]]
2. [[devtools-frontend-architecture|Architecture]]
3. [[devtools-frontend-findings|Findings]] — each CDP command gets an id and a stored promise; replies are matched by id
4. [[devtools-frontend-tech-and-services|Technologies and services]]
5. [[devtools-frontend-takeaways|Takeaways for the capstone]]

Modules: [[devtools-frontend-module-protocol-client|protocol-client]], [[devtools-frontend-module-network-timing|network-timing]], [[devtools-frontend-module-source-maps|source-maps]], [[devtools-frontend-module-trace-processing|trace-processing]]

Patterns: [[devtools-frontend-pattern-failures-as-values|failures as values]], [[devtools-frontend-pattern-tolerate-incomplete-events|tolerate incomplete events]], [[devtools-frontend-pattern-two-pass-and-chunked-work|two-pass and chunked work]]

Back to the map: [[00-start-here-browser-devtools-mastery|Start here]].

## My insights
