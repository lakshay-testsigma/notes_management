---
title: "Pass, fail or incomplete: contrast and heading checks"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-18
sources: [dequelabs-axe-core-repo, w3c-wai-selecting-evaluation-tools, w3c-wcag22-understanding-contrast-minimum]
---
# Pass, fail or incomplete: contrast and heading checks

**Video** · teaches Accessibility extensions, What automated accessibility rules can and cannot catch, Contrast and vision emulation checks

**Why this visual.** See how an automated accessibility check decides pass, fail or incomplete for color contrast and heading order, and what it leaves for a person.

Video status: **storyboard**. FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/a11y-checks-walkthrough/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/a11y-checks-walkthrough` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/browser-extension-toolkit build a11y-checks-walkthrough`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/videos/a11y-checks-walkthrough/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/a11y-checks-walkthrough/composition/index.html`.

## Transcript

An accessibility scan gives three answers: pass, fail or incomplete. The contrast ratio is (L1 + 0.05) / (L2 + 0.05). Normal text needs at least 4.5:1, large text at least 3:1. Gray #767676 on white scores 4.54 and passes; #777777 scores 4.47 and fails, because axe rounds down. A background image, an overlapping element, one-character text or an empty input gives incomplete. Heading order fails when a heading is more than one level deeper than the one before it. A person still judges text on images, heading meaning, and keyboard and screen reader use.

**00:00 One scan, three answers.** One accessibility scan gives three answers: pass, fail, or incomplete. Incomplete means the tool cannot decide, so a person must review it.

**00:09 The contrast ratio.** The contrast ratio compares two colors. L1 is the relative luminance of the lighter color, and L2 is the luminance of the darker color.

**00:18 Two thresholds.** Normal text needs a ratio of at least 4.5 to 1. Large text, 18 point or 14 point bold, needs at least 3 to 1.

**00:28 No rounding up.** Gray 767676 on white scores 4.54 and passes. Gray 777777 scores 4.47 and fails. Axe rounds down, so 4.47 never shows as 4.5.

**00:38 When the tool cannot tell.** Some cases return incomplete: text on a background image, an overlapping element, one-character text, or an empty input field.

**00:46 Heading order.** Heading order checks each heading against the one before it. After h2, an h4 skips a level and fails. Change it to h3, and it passes.

**00:56 What rules cannot judge.** A rule decides plain color contrast and skipped heading levels. A person judges text on images, heading meaning, and keyboard and screen reader use.

Sources:

- dequelabs/axe-core — https://github.com/dequelabs/axe-core
- Selecting Web Accessibility Evaluation Tools — https://www.w3.org/WAI/test-evaluate/tools/selecting/
- Understanding SC 1.4.3: Contrast (Minimum) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

## What it shows

A rule decides only what it can measure. When it cannot see the real colors or the previous heading, it answers incomplete instead of guessing, and a person reviews it.

Text alternative: An accessibility scan gives three answers: pass, fail or incomplete. The contrast ratio is (L1 + 0.05) / (L2 + 0.05). Normal text needs at least 4.5:1, large text at least 3:1. Gray #767676 on white scores 4.54 and passes; #777777 scores 4.47 and fails, because axe rounds down. A background image, an overlapping element, one-character text or an empty input gives incomplete. Heading order fails when a heading is more than one level deeper than the one before it. A person still judges text on images, heading meaning, and keyboard and screen reader use.

## Check yourself

Gray #777777 normal-size text on white measures 4.48:1. What does the contrast check report, and why?

Answer: Fail. The ratio is rounded down to 4.47, which is below the 4.5:1 that normal text needs.

## Sources

- dequelabs/axe-core — https://github.com/dequelabs/axe-core (`dequelabs-axe-core-repo`)
- W3C WAI: Selecting evaluation tools, Evaluation Tools List, and page-structure tutorials (headings, regions) — https://www.w3.org/WAI/test-evaluate/tools/selecting/ (`w3c-wai-selecting-evaluation-tools`)
- Understanding SC 1.4.3: Contrast (Minimum) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (`w3c-wcag22-understanding-contrast-minimum`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/lesson/04-accessibility-extensions/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-extension-toolkit/04-accessibility-extensions.mdx`)

Back to [[visuals-browser-extension-toolkit|all visuals]].

## My insights
