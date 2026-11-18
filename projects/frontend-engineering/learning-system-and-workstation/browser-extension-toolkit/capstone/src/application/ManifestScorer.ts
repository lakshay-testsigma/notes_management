import type { Policy } from "../domain/Policy.ts";

export interface Score {
  points: number;
  reasons: string[];
}

// Turns one manifest into points. Pure logic: no files, no logging.
export class ManifestScorer {
  private readonly policy: Policy;

  constructor(policy: Policy) {
    this.policy = policy;
  }

  score(manifest: Record<string, unknown>): Score {
    let points = 0;
    const reasons: string[] = [];
    const permissions = this.strings(manifest["permissions"]);
    // Manifest v2 puts host patterns inside "permissions".
    const hosts = [...this.strings(manifest["host_permissions"]), ...permissions.filter((p) => p.includes("://") || p === "<all_urls>")];
    const broadHosts = hosts.some((h) => this.policy.broadHostPatterns.includes(h));

    if (broadHosts) {
      points += this.policy.broadHostPoints;
      reasons.push("can read and change every site");
    }
    if (this.hasAllSitesContentScript(manifest["content_scripts"])) {
      points += this.policy.contentScriptAllSitesPoints;
      reasons.push("runs a content script on every site");
    }
    if (broadHosts && permissions.includes("scripting")) {
      points += this.policy.scriptingWithBroadHostPoints;
      reasons.push("can inject scripts into every site");
    }
    for (const permission of permissions) {
      const apiPoints = this.policy.apiPoints[permission];
      if (apiPoints) {
        points += apiPoints;
        reasons.push(`uses the "${permission}" permission`);
      }
    }
    return { points, reasons };
  }

  private hasAllSitesContentScript(value: unknown): boolean {
    if (!Array.isArray(value)) return false;
    return value.some((script) => this.strings(script?.matches).some((m) => this.policy.broadHostPatterns.includes(m)));
  }

  private strings(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
  }
}
