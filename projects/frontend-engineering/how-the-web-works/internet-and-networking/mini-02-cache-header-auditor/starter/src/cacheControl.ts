import type { CacheControl } from "./types.ts";

// TODO(1): Parse a Cache-Control header value strictly.
// Flags (immutable, no-cache) become `true`. max-age and s-maxage become numbers.
// A value that is not plain digits goes into `invalid`. A repeated directive keeps its smallest value.
export function parseCacheControl(value: string): CacheControl {
  throw new Error("TODO(1): parseCacheControl is not implemented yet");
}
