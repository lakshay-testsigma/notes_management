---
title: "pmndrs/zustand — pattern: Type-level contract tests"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [pmndrs-zustand-repo]
---

# Pattern: Type-level contract tests

## The problem

A runtime test can only show what the code does with a value that already type-checks.
When the contract itself is wrong, such as a middleware that should widen the type of
`getState`, only the compiler can see it. And a broken type often shows up in a
different package, weeks later.

## What they do

The suite states the expected types and never runs them. A component that is never
rendered holds the assertions, and the type checker is the test runner. A negative
assertion uses the `@ts-expect-error` directive, so the file stops compiling if the
error ever stops being an error.

## Evidence

- `tests/middlewareTypes.test.tsx:55 @ 9fed2eb` — the component that is never rendered
  and the only runtime assertion.
- `tests/middlewareTypes.test.tsx:212-215 @ 9fed2eb` — the negative checks that must not
  compile.
- `tests/middlewareTypes.test.tsx:19-38 @ 9fed2eb` — a middleware written by the test
  itself, so the contract is proved with a third-party case.
- `tests/types.test.tsx:109-136 @ 9fed2eb` — the same trick in the core store tests.

## When to use it, and when not to

Use it for the seams of your code: the extension contract, the public types, the
arguments of a function that many callers use. Do not use it for ordinary logic. A type
assertion cannot tell you that a function returned the right value, so keep the runtime
test as well.

## Related

- [[Type-level testing]] — the idea behind the pattern.
- [[zustand-findings|Findings]]
- [[zustand-module-middleware|middleware]]

## My insights
