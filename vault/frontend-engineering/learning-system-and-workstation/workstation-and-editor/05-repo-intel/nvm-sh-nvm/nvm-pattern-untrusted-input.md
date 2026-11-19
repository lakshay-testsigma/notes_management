---
title: "nvm-sh/nvm — pattern: Treating untrusted input"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# Pattern: Treating untrusted input

## The problem

A version manager fetches URLs and reads files it did not write. A mirror can return a crafted
version string, a `.nvmrc` can be a symlink to a secret, and an auth header can carry terminal
control bytes. If any of these reach a shell, a path, or a display, they become code injection,
file disclosure, or terminal spoofing.

## What they do

nvm draws one rule across every entry point: nothing mirror-supplied is re-parsed by the shell,
and nothing hostile is shown. URLs are passed as literal argv to `command curl` / `command wget`,
never interpolated (`nvm.sh:158-160 @ ad42d90`). The downloaded `index.tab` is filtered through
an awk allow-list before any row is used (`nvm.sh:2952-2956 @ ad42d90`). A `.nvmrc` that is a
symlink is rejected and its content is not shown (`nvm.sh:1158-1166 @ ad42d90`). The same rule is
pinned by tests that place `$(touch proof)` in a URL and assert the file never appears
(`test/fast/Unit tests/nvm_download no eval injection:35-44 @ ad42d90`).

## Evidence

- `nvm.sh:158-160 @ ad42d90` — URLs are literal argv, so they are never re-parsed by the shell.
- `nvm.sh:2952-2956 @ ad42d90` — the mirror's index is constrained to a safe shape before use.
- `nvm.sh:1158-1166 @ ad42d90` — a symlinked `.nvmrc` is rejected and its content hidden.
- `test/fast/Unit tests/nvm_download no eval injection:35-44 @ ad42d90` — the injection attack is tested.

## When to use it, and when not to

Use it whenever a string from a remote service, a config file, or another user can reach a
command line, a path, or a log line. Validate at the boundary, then let the rest of the code
assume clean input. You do not need it for strings you wrote yourself inside the program.

## Related

- [[Untrusted input]] — the idea: validate and constrain before a value reaches a shell or path.
- [[nvm-findings|Findings]] — finding 1.

## My insights
