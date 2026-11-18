// Saved response headers, one "Name: value" per line (the status line is skipped).
export class ResponseHeaders {
  private readonly map: Map<string, string>;

  private constructor(map: Map<string, string>) {
    this.map = map;
  }

  static fromText(text: string): ResponseHeaders {
    const map = new Map<string, string>();
    for (const line of text.split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon <= 0) continue; // blank lines and "HTTP/2 200"
      map.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
    }
    return new ResponseHeaders(map);
  }

  // Header names are case-insensitive in HTTP.
  get(name: string): string | undefined {
    return this.map.get(name.toLowerCase());
  }
}
