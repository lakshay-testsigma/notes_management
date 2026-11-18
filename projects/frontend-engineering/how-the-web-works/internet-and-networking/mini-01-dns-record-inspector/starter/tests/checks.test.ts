import { describe, expect, it } from "vitest";
import { analyze, checkCaa, checkCnameConflict, checkTtl } from "../src/checks.ts";
import { inspectDomain } from "../src/lookup.ts";
import type { RecordSet } from "../src/types.ts";
import { stubResolver } from "./helpers.ts";

const set = (type: RecordSet["type"], records: RecordSet["records"]): RecordSet => ({
  type,
  status: records.length ? "ok" : "empty",
  records,
});

describe("checkTtl", () => {
  it("warns about a TTL above the limit", () => {
    const findings = checkTtl(set("A", [{ value: "203.0.113.10", ttl: 3600 }]), 300);
    expect(findings).toHaveLength(1);
    expect(findings[0].level).toBe("warn");
    expect(findings[0].message).toContain("3600");
  });

  it("accepts a TTL at the limit and ignores unknown TTLs", () => {
    expect(checkTtl(set("A", [{ value: "203.0.113.10", ttl: 300 }]), 300)).toEqual([]);
    expect(checkTtl(set("CNAME", [{ value: "h.example.net", ttl: null }]), 300)).toEqual([]);
  });
});

describe("checkCnameConflict", () => {
  it("flags a CNAME next to an A record", async () => {
    const r = stubResolver({
      resolve4: async () => [{ address: "203.0.113.10", ttl: 60 }],
      resolveCname: async () => ["host.example.net"],
    });
    const findings = checkCnameConflict(await inspectDomain("www.example.com", r));
    expect(findings[0].level).toBe("error");
  });

  it("accepts a lone CNAME", async () => {
    const r = stubResolver({ resolveCname: async () => ["host.example.net"] });
    expect(checkCnameConflict(await inspectDomain("www.example.com", r))).toEqual([]);
  });
});

describe("checkCaa", () => {
  it("gives an info finding when there is no CAA record", () => {
    expect(checkCaa(set("CAA", []), "letsencrypt.org")[0].level).toBe("info");
  });

  it("passes when the expected CA is listed", () => {
    expect(checkCaa(set("CAA", [{ value: "issue letsencrypt.org", ttl: null }]), "letsencrypt.org")).toEqual([]);
  });

  it("errors when only other CAs are listed", () => {
    const findings = checkCaa(set("CAA", [{ value: "issue digicert.com", ttl: null }]), "letsencrypt.org");
    expect(findings[0].level).toBe("error");
    expect(findings[0].message).toContain("letsencrypt.org");
  });
});

describe("analyze", () => {
  it("reports a clean migration-ready domain with no errors", async () => {
    const r = stubResolver({
      resolve4: async () => [{ address: "203.0.113.10", ttl: 60 }],
      resolve6: async () => [{ address: "2001:db8::10", ttl: 60 }],
      resolveCaa: async () => [{ critical: 0, issue: "letsencrypt.org" }],
    });
    const findings = analyze(await inspectDomain("example.com", r), { maxTtl: 300, expectedCa: "letsencrypt.org" });
    expect(findings.filter((f) => f.level !== "info")).toEqual([]);
  });

  it("errors when the name has no address records at all", async () => {
    const findings = analyze(await inspectDomain("example.com", stubResolver()), { maxTtl: 300, expectedCa: "letsencrypt.org" });
    expect(findings.some((f) => f.level === "error" && f.type === "ALL")).toBe(true);
  });
});
