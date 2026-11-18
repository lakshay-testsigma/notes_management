import { problem } from "../finding.ts";
import type { Check, CheckContext } from "../ports.ts";
import type { Finding } from "../types.ts";

export class DnsCheck implements Check {
  readonly name = "dns";

  run({ site, policy }: CheckContext): Finding[] {
    const findings: Finding[] = [];
    const { records, host } = site.dns;
    const ofType = (type: string) => records.filter((r) => r.type === type);

    if (ofType("A").length + ofType("AAAA").length + ofType("CNAME").length === 0) {
      findings.push(problem(this.name, "dns.no-address", "error", host, "No A, AAAA or CNAME record. Browsers cannot find the site."));
    }
    if (policy.dns.requireAaaa && ofType("AAAA").length === 0) {
      findings.push(problem(this.name, "dns.no-aaaa", "warning", host, "No AAAA record. IPv6-only users cannot reach the site."));
    }
    if (policy.dns.requireCaa && ofType("CAA").length === 0) {
      findings.push(problem(this.name, "dns.no-caa", "warning", host, "No CAA record. Any certificate authority may issue certificates for this name."));
    }
    for (const cname of ofType("CNAME")) {
      const others = records.filter((r) => r.name === cname.name && r.type !== "CNAME");
      if (others.length > 0) {
        findings.push(problem(this.name, "dns.cname-conflict", "error", cname.name, `A CNAME cannot share a name with ${others[0]?.type} records.`));
      }
    }
    for (const record of records) {
      const subject = `${record.type} ${record.name}`;
      if (record.ttl < policy.dns.minTtl) {
        findings.push(problem(this.name, "dns.ttl-low", "warning", subject, `TTL ${record.ttl}s is below the policy minimum of ${policy.dns.minTtl}s.`));
      } else if (record.ttl > policy.dns.maxTtl) {
        findings.push(problem(this.name, "dns.ttl-high", "warning", subject, `TTL ${record.ttl}s is above the policy maximum of ${policy.dns.maxTtl}s. A change would spread slowly.`));
      }
    }
    return findings;
  }
}
