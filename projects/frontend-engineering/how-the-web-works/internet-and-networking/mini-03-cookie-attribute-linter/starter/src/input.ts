interface HarHeader {
  name: string;
  value: string;
}

// Accepts a HAR file (JSON) or a text file with one Set-Cookie header per line.
export function readSetCookieHeaders(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return fromHar(trimmed);
  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) => line.replace(/^set-cookie:\s*/i, ""));
}

function fromHar(json: string): string[] {
  const har = JSON.parse(json) as { log?: { entries?: { response?: { headers?: HarHeader[] } }[] } };
  const headers: string[] = [];
  for (const entry of har.log?.entries ?? []) {
    for (const header of entry.response?.headers ?? []) {
      if (header.name.toLowerCase() === "set-cookie") headers.push(header.value);
    }
  }
  return headers;
}
