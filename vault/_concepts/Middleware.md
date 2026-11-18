---
title: "Middleware"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Middleware

A middleware is a function that wraps the function that creates a store. It receives the
store creator and returns a new creator, so it can add features to every store without
changing the store code. Zustand middlewares add a draft-based update, a selector
subscription, a Redux-style dispatch, or a server-side safety switch.

## Where it shows up

- [[zustand-module-middleware]]
- [[zustand-pattern-middleware-as-decorator]]

## My insights
