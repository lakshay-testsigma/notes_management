import { describe, expect, it } from "vitest";
import { decodeMappings } from "../src/mappings.ts";

describe("decodeMappings", () => {
  it("splits lines on ';' and segments on ','", () => {
    const lines = decodeMappings("AAAA,CAAC;AACD");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveLength(2);
    expect(lines[1]).toHaveLength(1);
  });

  it("adds each segment to the previous values", () => {
    const [first, second] = decodeMappings("AAAA,CAAC")[0];
    expect(first).toMatchObject({ generatedColumn: 0, source: 0, originalLine: 0, originalColumn: 0 });
    expect(second).toMatchObject({ generatedColumn: 1, source: 0, originalLine: 0, originalColumn: 1 });
  });

  it("resets the generated column on a new line but keeps the other values", () => {
    const lines = decodeMappings("AAAA,CAAC;AACD");
    expect(lines[1][0]).toMatchObject({ generatedColumn: 0, source: 0, originalLine: 1, originalColumn: 0 });
  });

  it("returns an empty list for a line with no segments", () => {
    expect(decodeMappings("AAAA;;AAAA")[1]).toEqual([]);
  });

  it("reads the optional name index", () => {
    expect(decodeMappings("AAAAA")[0][0].name).toBe(0);
    expect(decodeMappings("AAAA")[0][0].name).toBeNull();
  });
});
