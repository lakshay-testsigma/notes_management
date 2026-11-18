import type { CacheControl } from "./types.ts";

const NUMERIC = new Set(["max-age", "s-maxage"]);

// Strict parse, the way undici does it: a value we cannot read is recorded, never guessed,
// and a repeated directive keeps its most restrictive (smallest) value.
export function parseCacheControl(value: string): CacheControl {
  const result: CacheControl = { directives: {}, invalid: [] };
  for (const part of value.split(",")) {
    const text = part.trim();
    if (text === "") continue;
    const [rawName, ...rest] = text.split("=");
    const name = rawName.trim().toLowerCase();
    if (!NUMERIC.has(name)) {
      result.directives[name] = true;
      continue;
    }
    const raw = rest.join("=").trim().replace(/^"(.*)"$/, "$1");
    if (!/^\d+$/.test(raw)) {
      result.invalid.push(text);
      continue;
    }
    const seconds = Number(raw);
    const old = result.directives[name];
    // Smaller lifetime = more restrictive, so a repeated header cannot extend freshness.
    result.directives[name] = typeof old === "number" ? Math.min(old, seconds) : seconds;
  }
  return result;
}
