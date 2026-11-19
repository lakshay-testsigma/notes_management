---
title: "One Lighthouse run, from URL to score"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---
# One Lighthouse run, from URL to score

**Sequence** · teaches Lighthouse audits

**Why this visual.** Follow one page load from the first CDP connection to a category score.

```mermaid
sequenceDiagram
  participant NR as navigation-runner
  participant D as Driver
  participant G as Gatherers
  participant R as Runner
  participant M as Metric audit
  NR->>D: connect (driver.js:79-91)
  NR->>D: prepare, then five phases (navigation-runner.js:206-222)
  D->>G: raw CDP events (devtools-log.js:27)
  NR->>G: getArtifact (navigation-runner.js:175-177)
  G-->>R: artifacts, errors kept as values
  R->>M: only declared artifacts (runner.js:430-442)
  M-->>R: log-normal score (audit.js:107-109)
  R-->>R: weighted category mean (scoring.js:22-42)
```

## What it shows

The navigation runner connects a driver, prepares the page, and runs five instrumentation phases around the load. Gatherers record raw events and return artifacts. The runner hands each audit only the artifacts it declared, and the scoring code takes a weighted mean.

Text alternative: Sequence diagram: navigation-runner connects and prepares the driver, gatherers record raw events, getArtifact returns artifacts to the runner, the runner passes declared artifacts to a metric audit, which returns a score, and the runner computes the weighted category mean.

## Check yourself

Why can the audit phase run later without a browser?

Answer: Because gatherers saved raw events as artifacts, and audits read only those artifacts.

## Sources

- GoogleChrome/lighthouse — https://github.com/GoogleChrome/lighthouse (`googlechrome-lighthouse-repo`)

## Used in

- [[lighthouse-architecture]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
