---
title: "git bisect narrows to the bug commit"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [pro-git-book]
---
# git bisect narrows to the bug commit

**Workflow** · teaches Git and GitHub

**Why this visual.** See how git bisect halves the commit range using one test until only the bug commit remains.

```mermaid
flowchart TD
  A["setup-demo-repo.sh: 8 commits"] --> B["bisect.sh"]
  B --> C["git bisect start; bad HEAD; good first"]
  C --> D["git bisect run node ../check.js"]
  D --> E{"check.js exits"}
  E -->|"0 good / 1 bad: pick next midpoint"| D
  E -->|"no midpoint left"| F["HEAD = commit 5, the bug"]
```

## What it shows

bisect.sh marks HEAD bad and the first commit good, then git bisect run invokes check.js at each midpoint. check.js exits 0 for good and 1 for bad, so git halves the range each step and stops at commit 5.

Text alternative: A flow from setup-demo-repo.sh to bisect.sh, which marks the range, then loops through git bisect run and check.js exit codes until HEAD ends on commit 5.

## Check yourself

What does check.js exit 1 tell git bisect?

Answer: That the current commit is bad, so git searches the older half of the remaining range.

## Sources

- Pro Git — https://git-scm.com/book/en/v2 (`pro-git-book`)

## Used in

- `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-02-git-bisect-hunt/README.md`

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
