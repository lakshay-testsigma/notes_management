---
title: "Detached DOM node"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Detached DOM node

A detached DOM node was removed from the page tree, but some JavaScript still points to it. The browser cannot free it while that reference exists, so it counts as a memory leak.

## Where it shows up

- [[chrome-devtools-memory-docs-browser-devtools-mastery]]

## My insights
