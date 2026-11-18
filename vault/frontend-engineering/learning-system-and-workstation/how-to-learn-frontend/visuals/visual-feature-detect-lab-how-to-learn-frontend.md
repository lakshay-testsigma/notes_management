---
title: "Switch a browser feature on and off"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-17
sources: [mdn-feature-detection-guide, chrome-origin-trials-docs, sansec-polyfill-io-blog]
---
# Switch a browser feature on and off

**Interactive experiences** · teaches Feature detection, polyfills and experimental features, Polyfills only when needed, and their supply-chain risk, Experimental features and origin trials

**Why this visual.** Predict which code path a feature test runs when the browser has or lacks the feature.

**Interactive video lesson (Mode B)** · level beginner · modes Explore, Guided, Practice.

Open it on the lesson site: `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/04-feature-detection-and-polyfills/`. Run `npm run site:dev` first.

## Parts

- Guided walkthrough (HyperFrames composition): [[visual-feature-detect-walkthrough-how-to-learn-frontend|feature-detect-walkthrough]]
- Simulation: `AlgorithmStepper` with named presets
- Static fallback: [[visual-mdn-feature-detection-guide-mechanism-how-to-learn-frontend|mdn-feature-detection-guide-mechanism]]

Lesson definition: `projects/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/experiences/feature-detect-lab/experience.json` (rebuild with `tutor experience frontend-engineering/learning-system-and-workstation/how-to-learn-frontend build feature-detect-lab`).

## Checkpoints

- **predict.** This browser has no Geolocation API. Which code runs? Answer: The else branch, which offers static maps. "geolocation" in navigator only asks whether navigator has that member. Here it returns false, so the else branch runs and the visitor gets static maps instead of a broken page.
- **experiment.** Switch subgrid off in the simulated browser (pick "subgrid js off" or "subgrid css off") and step until the page picks a layout. Which layout does the visitor get? With subgrid missing, CSS.supports returns false and @supports not (...) matches. Both tests send the browser to the fallback layout, so the page still works without the new feature.
- **verify.** Why can a polyfill loaded from a third-party address be a risk? Answer: Its code runs on your page, so whoever controls that address controls the code. A polyfill is script that runs with your page. In 2024 the polyfill.io domain was sold and its script was changed to inject malware, which affected more than 100,000 sites.
- **predict.** Your page uses an experimental feature through an origin trial, behind a feature test. The trial expires. What does a visitor get? Answer: The fallback code, because the test now returns false. An origin trial turns the feature on only while the trial runs. After it expires the feature is off, the test returns false, and the fallback runs. That is why experimental features always need a fallback.
- **verify.** Why does MDN tell you to test the feature instead of reading which browser visits the site? Answer: The test asks the real browser what it can do; the browser name only guesses. MDN calls browser sniffing a terrible practice. A feature test checks the actual capability at run time, so each browser gets the code path it can run.

Needs first: Browser support literacy: Baseline and caniuse, Feature detection, polyfills and experimental features.

## What it shows

Step through an animated walkthrough, change the simulation and answer the checkpoints. Predict which code path a feature test runs when the browser has or lacks the feature.

Text alternative: A guided walkthrough of three feature tests from MDN (@supports, CSS.supports and the in operator), paused for predictions, plus a simulated browser where the learner switches subgrid, geolocation or an origin-trial feature on and off and steps through the test to see whether the enhanced or the fallback code runs. It ends with the polyfill.io risk and why an expired origin trial still needs the fallback.

## Check yourself

This browser has no Geolocation API. Which code runs?

Answer: The else branch, which offers static maps. "geolocation" in navigator only asks whether navigator has that member. Here it returns false, so the else branch runs and the visitor gets static maps instead of a broken page.

## Sources

- Implementing feature detection (MDN) — https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection (`mdn-feature-detection-guide`)
- Origin trials (Chrome for Developers) — https://developer.chrome.com/docs/web-platform/origin-trials (`chrome-origin-trials-docs`)
- Polyfill supply chain attack hits 100K+ sites — https://sansec.io/research/polyfill-supply-chain-attack (`sansec-polyfill-io-blog`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/lesson/04-feature-detection-and-polyfills/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/how-to-learn-frontend/04-feature-detection-and-polyfills.mdx`)

Back to [[visuals-how-to-learn-frontend|all visuals]].

## My insights
