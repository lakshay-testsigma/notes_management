---
title: "Build a shell pipeline stage by stage"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [gnu-bash-manual]
---
# Build a shell pipeline stage by stage

**Interactive experiences** · teaches Terminal and shell basics, Pipes and redirection, PATH and environment variables

**Why this visual.** Predict the output of each pipeline stage and explain where a redirection sends standard error.

**Interactive video lesson (Mode B)** · level beginner · modes Watch, Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/01-terminal-and-shell/`. Run `npm run site:dev` first.

## Parts

- Intro explainer: [[visual-shell-pipeline-flow-workstation-and-editor|shell-pipeline-flow]]
- Guided walkthrough (HyperFrames composition): [[visual-shell-pipeline-flow-workstation-and-editor|shell-pipeline-flow]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-shell-pipeline-stages-workstation-and-editor|shell-pipeline-stages]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/experiences/shell-pipeline-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/workstation-and-editor build shell-pipeline-lab`).

## Checkpoints

- **predict.** grep 404 writes five lines. What does sort write to its standard output in this pipeline? Answer: The same five lines, with equal lines next to each other. In a pipeline each command reads the previous command's output through the pipe. sort gets only the five lines grep wrote, and it changes their order, not their number.
- **predict.** You run ls notes.txt missing.txt 2>&1 > out.txt. Where does the error message about missing.txt appear? Answer: On the terminal. Bash processes redirections from left to right. 2>&1 makes stderr a copy of stdout while stdout is still the terminal; > out.txt then moves only stdout.
- **verify.** Which command line does the same as ls notes.txt missing.txt |& grep missing? Answer: ls notes.txt missing.txt 2>&1 | grep missing. The Bash manual says |& is shorthand for 2>&1 |: it connects the first command's standard error, as well as its standard output, to the next command's standard input.

Needs first: Terminal and shell basics.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict the output of each pipeline stage and explain where a redirection sends standard error.

Text alternative: A short walkthrough sends a seven-line web server log through cat access.log | grep 404 | sort | uniq -c | sort -rn and pauses for predictions. In the stepper, each step shows one stage's standard input next to its standard output. A second trace leaves out sort, and a third shows how Bash processes > out.txt and 2>&1 from left to right, so their order decides where the error message goes.

## Check yourself

grep 404 writes five lines. What does sort write to its standard output in this pipeline?

Answer: The same five lines, with equal lines next to each other. In a pipeline each command reads the previous command's output through the pipe. sort gets only the five lines grep wrote, and it changes their order, not their number.

## Sources

- Bash Reference Manual — https://www.gnu.org/software/bash/manual/bash.html (`gnu-bash-manual`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/01-terminal-and-shell/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/workstation-and-editor/01-terminal-and-shell.mdx`)

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
