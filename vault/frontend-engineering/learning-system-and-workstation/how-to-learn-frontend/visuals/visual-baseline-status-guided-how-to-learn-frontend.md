---
title: "How a feature moves from Limited to Widely available"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-17
sources: [web-dev-baseline-docs, caniuse-docs, mdn-browser-compat-data-repo]
---
# How a feature moves from Limited to Widely available

**Video** · teaches Browser support literacy: Baseline and caniuse, Baseline lifecycle: limited, newly, widely available, Reading caniuse support tables

**Why this visual.** See which two inputs set a feature's Baseline label: support in every core browser, and the months since that day.

Video status: **storyboard**. not rendered yet; run `tutor video <topic> render <id>` The storyboard is in `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/videos/baseline-status-guided/storyboard.md`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/videos/baseline-status-guided` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/how-to-learn-frontend build baseline-status-guided`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/videos/baseline-status-guided/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/baseline-status-guided/composition/index.html`.

## Transcript

Baseline gives each web feature one label. It checks seven core browsers: Chrome on desktop and Android, Edge, Firefox on desktop and Android, and Safari on macOS and iOS. While any one of them lacks the feature, the label is Limited availability. When the last one ships it, the feature is Newly available. Thirty months later it is Widely available, as the :has() selector shows: Newly available in December 2023, Widely available in June 2026. Can I use shows the support of each browser with four colors. Widely available means most sites, not all.

**00:00 Can I ship this feature?.** Can you use a web feature today? Baseline answers with one label.

**00:05 Seven core browsers.** Baseline checks seven core browsers: Chrome on desktop and Android, Edge, Firefox on desktop and Android, and Safari on macOS and iOS.

**00:17 Three labels in a fixed order.** A feature starts as Limited availability. When the last core browser ships it, the feature is Newly available. Thirty months later, it is Widely available.

**00:28 One missing browser stops the clock.** The thirty month clock starts only when the last core browser ships. Before that day, the feature stays Limited, however old it is.

**00:38 The :has() selector, month by month.** The has selector became Newly available in December 2023. Add thirty months, and it is Widely available in June 2026.

**00:49 Reading a Can I use table.** Can I use shows support for each browser. Green means supported, red means not supported, greenish yellow means partial, and gray means unknown.

**00:59 What Widely available does not promise.** Widely available means the feature works for most sites, not all. If your users run older browsers, check their support yourself.

Sources:

- Baseline: web platform feature availability — https://web.dev/baseline
- Can I use: About and support legend — https://caniuse.com/
- mdn/browser-compat-data — https://github.com/mdn/browser-compat-data

## What it shows

Only two inputs move the Baseline label: whether every core browser supports the feature, and how many months have passed since the last one shipped it.

Text alternative: Baseline gives each web feature one label. It checks seven core browsers: Chrome on desktop and Android, Edge, Firefox on desktop and Android, and Safari on macOS and iOS. While any one of them lacks the feature, the label is Limited availability. When the last one ships it, the feature is Newly available. Thirty months later it is Widely available, as the :has() selector shows: Newly available in December 2023, Widely available in June 2026. Can I use shows the support of each browser with four colors. Widely available means most sites, not all.

## Check yourself

A feature works in six of the seven core browsers and has existed for five years. Which Baseline label does it have, and why?

Answer: Limited availability, because the 30-month clock starts only when the last core browser ships the feature.

## Sources

- Baseline: web platform feature availability — https://web.dev/baseline (`web-dev-baseline-docs`)
- Can I use: About and support legend — https://caniuse.com/ (`caniuse-docs`)
- mdn/browser-compat-data — https://github.com/mdn/browser-compat-data (`mdn-browser-compat-data-repo`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/03-can-i-ship-it/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/03-can-i-ship-it.mdx`)

Back to [[visuals-how-to-learn-frontend|all visuals]].

## My insights
