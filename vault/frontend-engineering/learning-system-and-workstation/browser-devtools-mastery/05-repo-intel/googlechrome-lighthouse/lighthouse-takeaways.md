---
title: "GoogleChrome/lighthouse — takeaways"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — takeaways for the capstone

The capstone is "Page health inspector": one command loads a URL in headless Chrome over the DevTools Protocol and reports network timing, Core Web Vitals, console errors and heap growth, with tests. These are the things worth borrowing.

1. **Split the tool into three layers: drive Chrome, collect raw data, analyze.** Only the first layer talks to Chrome; the analysis functions take plain data, so your tests need no browser. From [[lighthouse-findings|finding 1]] and [[lighthouse-pattern-record-raw-then-derive|record raw, then derive]].
2. **Save the raw CDP events as a JSON file, and build the report from that file.** Keep only `Network.`, `Page.`, `Runtime.` and `Target.` messages, as Lighthouse does, and add a flag that analyzes a saved file with no browser. Then write your network-timing tests on a small hand-made log. From [[lighthouse-findings|finding 1]].
3. **Write your own wrapper for one CDP command with a timeout and a crash check.** Race the reply against a timer, and fail with a clear error if the tab crashes. Test it with fake timers, as `session-test.js` does. From [[lighthouse-findings|finding 2]] and [[lighthouse-pattern-layered-timeouts-and-settling|layered timeouts]].
4. **Define "loaded" on purpose.** Choose a rule such as "load event fired and at most two requests in flight for 500 ms", add a hard maximum wait, and on timeout send a tiny evaluate to tell a hung page from a slow one. Report which case happened. From [[lighthouse-findings|finding 2]].
5. **Make each report section fail on its own.** If heap sampling breaks, print the network and vitals sections and mark heap as "could not measure", never as zero. On a page load error, save the log and trace. From [[lighthouse-findings|finding 4]] and [[lighthouse-pattern-keep-evidence-on-failure|keep evidence on failure]].
6. **Compute Core Web Vitals from trace events, and write the rules in comments.** For CLS, group `LayoutShift` events into sessions (1 s gap, 5 s cap) and take the largest. Test the gap and cap rules with hand-built events. For LCP, throw a named error when the trace has none. From [[lighthouse-findings|finding 6]] and [[lighthouse-findings|finding 3]].
7. **Start every run from the same state.** Open a blank page first, clear cache and storage, and set one fixed throttling profile. Print which settings were used in the report. From [[lighthouse-findings|finding 9]] and [[lighthouse-findings|finding 7]].
8. **Count redirects and iframes in the network section.** Handle a repeated request id as a redirect, and attach to iframe targets if you want their requests. From [[lighthouse-findings|finding 10]] and [[lighthouse-findings|finding 8]].

## What not to copy

- The full score model (log-normal curves, weights, seven display modes). Report raw values with a plain good, needs work, poor label instead (`core/audits/audit.js:89-109 @ 3b399f6`).
- Lantern simulation and the shadow-run of a second CLS engine. They exist because Lighthouse predicts slower devices at scale (`core/computed/metrics/metric.js:85-97 @ 3b399f6`).
- Recursive auto-attach to workers, and the cache keyed by declared inputs. Add them only if your inspector needs worker traffic or repeated computation (`core/gather/driver/target-manager.js:100-104 @ 3b399f6`, `core/computed/computed-artifact.js:36-49 @ 3b399f6`).

## My insights
