---
title: "How to learn frontend (and keep improving) — recall cards"
topic: frontend-engineering/learning-system-and-workstation/how-to-learn-frontend
stage: recall
tags: [frontend-engineering, learning-system-and-workstation, flashcards]
created: 2026-11-18
---

# How to learn frontend (and keep improving) — recall cards

## Cards

<!-- card: hlf-01 -->
You watch tutorials all weekend but on Monday cannot start a new feature. Which step of the learning loop is missing, and what does it catch?
?
The measure and explain steps. Reading alone never checks understanding, so the gap survives until a real problem exposes it.

<!-- card: hlf-02 -->
A feature shows the Baseline label "Newly available". Is it safe to ship today with no fallback, and why?
?
No. Newly available means the core browsers added it less than 30 months ago, so older browsers still lack it. Wait for Widely available, or add a fallback.

<!-- card: hlf-03 -->
Your learning-log note has only a "read" section filled in. Why is the note incomplete, and what does the loop add?
?
You never proved understanding. The build, measure, and explain steps are what turn reading into a checked claim.

<!-- card: hlf-04 -->
You need a CSS feature some browsers lack. When do you polyfill, and when do you progressively enhance?
?
Polyfill when the feature is required and you must make it work everywhere. Progressively enhance when the feature is a bonus the page still works without.

<!-- card: hlf-05 -->
Why does re-implementing a small library teach more than reading its documentation?
?
You meet the real edge cases and design decisions that documentation skips, and you learn why the authors chose them.

<!-- card: hlf-06 -->
Predict what happens after the "Explain" step of the learning-loop diagram.
?
It loops back to "Read" for the next topic, because explaining reveals the next gap to read about. [[visual-how-it-works-how-to-learn-frontend]]

<!-- card: hlf-07 -->
What must you never do to decide whether a browser supports a feature, and why?
?
Parse the user-agent string. It lies, changes constantly, and breaks on new browsers. Test the feature itself instead.

<!-- card: hlf-08 -->
MDN and a random Medium post disagree about a CSS detail. Which do you trust, and why?
?
MDN, because it sits closest to the specification (WHATWG, W3C, TC39), while a blog is a third-hand retelling that goes stale.

<!-- card: hlf-09 -->
How do you keep up with the web platform without reading every blog post?
?
Skim official release notes and a few newsletters weekly, and read the State of JS survey once a year.

<!-- card: hlf-10 -->
Your saved learning data changes shape between versions. How does a production store avoid corrupting it?
?
It stores a version number with the data. On a mismatch it runs a migrate function, or drops the value instead of loading bad data.

<!-- card: hlf-11 -->
A feature passes "Widely available" on the Baseline diagram. What does that mean for your ship decision?
?
You can ship it with no fallback, because the core browser set has supported it for more than 30 months. [[visual-baseline-ship-decision-how-to-learn-frontend]]

## Reopen map

| Card | Outcome | Reopen | Visual |
|------|---------|--------|--------|
| hlf-01 | 1 | `02-the-learning-loop` | [[visual-how-it-works-how-to-learn-frontend]] |
| hlf-02 | 2 | `04-browser-support` | [[visual-baseline-ship-decision-how-to-learn-frontend]] |
| hlf-03 | 3 | `02-the-learning-loop` | — |
| hlf-04 | 4 | `05-feature-detection` | — |
| hlf-05 | 5 | `06-practice-and-read-code` | — |
| hlf-06 | 1 | `02-the-learning-loop` | [[visual-how-it-works-how-to-learn-frontend]] |
| hlf-07 | 4 | `05-feature-detection` | [[visual-mdn-feature-detection-mechanism-how-to-learn-frontend]] |
| hlf-08 | 1 | `03-primary-sources` | — |
| hlf-09 | 5 | `07-teach-and-stay-current` | — |
| hlf-10 | 3 | `06-capstone-how-to-learn-frontend` | — |
| hlf-11 | 2 | `04-browser-support` | [[visual-baseline-ship-decision-how-to-learn-frontend]] |

## My insights
