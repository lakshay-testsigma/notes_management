import type { TraceEvent } from "./types.js";

// A trace file is either a bare array of events or { traceEvents: [...] }.
export function loadTraceEvents(text: string): TraceEvent[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Trace is not valid JSON");
  }
  const list = Array.isArray(data) ? data : (data as { traceEvents?: unknown })?.traceEvents;
  if (!Array.isArray(list)) {
    throw new Error("Trace has no traceEvents array");
  }
  // Metadata events ("M") carry ts 0, which would fake an early trace start.
  return list.filter((e) => e && e.ph !== "M" && typeof e.ts === "number");
}

// The earliest timestamp; every reported time is measured from here.
export function traceStart(events: TraceEvent[]): number {
  return events.length === 0 ? 0 : Math.min(...events.map((e) => e.ts));
}
