---
title: "Lighthouse module map"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---
# Lighthouse module map

**Architecture** · teaches Lighthouse audits

**Why this visual.** See the four slices of Lighthouse and which one feeds which.

```mermaid
flowchart LR
  CDP["CDP session and navigation: drive Chrome"] -->|raw events| GA["Gatherers: save trace and log"]
  GA -->|artifacts| AU["Runner and audits: check and score"]
  GA -->|trace and log| ME["Metrics: LCP TBT CLS"]
  ME -->|metric values| AU
  AU --> LHR["Result object and report"]
```

## What it shows

Lighthouse drives Chrome first, then saves raw data as artifacts, then computes metrics from the trace, then audits score the artifacts. Audits never talk to Chrome. Each arrow in the picture is one hand-off of data.

Text alternative: Left to right flowchart: CDP session and navigation sends raw events to gatherers; gatherers send artifacts to runner and audits and a trace to metrics; metrics send values to audits; audits produce the result object.

## Check yourself

Which module talks to Chrome, and which modules never do?

Answer: Only the CDP session and navigation module talks to Chrome; gatherers read its events, and metrics and audits only read saved artifacts.

## Sources

- GoogleChrome/lighthouse — https://github.com/GoogleChrome/lighthouse (`googlechrome-lighthouse-repo`)

## Used in

- [[lighthouse-architecture]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
