// Not part of the lesson: writes sample/checkout.har from the table below.
import { writeFileSync } from "node:fs";
const base = Date.parse("2025-01-15T10:00:00.000Z");
// [offsetMs, url, type, status, cache, blocked, dns, connect, ssl, send, wait, receive]
const rows = [
  [0, "https://shop.example/checkout", "document", 200, "", 2, 30, 80, 55, 1, 420, 25],
  [560, "https://shop.example/app.css", "stylesheet", 200, "", 4, -1, -1, -1, 1, 90, 20],
  [565, "https://shop.example/app.js", "script", 200, "", 5, -1, -1, -1, 1, 140, 610],
  [570, "https://cdn.example/fonts/body.woff2", "font", 200, "", 3, 25, 60, 40, 1, 70, 35],
  [575, "https://shop.example/logo.png", "image", 200, "disk", 0, -1, -1, -1, -1, -1, -1],
  [1400, "https://shop.example/api/cart", "fetch", 200, "", 1, -1, -1, -1, 1, 380, 12],
  [1450, "https://shop.example/hero.jpg", "image", 304, "", 6, -1, -1, -1, 1, 60, 0],
  [1500, "https://ads.example/track.js", "script", 0, "", 0, -1, -1, -1, -1, -1, -1],
];
const entries = rows.map(([off, url, type, status, cache, b, d, c, s, snd, w, r]) => {
  const parts = [b, d, c, snd, w, r].filter((x) => x >= 0);
  const e = {
    startedDateTime: new Date(base + off).toISOString(),
    time: status === 0 ? 150 : parts.reduce((a, x) => a + x, 0),
    request: { method: "GET", url },
    response: { status, content: { mimeType: "" } },
    timings: { blocked: b, dns: d, connect: c, ssl: s, send: snd, wait: w, receive: r },
    _resourceType: type,
  };
  if (cache) e._fromCache = cache;
  return e;
});
const log = { version: "1.2", creator: { name: "sample", version: "1" },
  pages: [{ id: "page_1", pageTimings: { onContentLoad: 1300, onLoad: 1600 } }], entries };
writeFileSync(new URL("checkout.har", import.meta.url), JSON.stringify({ log }, null, 1));
