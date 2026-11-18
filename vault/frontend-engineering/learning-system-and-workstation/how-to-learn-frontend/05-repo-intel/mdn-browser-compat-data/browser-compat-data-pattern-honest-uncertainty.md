---
title: "mdn/browser-compat-data — pattern: Honest uncertainty"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-17
sources: [mdn-browser-compat-data-repo]
---

# Pattern: Honest uncertainty

## The problem

A caniuse-style table shows a clean number or a green cell. Real history is messier: nobody knows the exact first version of an old browser, a feature may work only in part, and a missing cell is not the same as "no".

## What they do

The data states what it knows. `≤79` means "confirmed in 79, maybe earlier". `preview` means "only in a beta". `false` means not supported. A support history can be a list, so a partial early version keeps a required note. Ranged values are allowed only for old releases, so new data must be exact. On the reading side, a missing browser becomes `{ version_added: false }`, so a reader always gets an answer, and the mirror step keeps `≤` instead of inventing a precise number.

## Evidence

- `schemas/compat-data.schema.json:13 @ 8f942b4` — the version pattern allows `≤N` and `preview`
- `schemas/compat-data-schema.md:271-306 @ 8f942b4` — what each value means
- `lint/linter/test-versions.js:15-16 @ 8f942b4` and `lint/linter/test-versions.js:137-149 @ 8f942b4` — ranges only before the cutoff date
- `api/AbortController.json:34-44 @ 8f942b4` — a partial row with a note
- `scripts/build/mirror.js:139-140 @ 8f942b4` — `≤` survives mirroring
- `utils/iter-support.js:20 @ 8f942b4` — missing means `version_added: false`

## When to use it, and when not to

Use it when your data comes from sources of different quality, such as your own notes about browsers. Store "unknown" as its own value, not as a guess. Do not add states nobody will read: BCD can afford them because its tables show them.

## Related

- [[Baseline status]] — a status that also admits "not yet widely available"
- [[Core browsers]] — the set of browsers the experimental check uses
- [[browser-compat-data-findings|Findings]]
- [[browser-compat-data-module-consumer-api|consumer-api]]

## My insights
