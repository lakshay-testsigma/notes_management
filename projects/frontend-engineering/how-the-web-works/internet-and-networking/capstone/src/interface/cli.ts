import { ConfigError, InputError, PolicyError } from "../domain/errors.ts";
import type { Logger } from "../domain/ports.ts";
import type { FailOn } from "../domain/report.ts";
import type { RunReport } from "../application/runReport.ts";
import type { ReportRenderer } from "./renderers.ts";

export const EXIT_OK = 0;
export const EXIT_FINDINGS = 1;
export const EXIT_BAD_INPUT = 2;

export interface CliOutput {
  out(text: string): void;
  err(text: string): void;
}

// Turns a use case result into output and an exit code. It holds no check logic.
export class Cli {
  private readonly useCase: RunReport;
  private readonly renderer: ReportRenderer;
  private readonly failOn: FailOn;
  private readonly logger: Logger;
  private readonly output: CliOutput;

  constructor(useCase: RunReport, renderer: ReportRenderer, failOn: FailOn, logger: Logger, output: CliOutput) {
    this.useCase = useCase;
    this.renderer = renderer;
    this.failOn = failOn;
    this.logger = logger;
    this.output = output;
  }

  run(): number {
    try {
      const report = this.useCase.execute();
      this.output.out(this.renderer.render(report));
      return report.shouldFail(this.failOn) ? EXIT_FINDINGS : EXIT_OK;
    } catch (error) {
      return this.handle(error);
    }
  }

  private handle(error: unknown): number {
    if (error instanceof InputError || error instanceof PolicyError || error instanceof ConfigError) {
      this.output.err(`${error.name}: ${error.message}`);
      return EXIT_BAD_INPUT;
    }
    // Unexpected: log with context, then fail. Never swallow.
    const reason = error instanceof Error ? error.stack ?? error.message : String(error);
    this.logger.error("unexpected failure", { reason });
    this.output.err("Unexpected failure. See the log line above.");
    return EXIT_BAD_INPUT;
  }
}
