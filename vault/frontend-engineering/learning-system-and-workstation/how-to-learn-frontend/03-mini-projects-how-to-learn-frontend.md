---
title: "How to learn frontend (and keep improving) — mini projects"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: mini-projects
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-17
---

# How to learn frontend (and keep improving) — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you
what to write, the second tells you only what must work. Start in the `starter/`
folder, run `npm install` and `npm test`, and make the tests pass. Open `solution/` only after your
tests pass or after you have used the hints. Read the
[[02-lesson-how-to-learn-frontend|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | Baseline checker | A team lead pastes feature paths and learns which ones the team can ship without fallbacks | 2 h | guided | `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/mini-01-baseline-checker/README.md` |
| 2 | Share button with fallback | A blog's Share button uses the Web Share API where it exists and copies the link everywhere else | 2 h | less guided | `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/mini-02-share-button-fallback/README.md` |

## What each project proves

- **Project 1** proves that a Baseline-style label is a rule you can compute from MDN browser-compat-data release dates and the 30-month window. It is an approximation, because the data package has no Baseline field. How it runs: [[visual-mini-01-flow-baseline-checker-how-to-learn-frontend]].
  Related: [[Baseline status]], [[Core browsers]].
- **Project 2** proves feature detection: test `"share" in navigator`, then run the enhanced path or fall back to the clipboard, then to a selectable link, never by sniffing the browser. How it runs: [[visual-mini-02-flow-share-button-fallback-how-to-learn-frontend]].
  Related: [[Feature detection]], [[Polyfill]].

## My insights
