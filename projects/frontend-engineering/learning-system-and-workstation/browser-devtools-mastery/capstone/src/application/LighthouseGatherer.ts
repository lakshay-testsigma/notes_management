import { InputError } from "../domain/errors.ts";
import type { LighthouseData, LighthouseMetric, LighthouseOpportunity } from "../domain/model.ts";
import type { Gatherer } from "../domain/ports.ts";

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const METRIC_IDS = ["largest-contentful-paint", "first-contentful-paint", "cumulative-layout-shift", "total-blocking-time"];

export class LighthouseGatherer implements Gatherer<LighthouseData> {
  readonly source = "lighthouse" as const;

  parse(text: string): LighthouseData {
    let root: unknown;
    try {
      root = JSON.parse(text);
    } catch {
      throw new InputError("Lighthouse report is not valid JSON.");
    }
    if (!isObject(root) || !isObject(root.audits)) {
      throw new InputError("Lighthouse report has no audits object.");
    }
    const audits = root.audits;
    const metrics: LighthouseMetric[] = [];
    for (const id of METRIC_IDS) {
      const audit = audits[id];
      // A missing metric is not an error: Lighthouse marks some as not applicable.
      if (isObject(audit) && typeof audit.numericValue === "number") {
        metrics.push({ id, title: String(audit.title ?? id), value: audit.numericValue });
      }
    }
    const opportunities: LighthouseOpportunity[] = [];
    for (const [id, audit] of Object.entries(audits)) {
      if (!isObject(audit) || !isObject(audit.details) || audit.details.type !== "opportunity") continue;
      const savingsMs = Number(audit.details.overallSavingsMs);
      if (Number.isFinite(savingsMs) && savingsMs > 0) {
        const savingsBytes = Number(audit.details.overallSavingsBytes);
        opportunities.push({
          id,
          title: String(audit.title ?? id),
          savingsMs,
          savingsBytes: Number.isFinite(savingsBytes) ? savingsBytes : 0,
        });
      }
    }
    return {
      performanceScore: this.readScore(root),
      throttling: this.readThrottling(root),
      metrics,
      opportunities,
    };
  }

  private readScore(root: Obj): number | null {
    const categories = isObject(root.categories) ? root.categories : {};
    const performance = isObject(categories.performance) ? categories.performance : {};
    return typeof performance.score === "number" ? performance.score : null;
  }

  private readThrottling(root: Obj): "simulated" | "lab" {
    const settings = isObject(root.configSettings) ? root.configSettings : {};
    return settings.throttlingMethod === "simulate" ? "simulated" : "lab";
  }
}
