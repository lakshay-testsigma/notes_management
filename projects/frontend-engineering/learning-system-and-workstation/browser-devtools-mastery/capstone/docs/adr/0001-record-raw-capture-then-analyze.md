# 0001. Record a raw capture, then analyze it in pure classes

## Status

Accepted, 2026-11-19.

## Context

The service needs Chrome to get its data, and Chrome is slow, heavy and not always installed. Network timing, vitals, console errors and heap growth all come from CDP events. If the analysis code talked to Chrome directly, every test would need a browser, and a bug in one metric could lose the whole run.

## Decision

`ChromeCdpDriver` records what Chrome sent into one `RawCapture` JSON object. `CaptureStore` saves it before any analysis. Analyzer classes in `src/analysis/` take only plain data, and `ReportBuilder` runs each one on its own.

## Alternatives considered

- **Analyze events while they arrive.** This saves memory, but the tests then need a live or mocked browser, and a failure leaves no evidence. Lighthouse and DevTools both gather first and compute later (see lighthouse-takeaways.md).
- **Use a browser library for everything.** It hides CDP details, which are the subject of this topic, and it adds a dependency.

## Consequences

- All 50 tests run with no browser, using one recorded fixture.
- A saved capture can be re-analyzed with `npm run analyze`, even after the analysis rules change.
- A capture file can be large for heavy pages. The service keeps only `Network.`, `Page.`, `Runtime.`, `Log.` and `Target.` events plus the trace.
