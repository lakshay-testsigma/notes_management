---
title: "nvm-sh/nvm — pattern: Portable shell and avoiding forks"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# Pattern: Portable shell and avoiding forks

## The problem

nvm must run unchanged on macOS, BSD, and Linux, under bash, dash, zsh, and ksh, and it must
source fast at every shell startup. Features that one shell or platform has and another lacks —
GNU `sort -V`, `uname -a`, an alias-free downloader — cannot be assumed.

## What they do

nvm writes to the common POSIX subset and detects capabilities instead of assuming them. Version
sorting is done in pure `awk` because BSD has no `sort -V` (`nvm.sh:2521-2557 @ ad42d90`). Plain
`x.y.z` comparisons stay in shell arithmetic and avoid forking `awk` on the hot path
(`nvm.sh:1234-1256 @ ad42d90`). An exact installed version short-circuits the list pipeline
(`nvm.sh:503-516 @ ad42d90`). `nvm_download` un-aliases and un-functions a name first, so only a
real binary on `PATH` counts (`nvm.sh:77-85 @ ad42d90`).

## Evidence

- `nvm.sh:2521-2557 @ ad42d90` — semver ordering in awk, not GNU `sort -V`.
- `nvm.sh:1234-1256 @ ad42d90` — shell arithmetic avoids a fork per comparison.
- `nvm.sh:503-516 @ ad42d90` — the direct installed-path check skips the pipeline.
- `nvm.sh:77-85 @ ad42d90` — capability detection for the downloader.

## When to use it, and when not to

Use it when the script targets more than one shell or OS and runs at startup. Pay the cost of
hand-rolling only where a portable tool is missing or a fork matters. If you target one shell on
one OS, lean on its built-ins and skip the fallback chains.

## Related

- [[Shell portability]] — the idea: a common subset that runs unchanged across shells and OSes.
- [[nvm-findings|Findings]] — finding 5.

## My insights
