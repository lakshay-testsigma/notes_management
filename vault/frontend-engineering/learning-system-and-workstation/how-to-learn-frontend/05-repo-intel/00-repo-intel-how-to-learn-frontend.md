---
title: "How to learn frontend (and keep improving) — repository deep dives"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# Repository deep dives for How to learn frontend (and keep improving)

How a production codebase implements this topic. Read the notes of a repository in the
order shown.

## mdn/browser-compat-data

The browser support data behind MDN and caniuse tables: JSON files are linted, built (resolving `"mirror"` values), and published to npm. Chosen because every support table you read starts here. Commit 8f942b4.

1. [[browser-compat-data-overview|Overview]]
2. [[browser-compat-data-architecture|Architecture]]
3. [[browser-compat-data-findings|Findings]] — the package has no Baseline field; Baseline lives in web-features, linked by tags
4. [[browser-compat-data-tech-and-services|Technologies and services]]
5. [[browser-compat-data-takeaways|Takeaways for the capstone]]

Modules: [[browser-compat-data-module-schema-and-types|schema-and-types]], [[browser-compat-data-module-data-linter|data-linter]], [[browser-compat-data-module-build-pipeline|build-pipeline]], [[browser-compat-data-module-consumer-api|consumer-api]], [[browser-compat-data-module-build-and-infra|build-and-infra]]

Patterns: [[browser-compat-data-pattern-schema-first-data|schema-first data]], [[browser-compat-data-pattern-derive-dont-copy|derive, don't copy]], [[browser-compat-data-pattern-honest-uncertainty|honest uncertainty]], [[browser-compat-data-pattern-guarded-release|guarded release]]

Back to the map: [[00-start-here-how-to-learn-frontend|Start here]].

## My insights
