---
title: "ChromeDevTools/devtools-frontend — overview"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — overview

## What it is

This is the user interface of Chrome DevTools, written in TypeScript. It runs as a web app that talks to the browser it inspects. The talk uses the Chrome DevTools Protocol (CDP), a set of JSON commands and events. The README of the data layer calls it "DevTools' foundational data access layer wrapping the Chrome DevTools Protocol" (`front_end/core/sdk/README.md:3 @ 92a1ec4`). Panels such as Network, Performance and Sources sit on top of that layer.

## Why this repository

It is the real code behind the panels the learner uses every day. The source entry marks it tier B: it is owned by the ChromeDevTools organisation, Chrome ships it as the built-in DevTools, and it is BSD-3-Clause licensed. Reading it shows how the Network, Performance, Memory and Sources panels get their data (`sources.json` entry `chromedevtools-devtools-frontend-repo`).

## What was analyzed

- Repository: https://github.com/ChromeDevTools/devtools-frontend
- Commit: `92a1ec4a49607d5892c64093cba46b30aa14377d` (short `92a1ec4`), cloned 2026-11-19 with a blobless shallow clone
- License: BSD-3-Clause (`package.json:13 @ 92a1ec4`; the `LICENSE` file starts with a Chromium Authors copyright header)
- Size: about 8,970 files in the working tree; the code of the app is under `front_end/`
- Four slices are analyzed, listed in the slice plan: the protocol client and targets, network request handling and timing, source map loading, and trace processing for the Performance panel
- Layers inside `front_end/`: `core/` (protocol client, SDK models), `models/` (data logic such as `trace`, `logs`, `heap_snapshot`), `panels/` (one folder per panel, for example `panels/network`), `ui/` (shared widgets)

## Stack

- Language: TypeScript, as ES modules (`package.json:36 @ 92a1ec4`; compiler `@typescript/tsc` at `package.json:53 @ 92a1ec4`)
- Bundler: esbuild (`package.json:58 @ 92a1ec4`); the build itself runs through GN and `vpython3` wrappers (`package.json:21 @ 92a1ec4`)
- Tests: Mocha with Karma and Chrome launcher (`package.json:68-76 @ 92a1ec4`); unit tests sit next to the code as `*.test.ts` files, for example `front_end/core/protocol_client/InspectorBackend.test.ts`
- Browser automation in tests: puppeteer-core (`package.json:79 @ 92a1ec4`)
- Lint: ESLint with custom plugins (`package.json:64 @ 92a1ec4`)

## My insights
