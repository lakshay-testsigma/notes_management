import type { Outcome } from "./Outcome.ts";
import { PolicyError } from "./errors.ts";

interface PolicyValues {
  phases: string[];
  broadHostPatterns: string[];
  broadHostPoints: number;
  contentScriptAllSitesPoints: number;
  scriptingWithBroadHostPoints: number;
  apiPoints: Record<string, number>;
  reviewAt: number;
  rejectAt: number;
}

// The permission policy is data (a JSON file). `fromJson` checks its shape
// first, so a typo in the file stops the run before any extension is judged.
export class Policy {
  readonly phases: string[];
  readonly broadHostPatterns: string[];
  readonly broadHostPoints: number;
  readonly contentScriptAllSitesPoints: number;
  readonly scriptingWithBroadHostPoints: number;
  readonly apiPoints: Record<string, number>;
  readonly reviewAt: number;
  readonly rejectAt: number;

  private constructor(v: PolicyValues) {
    this.phases = v.phases;
    this.broadHostPatterns = v.broadHostPatterns;
    this.broadHostPoints = v.broadHostPoints;
    this.contentScriptAllSitesPoints = v.contentScriptAllSitesPoints;
    this.scriptingWithBroadHostPoints = v.scriptingWithBroadHostPoints;
    this.apiPoints = v.apiPoints;
    this.reviewAt = v.reviewAt;
    this.rejectAt = v.rejectAt;
  }

  static fromJson(raw: unknown): Policy {
    const problems: string[] = [];
    const o = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const strings = (key: string): string[] => {
      const v = o[key];
      if (!Array.isArray(v) || v.length === 0 || !v.every((x) => typeof x === "string")) {
        problems.push(`"${key}" must be a non-empty list of strings`);
        return [];
      }
      return v as string[];
    };
    const number = (key: string): number => {
      const v = o[key];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        problems.push(`"${key}" must be a number of 0 or more`);
        return 0;
      }
      return v;
    };
    const apiPoints: Record<string, number> = {};
    const api = o["apiPoints"];
    if (typeof api !== "object" || api === null || Array.isArray(api)) {
      problems.push(`"apiPoints" must be an object of API name to points`);
    } else {
      for (const [name, points] of Object.entries(api)) {
        if (typeof points === "number" && points >= 0) apiPoints[name] = points;
        else problems.push(`"apiPoints.${name}" must be a number of 0 or more`);
      }
    }
    const values: PolicyValues = {
      phases: strings("phases"),
      broadHostPatterns: strings("broadHostPatterns"),
      broadHostPoints: number("broadHostPoints"),
      contentScriptAllSitesPoints: number("contentScriptAllSitesPoints"),
      scriptingWithBroadHostPoints: number("scriptingWithBroadHostPoints"),
      apiPoints,
      reviewAt: number("reviewAt"),
      rejectAt: number("rejectAt"),
    };
    if (values.reviewAt >= values.rejectAt) problems.push(`"reviewAt" must be lower than "rejectAt"`);
    if (problems.length > 0) throw new PolicyError(`Invalid policy: ${problems.join("; ")}`);
    return new Policy(values);
  }

  judge(score: number): Outcome {
    if (score >= this.rejectAt) return "fail";
    if (score >= this.reviewAt) return "review";
    return "pass";
  }
}
