import type { CheckContext } from "../src/domain/ports.ts";
import type { HttpEntry, Policy, SiteData } from "../src/domain/types.ts";

export const NOW = new Date("2026-11-18T00:00:00Z");

export const POLICY: Policy = {
  host: "www.example.com",
  dns: { minTtl: 300, maxTtl: 86400, requireCaa: true, requireAaaa: true },
  tls: { minProtocol: "TLSv1.3", minDaysToExpiry: 21, hstsMinMaxAge: 15552000 },
  http: { minVersion: "h2" },
  caching: { hashedAssetPattern: "\\.[0-9a-f]{8}\\.[a-z0-9]+$", hashedAssetMinMaxAge: 31536000, htmlMaxAge: 600 },
  compression: { minBytes: 1024 },
  cookies: { allowNoHttpOnly: ["theme"] },
};

export function entry(url: string, headers: Record<string, string | string[]> = {}, over: Partial<HttpEntry> = {}): HttpEntry {
  const list = Object.entries(headers).flatMap(([name, v]) => (Array.isArray(v) ? v : [v]).map((value) => ({ name, value })));
  return { method: "GET", url, status: 200, httpVersion: "h2", mimeType: "text/html", decodedSize: 5000, headers: list, ...over };
}

export function context(entries: HttpEntry[] = [], over: Partial<SiteData> = {}): CheckContext {
  const site: SiteData = {
    dns: { host: "www.example.com", records: [{ type: "A", name: "www.example.com", ttl: 3600, value: "203.0.113.10" }] },
    tls: { host: "www.example.com", protocol: "TLSv1.3", notBefore: "2026-10-01T00:00:00Z", notAfter: "2027-06-01T00:00:00Z", subjectAltNames: ["*.example.com"] },
    entries,
    client: "test client",
    ...over,
  };
  return { site, policy: POLICY, now: NOW };
}

export function rules(findings: { rule: string }[]): string[] {
  return findings.map((f) => f.rule);
}
