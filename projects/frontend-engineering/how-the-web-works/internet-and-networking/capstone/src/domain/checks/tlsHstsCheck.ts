import { problem, unknown } from "../finding.ts";
import { firstHeader, hostOf, isHtml } from "../headers.ts";
import type { Check, CheckContext } from "../ports.ts";
import type { Finding } from "../types.ts";

const DAY_MS = 86_400_000;

function protocolNumber(protocol: string): number | null {
  const match = /^TLSv?(\d\.\d)$/i.exec(protocol.trim());
  return match?.[1] ? Number(match[1]) : null;
}

// "*.example.com" covers one label: "www.example.com" yes, "a.b.example.com" no.
function nameMatches(pattern: string, host: string): boolean {
  if (!pattern.startsWith("*.")) return pattern.toLowerCase() === host.toLowerCase();
  const rest = host.split(".").slice(1).join(".");
  return rest.toLowerCase() === pattern.slice(2).toLowerCase();
}

export class TlsHstsCheck implements Check {
  readonly name = "https";

  run({ site, policy, now }: CheckContext): Finding[] {
    const findings: Finding[] = [];
    const { tls } = site;

    const actual = protocolNumber(tls.protocol);
    const wanted = protocolNumber(policy.tls.minProtocol);
    if (actual === null || wanted === null) {
      findings.push(unknown(this.name, "tls.protocol-unreadable", tls.host, `Cannot read protocol "${tls.protocol}".`));
    } else if (actual < wanted) {
      findings.push(problem(this.name, "tls.old-protocol", "error", tls.host, `Negotiated ${tls.protocol}; policy needs ${policy.tls.minProtocol} or newer.`));
    }

    const notAfter = Date.parse(tls.notAfter);
    const notBefore = Date.parse(tls.notBefore);
    if (Number.isNaN(notAfter) || Number.isNaN(notBefore)) {
      findings.push(unknown(this.name, "tls.dates-unreadable", tls.host, "Cannot read the certificate dates."));
    } else if (notAfter < now.getTime()) {
      findings.push(problem(this.name, "tls.expired", "error", tls.host, `Certificate expired on ${tls.notAfter}.`));
    } else if (notBefore > now.getTime()) {
      findings.push(problem(this.name, "tls.not-yet-valid", "error", tls.host, `Certificate is valid from ${tls.notBefore}.`));
    } else {
      const days = Math.floor((notAfter - now.getTime()) / DAY_MS);
      if (days < policy.tls.minDaysToExpiry) {
        findings.push(problem(this.name, "tls.expires-soon", "warning", tls.host, `Certificate expires in ${days} days; policy wants ${policy.tls.minDaysToExpiry}.`));
      }
    }

    if (!tls.subjectAltNames.some((pattern) => nameMatches(pattern, policy.host))) {
      findings.push(problem(this.name, "tls.name-mismatch", "error", policy.host, "No certificate name matches the host."));
    }

    for (const url of new Set(site.entries.map((e) => e.url).filter((u) => u.startsWith("http://")))) {
      findings.push(problem(this.name, "https.insecure-request", "error", url, "Request used plain HTTP."));
    }

    findings.push(...this.checkHsts(site.entries, policy.host, policy.tls.hstsMinMaxAge));
    return findings;
  }

  private checkHsts(entries: CheckContext["site"]["entries"], host: string, minMaxAge: number): Finding[] {
    const page = entries.find((e) => hostOf(e.url) === host && isHtml(e) && e.status === 200);
    if (!page) return [unknown(this.name, "hsts.no-page", host, "No HTML response in the HAR file, so HSTS was not checked.")];
    const header = firstHeader(page, "strict-transport-security");
    if (header === undefined) return [problem(this.name, "hsts.missing", "error", page.url, "No Strict-Transport-Security header.")];
    const match = /max-age\s*=\s*"?(\d+)"?/i.exec(header);
    if (!match?.[1]) return [unknown(this.name, "hsts.unreadable", page.url, `Cannot read max-age in "${header}".`)];
    if (Number(match[1]) < minMaxAge) {
      return [problem(this.name, "hsts.short", "warning", page.url, `HSTS max-age ${match[1]}s is below the policy minimum of ${minMaxAge}s.`)];
    }
    return [];
  }
}
