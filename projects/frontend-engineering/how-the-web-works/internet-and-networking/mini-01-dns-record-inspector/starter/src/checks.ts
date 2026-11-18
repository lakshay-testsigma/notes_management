import type { Finding, RecordSet, Report } from "./types.ts";

export interface CheckOptions {
  maxTtl: number; // seconds; higher TTLs are flagged before a cutover
  expectedCa: string; // the CA domain the new host uses, for example "letsencrypt.org"
}

// TODO(3): Warn about TTLs above `maxTtl`.
//   Resolvers keep an answer until its TTL runs out, so a long TTL delays the switch.
//   1. Keep the records whose ttl is a number greater than maxTtl (ignore ttl null).
//   2. Return one Finding per record: level "warn", type set.type, and a message that
//      contains the record value and its TTL.
export function checkTtl(set: RecordSet, maxTtl: number): Finding[] {
  throw new Error("TODO(3): checkTtl is not implemented yet");
}

// TODO(4): Flag a CNAME that sits next to an A or AAAA record.
//   A CNAME must be the only record at its name.
//   1. Read report.sets.A, report.sets.AAAA and report.sets.CNAME.
//   2. When CNAME has records and A or AAAA has records, return one Finding with
//      level "error" and type "CNAME". Otherwise return [].
export function checkCnameConflict(report: Report): Finding[] {
  throw new Error("TODO(4): checkCnameConflict is not implemented yet");
}

// TODO(5): Check that CAA lets the new host's CA issue certificates.
//   1. No CAA records: return one "info" Finding (any CA may issue).
//   2. Records are strings like "issue letsencrypt.org". If one starts with "issue " and
//      its CA equals `expectedCa`, return [].
//   3. Otherwise return one "error" Finding whose message names `expectedCa`.
export function checkCaa(set: RecordSet, expectedCa: string): Finding[] {
  throw new Error("TODO(5): checkCaa is not implemented yet");
}

// Wiring: complete in the starter too. It calls the three checks above and adds the simple ones.
export function analyze(report: Report, options: CheckOptions): Finding[] {
  const { A, AAAA, CNAME, CAA, HTTPS } = report.sets;
  const findings: Finding[] = [];

  for (const set of Object.values(report.sets)) {
    if (set.status === "error") findings.push({ level: "error", type: set.type, message: `Lookup failed: ${set.message}` });
  }
  if (A.records.length + AAAA.records.length + CNAME.records.length === 0) {
    findings.push({ level: "error", type: "ALL", message: "The name has no A, AAAA or CNAME record, so browsers cannot reach it." });
  }
  if (A.records.length > 0 && AAAA.records.length === 0) {
    findings.push({ level: "info", type: "AAAA", message: "No AAAA record: IPv6-only clients cannot reach this site." });
  }
  findings.push(...checkTtl(A, options.maxTtl), ...checkTtl(AAAA, options.maxTtl));
  findings.push(...checkCnameConflict(report));
  if (CAA.status !== "error") findings.push(...checkCaa(CAA, options.expectedCa));
  if (HTTPS.status === "unsupported") {
    findings.push({ level: "info", type: "HTTPS", message: "HTTPS record not checked. Run: dig HTTPS <name>" });
  }
  return findings;
}
