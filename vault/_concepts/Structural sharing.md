---
title: "Structural sharing"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Structural sharing

Structural sharing means keeping the untouched parts of a data structure by reference
when you change one part of it. The new object is a new top-level value, but the branches
you did not touch are the same objects as before. React relies on this: a component
re-renders only when the value it read changed by identity.

## Where it shows up

- [[zustand-module-core-store]]
- [[zustand-module-middleware]]
- [[zustand-pattern-write-as-patch]]

## My insights
