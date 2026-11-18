---
title: "pmndrs/zustand — pattern: Middleware as a decorator"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# Pattern: Middleware as a decorator

## The problem

A store often needs extra behaviour: save every write, record every action, or refuse a
write on the server. Writing that behaviour into the store itself means every app that
wants it pays for it, and writing it into the callers means every call site has to
remember it.

## What they do

A middleware takes the function that creates a store and returns a new one. It replaces
a method on the live store object, hands the replaced method to the creator, and returns
what the creator returns. Because the replacement happens on the object itself, a call
from outside the creator gets the same behaviour.

## Evidence

- `src/middleware/immer.ts:73-87 @ 9fed2eb` — the three steps every middleware follows.
- `src/middleware/subscribeWithSelector.ts:50-51 @ 9fed2eb` — a second middleware that
  replaces `subscribe` the same way.
- `tests/immer.test.tsx:64-73 @ 9fed2eb` — a write from outside the creator still gets
  the draft.
- `src/middleware/immer.ts:48-50 @ 9fed2eb` — the implementation stays loose while the
  public type stays exact.

## When to use it, and when not to

Use it when the extra behaviour is optional and several apps want different combinations
of it. Do not use it for behaviour that every caller needs, such as validating the state
on every write. Put that inside the store, where nobody can forget it.

## Related

- [[Decorator]] — the idea behind the pattern.
- [[Middleware]] — the contract itself.
- [[zustand-findings|Findings]]
- [[zustand-module-middleware|middleware]]

## My insights
