import type { Entry } from "./types.ts";

interface HarHeader { name: string; value: string }
interface HarFile {
  log: { entries: Array<{
    request: { method: string; url: string };
    response: { status: number; headers: HarHeader[]; content?: { size?: number; mimeType?: string } };
  }> };
}

// Browsers list repeated headers as separate rows. HTTP says they may be joined with a comma.
function headerMap(headers: HarHeader[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const { name, value } of headers) {
    const key = name.toLowerCase();
    map[key] = key in map ? `${map[key]}, ${value}` : value;
  }
  return map;
}

export function readEntries(har: HarFile): Entry[] {
  return har.log.entries.map((e) => ({
    url: e.request.url,
    method: e.request.method,
    status: e.response.status,
    mimeType: (e.response.content?.mimeType ?? "").split(";")[0].trim().toLowerCase(),
    size: e.response.content?.size ?? 0,
    headers: headerMap(e.response.headers),
  }));
}
