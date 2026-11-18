import type { LintResult } from "./types.ts";

export function formatReport(result: LintResult): string {
  const lines = [`Checked ${result.cookies.length} cookie(s).`];
  for (const f of result.findings) {
    lines.push(`${f.severity.toUpperCase().padEnd(7)} ${f.cookie}  [${f.rule}]  ${f.message}`);
  }
  const errors = result.findings.filter((f) => f.severity === "error").length;
  lines.push(`${errors} error(s), ${result.findings.length - errors} warning(s).`);
  return lines.join("\n");
}

// Exit 1 when any error exists, so a CI step can fail the build.
export function exitCode(result: LintResult): number {
  return result.findings.some((f) => f.severity === "error") ? 1 : 0;
}
