---
title: "dequelabs/axe-core — pattern: Rules as data"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# Pattern: Rules as data

## The problem

If each rule is a hand-written function, adding a rule means new code, and users cannot tune behaviour without forking.

## What they do

A rule is a small JSON file: selector, tags, impact and check ids. Checks are shared functions with options, so two rules can reuse one function. A strict order decides which rules run. The build validates all rule and check files before it bundles anything.

## Evidence

- `lib/checks/keyboard/page-has-main.json:3-8 @ e80f6b7` — a data file reuses a shared function
- `lib/checks/navigation/region.json:5-7 @ e80f6b7` — an option, `regionMatcher`, tunes a check
- `lib/core/utils/rule-should-run.js:57-80 @ e80f6b7` — strict order of rule selection
- `build/run-build/full-build.mjs:36-42 @ e80f6b7` — validation fails the build

## When to use it, and when not to

Use it when you expect many similar checks or want users to switch some off. Do not use it for logic that does not repeat: a plain function is clearer. Treat data that can hold code, such as check source strings, as trusted input (`lib/core/base/check.js:8-14 @ e80f6b7`).

## Related

- [[Rules as data]] — the idea behind it
- [[Untrusted input]] — why rule data that holds code must come from a trusted place
- [[axe-core-findings|Findings]]

## My insights
