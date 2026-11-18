---
title: "dequelabs/axe-core — module a11y-tests"
topic: frontend-engineering/learning-system-and-workstation/browser-extension-toolkit
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [dequelabs-axe-core-repo]
---

# dequelabs/axe-core — module: a11y-tests

## Responsibility

This slice is two test files. They show what the axe-core team decided to protect. One file tests the public `axe.run()` entry point: its arguments, errors, options and iframes. The other tests the `region` check, which says whether page content sits inside a landmark. The source files under test were not in this slice, so this note covers tests only.

## Key files

| File | Role |
|------|------|
| `test/core/public/run.js` | Tests `axe.run()`: parameters, callbacks, promises, reporters, xpath, paths, iframes |
| `test/checks/navigation/region.js` | Tests the `region` check with about 60 small HTML cases |

## How it works

1. Each `axe.run` test loads a tiny fake audit with one rule and one check, so the engine is tested without the real rules (`test/core/public/run.js:7-26 @ e80f6b7`).
2. After every test the fixture is cleared and the audit and the "running" flag are reset (`test/core/public/run.js:28-33 @ e80f6b7`).
3. Many tests replace `axe._runRules` with a stub and only assert what `axe.run` passed to it, for example the default context is `document` (`test/core/public/run.js:50-57 @ e80f6b7`).
4. Region tests build a check context and fetch the check function by id (`test/checks/navigation/region.js:13-15 @ e80f6b7`). Each test sets up HTML, calls the check, and asserts `true`, `false` (`test/checks/navigation/region.js:23-29 @ e80f6b7`).
5. The `afterEach` clears the fixture, resets the mock context and calls `axe.reset()` so configuration does not leak between tests (`test/checks/navigation/region.js:17-21 @ e80f6b7`).

## Beyond the textbook

### Test the error paths of the public API

- Textbook version: test that `run` returns results.
- What they do: test a second `run` while one is active (error "Axe is already running"), errors sent to the first callback argument, and a callback that throws must not be called twice.
- Why: a scan can be started from many tools at once; the team pins the failure behavior. The test names state the rule.
- Evidence: `test/core/public/run.js:131-137 @ e80f6b7`, `test/core/public/run.js:140-158 @ e80f6b7`, `test/core/public/run.js:173-193 @ e80f6b7`

### Cleanup runs before the callback, in both styles

- Textbook version: callback style only.
- What they do: the same "is called after cleanup" test exists for the callback and the promise API. Reporter errors, sync or async, must reach the caller.
- Why: the test comment says cleanup must be called first, so the page is clean when user code runs.
- Evidence: `test/core/public/run.js:195-209 @ e80f6b7`, `test/core/public/run.js:290-307 @ e80f6b7`, `test/core/public/run.js:211-231 @ e80f6b7`

### The options object is never changed

- Textbook version: not tested.
- What they do: assert that passing `{}` leaves it `{}` after the run, and that unknown context shapes (`include`, `exclude`, `fromFrames`, `fromShadowDom`) are told apart from options.
- Why: callers reuse option objects across runs.
- Evidence: `test/core/public/run.js:67-73 @ e80f6b7`, `test/core/public/run.js:83-123 @ e80f6b7`

### Hostile iframes are a test case

- Textbook version: scan one page.
- What they do: scan a page with an iframe, with `iframes: false`, and with frames that echo unexpected messages (axe and non-axe). The scan must finish without error.
- Why: axe talks to frames by `postMessage`, so stray messages from page code must be ignored.
- Evidence: `test/core/public/run.js:477-510 @ e80f6b7`, `test/core/public/run.js:533-568 @ e80f6b7`

### Checks are specified by many tiny HTML cases

- Textbook version: one pass and one fail case.
- What they do: each rule edge has a test named like a sentence. Examples: an image with `alt=""` outside a landmark passes, but a focusable one fails; a skip link to `#mainheader` passes but `something.html#mainheader` fails; live regions (`aria-live` polite or assertive, `role=alert`) count as regions, `aria-live="off"` does not.
- Why: automated rules must guess intent. These cases record the guesses (decorative image, skip link, unlabeled form is not a landmark).
- Evidence: `test/checks/navigation/region.js:60-94 @ e80f6b7`, `test/checks/navigation/region.js:156-186 @ e80f6b7`, `test/checks/navigation/region.js:315-334 @ e80f6b7`, `test/checks/navigation/region.js:253-305 @ e80f6b7`

### Fixture needs a landmark, or the answer is wrong

- What they do: a file comment warns that the check returns the top-most node outside a region, so every fixture needs a `role="main"` node; otherwise `#fixture` itself is reported.
- Why: this shows how the check picks the element to report. A test asserts the outermost element is the error.
- Evidence: `test/checks/navigation/region.js:1-6 @ e80f6b7`, `test/checks/navigation/region.js:395-401 @ e80f6b7`

### Configurable and extensible

- What they do: tests add a new landmark role through `axe.configure({standards: ...})` and pass `options.regionMatcher` to treat chosen elements as regions.
- Why: sites have custom needs; the check must follow data, not hard-coded lists.
- Evidence: `test/checks/navigation/region.js:31-46 @ e80f6b7`, `test/checks/navigation/region.js:403-416 @ e80f6b7`

### Shadow DOM and custom elements

- What they do: test content in open shadow roots, slotted content, skip links across a shadow boundary, and ARIA live set through `elementInternals` on a test element.
- Why: modern pages use web components; the check must see through them.
- Evidence: `test/checks/navigation/region.js:427-483 @ e80f6b7`, `test/checks/navigation/region.js:485-493 @ e80f6b7`

## Tests and what they protect

- `run.js`: argument handling, error and promise behavior, the three result options (reporter, `xpath`, `absolutePaths`) (`test/core/public/run.js:310-442 @ e80f6b7`), and iframe inclusion and exclusion.
- `region.js`: the false-positive limits of landmark detection. Hidden content, scripts, empty elements, wrappers around the main region and buttons (menu skip links) must pass (`test/checks/navigation/region.js:132-154 @ e80f6b7`, `test/checks/navigation/region.js:188-194 @ e80f6b7`, `test/checks/navigation/region.js:418-425 @ e80f6b7`).
- What automation cannot decide: whether an image is truly decorative or a skip link is real is encoded as a rule of thumb, not known. A reader should treat these as heuristics.

## Error handling, performance, and security

- Error handling: errors travel as the first callback argument or a promise rejection, and a throwing callback is logged, not re-run (`test/core/public/run.js:173-193 @ e80f6b7`).
- Performance: one test checks the run still works with `performanceTimer: true` (`test/core/public/run.js:75-81 @ e80f6b7`).
- Security: unexpected `postMessage` traffic from frames is tolerated (`test/core/public/run.js:533-568 @ e80f6b7`). The mock frame files themselves were not read.

## Technologies and services seen

- Mocha-style `describe` and `it` with Chai `assert` (`test/core/public/run.js:1-5 @ e80f6b7`). The runner itself is set in another slice.
- Sinon stub for the logger (`test/core/public/run.js:179-180 @ e80f6b7`).
- `axe.testUtils` helpers: `checkSetup`, `fixtureSetup`, `getCheckEvaluate`, `MockCheckContext`, `html`, `captureError` (`test/checks/navigation/region.js:8-15 @ e80f6b7`, `test/core/public/run.js:5 @ e80f6b7`).
- Real browser DOM APIs: iframes, `attachShadow`, `<slot>` (`test/checks/navigation/region.js:427-452 @ e80f6b7`). No external services.

## Worth exploring interactively

- One `axe.run` call guarded by tests — steps: set the running flag and reject a second call (`test/core/public/run.js:131-137 @ e80f6b7`); pass context and options to `_runRules` (`test/core/public/run.js:50-65 @ e80f6b7`); cleanup then callback or promise (`test/core/public/run.js:195-209 @ e80f6b7`); errors to first argument (`test/core/public/run.js:140-158 @ e80f6b7`). Fits StateMachine (idle, running, cleaned, done or error).
- The `region` decision — steps: content inside `role=main` passes (`test/checks/navigation/region.js:23-29 @ e80f6b7`); skip link passes (`test/checks/navigation/region.js:156-162 @ e80f6b7`); decorative image passes, focusable one fails (`test/checks/navigation/region.js:60-94 @ e80f6b7`); plain text outside fails (`test/checks/navigation/region.js:172-178 @ e80f6b7`). Fits FlowAnimation as an element moves through each gate.

## Open questions

- How `axe._runRules` sets the running flag; the source is in the engine-run note.
- The region check source and how it picks the outermost node.

## My insights
