import { describe, expect, it } from "vitest";
import { HarGatherer } from "../../src/application/HarGatherer.ts";
import { LighthouseGatherer } from "../../src/application/LighthouseGatherer.ts";
import { TraceGatherer } from "../../src/application/TraceGatherer.ts";
import { InputError } from "../../src/domain/errors.ts";

function harWith(entry: object): string {
  return JSON.stringify({ log: { entries: [entry] } });
}
const base = { request: { method: "GET", url: "https://a.test/x.js" }, response: { status: 200, content: { size: 10, mimeType: "" } } };

describe("HarGatherer", () => {
  const gatherer = new HarGatherer();

  it("sums only phases that are not -1", () => {
    const text = harWith({ ...base, time: 999, timings: { blocked: 2, dns: -1, connect: -1, ssl: -1, send: 1, wait: 50, receive: 7 } });
    const [request] = gatherer.parse(text).requests;
    expect(request.totalMs).toBe(60);
    expect(request.waitMs).toBe(50);
  });

  it("treats a request with no response as all blocked time", () => {
    const text = harWith({ request: base.request, response: { status: 0 }, time: 4000, timings: { blocked: 4000, wait: -1 } });
    const [request] = gatherer.parse(text).requests;
    expect(request.hasResponse).toBe(false);
    expect(request.blockedMs).toBe(4000);
    expect(request.waitMs).toBe(0);
  });

  it("falls back to MIME type and then URL extension for the type", () => {
    const withMime = harWith({ ...base, response: { status: 200, content: { mimeType: "text/css" } }, timings: {} });
    expect(gatherer.parse(withMime).requests[0].resourceType).toBe("stylesheet");
    expect(gatherer.parse(harWith({ ...base, timings: {} })).requests[0].resourceType).toBe("script");
  });

  it("rejects bad input as InputError", () => {
    expect(() => gatherer.parse("not json")).toThrow(InputError);
    expect(() => gatherer.parse("[]")).toThrow(InputError);
    expect(() => gatherer.parse(harWith({ ...base, timings: { wait: "fast" } }))).toThrow(InputError);
    expect(() => gatherer.parse(harWith({ request: {}, response: {} }))).toThrow(InputError);
  });

  it("caps huge byte counts", () => {
    const text = harWith({ ...base, response: { status: 200, _transferSize: 1e15, content: {} }, timings: {} });
    expect(gatherer.parse(text).requests[0].bytes).toBe(2 ** 32 - 1);
  });
});

describe("TraceGatherer", () => {
  const gatherer = new TraceGatherer();
  const task = (ts: number, dur: number) => ({ name: "RunTask", ts: ts * 1000, dur: dur * 1000 });

  it("finds long tasks and blocking time in milliseconds", () => {
    const data = gatherer.parse(JSON.stringify({ traceEvents: [task(0, 20), task(100, 120), task(300, 60)] }));
    expect(data.longTasks).toHaveLength(2);
    expect(data.totalBlockingMs).toBeCloseTo(80);
  });

  it("accepts a bare array and ignores layout shifts after input", () => {
    const events = [
      { name: "LayoutShift", args: { data: { score: 0.2, had_recent_input: false } } },
      { name: "LayoutShift", args: { data: { score: 0.9, had_recent_input: true } } },
      "junk",
    ];
    expect(gatherer.parse(JSON.stringify(events)).cumulativeLayoutShift).toBeCloseTo(0.2);
  });

  it("rejects a file without events", () => {
    expect(() => gatherer.parse("{}")).toThrow(InputError);
  });
});

describe("LighthouseGatherer", () => {
  const gatherer = new LighthouseGatherer();

  it("reads metrics, score, throttling and opportunities", () => {
    const report = {
      configSettings: { throttlingMethod: "simulate" },
      categories: { performance: { score: 0.5 } },
      audits: {
        "largest-contentful-paint": { title: "LCP", numericValue: 3000 },
        "cumulative-layout-shift": { title: "CLS" },
        "unused-css": { title: "Unused CSS", details: { type: "opportunity", overallSavingsMs: 200, overallSavingsBytes: 5000 } },
      },
    };
    const data = gatherer.parse(JSON.stringify(report));
    expect(data.performanceScore).toBe(0.5);
    expect(data.throttling).toBe("simulated");
    expect(data.metrics.map((metric) => metric.id)).toEqual(["largest-contentful-paint"]);
    expect(data.opportunities[0].savingsMs).toBe(200);
  });

  it("rejects a report without audits", () => {
    expect(() => gatherer.parse("{}")).toThrow(InputError);
  });
});
