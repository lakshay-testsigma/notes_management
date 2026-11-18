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
// TODO(3): Return true when the request was not served from the browser cache.
//   Decide what a 304 answer counts as, and why.
export function isUncached(request: Request): boolean {
  throw new Error("TODO(3): isUncached is not implemented yet");
}

// HAR files carry no "render-blocking" flag, so this is a heuristic: a
// stylesheet or script that started before DOMContentLoaded probably held the page.
// TODO(4): Return true for a stylesheet or script that probably held back the
//   first render. A HAR file has no such flag, so use a heuristic based on
//   when the request started compared with `contentLoadedMs` (-1 = unknown).
export function isRenderBlocking(request: Request, contentLoadedMs: number): boolean {
  throw new Error("TODO(4): isRenderBlocking is not implemented yet");
}

export interface SlowPhase {
  url: string;
  phase: PhaseName;
  ms: number;
}

const PHASES: PhaseName[] = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"];

// TODO(5): Return the `count` longest single phases over all requests,
//   longest first. Never rank a phase that is -1.
export function slowestPhases(requests: Request[], count: number): SlowPhase[] {
  throw new Error("TODO(5): slowestPhases is not implemented yet");
}
