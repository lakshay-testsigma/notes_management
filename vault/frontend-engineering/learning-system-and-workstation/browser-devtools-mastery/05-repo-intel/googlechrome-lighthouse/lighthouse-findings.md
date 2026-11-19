---
title: "GoogleChrome/lighthouse — findings"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — findings

Each finding shows what this codebase does beyond the textbook version of "load a page and measure it". They are ranked by how much a beginner gains. All lines are from commit `3b399f6`.

## 1. Save raw protocol messages, rebuild the requests later

- Textbook version: keep a list of requests as `Network.*` events arrive.
- What they do: the gatherer stores raw messages untouched, filtered to four method families. A separate function replays them into request records.
- Why: the file header says the log can recreate the network records. You can then debug or re-run audits offline.
- Evidence: `core/gather/gatherers/devtools-log.js:9-10 @ 3b399f6`, `core/gather/gatherers/devtools-log.js:27 @ 3b399f6`, `core/lib/network-recorder.js:309-312 @ 3b399f6`
- Borrow it when: your capstone needs to test its network analysis without a live browser.
- More: [[lighthouse-module-gatherers-and-artifacts|gatherers-and-artifacts]], [[lighthouse-pattern-record-raw-then-derive|record raw, then derive]]

## 2. "Loaded" has several definitions, and every wait has a limit

- Textbook version: wait for the load event.
- What they do: the network monitor has three idle states. They are zero requests, two or fewer, and only critical root-frame requests that ignore sockets. The wait combines them, adds a maximum timeout, and sends a ping to tell a hung page from a slow one. Each command also races a 30 s timer and a crash signal.
- Why: analytics pixels and open sockets mean the network is never fully idle; a crash would otherwise show as "Target closed".
- Evidence: `core/gather/driver/network-monitor.js:147-161 @ 3b399f6`, `core/gather/driver/wait-for-condition.js:497-527 @ 3b399f6`, `core/gather/session.js:126-134 @ 3b399f6`
- Borrow it when: you write the "load the URL" step of any browser tool.
- More: [[lighthouse-module-cdp-session-and-navigation|cdp-session-and-navigation]], [[lighthouse-pattern-layered-timeouts-and-settling|layered timeouts]]

## 3. A hand-picked trace, streamed and parsed in pieces

- Textbook version: start tracing with default categories and call `JSON.parse` on the whole result.
- What they do: `-*` removes defaults, each needed category is added with a reason, sampling is raised to 10000, and the trace is read in chunks from a stream. After each chunk they split at the last event separator.
- Why: the comment says the team is selective to keep the trace small; the separator is a safe split point. The export writes one event per line.
- Evidence: `core/gather/gatherers/trace.js:20-23 @ 3b399f6`, `core/gather/gatherers/trace.js:94-105 @ 3b399f6`, `core/gather/gatherers/trace.js:158 @ 3b399f6`
- Borrow it when: you capture a Performance trace for layout shifts or long tasks.
- More: [[lighthouse-module-gatherers-and-artifacts|gatherers-and-artifacts]]

## 4. One failure never erases the other results

- Textbook version: the first exception stops the program.
- What they do: a page load error keeps the log and trace as evidence. A gatherer error becomes an `Error` in its artifact slot. An audit error becomes a null score. A null score makes the whole category null.
- Why: a run is slow, and a broken gatherer should not erase over 100 other results; a partial average would look trustworthy but not be.
- Evidence: `core/gather/navigation-runner.js:95-108 @ 3b399f6`, `core/gather/runner-helpers.js:170-173 @ 3b399f6`, `core/runner.js:392-420 @ 3b399f6`, `core/scoring.js:22-42 @ 3b399f6`
- Borrow it when: your report has several independent sections (network, vitals, console, heap).
- More: [[lighthouse-module-audit-scoring-and-runner|audit-scoring-and-runner]], [[lighthouse-pattern-keep-evidence-on-failure|keep evidence on failure]]

## 5. Scores come from real-world data, not fixed thresholds

- Textbook version: "LCP under 2.5 s is good", a pass or fail rule.
- What they do: a log-normal curve through two points (p10 and median) taken from real-site percentiles, with separate mobile and desktop numbers. Weights are explicit: LCP 25, TBT 30, CLS 25, with many audits at weight 0.
- Why: comments say the points are percentiles of real sites. For TBT the raw points gave "surprisingly harsh scoring", so the team chose softer values.
- Evidence: `core/audits/audit.js:89-109 @ 3b399f6`, `core/audits/metrics/largest-contentful-paint.js:38-64 @ 3b399f6`, `core/config/default-config.js:419-424 @ 3b399f6`
- Borrow it when: you want one health number. Otherwise report raw values with a simple good, needs work, poor label.
- More: [[lighthouse-module-audit-scoring-and-runner|audit-scoring-and-runner]]

## 6. CLS follows the field rules and works around Chrome bugs

- Textbook version: add up every layout shift.
- What they do: skip shifts that follow user input, except the first events that Lighthouse's own emulation mislabels. Group shifts into sessions (1 s gap, 5 s cap) and take the largest. Split each score across the shifted elements. Run a second engine in the background and report differences.
- Why: comments cite Chromium issues 1094974 and 1302667. Tests compare the second engine. In production a difference goes to Sentry.
- Evidence: `core/computed/metrics/cumulative-layout-shift.js:29-45 @ 3b399f6`, `core/computed/metrics/cumulative-layout-shift.js:130-146 @ 3b399f6`, `core/computed/metrics/cumulative-layout-shift.js:204-231 @ 3b399f6`
- Borrow it when: you compute CLS from `LayoutShift` trace events.
- More: [[lighthouse-module-metrics-lcp-tbt-cls|metrics-lcp-tbt-cls]]

## 7. Measured or predicted: the setting picks the path

- Textbook version: report what the browser measured.
- What they do: with `simulate` throttling, a model predicts the metric for a slower device. With `provided` or `devtools`, the code reads it from the trace. A timespan run marks TBT not applicable instead of guessing.
- Why: the base class exists to choose the right method from the throttling setting.
- Evidence: `core/computed/metrics/metric.js:85-97 @ 3b399f6`, `core/audits/metrics/total-blocking-time.js:98-103 @ 3b399f6`
- Borrow it when: you compare runs from different machines. Label which kind each number is.
- More: [[lighthouse-module-metrics-lcp-tbt-cls|metrics-lcp-tbt-cls]], [[Observed versus simulated metrics]]

## 8. Follow iframes and workers, not only the page

- Textbook version: listen to the one page session.
- What they do: attach to every page, iframe and worker. Deduplicate by target id and tag each event with its session. Attach again after a main-frame navigation. New targets start paused and are always resumed in a `finally` block.
- Why: the run must count iframe requests, and a paused target would block the page.
- Evidence: `core/gather/driver/target-manager.js:100-104 @ 3b399f6`, `core/gather/driver/target-manager.js:184-187 @ 3b399f6`, `core/gather/driver/target-manager.js:223-228 @ 3b399f6`
- Borrow it when: your page health report must include third-party iframe traffic.
- More: [[lighthouse-module-cdp-session-and-navigation|cdp-session-and-navigation]]

## 9. Control the starting state

- Textbook version: just load the URL.
- What they do: visit a blank page first with the monitor off. Clear storage and caches, dismiss dialogs, and cache native APIs. Re-enable skip-pauses after each navigation.
- Why: repeatable scores; comments cite the reasons.
- Evidence: `core/gather/navigation-runner.js:50-59 @ 3b399f6`, `core/gather/driver/prepare.js:94-108 @ 3b399f6`, `core/gather/driver/prepare.js:31-39 @ 3b399f6`
- Borrow it when: you compare two runs of the same URL.
- More: [[lighthouse-module-cdp-session-and-navigation|cdp-session-and-navigation]]

## 10. Refuse to guess which request started which, and re-link redirects

- Textbook version: trust the initiator URL; look up a request by id.
- What they do: a redirect reuses the same request id, so the recorder renames it `<id>:redirect` and links source and destination. The code sets an initiator only when exactly one candidate remains.
- Why: the comment says "Only return an initiator if the result is unambiguous."
- Evidence: `core/lib/network-recorder.js:94-113 @ 3b399f6`, `core/lib/network-recorder.js:250-302 @ 3b399f6`
- Borrow it when: you build a request list with redirect chains.
- More: [[lighthouse-module-gatherers-and-artifacts|gatherers-and-artifacts]], [[lighthouse-pattern-declare-inputs-explicitly|declare inputs explicitly]]

## My insights
