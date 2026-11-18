import type { Phases, RawEntry } from "./types.js";

const NAMES = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"] as const;

// -1 stays -1. A missing, negative, or NaN value also becomes -1.
function clean(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : -1;
}

export function computePhases(entry: RawEntry): Phases {
  const phases = { total: 0 } as Phases;
  for (const name of NAMES) phases[name] = clean(entry.timings[name]);

  // A request with no response (status 0) never left the browser:
  // all of its time counts as blocked.
  if (entry.response.status === 0) {
    const time = clean(entry.time);
    return { ...phases, blocked: time, total: Math.max(time, 0) };
  }

  // In a HAR file, ssl is a part of connect, so it is not added a second time.
  const parts = [phases.blocked, phases.dns, phases.connect, phases.send, phases.wait, phases.receive];
  phases.total = parts.filter((ms) => ms >= 0).reduce((sum, ms) => sum + ms, 0);
  return phases;
}
