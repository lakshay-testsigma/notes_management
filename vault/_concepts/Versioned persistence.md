---
title: "Versioned persistence"
topic: shared
stage: concept
tags: [concept]
created: 2026-11-18
---

# Versioned persistence

<!-- tutor:placeholder -->
Versioned persistence means saving a version number next to the data you store, so that
the next version of the app can tell whether the saved data still matches the code that
reads it. When the numbers differ, a migration function turns the old shape into the
new one instead of letting the app crash on unexpected data.

## Where it shows up

- [[zustand-module-persist-and-devtools]]
- [[zustand-pattern-versioned-persistence]]

## My insights
