---
title: "Type-level testing"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Type-level testing

Type-level testing checks that the compiler agrees with the code, not only that the code
runs. A test file calls assertions such as `expectTypeOf(...).toEqualTypeOf<...>()` and
uses `@ts-expect-error` when a line must fail to compile. The suite then fails when the
types drift, so a broken public API never ships.

## Where it shows up

- [[zustand-module-core-store]]
- [[zustand-module-middleware]]
- [[zustand-pattern-type-level-contract]]
- [[06-capstone-how-to-learn-frontend]]

## My insights
