import { Result } from "../domain/Result.js";

// Use case: check the URL, load it with the driver, keep the raw capture, build the report.
export class InspectPageUseCase {
  constructor({ urlPolicy, driver, store, reportBuilder, logger }) {
    this.urlPolicy = urlPolicy;
    this.driver = driver;
    this.store = store;
    this.reportBuilder = reportBuilder;
    this.logger = logger;
  }

  async execute(rawUrl, requestId) {
    const checked = Result.attempt(() => this.urlPolicy.check(rawUrl));
    if (!checked.ok) return checked;

    this.logger.info("inspect.start", { requestId, url: checked.value });
    const captured = await this.driver.capture(checked.value);
    if (!captured.ok) {
      this.logger.warn("inspect.capture_failed", { requestId, code: captured.error.code, message: captured.error.message });
      return captured;
    }

    // Keep the evidence first: a later analysis bug must not lose the capture.
    let captureFile = null;
    try {
      captureFile = await this.store.save(captured.value);
    } catch (error) {
      this.logger.error("inspect.save_failed", { requestId, message: error.message });
    }
    const report = this.reportBuilder.build(captured.value);
    report.captureFile = captureFile;
    this.logger.info("inspect.done", { requestId, loadOutcome: report.loadOutcome, captureFile });
    return Result.ok(report);
  }
}
