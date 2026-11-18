import type { Finding, Severity } from "./types.ts";

export function problem(check: string, rule: string, severity: Severity, subject: string, message: string): Finding {
  return { check, rule, severity, verdict: "problem", subject, message };
}

// Fail closed: data we cannot read is reported, with warning severity, and never counted as ok.
export function unknown(check: string, rule: string, subject: string, message: string): Finding {
  return { check, rule, severity: "warning", verdict: "unknown", subject, message };
}
