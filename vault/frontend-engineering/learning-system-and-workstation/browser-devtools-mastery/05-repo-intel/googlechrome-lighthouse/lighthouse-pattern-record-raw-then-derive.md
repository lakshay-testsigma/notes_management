---
title: "GoogleChrome/lighthouse — pattern: record raw, then derive"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, browser-devtools, repo-intel]
created: 2026-11-19
sources: [googlechrome-lighthouse-repo]
---

# Pattern: Record raw, then derive

## The problem

If a tool computes its answer while it watches the browser, a bug in the computation means you must run the page again. Page loads are slow and never exactly the same twice. You also cannot debug a result you cannot reproduce.

## What they do

Lighthouse saves raw material first and derives results later. The devtools-log gatherer stores protocol messages untouched, and `NetworkRecorder.recordsFromLogs` rebuilds the request list from them. The trace gatherer saves the trace. Audits read only these artifacts. The runner can save artifacts to disk (`-G`), load them without a browser (`-A`), or do both (`-GA`), and it refuses to mix artifacts with different settings. See [[Record and replay]].

## Evidence

- `core/gather/gatherers/devtools-log.js:9-10 @ 3b399f6` — the header says the log can recreate the network records.
- `core/lib/network-recorder.js:309-312 @ 3b399f6` — records are rebuilt from the log.
- `core/runner.js:206-209 @ 3b399f6`, `core/runner.js:227-231 @ 3b399f6` — gather and audit modes.
- `core/runner.js:333-344 @ 3b399f6` — a setting mismatch throws and names the key.
- `core/gather/gatherers/devtools-log.js:55-57 @ 3b399f6` — debug data returns the messages so they can be saved.

## When to use it, and when not to

Use it when the measuring step is slow, flaky, or needs a real browser, and the analysis step changes often. Skip the raw storage when the data is huge and the analysis is fixed; Lighthouse itself filters the log to four method families and picks trace categories by hand to keep size down (`core/gather/gatherers/devtools-log.js:27 @ 3b399f6`, `core/gather/gatherers/trace.js:22 @ 3b399f6`).

## Related

- [[Record and replay]] — the idea behind it
- [[Chrome DevTools Protocol]] — the source of the raw messages
- [[lighthouse-findings|Findings]]

## My insights
