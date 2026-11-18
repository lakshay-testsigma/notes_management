// Plain data shared by every layer. No behaviour lives here.

export type SourceName = "har" | "trace" | "lighthouse";

// "fail" breaks a budget. "info" is shown but never changes the exit code.
export type Mode = "fail" | "info";

export interface Finding {
  source: SourceName;
  id: string;
  title: string;
  detail: string;
  mode: Mode;
  // Estimated milliseconds saved if fixed. 0 when the number is not a time.
  savingsMs: number;
  bytes: number;
  // Lighthouse numbers are lab (or simulated) data, never field data.
  dataKind: "recorded" | "lab" | "simulated";
}

export interface SkippedInput {
  source: SourceName;
  reason: string;
}

export interface TriageReport {
  findings: Finding[];
  skipped: SkippedInput[];
  checked: SourceName[];
}

// What the HAR gatherer returns. A phase of -1 in the file becomes 0 here,
// and `hasResponse` keeps the difference between "fast" and "no answer".
export interface HarRequest {
  url: string;
  method: string;
  status: number;
  resourceType: string;
  hasResponse: boolean;
  fromCache: boolean;
  totalMs: number;
  waitMs: number;
  blockedMs: number;
  bytes: number;
}

export interface HarData {
  requests: HarRequest[];
}

export interface LongTask {
  startMs: number;
  durationMs: number;
}

export interface TraceData {
  longTasks: LongTask[];
  totalBlockingMs: number;
  cumulativeLayoutShift: number;
}

export interface LighthouseMetric {
  id: string;
  title: string;
  value: number;
}

export interface LighthouseOpportunity {
  id: string;
  title: string;
  savingsMs: number;
  savingsBytes: number;
}

export interface LighthouseData {
  performanceScore: number | null;
  throttling: "simulated" | "lab";
  metrics: LighthouseMetric[];
  opportunities: LighthouseOpportunity[];
}
