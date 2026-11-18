import { describe, expect, it } from "vitest";
import { CachingCheck } from "../../src/domain/checks/cachingCheck.ts";
import { CompressionCheck } from "../../src/domain/checks/compressionCheck.ts";
import { CookieCheck } from "../../src/domain/checks/cookieCheck.ts";
import { DnsCheck } from "../../src/domain/checks/dnsCheck.ts";
import { HttpVersionCheck, normalizeVersion } from "../../src/domain/checks/httpVersionCheck.ts";
import { TlsHstsCheck } from "../../src/domain/checks/tlsHstsCheck.ts";
import { context, entry, rules } from "../helpers.ts";

const PAGE = "https://www.example.com/";

describe("DnsCheck", () => {
  it("passes a healthy site except the missing AAAA and CAA", () => {
    expect(rules(new DnsCheck().run(context()))).toEqual(["dns.no-aaaa", "dns.no-caa"]);
  });
  it("flags a CNAME that shares a name and a low TTL", () => {
    const ctx = context([], { dns: { host: "www.example.com", records: [
      { type: "A", name: "www.example.com", ttl: 30, value: "1.2.3.4" },
      { type: "CNAME", name: "www.example.com", ttl: 3600, value: "x.example.net" },
    ] } });
    expect(rules(new DnsCheck().run(ctx))).toContain("dns.cname-conflict");
    expect(rules(new DnsCheck().run(ctx))).toContain("dns.ttl-low");
  });
  it("flags a zone with no address record", () => {
    expect(rules(new DnsCheck().run(context([], { dns: { host: "x", records: [] } })))).toContain("dns.no-address");
  });
});

describe("TlsHstsCheck", () => {
  const good = entry(PAGE, { "strict-transport-security": "max-age=31536000" });
  it("accepts a wildcard name, new protocol and good HSTS", () => {
    expect(new TlsHstsCheck().run(context([good]))).toEqual([]);
  });
  it("flags an old protocol, an expiring certificate and a wrong name", () => {
    const ctx = context([good], { tls: { host: "h", protocol: "TLSv1.2", notBefore: "2026-01-01T00:00:00Z", notAfter: "2026-11-30T00:00:00Z", subjectAltNames: ["example.org"] } });
    expect(rules(new TlsHstsCheck().run(ctx))).toEqual(["tls.old-protocol", "tls.expires-soon", "tls.name-mismatch"]);
  });
  it("flags an expired certificate", () => {
    const ctx = context([good], { tls: { host: "h", protocol: "TLSv1.3", notBefore: "2025-01-01T00:00:00Z", notAfter: "2026-01-01T00:00:00Z", subjectAltNames: ["www.example.com"] } });
    expect(rules(new TlsHstsCheck().run(ctx))).toEqual(["tls.expired"]);
  });
  it("flags missing, short and unreadable HSTS", () => {
    expect(rules(new TlsHstsCheck().run(context([entry(PAGE)])))).toEqual(["hsts.missing"]);
    expect(rules(new TlsHstsCheck().run(context([entry(PAGE, { "strict-transport-security": "max-age=60" })])))).toEqual(["hsts.short"]);
    const odd = new TlsHstsCheck().run(context([entry(PAGE, { "strict-transport-security": "includeSubDomains" })]));
    expect(odd[0]?.verdict).toBe("unknown");
  });
  it("reports unknown when there is no HTML page", () => {
    expect(rules(new TlsHstsCheck().run(context([])))).toEqual(["hsts.no-page"]);
  });
  it("flags plain HTTP requests", () => {
    const found = new TlsHstsCheck().run(context([good, entry("http://www.example.com/a.css")]));
    expect(rules(found)).toContain("https.insecure-request");
  });
});

describe("HttpVersionCheck", () => {
  it("normalizes the spellings HAR files use", () => {
    expect(normalizeVersion("HTTP/2.0")).toBe("h2");
    expect(normalizeVersion("h3-29")).toBe("h3");
    expect(normalizeVersion("spdy")).toBeNull();
  });
  it("flags old versions and names the client", () => {
    const found = new HttpVersionCheck().run(context([entry(PAGE, {}, { httpVersion: "http/1.1" })]));
    expect(found[0]?.rule).toBe("http.old-version");
    expect(found[0]?.message).toContain("test client");
  });
  it("reports an unreadable version as unknown", () => {
    expect(new HttpVersionCheck().run(context([entry(PAGE, {}, { httpVersion: "?" })]))[0]?.verdict).toBe("unknown");
  });
});

describe("CachingCheck", () => {
  const asset = "https://www.example.com/a.3f9a1c2b.js";
  it("accepts an immutable hashed asset and revalidating HTML", () => {
    const found = new CachingCheck().run(context([
      entry(asset, { "cache-control": "public, max-age=31536000, immutable" }, { mimeType: "text/javascript" }),
      entry(PAGE, { "cache-control": "no-cache", etag: "\"a\"" }),
    ]));
    expect(found).toEqual([]);
  });
  it("flags a hashed asset with a short lifetime", () => {
    expect(rules(new CachingCheck().run(context([entry(asset, { "cache-control": "max-age=60" })])))).toContain("cache.hashed-not-immutable");
  });
  it("flags HTML that stays fresh too long and has no validator", () => {
    const found = rules(new CachingCheck().run(context([entry(PAGE, { "cache-control": "max-age=86400" })])));
    expect(found).toEqual(["cache.html-too-fresh", "cache.no-validator"]);
  });
  it("treats an unreadable header as unknown", () => {
    const found = new CachingCheck().run(context([entry(PAGE, { "cache-control": "max-age=x" })]));
    expect(found).toHaveLength(1);
    expect(found[0]?.verdict).toBe("unknown");
  });
  it("flags a shared-cache leak, Vary star and a missing Vary", () => {
    const leak = new CachingCheck().run(context([entry(PAGE, { "cache-control": "public, max-age=5", "set-cookie": "a=1", etag: "x" })]));
    expect(rules(leak)).toContain("cache.shared-leak");
    const star = new CachingCheck().run(context([entry(PAGE, { "cache-control": "no-cache", etag: "x", vary: "*" })]));
    expect(rules(star)).toEqual(["cache.vary-star"]);
    const enc = new CachingCheck().run(context([entry(PAGE, { "cache-control": "no-cache", etag: "x", "content-encoding": "br" })]));
    expect(rules(enc)).toEqual(["cache.vary-encoding"]);
  });
  it("skips non-200 responses", () => {
    expect(new CachingCheck().run(context([entry(PAGE, {}, { status: 304 })]))).toEqual([]);
  });
});

describe("CompressionCheck", () => {
  it("flags a large text body with no coding", () => {
    expect(rules(new CompressionCheck().run(context([entry(PAGE)])))).toEqual(["compression.missing"]);
  });
  it("ignores small bodies, images and 304 responses", () => {
    const found = new CompressionCheck().run(context([
      entry(PAGE, {}, { decodedSize: 100 }),
      entry(PAGE, {}, { mimeType: "image/png" }),
      entry(PAGE, {}, { status: 304 }),
    ]));
    expect(found).toEqual([]);
  });
  it("flags stacked, legacy and unknown codings", () => {
    expect(rules(new CompressionCheck().run(context([entry(PAGE, { "content-encoding": "gzip, br" })])))).toEqual(["compression.stacked"]);
    expect(rules(new CompressionCheck().run(context([entry(PAGE, { "content-encoding": "compress" })])))).toEqual(["compression.compress"]);
    expect(new CompressionCheck().run(context([entry(PAGE, { "content-encoding": "rot13" })]))[0]?.verdict).toBe("unknown");
  });
});

describe("CookieCheck", () => {
  const run = (cookie: string) => rules(new CookieCheck().run(context([entry(PAGE, { "set-cookie": cookie })])));
  it("accepts a safe cookie", () => {
    expect(run("__Host-s=1; Path=/; Secure; HttpOnly; SameSite=Lax")).toEqual([]);
  });
  it("flags missing attributes", () => {
    expect(run("s=1")).toEqual(["cookie.no-secure", "cookie.no-httponly", "cookie.no-samesite"]);
  });
  it("allows a listed cookie without HttpOnly", () => {
    expect(run("theme=dark; Secure; SameSite=Lax")).toEqual([]);
  });
  it("checks SameSite=None, prefixes, size and Domain", () => {
    expect(run("s=1; SameSite=None; HttpOnly")).toContain("cookie.samesite-none-insecure");
    expect(run("__Host-s=1; Secure; HttpOnly; SameSite=Lax; Domain=example.com")).toContain("cookie.host-prefix");
    expect(run("__Secure-s=1; HttpOnly; SameSite=Lax")).toContain("cookie.secure-prefix");
    expect(run(`s=${"x".repeat(4100)}; Secure; HttpOnly; SameSite=Lax`)).toContain("cookie.too-large");
    expect(run("s=1; Secure; HttpOnly; SameSite=Lax; Domain=bad_domain")).toContain("cookie.bad-domain");
  });
  it("reports what a parser would drop as unknown", () => {
    const found = new CookieCheck().run(context([entry(PAGE, { "set-cookie": "s=1; Secure; HttpOnly; SameSite=Maybe" })]));
    expect(found.some((f) => f.rule === "cookie.unreadable" && f.verdict === "unknown")).toBe(true);
  });
});
