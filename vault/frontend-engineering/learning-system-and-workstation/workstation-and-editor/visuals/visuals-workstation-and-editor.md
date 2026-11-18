---
title: "Visuals of Workstation & editor"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
---
# Visuals of Workstation & editor

Every diagram, simulation and video of this topic, with the concepts it teaches and the sources behind it. Open one, answer its check question, then read the explanation.

- [[concept-map-workstation-and-editor|Concept map]] — how the concepts of this topic depend on each other

## Workflow

- [[visual-how-it-works-workstation-and-editor|One change from branch to merge]] — Show where each workstation tool fits in one change: from a new branch to a merged pull request.
- [[visual-bisect-lab-fallback-workstation-and-editor|The git bisect loop]] — Show the git bisect loop as one static diagram for readers without JavaScript.
- [[visual-shell-pipeline-stages-workstation-and-editor|Text through the stages of a shell pipeline]] — See how each command in a pipeline reads the output of the command before it.
- [[visual-mini-01-flow-workstation-and-editor|Bisect run flow]] — Show how the script and git bisect run cooperate to find the first bad commit.
- [[visual-github-flow-workstation-and-editor|GitHub flow for one pull request]] — Show the ordered steps of GitHub flow and where review and checks can send a change back.
- [[visual-ai-review-loop-workstation-and-editor|The safe loop for AI-written code]] — Show the gates that AI-written code passes before it is merged: a spec, a failing test, a check that runs, and a human review of every line.
- [[visual-debug-session-path-workstation-and-editor|One debug session in VS Code]] — Show the loop of a debug session: set a breakpoint, start, pause, inspect, step or continue.
- [[visual-mini-02-flow-workstation-and-editor|Commit-msg hook lint flow]] — Show how a commit-msg hook turns a commit message into an exit code.

## Comparison

- [[visual-chacon-2014-pro-git-mechanism-workstation-and-editor|Merge versus rebase in the commit graph]] — Compare how merge and rebase join two diverged branches in the commit graph.
- [[visual-git-graph-lab-fallback-workstation-and-editor|One fork, joined by merge or by rebase]] — Show both results of joining the same fork, so the learner can compare the two graphs without the animation.

## Decision tree

- [[visual-nodejs-packages-docs-mechanism-workstation-and-editor|Which loader Node.js uses for a file]] — Show how Node.js picks ES module or CommonJS loading for one file, so the learner can predict it.

## Architecture

- [[visual-commitlint-module-map-workstation-and-editor|commitlint module map]] — Show which commitlint package does which job, so you can plan the same split in a small CLI.
- [[visual-capstone-layers-workstation-and-editor|Layers of the devkit CLI]] — Show the four layers of devkit and which layer depends on which.

## Sequence

- [[visual-commitlint-request-flow-workstation-and-editor|commitlint request flow]] — Follow one commit message from the Git hook to an exit code.
- [[visual-capstone-request-flow-workstation-and-editor|Request flow of devkit lint --edit]] — Show what happens from the commit-msg hook to the exit code.

## Video

- [[visual-shell-pipeline-flow-workstation-and-editor|How text flows through a shell pipeline]] — See how each command in a pipeline reads the output of the command before it, and why the order of redirections decides where errors go. · video storyboard
- [[visual-git-graph-walkthrough-workstation-and-editor|Merge and rebase on the same fork]] — See how merge and rebase join the same two diverged branches and why the two histories differ. · video rendered
- [[visual-bisect-walkthrough-workstation-and-editor|git bisect halves the suspect commits at every test]] — See how marking one good and one bad commit lets Git find the first bad commit in about four tests out of sixteen. · video storyboard

## Interactive experiences

- [[visual-git-graph-lab-workstation-and-editor|Merge or rebase the same two branches]] — Predict where each branch and HEAD point after merge or rebase, and say which command rewrites commits. · Interactive video lesson (Mode B)
- [[visual-bisect-lab-workstation-and-editor|Find the first bad commit with git bisect]] — Mark commits good or bad, predict how many tests bisect needs, and read git bisect run exit codes. · Interactive video lesson (Mode B)
- [[visual-shell-pipeline-lab-workstation-and-editor|Build a shell pipeline stage by stage]] — Predict the output of each pipeline stage and explain where a redirection sends standard error. · Interactive video lesson (Mode B)

## Layered

- [[visual-settings-precedence-workstation-and-editor|VS Code settings precedence]] — Show which settings scope wins when two scopes set the same setting.

## Deployment

- [[visual-capstone-deployment-workstation-and-editor|Where devkit runs]] — Show the three places that run the same devkit process and what it reads.

## My insights
