---
title: "mdn/browser-compat-data — overview"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# mdn/browser-compat-data — overview

## What it is

Browser Compat Data (BCD) is a set of JSON files. They say which browser version first supported each web feature (an API, a CSS property, an HTML element). The npm package is `@mdn/browser-compat-data` (`package.json:2 @ 8f942b4`). The README calls it machine-readable compatibility data for web technologies (`README.md:5 @ 8f942b4`). MDN support tables are drawn from it, and the README lists caniuse, caniuse-lite and the `web-features` package among its users (`README.md:259-272 @ 8f942b4`).

## Why this repository

It is the data behind the "can I ship this today?" question that the lesson teaches. The README says the Baseline data is hosted by the W3C WebDX group in `web-platform-dx/web-features`, but that it pulls from BCD (`README.md:242 @ 8f942b4`). Reading BCD shows where the numbers on caniuse and MDN come from. The source entry rates it tier A: MDN and the Mozilla community maintain it, and it is CC0 data.

## What was analyzed

- Repository: https://github.com/mdn/browser-compat-data
- Commit: `8f942b4c263286b32f9c2372801d33dd459dbde8` (short `8f942b4`), cloned 2026-11-17
- License: CC0-1.0 (`package.json:52 @ 8f942b4`, `LICENSE:1 @ 8f942b4`), so short snippets are allowed
- Size: 3,337 tracked files, almost all of them data JSON; 5 slices analyzed, listed in the slice plan

## Stack

- Language: JavaScript as ES modules, with TypeScript types (`package.json:6 @ 8f942b4`, `package.json:96 @ 8f942b4`)
- Runtime: Node 24 or later (`package.json:30 @ 8f942b4`)
- Schema validation: Ajv, a JSON Schema checker (`package.json:67 @ 8f942b4`)
- Style checks: ESLint, Prettier and `tsc --noEmit` (`package.json:108 @ 8f942b4`)
- Tests: the Node built-in test runner with `c8` coverage (`package.json:106 @ 8f942b4`)
- CI: GitHub Actions; the `Test` workflow has format, lint and unit-test jobs (`.github/workflows/test.yml:1 @ 8f942b4`)
- Layout: one folder per area (`api/`, `css/`, `html/`, `javascript/`, `http/`, `svg/`, `webextensions/`), plus `browsers/` for browser release data and `schemas/` for the data format

## My insights
