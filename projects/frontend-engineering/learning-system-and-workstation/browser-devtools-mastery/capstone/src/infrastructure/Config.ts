import { UsageError } from "../domain/errors.ts";
import type { LogLevel } from "./JsonLogger.ts";

const LEVELS = ["debug", "info", "error", "silent"];

// All settings come from environment variables and are checked at startup.
export class Config {
  readonly budgetsPath: string | undefined;
  readonly logLevel: LogLevel;

  constructor(budgetsPath: string | undefined, logLevel: LogLevel) {
    this.budgetsPath = budgetsPath;
    this.logLevel = logLevel;
  }

  static fromEnv(env: Record<string, string | undefined>): Config {
    const level = env.PERF_TRIAGE_LOG_LEVEL ?? "info";
    if (!LEVELS.includes(level)) {
      throw new UsageError(`PERF_TRIAGE_LOG_LEVEL must be one of ${LEVELS.join(", ")}.`);
    }
    const path = env.PERF_TRIAGE_BUDGETS;
    return new Config(path === undefined || path === "" ? undefined : path, level as LogLevel);
  }
}
