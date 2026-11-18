---
title: "dequelabs/axe-core — takeaways"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — takeaways for the capstone

The capstone is the toolkit-profile CLI. It checks an extension list against a permission policy, and runs accessibility, SEO and security-header checks on a URL. The mini project "release-a11y-seo-check" runs a smaller version of the page checks on release pages. These are the things worth borrowing.

1. **Give every check three outcomes: pass, fail, needs review.** In the CLI, a header or SEO check that cannot see enough (a redirect, a page behind login) prints "needs review", not "fail". From [[axe-core-findings|finding 1]] and [[axe-core-pattern-three-valued-results|the pattern]].
2. **Write the policy as data and validate it first.** The extension permission policy is a JSON file of rules. Check the file's shape before any run, and fail early, as the axe build does. From [[axe-core-findings|finding 8]] and [[axe-core-pattern-rules-as-data|the pattern]].
3. **Split checks into "collect" and "compare" phases.** For release-a11y-seo-check, collect one title, heading list and description per page, then compare across pages (duplicate titles, skipped heading levels). From [[axe-core-findings|finding 3]].
4. **Reset shared state on every exit path.** The CLI should clean temp files and browser sessions on success, error and timeout, and it should use a non-zero exit code on failure. From [[axe-core-findings|finding 6]] and [[axe-core-pattern-cleanup-on-every-exit|the pattern]].
5. **Tag each error with the check and the target.** An error reads "header-check on https://example.com: missing fetch", not a bare stack trace. From [[axe-core-findings|finding 7]].
6. **Probe cheaply, then run, and let one dead target be skipped.** Check that a URL answers within a short limit before the long checks, and list skipped URLs in the report. From [[axe-core-findings|finding 4]].
7. **Name tests after the rule and record every guess.** Write small fixtures, one per edge, named as sentences, for each heuristic (for example "an image with empty alt passes"). From [[axe-core-findings|finding 9]].
8. **Compute once, reuse many times.** Parse the page once and give each check the same parsed copy. From [[axe-core-pattern-compute-once-and-cache|the pattern]].

## What not to copy

- Tests on Node 6 to 24 and a custom Selenium launcher: axe is injected into unknown pages, a learning CLI is not (`.github/workflows/test.yml:245-264 @ e80f6b7`).
- The two-stage `runPartial` and `finishRun` route, with a replaceable message transport: it solves a hostile-iframe problem the CLI does not have (`doc/run-partial.md:3 @ e80f6b7`).
- The full colour-blending model: for the CLI, call axe itself and report its "incomplete" list instead (`lib/commons/color/get-background-color.js:66-109 @ e80f6b7`).

## My insights
