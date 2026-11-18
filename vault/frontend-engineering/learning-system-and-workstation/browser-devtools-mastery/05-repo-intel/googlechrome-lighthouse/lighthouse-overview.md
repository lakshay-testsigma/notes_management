---
title: "GoogleChrome/lighthouse — overview"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — overview

## What it is

Lighthouse is a tool that loads a web page in Chrome, records what happened, and scores the page for performance, accessibility, best practices and SEO. Its readme describes it as analyzing "web apps and web pages, collecting modern performance metrics and insights on developer best practices" (`readme.md:3 @ 3b399f6`). The same engine runs in the Chrome DevTools Lighthouse panel, the Node CLI and the Node module (`readme.md:33-39 @ 3b399f6`, `readme.md:8 @ 3b399f6`).

## Why this repository

The project is maintained by the Google Chrome team and is the engine behind the DevTools Lighthouse panel (`sources.json` entry `googlechrome-lighthouse-repo`, tier A, Apache-2.0). For a DevTools learner it shows what the panels do under the surface: how a page load becomes a trace and a network log, and how audits turn those records into metrics such as LCP and TBT. The capstone CLI reads the same report and trace formats.

## What was analyzed

- Repository: https://github.com/GoogleChrome/lighthouse
- Commit: `3b399f6ca81616eb9253f7c140563b5be7a8a73e` (short `3b399f6`), cloned 2026-11-18
- License: Apache-2.0 (`LICENSE:2 @ 3b399f6`)
- Size: 1,515 tracked files; 4 slices analyzed (gather pipeline, metrics and trace, audits and scoring, build and infra), listed in the slice plan
- Coverage: selected first-party paths under `core/`, plus build and CI files. This is not the whole repository; the report renderer, flow report, CLI, viewer and treemap are skipped.

## Stack

- Language: JavaScript with TypeScript type checking, Node 22.19 or newer (`package.json:13 @ 3b399f6`, `tsconfig-base.json:20-21 @ 3b399f6`)
- Browser control: `puppeteer-core` over the Chrome DevTools Protocol (`package.json:167 @ 3b399f6`), with `chrome-launcher` to start Chrome (`package.json:157 @ 3b399f6`)
- Trace analysis: `@paulirish/trace_engine` (`package.json:155 @ 3b399f6`)
- Audit helpers: `axe-core` for accessibility, `third-party-web` for third-party entities, `lighthouse-stack-packs` for framework advice (`package.json:156,170,166 @ 3b399f6`)
- Bundling: `esbuild` (`package.json:127 @ 3b399f6`); CI is GitHub Actions (`.github/workflows/ci.yml:1 @ 3b399f6`)

## My insights
