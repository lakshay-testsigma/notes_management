---
title: "Browser extension toolkit (install once, used across phases) — mini projects"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: mini-projects
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Browser extension toolkit (install once, used across phases) — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you
what to write, the second tells you only what must work. Start in the `starter/`
folder, run the tests, and make them pass. Open `solution/` only after your
tests pass or after you have used the hints. Read the
[[02-lesson-browser-extension-toolkit|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | Extension permission audit | A team lead approves extensions for the company browser profile; a script reads each manifest and flags broad host access and risky APIs | 2 h | guided | `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/mini-01-extension-permission-audit/README.md` |
| 2 | Release accessibility and SEO check | A content site checks every release page; a script runs axe-core and reads title, meta, canonical and structured data, and fails CI only on new problems | 2.5 h | less guided | `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/mini-02-release-a11y-seo-check/README.md` |

## What each project proves

- **Project 1** proves that manifest permissions decide what an extension can reach: the script scores broad hosts, risky APIs and all-sites content scripts against a JSON policy. How it runs: [[visual-mini-01-flow-browser-extension-toolkit]].
- **Project 2** proves that automated checks see only part of a page: it keeps three outcomes (violation, pass, needs review) and compares each run with a saved baseline. How it runs: [[visual-mini-02-flow-browser-extension-toolkit]].

## My insights
