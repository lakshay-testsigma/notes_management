---
title: "Perf-triage layers and their dependencies"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo, chromedevtools-devtools-frontend-repo]
---
# Perf-triage layers and their dependencies

**Architecture** · teaches HAR export, Waterfall timing phases, Lighthouse audits

**Why this visual.** See which layer may depend on which.

```mermaid
flowchart TD
  main["main.ts: wires objects"] --> iface
  iface["interface: Cli, MarkdownRenderer"] --> app
  app["application: TriageUseCase, Artifacts, gatherers, audits, Ranker"] --> dom
  infra["infrastructure: NodeFileSource, JsonLogger, Config"] --> dom
  dom["domain: Budgets, model, errors, ports"]
  main --> infra
```

## What it shows

The interface calls the application layer. Both depend on the domain. Infrastructure implements the domain ports. main.ts wires everything. The domain imports nothing from the other layers.

Text alternative: Five boxes: main wires interface and infrastructure; interface depends on application; application and infrastructure both depend on the domain, which holds budgets, model, errors and ports.

## Check yourself

Which layer does NodeFileSource depend on?

Answer: The domain, because it implements the FileSource port.

## Sources

- GoogleChrome/lighthouse — https://github.com/GoogleChrome/lighthouse (`googlechrome-lighthouse-repo`)
- ChromeDevTools/devtools-frontend — https://github.com/ChromeDevTools/devtools-frontend (`chromedevtools-devtools-frontend-repo`)

## Used in

- `projects/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/capstone/ARCHITECTURE.md`
- [[06-capstone-browser-devtools-mastery]]

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
