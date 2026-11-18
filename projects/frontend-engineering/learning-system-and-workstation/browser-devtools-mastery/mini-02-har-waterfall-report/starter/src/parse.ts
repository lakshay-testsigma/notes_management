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

// TODO(1): Turn the text of a HAR file into a ParsedHar.
//   A HAR file is untrusted input. Throw a HarError for text that is not JSON
//   and for JSON without a log.entries array. Skip single bad entries (use
//   isReadableEntry) and count them in `skipped`. Read
//   log.pages[0].pageTimings.onContentLoad, or use -1 when it is unknown.
export function parseHar(text: string): ParsedHar {
  throw new Error("TODO(1): parseHar is not implemented yet");
}
