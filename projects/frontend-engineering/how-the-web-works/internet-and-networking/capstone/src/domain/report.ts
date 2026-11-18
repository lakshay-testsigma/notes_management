import type { Finding, Severity } from "./types.ts";

export type FailOn = Severity | "never";

export class Report {
  readonly host: string;
  readonly client: string;
  readonly checksRun: string[];
  readonly entryCount: number;
  readonly findings: Finding[];

  constructor(host: string, client: string, checksRun: string[], entryCount: number, findings: Finding[]) {
    this.host = host;
    this.client = client;
    this.checksRun = checksRun;
    this.entryCount = entryCount;
    // Errors first, then by check, so the worst problems are read first.
    this.findings = [...findings].sort((a, b) => Number(b.severity === "error") - Number(a.severity === "error") || a.check.localeCompare(b.check));
  }

  count(severity: Severity): number {
    return this.findings.filter((f) => f.severity === severity).length;
  }

  countUnknown(): number {
    return this.findings.filter((f) => f.verdict === "unknown").length;
  }

  // Warnings only fail the run when the team asks for it with FAIL_ON=warning.
  shouldFail(failOn: FailOn): boolean {
    if (failOn === "never") return false;
    if (failOn === "warning") return this.findings.length > 0;
    return this.count("error") > 0;
  }
}
