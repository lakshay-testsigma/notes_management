---
title: "Browser extension toolkit (install once, used across phases) — repository deep dive"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# Browser extension toolkit (install once, used across phases) — repository deep dive

How production codebases implement this topic. Read the notes of a repository in the
order shown.

## dequelabs/axe-core

The accessibility rules engine inside axe DevTools, Lighthouse accessibility audits and many browser extensions: it runs rules on the live DOM, across iframes, and reports violations, passes and incomplete results. Commit e80f6b7.

1. [[axe-core-overview|Overview]]
2. [[axe-core-architecture|Architecture]]
3. [[axe-core-findings|Findings]] — a check can return "incomplete", so doubtful cases go to a person instead of a false pass or fail
4. [[axe-core-tech-and-services|Technologies and services]]
5. [[axe-core-takeaways|Takeaways for the capstone]]

Modules: [[axe-core-module-engine-run|engine-run]], [[axe-core-module-frame-messaging|frame-messaging]], [[axe-core-module-headings-landmarks-rules|headings-landmarks-rules]], [[axe-core-module-color-contrast|color-contrast]], [[axe-core-module-a11y-tests|a11y-tests]], [[axe-core-module-build-and-infra|build-and-infra]]

Patterns: [[axe-core-pattern-three-valued-results|three-valued results]], [[axe-core-pattern-rules-as-data|rules as data]], [[axe-core-pattern-cleanup-on-every-exit|cleanup on every exit]], [[axe-core-pattern-compute-once-and-cache|compute once and cache]]

Back to the map: [[00-start-here-browser-extension-toolkit|Start here]].

## My insights
