import { decodeVlq } from "./vlq.ts";

/** One decoded position link. All numbers count from 0. */
export interface Segment {
  generatedColumn: number;
  /** Index into the map's `sources`, or null for generated code with no source. */
  source: number | null;
  originalLine: number | null;
  originalColumn: number | null;
  /** Index into the map's `names`, or null. */
  name: number | null;
}

// TODO(2): Decode the `mappings` string into one list of segments per generated line.
//   1. Split `mappings` on ";" (one entry per generated line). An empty entry is [].
//   2. Split each line on "," and decode each piece with decodeVlq.
//   3. A segment has 1, 4 or 5 fields: generated column, source, original line,
//      original column, optional name. One field means "no source": use null.
//   4. Fields are relative. generatedColumn restarts at 0 on each line. The source,
//      original line, original column and name keep running totals across ALL lines.
export function decodeMappings(mappings: string): Segment[][] {
  throw new Error("TODO(2): decodeMappings is not implemented yet");
}
