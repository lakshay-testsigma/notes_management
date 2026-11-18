---
title: "Change colors and headings, predict the accessibility check"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [dequelabs-axe-core-repo, w3c-wai-selecting-evaluation-tools, w3c-wcag22-understanding-contrast-minimum]
---
# Change colors and headings, predict the accessibility check

**Interactive experiences** · teaches Accessibility extensions, What automated accessibility rules can and cannot catch, Contrast and vision emulation checks

**Why this visual.** Predict whether an automated contrast or heading-order check passes, fails or returns incomplete, and name what a person must still review.

**Interactive video lesson (Mode B)** · level intermediate · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/04-accessibility-extensions/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-a11y-checks-walkthrough-browser-extension-toolkit|a11y-checks-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-a11y-check-outcomes-browser-extension-toolkit|a11y-check-outcomes]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/experiences/a11y-checks-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/browser-extension-toolkit build a11y-checks-lab`).

## Checkpoints

- **predict.** Normal-size gray #777777 text on white measures 4.478:1. What does the color-contrast check report? Answer: Fail: 4.47 is below 4.5. The threshold is a hard minimum. axe rounds the ratio down to 4.47 before it reports it, so a near miss never shows as a pass. Incomplete is only for cases where the colors cannot be known.
- **predict.** The page has h1, then h2, then h4. What does heading-order report for the h4? Answer: Fail: it skips h3. heading-order compares each heading with the one before it. A heading may be at most one level deeper than the previous one, so h4 after h2 fails.
- **experiment.** Step through the heading changes until the check cannot decide. Why does it answer incomplete there? The check needs the previous heading to compare levels. When that heading is outside the scanned part, it cannot judge, so it answers incomplete instead of a false fail.
- **experiment.** Change the text color and size until large text fails the contrast check. Large text needs only 3:1, but #959595 on white is 2.995:1, rounded down to 2.99. That is below 3, so even large text fails.
- **verify.** An extension scan of your page shows zero violations. What do you know? Answer: Only the automated rules passed; incomplete items and human checks remain. W3C notes that tools cannot check all accessibility aspects automatically. Incomplete items, heading meaning and keyboard and screen reader use still need a person.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict whether an automated contrast or heading-order check passes, fails or returns incomplete, and name what a person must still review.

Text alternative: A guided walkthrough of how an axe-style scan judges color contrast and heading order, paused for predictions, with a stepper where the learner changes text colors, text size and heading levels. Gray #767676 on white passes at 4.54:1; #777777 fails at 4.47:1 because the ratio is rounded down; large text needs only 3:1; text on a background image or a heading whose previous heading cannot be found returns incomplete. No rule judges heading meaning, so a person still reviews.

## Check yourself

Normal-size gray #777777 text on white measures 4.478:1. What does the color-contrast check report?

Answer: Fail: 4.47 is below 4.5. The threshold is a hard minimum. axe rounds the ratio down to 4.47 before it reports it, so a near miss never shows as a pass. Incomplete is only for cases where the colors cannot be known.

## Sources

- dequelabs/axe-core — https://github.com/dequelabs/axe-core (`dequelabs-axe-core-repo`)
- W3C WAI: Selecting evaluation tools, Evaluation Tools List, and page-structure tutorials (headings, regions) — https://www.w3.org/WAI/test-evaluate/tools/selecting/ (`w3c-wai-selecting-evaluation-tools`)
- Understanding SC 1.4.3: Contrast (Minimum) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (`w3c-wcag22-understanding-contrast-minimum`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/04-accessibility-extensions/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/04-accessibility-extensions.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
