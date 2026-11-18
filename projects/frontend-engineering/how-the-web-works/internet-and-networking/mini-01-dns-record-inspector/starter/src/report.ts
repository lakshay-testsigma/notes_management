import type { Finding, Report } from "./types.ts";
import { RECORD_TYPES } from "./types.ts";

// Plain-text report. Complete in the starter: formatting is not the lesson.
export function formatReport(report: Report, findings: Finding[]): string {
  const lines = [`DNS records for ${report.name}`, ""];
  for (const type of RECORD_TYPES) {
    const set = report.sets[type];
    lines.push(`${type.padEnd(6)} ${set.status}`);
    for (const r of set.records) lines.push(`       ${r.value}${r.ttl === null ? "" : `  (TTL ${r.ttl}s)`}`);
  }
  lines.push("", "Findings");
  if (findings.length === 0) lines.push("  none");
  for (const f of findings) lines.push(`  ${f.level.toUpperCase().padEnd(5)} ${f.type}: ${f.message}`);
  return lines.join("\n");
}
