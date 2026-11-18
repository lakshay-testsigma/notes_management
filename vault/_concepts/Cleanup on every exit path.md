---
title: "Cleanup on every exit path"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Cleanup on every exit path

Cleanup on every exit path means shared state (a "running" flag, temporary data) is reset on success, error and rejection alike. Without it, one failure breaks every later call in a long-lived process.

## Where it shows up

- [[axe-core-pattern-cleanup-on-every-exit]]

## My insights
