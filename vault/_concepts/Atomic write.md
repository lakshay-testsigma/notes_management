---
title: "Atomic write"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-19
---

# Atomic write

Writing a file so readers only ever see the old or the new version, never a half-written one. You write to a temporary file and then rename it into place with one move.

## Where it shows up

- [[nvm-pattern-atomic-publish]]
- [[06-capstone-workstation-and-editor]]

## My insights
