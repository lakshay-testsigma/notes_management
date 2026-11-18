import { describe, expect, it } from "vitest";
import { originalPositionFor, type SourceMap } from "../src/lookup.ts";
import { decodeMappings } from "../src/mappings.ts";

// Line 0 has segments at columns 10, 20 and 50. Source 1 is ignore-listed.
const map: SourceMap = {
  version: 3,
  sources: ["a.js", "vendor.js"],
  names: ["total"],
  mappings: "UAAA,UACAA,8BCDA",
  ignoreList: [1],
};
const decoded = decodeMappings(map.mappings);

describe("originalPositionFor", () => {
  it("returns the segment that starts exactly at the column", () => {
    expect(originalPositionFor(map, decoded, 0, 10)).toMatchObject({ source: "a.js", line: 0, column: 0 });
  });

  it("uses the closest segment before the column", () => {
    const found = originalPositionFor(map, decoded, 0, 30);
    expect(found).toMatchObject({ source: "a.js", line: 1, name: "total" });
  });

  it("returns null before the first segment and on a line with no segments", () => {
    expect(originalPositionFor(map, decoded, 0, 3)).toBeNull();
    expect(originalPositionFor(map, decoded, 5, 0)).toBeNull();
  });

  it("flags sources that are in ignoreList", () => {
    expect(originalPositionFor(map, decoded, 0, 60)).toMatchObject({ source: "vendor.js", ignored: true });
    expect(originalPositionFor(map, decoded, 0, 10)?.ignored).toBe(false);
  });
});
