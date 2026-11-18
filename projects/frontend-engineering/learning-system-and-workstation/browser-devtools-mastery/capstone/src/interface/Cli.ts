import { UsageError } from "../domain/errors.ts";
import type { Budgets } from "../domain/Budgets.ts";
import type { TriageReport } from "../domain/model.ts";
import type { InputPaths, TriageUseCase } from "../application/TriageUseCase.ts";
import type { MarkdownRenderer } from "./MarkdownRenderer.ts";

export const USAGE = "Usage: perf-triage [--har file] [--trace file] [--lighthouse file] [--json] [--exit-zero]";

export interface CliResult {
  stdout: string;
  exitCode: number;
}

// Exit codes: 0 clean, 1 a budget failed, 2 usage error or no input could be read.
export class Cli {
  private readonly useCase: TriageUseCase;
  private readonly renderer: MarkdownRenderer;
  private readonly budgets: Budgets;

  constructor(useCase: TriageUseCase, renderer: MarkdownRenderer, budgets: Budgets) {
    this.useCase = useCase;
    this.renderer = renderer;
    this.budgets = budgets;
  }

  async run(args: string[]): Promise<CliResult> {
    try {
      const options = this.parseArgs(args);
      const report = await this.useCase.run(options.paths, this.budgets);
      const stdout = options.json ? JSON.stringify(report, null, 2) + "\n" : this.renderer.render(report);
      return { stdout, exitCode: this.exitCode(report, options.exitZero) };
    } catch (error) {
      if (error instanceof UsageError) return { stdout: `${error.message}\n${USAGE}\n`, exitCode: 2 };
      throw error;
    }
  }

  private exitCode(report: TriageReport, exitZero: boolean): number {
    if (report.checked.length === 0) return 2;
    if (exitZero) return 0;
    return report.findings.some((finding) => finding.mode === "fail") ? 1 : 0;
  }

  private parseArgs(args: string[]): { paths: InputPaths; json: boolean; exitZero: boolean } {
    const paths: InputPaths = {};
    let json = false;
    let exitZero = false;
    for (let i = 0; i < args.length; i += 1) {
      const flag = args[i];
      if (flag === "--json") json = true;
      else if (flag === "--exit-zero") exitZero = true;
      else if (flag === "--har" || flag === "--trace" || flag === "--lighthouse") {
        const value = args[i + 1];
        if (value === undefined || value.startsWith("--")) throw new UsageError(`${flag} needs a file path.`);
        paths[flag.slice(2) as keyof InputPaths] = value;
        i += 1;
      } else {
        throw new UsageError(`Unknown option ${flag}.`);
      }
    }
    if (Object.keys(paths).length === 0) throw new UsageError("Give at least one input file.");
    return { paths, json, exitZero };
  }
}
