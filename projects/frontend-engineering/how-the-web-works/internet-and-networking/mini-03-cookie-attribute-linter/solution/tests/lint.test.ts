import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readSetCookieHeaders } from "../src/input.ts";
import { lintHeaders } from "../src/lint.ts";
import { exitCode } from "../src/report.ts";

describe("lintHeaders (task 4)", () => {
  it("returns no findings for good cookies", () => {
    const result = lintHeaders(["__Host-session=1; Path=/; Secure; HttpOnly; SameSite=Strict"]);
    expect(result.cookies).toHaveLength(1);
    expect(result.findings).toEqual([]);
    expect(exitCode(result)).toBe(0);
  });

  it("reports an unreadable header and keeps going", () => {
    const result = lintHeaders(["not a cookie", "sid=1; Secure; HttpOnly; SameSite=Lax"]);
    expect(result.cookies).toHaveLength(1);
    expect(result.findings).toEqual([expect.objectContaining({ rule: "unreadable-header", severity: "error" })]);
  });

  it("reports what the parser ignored as a warning", () => {
    const result = lintHeaders(["a=1; Secure; HttpOnly; SameSite=Maybe"]);
    const rules = result.findings.map((f) => f.rule);
    expect(rules).toContain("ignored-attribute");
    expect(rules).toContain("missing-samesite");
  });

  it("combines parse, attribute and prefix findings in header order", () => {
    const result = lintHeaders(["sid=1; Path=/", "__Host-csrf=2; Secure; HttpOnly; SameSite=Lax; Domain=a.com"]);
    expect(result.findings.map((f) => `${f.cookie}:${f.rule}`)).toEqual([
      "sid:missing-secure",
      "sid:missing-httponly",
      "sid:missing-samesite",
      "__Host-csrf:host-prefix-needs-root-path",
      "__Host-csrf:host-prefix-forbids-domain",
    ]);
    expect(exitCode(result)).toBe(1);
  });

  it("lints the text fixture and the HAR fixture", () => {
    const text = lintHeaders(readSetCookieHeaders(readFileSync("fixtures/login-flow.txt", "utf8")));
    expect(text.cookies).toHaveLength(5);
    expect(text.findings.some((f) => f.rule === "unreadable-header")).toBe(true);

    const har = lintHeaders(readSetCookieHeaders(readFileSync("fixtures/login-flow.har", "utf8")));
    expect(har.cookies.map((c) => c.name)).toEqual(["__Secure-auth", "__Host-session"]);
    expect(har.findings.map((f) => f.rule)).toEqual(["missing-secure", "secure-prefix-needs-secure"]);
  });
});
