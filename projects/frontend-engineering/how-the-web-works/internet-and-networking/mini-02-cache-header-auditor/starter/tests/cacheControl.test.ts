import { describe, expect, it } from "vitest";
import { parseCacheControl } from "../src/cacheControl.ts";

describe("parseCacheControl", () => {
  it("reads flags and numbers, ignoring case and spaces", () => {
    const r = parseCacheControl("Public,  MAX-AGE=60 , immutable");
    expect(r.directives).toEqual({ public: true, "max-age": 60, immutable: true });
    expect(r.invalid).toEqual([]);
  });

  it("keeps the smallest value of a repeated max-age", () => {
    expect(parseCacheControl("max-age=600, max-age=60").directives["max-age"]).toBe(60);
    expect(parseCacheControl("max-age=0, max-age=600").directives["max-age"]).toBe(0);
  });

  it("records an unreadable number instead of guessing", () => {
    const r = parseCacheControl("max-age=abc, s-maxage=, no-cache");
    expect(r.invalid).toEqual(["max-age=abc", "s-maxage="]);
    expect(r.directives["no-cache"]).toBe(true);
    expect(r.directives["max-age"]).toBeUndefined();
  });

  it("accepts a quoted number", () => {
    expect(parseCacheControl('max-age="120"').directives["max-age"]).toBe(120);
  });
});
