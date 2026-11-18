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
// TODO(1): Return true when `pattern` is one of the broad patterns listed in the policy.
//   1. Read policy.broadHostPatterns (a list of strings such as "<all_urls>").
//   2. Return whether that list includes `pattern`.
export function isBroadHost(pattern: string, policy: Policy): boolean {
  throw new Error("TODO(1): isBroadHost is not implemented yet");
}

// TODO(2): Return one Finding for every broad host in the manifest.
//   1. Get the hosts with collectHosts(manifest).
//   2. Keep only the hosts for which isBroadHost(host, policy) is true.
//   3. Map each one to { rule: "broad-host", detail: "Host access <host> reaches almost every site",
//      points: policy.broadHostPoints }.
export function findBroadHostFindings(manifest: Manifest, policy: Policy): Finding[] {
  throw new Error("TODO(2): findBroadHostFindings is not implemented yet");
}

// TODO(3): Return one Finding per risky API permission, plus one combo finding.
//   1. Loop over collectApis(manifest). Look each name up in policy.apiPoints.
//   2. When a name has points, push { rule: "risky-api", detail: "Permission <name>", points }.
//      Names that are not in the policy score nothing.
//   3. When the manifest has "scripting" AND findBroadHostFindings(...) is not empty, push
//      { rule: "risky-api", detail: "scripting combined with broad host access",
//        points: policy.scriptingWithBroadHostPoints }.
export function findRiskyApiFindings(manifest: Manifest, policy: Policy): Finding[] {
  throw new Error("TODO(3): findRiskyApiFindings is not implemented yet");
}

// TODO(4): Return one Finding for every content script match that is a broad pattern.
//   1. Loop over manifest.content_scripts (it may be missing) and each script's `matches`.
//   2. When isBroadHost(match, policy) is true, push { rule: "content-script-all-sites",
//      detail: "Content script runs on <match>", points: policy.contentScriptAllSitesPoints }.
export function findContentScriptFindings(manifest: Manifest, policy: Policy): Finding[] {
  throw new Error("TODO(4): findContentScriptFindings is not implemented yet");
}

// TODO(5): Turn a score into a verdict using the policy thresholds.
//   score >= policy.rejectAt -> "reject"; score >= policy.reviewAt -> "review"; otherwise "approve".
export function verdictFor(score: number, policy: Policy): Verdict {
  throw new Error("TODO(5): verdictFor is not implemented yet");
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
