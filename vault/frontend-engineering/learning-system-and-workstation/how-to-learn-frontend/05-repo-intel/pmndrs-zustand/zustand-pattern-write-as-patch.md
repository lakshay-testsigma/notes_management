---
title: "pmndrs/zustand — pattern: Write as a patch"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# Pattern: Write as a patch

## The problem

When a store replaces its whole state on every write, every part of the state gets a
new identity. A component that reads one slice then re-renders even when its own slice
did not change, and a careful merge inside the caller becomes the only way to keep the
untouched parts stable.

## What they do

The store takes a patch and merges it over the current state. A replacement happens
only when the caller asks for it with `replace`, or when the new value is not an object
at all. The merge is one level deep, so a nested object is replaced whole, and the
untouched branches keep their identity.

## Evidence

- `src/vanilla.ts:75-78 @ 9fed2eb` — the merge and the two conditions for a replacement.
- `tests/vanilla/basic.test.ts:109-120 @ 9fed2eb` — the test that pins the patch
  behaviour.
- `tests/immer.test.tsx:41-62 @ 9fed2eb` — the same rule with a draft update, where the
  untouched branch keeps its old contents.

## When to use it, and when not to

Use it when the state has independent parts and one part changes at a time, which is
the normal case for a form or a log. Do not use it when the new state must not keep any
old value, such as a login form that has to be cleared completely. Then pass
`replace` and say so in the call.

## Related

- [[Patch-based update]] — the idea behind the pattern.
- [[Structural sharing]] — what the merge protects.
- [[zustand-findings|Findings]]
- [[zustand-module-core-store|core-store]]

## My insights
