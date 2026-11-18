import type { LayoutShift, TraceEvent } from "./types.js";
import { traceStart } from "./trace.js";

export function findLayoutShifts(events: TraceEvent[]): LayoutShift[] {
  const start = traceStart(events);
  return events
    .filter((e) => e.name === "LayoutShift" && e.args?.data?.had_recent_input !== true) // shifts after a click do not count
    .map((e) => ({ timeMs: (e.ts - start) / 1000, score: e.args?.data?.score ?? 0 }))
    .sort((a, b) => a.timeMs - b.timeMs);
}

export function totalShiftScore(shifts: LayoutShift[]): number {
  return Math.round(shifts.reduce((sum, s) => sum + s.score, 0) * 1000) / 1000;
}
