import { describe, expect, it } from "vitest";
import { parseSetCookie } from "../src/parse.ts";
import { checkAttributes, checkPrefixes } from "../src/rules.ts";

function rulesFor(check: typeof checkAttributes, header: string): string[] {
  const cookie = parseSetCookie(header);
  if (!cookie) throw new Error(`fixture header is unreadable: ${header}`);
  return check(cookie).map((f) => f.rule);
}

describe("checkAttributes (task 2)", () => {
  it("accepts a cookie with Secure, HttpOnly and SameSite", () => {
    expect(rulesFor(checkAttributes, "sid=1; Secure; HttpOnly; SameSite=Lax")).toEqual([]);
  });

  it("flags a missing Secure as an error", () => {
    const cookie = parseSetCookie("sid=1; HttpOnly; SameSite=Lax")!;
    expect(checkAttributes(cookie)).toEqual([
      expect.objectContaining({ rule: "missing-secure", severity: "error", cookie: "sid" }),
    ]);
  });

  it("makes a missing HttpOnly an error for a session name and a warning otherwise", () => {
    const session = checkAttributes(parseSetCookie("sessionid=1; Secure; SameSite=Lax")!);
    const theme = checkAttributes(parseSetCookie("theme=dark; Secure; SameSite=Lax")!);
    expect(session[0]).toMatchObject({ rule: "missing-httponly", severity: "error" });
    expect(theme[0]).toMatchObject({ rule: "missing-httponly", severity: "warning" });
  });

  it("warns when SameSite is missing", () => {
    const [found] = checkAttributes(parseSetCookie("theme=dark; Secure; HttpOnly")!);
    expect(found).toMatchObject({ rule: "missing-samesite", severity: "warning" });
  });

  it("flags SameSite=None without Secure", () => {
    expect(rulesFor(checkAttributes, "a=1; HttpOnly; SameSite=None")).toContain("samesite-none-needs-secure");
    expect(rulesFor(checkAttributes, "a=1; Secure; HttpOnly; SameSite=None")).toEqual([]);
  });
});

describe("checkPrefixes (task 3)", () => {
  it("ignores cookies without a prefix", () => {
    expect(rulesFor(checkPrefixes, "sid=1")).toEqual([]);
  });

  it("requires Secure on a __Secure- cookie", () => {
    expect(rulesFor(checkPrefixes, "__Secure-id=1; Path=/")).toEqual(["secure-prefix-needs-secure"]);
    expect(rulesFor(checkPrefixes, "__Secure-id=1; Secure")).toEqual([]);
  });

  it("accepts a correct __Host- cookie", () => {
    expect(rulesFor(checkPrefixes, "__Host-id=1; Secure; Path=/")).toEqual([]);
  });

  it("reports every broken __Host- rule at once", () => {
    expect(rulesFor(checkPrefixes, "__Host-id=1; Path=/app; Domain=example.com")).toEqual([
      "host-prefix-needs-secure",
      "host-prefix-needs-root-path",
      "host-prefix-forbids-domain",
    ]);
  });

  it("treats a missing Path as a broken __Host- cookie", () => {
    expect(rulesFor(checkPrefixes, "__Host-id=1; Secure")).toEqual(["host-prefix-needs-root-path"]);
  });

  it("matches the prefix without case", () => {
    expect(rulesFor(checkPrefixes, "__host-id=1; Path=/")).toContain("host-prefix-needs-secure");
  });
});
