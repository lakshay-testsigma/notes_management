import type { Phases, RawEntry } from "./types.js";

const NAMES = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"] as const;

// -1 stays -1. A missing, negative, or NaN value also becomes -1.
function clean(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : -1;
}

// TODO(2): Return the Phases of one entry, in milliseconds.
//   A phase that did not happen stays -1 (also for missing or NaN values).
//   `total` adds only the phases that happened; ssl is part of connect.
//   A request with status 0 never got a response: all its time is `blocked`.
export function computePhases(entry: RawEntry): Phases {
  throw new Error("TODO(2): computePhases is not implemented yet");
}
