import type { Segment } from "./mappings.ts";

/** The fields of a version 3 source map that this project reads. */
export interface SourceMap {
  version: number;
  file?: string;
  sources: string[];
  names: string[];
  mappings: string;
  ignoreList?: number[];
}

export interface OriginalPosition {
  source: string;
  /** 0-based, like the map itself. */
  line: number;
  column: number;
  name: string | null;
  /** True when the source is listed in `ignoreList` (framework or bundler code). */
  ignored: boolean;
}

// TODO(3): Find the original position for a generated position (both 0-based).
//   1. Take the segments of `decoded[line]` (use [] when the line does not exist).
//   2. The answer is the last segment whose generatedColumn is <= `column`.
//      Segments are sorted, so you can stop at the first one that starts after it.
//   3. Return null when no segment qualifies, or when its `source` is null.
//   4. Otherwise return the source name from `map.sources`, the line and column,
//      the name from `map.names` (or null), and `ignored`: true when the source index
//      is in `map.ignoreList`.
export function originalPositionFor(
  map: SourceMap,
  decoded: Segment[][],
  line: number,
  column: number,
): OriginalPosition | null {
  throw new Error("TODO(3): originalPositionFor is not implemented yet");
}
