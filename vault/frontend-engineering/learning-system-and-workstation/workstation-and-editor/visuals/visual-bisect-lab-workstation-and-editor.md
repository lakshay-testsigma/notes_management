---
title: "Find the first bad commit with git bisect"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [git-scm-docs, chacon-2014-pro-git]
---
# Find the first bad commit with git bisect

**Interactive experiences** · teaches Finding a bad commit with git bisect

**Why this visual.** Mark commits good or bad, predict how many tests bisect needs, and read git bisect run exit codes.

**Interactive video lesson (Mode B)** · level beginner · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/03-bisect-reflog-and-recovery/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-bisect-walkthrough-workstation-and-editor|bisect-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-bisect-lab-fallback-workstation-and-editor|bisect-lab-fallback]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/experiences/bisect-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/workstation-and-editor build bisect-lab`).

## Checkpoints

- **predict.** HEAD (c16) is bad and c1 is good. About how many commits must you test before Git names the first bad commit? Answer: About 4. Each answer removes about half of the suspect commits: 16, 8, 4, 2, 1. That is about log2(16) = 4 tests. Pro Git shows the same halving: 6 revisions left, then 3, then 1.
- **experiment.** Load the preset where the bug entered in c3. Before you step, guess which commits Git tests. Then step until Git names the first bad commit. The tests are c8 (bad), c4 (bad), c2 (good) and c3 (bad). Each answer keeps only the half that can still hold the first bad commit, so a bug near the start also takes 4 tests.
- **predict.** With git bisect run, your test script exits with code 125 on one commit. What does Git do with that commit? Answer: It skips the commit, because it cannot be tested. The git-bisect manual reserves exit code 125 for "cannot be tested": Git skips that revision, as with git bisect skip. Codes 1 to 127 except 125 mean bad, 0 means good.
- **verify.** Your test script ends with exit(-1), so the shell sees exit code 255. What does git bisect run do? Answer: It aborts the bisect. Only 0 (good), 1 to 127 except 125 (bad) and 125 (skip) have a meaning. Any other code, such as 255, aborts the bisect process.
- **verify.** In the skip preset, c11 is good, c12 was skipped and c13 is bad. Why can Git not name one first bad commit? Answer: The skipped commit is next to the one you look for, so either c12 or c13 could be first. The manual warns: if you skip a commit next to the one you are looking for, Git cannot tell which of those commits was the first bad one. Without a result for c12, both c12 and c13 remain possible.

Needs first: Commit graph and branches.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Mark commits good or bad, predict how many tests bisect needs, and read git bisect run exit codes.

Text alternative: A guided walkthrough of git bisect on 16 commits: mark HEAD bad and c1 good, test the commit Git checks out in the middle, and watch the suspect range halve until one commit is left after four tests. A stepper lets the learner replay the search with the bug in c3, c11 or c16, and with an untestable commit marked skip. The questions cover the step count and the exit codes of git bisect run.

## Check yourself

HEAD (c16) is bad and c1 is good. About how many commits must you test before Git names the first bad commit?

Answer: About 4. Each answer removes about half of the suspect commits: 16, 8, 4, 2, 1. That is about log2(16) = 4 tests. Pro Git shows the same halving: 6 revisions left, then 3, then 1.

## Sources

- Git reference manual: git-bisect and git-reflog — https://git-scm.com/docs/git-bisect (`git-scm-docs`)
- Pro Git — https://git-scm.com/book/en/v2 (`chacon-2014-pro-git`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/03-bisect-reflog-and-recovery/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/workstation-and-editor/03-bisect-reflog-and-recovery.mdx`)

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
