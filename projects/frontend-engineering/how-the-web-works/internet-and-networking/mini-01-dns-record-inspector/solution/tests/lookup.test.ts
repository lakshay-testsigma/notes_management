import { describe, expect, it } from "vitest";
import { inspectDomain, queryType } from "../src/lookup.ts";
import { dnsError, stubResolver } from "./helpers.ts";

describe("queryType", () => {
  it("maps A answers to records with TTLs", async () => {
    const r = stubResolver({ resolve4: async () => [{ address: "203.0.113.10", ttl: 300 }] });
    const set = await queryType("example.com", "A", r);
    expect(set.status).toBe("ok");
    expect(set.records).toEqual([{ value: "203.0.113.10", ttl: 300 }]);
  });

  it("reports a CNAME target with no TTL", async () => {
    const r = stubResolver({ resolveCname: async () => ["host.example.net"] });
    const set = await queryType("www.example.com", "CNAME", r);
    expect(set.records).toEqual([{ value: "host.example.net", ttl: null }]);
  });

  it("formats a CAA record as 'tag value'", async () => {
    const r = stubResolver({ resolveCaa: async () => [{ critical: 0, issue: "letsencrypt.org" }] });
    const set = await queryType("example.com", "CAA", r);
    expect(set.records[0].value).toBe("issue letsencrypt.org");
  });

  it("treats ENODATA as an empty set, not an error", async () => {
    const set = await queryType("example.com", "AAAA", stubResolver());
    expect(set.status).toBe("empty");
  });

  it("treats other failures as an error with a message", async () => {
    const r = stubResolver({ resolve4: async () => { throw dnsError("ETIMEOUT"); } });
    const set = await queryType("example.com", "A", r);
    expect(set.status).toBe("error");
    expect(set.message).toContain("ETIMEOUT");
  });

  it("marks HTTPS unsupported when the resolver has no resolveHttps", async () => {
    const set = await queryType("example.com", "HTTPS", stubResolver());
    expect(set.status).toBe("unsupported");
  });

  it("reads an HTTPS record when the resolver supports it", async () => {
    const r = stubResolver({ resolveHttps: async () => [{ priority: 1, target: ".", params: "alpn=h2,h3" }] });
    const set = await queryType("example.com", "HTTPS", r);
    expect(set.records[0].value).toBe("1 . alpn=h2,h3");
  });
});

describe("inspectDomain", () => {
  it("returns all five record types", async () => {
    const report = await inspectDomain("example.com", stubResolver());
    expect(Object.keys(report.sets).sort()).toEqual(["A", "AAAA", "CAA", "CNAME", "HTTPS"]);
  });

  it("keeps the other answers when one lookup fails", async () => {
    const r = stubResolver({
      resolve4: async () => [{ address: "203.0.113.10", ttl: 60 }],
      resolve6: async () => { throw dnsError("ESERVFAIL"); },
    });
    const report = await inspectDomain("example.com", r);
    expect(report.sets.A.status).toBe("ok");
    expect(report.sets.AAAA.status).toBe("error");
  });
});
