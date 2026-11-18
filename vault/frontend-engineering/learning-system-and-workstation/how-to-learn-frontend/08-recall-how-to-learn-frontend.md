---
title: "How to learn frontend (and keep improving) — recall cards"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-17
---

# How to learn frontend (and keep improving) — recall cards

## Cards

<!-- card: htlf-01 -->
You want to learn the CSS `:has()` selector the way this roadmap asks. Name the four steps of the loop and what each one produces.
?
Read the MDN page or spec (you know the exact rule), build a tiny demo (you prove it runs), measure it in DevTools (you see the computed styles), explain it in about five lines (you find the gaps). The four steps are the roadmap's own convention.

<!-- card: htlf-02 -->
A two-year-old tutorial and the MDN page disagree about an API. Which do you trust, and why?
?
MDN or the spec. Tutorials go stale when APIs change; primary sources are updated with the platform and link to the spec.

<!-- card: htlf-03 -->
A blog post shows a JavaScript feature from a TC39 proposal at Stage 2. Should you rely on it in production? What stage would make it safe?
?
No. A Stage 2 proposal can still change or be dropped. Stage 4 means it is finished: it has two compatible implementations that pass Test262.

<!-- card: htlf-04 -->
A feature became Baseline Newly available in December 2023. When does it become Widely available, and what does each label mean?
?
About June 2026, 30 months later. Newly available: every core browser supports it. Widely available: it has been supported long enough for most sites to use it without a fallback.

<!-- card: htlf-05 -->
Your release uses a Baseline Newly available feature. What do you add to the code, and why?
?
A feature check with a fallback (for example `@supports` or `CSS.supports()`). All core browsers support it, but many users have not updated yet.

<!-- card: htlf-06 -->
Write the check that runs the Web Share API only when it exists, and say what runs otherwise.
?
`if ("share" in navigator) { navigator.share(data) } else { copy the link to the clipboard }`. Test for the feature, never for the browser name.

<!-- card: htlf-07 -->
A page loads `cdn.polyfill.io/v3/polyfill.min.js`. What is the risk, and what do you do?
?
In 2024 the domain changed owner and served malware to over 100,000 sites. Remove the reference; load only the polyfills your target browsers need, from your own build.

<!-- card: htlf-08 -->
A caniuse cell is greenish yellow, and the MDN table shows `≤37` for a browser. What do these two marks tell you?
?
Greenish yellow means partial support, so read its note and feature-detect. `≤37` means support started in version 37 or earlier; the exact version is not known.

<!-- card: htlf-09 -->
You open an unfamiliar library such as Preact. In what order do you read it?
?
Start with the map (README, CONTRIBUTING, folder layout), then one small function and its comments, then its call sites and tests. Predict each return value before you check it.

<!-- card: htlf-10 -->
Plan one week of keeping up with frontend. What goes in it, and how do you read a yearly survey such as State of JS?
?
A fixed time block for release notes and blogs, plus practice on a real exercise. Read the survey as a trend snapshot from self-selected respondents, not as market share.

<!-- card: htlf-11 -->
You want to make your first open-source contribution. What are the steps, and what do you gain?
?
Read the README and CONTRIBUTING, find or open an issue, then send a pull request. You practise on real code, get review from experienced people, and build a public record.

<!-- card: htlf-12 -->
In the Baseline status lab, the last core browser ships the feature. Predict the label now and the label after 30 months.
?
Newly available now; Widely available after 30 months. [[visual-baseline-status-lab-how-to-learn-frontend]]

<!-- card: htlf-13 -->
In the feature detection lab, you turn subgrid off. Which branch runs, and what does `CSS.supports("grid-template-columns", "subgrid")` return?
?
It returns `false`, so the fallback layout runs. [[visual-feature-detect-lab-how-to-learn-frontend]]

<!-- card: htlf-14 -->
A support table says a feature works in most browsers. Why does your code still check for it at runtime?
?
The table describes browsers in general. The visitor's own browser may be old or have only partial support, so the runtime check picks the path. [[visual-how-it-works-how-to-learn-frontend]]

<!-- card: htlf-15 -->
You open an issue that says "The share button is broken! Please fix it." Why will a maintainer struggle, and what should the issue say instead?
?
They cannot see the bug, so they must guess. Say what you were doing and how to reproduce it: the steps, what you expected, and what happened instead (for example "X does not happen when I do Y in Safari 18").

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| htlf-01 | explain and run the learning loop | lesson page `01-the-learning-loop`, listed in [[02-lesson-how-to-learn-frontend]] |
| htlf-02 | explain why primary sources beat tutorials | lesson page `02-primary-sources-first`, listed in [[02-lesson-how-to-learn-frontend]] |
| htlf-03 | find the right spec section and its maturity | [[visual-tc39-stages-timeline-how-to-learn-frontend]], then lesson page `02-primary-sources-first` |
| htlf-04 | decide whether a feature can ship today | [[visual-baseline-status-lab-how-to-learn-frontend]], then lesson page `03-can-i-ship-it` |
| htlf-05 | decide whether a feature can ship today | lesson page `03-can-i-ship-it`, then [[web-dev-baseline-docs-how-to-learn-frontend]] |
| htlf-06 | build a feature check with a fallback | [[visual-feature-detect-lab-how-to-learn-frontend]], then lesson page `04-feature-detection-and-polyfills` |
| htlf-07 | build a feature check with a fallback | [[polyfills-when-needed-how-to-learn-frontend]] |
| htlf-08 | decide whether a feature can ship today | [[caniuse-tables-how-to-learn-frontend]] |
| htlf-09 | build a weekly routine (code reading) | [[visual-preact-create-element-walkthrough-how-to-learn-frontend]], then lesson page `05-read-other-peoples-code` |
| htlf-10 | build a weekly routine (practice, news) | lesson page `06-a-weekly-practice-routine`, listed in [[02-lesson-how-to-learn-frontend]] |
| htlf-11 | build a weekly routine (teaching) | [[visual-first-contribution-path-how-to-learn-frontend]], then lesson page `07-build-in-public-and-teach` |
| htlf-12 | decide whether a feature can ship today | [[visual-baseline-status-lab-how-to-learn-frontend]] |
| htlf-13 | build a feature check with a fallback | [[visual-feature-detect-lab-how-to-learn-frontend]] |
| htlf-15 | build a weekly routine (teaching): a useful bug report | lesson page `07-build-in-public-and-teach`, listed in [[02-lesson-how-to-learn-frontend]] |
| htlf-14 | build a feature check with a fallback | [[visual-how-it-works-how-to-learn-frontend]], then [[07-final-notes-how-to-learn-frontend]] |

## My insights
