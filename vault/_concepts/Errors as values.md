---
title: "Errors as values"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-19
---

# Errors as values

Errors as values means a function returns a failure as ordinary data (for example an object with an error field) and does not throw. The caller checks one field, so a failure cannot skip past unhandled code.

## Where it shows up

- [[devtools-frontend-pattern-failures-as-values]]

## My insights
