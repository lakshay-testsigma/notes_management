---
title: "Two racing fetches make a search list stale"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs]
---
# Two racing fetches make a search list stale

**Sequence** · teaches Breakpoint debugging, Async call stacks

**Why this visual.** Show the order of events in the search race and where a conditional breakpoint pauses.

```mermaid
sequenceDiagram
  participant Box as Search box
  participant On as onInput
  participant Srv as Server
  participant R as render
  Box->>On: input event, query = re
  On->>Srv: fetch /search?q=re (slow)
  Box->>On: input event, query = react
  On->>Srv: fetch /search?q=react (fast)
  Srv-->>On: react items arrive first
  On->>R: render(react): Results for react
  Srv-->>On: re items arrive last
  Note over On: Conditional breakpoint on line 5, query !== input.value, pauses here
  Note over On: Call Stack with async frames: onInput line 5, await getJSON, onInput line 4
  On->>R: render(re): Results for re (stale)
```

## What it shows

Each input event starts its own fetch. The fast react response renders first, then the slow re response renders last and overwrites the list. A conditional breakpoint with query !== input.value pauses only on the stale response, and async frames link it back to the call that started the fetch.

Text alternative: Sequence diagram: the search box sends two input events, re and then react. onInput starts a slow fetch for re and a fast fetch for react. The react items arrive first and render Results for react. The re items arrive last; a conditional breakpoint on line 5 pauses there, the Call Stack with async frames shows onInput line 5, await getJSON and onInput line 4, and render writes the stale Results for re.

## Check yourself

Why does the conditional breakpoint pause on the re response but not on the react response?

Answer: For the re response, query is re but the box says react, so query !== input.value is true. For react they match.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/experiences/breakpoints-async-debugging/experience.json`

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
