---
title: "GoogleChrome/lighthouse — findings"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — findings

What this production codebase does beyond the textbook version of a page-speed tool, ranked by how much you gain from knowing it. Findings about traces, the network log and metrics rank above build hygiene.

## 1. Record first, judge later

- Textbook version: load the page and compute scores in one pass.
- What they do: gathering writes a trace and a devtools log. Audits read them later. `-G` saves artifacts, `-A` audits them with no browser.
- Why: you can re-audit the same recorded page, and replay a log in tests.
- Evidence: `core/runner.js:206-209 @ 3b399f6`, `core/runner.js:227-231 @ 3b399f6`, `core/gather/gatherers/devtools-log.js:9-10 @ 3b399f6`
- Borrow it when: your tool reads files from a user, like the capstone.
- More: [[lighthouse-module-gather-pipeline|gather-pipeline]], [[lighthouse-module-audits-and-scoring|audits-and-scoring]]

## 2. Parse the trace once and share it

- Textbook version: each check parses the trace itself.
- What they do: computed artifacts cache a promise per name and input keys, so two audits share one running computation. Cache keys are an allow-list, and a missing key is a bug.
- Why: the trace is large and many audits need the same parsed data.
- Evidence: `core/computed/computed-artifact.js:51-76 @ 3b399f6`, `core/computed/computed-artifact.js:36-49 @ 3b399f6`
- Borrow it when: several checks need the same expensive parse.
- More: [[lighthouse-pattern-memoized-computed-artifacts|memoized computed artifacts]], [[lighthouse-module-metrics-and-trace|metrics-and-trace]]

## 3. A failure becomes a result, not a crash

- Textbook version: an exception stops the program.
- What they do: a failing audit becomes an "error" result and the loop continues. A failed gatherer is logged and the next one runs. A failed page load keeps its trace as `TraceError`.
- Why: a report with one broken audit is still useful, and a failed run's trace can still be opened.
- Evidence: `core/runner.js:446-458 @ 3b399f6`, `core/gather/runner-helpers.js:122-128 @ 3b399f6`, `core/gather/navigation-runner.js:163-168 @ 3b399f6`
- Borrow it when: your tool processes many independent inputs.
- More: [[lighthouse-pattern-fail-soft-pipeline|fail-soft pipeline]], [[lighthouse-module-audits-and-scoring|audits-and-scoring]]

## 4. Scores come from real-world data, not fixed limits

- Textbook version: pass if the value is under a limit such as 2.5 s.
- What they do: each metric has two control points (`p10`, median) from HTTP Archive and maps the value on a log-normal curve. Seven score modes decide whether an audit counts. Informative, manual and not-applicable audits get weight 0.
- Why: scores say how the page compares with the web. TBT admits its numbers are "semi-arbitrarily chosen" because raw data was too harsh.
- Evidence: `core/audits/audit.js:89-108 @ 3b399f6`, `core/audits/metrics/total-blocking-time.js:49-56 @ 3b399f6`, `core/scoring.js:63-68 @ 3b399f6`
- Borrow it when: you need a score, and a budget alone says too little.
- More: [[lighthouse-pattern-data-fitted-scoring|data-fitted scoring]], [[lighthouse-module-metrics-and-trace|metrics-and-trace]]

## 5. Observed and simulated metrics, with a range

- Textbook version: read the metric from the browser.
- What they do: each metric defines an observed path and a simulated path. Simulation (Lantern) predicts a slow phone from a fast run and returns an optimistic and a pessimistic estimate.
- Why: the LCP cause may be unknown, so two bounds are modeled. Simulation is allowed only on navigations.
- Evidence: `core/computed/metrics/metric.js:85-97 @ 3b399f6`, `core/test/computed/metrics/largest-contentful-paint-test.js:158-160 @ 3b399f6`
- Borrow it when: you compare a lab number against a budget, and know which kind it is. See [[Lab and simulated metrics]].
- More: [[lighthouse-module-metrics-and-trace|metrics-and-trace]]

## 6. A hand-picked trace and a streamed read

- Textbook version: record every category and read the whole trace in one message.
- What they do: start with `-*` and add only needed categories. Read the trace in chunks with `IO.read`, parse each complete event as it arrives, and close the handle in `finally`.
- Why: "we'll be selective to minimize trace size". A multi-byte character can split across chunks.
- Evidence: `core/gather/gatherers/trace.js:22-24 @ 3b399f6`, `core/gather/gatherers/trace.js:86-109 @ 3b399f6`
- Borrow it when: you read a large trace or HAR file.
- More: [[lighthouse-module-gather-pipeline|gather-pipeline]]

## 7. Network records are rebuilt from a log, and redirects are linked

- Textbook version: one request per URL.
- What they do: Chrome reuses one `requestId` across a redirect. The recorder makes a new `<id>:redirect` record and links source and destination. Initiator choice returns an answer only when it is unambiguous.
- Why: network-idle detection must not fire between two hops.
- Evidence: `core/lib/network-recorder.js:94-113 @ 3b399f6`, `core/lib/network-recorder.js:259-301 @ 3b399f6`
- Borrow it when: you build a waterfall or count requests from raw events.
- More: [[lighthouse-module-gather-pipeline|gather-pipeline]]

## 8. Estimated savings are re-simulated

- Textbook version: wasted bytes divided by bandwidth.
- What they do: simulate the load graph before and after shrinking each request, round savings to 10 ms, restore the sizes, and take the larger of two estimates for LCP.
- Evidence: `core/audits/byte-efficiency/byte-efficiency-audit.js:101-146 @ 3b399f6`, `core/audits/byte-efficiency/byte-efficiency-audit.js:170-203 @ 3b399f6`
- Why: the graph "can underestimate" LCP savings.
- Borrow it when: you rank issues by gain. Rank by simulated time, not by bytes.
- More: [[lighthouse-module-audits-and-scoring|audits-and-scoring]]

## 9. One engine, many delivery targets

- Textbook version: one build, one artifact.
- What they do: esbuild bundles per target and removes what the host already has: locales, report assets, `third-party-web`, Puppeteer and Sentry. Plugin audits are listed by hand because a bundler cannot see dynamic names.
- Why: DevTools "provides its own copy"; the saving is "40+ KB".
- Evidence: `build/build-bundle.js:114-129 @ 3b399f6`, `build/build-bundle.js:86-92 @ 3b399f6`
- Borrow it when: one library serves a CLI and a browser tool.
- More: [[lighthouse-module-build-and-infra|build-and-infra]]

## 10. CI proves generated files are committed, and tests real DevTools

- Textbook version: run tests; pass or fail.
- What they do: `git diff --cached --exit-code` fails if the build changed any file, a golden sample report is diffed, and a job builds the real DevTools frontend with this Lighthouse inside. Actions are pinned by hash and npm publish uses provenance.
- Why: a stale generated file must not merge.
- Evidence: `.github/workflows/ci.yml:83-84 @ 3b399f6`, `.github/workflows/devtools.yml:41-64 @ 3b399f6`, `.github/workflows/publish.yml:64-71 @ 3b399f6`, `package.json:88 @ 3b399f6`
- Borrow it when: your repo has generated output or golden files.
- More: [[lighthouse-module-build-and-infra|build-and-infra]]

## My insights
