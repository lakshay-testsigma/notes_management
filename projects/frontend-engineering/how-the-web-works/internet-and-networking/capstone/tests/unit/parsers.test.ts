import { describe, expect, it } from "vitest";
import { CacheControl } from "../../src/domain/cacheControl.ts";
import { freshnessRule } from "../../src/domain/freshness.ts";
import { SetCookie } from "../../src/domain/setCookie.ts";

describe("CacheControl", () => {
  it("reads directives and seconds", () => {
    const cc = CacheControl.parse("public, max-age=600, immutable");
    expect(cc.has("immutable")).toBe(true);
    expect(cc.seconds("max-age")).toBe(600);
    expect(cc.isReadable).toBe(true);
  });
  it("reports a bad max-age instead of throwing", () => {
    const cc = CacheControl.parse("max-age=abc");
    expect(cc.isReadable).toBe(false);
    expect(cc.errors[0]).toContain("max-age");
  });
  it("treats an empty header as unreadable", () => {
    expect(CacheControl.parse(" , ").isReadable).toBe(false);
  });
});

describe("freshnessRule", () => {
  const DATE = "Wed, 18 Nov 2026 10:00:00 GMT";
  it("prefers s-maxage over max-age", () => {
    expect(freshnessRule(CacheControl.parse("max-age=10, s-maxage=99"))).toEqual({ rule: "s-maxage", seconds: 99 });
  });
  it("uses max-age before Expires", () => {
    expect(freshnessRule(CacheControl.parse("max-age=10"), "Wed, 18 Nov 2026 11:00:00 GMT", DATE).rule).toBe("max-age");
  });
  it("uses Expires minus Date", () => {
    expect(freshnessRule(CacheControl.parse(""), "Wed, 18 Nov 2026 11:00:00 GMT", DATE)).toEqual({ rule: "expires", seconds: 3600 });
  });
  it("treats an invalid Expires as already stale", () => {
    expect(freshnessRule(CacheControl.parse(""), "0", DATE).seconds).toBe(0);
  });
  it("falls back to 10% of the age since Last-Modified", () => {
    expect(freshnessRule(CacheControl.parse(""), undefined, DATE, "Wed, 18 Nov 2026 00:00:00 GMT")).toEqual({ rule: "heuristic", seconds: 3600 });
  });
  it("says none when nothing applies", () => {
    expect(freshnessRule(CacheControl.parse("")).rule).toBe("none");
  });
});

describe("SetCookie", () => {
  it("reads name, value and attributes", () => {
    const c = SetCookie.parse("id=1; Path=/; Secure; SameSite=Lax");
    expect(c.name).toBe("id");
    expect(c.has("secure")).toBe(true);
    expect(c.sameSite).toBe("lax");
    expect(c.issues).toEqual([]);
  });
  it("lists issues and keeps reading", () => {
    const c = SetCookie.parse("id=1; Max-Age=soon; SameSite=Maybe; Expires=never");
    expect(c.issues).toHaveLength(3);
    expect(c.name).toBe("id");
  });
  it("flags a header with no name", () => {
    expect(SetCookie.parse("; Secure").issues[0]).toContain("no name");
  });
});
