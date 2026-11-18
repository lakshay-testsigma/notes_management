---
title: "ChromeDevTools/devtools-frontend — overview"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — overview

## What it is

This repository holds the client side of Chrome DevTools: the TypeScript and CSS code that runs the DevTools web app (`README.md:8-9 @ 572bfc0`). DevTools talks to the browser through the Chrome DevTools Protocol, and the code is split into `core`, `models`, `panels`, `ui` and `entrypoints` folders under `front_end/`. The npm package is named `chrome-devtools-frontend` (`package.json:14 @ 572bfc0`).

## Why this repository

It is the real implementation of the tool the learner uses every day, so each lesson concept (source maps, the Network panel, HAR export, heap snapshots) has a real code path. The source entry rates it tier A: the client side of Chrome DevTools, BSD-3-Clause, mirrored from chromium.googlesource.com. The repository is huge, so only narrow subtrees are studied: the source-map parser, HAR import and export, the heap snapshot model, and the protocol client.

## What was analyzed

- Repository: https://github.com/ChromeDevTools/devtools-frontend
- Commit: `572bfc046bf9e5b65113fc420b68e89741d1510d` (short `572bfc0`), fetched 2026-11-18 as a tarball of that commit
- License: BSD-3-Clause (`package.json:13 @ 572bfc0`)
- Size: 8,974 files in the extracted tree; 4 slices planned, listed in the slice plan
- Not analyzed: UI panels, trace and AI models, vendored `third_party`, and the build-and-infra slice (dropped for budget)

## Stack

- Language: TypeScript, pinned in `package.json:86 @ 572bfc0`
- Build: GN and gclient through `DEPS` (`DEPS:7 @ 572bfc0`, `DEPS:33 @ 572bfc0`); tests start through `vpython3 ... run.js` (`package.json:33 @ 572bfc0`)
- Tests: mocha, karma and puppeteer-core (`package.json:68 @ 572bfc0`, `package.json:76 @ 572bfc0`, `package.json:79 @ 572bfc0`); test folders `test/unit`, `test/e2e`, `test/perf` (listing of `test/`)
- Lint: eslint and stylelint (`package.json:59 @ 572bfc0`, `package.json:82 @ 572bfc0`)
- Release: a GitHub workflow publishes to npm on version tags (`.github/workflows/publish-to-npm-on-tag.yml:3-6 @ 572bfc0`)

## My insights
