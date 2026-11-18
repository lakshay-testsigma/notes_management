---
title: "GoogleChrome/lighthouse — module metrics-and-trace"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — module: metrics-and-trace

## Responsibility

This slice turns the two raw recordings of a page load into numbers. The trace is the Performance panel recording. The devtools log is the Network panel event stream. The code parses both once, then computes Largest Contentful Paint (LCP) and Total Blocking Time (TBT), and finally scores them in two audits. Scope: only the 13 files listed below, not the whole `core/computed` folder.

## Key files

| File | Role |
|------|------|
| `core/computed/computed-artifact.js` | Wraps a class with a caching `request()` method |
| `core/computed/network-records.js` | Devtools log to a list of network requests |
| `core/computed/processed-trace.js` | Raw trace to main-thread events, frames, timestamps |
| `core/computed/main-thread-tasks.js` | Processed trace to a list of main-thread tasks (the flame chart rows) |
| `core/computed/metrics/metric.js` | Base class: picks observed or simulated computation |
| `core/computed/metrics/navigation-metric.js` | Refuses to run outside a navigation |
| `core/computed/metrics/largest-contentful-paint.js` | LCP, observed or via Lantern |
| `core/computed/metrics/total-blocking-time.js` | TBT from long tasks |
| `core/computed/metrics/lantern-metric.js` | Inputs and error mapping for Lantern (the simulator) |
| `core/computed/metrics/lantern-largest-contentful-paint.js` | LCP predicted by simulation |
| `core/audits/metrics/largest-contentful-paint.js`, `core/audits/metrics/total-blocking-time.js` | Audits that score the metric |
| `core/test/computed/metrics/largest-contentful-paint-test.js` | Tests for LCP |

## How it works

An audit asks for a metric. The metric asks for parsed inputs. Each parsed input is computed once and cached.

1. The LCP audit gathers `Trace`, `DevtoolsLog`, `GatherContext` and more into one object and calls the computed LCP (`core/audits/metrics/largest-contentful-paint.js:73-83 @ 3b399f6`).
2. `makeComputedArtifact` checks the cache by the picked inputs. A hit returns the stored promise. A miss calls `compute_` and stores the promise (`core/computed/computed-artifact.js:51-76 @ 3b399f6`).
3. `Metric.compute_` loads the processed trace, the processed navigation (skipped in timespan mode) and the network records (`core/computed/metrics/metric.js:72-81 @ 3b399f6`).
4. It checks that the trace has top-level main-thread events (`core/computed/metrics/metric.js:83 @ 3b399f6`).
5. It switches on the throttling method. `simulate` goes to the simulated path. `provided` and `devtools` go to the observed path (`core/computed/metrics/metric.js:85-97 @ 3b399f6`).
6. Observed LCP reads the time the browser itself recorded and throws `NO_LCP` if none exists (`core/computed/metrics/largest-contentful-paint.js:35-45 @ 3b399f6`).
7. Simulated LCP calls the Lantern computed artifact (`core/computed/metrics/largest-contentful-paint.js:26-29 @ 3b399f6`). That one first computes First Contentful Paint (FCP), then builds a page dependency graph and a load simulator (`core/computed/metrics/lantern-largest-contentful-paint.js:29-32 @ 3b399f6`, `core/computed/metrics/lantern-metric.js:23-27 @ 3b399f6`).
8. The audit converts the milliseconds into a 0 to 1 score with a log-normal curve (`core/audits/metrics/largest-contentful-paint.js:86-95 @ 3b399f6`).

Main-thread tasks reuse the same cache: `MainThreadTasks` asks for `ProcessedTrace` instead of re-parsing (`core/computed/main-thread-tasks.js:18-20 @ 3b399f6`).

TBT counts only the part of each task beyond 50 ms. The audit comment gives the example: a 110 ms task adds 60 ms of blocking time (`core/audits/metrics/total-blocking-time.js:78-81 @ 3b399f6`). Observed TBT sums that between FCP and Time to Interactive when a navigation exists (`core/computed/metrics/total-blocking-time.js:48-59 @ 3b399f6`). With no navigation (timespan mode) it sums from 0 to the trace end (`core/computed/metrics/total-blocking-time.js:61-67 @ 3b399f6`).

## Beyond the textbook

### Computed artifacts: memoized promises keyed by their inputs

- Textbook version: each audit parses the trace itself.
- What they do: a wrapper caches the promise per artifact name, in a map that supports deep equality of the inputs. Two audits asking for the same thing share one computation, even while it is still running.
- Why: the trace is large, and many audits need `ProcessedTrace` and `NetworkRecords`. Timing of each computation is logged under `lh:computed:<name>`.
- Evidence: `core/computed/computed-artifact.js:58-65 @ 3b399f6`, `core/computed/computed-artifact.js:67-74 @ 3b399f6`

### Cache keys are an explicit allow-list, and a missing key is a bug

- Textbook version: use the whole argument object as the cache key.
- What they do: each artifact lists the keys that matter (LCP lists eight). Other properties are dropped. A key that is `undefined` throws in tests and only logs an error in production.
- Why: the comment says this guards against developer mistakes. Optional values must be `null`, not missing.
- Evidence: `core/computed/computed-artifact.js:17-21 @ 3b399f6`, `core/computed/computed-artifact.js:36-49 @ 3b399f6`, `core/computed/metrics/largest-contentful-paint.js:48-51 @ 3b399f6`

### Two ways to get one metric: observed and simulated

- Textbook version: read the metric from the browser.
- What they do: a base class forces each metric to define an observed method and a simulated method. Simulation (Lantern) predicts what a slow phone on a slow network would see from a fast run, using a dependency graph of requests and tasks.
- Why: the base-class comment states the contract. Simulation is only allowed on navigations, and an unknown throttling method throws.
- Evidence: `core/computed/metrics/metric.js:13-20 @ 3b399f6`, `core/computed/metrics/metric.js:87-96 @ 3b399f6`, `core/computed/metrics/lantern-metric.js:19-21 @ 3b399f6`

### Lantern gives a range, not a single number

- Textbook version: one predicted value.
- What they do: the simulated LCP result carries an optimistic and a pessimistic estimate, each with its own graph. The test checks the optimistic graph drops a non-blocking script and its API call, while the pessimistic graph keeps them.
- Why: the LCP cause may be unknown (the test name is "excludes unrelated non-blocking requests ... for image LCP"), so two bounds are modeled.
- Evidence: `core/test/computed/metrics/largest-contentful-paint-test.js:59 @ 3b399f6`, `core/test/computed/metrics/largest-contentful-paint-test.js:158-160 @ 3b399f6`

### Scoring curves come from real-world data

- Textbook version: fixed thresholds such as "good below 2.5 s".
- What they do: each audit has mobile and desktop control points (`p10`, `median`) chosen from HTTP Archive percentiles, then maps the value on a log-normal curve. TBT admits its coefficients are "semi-arbitrarily chosen" because the raw data gave "surprisingly harsh scoring".
- Why: scores reflect how the web at large performs, and are tuned by hand where the data is too harsh.
- Evidence: `core/audits/metrics/largest-contentful-paint.js:40-48 @ 3b399f6`, `core/audits/metrics/total-blocking-time.js:49-56 @ 3b399f6`

### Typed errors and an error adapter

- Textbook version: throw a generic error.
- What they do: a missing LCP raises a `LighthouseError` with a code. Errors from the Lantern library are translated into the same Lighthouse error codes, and unknown errors are rethrown.
- Why: the report can show a precise reason for a failed audit.
- Evidence: `core/computed/metrics/largest-contentful-paint.js:37-39 @ 3b399f6`, `core/computed/metrics/lantern-metric.js:59-69 @ 3b399f6`

### Migration switch through an environment variable

- Textbook version: one code path.
- What they do: Lantern can build its graph from the devtools log (default) or from the trace, chosen by `INTERNAL_LANTERN_USE_TRACE`. A TODO says the old path goes away at the next breaking change.
- Why: lets the team move from the Network event stream to trace-only data gradually.
- Evidence: `core/computed/metrics/lantern-metric.js:76-83 @ 3b399f6`

## Tests and what they protect

The LCP test runs three cases on a real recorded trace plus a synthetic one. The first case is the simulated value, snapshotted as optimistic, pessimistic and timing (`core/test/computed/metrics/largest-contentful-paint-test.js:21-41 @ 3b399f6`). The second is the observed value with `throttlingMethod: 'provided'` (`core/test/computed/metrics/largest-contentful-paint-test.js:43-56 @ 3b399f6`). The third builds a trace and devtools log from handmade requests with helpers, so one scenario (hero image LCP) is tested without a large fixture (`core/test/computed/metrics/largest-contentful-paint-test.js:113-125 @ 3b399f6`). Each test creates a fresh `computedCache` map, so tests do not share cached results (`core/test/computed/metrics/largest-contentful-paint-test.js:24 @ 3b399f6`). No test for TBT is in this slice.

## Error handling, performance, and security

- Missing inputs: `Metric.compute_` throws when trace, log or settings are absent (`core/computed/metrics/metric.js:67-70 @ 3b399f6`). A navigation-only metric throws in other modes (`core/computed/metrics/navigation-metric.js:37-40 @ 3b399f6`).
- Not applicable instead of failing: TBT returns `notApplicable` with score 1 for a simulated timespan (`core/audits/metrics/total-blocking-time.js:98-103 @ 3b399f6`).
- Performance: promise caching (above). Security: Not present in this slice.

## Technologies and services seen

- Chrome trace events and the devtools log (Chrome DevTools Protocol events) — the inputs (`core/computed/network-records.js:13-17 @ 3b399f6`, `core/computed/processed-trace.js:12-16 @ 3b399f6`).
- Lantern — Lighthouse's own simulator for throttled metrics (`core/computed/metrics/lantern-largest-contentful-paint.js:12 @ 3b399f6`).
- Trace engine — used when Lantern builds from the trace (`core/computed/metrics/lantern-metric.js:40 @ 3b399f6`).
- HTTP Archive via BigQuery — data source for scoring curves, named in comments (`core/audits/metrics/largest-contentful-paint.js:42 @ 3b399f6`).
- Desmos graphs — used to design curves, linked in comments (`core/audits/metrics/total-blocking-time.js:52 @ 3b399f6`).
- Mocha-style `describe/it` with Jest-style `expect` snapshots (`core/test/computed/metrics/largest-contentful-paint-test.js:17 @ 3b399f6`, `core/test/computed/metrics/largest-contentful-paint-test.js:34 @ 3b399f6`).
- ICU message strings for translated text (`core/audits/metrics/largest-contentful-paint.js:17 @ 3b399f6`).

## Worth exploring interactively

- From audit to score — steps: audit builds input (`core/audits/metrics/largest-contentful-paint.js:76-83 @ 3b399f6`), cache lookup (`core/computed/computed-artifact.js:62-65 @ 3b399f6`), parse trace and log (`core/computed/metrics/metric.js:72-77 @ 3b399f6`), choose observed or simulated (`core/computed/metrics/metric.js:85-97 @ 3b399f6`), score (`core/audits/metrics/largest-contentful-paint.js:87-90 @ 3b399f6`) — fits FlowAnimation because the learner sees a request move through each function and the cache answer a second call at once.
- TBT from tasks — steps: list top-level tasks (`core/computed/metrics/total-blocking-time.js:46 @ 3b399f6`), pick the FCP to Interactive window (`core/computed/metrics/total-blocking-time.js:49-51 @ 3b399f6`), sum the part of each task beyond 50 ms (`core/audits/metrics/total-blocking-time.js:78-81 @ 3b399f6`) — fits AlgorithmStepper because the learner would see each task bar get trimmed and the total grow.

## Open questions

- How `calculateSumOfBlockingTime` clips tasks at the window edges lives in `core/lib/lantern`, outside this slice.
- How `LHTraceProcessor` finds the main thread and LCP candidate is in the skipped tracehouse code.

## My insights
