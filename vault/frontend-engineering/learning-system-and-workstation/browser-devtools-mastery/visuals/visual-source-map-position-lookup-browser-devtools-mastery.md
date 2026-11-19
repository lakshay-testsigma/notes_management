---
title: "Trace one minified position back to the original line"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [ecma-426-source-map, chrome-devtools-docs]
---
# Trace one minified position back to the original line

**Workflow** · teaches Source maps

**Why this visual.** Follow how DevTools turns a position in minified code into a file, line and column in the code you wrote.

```mermaid
flowchart LR
  A["app.min.js line 1, col 3"] -->|"last comment"| B["sourceMappingURL"]
  B -->|"fetch"| C["app.min.js.map"]
  C -->|"split on ; and ,"| D["segment AACS"]
  D -->|"decode VLQ, add"| E["search.ts line 1, col 18"]
```

## What it shows

The minified file ends with a sourceMappingURL comment, so DevTools fetches the map. It splits the mappings string into lines and segments, decodes each base64 VLQ segment and adds it to the previous values. File names are examples; positions count from 0, as in the worked example of the ECMA-426 digest.

Text alternative: Five boxes left to right: a position in app.min.js, its sourceMappingURL comment, the fetched app.min.js.map, the decoded segment AACS, and the original position in search.ts. Each lookup goes through the map, so a missing or stale map gives no position or a wrong one.

## Check yourself

The server stops sending app.min.js.map. Which box in the chain breaks, and what does the Sources panel show?

Answer: The fetch of the map fails, so DevTools cannot decode any segment. The Sources panel shows only the minified app.min.js.

## Sources

- ECMA-426: Source map format specification — https://tc39.es/ecma426/ (`ecma-426-source-map`)
- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/05-source-maps-overrides-and-workspaces/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/05-source-maps-overrides-and-workspaces.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
