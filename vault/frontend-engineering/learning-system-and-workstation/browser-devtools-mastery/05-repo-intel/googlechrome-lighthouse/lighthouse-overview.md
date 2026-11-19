---
title: "GoogleChrome/lighthouse — overview"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — overview

## What it is

Lighthouse is a tool that loads a web page in Chrome, records what happened, and scores the page. It talks to Chrome over the DevTools Protocol, collects raw data (a trace and network records), computes metrics such as Largest Contentful Paint (LCP), Total Blocking Time (TBT) and Cumulative Layout Shift (CLS), and turns each metric into a score. The same engine runs in the DevTools Lighthouse panel, the command line, and Node.

## Why this repository

It is owned by the Google Chrome team and is the reference implementation of the audits. The source entry lists WebPageTest, HTTP Archive, Calibre, DebugBear, SpeedCurve and Treo as services built on it. It has unit and smoke tests run in GitHub Actions. It shows how a program drives Chrome over the protocol, which is what the learner's capstone "Page health inspector" will do.

## What was analyzed

- Repository: https://github.com/GoogleChrome/lighthouse
- Commit: `3b399f6ca81616eb9253f7c140563b5be7a8a73e` (short `3b399f6`), cloned 2026-11-19
- License: Apache-2.0 (`package.json:189 @ 3b399f6`, file `LICENSE`)
- Size: 1,515 tracked files; 4 slices chosen, listed in the slice plan. Selected first-party paths are under `core/` only; vendored and transitive code is excluded.

## Stack

- Language and runtime: JavaScript with TypeScript type checks, Node 22.19 or newer (`package.json:13 @ 3b399f6`, `package.json:149 @ 3b399f6`)
- Chrome control: puppeteer-core and chrome-launcher (`package.json:157 @ 3b399f6`, `package.json:167 @ 3b399f6`), with a pinned devtools-protocol version (`package.json:176 @ 3b399f6`)
- Tests: mocha unit runs and smoke tests (`package.json:55 @ 3b399f6`, `package.json:62 @ 3b399f6`)
- CI: GitHub Actions workflows (`.github/workflows/smoke.yml:1 @ 3b399f6`)

## My insights
