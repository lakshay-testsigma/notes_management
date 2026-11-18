# 0001. Separate gathering from auditing

## Status

Accepted, 2026-11-18.

## Context

Three file formats feed one report. If one function parsed and judged each file, a changed budget would touch parsing code, and a broken file would stop the whole run.

## Decision

A gatherer turns text into plain data and throws `InputError` when the text is wrong. An audit takes plain data and budgets and returns findings. `Artifacts` runs gatherers, caches the result and turns an `InputError` into a skipped row. This is the gather and audit split used by Lighthouse.

## Alternatives considered

- **One parser-and-checker per format.** Fewer classes, but tests need real files for every budget case, and the failure path is repeated three times.
- **Let the first bad file stop the run.** Simpler, but a team with a broken trace would get no HAR triage at all.

## Consequences

- Audit tests use plain objects, with no files.
- A run with a broken input exits normally and lists what was skipped.
- A new input kind needs two classes instead of one.
