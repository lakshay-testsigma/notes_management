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

// TODO(4): Look up one frame. Stack traces count from 1, the map counts from 0.
//   1. Call originalPositionFor with frame.line - 1 and frame.column - 1.
//   2. When it returns a position, add 1 to its line and column, so the output
//      matches what an editor shows. Keep the other fields.
//   3. Return { frame, original }. `original` is null when nothing was found.
export function resolveFrame(frame: Frame, map: SourceMap, decoded: Segment[][]): ResolvedFrame {
  throw new Error("TODO(4): resolveFrame is not implemented yet");
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

export function describeFrame({ frame, original }: ResolvedFrame): string {
  if (!original) {
    return `    at ${frame.functionName ?? "<anonymous>"} (${frame.url}:${frame.line}:${frame.column})`;
  }
  const name = original.name ?? frame.functionName ?? "<anonymous>";
  return `    at ${name} (${original.source}:${original.line}:${original.column})`;
}

// TODO(5): Print the frames, hiding ignore-listed ones.
//   1. Walk the frames in order. A frame is hidden when `original?.ignored` is true.
//   2. Print every other frame with describeFrame(frame).
//   3. A run of hidden frames becomes ONE line, placed where the run was:
//      "    ... 2 ignore-listed frames hidden" (use "frame" when the count is 1).
//   4. Join the lines with "\n".
export function formatStack(frames: ResolvedFrame[]): string {
  throw new Error("TODO(5): formatStack is not implemented yet");
}
