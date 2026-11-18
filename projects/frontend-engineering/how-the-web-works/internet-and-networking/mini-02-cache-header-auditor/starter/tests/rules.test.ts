import { describe, expect, it } from "vitest";
import { gradeHashedAsset, gradeHtml, gradeVaryAndEncoding } from "../src/rules.ts";
import type { Finding } from "../src/types.ts";
import { entry } from "./helpers.ts";

const problems = (fs: Finding[]) => fs.filter((f) => f.result === "problem").map((f) => f.rule);

describe("gradeHashedAsset", () => {
  it("passes a one-year immutable response", () => {
    const e = entry({ headers: { "cache-control": "public, max-age=31536000, immutable" } });
    expect(problems(gradeHashedAsset(e))).toEqual([]);
  });

  it("flags a short lifetime and a missing immutable", () => {
    const e = entry({ headers: { "cache-control": "max-age=3600" } });
    expect(problems(gradeHashedAsset(e))).toEqual(["hashed-max-age", "hashed-immutable"]);
  });

  it("flags no-cache on a hashed file", () => {
    const e = entry({ headers: { "cache-control": "no-cache, max-age=31536000, immutable" } });
    expect(problems(gradeHashedAsset(e))).toEqual(["hashed-no-revalidate"]);
  });

  it("uses the most restrictive of two max-age values", () => {
    const e = entry({ headers: { "cache-control": "max-age=31536000, immutable, max-age=60" } });
    expect(problems(gradeHashedAsset(e))).toContain("hashed-max-age");
  });

  it("reports a missing header as a problem and an unreadable one as unknown", () => {
    expect(problems(gradeHashedAsset(entry()))).toEqual(["cache-control-present"]);
    const bad = gradeHashedAsset(entry({ headers: { "cache-control": "max-age=soon" } }));
    expect(bad).toHaveLength(1);
    expect(bad[0].result).toBe("unknown");
  });
});

describe("gradeHtml", () => {
  it("passes no-cache with an ETag", () => {
    const e = entry({ headers: { "cache-control": "no-cache", etag: '"v1"' } });
    expect(problems(gradeHtml(e))).toEqual([]);
  });

  it("flags HTML that is stored for a while", () => {
    const e = entry({ headers: { "cache-control": "public, max-age=600" } });
    expect(problems(gradeHtml(e))).toEqual(["html-revalidates"]);
  });

  it("accepts max-age=0 and flags immutable", () => {
    const e = entry({ headers: { "cache-control": "max-age=0, immutable" } });
    expect(problems(gradeHtml(e))).toEqual(["html-not-immutable"]);
  });

  it("flags no-cache without ETag or Last-Modified", () => {
    const e = entry({ headers: { "cache-control": "no-cache" } });
    expect(problems(gradeHtml(e))).toEqual(["html-validator"]);
  });

  it("does not ask for a validator when the page uses no-store", () => {
    const e = entry({ headers: { "cache-control": "no-store" } });
    expect(problems(gradeHtml(e))).toEqual([]);
  });
});

describe("gradeVaryAndEncoding", () => {
  const big = { mimeType: "text/javascript", size: 50000 };

  it("flags a large text response with no compression", () => {
    expect(problems(gradeVaryAndEncoding(entry(big)))).toEqual(["compression-missing"]);
  });

  it("passes gzip with Vary: Accept-Encoding", () => {
    const e = entry({ ...big, headers: { "content-encoding": "gzip", vary: "Origin, Accept-Encoding" } });
    expect(problems(gradeVaryAndEncoding(e))).toEqual([]);
  });

  it("flags a compressed response without Vary", () => {
    const e = entry({ ...big, headers: { "content-encoding": "br" } });
    expect(problems(gradeVaryAndEncoding(e))).toEqual(["vary-accept-encoding"]);
  });

  it("flags Vary: * and stacked or compress codings", () => {
    expect(problems(gradeVaryAndEncoding(entry({ headers: { vary: "*" } })))).toEqual(["vary-star"]);
    const stacked = entry({ headers: { "content-encoding": "gzip, br", vary: "accept-encoding" } });
    expect(problems(gradeVaryAndEncoding(stacked))).toEqual(["compression-coding"]);
  });

  it("skips 304 and HEAD responses", () => {
    expect(gradeVaryAndEncoding(entry({ ...big, status: 304 }))).toEqual([]);
    expect(gradeVaryAndEncoding(entry({ ...big, method: "HEAD" }))).toEqual([]);
  });
});
