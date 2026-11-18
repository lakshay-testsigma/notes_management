---
title: "dequelabs/axe-core — pattern: Three-valued results"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# Pattern: Three-valued results

## The problem

A tool that says only pass or fail must guess when it cannot see enough. Wrong guesses are false alarms, and people stop trusting the tool.

## What they do

A check returns true, false, or `undefined`. `undefined` is reported as incomplete and shown to a person. A rule can turn all failures into `undefined`. Colour helpers record a reason key for each doubt, so the message says why. Tests pin the case where a heading has no known previous heading.

## Evidence

- `lib/core/base/rule.js:272-287 @ e80f6b7` — false becomes undefined for review-on-fail rules
- `lib/checks/color/color-contrast.json:35-52 @ e80f6b7` — reason keys and messages for each doubt
- `lib/checks/navigation/heading-order-after.js:42-45 @ e80f6b7` — undefined when the previous heading is unknown
- `test/checks/navigation/heading-order.js:528 @ e80f6b7` — the undefined path is tested

## When to use it, and when not to

Use it when the answer depends on things you cannot read, such as images behind text or a page the tool cannot load. Do not use it as a way to avoid deciding: axe still fails clear cases, and the incomplete list must stay short enough to read.

## Related

- [[Three-valued results]] — the idea behind it
- [[axe-core-findings|Findings]]

## My insights
