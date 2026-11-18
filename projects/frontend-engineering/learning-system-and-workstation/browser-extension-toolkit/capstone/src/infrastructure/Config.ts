import { UsageError } from "../domain/errors.ts";
import type { Level } from "./JsonLogger.ts";

// Reads environment variables once, at startup, and rejects bad values.
export class Config {
  readonly policyPath: string;
  readonly logLevel: Level;
  readonly strict: boolean;

  private constructor(policyPath: string, logLevel: Level, strict: boolean) {
    this.policyPath = policyPath;
    this.logLevel = logLevel;
    this.strict = strict;
  }

  static fromEnv(env: Record<string, string | undefined>): Config {
    const level = env["TOOLKIT_LOG_LEVEL"] ?? "info";
    if (!["debug", "info", "warn", "error"].includes(level)) {
      throw new UsageError(`TOOLKIT_LOG_LEVEL must be debug, info, warn or error, not "${level}"`);
    }
    const strict = env["TOOLKIT_STRICT"] ?? "false";
    if (strict !== "true" && strict !== "false") {
      throw new UsageError(`TOOLKIT_STRICT must be true or false, not "${strict}"`);
    }
    return new Config(env["TOOLKIT_POLICY"] ?? "policy/permission-policy.json", level as Level, strict === "true");
  }
}
