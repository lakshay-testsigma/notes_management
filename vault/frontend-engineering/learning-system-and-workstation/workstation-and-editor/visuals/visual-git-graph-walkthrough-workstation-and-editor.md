---
title: "Merge and rebase on the same fork"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chacon-2014-pro-git]
---
# Merge and rebase on the same fork

**Video** · teaches Commit graph and branches, Merge versus rebase, Git and GitHub fluency

**Why this visual.** See how merge and rebase join the same two diverged branches and why the two histories differ.

Video (49 s): `site/public/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/git-graph-walkthrough.mp4`, captions `site/public/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/git-graph-walkthrough.vtt`. On the site: `/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/git-graph-walkthrough.mp4`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/git-graph-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/workstation-and-editor build git-graph-walkthrough`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/git-graph-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/git-graph-walkthrough/composition/index.html`.

## Transcript

Commits C1 and C2 sit on main. The branch feature adds C3 and main adds C4, both with the parent C2. On main, git merge feature records a merge commit C5 with the two parents C4 and C3. On feature, git rebase main replays C3 on top of C4 as a new commit C3', so history is a straight line. Both give the same final files, so rebase only commits that exist only in your repository.

**00:00 Commits, branches and HEAD.** Each commit stores a snapshot and a link to its parent. A branch is a movable pointer, and HEAD names your current branch.

**00:10 One history forks into two.** Now the history forks into two lines. Feature adds C3, main adds C4, and both commits have the parent C2.

**00:19 git merge feature, on main.** On main, git merge feature combines C4, C3 and their common ancestor C2. Git records C5, a merge commit with two parents.

**00:29 git rebase main, on feature.** On feature, git rebase main replays the change of C3 on top of C4 as a new commit, C3'. History becomes a straight line.

**00:39 Same files, different history.** Both commands give the same final files, but rebase rewrites commits. Never rebase commits that exist outside your repository.

Sources:

- Pro Git — https://git-scm.com/book/en/v2

## What it shows

A branch is a movable pointer to a commit. Merge adds a commit with two parents and rewrites nothing; rebase copies your commits as new commits on top of the other branch (Pro Git 3.1, 3.2, 3.6).

Text alternative: Commits C1 and C2 sit on main. The branch feature adds C3 and main adds C4, both with the parent C2. On main, git merge feature records a merge commit C5 with the two parents C4 and C3. On feature, git rebase main replays C3 on top of C4 as a new commit C3', so history is a straight line. Both give the same final files, so rebase only commits that exist only in your repository.

## Check yourself

After git rebase main on feature, is C3 still the tip of feature?

Answer: No. Rebase creates a new commit C3' with the parent C4, and feature now points to C3'. The old C3 is no longer on the branch.

## Sources

- Pro Git — https://git-scm.com/book/en/v2 (`chacon-2014-pro-git`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/02-git-commit-graph/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/workstation-and-editor/02-git-commit-graph.mdx`)

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
