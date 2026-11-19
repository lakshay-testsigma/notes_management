---
title: "Where one page loses Lighthouse performance points"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo, chrome-devtools-docs]
---
# Where one page loses Lighthouse performance points

**Comparison** · teaches Lighthouse audits, Lighthouse and other audit panels

**Why this visual.** Show that the Lighthouse performance score is a weighted average, so the metric that loses the most weighted points is the first fix.

Interactive `Chart`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/10-lighthouse-and-audit-panels/`. Run `npm run site:dev` first.

## What it shows

Bars compare each metric's weight (TBT 30, LCP 25, CLS 25, FCP 10, Speed Index 10, from core/config/default-config.js:419-424 @ 3b399f6) with the points one example page loses. The metric scores are invented for teaching. TBT loses 19.5 points, so splitting a long task helps most; CLS can add at most 1.3.

Text alternative: A bar chart pairs each metric's weight with the points it loses on an example page: TBT loses 19.5 of 30, LCP 11.3 of 25, CLS 1.3 of 25, so fixing TBT moves the score most.

## Check yourself

A page has a perfect CLS score and a TBT score of 0.35. Which metric should you work on first, and why?

Answer: TBT, because it has the largest weight (30) and loses about 19.5 points, while CLS loses nothing.

## Sources

- GoogleChrome/lighthouse — https://github.com/GoogleChrome/lighthouse (`googlechrome-lighthouse-repo`)
- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/10-lighthouse-and-audit-panels/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/10-lighthouse-and-audit-panels.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
