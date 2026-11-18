import type { Finding } from "./types.js";

// A stable id: the same problem on the same element gives the same key.
export function keyOf(f: Finding): string {
  return `${f.page}|${f.rule}|${f.target}`;
}

// Only violations can fail CI, and only the ones the baseline does not know.
export function newViolations(findings: Finding[], baselineKeys: string[]): Finding[] {
  const known = new Set(baselineKeys);
  return findings.filter((f) => f.outcome === "violation" && !known.has(keyOf(f)));
}
