import type { CheckResult, Outcome } from "./Outcome.ts";

// Counts results and decides the exit code. It knows nothing about printing.
export class Summary {
  private readonly results: CheckResult[];

  constructor(results: CheckResult[]) {
    this.results = results;
  }

  count(outcome: Outcome): number {
    return this.results.filter((r) => r.outcome === outcome).length;
  }

  hasFailure(): boolean {
    return this.count("fail") > 0;
  }

  // strict mode: a result that needs review also stops the run.
  exitCode(strict: boolean): 0 | 1 {
    if (this.hasFailure()) return 1;
    return strict && this.count("review") > 0 ? 1 : 0;
  }
}
