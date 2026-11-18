---
title: "Workstation & editor — start here"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: map
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Workstation & editor — start here

This is the map of the topic. Read the steps from top to bottom. Each step links to the next thing to open, so you never have to search.

<!-- tutor:generated:start -->
**Depth:** standard · **Progress:** 9 of 10 steps ready

Set up a professional frontend workstation: a fluent shell, Git and GitHub, a configured editor with an in-editor debugger, safe AI-assisted coding, and per-project Node.js versions.

## Read in this order

1. [[01-brief-workstation-and-editor|Brief]] — what it is, why it exists, where it is used · *ready*
2. [[02-lesson-workstation-and-editor|Interactive lesson]] — the animated lesson pages on the local site · *ready*
3. [[03-mini-projects-workstation-and-editor|Mini projects]] — small builds with a real use case · *ready*
4. [[00-digests-workstation-and-editor|Digests]] — short summaries of the key papers and docs · *ready*
5. [[00-repo-intel-workstation-and-editor|Repository deep dive]] — how a production open-source project does it · *ready*
6. [[06-capstone-workstation-and-editor|Capstone]] — the production-style project · *ready*
7. [[07-final-notes-workstation-and-editor|Final notes]] — the one-page refresher · *ready*
8. [[08-recall-workstation-and-editor|Recall cards]] — flashcards for spaced review · *ready*
9. [[09-resources-workstation-and-editor|Resources]] — the vetted sources behind everything above · *ready*

Your own additions live in [[my-insights-workstation-and-editor|My insights]].

Every diagram, simulation and video, with its concepts and sources: [[visuals-workstation-and-editor|Visuals]].

## Open the lesson

Run `npm run site:dev` in the repository root, then open `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/` on the local address it prints.

## Before you start

- **Git and GitHub** (you already know this) — Met in How to learn frontend: Git tracks changes; GitHub hosts repositories, issues and pull requests.
- **Operating system process** (new for you) — A process is a running program with its own input, output, environment variables and exit code.
- **npm** (new for you) — npm installs JavaScript packages listed in package.json and runs its scripts.

## What you will be able to do

- Combine shell commands with pipes, set environment variables and fix a PATH problem.
- Explain Git's commit graph and choose merge or rebase for a given branch.
- Find a bug-introducing commit with git bisect and recover lost work with reflog.
- Open a pull request with conventional commit messages and a clean history.
- Configure an editor workspace and debug JavaScript with breakpoints in the editor.
- Use an AI coding agent with context, review its diff and test it before merging.
- Pin a Node.js version per project and explain ESM versus CommonJS loading.

## Lesson pages

1. Terminal and shell: pipes, PATH and environment — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/01-terminal-and-shell/`
2. Git's commit graph: branches, merge and rebase — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/02-git-commit-graph/`
3. Find and recover: bisect, reflog, stash and cherry-pick — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/03-bisect-reflog-and-recovery/`
4. Pull requests, conventional commits and .gitignore — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/04-pull-requests-and-conventional-commits/`
5. Editor setup: workspace settings, tasks and the debugger — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/05-editor-setup-and-debugging/`
6. AI-assisted development you can trust — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/06-ai-assisted-development/`
7. Node.js versions, npx and ESM versus CommonJS — `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/07-node-versions-and-modules/`

## Research scope and concept notes

A frontend developer's workstation: shell fluency, Git and GitHub workflow, editor setup and debugging, responsible AI-assisted coding, and Node.js runtime and version management.
- Terminal and shell basics: included
- Pipes and redirection: included
- PATH and environment variables: included
- SSH keys for Git hosting: included — [[ssh-keys-for-git-workstation-and-editor|SSH keys for Git hosting]]
- Git and GitHub fluency: included
- Commit graph and branches: included
- Merge versus rebase: included
- Resolving merge conflicts: included
- Finding a bad commit with git bisect: included
- Recovering work with the reflog: included
- Stash and cherry-pick: included
- Interactive staging and .gitignore: included
- Pull request workflow (GitHub flow): included
- Conventional Commits: included
- Editor setup: VS Code, JetBrains or Zed: included
- Settings layers and workspace settings: included
- Debugging JavaScript in the editor: included
- AI-assisted development: included
- Reviewing AI-generated diffs: included
- Tests before generation: included
- Treating generated code as untrusted: included
- Node.js runtime and version management: included
- ESM versus CommonJS loading: included
- Node.js LTS and release lines: included
- Per-project Node.js versions and engines: included
- Pinning the package manager with Corepack: included — [[corepack-package-manager-pinning-workstation-and-editor|Pinning the package manager with Corepack]]
- Shell startup files and aliases: included
- Safe undo (reset, revert) and git config: included
- Browser DevTools debugging with source maps: deferred — Coverage audit round 1 (2026-11-18): no verified source in this topic covers browser DevTools or source maps; the 12-source ceiling is reached and browser debugging belongs to a later roadmap debugging/performance section.
- Rewriting local history: amend, interactive rebase, squash: included
- Keeping secrets out of Git: included
- Revision selection: HEAD~n and A..B ranges: included
- Signed commits: included — [[signed-commits-workstation-and-editor|Signed commits]]

Research stopped: scope-boundary. Leaves taught on pages 01-04 and one concept note; no further children inside this workstation topic.

## Projects

- Mini project: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-01-bisect-the-regression/`
- Mini project: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/mini-02-commit-message-linter/`
- Capstone: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/capstone/` — devkit workstation CLI

## Build status

| Wave | Stage | Status |
|------|-------|--------|
| 0 | intake | ready |
| 1 | research | ready |
| 1 | brief | ready |
| 2 | digest | ready |
| 2 | repo-intel | ready |
| 3 | lesson | ready |
| 3 | mini-projects | ready |
| 4 | capstone | ready |
| 5 | notes | ready |
| 5 | finalize | needs another try |

Everything is generated. Review due cards with `node harness/bin/tutor.mjs recall due workstation-and-editor`.
<!-- tutor:generated:end -->

## My insights
