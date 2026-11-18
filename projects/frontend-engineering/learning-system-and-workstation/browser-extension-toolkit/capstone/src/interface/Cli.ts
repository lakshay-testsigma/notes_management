import { parseArgs } from "node:util";
import { ChecklistBuilder } from "../application/ChecklistBuilder.ts";
import type { AuditPageUseCase } from "../application/AuditPageUseCase.ts";
import type { ProfileLoader } from "../application/ProfileLoader.ts";
import type { ValidateProfileUseCase } from "../application/ValidateProfileUseCase.ts";
import { InputError, PolicyError, ProfileError, UsageError } from "../domain/errors.ts";
import type { CheckResult } from "../domain/Outcome.ts";
import type { Logger } from "../domain/ports.ts";
import { Summary } from "../domain/Summary.ts";
import type { TextRenderer } from "./TextRenderer.ts";

const USAGE = `Usage:
  toolkit validate  --profile <file> [--policy <file>]
  toolkit checklist --profile <file> [--policy <file>]
  toolkit audit     --page <html> [--headers <file>] [--url <url>]
  toolkit run       --profile <file> --page <html> [--headers <file>] [--url <url>]
Exit codes: 0 clean, 1 a check failed, 2 bad usage or unreadable input.`;

export interface CliDeps {
  loader: ProfileLoader;
  validate: ValidateProfileUseCase;
  audit: AuditPageUseCase;
  checklist: ChecklistBuilder;
  renderer: TextRenderer;
  logger: Logger;
  policyPath: string;
  strict: boolean;
  out: (text: string) => void;
}

// Turns command-line input into use-case calls and turns errors into exit codes.
export class Cli {
  private readonly deps: CliDeps;

  constructor(deps: CliDeps) {
    this.deps = deps;
  }

  async run(argv: string[]): Promise<number> {
    try {
      return await this.dispatch(argv);
    } catch (error) {
      if (error instanceof UsageError) return this.fail(`${error.message}\n${USAGE}`);
      if (error instanceof PolicyError || error instanceof ProfileError || error instanceof InputError) {
        return this.fail(error.message);
      }
      this.deps.logger.error("unexpected", { reason: error instanceof Error ? (error.stack ?? error.message) : String(error) });
      throw error;
    }
  }

  private async dispatch(argv: string[]): Promise<number> {
    const [command, ...rest] = argv;
    let values: Record<string, string | undefined>;
    try {
      values = parseArgs({
        args: rest,
        options: { profile: { type: "string" }, policy: { type: "string" }, page: { type: "string" }, headers: { type: "string" }, url: { type: "string" } },
      }).values;
    } catch (error) {
      throw new UsageError((error as Error).message);
    }
    const need = (name: string): string => {
      const value = values[name];
      if (!value) throw new UsageError(`missing --${name}`);
      return value;
    };
    const policyPath = values["policy"] ?? this.deps.policyPath;

    switch (command) {
      case "validate": {
        const results = await this.validateProfile(need("profile"), policyPath);
        return this.finish(results);
      }
      case "checklist": {
        const loaded = await this.deps.loader.load(need("profile"), policyPath);
        this.deps.out(this.deps.renderer.checklist(loaded.profile.name, this.deps.checklist.build(loaded.profile, loaded.policy)));
        return 0;
      }
      case "audit":
        return this.finish(await this.auditPage(values, need("page")));
      case "run": {
        // The profile is validated first. A failing extension stops the run.
        const profileResults = await this.validateProfile(need("profile"), policyPath);
        if (new Summary(profileResults).hasFailure()) {
          this.deps.out("Profile rejected: page checks were not run.");
          return 1;
        }
        const loaded = await this.deps.loader.load(need("profile"), policyPath);
        this.deps.out(this.deps.renderer.checklist(loaded.profile.name, this.deps.checklist.build(loaded.profile, loaded.policy)));
        const pageResults = await this.auditPage(values, need("page"));
        return new Summary([...profileResults, ...pageResults]).exitCode(this.deps.strict);
      }
      default:
        throw new UsageError(command ? `unknown command "${command}"` : "missing command");
    }
  }

  private async validateProfile(profilePath: string, policyPath: string): Promise<CheckResult[]> {
    const loaded = await this.deps.loader.load(profilePath, policyPath);
    const results = await this.deps.validate.run(loaded);
    this.deps.out(this.deps.renderer.results("Profile validation", results));
    return results;
  }

  private async auditPage(values: Record<string, string | undefined>, pagePath: string): Promise<CheckResult[]> {
    const results = await this.deps.audit.run({ pagePath, headersPath: values["headers"], url: values["url"] ?? "https://example.com/" });
    this.deps.out(this.deps.renderer.results("Page checks", results));
    return results;
  }

  private finish(results: CheckResult[]): number {
    return new Summary(results).exitCode(this.deps.strict);
  }

  private fail(message: string): number {
    this.deps.logger.error("run.failed", { reason: message.split("\n")[0] });
    this.deps.out(message);
    return 2;
  }
}
