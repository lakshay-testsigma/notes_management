import type { Entry, Kind } from "./types.ts";

// build tools put a content hash in the name: app.3f9a1c2b.js, main-DfK39sLq.css
const HASHED_NAME = /[.-][0-9a-zA-Z_]{8,}\.(js|mjs|css|woff2?|png|jpe?g|webp|avif|svg|gif)$/;

export function classify(entry: Entry): Kind {
  const path = new URL(entry.url).pathname;
  if (entry.mimeType === "text/html") return "html";
  if (HASHED_NAME.test(path) && /\d/.test(path.split("/").pop() ?? "")) return "hashed-asset";
  return "other";
}
