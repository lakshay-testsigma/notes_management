# 0002. Give every check three outcomes: pass, fail, needs review

## Status

Accepted, 2026-11-18.

## Context

Some checks cannot be sure. In jsdom there is no layout, so axe-core cannot measure color contrast. Saved headers may be missing. A canonical link may point to another host on purpose. If these cases print "fail", people stop trusting the report. If they print "pass", real problems hide.

## Decision

`Outcome` is `"pass" | "fail" | "review"` and every `CheckResult` carries one. axe-core "violations" become `fail`, its "incomplete" list becomes `review`. A check that cannot see its input returns `review`. A check that throws becomes a `review` row that names the check and the target. Only `fail` stops a run; `TOOLKIT_STRICT=true` makes `review` stop it too.

## Alternatives considered

- **Two outcomes (pass and fail).** Simple, but it forces a wrong answer on every uncertain case.
- **A numeric score.** It hides which exact rule needs a person, and the CI exit code needs a threshold anyway.
- **Warnings as a log level.** Logs go to stderr and are easy to lose; the result must be part of the report.

## Consequences

- The report is honest about what automation cannot know.
- Every new check must decide, for each branch, which of three outcomes it returns, and write one test per branch.
- Teams that want zero doubt use strict mode and pay with more failing runs.
