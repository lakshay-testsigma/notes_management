---
title: "One Styles checkbox: computed padding and box width before and after"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [chrome-devtools-docs, firefox-devtools-user-docs]
---
# One Styles checkbox: computed padding and box width before and after

**Comparison** · teaches Elements and Styles panel, Box model and layout overlays

**Why this visual.** See how turning off the winning declaration changes the computed value and the box size.

Interactive `CompareView`. Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/02-elements-and-styles/`. Run `npm run site:dev` first.

## What it shows

Two rules set padding on one button. The Styles tab crosses out the losing .btn declaration. When you clear the .btn-primary checkbox, .btn wins again, computed padding-left drops from 24px to 16px and the box shrinks from 130 px to 114 px. Example numbers assume content-box sizing.

Text alternative: Two columns compare a button before and after one Styles checkbox. Before, computed padding-left is 24px and the box is 130 px wide. After, padding-left is 16px and the box is 114 px, so the .btn-primary rule caused the extra width.

## Check yourself

Why does padding-left become 16px and not 0px when you turn off the .btn-primary padding?

Answer: The .btn rule still matches the button, so its crossed-out declaration wins the cascade again.

## Sources

- Chrome DevTools — https://developer.chrome.com/docs/devtools (`chrome-devtools-docs`)
- Firefox DevTools User Docs — https://firefox-source-docs.mozilla.org/devtools-user/ (`firefox-devtools-user-docs`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/lesson/02-elements-and-styles/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/browser-devtools-mastery/02-elements-and-styles.mdx`)

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
