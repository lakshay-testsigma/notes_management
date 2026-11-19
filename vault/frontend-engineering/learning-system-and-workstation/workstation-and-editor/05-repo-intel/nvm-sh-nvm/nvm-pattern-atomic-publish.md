---
title: "nvm-sh/nvm — pattern: Atomic publish after verification"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [nvm-sh-nvm-repo]
---

# Pattern: Atomic publish after verification

## The problem

A download that streams straight to its final name, or an archive extracted in place, can leave
a half-written file. Another process can open the file late, a crash can cut the write short, and
a reader sees a version directory with no working `bin/node`. A reader must never observe the
partial state.

## What they do

nvm separates "prepare in private" from "publish with one rename". A tarball downloads into a
`mktemp`-created `.unverified` directory, is checksum-verified, and only then `mv -f`-ed into the
cache (`nvm.sh:4126-4158 @ ad42d90`). An install extracts into a staging directory, removes the
old version directory, and renames the stage into place with a single `mv`
(`nvm.sh:3847-3864 @ ad42d90`). The installer does the same for its three script files: download
to `.download` temp names in parallel, wait, then rename all of them only after every fetch
succeeded (`install.sh:281-324 @ ad42d90`).

## Evidence

- `nvm.sh:4126-4158 @ ad42d90` — private `.unverified` dir, then `mv -f` only after the checksum passes.
- `nvm.sh:3847-3864 @ ad42d90` — extract to a staging dir and rename the whole tree once.
- `install.sh:281-324 @ ad42d90` — all-or-nothing install of three files.
- `test/fast/Unit tests/nvm_download_artifact only caches verified archives:50-82 @ ad42d90` — the gate is tested.

## When to use it, and when not to

Use it for any file or directory that other code reads as "complete": caches, config files,
installed tools. The cost is an extra rename and some temp space. Skip it for scratch data that
nothing else consumes and that you can regenerate.

## Related

- [[Atomic write]] — the idea: readers see the old or the new version, never a half-written one.
- [[nvm-findings|Findings]] — finding 2.

## My insights
