---
title: "ChromeDevTools/devtools-frontend — takeaways"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: repo-intel
tags: [frontend-engineering, learning-system-and-workstation, repo-intel]
created: 2026-11-19
sources: [chromedevtools-devtools-frontend-repo]
---

# ChromeDevTools/devtools-frontend — takeaways for the capstone

The capstone is "Page health inspector": one command loads a URL in headless Chrome through the DevTools Protocol and reports network timing, Core Web Vitals, console errors and heap growth, with tests. These are the things worth borrowing.

1. **Keep one small connection class that numbers commands and stores a promise per id.** Your inspector then has one place that sends JSON, matches replies and passes events on. From [[devtools-frontend-findings|finding 1]].
2. **Return `{result}` or `{error}` from every CDP call, and fail pending calls when the page closes.** A crashed tab then ends your run with a clear error, and your `await` never hangs. From [[devtools-frontend-findings|finding 2]] and [[devtools-frontend-pattern-failures-as-values|the pattern]].
3. **Build a request table keyed by `requestId` and expect gaps.** Handle a response with no request, a failure with no request, and a redirect that reuses the id; report them as incomplete, not as zero. From [[devtools-frontend-findings|finding 3]] and [[devtools-frontend-pattern-tolerate-incomplete-events|the pattern]].
4. **Compute timing phases from the `timing` object, skip `-1` values, and keep a fallback.** Your report then prints DNS, connect, TLS, wait (TTFB) and download without negative numbers. From [[devtools-frontend-findings|finding 4]].
5. **Collect raw trace or event data first, then compute vitals in a second step.** Largest contentful paint and layout shift need the full list. Keep each metric in its own function, so one broken metric cannot sink the report. From [[devtools-frontend-findings|finding 6]] and [[devtools-frontend-findings|finding 8]].
6. **Wrap every optional section in its own try/catch and report the error in the output.** A heap measurement that fails should show "heap: unavailable" and keep the other three sections. From [[devtools-frontend-findings|finding 8]].
7. **Map minified console-error stacks back with a source map, and cache by script identity.** Decode lazily on first lookup, and treat the map as untrusted input. From [[devtools-frontend-findings|finding 5]].
8. **Test the failure paths with recorded fixtures and a fake connection.** Save a real trace or event log as a file, feed it to your parser, and write a test for the unknown-request case first. From [[devtools-frontend-findings|finding 10]].

## What not to copy

- The multi-session router, capability masks and target models. You inspect one page, so one session is enough.
- Chunked yielding and a weighted progress bar. A command-line tool has no UI to freeze.
- Range mappings, scope data and index-map sections of source maps. Support the plain version 3 format first.

## My insights
