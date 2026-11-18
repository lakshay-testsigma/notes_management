import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { SourceMap } from "../src/lookup.ts";
import { decodeMappings } from "../src/mappings.ts";
import { formatStack, parseFrame, resolveFrame, resolveStack } from "../src/stack.ts";

const map = JSON.parse(readFileSync("sample/app.min.js.map", "utf8")) as SourceMap;
const decoded = decodeMappings(map.mappings);
const stackText = readFileSync("sample/stack.txt", "utf8");

describe("parseFrame", () => {
  it("parses a named frame and an anonymous frame", () => {
    expect(parseFrame("    at total (https://x.test/app.min.js:1:125)")).toEqual({
      functionName: "total",
      url: "https://x.test/app.min.js",
      line: 1,
      column: 125,
    });
    expect(parseFrame("    at https://x.test/app.min.js:2:3")?.functionName).toBeNull();
  });

  it("returns null for the error message line", () => {
    expect(parseFrame("TypeError: boom")).toBeNull();
  });
});

describe("resolveFrame", () => {
  it("converts 1-based stack positions to the original 1-based position", () => {
    const frame = { functionName: "total", url: "https://x.test/app.min.js", line: 1, column: 125 };
    const { original } = resolveFrame(frame, map, decoded);
    expect(original).toMatchObject({ source: "../src/cart.js", line: 5, column: 3, name: "total" });
  });

  it("gives null when the position has no mapping", () => {
    const frame = { functionName: null, url: "app.min.js", line: 9, column: 1 };
    expect(resolveFrame(frame, map, decoded).original).toBeNull();
  });
});

describe("resolveStack and formatStack", () => {
  const frames = resolveStack(stackText, "app.min.js", map, decoded);

  it("resolves bundle frames and leaves other files alone", () => {
    expect(frames).toHaveLength(6);
    expect(frames[1].original?.source).toBe("../src/cart.js");
    expect(frames[5].original).toBeNull();
  });

  it("marks the react-dom frames as ignored", () => {
    expect(frames.map((f) => f.original?.ignored)).toEqual([false, false, true, true, false, undefined]);
  });

  it("collapses a run of ignore-listed frames into one line", () => {
    const lines = formatStack(frames).split("\n");
    expect(lines).toEqual([
      "    at total (../src/cart.js:5:3)",
      "    at checkout (../src/cart.js:13:5)",
      "    ... 2 ignore-listed frames hidden",
      "    at render (../src/cart.js:21:1)",
      "    at <anonymous> (https://cdn.example.com/other.js:1:1)",
    ]);
  });
});
