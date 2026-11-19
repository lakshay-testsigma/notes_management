---
title: Workstation & editor — recall cards
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-19
---

# Workstation & editor — recall cards

## Cards

<!-- card: wae-01 -->
Why does a versioned dotfiles repository turn a new machine from hours into minutes?
?
The install script reads the repo and links each config file into place, so the shell, git, and editor setup is reproduced without rebuilding it by hand.

<!-- card: wae-02 -->
You type `node` and a different version runs than the one in the project's `.nvmrc`. Why?
?
PATH is searched in order and the first matching `node` wins. The version manager did not prepend the pinned version's bin directory to PATH in this shell.

<!-- card: wae-03 -->
How does an idempotent install script avoid clobbering an existing real file?
?
It first checks whether the target is already a symlink to the source; if not, it moves a real file aside to a backup before creating the symlink.

<!-- card: wae-04 -->
Your feature branch has twenty messy commits and the team wants linear history before merge. Merge or rebase, and why?
?
Rebase, but only on your own unpushed branch: it replays the commits onto the new base. For a pushed or shared branch, merge instead to avoid rewriting shared history.

<!-- card: wae-05 -->
An AI agent proposes a diff that passes the tests. What must you still do before merging?
?
Review the diff line by line and confirm every change is explained. Treat generated code as untrusted input, especially anything touching auth, secrets, or the shell.

<!-- card: wae-06 -->
A bug appeared somewhere in the last thirty commits. Which command finds the exact commit, and why is it fast?
?
`git bisect`: it binary-searches the range, checking out the midpoint each time, so thirty commits need about five checks instead of thirty.

<!-- card: wae-07 -->
In the reproducible-workstation diagram, which arrow is the one that makes the setup portable to a new machine?
?
The install-script arrow, because it links the repo's config files into the new machine's home directory. See [[visual-how-it-works-workstation-and-editor]].

<!-- card: wae-08 -->
In the AI review loop, which gate sits between "the agent proposes an edit" and "the change is merged"?
?
The sandbox, approval, and tests gate: the change reaches the repo only after it passes all three. See [[visual-ai-review-loop-workstation-and-editor]].

<!-- card: wae-09 -->
In the team-setup workflow, what does the LTS policy feed into?
?
The `.nvmrc` file, so every machine pins the same Node version. See [[visual-team-setup-workflow-workstation-and-editor]].

<!-- card: wae-10 -->
You run `nvm use 22` in a terminal and `node -v` still shows the old version. What is the likely cause?
?
The shell does not source the version manager's hook, or PATH was not rewritten, so `node` still resolves to the old version's bin directory.

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| wae-01 | explain why a disciplined, reproducible workstation pays off | [[visual-how-it-works-workstation-and-editor]], then lesson page `01-why-your-workstation-matters` |
| wae-02 | explain what PATH and environment variables do | lesson page `06-node-js-and-version-management`, listed in [[02-lesson-workstation-and-editor]] |
| wae-03 | build a dotfiles repository that reproduces your setup | mini project 1, listed in [[03-mini-projects-workstation-and-editor]] |
| wae-04 | decide between merge and rebase | [[visual-pro-git-book-mechanism-workstation-and-editor]], then lesson page `03-git-and-github-fluency` |
| wae-05 | decide how to use an AI coding agent safely | [[visual-ai-review-loop-workstation-and-editor]], then lesson page `05-ai-assisted-development` |
| wae-06 | build a git bisect run | mini project 2, listed in [[03-mini-projects-workstation-and-editor]] |
| wae-07 | extra: read the reproducible-setup diagram | [[visual-how-it-works-workstation-and-editor]] |
| wae-08 | extra: read the AI review loop | [[visual-ai-review-loop-workstation-and-editor]] |
| wae-09 | extra: read the team setup workflow | [[visual-team-setup-workflow-workstation-and-editor]] |
| wae-10 | explain what PATH does when a command runs | [[07-final-notes-workstation-and-editor]], section "Trade-offs and failure modes" |

## My insights
