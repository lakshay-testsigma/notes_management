import type { HttpEntry } from "./types.ts";

export function headerValues(entry: HttpEntry, name: string): string[] {
  return entry.headers.filter((h) => h.name === name).map((h) => h.value);
}

export function firstHeader(entry: HttpEntry, name: string): string | undefined {
  return headerValues(entry, name)[0];
}

export function isHtml(entry: HttpEntry): boolean {
  return entry.mimeType.toLowerCase().startsWith("text/html");
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
