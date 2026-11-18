---
title: "dequelabs/axe-core — overview"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — overview

## What it is

axe-core is an accessibility testing engine for websites and other HTML-based interfaces (`README.md:11 @ e80f6b7`). You load one script into a page, call `axe.run()`, and get back a list of rule violations. The README says it finds on average 57% of WCAG issues automatically and returns "incomplete" for elements it cannot judge, which need a person (`README.md:19 @ e80f6b7`). The browser extensions in this topic wrap this engine.

## Why this repository

Deque Systems maintains it. The source entry lists it as tier A: the open-source rules engine behind the axe browser extensions, and it is embedded in Lighthouse, Accessibility Insights, jest-axe and others (from `sources.json`, entry `dequelabs-axe-core-repo`). It fits this topic because it shows what an automated accessibility check can and cannot decide, and how heading, landmark and colour-contrast rules are built.

## What was analyzed

- Repository: https://github.com/dequelabs/axe-core
- Commit: `e80f6b797b32b5f9d60ddaa0a7afad6ed864f121` (short `e80f6b7`), cloned 2026-11-18
- License: MPL-2.0 (`package.json:5 @ e80f6b7`, `LICENSE:1 @ e80f6b7`). Quote only short snippets with a citation.
- Size: 2,069 tracked files. Six slices are analyzed (engine run, frame messaging, heading and landmark rules, colour contrast, tests, build and infra); they are listed in the slice plan. Only selected first-party paths are covered, not the whole repository.

## Stack

- Language: JavaScript, with TypeScript type checking (`typescript` at `package.json:179 @ e80f6b7`, script `test:tsc` at `package.json:84 @ e80f6b7`)
- Package manager: pnpm (`pnpm-workspace.yaml`, `package.json:83 @ e80f6b7`)
- Unit tests: web-test-runner in a real browser (`package.json:85 @ e80f6b7`, `@web/test-runner` at `package.json:134 @ e80f6b7`); end-to-end with selenium-webdriver and chromedriver (`package.json:173 @ e80f6b7`, `package.json:140 @ e80f6b7`); mocha for ACT and ARIA-practices suites (`package.json:104 @ e80f6b7`)
- Build: esbuild and uglify-js (`package.json:151 @ e80f6b7`, `package.json:180 @ e80f6b7`), driven by `build/run-build.mjs`
- Runtime dependency of note: colorjs.io 0.7.1 for colour maths (`package.json:143 @ e80f6b7`)
- CI: GitHub Actions on ubuntu-24.04 (`.github/workflows/test.yml:26 @ e80f6b7`)
- Layout: `lib/core` (engine), `lib/rules`, `lib/checks`, `lib/commons`, `lib/standards`, `doc/`, `locales/`, `test/`

## My insights
