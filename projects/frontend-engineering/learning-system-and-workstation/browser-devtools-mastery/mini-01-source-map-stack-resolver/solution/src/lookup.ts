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

/**
 * Find the original position for a generated position (both 0-based).
 * The answer is the last segment that starts at or before `column` on that line.
 */
export function originalPositionFor(
  map: SourceMap,
  decoded: Segment[][],
  line: number,
  column: number,
): OriginalPosition | null {
  const segments = decoded[line] ?? [];
  let best: Segment | null = null;
  for (const segment of segments) {
    if (segment.generatedColumn > column) break; // segments are sorted by column
    best = segment;
  }
  // Before the first segment, or a segment with no source: nothing to show.
  if (!best || best.source === null) return null;

  return {
    source: map.sources[best.source],
    line: best.originalLine as number,
    column: best.originalColumn as number,
    name: best.name === null ? null : map.names[best.name],
    ignored: map.ignoreList?.includes(best.source) ?? false,
  };
}
