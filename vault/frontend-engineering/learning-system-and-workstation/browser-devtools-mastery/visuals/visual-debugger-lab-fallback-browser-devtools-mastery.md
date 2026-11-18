---
title: "Pausing on the stale search response"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chrome-devtools-docs, ecma-426-source-map]
---
# Pausing on the stale search response

**Sequence** · teaches Breakpoint types, Async call stack, Ignore-listed frames in the call stack

**Why this visual.** Show the search race and the conditional breakpoint pause as one static diagram for readers without JavaScript.

```mermaid
sequenceDiagram
  participant Box as Search box
  participant App as onInput (app.js)
  participant Srv as Server
  Box->>App: input "re"
  App->>Srv: fetch re (await on line 5)
  Box->>App: input "react"
  App->>Srv: fetch react (await on line 5)
  Srv-->>App: react results
  Note over App: line 6, condition q !== input.value is false: no pause
  Srv-->>App: re results (late)
  Note over App: line 6, condition is true: pause. Scope q = "re", input.value = "react"
  Note over App: Call Stack: onInput app.js:6, await, onInput app.js:5 (vendor frames hidden by the ignore list)
```

## What it shows

The search box calls onInput for re and then for react. Both calls await a fetch on line 5. The react response arrives first, and the re response arrives late, so render on line 6 shows stale results. A conditional breakpoint on line 6 with q !== input.value pauses only on the late response. At that pause the Call Stack shows the await separator and the onInput call that started the wait; the ignore list hides library frames (Chrome DevTools docs, breakpoints and JavaScript debugging reference; ECMA-426 ignoreList).

Text alternative: Sequence diagram: the search box sends re then react to onInput, which fetches both from the server. The react results return first and the re results return late. On line 6 the condition q !== input.value is false for react and true for re, which pauses with q re and input.value react; the Call Stack shows onInput line 6, await, onInput line 5.

## Check yourself

Why does the conditional breakpoint pause only once?

Answer: Only the late re response has a q that differs from the current input value react.

## Sources

- Chrome DevTools documentation: Elements/CSS, Console, JavaScript debugging, Overrides — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)
- ECMA-426: Source map format specification — https://tc39.es/ecma426/ (`ecma-426-source-map`)

## Used in

- `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/debugger-lab/experience.json`

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
