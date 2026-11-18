import type { Entry } from "../src/types.ts";

// Build one entry with sensible defaults; each test overrides only what it checks.
export function entry(over: Partial<Entry> & { headers?: Record<string, string> } = {}): Entry {
  return {
    url: "https://shop.example/",
    method: "GET",
    status: 200,
    mimeType: "text/html",
    size: 500,
    ...over,
    headers: over.headers ?? {},
  };
}
