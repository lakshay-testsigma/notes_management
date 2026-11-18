import { originalPositionFor, type OriginalPosition, type SourceMap } from "./lookup.ts";
import type { Segment } from "./mappings.ts";

/** One line of a V8 stack trace. Line and column count from 1, as in the browser. */
export interface Frame {
  functionName: string | null;
  url: string;
  line: number;
  column: number;
}

export interface ResolvedFrame {
  frame: Frame;
  /** null when this frame is not in the bundle or the map has no entry for it. */
  original: OriginalPosition | null;
}

// Matches "at fn (url:1:2)" and "at url:1:2".
const FRAME_PATTERN = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?\s*$/;

/** Parse one stack trace line. Returns null for lines that are not frames. */
export function parseFrame(text: string): Frame | null {
  const match = FRAME_PATTERN.exec(text);
  if (!match) return null;
  return {
    functionName: match[1] ?? null,
    url: match[2],
    line: Number(match[3]),
    column: Number(match[4]),
  };
}

/** Look up one frame. Stack traces count from 1, the map counts from 0. */
export function resolveFrame(frame: Frame, map: SourceMap, decoded: Segment[][]): ResolvedFrame {
  const original = originalPositionFor(map, decoded, frame.line - 1, frame.column - 1);
  // Convert back to 1-based so the output matches what an editor shows.
  return {
    frame,
    original: original && { ...original, line: original.line + 1, column: original.column + 1 },
  };
}

/** Resolve every frame whose file name is `bundleName`; leave the others as they are. */
export function resolveStack(
  stackText: string,
  bundleName: string,
  map: SourceMap,
  decoded: Segment[][],
): ResolvedFrame[] {
  const resolved: ResolvedFrame[] = [];
  for (const text of stackText.split("\n")) {
    const frame = parseFrame(text);
    if (!frame) continue;
    const isBundle = frame.url.split("/").pop() === bundleName;
    resolved.push(isBundle ? resolveFrame(frame, map, decoded) : { frame, original: null });
  }
  return resolved;
}

function describeFrame({ frame, original }: ResolvedFrame): string {
  if (!original) {
    return `    at ${frame.functionName ?? "<anonymous>"} (${frame.url}:${frame.line}:${frame.column})`;
  }
  const name = original.name ?? frame.functionName ?? "<anonymous>";
  return `    at ${name} (${original.source}:${original.line}:${original.column})`;
}

/** Print the frames. A run of ignore-listed frames becomes one summary line. */
export function formatStack(frames: ResolvedFrame[]): string {
  const lines: string[] = [];
  let hidden = 0;

  const flushHidden = () => {
    if (hidden > 0) lines.push(`    ... ${hidden} ignore-listed ${hidden === 1 ? "frame" : "frames"} hidden`);
    hidden = 0;
  };

  for (const resolved of frames) {
    if (resolved.original?.ignored) {
      hidden += 1;
      continue;
    }
    flushHidden();
    lines.push(describeFrame(resolved));
  }
  flushHidden();
  return lines.join("\n");
}
