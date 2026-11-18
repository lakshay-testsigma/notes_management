import type { Finding } from "../domain/model.ts";

// Failures first, then the most milliseconds saved, then bytes, then id for a stable order.
export class Ranker {
  rank(findings: Finding[]): Finding[] {
    return [...findings].sort((a, b) => {
      if (a.mode !== b.mode) return a.mode === "fail" ? -1 : 1;
      if (a.savingsMs !== b.savingsMs) return b.savingsMs - a.savingsMs;
      if (a.bytes !== b.bytes) return b.bytes - a.bytes;
      return (a.id + a.detail).localeCompare(b.id + b.detail);
    });
  }
}
