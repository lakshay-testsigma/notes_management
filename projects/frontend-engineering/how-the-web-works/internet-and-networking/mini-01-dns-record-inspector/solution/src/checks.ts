import type { Finding, RecordSet, Report } from "./types.ts";

export interface CheckOptions {
  maxTtl: number; // seconds; higher TTLs are flagged before a cutover
  expectedCa: string; // the CA domain the new host uses, for example "letsencrypt.org"
}

// Resolvers keep an answer until its TTL runs out, so a long TTL delays the switch for that long.
export function checkTtl(set: RecordSet, maxTtl: number): Finding[] {
  return set.records
    .filter((r) => r.ttl !== null && r.ttl > maxTtl)
    .map((r) => ({
      level: "warn" as const,
      type: set.type,
      message: `${set.type} ${r.value} has TTL ${r.ttl}s, above ${maxTtl}s. Lower it a full old-TTL before the switch.`,
    }));
}

// A CNAME must be the only record at its name, so it cannot sit next to an A or AAAA record.
export function checkCnameConflict(report: Report): Finding[] {
  const { A, AAAA, CNAME } = report.sets;
  if (CNAME.records.length > 0 && A.records.length + AAAA.records.length > 0) {
    return [{ level: "error", type: "CNAME", message: "CNAME exists next to A or AAAA records. Remove one of them." }];
  }
  return [];
}

// A CAA record limits which CAs may issue certificates. If the new host's CA is not listed, issuance fails.
export function checkCaa(set: RecordSet, expectedCa: string): Finding[] {
  if (set.records.length === 0) {
    return [{ level: "info", type: "CAA", message: "No CAA records: any CA may issue certificates." }];
  }
  const allowed = set.records.some((r) => r.value.startsWith("issue ") && r.value.slice(6).trim() === expectedCa);
  if (allowed) return [];
  return [{ level: "error", type: "CAA", message: `CAA does not allow ${expectedCa} to issue. Add: 0 issue "${expectedCa}".` }];
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
