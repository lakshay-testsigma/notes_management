import { describe, expect, it } from "vitest";
import { isRenderBlocking, isUncached, slowestPhases, toRequests } from "../src/analyze.js";
import { HarError, parseHar } from "../src/parse.js";
import { computePhases } from "../src/phases.js";
import { buildReport } from "../src/report.js";
import type { RawEntry } from "../src/types.js";

function entry(over: Partial<RawEntry> = {}, timings: Record<string, number> = {}): RawEntry {
  return {
    startedDateTime: "2025-01-15T10:00:00.000Z",
    time: 100,
    request: { method: "GET", url: "https://a.example/x.js" },
    response: { status: 200 },
    timings: { blocked: 1, dns: -1, connect: -1, ssl: -1, send: 1, wait: 50, receive: 10, ...timings },
    ...over,
  };
}
const har = (entries: unknown[], onContentLoad = 500) =>
  JSON.stringify({ log: { pages: [{ pageTimings: { onContentLoad } }], entries } });

describe("parseHar (task 1)", () => {
  it("rejects text that is not JSON", () => {
    expect(() => parseHar("{oops")).toThrow(HarError);
  });
  it("rejects JSON without log.entries", () => {
    expect(() => parseHar('{"log":{}}')).toThrow(HarError);
    expect(() => parseHar("[]")).toThrow(HarError);
  });
  it("skips unreadable entries and counts them", () => {
    const bad = entry({ startedDateTime: "not a date" });
    const parsed = parseHar(har([entry(), bad, null, 7]));
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.skipped).toBe(3);
  });
  it("reads onContentLoad, or -1 when it is unknown", () => {
    expect(parseHar(har([entry()], 420)).contentLoadedMs).toBe(420);
    expect(parseHar(har([entry()], -1)).contentLoadedMs).toBe(-1);
  });
});

describe("computePhases (task 2)", () => {
  it("keeps -1 for phases that did not happen", () => {
    const p = computePhases(entry());
    expect(p.dns).toBe(-1);
    expect(p.connect).toBe(-1);
    expect(p.wait).toBe(50);
  });
  it("sums only the phases that happened, and does not add ssl twice", () => {
    const p = computePhases(entry({}, { dns: 10, connect: 40, ssl: 30 }));
    expect(p.total).toBe(1 + 10 + 40 + 1 + 50 + 10);
  });
  it("treats NaN and missing values as not applicable", () => {
    const p = computePhases(entry({}, { wait: NaN, receive: undefined as unknown as number }));
    expect(p.wait).toBe(-1);
    expect(p.receive).toBe(-1);
  });
  it("counts a request with no response as all blocked time", () => {
    const p = computePhases(entry({ response: { status: 0 }, time: 150 }, { blocked: -1, send: -1, wait: -1, receive: -1 }));
    expect(p.blocked).toBe(150);
    expect(p.total).toBe(150);
  });
});

describe("isUncached (task 3)", () => {
  const load = () =>
    toRequests(parseHar(har([entry({ _fromCache: "disk" }), entry(), entry({ response: { status: 304 } })])));
  it("is false for a cache hit", () => expect(isUncached(load()[0])).toBe(false));
  it("is true for a normal network request", () => expect(isUncached(load()[1])).toBe(true));
  it("is true for a 304, which still cost a round trip", () => expect(isUncached(load()[2])).toBe(true));
});

describe("isRenderBlocking (task 4)", () => {
  const load = () => toRequests(
    parseHar(
      har([
        entry({ _resourceType: "script" }),
        { ...entry({ _resourceType: "script" }), startedDateTime: "2025-01-15T10:00:02.000Z" },
        entry({ _resourceType: "image" }),
      ]),
    ),
  );
  it("flags a script that started before DOMContentLoaded", () => expect(isRenderBlocking(load()[0], 500)).toBe(true));
  it("ignores a script that started after it", () => expect(isRenderBlocking(load()[1], 500)).toBe(false));
  it("ignores images", () => expect(isRenderBlocking(load()[2], 500)).toBe(false));
  it("uses the type alone when DOMContentLoaded is unknown", () => expect(isRenderBlocking(load()[1], -1)).toBe(true));
});

describe("slowestPhases (task 5)", () => {
  const load = () =>
    toRequests(
      parseHar(
        har([
          entry({ request: { method: "GET", url: "https://a.example/slow" } }, { wait: 900 }),
          entry({ request: { method: "GET", url: "https://a.example/big" } }, { receive: 400 }),
        ]),
      ),
    );
  it("ranks single phases, longest first", () => {
    const top = slowestPhases(load(), 2);
    expect(top.map((t) => [t.phase, t.ms])).toEqual([["wait", 900], ["receive", 400]]);
  });
  it("never ranks -1", () => {
    expect(slowestPhases(load(), 100).every((t) => t.ms >= 0)).toBe(true);
  });
  it("respects the count", () => expect(slowestPhases(load(), 1)).toHaveLength(1));
});

describe("buildReport", () => {
  it("has the three sections for the sample file", async () => {
    const { readFileSync } = await import("node:fs");
    const text = readFileSync(new URL("../sample/checkout.har", import.meta.url), "utf8");
    const report = buildReport(parseHar(text));
    expect(report).toContain("Slowest phases");
    expect(report).toContain("Uncached requests (7)");
    expect(report).toContain("Render-blocking candidates (2)");
    expect(report).toContain("610 ms  receive  https://shop.example/app.js");
  });
});
