// Shapes shared by every module. Only the manifest fields this audit reads are listed.
export interface ContentScript {
  matches?: string[];
}

export interface Manifest {
  name: string;
  manifest_version: number;
  permissions?: string[];
  host_permissions?: string[];
  content_scripts?: ContentScript[];
}

export interface Policy {
  broadHostPatterns: string[];
  broadHostPoints: number;
  contentScriptAllSitesPoints: number;
  scriptingWithBroadHostPoints: number;
  apiPoints: Record<string, number>;
  reviewAt: number;
  rejectAt: number;
}

export interface Finding {
  rule: "broad-host" | "risky-api" | "content-script-all-sites";
  detail: string;
  points: number;
}

export type Verdict = "approve" | "review" | "reject";

export interface AuditResult {
  name: string;
  findings: Finding[];
  score: number;
  verdict: Verdict;
}
