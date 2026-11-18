---
title: "One axe.run call from start to report"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---
# One axe.run call from start to report

**Sequence** · teaches What automated accessibility rules can and cannot catch, Accessibility extensions

**Why this visual.** Show how one scan moves through the engine and where a check can answer 'cannot tell'.

```mermaid
sequenceDiagram
  participant U as Caller
  participant R as run.js
  participant RR as runRules
  participant F as collectResultsFromFrames
  participant RU as Rule
  participant C as Check
  U->>R: axe.run(context, options)
  R->>RR: set running, build context and tree
  RR->>F: queue frame job
  RR->>RU: queue audit.run on this page
  RU->>C: any, all, none checks per node
  C-->>RU: true, false or undefined
  F-->>RR: frame results
  RR-->>R: merge, after, finalize
  R-->>U: reporter result, teardown
```

## What it shows

The caller starts a scan. The engine sets a running flag, builds the page context, and queues two jobs: scan child frames and run the rules here. Each rule runs checks per element. A check returns true, false or undefined. The engine merges results, runs the after step, builds the report, and resets the flag.

Text alternative: Sequence diagram: the caller calls axe.run, run.js sets the running flag and calls runRules, which queues a frame job and a rule job. Rules run any, all and none checks that return true, false or undefined. Results are merged, finalized, reported to the caller and the engine is reset.

## Check yourself

What are the three possible answers of a check, and which one means a person must look?

Answer: True, false and undefined. Undefined is reported as incomplete and needs human review.

## Sources

- dequelabs/axe-core — https://github.com/dequelabs/axe-core (`dequelabs-axe-core-repo`)

## Used in

- [[axe-core-architecture]]

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
