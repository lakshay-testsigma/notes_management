import type { Target } from "./baseline.ts";
import type { Decision } from "./decide.ts";

/** Build the report the team reads before a release. */
export function formatReport(target: Target, decisions: Decision[]): string {
  const lines: string[] = [`Baseline target: ${target}`, ""];

  for (const decision of decisions) {
    lines.push(`${decision.feature.label} — ${decision.verdict}`);
    lines.push(`  ${decision.reason}`);
    if (decision.verdict === "needs a fallback" && decision.advice !== null) {
      lines.push(`  advice: ${decision.advice}`);
      // A feature that needs a polyfill has no runtime check worth printing.
      if (decision.detection && !decision.detection.needsPolyfill) {
        lines.push(`  detect: ${decision.detection.snippet}`);
      }
    }
    lines.push("");
  }

  const safe = decisions.filter((decision) => decision.verdict === "safe today").length;
  lines.push(`${safe} of ${decisions.length} features are safe today.`);
  return lines.join("\n");
}
