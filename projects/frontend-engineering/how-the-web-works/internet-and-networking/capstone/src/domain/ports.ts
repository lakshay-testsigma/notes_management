import type { Finding, Policy, SiteData } from "./types.ts";

// Ports: the domain and application layers know these interfaces only.
// The infrastructure layer supplies the real classes.
export interface SiteDataSource {
  load(): SiteData;
}

export interface PolicyRepository {
  load(): Policy;
}

export interface Clock {
  now(): Date;
}

export interface Logger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

export interface CheckContext {
  site: SiteData;
  policy: Policy;
  now: Date;
}

// One check = one area of the report. Checks are pure: same input, same findings.
export interface Check {
  readonly name: string;
  run(context: CheckContext): Finding[];
}
