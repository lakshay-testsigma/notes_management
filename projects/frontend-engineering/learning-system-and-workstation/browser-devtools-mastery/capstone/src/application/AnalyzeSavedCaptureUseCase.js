import { Result } from "../domain/Result.js";

// Use case: build a report from a saved capture file, with no browser involved.
export class AnalyzeSavedCaptureUseCase {
  constructor({ store, reportBuilder }) {
    this.store = store;
    this.reportBuilder = reportBuilder;
  }

  async execute(name) {
    const loaded = await this.store.load(name);
    if (!loaded.ok) return loaded;
    const report = this.reportBuilder.build(loaded.value);
    report.captureFile = name;
    return Result.ok(report);
  }
}
