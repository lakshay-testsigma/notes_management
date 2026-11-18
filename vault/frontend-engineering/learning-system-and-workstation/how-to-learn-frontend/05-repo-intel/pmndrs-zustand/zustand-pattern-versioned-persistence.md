---
title: "pmndrs/zustand — pattern: Versioned persistence"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# Pattern: Versioned persistence

## The problem

Saved data outlives the code that wrote it. When the shape of the state changes, the
value already in the browser has the old shape. Merging it into the new store gives a
state that matches neither version, and the bug appears far away from the change that
caused it.

## What they do

The saved value is a small object with the state and a `version` number. At start-up the
stored version is compared with the version in the options. A mismatch runs a `migrate`
function with the old state and the old version. Without a `migrate` function, the
middleware logs an error and drops the stored value instead of writing a broken state
back.

## Evidence

- `src/middleware/persist.ts:262-284 @ 9fed2eb` — the version check and the three
  outcomes: use it, migrate it, or drop it.
- `src/middleware/persist.ts:93-105 @ 9fed2eb` — the option's own comment says the
  version is for a breaking change to the store.
- `tests/persistSync.test.tsx:136 @ 9fed2eb` — the test for a version mismatch.
- `tests/persistSync.test.tsx:173 @ 9fed2eb` — the test for a missing migration function.

## When to use it, and when not to

Use it as soon as you save anything a user can still have when you change the shape.
Do not use it for a cache that you can rebuild, because deleting it is cheaper than
writing a migration.

## Related

- [[Versioned persistence]] — the idea behind the pattern.
- [[zustand-findings|Findings]]
- [[zustand-module-persist-and-devtools|persist-and-devtools]]

## My insights
