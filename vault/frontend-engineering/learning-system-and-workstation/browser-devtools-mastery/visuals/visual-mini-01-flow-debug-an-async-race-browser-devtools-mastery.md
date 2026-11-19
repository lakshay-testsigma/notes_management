---
title: "A late response returns to onInput"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# A late response returns to onInput

**Data flow** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** Show where a stale search response re-enters onInput and where the id check stops it.

```mermaid
flowchart LR
  input["main.js: input event"] --> onInput["searchBox.js: onInput"]
  onInput -->|"fetch /api/search"| server["server.js"]
  server --> fake["fakeApi.js: search with random delay"]
  fake -->|"late response"| onInput
  onInput -->|"id === latestId"| render["main.js: render"]
```

## What it shows

Each key press calls onInput. The request goes to the server, which waits a random time. The response returns to onInput, which renders it only when its id matches latestId.

Text alternative: Flow from input event to onInput, server, fake API with random delay, back to onInput, then render if the id is the latest.

## Check yourself

At which step can an old response overwrite a new one, and which check prevents it?

Answer: When the late response returns to onInput; the id === latestId check stops it.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/mini-01-debug-an-async-race/README.md`

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
