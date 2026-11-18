import type { AuditResult, Finding, Manifest, Policy, Verdict } from "./types.js";

// Manifest V2 mixes host patterns into `permissions`; V3 moves them to `host_permissions`.
// This helper is complete, so you can focus on the rules.
export function collectHosts(manifest: Manifest): string[] {
  const fromPermissions = (manifest.permissions ?? []).filter(
    (p) => p === "<all_urls>" || p.includes("://"),
  );
  return [...(manifest.host_permissions ?? []), ...fromPermissions];
}

// Named API permissions only: host patterns are not APIs.
function collectApis(manifest: Manifest): string[] {
  const hosts = new Set(collectHosts(manifest));
  return (manifest.permissions ?? []).filter((p) => !hosts.has(p));
}

// A pattern is broad when the policy lists it: it would match almost every site.
export function isBroadHost(pattern: string, policy: Policy): boolean {
  return policy.broadHostPatterns.includes(pattern);
}

export function findBroadHostFindings(manifest: Manifest, policy: Policy): Finding[] {
  return collectHosts(manifest)
    .filter((host) => isBroadHost(host, policy))
    .map((host) => ({
      rule: "broad-host" as const,
      detail: `Host access ${host} reaches almost every site`,
      points: policy.broadHostPoints,
    }));
}

export function findRiskyApiFindings(manifest: Manifest, policy: Policy): Finding[] {
  const apis = collectApis(manifest);
  const findings: Finding[] = [];
  for (const api of apis) {
    const points = policy.apiPoints[api];
    if (points !== undefined) {
      findings.push({ rule: "risky-api", detail: `Permission ${api}`, points });
    }
  }
  // scripting alone cannot inject anywhere; with broad host access it can run code on any site.
  const hasBroadHost = findBroadHostFindings(manifest, policy).length > 0;
  if (apis.includes("scripting") && hasBroadHost) {
    findings.push({
      rule: "risky-api",
      detail: "scripting combined with broad host access",
      points: policy.scriptingWithBroadHostPoints,
    });
  }
  return findings;
}

export function findContentScriptFindings(manifest: Manifest, policy: Policy): Finding[] {
  const findings: Finding[] = [];
  for (const script of manifest.content_scripts ?? []) {
    for (const match of script.matches ?? []) {
      if (isBroadHost(match, policy)) {
        findings.push({
          rule: "content-script-all-sites",
          detail: `Content script runs on ${match}`,
          points: policy.contentScriptAllSitesPoints,
        });
      }
    }
  }
  return findings;
}

export function verdictFor(score: number, policy: Policy): Verdict {
  if (score >= policy.rejectAt) return "reject";
  if (score >= policy.reviewAt) return "review";
  return "approve";
}

export function auditManifest(manifest: Manifest, policy: Policy): AuditResult {
  const findings = [
    ...findBroadHostFindings(manifest, policy),
    ...findRiskyApiFindings(manifest, policy),
    ...findContentScriptFindings(manifest, policy),
  ];
  const score = findings.reduce((sum, f) => sum + f.points, 0);
  return { name: manifest.name, findings, score, verdict: verdictFor(score, policy) };
}
