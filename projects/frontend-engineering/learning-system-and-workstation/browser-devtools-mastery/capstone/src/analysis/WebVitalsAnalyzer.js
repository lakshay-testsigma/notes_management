import { MissingTraceDataError } from "../domain/errors.js";
import { Rating } from "../domain/Rating.js";

// Computes LCP, CLS and long tasks from Chrome trace events (timestamps in microseconds).
const SESSION_GAP_US = 1_000_000; // a gap of 1 s starts a new layout-shift session
const SESSION_CAP_US = 5_000_000; // a session lasts at most 5 s
const LONG_TASK_US = 50_000; // a task over 50 ms blocks the main thread

export class WebVitalsAnalyzer {
  // Each metric is its own method, so the report can keep the others when one throws.
  navigationStart(trace) {
    const starts = trace.filter((e) => e.name === "navigationStart" && typeof e.ts === "number");
    if (starts.length === 0) throw new MissingTraceDataError("navigationStart event");
    return Math.max(...starts.map((e) => e.ts)); // the last navigation is the one we asked for
  }

  lcp(trace) {
    const origin = this.navigationStart(trace);
    const candidates = trace.filter((e) => e.name === "largestContentfulPaint::Candidate" && e.ts >= origin);
    if (candidates.length === 0) throw new MissingTraceDataError("largest contentful paint candidate");
    const last = candidates.reduce((a, b) => (b.ts >= a.ts ? b : a));
    const ms = Math.round((last.ts - origin) / 1000);
    return { ms, rating: Rating.of("lcpMs", ms) };
  }

  cls(trace) {
    const shifts = trace
      .filter((e) => e.name === "LayoutShift" && e.args?.data && !e.args.data.had_recent_input)
      .sort((a, b) => a.ts - b.ts);
    let best = 0;
    let sessionScore = 0;
    let sessionStart = 0;
    let lastTs = 0;
    for (const shift of shifts) {
      const startsNew = sessionScore === 0 || shift.ts - lastTs > SESSION_GAP_US || shift.ts - sessionStart > SESSION_CAP_US;
      if (startsNew) {
        sessionScore = 0;
        sessionStart = shift.ts;
      }
      sessionScore += shift.args.data.score ?? 0;
      lastTs = shift.ts;
      best = Math.max(best, sessionScore);
    }
    const value = Math.round(best * 1000) / 1000;
    return { value, shifts: shifts.length, rating: Rating.of("cls", value) };
  }

  longTasks(trace) {
    const tasks = trace.filter((e) => e.name === "RunTask" && typeof e.dur === "number" && e.dur > LONG_TASK_US);
    const blockingMs = tasks.reduce((sum, t) => sum + (t.dur - LONG_TASK_US) / 1000, 0);
    const tbt = Math.round(blockingMs);
    return {
      count: tasks.length,
      totalBlockingMs: tbt,
      rating: Rating.of("tbtMs", tbt),
      longest: tasks.map((t) => Math.round(t.dur / 1000)).sort((a, b) => b - a).slice(0, 5),
    };
  }
}
