import type { Report } from "../domain/report.ts";

export interface ReportRenderer {
  render(report: Report): string;
}

export class TextRenderer implements ReportRenderer {
  render(report: Report): string {
    const lines = [
      `Network report for ${report.host}`,
      `Data from ${report.client}; ${report.entryCount} HTTP responses; checks: ${report.checksRun.join(", ")}`,
      "",
    ];
    for (const f of report.findings) {
      const tag = f.verdict === "unknown" ? "UNKNOWN" : f.severity.toUpperCase();
      lines.push(`[${tag}] ${f.rule}  ${f.subject}`, `        ${f.message}`);
    }
    if (report.findings.length === 0) lines.push("No problems found.");
    lines.push(
      "",
      `${report.count("error")} errors, ${report.count("warning")} warnings (${report.countUnknown()} could not be read).`,
    );
    return lines.join("\n");
  }
}

export class JsonRenderer implements ReportRenderer {
  render(report: Report): string {
    return JSON.stringify(
      {
        host: report.host,
        client: report.client,
        checks: report.checksRun,
        errors: report.count("error"),
        warnings: report.count("warning"),
        unknown: report.countUnknown(),
        findings: report.findings,
      },
      null,
      2,
    );
  }
}
