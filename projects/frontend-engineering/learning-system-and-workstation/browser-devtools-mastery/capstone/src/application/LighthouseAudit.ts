import type { Budgets } from "../domain/Budgets.ts";
import type { Finding, LighthouseData } from "../domain/model.ts";
import type { Audit } from "../domain/ports.ts";

const round = (value: number): number => Math.round(value);

export class LighthouseAudit implements Audit<LighthouseData> {
  readonly source = "lighthouse" as const;

  run(data: LighthouseData, budgets: Budgets): Finding[] {
    const limits = budgets.values;
    // Say which kind of number was checked: lab or simulated, never field data.
    const kind = data.throttling;
    const findings: Finding[] = [];

    const timeLimits: Record<string, number> = {
      "largest-contentful-paint": limits.maxLcpMs,
      "first-contentful-paint": limits.maxFcpMs,
      "total-blocking-time": limits.maxTotalBlockingMs,
    };
    for (const metric of data.metrics) {
      const limit = timeLimits[metric.id];
      if (limit !== undefined && metric.value > limit) {
        findings.push(this.make(`lh-${metric.id}`, `${metric.title} over budget`, `${metric.title} is ${round(metric.value)} ms (budget ${limit} ms).`, "fail", metric.value - limit, 0, kind));
      }
      if (metric.id === "cumulative-layout-shift" && metric.value > limits.maxCls) {
        findings.push(this.make("lh-cls", `${metric.title} over budget`, `${metric.title} is ${metric.value.toFixed(3)} (budget ${limits.maxCls}).`, "fail", 0, 0, kind));
      }
    }
    if (data.performanceScore !== null && data.performanceScore < limits.minPerformanceScore) {
      findings.push(this.make("lh-score", "Performance score too low", `The score is ${data.performanceScore} (minimum ${limits.minPerformanceScore}).`, "fail", 0, 0, kind));
    }
    // Opportunities are hints with weight 0: they never change the exit code.
    for (const opportunity of data.opportunities) {
      findings.push(this.make(`lh-opportunity-${opportunity.id}`, opportunity.title, `Lighthouse estimates ${round(opportunity.savingsMs)} ms saved.`, "info", opportunity.savingsMs, opportunity.savingsBytes, kind));
    }
    return findings;
  }

  private make(id: string, title: string, detail: string, mode: "fail" | "info", savingsMs: number, bytes: number, dataKind: "lab" | "simulated"): Finding {
    return { source: "lighthouse", id, title, detail, mode, savingsMs: round(savingsMs), bytes, dataKind };
  }
}
