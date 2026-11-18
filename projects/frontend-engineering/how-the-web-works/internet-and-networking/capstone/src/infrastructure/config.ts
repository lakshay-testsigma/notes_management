import { ConfigError } from "../domain/errors.ts";
import type { FailOn } from "../domain/report.ts";
import type { LogLevel } from "./jsonLogger.ts";

export interface Config {
  format: "text" | "json";
  failOn: FailOn;
  logLevel: LogLevel;
  now: string | null;
  policyFile: string | null;
}

function oneOf<T extends string>(env: Record<string, string | undefined>, name: string, allowed: readonly T[], fallback: T): T {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  if (!(allowed as readonly string[]).includes(raw)) throw new ConfigError(`${name} must be one of: ${allowed.join(", ")} (got "${raw}")`);
  return raw as T;
}

// Reads environment variables once, at startup. A bad value stops the program here.
export function loadConfig(env: Record<string, string | undefined>): Config {
  const now = env.REPORT_NOW || null;
  if (now !== null && Number.isNaN(Date.parse(now))) throw new ConfigError(`REPORT_NOW must be an ISO date (got "${now}")`);
  return {
    format: oneOf(env, "REPORT_FORMAT", ["text", "json"], "text"),
    failOn: oneOf(env, "FAIL_ON", ["error", "warning", "never"], "error"),
    logLevel: oneOf(env, "LOG_LEVEL", ["silent", "warn", "info"], "warn"),
    now,
    policyFile: env.POLICY_FILE || null,
  };
}
