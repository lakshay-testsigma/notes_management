// One HAR response, flattened so the rules never touch the raw HAR shape.
export interface Entry {
  url: string;
  method: string;
  status: number;
  mimeType: string;
  size: number; // uncompressed body size in bytes (HAR content.size)
  headers: Record<string, string>; // lowercase names; repeated headers joined with ", "
}

// ok: the rule passed. problem: the rule failed. unknown: we could not read the header.
export type Result = "ok" | "problem" | "unknown";

export interface Finding {
  url: string;
  rule: string;
  result: Result;
  message: string;
}

export type Kind = "hashed-asset" | "html" | "other";

// What parseCacheControl returns.
export interface CacheControl {
  // true for flag directives (immutable, no-cache), a number for max-age and s-maxage
  directives: Record<string, number | true>;
  // directive texts we could not read, such as "max-age=abc"
  invalid: string[];
}
