# 0002. Read whole files, not streams

## Status

Accepted, 2026-11-18.

## Context

Lighthouse reads large traces in chunks. A bug report trace from a short page load is usually a few megabytes, and the tool is a beginner project that must stay readable.

## Decision

`NodeFileSource.readText` reads the whole file, and each gatherer calls `JSON.parse` once. The `FileSource` port returns text, so the choice is in one place.

## Alternatives considered

- **Streaming JSON parser.** Handles traces of hundreds of megabytes, but adds a dependency and a more complex gatherer.
- **Typed arrays and worker threads like DevTools.** They pay off for millions of objects, not for three files.

## Consequences

- A trace over about 500 MB can run out of memory. The fix is a new `FileSource` and a streaming `TraceGatherer`, with no change to audits.
- Fewer dependencies: only dev tools.
