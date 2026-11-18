---
title: "Workstation & editor — mini projects"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: mini-projects
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Workstation & editor — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you
what to write, the second tells you only what must work. Start in the `starter/`
folder and run `npm test`. The projects need only Node.js and Git, with no packages to install.
Make the tests pass. Open `solution/` only after your tests pass or after you have used the hints.
Read the [[02-lesson-workstation-and-editor|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | Bisect the regression | A price formatter broke somewhere in the last 30 commits; a developer scripts `git bisect run` with a test to find the commit that introduced the bug | 2 h | guided | `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-01-bisect-the-regression/README.md` |
| 2 | Commit message linter | A team checks every commit message against Conventional Commits in a commit-msg hook and in CI, so changelogs can be generated from history | 2 h | less guided | `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-02-commit-message-linter/README.md` |

## What each project proves

- **Project 1** (`projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-01-bisect-the-regression/`) proves that a test script with the right exit code lets `git bisect run` find the first bad commit by itself, in about five steps for 30 commits. How it runs: [[visual-mini-01-flow-workstation-and-editor]].
  Related: [[Git bisect]], [[Exit codes]].
- **Project 2** (`projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-02-commit-message-linter/`) proves that a commit-msg hook can reject a message that breaks the Conventional Commits format: exit 0 accepts, 1 rejects, 2 reports a tool error. Running the same check in CI is a stretch goal here; the capstone builds it. How it runs: [[visual-mini-02-flow-workstation-and-editor]].
  Related: [[Conventional Commits]], [[Git hooks]], [[Exit codes]].

## My insights
