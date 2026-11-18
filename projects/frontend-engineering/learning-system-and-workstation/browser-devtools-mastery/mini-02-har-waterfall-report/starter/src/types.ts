// The part of a HAR file this tool reads. A HAR file is JSON: log.entries has
// one entry per request. Fields that start with "_" are Chrome extras.
export interface RawEntry {
  startedDateTime: string;
  time: number;
  request: { method: string; url: string };
  response: { status: number; content?: { mimeType?: string } };
  timings: Record<string, number | undefined>;
  _resourceType?: string;
  _fromCache?: string;
}

// Milliseconds per phase. -1 means "not applicable" (the phase did not happen).
export interface Phases {
  blocked: number;
  dns: number;
  connect: number;
  ssl: number;
  send: number;
  wait: number;
  receive: number;
  total: number;
}

// One request, cleaned up so the analysis code never touches raw JSON.
export interface Request {
  url: string;
  status: number;
  type: string; // "document", "stylesheet", "script", "image", ...
  fromCache: boolean;
  startMs: number; // since the first request started
  phases: Phases;
}

export interface ParsedHar {
  entries: RawEntry[];
  skipped: number; // entries that were unreadable
  contentLoadedMs: number; // pageTimings.onContentLoad, or -1 if unknown
}

export type PhaseName = Exclude<keyof Phases, "total">;
