import { InputError } from "../domain/errors.ts";
import type { HarData, HarRequest } from "../domain/model.ts";
import type { Gatherer } from "../domain/ports.ts";

type Obj = Record<string, unknown>;

const MAX_NUMBER = 2 ** 32 - 1; // same cap idea as DevTools: no huge decoded values
const PHASES = ["blocked", "dns", "connect", "send", "wait", "receive"];

function isObject(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// A HAR file comes from outside, so every number is checked before use.
function readNumber(value: unknown, where: string): number {
  if (value === undefined || value === null) return -1;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InputError(`HAR ${where} is not a number.`);
  }
  return Math.min(value, MAX_NUMBER);
}

// Browsers write -1 for "this phase did not happen". It must not count as 0 ms.
function sumKnownPhases(timings: Obj, where: string): { total: number; wait: number; blocked: number } {
  let total = 0;
  const values: Record<string, number> = {};
  for (const phase of PHASES) {
    const value = readNumber(timings[phase], `${where} timings.${phase}`);
    values[phase] = value;
    if (value >= 0) total += value;
  }
  return { total, wait: Math.max(values.wait, 0), blocked: Math.max(values.blocked, 0) };
}

// _resourceType first, then MIME type, then URL extension (other tools omit the field).
function guessType(entry: Obj, response: Obj, url: string): string {
  if (typeof entry._resourceType === "string") return entry._resourceType.toLowerCase();
  const content = isObject(response.content) ? response.content : {};
  const mime = typeof content.mimeType === "string" ? content.mimeType : "";
  if (mime.includes("javascript")) return "script";
  if (mime.includes("css")) return "stylesheet";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("html")) return "document";
  const ext = url.split("?")[0].split(".").pop() ?? "";
  if (ext === "js" || ext === "mjs") return "script";
  if (ext === "css") return "stylesheet";
  return "other";
}

function readBytes(response: Obj): number {
  const content = isObject(response.content) ? response.content : {};
  const candidates = [response._transferSize, response.bodySize, content.size];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
      return Math.min(candidate, MAX_NUMBER);
    }
  }
  return 0;
}

export class HarGatherer implements Gatherer<HarData> {
  readonly source = "har" as const;

  parse(text: string): HarData {
    let root: unknown;
    try {
      root = JSON.parse(text);
    } catch {
      throw new InputError("HAR file is not valid JSON.");
    }
    if (!isObject(root) || !isObject(root.log) || !Array.isArray(root.log.entries)) {
      throw new InputError("HAR file has no log.entries array.");
    }
    return { requests: root.log.entries.map((entry, index) => this.readEntry(entry, index)) };
  }

  private readEntry(entry: unknown, index: number): HarRequest {
    const where = `entry ${index}`;
    if (!isObject(entry) || !isObject(entry.request) || !isObject(entry.response)) {
      throw new InputError(`HAR ${where} has no request or response object.`);
    }
    const url = typeof entry.request.url === "string" ? entry.request.url : "";
    if (url === "") throw new InputError(`HAR ${where} has no URL.`);
    const status = readNumber(entry.response.status, `${where} status`);
    const hasResponse = status > 0;
    const timings = isObject(entry.timings) ? entry.timings : {};
    const known = sumKnownPhases(timings, where);
    const entryTime = Math.max(readNumber(entry.time, `${where} time`), 0);

    // A request with no response spent all its time blocked, never "waiting".
    const totalMs = hasResponse ? known.total : entryTime;
    return {
      url,
      method: typeof entry.request.method === "string" ? entry.request.method : "GET",
      status: Math.max(status, 0),
      resourceType: guessType(entry, entry.response, url),
      hasResponse,
      fromCache: entry._fromCache !== undefined || entry.response._fromCache === true,
      totalMs,
      waitMs: hasResponse ? known.wait : 0,
      blockedMs: hasResponse ? known.blocked : totalMs,
      bytes: readBytes(entry.response),
    };
  }
}
