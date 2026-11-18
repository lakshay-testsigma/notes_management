import type { Finding } from "./types.js";

// A stable id: the same problem on the same element gives the same key.
export function keyOf(f: Finding): string {
  return `${f.page}|${f.rule}|${f.target}`;
}

// TODO(5): Return only violations whose key is not in `baselineKeys`.
export function newViolations(findings: Finding[], baselineKeys: string[]): Finding[] {
  throw new Error("TODO(5): newViolations is not implemented yet");
}
