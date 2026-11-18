import type { SourceLink } from "../domain/note.js";

// One source per line: "https://..." or "Label | https://...". Blank lines are ignored.
export function parseSourceLines(text: string): SourceLink[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const bar = line.lastIndexOf("|");
      return bar === -1
        ? { label: "", url: line }
        : { label: line.slice(0, bar).trim(), url: line.slice(bar + 1).trim() };
    });
}
