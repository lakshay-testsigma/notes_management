# 0002. Treat unreadable data as an "unknown" finding, never as a pass

## Status

Accepted, 2026-11-18.

## Context

HAR files from real sites hold odd headers: `max-age=abc`, a `SameSite` value that does not exist, an HTTP version written as `h3-29`. A strict parser that throws would stop the whole report. A lenient parser that skips the header would hide a real problem.

## Decision

Parsers never throw on header content. `CacheControl.parse` and `SetCookie.parse` return a value with an `errors` or `issues` list. A check turns each entry of that list into a finding with verdict `unknown` (`src/domain/finding.ts`). An `unknown` finding has warning severity, so it is visible and it counts when the team sets `FAIL_ON=warning`. Only structural errors in the input files (not JSON, wrong shape) throw `InputError`.

## Alternatives considered

- **Throw on the first bad header.** Simple, but one odd cookie hides every other result.
- **Skip what cannot be read.** The report looks clean while the browser may ignore the cookie or cache rule.
- **Treat unreadable as an error.** It is too loud: the problem may be the capture tool, not the site.

## Consequences

- The report lists what it could not judge, so a reader knows its limits.
- Each parser has tests for odd input.
- A check that crashes is also reported as `unknown` by `RunReport`, using the same idea.
