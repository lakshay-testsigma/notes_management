import { parseCacheControl } from "./cacheControl.ts";
import type { Entry, Finding, Result } from "./types.ts";

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

export function gradeHashedAsset(entry: Entry): Finding[] {
  const read = readCacheControl(entry);
  if (read.stop) return [read.stop];
  const d = read.parsed.directives;
  const maxAge = typeof d["max-age"] === "number" ? d["max-age"] : 0;
  return [
    finding(entry, "hashed-max-age", maxAge >= ONE_YEAR ? "ok" : "problem",
      `max-age is ${maxAge}; a hashed file never changes, so use at least ${ONE_YEAR}.`),
    finding(entry, "hashed-immutable", d["immutable"] ? "ok" : "problem",
      "Add immutable so browsers skip revalidation on reload."),
    finding(entry, "hashed-no-revalidate", d["no-cache"] || d["no-store"] ? "problem" : "ok",
      "no-cache or no-store on a hashed file throws away its main benefit."),
  ];
}

export function gradeHtml(entry: Entry): Finding[] {
  const read = readCacheControl(entry);
  if (read.stop) return [read.stop];
  const d = read.parsed.directives;
  const maxAge = d["max-age"];
  const revalidates = Boolean(d["no-cache"] || d["no-store"]) || maxAge === 0;
  const findings = [
    finding(entry, "html-revalidates", revalidates ? "ok" : "problem",
      "HTML points to new hashed files, so it must use no-cache or max-age=0."),
    finding(entry, "html-not-immutable", d["immutable"] ? "problem" : "ok",
      "immutable on HTML pins users to an old page."),
  ];
  // no-cache means "ask before reuse"; without ETag or Last-Modified every ask downloads the full page.
  const canValidate = "etag" in entry.headers || "last-modified" in entry.headers;
  if (d["no-cache"] && !d["no-store"]) {
    findings.push(finding(entry, "html-validator", canValidate ? "ok" : "problem",
      "Add an ETag so revalidation can answer 304 with no body."));
  }
  return findings;
}

const TEXT_TYPES = new Set(["text/html", "text/css", "text/javascript", "application/javascript", "application/json", "image/svg+xml"]);

export function gradeVaryAndEncoding(entry: Entry): Finding[] {
  if ([204, 304].includes(entry.status) || entry.method === "HEAD") return [];
  const findings: Finding[] = [];
  const vary = (entry.headers["vary"] ?? "").toLowerCase();
  const coding = (entry.headers["content-encoding"] ?? "").toLowerCase().trim();
  if (vary.split(",").map((v) => v.trim()).includes("*")) {
    findings.push(finding(entry, "vary-star", "problem", "Vary: * means no cache can ever reuse this response."));
  }
  if (coding === "" && TEXT_TYPES.has(entry.mimeType) && entry.size > 1024) {
    findings.push(finding(entry, "compression-missing", "problem", `${entry.size} bytes of ${entry.mimeType} sent without compression.`));
  }
  if (coding.includes(",") || coding === "compress") {
    findings.push(finding(entry, "compression-coding", "problem", `Unusual Content-Encoding "${coding}"; use one of gzip, br or zstd.`));
  }
  if (coding !== "" && !vary.includes("accept-encoding") && !vary.includes("*")) {
    findings.push(finding(entry, "vary-accept-encoding", "problem", "Compressed response needs Vary: Accept-Encoding."));
  }
  return findings;
}
