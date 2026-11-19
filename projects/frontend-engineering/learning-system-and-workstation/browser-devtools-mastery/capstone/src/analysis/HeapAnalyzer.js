import { MissingTraceDataError } from "../domain/errors.js";

// Heap growth is the difference between the first and last garbage-collected sample.
export class HeapAnalyzer {
  analyze(samples) {
    if (!Array.isArray(samples) || samples.length < 2) throw new MissingTraceDataError("two heap samples");
    const first = samples[0];
    const last = samples[samples.length - 1];
    const deltaBytes = last.usedSize - first.usedSize;
    return {
      beforeBytes: first.usedSize,
      afterBytes: last.usedSize,
      deltaBytes,
      deltaPercent: first.usedSize > 0 ? Math.round((deltaBytes / first.usedSize) * 1000) / 10 : null,
      samples: samples.length,
    };
  }
}
