import type { TriageReport } from "../domain/model.ts";

export class MarkdownRenderer {
  render(report: TriageReport): string {
    const lines: string[] = ["# Performance triage report", ""];
    const failures = report.findings.filter((finding) => finding.mode === "fail").length;
    lines.push(`Checked: ${report.checked.join(", ") || "nothing"}. Budget failures: ${failures}.`, "");

    if (report.skipped.length > 0) {
      lines.push("## Skipped inputs", "");
      for (const item of report.skipped) lines.push(`- ${item.source}: ${item.reason}`);
      lines.push("");
    }

    lines.push("## Ranked findings", "");
    if (report.findings.length === 0) lines.push("No findings.");
    report.findings.forEach((finding, index) => {
      const saving = finding.savingsMs > 0 ? `, about ${finding.savingsMs} ms` : "";
      lines.push(`${index + 1}. **${finding.mode.toUpperCase()}** [${finding.source}, ${finding.dataKind}] ${finding.title}${saving}`);
      lines.push(`   ${finding.detail}`);
    });
    return lines.join("\n") + "\n";
  }
}
