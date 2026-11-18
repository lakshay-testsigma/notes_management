import { parseCacheControl } from "./cacheControl.ts";
import type { Entry, Finding, Result } from "./types.ts";

// Use this constant in TODO(3).
const ONE_YEAR = 31536000;

function finding(entry: Entry, rule: string, result: Result, message: string): Finding {
  return { url: entry.url, rule, result, message };
}

// Returns a finding when Cache-Control is missing or unreadable, so callers can stop early.
function readCacheControl(entry: Entry) {
  const raw = entry.headers["cache-control"];
  if (raw === undefined) {
    return { stop: finding(entry, "cache-control-present", "problem", "No Cache-Control header.") };
  }
  const parsed = parseCacheControl(raw);
  if (parsed.invalid.length > 0) {
    // Fail closed: an unreadable header is its own result, not a pass.
    return { stop: finding(entry, "cache-control-readable", "unknown", `Could not read: ${parsed.invalid.join(", ")}`) };
  }
  return { parsed };
}

// TODO(3): Grade a hashed asset: one-year max-age, immutable, and no no-cache or no-store. Rule names: hashed-max-age, hashed-immutable, hashed-no-revalidate.
export function gradeHashedAsset(entry: Entry): Finding[] {
  throw new Error("TODO(3): gradeHashedAsset is not implemented yet");
}

// TODO(4): Grade an HTML page: it must revalidate, must not be immutable, and no-cache needs an ETag or Last-Modified. Rule names: html-revalidates, html-not-immutable, html-validator.
export function gradeHtml(entry: Entry): Finding[] {
  throw new Error("TODO(4): gradeHtml is not implemented yet");
}

// Use this set in TODO(5).
const TEXT_TYPES = new Set(["text/html", "text/css", "text/javascript", "application/javascript", "application/json", "image/svg+xml"]);

// TODO(5): Grade Vary and Content-Encoding: vary-star, compression-missing, compression-coding, vary-accept-encoding. Skip 204, 304 and HEAD.
export function gradeVaryAndEncoding(entry: Entry): Finding[] {
  throw new Error("TODO(5): gradeVaryAndEncoding is not implemented yet");
}
