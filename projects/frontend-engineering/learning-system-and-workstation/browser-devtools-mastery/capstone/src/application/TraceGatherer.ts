import { InputError } from "../domain/errors.ts";
import type { LongTask, TraceData } from "../domain/model.ts";
import type { Gatherer } from "../domain/ports.ts";

const LONG_TASK_MS = 50; // the web.dev definition of a long task

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Trace timestamps are in microseconds.
const toMs = (microseconds: number): number => microseconds / 1000;

export class TraceGatherer implements Gatherer<TraceData> {
  readonly source = "trace" as const;

  parse(text: string): TraceData {
    let root: unknown;
    try {
      root = JSON.parse(text);
    } catch {
      throw new InputError("Trace file is not valid JSON.");
    }
    // Chrome saves either a bare array or { traceEvents: [...] }.
    const events = Array.isArray(root) ? root : isObject(root) ? root.traceEvents : undefined;
    if (!Array.isArray(events)) throw new InputError("Trace file has no traceEvents array.");

    const longTasks: LongTask[] = [];
    let totalBlockingMs = 0;
    let cumulativeLayoutShift = 0;

    // Bad single events are skipped: one odd event must not hide the rest.
    for (const event of events) {
      if (!isObject(event)) continue;
      if (event.name === "RunTask" && typeof event.dur === "number" && typeof event.ts === "number") {
        const durationMs = toMs(event.dur);
        if (durationMs > LONG_TASK_MS) {
          longTasks.push({ startMs: toMs(event.ts), durationMs });
          totalBlockingMs += durationMs - LONG_TASK_MS;
        }
      }
      if (event.name === "LayoutShift" && isObject(event.args) && isObject(event.args.data)) {
        const data = event.args.data;
        if (typeof data.score === "number" && data.had_recent_input !== true) {
          cumulativeLayoutShift += data.score;
        }
      }
    }
    return { longTasks, totalBlockingMs, cumulativeLayoutShift };
  }
}
