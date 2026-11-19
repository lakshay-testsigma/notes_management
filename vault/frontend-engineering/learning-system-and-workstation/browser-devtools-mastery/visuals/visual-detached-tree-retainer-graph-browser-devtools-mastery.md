---
title: "Retainer paths that keep a detached #tree alive"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-memory-docs]
---
# Retainer paths that keep a detached #tree alive

**Dependency graph** · teaches Heap snapshot retainers, Detached DOM nodes, Memory panel

**Why this visual.** See that an object is freed only when no path of references connects it to a GC root.

Interactive `Graph3D`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/08-memory-leaks-and-heap-snapshots/`. Run `npm run site:dev` first.

## What it shows

Window is a GC root. After body.removeChild(treeRef), #tree is detached but still reachable through treeRef and through leafRef and #leaf. Only when the learner cuts all three paths do #tree and #leaf become collectable. The Retainers section of a heap snapshot lists these paths.

Text alternative: An editable graph links Window to body, treeRef and leafRef; body, treeRef and #leaf link to #tree. Cutting body and treeRef from #tree still leaves the path through leafRef, so the subtree is freed only after leafRef is cut too.

## Check yourself

body.removeChild(treeRef) and treeRef = null have run. Why is #tree still in memory?

Answer: leafRef points to #leaf, and #leaf keeps a parent reference to #tree, so a path from Window still exists.

## Sources

- Fix memory problems — https://developer.chrome.com/docs/devtools/memory-problems (`chrome-devtools-memory-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/08-memory-leaks-and-heap-snapshots/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/08-memory-leaks-and-heap-snapshots.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
