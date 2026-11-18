// One event from a Chrome trace file. Times (ts, dur) are in microseconds.
export interface TraceEvent {
  name: string;
  ph: string; // "X" is a complete event: it has a start (ts) and a length (dur)
  ts: number;
  dur?: number;
  args?: { data?: { score?: number; had_recent_input?: boolean } };
}

export interface LongTask {
  startMs: number; // since the start of the trace
  durationMs: number;
}

export interface LayoutShift {
  timeMs: number; // since the start of the trace
  score: number;
}
