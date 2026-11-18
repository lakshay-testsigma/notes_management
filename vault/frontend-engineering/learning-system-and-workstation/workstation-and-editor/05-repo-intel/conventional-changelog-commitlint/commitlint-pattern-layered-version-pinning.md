---
title: "conventional-changelog/commitlint — pattern: Layered version pinning"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel, conventional-commits]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# Pattern: Layered version pinning

## The problem

If Node and the package manager are only named in a README, laptops, CI and Docker images drift apart. A bug then shows up on one machine only.

## What they do

Each layer has one job. `engines` states the floor for users (`package.json:85-88 @ d2be18a`). `packageManager` states the exact pnpm version and a sha512 hash (`package.json:89 @ d2be18a`). `.mise.toml` sets the local shell (`.mise.toml:1-3 @ d2be18a`). CI reads `packageManager` and does not repeat the number (`.github/workflows/CI.yml:44-46 @ d2be18a`). The Docker build reads the same field and checks the hash itself, because Corepack is not available on newer Node (`Dockerfile.ci:6-13 @ d2be18a`). `engineStrict` is off on purpose (`pnpm-workspace.yaml:30-32 @ d2be18a`). No `.nvmrc` was found at the clone root, so a `.nvmrc` is optional when another tool, here mise, does that job.

## Evidence

- `@commitlint/cli/package.json:57-58 @ d2be18a` — each published package repeats the Node floor.
- `.github/workflows/CI.yml:136-142 @ d2be18a` — one CI job avoids Corepack on stock Ubuntu Node.
- `.github/workflows/CI.yml:35-39 @ d2be18a` — a matrix of Node 22 and 24 tests the range.

## When to use it, and when not to

Use it as soon as CI exists. Keep one source of truth for the exact version and let other files read it. Do not pin to a hash if your tools cannot verify it.

## Related

- [[Tool version pinning]] — the idea behind it
- [[Corepack]] — the Node tool that reads `packageManager`
- [[ES modules and CommonJS]] — pure-ESM packages also needed special resolution here (`@commitlint/resolve-extends/src/index.ts:86-92 @ d2be18a`)
- [[commitlint-findings|Findings]]

## My insights
