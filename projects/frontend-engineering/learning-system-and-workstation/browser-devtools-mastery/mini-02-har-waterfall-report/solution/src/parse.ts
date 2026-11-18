import type { ParsedHar, RawEntry } from "./types.js";

export class HarError extends Error {}

function isReadableEntry(value: any): value is RawEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.request?.url === "string" &&
    typeof value.response?.status === "number" &&
    typeof value.timings === "object" &&
    value.timings !== null &&
    Number.isFinite(Date.parse(value.startedDateTime))
  );
}

// A HAR file is untrusted input: a file from a colleague or another tool.
// Fail with a clear HarError for a broken file; skip single bad entries.
export function parseHar(text: string): ParsedHar {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new HarError("The file is not valid JSON.");
  }
  const rawEntries = data?.log?.entries;
  if (!Array.isArray(rawEntries)) {
    throw new HarError("The file has no log.entries array, so it is not a HAR file.");
  }
  const entries = rawEntries.filter(isReadableEntry);
  const loaded = data.log.pages?.[0]?.pageTimings?.onContentLoad;
  return {
    entries,
    skipped: rawEntries.length - entries.length,
    contentLoadedMs: typeof loaded === "number" && loaded >= 0 ? loaded : -1,
  };
}
