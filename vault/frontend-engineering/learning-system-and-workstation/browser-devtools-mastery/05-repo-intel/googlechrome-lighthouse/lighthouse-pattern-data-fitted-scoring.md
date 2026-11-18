---
title: "GoogleChrome/lighthouse — pattern: data-fitted scoring"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Data-fitted scoring

## The problem

A fixed limit, such as "good below 2.5 s", gives only pass or fail. It cannot rank two failing pages, and it hides how far a page is from the limit. Checks that should not count also distort a category average.

## What they do

Each metric audit stores two control points per device, `p10` and `median`, chosen from HTTP Archive percentiles. A log-normal curve turns a value into a score from 0 to 1: a value at the median scores about 0.5 and a value at `p10` scores about 0.9. Total byte weight uses 2667 KiB and 4000 KiB. TBT says its numbers are "semi-arbitrarily chosen" because raw data scored too harshly. Each audit result has one of seven modes. Informative, manual and not-applicable audits get weight 0, so they show in the report but do not move the category. A score outside 0 to 1 throws. The category score is a weighted mean rounded to two decimals.

## Evidence

- `core/audits/audit.js:89-108 @ 3b399f6` — control points to a log-normal score
- `core/audits/metrics/largest-contentful-paint.js:40-48 @ 3b399f6` — LCP control points from real data
- `core/audits/metrics/total-blocking-time.js:49-56 @ 3b399f6` — the admitted hand tuning
- `core/audits/audit.js:49-58 @ 3b399f6` — the score modes
- `core/scoring.js:63-68 @ 3b399f6` — weight 0 for modes that do not count
- `core/test/scoring-test.js:81-107 @ 3b399f6` — not-applicable audits are left out of the mean

## When to use it, and when not to

Use real-data curves when you must compare many pages and a pass or fail is too coarse. For a team budget, a clear limit is better, because everyone can read it. Borrow the modes: let informative checks show without counting, and validate that every score is in range.

## Related

- [[Log-normal scoring]] — the curve idea
- [[Lab and simulated metrics]] — the numbers that go into the curve
- [[lighthouse-findings|Findings]]

## My insights
