import type { LongTask, TraceEvent } from "./types.js";
import { traceStart } from "./trace.js";

// Chrome counts a main-thread task as long when it runs for more than 50 ms.
export function findLongTasks(events: TraceEvent[], thresholdMs = 50): LongTask[] {
  const start = traceStart(events);
  return events
    .filter((e) => e.name === "RunTask" && e.ph === "X" && (e.dur ?? 0) / 1000 > thresholdMs)
    .map((e) => ({ startMs: (e.ts - start) / 1000, durationMs: (e.dur ?? 0) / 1000 }))
    .sort((a, b) => b.durationMs - a.durationMs); // longest first: fix that one first
}
