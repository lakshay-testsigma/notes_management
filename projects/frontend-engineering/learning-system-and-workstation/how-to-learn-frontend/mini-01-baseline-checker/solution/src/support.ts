import type { BrowserSupport, Compat, SupportStatement } from "./types.js";

// Turn one raw `version_added` value into a BrowserSupport.
export function parseVersion(value: string | boolean | null | undefined): BrowserSupport {
  if (value === false || value === "preview") return { kind: "no" };
  if (typeof value !== "string") return { kind: "unknown" }; // true, null, undefined
  const atMost = value.startsWith("≤");
  return { kind: "yes", version: atMost ? value.slice(1) : value, atMost };
}

// Read one browser's support for a feature.
export function supportFor(compat: Compat, browser: string): BrowserSupport {
  const raw = compat.support[browser];
  if (raw === undefined) return { kind: "no" }; // BCD lists no entry: not supported
  const statements: SupportStatement[] = Array.isArray(raw) ? raw : [raw];
  // Flags, prefixes and old names do not count as "works without a fallback".
  const plain = statements.filter((s) => !s.flags && !s.prefix && !s.alternative_name);
  const current = plain[0]; // BCD lists the newest statement first
  if (!current || current.version_removed) return { kind: "no" };
  return parseVersion(current.version_added);
}
