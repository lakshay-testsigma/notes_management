// Turns a RawCapture into a report. Each section runs on its own, so one broken
// section becomes { status: "unavailable" } and the others still print.
export class ReportBuilder {
  constructor({ timing, vitals, consoleErrors, heap }) {
    this.timing = timing;
    this.vitals = vitals;
    this.consoleErrors = consoleErrors;
    this.heap = heap;
  }

  build(capture) {
    const trace = capture.trace ?? [];
    const events = capture.events ?? [];
    const traceProblem = capture.collectionErrors?.trace;
    const traceSection = (fn) => (traceProblem ? this.#unavailable(new Error(traceProblem)) : this.#section(fn));
    return {
      url: capture.url,
      capturedAt: capture.capturedAt,
      loadOutcome: capture.loadOutcome ?? "unknown",
      settings: capture.settings ?? {},
      network: this.#section(() => this.timing.analyze(events)),
      vitals: {
        lcp: traceSection(() => this.vitals.lcp(trace)),
        cls: traceSection(() => this.vitals.cls(trace)),
        longTasks: traceSection(() => this.vitals.longTasks(trace)),
      },
      console: this.#section(() => this.consoleErrors.analyze(events)),
      heap: capture.collectionErrors?.heap
        ? this.#unavailable(new Error(capture.collectionErrors.heap))
        : this.#section(() => this.heap.analyze(capture.heapSamples)),
    };
  }

  #section(fn) {
    try {
      return { status: "ok", data: fn() };
    } catch (error) {
      return this.#unavailable(error);
    }
  }

  // "Could not measure" is never shown as zero.
  #unavailable(error) {
    return { status: "unavailable", reason: error.message };
  }
}
