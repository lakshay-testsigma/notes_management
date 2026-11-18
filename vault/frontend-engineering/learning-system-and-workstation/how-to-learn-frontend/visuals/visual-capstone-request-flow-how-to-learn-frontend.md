---
title: "Learning tracker: one checked step, end to end"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [mdn-learn-web-development, pmndrs-zustand-repo]
---
# Learning tracker: one checked step, end to end

**Request flow** · teaches Learning loop

**Why this visual.** Follow one step of the learning loop from the click to the saved log.

```mermaid
sequenceDiagram
  participant D as Developer
  participant N as NoteCard
  participant H as useTracker
  participant C as TrackerController
  participant U as CompleteStepUseCase
  participant S as TrackerStore
  participant R as LocalStorageTrackerRepository
  participant A as BrowserStorageAdapter
  D->>N: checks "build"
  N->>H: markStep(noteId, "build")
  H->>C: markStep(noteId, "build")
  C->>U: execute(noteId, "build")
  U->>S: getState()
  U->>S: applyPatch(patch)
  S->>S: applyPatch(state, patch)
  S->>R: save(nextState)
  R->>A: setItem(key, json)
  A-->>R: stored
  S-->>H: new state
  H-->>N: progress and gaps are recomputed
  Note over U,S: An unknown note id throws NoteNotFoundError. The hook shows the message instead of the dashboard.
```

## What it shows

Checking the build step of one note travels from the component to the hook, the controller, and the use case. The use case returns a patch, the store merges it over the state and saves the log in the browser. The state comes back to the hook, and the dashboard shows the new progress and the new gaps.

Text alternative: The developer checks a box. The card tells the hook, the hook tells the controller, the controller calls the use case, the use case hands a patch to the store, the store saves the log in the browser storage, and the new state travels back to the dashboard.

## Check yourself

Which part of the flow decides that a step is done?

Answer: The use case. It builds the patch with the step marked as done and hands it to the store.

## Sources

- Learn web development — https://developer.mozilla.org/en-US/docs/Learn_web_development (`mdn-learn-web-development`)
- pmndrs/zustand: Bear necessities for state management in React — https://github.com/pmndrs/zustand (`pmndrs-zustand-repo`)

## Used in

- `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/capstone/ARCHITECTURE.md`
- [[06-capstone-how-to-learn-frontend]]

Back to [[visuals-how-to-learn-frontend|all visuals]].

## My insights
