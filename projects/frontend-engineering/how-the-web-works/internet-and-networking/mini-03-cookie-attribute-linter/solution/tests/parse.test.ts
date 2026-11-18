import { describe, expect, it } from "vitest";
import { parseSetCookie } from "../src/parse.ts";

describe("parseSetCookie (task 1)", () => {
  it("reads name, value and every flag", () => {
    const cookie = parseSetCookie("sid=abc; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600");
    expect(cookie).toEqual({
      name: "sid",
      value: "abc",
      attributes: { secure: true, httpOnly: true, partitioned: false, sameSite: "Lax", path: "/", maxAge: 3600 },
      ignored: [],
    });
  });

  it("matches attribute names and SameSite values without case", () => {
    const cookie = parseSetCookie("a=1; SECURE; httponly; samesite=STRICT");
    expect(cookie?.attributes).toMatchObject({ secure: true, httpOnly: true, sameSite: "Strict" });
  });

  it("keeps an equals sign inside the value", () => {
    expect(parseSetCookie("token=a=b==; Secure")?.value).toBe("a=b==");
  });

  it("lowercases Domain and drops a leading dot", () => {
    expect(parseSetCookie("a=1; Domain=.Example.COM")?.attributes.domain).toBe("example.com");
  });

  it("records pieces it ignores instead of throwing", () => {
    const cookie = parseSetCookie("a=1; SameSite=Sometimes; Max-Age=soon; Priority=High");
    expect(cookie?.attributes.sameSite).toBeUndefined();
    expect(cookie?.attributes.maxAge).toBeUndefined();
    expect(cookie?.ignored).toEqual(["SameSite=Sometimes", "Max-Age=soon", "Priority=High"]);
  });

  it("returns null for a header with no name or no equals sign", () => {
    expect(parseSetCookie("justtext; Secure")).toBeNull();
    expect(parseSetCookie("=value; Secure")).toBeNull();
    expect(parseSetCookie("")).toBeNull();
  });

  it("returns null when the header holds a control character", () => {
    expect(parseSetCookie("a=1\r\nSet-Cookie: b=2")).toBeNull();
  });

  it("handles a header with thousands of empty attributes in one pass", () => {
    const cookie = parseSetCookie("a=1" + ";".repeat(200_000) + " Secure");
    expect(cookie?.attributes.secure).toBe(true);
  });
});
