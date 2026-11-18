import type { Budgets } from "../domain/Budgets.ts";
import type { Finding, TraceData } from "../domain/model.ts";
import type { Audit } from "../domain/ports.ts";

const round = (value: number): number => Math.round(value);

export class TraceAudit implements Audit<TraceData> {
  readonly source = "trace" as const;

  run(data: TraceData, budgets: Budgets): Finding[] {
    const limits = budgets.values;
    const findings: Finding[] = [];
    let mildCount = 0;

    for (const task of data.longTasks) {
      if (task.durationMs > limits.maxLongTaskMs) {
        findings.push(this.make("trace-long-task", "Long task", `A task at ${round(task.startMs)} ms ran ${round(task.durationMs)} ms (budget ${limits.maxLongTaskMs} ms).`, "fail", task.durationMs - 50));
      } else {
        mildCount += 1;
      }
    }
    if (mildCount > 0) {
      findings.push(this.make("trace-mild-long-tasks", "Tasks over 50 ms", `${mildCount} more tasks ran over 50 ms but within the budget.`, "info", 0));
    }
    if (data.totalBlockingMs > limits.maxTotalBlockingMs) {
      findings.push(this.make("trace-blocking-time", "Main thread blocked too long", `Long tasks blocked the main thread for ${round(data.totalBlockingMs)} ms (budget ${limits.maxTotalBlockingMs} ms).`, "fail", data.totalBlockingMs - limits.maxTotalBlockingMs));
    }
    if (data.cumulativeLayoutShift > limits.maxCls) {
      findings.push(this.make("trace-cls", "Layout shifts", `Layout shift score is ${data.cumulativeLayoutShift.toFixed(3)} (budget ${limits.maxCls}).`, "fail", 0));
    }
    return findings;
  }

  private make(id: string, title: string, detail: string, mode: "fail" | "info", savingsMs: number): Finding {
    return { source: "trace", id, title, detail, mode, savingsMs: round(savingsMs), bytes: 0, dataKind: "recorded" };
  }
}
