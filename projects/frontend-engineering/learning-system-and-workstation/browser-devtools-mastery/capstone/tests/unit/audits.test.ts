import { describe, expect, it } from "vitest";
import { HarAudit } from "../../src/application/HarAudit.ts";
import { LighthouseAudit } from "../../src/application/LighthouseAudit.ts";
import { Ranker } from "../../src/application/Ranker.ts";
import { TraceAudit } from "../../src/application/TraceAudit.ts";
import { Budgets } from "../../src/domain/Budgets.ts";
import type { Finding, HarRequest } from "../../src/domain/model.ts";

const budgets = Budgets.defaults();
const request = (over: Partial<HarRequest>): HarRequest => ({
  url: "https://a.test/api?token=secret", method: "GET", status: 200, resourceType: "fetch", hasResponse: true,
  fromCache: false, totalMs: 100, waitMs: 50, blockedMs: 0, bytes: 1000, ...over,
});

describe("HarAudit", () => {
  const audit = new HarAudit();

  it("passes a fast request", () => {
    expect(audit.run({ requests: [request({})] }, budgets)).toEqual([]);
  });

  it("flags a slow wait and hides the query string", () => {
    const [finding] = audit.run({ requests: [request({ waitMs: 1000, totalMs: 1100 })] }, budgets);
    expect(finding.id).toBe("har-slow-wait");
    expect(finding.savingsMs).toBe(200);
    expect(finding.detail).not.toContain("secret");
  });

  it("flags a request with no response and a heavy page", () => {
    const requests = [request({ hasResponse: false, status: 0, totalMs: 5000 }), request({ bytes: 2_000_000 })];
    const ids = audit.run({ requests }, budgets).map((finding) => finding.id);
    expect(ids).toEqual(["har-no-response", "har-page-weight"]);
  });
});

describe("TraceAudit", () => {
  const audit = new TraceAudit();

  it("separates budget failures from mild long tasks", () => {
    const data = {
      longTasks: [{ startMs: 10, durationMs: 300 }, { startMs: 500, durationMs: 80 }],
      totalBlockingMs: 280,
      cumulativeLayoutShift: 0.3,
    };
    const findings = audit.run(data, budgets);
    expect(findings.map((finding) => finding.id).sort()).toEqual(["trace-cls", "trace-long-task", "trace-mild-long-tasks"]);
    expect(findings.find((finding) => finding.id === "trace-mild-long-tasks")?.mode).toBe("info");
  });
});

describe("LighthouseAudit", () => {
  const audit = new LighthouseAudit();

  it("labels numbers as simulated and keeps opportunities informative", () => {
    const data = {
      performanceScore: 0.5,
      throttling: "simulated" as const,
      metrics: [{ id: "largest-contentful-paint", title: "LCP", value: 3500 }],
      opportunities: [{ id: "unused-css", title: "Unused CSS", savingsMs: 100, savingsBytes: 0 }],
    };
    const findings = audit.run(data, budgets);
    expect(findings.every((finding) => finding.dataKind === "simulated")).toBe(true);
    expect(findings.find((finding) => finding.id === "lh-opportunity-unused-css")?.mode).toBe("info");
    expect(findings.find((finding) => finding.id === "lh-largest-contentful-paint")?.savingsMs).toBe(1000);
  });

  it("does not fail a null score", () => {
    const data = { performanceScore: null, throttling: "lab" as const, metrics: [], opportunities: [] };
    expect(audit.run(data, budgets)).toEqual([]);
  });
});

describe("Ranker", () => {
  const make = (id: string, mode: "fail" | "info", savingsMs: number, bytes = 0): Finding => ({
    source: "har", id, title: id, detail: "", mode, savingsMs, bytes, dataKind: "recorded",
  });

  it("puts failures first, then more milliseconds, then more bytes", () => {
    const ranked = new Ranker().rank([make("a", "info", 900), make("b", "fail", 10), make("c", "fail", 10, 50), make("d", "fail", 500)]);
    expect(ranked.map((finding) => finding.id)).toEqual(["d", "c", "b", "a"]);
  });
});
