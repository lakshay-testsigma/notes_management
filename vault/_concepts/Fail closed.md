---
title: "Fail closed"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Fail closed

Fail closed means that when a program cannot tell what is safe, it picks the safe choice. A cache that cannot read a header, for example, does not store the response.

## Where it shows up

- [[undici-pattern-bounded-resources]]
- [[undici-pattern-fail-closed-parsing]]

## My insights
