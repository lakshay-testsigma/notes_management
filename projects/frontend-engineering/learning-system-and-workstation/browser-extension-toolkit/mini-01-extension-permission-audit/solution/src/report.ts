import type { AuditResult } from "./types.js";

export function formatReport(results: AuditResult[]): string {
  const lines: string[] = [];
  for (const r of results) {
    lines.push(`${r.verdict.toUpperCase().padEnd(8)} ${String(r.score).padStart(3)}  ${r.name}`);
    for (const f of r.findings) lines.push(`           +${f.points} ${f.detail}`);
  }
  return lines.join("\n");
}
