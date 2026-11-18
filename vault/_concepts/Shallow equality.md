---
title: "Shallow equality"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Shallow equality

Shallow equality compares two values one level deep: the primitives inside must be the
same, but nested objects only need to be the same references, not the same contents.
It is used to decide whether a freshly built value (a new array of the same items, for
example) counts as a change, so that a store does not wake every subscriber for a
value that did not really change.

## Where it shows up

- [[zustand-module-core-store]]

## My insights
