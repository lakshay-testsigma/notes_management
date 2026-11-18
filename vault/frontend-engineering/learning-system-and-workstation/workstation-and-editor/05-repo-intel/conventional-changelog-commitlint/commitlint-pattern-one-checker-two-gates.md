---
title: "conventional-changelog/commitlint — pattern: One checker, two gates"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel, conventional-commits]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# Pattern: One checker, two gates

## The problem

A local Git hook can be skipped, and CI alone gives feedback too late. Two separate implementations drift apart, and exit codes differ.

## What they do

One CLI serves both. The hook runs it with `--edit $1` (`.husky/commit-msg:1 @ d2be18a`). CI runs it on the last commit for a push and on a range for a pull request (`.github/workflows/commitlint.yml:46-52 @ d2be18a`). Inside, `read()` picks edit file, `--last` or a range (`@commitlint/read/src/read.ts:25-38 @ d2be18a`). The caller reads only the exit code (`@commitlint/cli/src/cli.ts:392-405 @ d2be18a`). CI checks out full history, and the range code refuses a shallow clone (`.github/workflows/commitlint.yml:18-21 @ d2be18a`, `@commitlint/read/src/read.ts:62-81 @ d2be18a`). The hook runs the freshly built CLI, and pre-commit builds first (`.husky/pre-commit:3-5 @ d2be18a`).

## Evidence

- `@commitlint/cli/src/cli.ts:247-269 @ d2be18a` — rules for mixing `--last`, `--from` and `--to`.
- `@commitlint/cli/src/cli-error.ts:1-7 @ d2be18a` — one list of exit codes.
- `.github/workflows/commitlint.yml:10-11 @ d2be18a` — the CI job has read-only permission.

## When to use it, and when not to

Use it for any rule you want to hold for a whole team. Keep the hook fast and let CI do range checks. Do not duplicate rule logic in shell scripts.

## Related

- [[Git hooks]] — scripts Git runs at fixed moments
- [[Exit codes]] — the only thing a hook or CI reads
- [[commitlint-findings|Findings]]

## My insights
