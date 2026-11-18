import { isRenderBlocking, isUncached, slowestPhases, toRequests } from "./analyze.js";
import type { ParsedHar } from "./types.js";

// The report never prints headers or cookies: it does not read them at all.
export function buildReport(har: ParsedHar): string {
  if (har.entries.length === 0) return "No readable requests in this file.\n";
  const requests = toRequests(har);
  const lines: string[] = [];

  lines.push(`Requests: ${requests.length} (skipped ${har.skipped} unreadable)`, "");

  lines.push("Slowest phases");
  for (const item of slowestPhases(requests, 5)) {
    lines.push(`  ${item.ms.toFixed(0).padStart(5)} ms  ${item.phase.padEnd(8)} ${item.url}`);
  }

  const uncached = requests.filter(isUncached);
  lines.push("", `Uncached requests (${uncached.length})`);
  for (const r of uncached) lines.push(`  ${String(r.status).padEnd(4)} ${r.type.padEnd(10)} ${r.url}`);

  const blocking = requests.filter((r) => isRenderBlocking(r, har.contentLoadedMs));
  lines.push("", `Render-blocking candidates (${blocking.length})`);
  for (const r of blocking) lines.push(`  ${r.type.padEnd(10)} ${r.url}`);

  return lines.join("\n") + "\n";
}
