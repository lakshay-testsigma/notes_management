---
title: "nvm-sh/nvm — overview"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# nvm-sh/nvm — overview

## What it is

nvm (Node Version Manager) installs and switches between Node.js versions from the command
line. It is a single POSIX shell script, `nvm.sh`, that you source into your shell, plus a small
installer and a `nvm-exec` wrapper for non-shell tools (`README.md:77-101 @ ad42d90`,
`nvm.sh:1-5 @ ad42d90`). Each installed version lives in its own directory under `NVM_DIR`, and
`nvm use` rewrites `PATH` so the chosen `node` wins.

## Why this repository

It is the reference implementation of Node version management: a MIT-licensed POSIX bash tool
owned by the nvm-sh organisation with 96,173 stars, tests and GitHub Actions CI, and Google
Cloud Shell ships it as a pre-installed tool. For this topic it shows how a tool that every
frontend developer runs once a day is actually built: shell portability, safe downloads, and
`PATH` manipulation, with no framework in between.

## What was analyzed

- Repository: https://github.com/nvm-sh/nvm
- Commit: `ad42d9086090ec3e0c0fed12c74dd7f7f06b7758` (short `ad42d90`), cloned 2026-11-19
- License: MIT (`LICENSE.md:1 @ ad42d90`)
- Size: 550 tracked files, 8 module slices (listed in the slice plan; `nvm.sh` is read by line
  range because it is 7,317 lines)
- Not analyzed: the slow/network integration suites, recorded fixtures, and the README beyond
  its intro

## Stack

- Language: POSIX shell (sh, dash, ksh, zsh, bash) — the file header states the target shells
  (`nvm.sh:1-5 @ ad42d90`)
- Installer: bash-only `install.sh` that refuses to run under zsh
  (`install.sh:25-28 @ ad42d90`)
- Test runner: urchin with npm scripts (`package.json:8-13 @ ad42d90`,
  `package.json:44-52 @ ad42d90`), driven by `make` over a shell matrix
  (`Makefile:20-26 @ ad42d90`)
- CI: GitHub Actions, fast tests on a shell matrix on `ubuntu-latest`
  (`.github/workflows/tests-fast.yml:14-22 @ ad42d90`)
- Build/quality tools: shellcheck and a set of linters installed as npm dev dependencies
  (`package.json:44-52 @ ad42d90`); a dev-only Docker image on Ubuntu 22.04
  (`Dockerfile:9 @ ad42d90`)
- External services: the nodejs.org release index and optional download mirrors, reached with
  `curl` or `wget` (`README.md:109-114 @ ad42d90`)

## My insights
