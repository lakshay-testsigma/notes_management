---
title: "Merge or rebase the same two branches"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [chacon-2014-pro-git]
---
# Merge or rebase the same two branches

**Interactive experiences** · teaches Commit graph and branches, Merge versus rebase, Resolving merge conflicts, Git and GitHub fluency

**Why this visual.** Predict where each branch and HEAD point after merge or rebase, and say which command rewrites commits.

**Interactive video lesson (Mode B)** · level intermediate · modes Watch, Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/02-git-commit-graph/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-git-graph-walkthrough-workstation-and-editor|git-graph-walkthrough]]
- Guided walkthrough (HyperFrames composition): [[visual-git-graph-walkthrough-workstation-and-editor|git-graph-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-git-graph-lab-fallback-workstation-and-editor|git-graph-lab-fallback]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/experiences/git-graph-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/workstation-and-editor build git-graph-lab`).

## Checkpoints

- **predict.** HEAD is on feature and you run git commit. What moves? Answer: feature moves to the new commit; HEAD still names feature. HEAD points to the branch you are on, and a new commit moves only that branch pointer forward. Other branches keep pointing at their own commits.
- **predict.** HEAD is on main at C4. You run git merge feature, and feature points to C3. Where does main point afterwards? Answer: To a new merge commit C5 with parents C4 and C3. The histories diverged at C2, so Git does a three-way merge of C4, C3 and C2 and records merge commit C5 with two parents. The current branch, main, moves to C5.
- **predict.** HEAD is on feature at C3. You run git rebase main. What does feature point to afterwards? Answer: A new commit C3' whose parent is C4. Rebase saves the change C3 made, resets feature to C4 and applies the change as a new commit C3'. A commit's parent is part of the commit, so a new parent means a new commit.
- **experiment.** Load the conflict start, where C3 and C4 changed the same line. Step until Git records the merge commit. When both sides edit the same part of a file, Git pauses the merge and writes conflict markers. The merge ends only after you edit the file, run git add, then git commit.
- **verify.** You pushed feature, and a teammate built work on it. Which history change is safe now? Answer: Merge main into it, because merge rewrites no commits. Rebase replaces commits with new ones. Teammates who hold the old commits get duplicates at their next pull. Pro Git: do not rebase commits that exist outside your repository.

Needs first: Git and GitHub fluency, Commit graph and branches, Merge versus rebase.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict where each branch and HEAD point after merge or rebase, and say which command rewrites commits.

Text alternative: A walkthrough and a stepper start from the same fork: C3 on feature and C4 on main, both children of C2. Merge records commit C5 with two parents and rewrites nothing. Rebase replays C3 as a new commit C3' on top of C4, so history is a straight line. A third start shows a merge that stops on a conflict until you edit, add and commit.

## Check yourself

HEAD is on feature and you run git commit. What moves?

Answer: feature moves to the new commit; HEAD still names feature. HEAD points to the branch you are on, and a new commit moves only that branch pointer forward. Other branches keep pointing at their own commits.

## Sources

- Pro Git — https://git-scm.com/book/en/v2 (`chacon-2014-pro-git`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/02-git-commit-graph/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/workstation-and-editor/02-git-commit-graph.mdx`)

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
