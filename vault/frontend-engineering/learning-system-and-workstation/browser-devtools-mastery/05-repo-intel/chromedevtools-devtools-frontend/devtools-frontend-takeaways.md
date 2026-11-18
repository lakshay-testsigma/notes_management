---
title: "ChromeDevTools/devtools-frontend — takeaways"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-18
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — takeaways for the capstone

The capstone is the perf-triage CLI: it reads a HAR file, a Performance trace and a Lighthouse report, checks them against budgets and writes a ranked report. These are the things worth borrowing.

1. **Validate the HAR before you use it.** Reject non-objects, bad dates and NaN numbers, and require an `entries` array. Report the file as unreadable, not as a crash. From [[devtools-frontend-findings|finding 2]] and [[devtools-frontend-pattern-untrusted-input|the untrusted input pattern]].
2. **Compute the timing phases yourself and keep `-1` as "not applicable".** Sum only non-negative phases, and treat a request with no response as all blocked time. A budget on "wait" then never counts a missing value as fast. From [[devtools-frontend-findings|finding 1]] and [[devtools-frontend-pattern-derived-data-with-unknowns|the derived data pattern]].
3. **Read the underscore fields defensively.** `_resourceType`, `_priority` and `_fromCache` give budget rules per type, but a HAR from another tool will not have them. Fall back to MIME type, then URL extension, as the importer does. From [[devtools-frontend-findings|finding 8]].
4. **Never print secrets from a HAR.** Drop cookie, `set-cookie` and `authorization` values in the report, and expect sanitized files to lack data. From [[devtools-frontend-findings|finding 5]].
5. **Fail soft per input, and say so.** If the trace is broken, still triage the HAR and list what was skipped in the report; end with a clear exit code. From [[devtools-frontend-pattern-fail-soft-parsing|the fail-soft pattern]].
6. **Stream or slice big files and cap numbers.** Use limits like the 32-bit cap on decoded values, and read big files in pieces instead of building many objects. From [[devtools-frontend-pattern-lazy-and-off-thread-work|the lazy pattern]] and [[devtools-frontend-findings|finding 6]].
7. **Put test fixtures beside the code, and name regressions.** DevTools keeps tests next to each module and pins edge cases such as the no-response request (`front_end/models/har/Log.test.ts:205-218 @ 572bfc0`). Use tiny HAR fixtures for each case. From [[devtools-frontend-findings|finding 1]].

## What not to copy

- Typed arrays, packed bits and a second worker thread for graph work: they pay off for millions of objects, not for a CLI that reads three files ([[devtools-frontend-findings|finding 10]]).
- A pluggable transport layer with a session router: the capstone reads files and has no live browser connection ([[devtools-frontend-findings|finding 9]]).
- Chrome-specific timing quirks (legacy send rule, QUIC clamp): add them only if your sample files show those cases.

## My insights
