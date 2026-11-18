import type { CacheControl } from "./cacheControl.ts";

export type FreshnessRule = "s-maxage" | "max-age" | "expires" | "heuristic" | "none";

export interface Freshness {
  rule: FreshnessRule;
  seconds: number | null;
}

// Says which rule decides how long a response is fresh. Order from RFC 9111 section 4.2.1:
// s-maxage, max-age, Expires, then a heuristic of 10% of the time since Last-Modified.
export function freshnessRule(cc: CacheControl, expires?: string, date?: string, lastModified?: string): Freshness {
  const sMaxAge = cc.seconds("s-maxage");
  if (sMaxAge !== null) return { rule: "s-maxage", seconds: sMaxAge };
  const maxAge = cc.seconds("max-age");
  if (maxAge !== null) return { rule: "max-age", seconds: maxAge };
  const dateMs = date ? Date.parse(date) : Number.NaN;
  if (expires !== undefined) {
    const expiresMs = Date.parse(expires);
    // An invalid Expires means "already stale" in RFC 9111.
    if (Number.isNaN(expiresMs) || Number.isNaN(dateMs)) return { rule: "expires", seconds: 0 };
    return { rule: "expires", seconds: Math.max(0, Math.floor((expiresMs - dateMs) / 1000)) };
  }
  const modifiedMs = lastModified ? Date.parse(lastModified) : Number.NaN;
  if (!Number.isNaN(modifiedMs) && !Number.isNaN(dateMs) && dateMs > modifiedMs) {
    return { rule: "heuristic", seconds: Math.floor((dateMs - modifiedMs) / 10000) };
  }
  return { rule: "none", seconds: null };
}
