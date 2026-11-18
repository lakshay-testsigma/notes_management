---
title: "Workstation & editor — lesson"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: lesson
tags: [frontend-engineering, learning-system-and-workstation]
created: 2026-11-18
---

# Workstation & editor — interactive lesson

## Open the lesson

The lesson pages live on the local site at
`/frontend-engineering/learning-system-and-workstation/workstation-and-editor/`. Start the site with
`npm run site:dev`, then open that path. Read the pages in order; each one
takes about five minutes. Read the [[01-brief-workstation-and-editor|brief]] first.

## Pages

1. `01-terminal-and-shell` — Terminal and shell: pipes, PATH and environment. Text flows from one program to the next; the shell finds programs through PATH. Visual: [[visual-shell-pipeline-lab-workstation-and-editor|shell pipeline lab]]. Serves outcome 1.
2. `02-git-commit-graph` — Git's commit graph: branches, merge and rebase. A branch is a pointer; merge joins two lines, rebase copies commits onto a new base. Visual: [[visual-git-graph-lab-workstation-and-editor|merge or rebase lab]]. Serves outcome 2.
3. `03-bisect-reflog-and-recovery` — Find and recover: bisect, reflog, stash and cherry-pick. Bisect halves the suspect commits at every test; reflog finds lost work. Visual: [[visual-bisect-lab-workstation-and-editor|bisect lab]]. Serves outcome 3.
4. `04-pull-requests-and-conventional-commits` — Pull requests, conventional commits and .gitignore. One change goes from branch to review to merge. Visual: [[visual-github-flow-workstation-and-editor|GitHub flow]]. Serves outcome 4.
5. `05-editor-setup-and-debugging` — Editor setup: workspace settings, tasks and the debugger. Workspace settings win over user settings; tasks, snippets and the Command Palette save typing; a breakpoint pauses the code. Visuals: [[visual-settings-precedence-workstation-and-editor|settings precedence]], [[visual-debug-session-path-workstation-and-editor|debug session]]. Serves outcome 5.
6. `06-ai-assisted-development` — AI-assisted development you can trust. Give context, read the diff, run the tests, then merge. Visual: [[visual-ai-review-loop-workstation-and-editor|AI review loop]]. Serves outcome 6.
7. `07-node-versions-and-modules` — Node.js versions, npx and ESM versus CommonJS. Pin a Node.js version per project; Node.js picks a loader for each file. Visual: [[visual-nodejs-packages-docs-mechanism-workstation-and-editor|which loader Node.js uses]]. Serves outcome 7.

More notes, in prerequisite order: [[ssh-keys-for-git-workstation-and-editor|SSH keys for Git hosting]], [[signed-commits-workstation-and-editor|Signed commits]], [[corepack-package-manager-pinning-workstation-and-editor|Pinning the package manager with Corepack]].

All visuals: [[visuals-workstation-and-editor|all visuals]].

## What you can do after it

1. Combine shell commands with pipes, set environment variables and fix a PATH problem. Page 1.
2. Explain Git's commit graph and choose merge or rebase for a given branch. Page 2.
3. Find a bug-introducing commit with git bisect and recover lost work with reflog. Page 3 and mini project 1.
4. Open a pull request with conventional commit messages and a clean history. Page 4 and mini project 2.
5. Configure an editor workspace and debug JavaScript with breakpoints in the editor. Page 5.
6. Use an AI coding agent with context, review its diff and test it before merging. Page 6.
7. Pin a Node.js version per project and explain ESM versus CommonJS loading. Page 7.

Continue with the [[03-mini-projects-workstation-and-editor|mini projects]].

## My insights
