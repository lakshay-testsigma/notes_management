---
title: "Patch-based update"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Patch-based update

A patch-based update changes part of a state object and keeps the rest. The caller sends
the keys that change, not the whole state, so the parts nobody touched keep their
identity. It is the opposite of replacing the state, and it saves a re-render.

## Where it shows up

- [[zustand-pattern-write-as-patch]]

## My insights
