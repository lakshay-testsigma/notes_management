---
title: "nvm-sh/nvm — pattern: Distinct exit codes per failure class"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# Pattern: Distinct exit codes per failure class

## The problem

If every error returns `1`, a caller that must react differently cannot tell the failures apart.
A shell-startup hook needs to know "version not installed" from "wrong usage", because one is a
silent skip and the other is a message to the user.

## What they do

nvm assigns a fixed code to each failure class and keeps it stable: 127 for "no version /
unknown command", 55 for a bad or unsupported option, 6 for contradictory flags, 8 for an
infinite alias loop, 3 for "not installed", 11 for a misconfigured npm prefix
(`nvm.sh:7113-7116 @ ad42d90`, `nvm.sh:6403-6406 @ ad42d90`, `nvm.sh:6197-6202 @ ad42d90`). The
tests assert the exact codes, and one test proves inner exit codes propagate to the caller
(`test/fast/Unit tests/failed checks propagate their exit codes:25-35 @ ad42d90`).

## Evidence

- `nvm.sh:7113-7116 @ ad42d90` — unknown command returns 127.
- `nvm.sh:6403-6406 @ ad42d90` — a bad option returns 55.
- `nvm.sh:6197-6202 @ ad42d90` — an infinite alias loop returns 8.
- `test/fast/Unit tests/nvm_alias:14-24 @ ad42d90` — the codes are asserted.

## When to use it, and when not to

Use it when a caller branches on the *cause* of a failure. Pick a small, documented set of codes
and do not reuse them for different causes. For a script that always exits on the first error,
a single code is fine and the extra taxonomy is noise.

## Related

- [[Error classification]] — the idea: a code per failure kind so callers can react differently.
- [[nvm-findings|Findings]] — finding 3.

## My insights
