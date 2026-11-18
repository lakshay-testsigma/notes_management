---
title: "dequelabs/axe-core — findings"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — findings

What this production codebase does beyond the textbook version of an automated accessibility check, ranked by how much you gain from knowing it.

## 1. A check can answer "I cannot tell"

- Textbook version: every check returns pass or fail.
- What they do: a check may return `undefined`. A rule marked `reviewOnFail` turns every failure into `undefined`. Contrast, heading order and region checks all use this third value, and it is reported as "incomplete".
- Why: a machine cannot judge some cases, and a false violation costs more trust than a missed one. This is the line between "violation" and "needs review", and it is why automation finds only part of the WCAG issues (`README.md:19 @ e80f6b7`).
- Evidence: `lib/core/base/rule.js:272-287 @ e80f6b7`, `lib/checks/color/color-contrast.json:35-52 @ e80f6b7`, `lib/checks/navigation/heading-order-after.js:42-45 @ e80f6b7`
- Borrow it when: your tool reports a verdict on something it cannot fully see, such as an SEO or header check on a page behind a login.
- More: [[axe-core-module-engine-run|engine-run]], [[axe-core-module-color-contrast|color-contrast]], [[axe-core-pattern-three-valued-results|pattern]]

## 2. Contrast is computed the way the browser paints, and it stays conservative

- Textbook version: read `background-color`, compute the ratio, compare with 4.5.
- What they do: walk the stack of elements under the text, blend layers bottom up, include text shadow, stroke and opacity, then round the ratio down so 4.499 never shows as a pass. A background image, an overlap, a one-character text or an empty field becomes incomplete and not a failure. Each reason has its own message key.
- Why: the code comments cite blend-order bugs and the W3C backdrop rule. The messages say a single character may not be real text and an empty field may change colour when typed in.
- Evidence: `lib/commons/color/get-background-color.js:66-109 @ e80f6b7`, `lib/checks/color/color-contrast-evaluate.js:120-122 @ e80f6b7`, `lib/checks/color/color-contrast-evaluate.js:144-154 @ e80f6b7`, `lib/commons/color/get-foreground-color.js:107-150 @ e80f6b7`
- Borrow it when: you report a number near a threshold. Round in the safe direction and say why you could not decide.
- More: [[axe-core-module-color-contrast|color-contrast]], [[axe-core-pattern-three-valued-results|pattern]]

## 3. Structure rules check in two phases

- Textbook version: test each element on its own.
- What they do: `evaluate` runs per element and records data. `after` runs once and sees every result, including results from other iframes, in page order. Heading order compares each heading with the previous one across frames. Landmark uniqueness reports only the first of each duplicate group.
- Why: the correct answer for one heading depends on others, so a per-element test cannot decide. The `after` step also keeps reports short.
- Evidence: `lib/checks/navigation/heading-order-after.js:54-64 @ e80f6b7`, `lib/checks/navigation/heading-order-after.js:84-90 @ e80f6b7`, `lib/checks/landmarks/landmark-is-unique-after.js:4-24 @ e80f6b7`
- Borrow it when: a rule compares items to each other, for example duplicate titles across several release pages.
- More: [[axe-core-module-headings-landmarks-rules|headings-landmarks-rules]], [[axe-core-pattern-compute-once-and-cache|pattern]]

## 4. One scan can cross iframes, and a dead frame does not kill it

- Textbook version: scan one document; one failed request fails the call.
- What they do: the parent sends a 500 ms ping, then the real request with a 60 s limit. A frame with no axe or no ping reply resolves to `null` and is left out. Only a started frame that times out rejects. Messages must parse, carry the right source, come from an allowed origin and have a new id.
- Why: a page with one dead ad frame should still get a report, and other scripts share the same `message` event, so axe must ignore what is not meant for it.
- Evidence: `lib/core/utils/send-command-to-frame.js:14-18 @ e80f6b7`, `lib/core/utils/send-command-to-frame.js:40-55 @ e80f6b7`, `lib/core/utils/frame-messenger/message-handler.js:30-32 @ e80f6b7`, `lib/core/utils/frame-messenger/message-parser.js:97-109 @ e80f6b7`
- Borrow it when: one step of a batch can hang. Probe cheaply first, and let a failed target be skipped and reported.
- More: [[axe-core-module-frame-messaging|frame-messaging]]

## 5. The transport is replaceable, with a two-stage route for hostile places

- Textbook version: call `window.postMessage` directly.
- What they do: `axe.frameMessenger({open, post})` swaps the channel. `runPartial` and `finishRun` let each frame scan alone and a trusted place merge the plain-data results. The docs warn to run `finishRun` only where no third-party scripts exist.
- Why: the docs say messaging can disturb the page, and is sometimes "not possible or not secure". A browser extension is such a place.
- Evidence: `lib/core/utils/respondable.js:65-85 @ e80f6b7`, `doc/frame-messenger.md:3-5 @ e80f6b7`, `lib/core/public/finish-run.js:19-25 @ e80f6b7`, `doc/run-partial.md:3 @ e80f6b7`
- Borrow it when: your tool runs inside someone else's page. Keep the data flow explicit, and merge in the place you trust.
- More: [[axe-core-module-frame-messaging|frame-messaging]]

## 6. Every exit path resets the state

- Textbook version: set a flag, work, clear the flag at the end.
- What they do: the "running" flag and `teardown()` are reset on success, rejection, reporter failure and the error path. A second `run()` while one is active fails with a clear message. The tests pin this, including "cleanup is called before the callback".
- Why: a thrown rule must not leave the engine stuck in a long-lived page, such as an extension panel.
- Evidence: `lib/core/public/run.js:25-30 @ e80f6b7`, `lib/core/public/run.js:48-49 @ e80f6b7`, `lib/core/public/run-rules.js:84-90 @ e80f6b7`, `test/core/public/run.js:195-209 @ e80f6b7`
- Borrow it when: a CLI or service keeps state between runs.
- More: [[axe-core-module-engine-run|engine-run]], [[axe-core-module-a11y-tests|a11y-tests]], [[axe-core-pattern-cleanup-on-every-exit|pattern]]

## 7. Errors name the rule, the check and the element

- Textbook version: let the exception bubble up.
- What they do: a failing `evaluate` becomes a `RuleError` with rule id, method name and a serialized element. Argument errors are `TypeError`. With a callback the error goes to the first argument. A throwing user callback is logged, not re-run.
- Why: with about a hundred rules, "undefined is not a function" alone is useless.
- Evidence: `lib/core/base/rule.js:184-192 @ e80f6b7`, `lib/core/base/check.js:109-113 @ e80f6b7`, `lib/core/public/run/normalize-run-params.js:11 @ e80f6b7`, `test/core/public/run.js:173-193 @ e80f6b7`
- Borrow it when: one tool runs many small checks. Tag each error with the check and the target.
- More: [[axe-core-module-engine-run|engine-run]]

## 8. Rules are JSON data; checks are reusable functions with options

- Textbook version: one function per rule.
- What they do: a rule file lists a selector, tags and check ids. `page-has-main` and `page-has-heading-one` share one function with different selectors. Rule selection has a strict order: page-level guard, `runOnly` rules, per-rule `enabled`, `runOnly` tags, default excludes. The build validates all rule and check files first.
- Why: new rules need only a data file, and users tune behaviour with options.
- Evidence: `lib/checks/keyboard/page-has-main.json:3-8 @ e80f6b7`, `lib/core/utils/rule-should-run.js:57-80 @ e80f6b7`, `build/run-build/full-build.mjs:36-42 @ e80f6b7`
- Borrow it when: you expect to add many checks. Keep the policy as data and validate it before use.
- More: [[axe-core-module-headings-landmarks-rules|headings-landmarks-rules]], [[axe-core-pattern-rules-as-data|pattern]]

## 9. Tests record heuristics, hostile cases and old runtimes

- Textbook version: one pass case and one fail case per rule.
- What they do: many tiny HTML cases with sentence names encode guesses, such as a decorative image, a skip link, or a live region. Other tests scan frames that echo unexpected messages. The built file is tested on Node 6 to 24, and unit tests run in real Chrome and Firefox.
- Why: automated rules must guess intent, so the tests are the written record of each guess. Real browsers give real layout and styles (my inference; the config does not say so).
- Evidence: `test/checks/navigation/region.js:60-94 @ e80f6b7`, `test/core/public/run.js:533-568 @ e80f6b7`, `.github/workflows/test.yml:245-264 @ e80f6b7`, `.github/workflows/test.yml:77-120 @ e80f6b7`
- Borrow it when: your check is a heuristic. Name each test as the rule it protects.
- More: [[axe-core-module-a11y-tests|a11y-tests]], [[axe-core-module-build-and-infra|build-and-infra]]

## 10. Build once, test the shipped file, guard the supply chain

- Textbook version: each job builds for itself; install everything and trust it.
- What they do: one job builds `axe.js` and uploads it; later jobs download that file. The injected script has a size and import budget that fails the build. Install scripts are allowlisted, test corpora are pinned to commits, actions are pinned to SHAs, and releases go through a reviewed pull request.
- Why: the library is embedded in other products. A script injected by extensions must stay small.
- Evidence: `.github/workflows/test.yml:60-75 @ e80f6b7`, `build/run-build/esbuild-core.mjs:26-40 @ e80f6b7`, `pnpm-workspace.yaml:3-12 @ e80f6b7`, `.github/workflows/release.yml:24-47 @ e80f6b7`
- Borrow it when: your project ships a file others run. Test that exact file.
- More: [[axe-core-module-build-and-infra|build-and-infra]]

## My insights
