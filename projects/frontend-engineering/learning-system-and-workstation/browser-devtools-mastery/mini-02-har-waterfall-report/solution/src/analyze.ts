import { computePhases } from "./phases.js";
import type { ParsedHar, PhaseName, Request } from "./types.js";

const EXTENSIONS: Record<string, string> = {
  css: "stylesheet", js: "script", mjs: "script", png: "image", jpg: "image",
  jpeg: "image", webp: "image", svg: "image", woff2: "font", woff: "font", html: "document",
};

// Chrome writes _resourceType. A HAR from another tool does not, so fall back
// to the MIME type and then to the file extension.
function guessType(entry: ParsedHar["entries"][number]): string {
  if (entry._resourceType) return entry._resourceType.toLowerCase();
  const mime = entry.response.content?.mimeType ?? "";
  if (mime.includes("css")) return "stylesheet";
  if (mime.includes("javascript")) return "script";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("html")) return "document";
  const ext = new URL(entry.request.url, "http://x").pathname.split(".").pop() ?? "";
  return EXTENSIONS[ext] ?? "other";
}

export function toRequests(har: ParsedHar): Request[] {
  const first = Math.min(...har.entries.map((e) => Date.parse(e.startedDateTime)));
  return har.entries.map((entry) => ({
    url: entry.request.url,
    status: entry.response.status,
    type: guessType(entry),
    fromCache: Boolean(entry._fromCache),
    startMs: Date.parse(entry.startedDateTime) - first,
    phases: computePhases(entry),
  }));
}

// A 304 answer still cost a round trip, so only a cache hit counts as cached.
export function isUncached(request: Request): boolean {
  return !request.fromCache;
}

// HAR files carry no "render-blocking" flag, so this is a heuristic: a
// stylesheet or script that started before DOMContentLoaded probably held the page.
export function isRenderBlocking(request: Request, contentLoadedMs: number): boolean {
  if (request.type !== "stylesheet" && request.type !== "script") return false;
  return contentLoadedMs < 0 || request.startMs < contentLoadedMs;
}

export interface SlowPhase {
  url: string;
  phase: PhaseName;
  ms: number;
}

const PHASES: PhaseName[] = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"];

// The longest single phases over all requests. -1 (not applicable) is never ranked.
export function slowestPhases(requests: Request[], count: number): SlowPhase[] {
  const all: SlowPhase[] = [];
  for (const request of requests) {
    for (const phase of PHASES) {
      const ms = request.phases[phase];
      if (ms >= 0) all.push({ url: request.url, phase, ms });
    }
  }
  all.sort((a, b) => b.ms - a.ms || a.url.localeCompare(b.url));
  return all.slice(0, count);
}
