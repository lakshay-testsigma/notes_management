import { problem, unknown } from "../finding.ts";
import type { Check, CheckContext } from "../ports.ts";
import type { Finding } from "../types.ts";

const RANK: Record<string, number> = { "http/1.0": 0, "http/1.1": 1, h2: 2, h3: 3 };

// HAR files write versions in many ways: "h2", "HTTP/2.0", "h3-29".
export function normalizeVersion(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (v.startsWith("h3") || v === "http/3" || v === "http/3.0") return "h3";
  if (v === "h2" || v === "http/2" || v === "http/2.0") return "h2";
  if (v === "http/1.1" || v === "http/1.0") return v;
  return null;
}

export class HttpVersionCheck implements Check {
  readonly name = "http-version";

  run({ site, policy }: CheckContext): Finding[] {
    const findings: Finding[] = [];
    const wanted = RANK[policy.http.minVersion];
    // The server picks the version from what the client offers (ALPN), so name the client.
    const client = site.client;
    for (const entry of site.entries) {
      const version = normalizeVersion(entry.httpVersion);
      if (version === null || wanted === undefined) {
        findings.push(unknown(this.name, "http.version-unreadable", entry.url, `Cannot read HTTP version "${entry.httpVersion}".`));
      } else if ((RANK[version] ?? 0) < wanted) {
        findings.push(problem(this.name, "http.old-version", "warning", entry.url, `Served over ${version} to ${client}; policy wants ${policy.http.minVersion} or newer.`));
      }
    }
    return findings;
  }
}
