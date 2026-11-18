---
title: "conventional-changelog/commitlint — overview"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, workstation, repo-intel]
created: 2026-11-18
sources: [conventional-changelog-commitlint-repo]
---

# conventional-changelog/commitlint — overview

## What it is

commitlint checks that a commit message follows a set of rules, such as the Conventional Commits format (`type(scope): subject`). It is a pnpm monorepo of small packages under `@commitlint/*` (`pnpm-workspace.yaml:1-3 @ d2be18a`). The command-line tool runs from a Git `commit-msg` hook with `--edit $1` (`.husky/commit-msg:1 @ d2be18a`), and the same checker runs in CI (`.github/workflows/commitlint.yml:1 @ d2be18a`).

## Why this repository

The source entry calls it the de facto TypeScript linter for Conventional Commits, owned by the conventional-changelog organisation under the MIT license, used by `nestjs/nest` and `conventional-changelog/conventional-changelog`. The capstone CLI lints commit messages and writes release notes from conventional commits, so the parser, the rule engine and the hook and CI wiring are the parts to study.

## What was analyzed

- Repository: https://github.com/conventional-changelog/commitlint
- Commit: `d2be18a5198d3792fd6d1268e1fdca87f45e55ba` (short `d2be18a`), cloned 2026-11-18
- License: MIT (`license.md:1 @ d2be18a`)
- Size: 736 tracked files; 5 slices planned (see the slice plan in the state `handoffs` folder), first-party packages only. Excluded: `docs/` website, other shared configs (`config-nx-scopes`, `config-angular` and similar), `cz-commitlint` and `prompt*`, lock file, vendored or transitive dependencies.
- Slices: parser-and-lint, rules, config-loading, cli-and-hooks, build-and-infra.

## Stack

- Language and compiler: TypeScript (`package.json:60 @ d2be18a`)
- Tests: vitest with istanbul coverage (`package.json:46,54,65 @ d2be18a`)
- Monorepo tooling: pnpm workspaces and lerna; publishing uses `lerna publish --conventional-commits` (`package.json:43 @ d2be18a`)
- Git hooks: husky, installed by the `prepare` script (`package.json:47,55 @ d2be18a`)
- CI: GitHub Actions with workflows `CI.yml`, `audit.yml`, `commitlint.yml`, `container-build.yml`, `docs-deploy.yml` (`.github/workflows/commitlint.yml:1 @ d2be18a`); the commitlint workflow checks out with `fetch-depth: 0` (`.github/workflows/commitlint.yml:21 @ d2be18a`)

## My insights
