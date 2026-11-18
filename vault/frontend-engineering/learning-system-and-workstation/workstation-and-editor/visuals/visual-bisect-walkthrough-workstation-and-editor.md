---
title: "git bisect halves the suspect commits at every test"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [git-scm-docs, chacon-2014-pro-git]
---
# git bisect halves the suspect commits at every test

**Video** · teaches Finding a bad commit with git bisect

**Why this visual.** See how marking one good and one bad commit lets Git find the first bad commit in about four tests out of sixteen.

Video status: **storyboard**. not rendered yet; run `tutor video <topic> render <id>` The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/bisect-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/bisect-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/workstation-and-editor build bisect-walkthrough`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/bisect-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/bisect-walkthrough/composition/index.html`.

## Transcript

A bug is somewhere in 16 commits. You run git bisect start, mark HEAD (c16) bad and c1 good. Git checks out the middle commit; you test it and mark it good or bad. The answers c8 good, c12 bad, c10 good, c11 bad leave one commit: c11 is the first bad commit. git bisect reset returns to the commit you started on. A script can answer for you with git bisect run: exit 0 is good, 1 to 127 except 125 is bad, 125 is skip, any other code aborts.

**00:00 A bug hides in 16 commits.** A bug appeared somewhere in sixteen commits. Git bisect finds the first bad commit by halving the range.

**00:07 Mark both ends of the range.** You start bisect and mark both ends of the range. HEAD, commit sixteen, is bad. Commit one is good. Git then checks out the middle commit.

**00:18 Each answer halves the suspects.** Each answer you give halves the suspect range. Commit eight is good, twelve is bad, ten is good, eleven is bad. Four tests are enough.

**00:30 Git names the first bad commit.** After the last answer, Git reports commit eleven as the first bad commit. Then git bisect reset returns you to where you started.

**00:40 Let a script answer: git bisect run.** A test script can give the answers with git bisect run. Exit zero means good. One to one hundred twenty seven means bad, except one twenty five, which means skip. Any other code aborts.

Sources:

- Git reference manual: git-bisect and git-reflog — https://git-scm.com/docs/git-bisect
- Pro Git — https://git-scm.com/book/en/v2

## What it shows

Every good or bad answer removes about half of the suspect commits, so 16 commits need about four tests.

Text alternative: A bug is somewhere in 16 commits. You run git bisect start, mark HEAD (c16) bad and c1 good. Git checks out the middle commit; you test it and mark it good or bad. The answers c8 good, c12 bad, c10 good, c11 bad leave one commit: c11 is the first bad commit. git bisect reset returns to the commit you started on. A script can answer for you with git bisect run: exit 0 is good, 1 to 127 except 125 is bad, 125 is skip, any other code aborts.

## Check yourself

c8 is good and c12 is bad. Which commits can still be the first bad commit?

Answer: c9, c10, c11 and c12: after the last good commit, up to and including the bad one.

## Sources

- Git reference manual: git-bisect and git-reflog — https://git-scm.com/docs/git-bisect (`git-scm-docs`)
- Pro Git — https://git-scm.com/book/en/v2 (`chacon-2014-pro-git`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/03-bisect-reflog-and-recovery/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/workstation-and-editor/03-bisect-reflog-and-recovery.mdx`)

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
