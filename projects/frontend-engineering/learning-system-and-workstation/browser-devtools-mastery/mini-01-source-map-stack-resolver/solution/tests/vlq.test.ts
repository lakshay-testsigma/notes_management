import { describe, expect, it } from "vitest";
import { decodeVlq } from "../src/vlq.ts";

describe("decodeVlq", () => {
  it("decodes the examples from the ECMA-426 spec", () => {
    expect(decodeVlq("A")).toEqual([0]);
    expect(decodeVlq("C")).toEqual([1]);
    expect(decodeVlq("V")).toEqual([-10]);
    expect(decodeVlq("iB")).toEqual([17]);
  });

  it("decodes several numbers in one segment", () => {
    expect(decodeVlq("AAAA")).toEqual([0, 0, 0, 0]);
    expect(decodeVlq("CAAC")).toEqual([1, 0, 0, 1]);
    expect(decodeVlq("AACD")).toEqual([0, 0, 1, -1]);
  });

  it("rejects a letter that is not base64", () => {
    expect(() => decodeVlq("A!")).toThrow(/Invalid/);
  });

  it("rejects a string that stops before the number ends", () => {
    expect(() => decodeVlq("i")).toThrow(/middle/);
  });
});
