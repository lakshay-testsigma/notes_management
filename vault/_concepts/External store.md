---
title: "External store"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# External store

An external store is a piece of state that lives outside the React tree, in its own
object, with the components reading it through a subscription instead of through props.
React only re-renders a component when the store tells it that the value it selected
changed, which lets many components share one source of truth without a provider
wrapping the whole app.

## Where it shows up

- [[zustand-module-core-store]]

## My insights
