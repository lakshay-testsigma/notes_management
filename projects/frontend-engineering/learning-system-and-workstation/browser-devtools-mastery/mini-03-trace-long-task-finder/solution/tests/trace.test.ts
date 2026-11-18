import { beforeEach, describe, expect, it } from "vitest";
import type { TraceEvent } from "../src/types.js";
import { readFileSync } from "node:fs";
import { loadTraceEvents, traceStart } from "../src/trace.js";
import { findLongTasks } from "../src/longTasks.js";
import { findLayoutShifts, totalShiftScore } from "../src/layoutShifts.js";
import { formatReport } from "../src/report.js";

const text = readFileSync(new URL("../sample/checkout-trace.json", import.meta.url), "utf8");
let events: TraceEvent[] = [];
beforeEach(() => {
  events = loadTraceEvents(text); // the starter fails here until TODO(1) is done
});

describe("loadTraceEvents", () => {
  it("reads the traceEvents object and drops metadata events", () => {
    expect(events).toHaveLength(9);
    expect(traceStart(events)).toBe(1000000);
  });
  it("reads a bare array of events", () => {
    expect(loadTraceEvents('[{"name":"RunTask","ph":"X","ts":5,"dur":1}]')).toHaveLength(1);
  });
  it("throws a clear error for bad input", () => {
    expect(() => loadTraceEvents("not json")).toThrow("not valid JSON");
    expect(() => loadTraceEvents('{"a":1}')).toThrow("traceEvents");
  });
});

describe("findLongTasks", () => {
  it("keeps only RunTask events longer than 50 ms, longest first", () => {
    const tasks = findLongTasks(events);
    expect(tasks.map((t) => t.durationMs)).toEqual([180, 75.5]);
    expect(tasks[0].startMs).toBe(1000);
  });
  it("accepts another threshold", () => {
    expect(findLongTasks(events, 10)).toHaveLength(4);
  });
});

describe("findLayoutShifts", () => {
  it("skips shifts that follow user input and sorts by time", () => {
    const shifts = findLayoutShifts(events);
    expect(shifts).toEqual([
      { timeMs: 450, score: 0.05 },
      { timeMs: 1800, score: 0.2 },
    ]);
    expect(totalShiftScore(shifts)).toBe(0.25);
  });
});

describe("formatReport", () => {
  it("lists tasks and shifts with their times", () => {
    const out = formatReport(findLongTasks(events), findLayoutShifts(events));
    expect(out).toContain("Long tasks over 50 ms: 2");
    expect(out).toContain("180.0 ms at 1000.0 ms");
    expect(out).toContain("Layout shifts: 2 (total score 0.25)");
    expect(out).toContain("0.200 at 1800.0 ms");
  });
});
