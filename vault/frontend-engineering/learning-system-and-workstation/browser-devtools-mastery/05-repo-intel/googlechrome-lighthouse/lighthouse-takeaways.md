---
title: "GoogleChrome/lighthouse — takeaways"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [googlechrome-lighthouse-repo]
---

# GoogleChrome/lighthouse — takeaways for the capstone

The capstone is the "perf-triage CLI": one Node.js CLI reads a HAR file, a Performance trace and a Lighthouse JSON report, checks them against budgets and writes a ranked triage report. These are the things worth borrowing.

1. **Separate reading from judging.** Parse each file into plain data first and run budget checks on that data, so you can re-run checks without re-parsing. From [[lighthouse-findings|finding 1]].
2. **Parse each input once and cache it.** Several budget checks will need the same parsed trace; share one cached result. From [[lighthouse-pattern-memoized-computed-artifacts|the memoization pattern]].
3. **Turn a failure into a result row.** If the trace is broken, report "trace unreadable" and still triage the HAR and the Lighthouse file. From [[lighthouse-pattern-fail-soft-pipeline|the fail-soft pattern]].
4. **Read large files in streams.** Chrome traces can be big, so read in chunks and parse whole events as they arrive. From [[lighthouse-findings|finding 6]].
5. **Give each check a mode, and let some checks not count.** Use pass, fail, informative and not-applicable, and weight informative checks 0, as Lighthouse does. From [[lighthouse-pattern-data-fitted-scoring|the scoring pattern]].
6. **Label every number as lab or simulated.** A Lighthouse JSON report holds both kinds, so say which one a budget was checked against. From [[lighthouse-findings|finding 5]].
7. **Rank issues by time gain, not bytes.** Order triage rows by estimated milliseconds saved, with bytes as a tiebreaker. From [[lighthouse-findings|finding 8]].
8. **Test the CLI with a golden report.** Keep one sample input and one expected output, and fail the test when they differ. From [[lighthouse-findings|finding 10]].

## What not to copy

- The Lantern simulator and the hand-built bundle per target. They serve a tool that ships into DevTools; the capstone reads files and needs neither.
- Seven score modes and log-normal curves tuned on HTTP Archive. A budget with pass or fail and a ranking is enough to learn the idea.
- The five-workflow CI with hash-pinned actions. Keep one workflow and the "no changed files" check.

## My insights
