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

/** Decode the `mappings` string into one list of segments per generated line. */
export function decodeMappings(mappings: string): Segment[][] {
  // Only the generated column restarts on each line; the rest carry over.
  let source = 0;
  let originalLine = 0;
  let originalColumn = 0;
  let name = 0;

  return mappings.split(";").map((lineText) => {
    let generatedColumn = 0;
    if (lineText === "") return [];

    return lineText.split(",").map((segmentText): Segment => {
      const fields = decodeVlq(segmentText);
      if (![1, 4, 5].includes(fields.length)) {
        throw new Error(`A segment needs 1, 4 or 5 fields, got ${fields.length}`);
      }
      generatedColumn += fields[0];
      if (fields.length === 1) {
        return { generatedColumn, source: null, originalLine: null, originalColumn: null, name: null };
      }
      source += fields[1];
      originalLine += fields[2];
      originalColumn += fields[3];
      if (fields.length === 5) name += fields[4];
      return {
        generatedColumn,
        source,
        originalLine,
        originalColumn,
        name: fields.length === 5 ? name : null,
      };
    });
  });
}
