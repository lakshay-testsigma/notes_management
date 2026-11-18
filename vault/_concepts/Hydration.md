---
title: "Hydration"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Hydration

Hydration is the step where the browser takes the HTML the server already sent and
attaches the React application to it, instead of throwing that HTML away and
rebuilding the page. React compares the markup it produced on the client with the
markup that came from the server, so the first client render has to produce the same
result, or the browser reports a hydration mismatch and re-renders the whole tree.

## Where it shows up

- [[zustand-module-core-store]]

## My insights
