---
title: "Move a feature through the Baseline labels"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-17
sources: [web-dev-baseline-docs, caniuse-docs, mdn-browser-compat-data-repo]
---
# Move a feature through the Baseline labels

**Interactive experiences** · teaches Browser support literacy: Baseline and caniuse, Baseline lifecycle: limited, newly, widely available, Reading caniuse support tables

**Why this visual.** Predict a feature's Baseline label from its core-browser support and the months since it became Newly available.

**Interactive video lesson (Mode B)** · level beginner · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/03-can-i-ship-it/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-baseline-status-guided-how-to-learn-frontend|baseline-status-guided]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-web-dev-baseline-docs-mechanism-how-to-learn-frontend|web-dev-baseline-docs-mechanism]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/experiences/baseline-status-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/how-to-learn-frontend build baseline-status-lab`).

## Checkpoints

- **predict.** A feature works in six of the seven core browsers. Which Baseline label does it have? Answer: Limited availability. Baseline has no partial step. While any one core browser lacks the feature, the label is Limited availability. Only the last core browser to ship it moves the label to Newly available.
- **experiment.** Feature Y has worked in six core browsers for years. Step forward until its label leaves Limited availability. What finally changes the label? The years alone change nothing, because the 30-month clock counts from the newly interoperable date. That date exists only when the last core browser ships the feature, so Safari on iOS shipping it is what moves the label.
- **predict.** The :has() selector became Newly available in December 2023. Which label does it have in May 2026, 29 months later? Answer: Newly available. Widely available starts when 30 months have passed since the newly interoperable date. 29 is less than 30, so :has() stays Newly available until June 2026.
- **experiment.** Run the :has() clock forward until the label reads Widely available. In which month does it change? Every core browser already supports :has(), so only time moves the label. At 30 months after December 2023, which is June 2026, the label changes to Widely available.
- **verify.** In a Can I use table, the cell for one browser is greenish yellow. What does that cell tell you? Answer: That browser has partial support. The Can I use legend uses four colors: green for supported, red for not supported, greenish yellow for partial support, and gray for unknown. Partial support means you must check which part works before you rely on it.

Needs first: Browser support literacy: Baseline and caniuse.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict a feature's Baseline label from its core-browser support and the months since it became Newly available.

Text alternative: A guided walkthrough of the Baseline lifecycle, paused for predictions, and a stepper with seven core-browser cells. Highlighted cells are browsers that support the feature. The learner adds browsers one by one and runs the 30-month clock, and watches the label move from Limited availability to Newly available to Widely available. The :has() selector, Newly available in December 2023, is the worked example. A last question reads the Can I use color legend.

## Check yourself

A feature works in six of the seven core browsers. Which Baseline label does it have?

Answer: Limited availability. Baseline has no partial step. While any one core browser lacks the feature, the label is Limited availability. Only the last core browser to ship it moves the label to Newly available.

## Sources

- Baseline: web platform feature availability — https://web.dev/baseline (`web-dev-baseline-docs`)
- Can I use: About and support legend — https://caniuse.com/ (`caniuse-docs`)
- mdn/browser-compat-data — https://github.com/mdn/browser-compat-data (`mdn-browser-compat-data-repo`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/03-can-i-ship-it/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/03-can-i-ship-it.mdx`)

Back to [[visuals-how-to-learn-frontend|all visuals]].

## My insights
