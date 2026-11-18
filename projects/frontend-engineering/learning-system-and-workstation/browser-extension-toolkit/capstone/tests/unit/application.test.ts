import { describe, expect, it } from "vitest";
import { AccessibilityCheck } from "../../src/application/AccessibilityCheck.ts";
import { AuditPageUseCase } from "../../src/application/AuditPageUseCase.ts";
import { ChecklistBuilder } from "../../src/application/ChecklistBuilder.ts";
import { ManifestScorer } from "../../src/application/ManifestScorer.ts";
import { ProfileLoader } from "../../src/application/ProfileLoader.ts";
import { SecurityHeaderCheck } from "../../src/application/SecurityHeaderCheck.ts";
import { SeoCheck } from "../../src/application/SeoCheck.ts";
import { ValidateProfileUseCase } from "../../src/application/ValidateProfileUseCase.ts";
import { PolicyError } from "../../src/domain/errors.ts";
import type { Check } from "../../src/domain/ports.ts";
import { FakeFiles, POLICY_JSON, context, headersFrom, makePolicy, silentLogger } from "./helpers.ts";

const outcomeOf = async (check: Check, ctx = context(), id?: string) => {
  const rows = await check.run(ctx);
  return id ? rows.find((r) => r.check === id)?.outcome : rows.map((r) => r.outcome);
};

describe("ManifestScorer", () => {
  const scorer = new ManifestScorer(makePolicy());
  it("a manifest with only activeTab scores 0", () => {
    expect(scorer.score({ permissions: ["activeTab"] }).points).toBe(0);
  });
  it("an all-sites host with scripting adds the host and scripting points", () => {
    const s = scorer.score({ permissions: ["scripting"], host_permissions: ["<all_urls>"] });
    expect(s.points).toBe(65);
  });
  it("a manifest v2 host pattern inside permissions counts as a host", () => {
    expect(scorer.score({ permissions: ["https://*/*"] }).points).toBe(40);
  });
  it("a content script on every site adds points", () => {
    expect(scorer.score({ content_scripts: [{ matches: ["<all_urls>"] }] }).points).toBe(30);
  });
});

describe("ValidateProfileUseCase", () => {
  const profile = {
    name: "team",
    extensions: [
      { id: "ok", name: "Ok", phase: "build", manifest: "ok.json" },
      { id: "bad", name: "Bad", phase: "build", manifest: "bad.json" },
      { id: "gone", name: "Gone", phase: "build", manifest: "gone.json" },
      { id: "broken", name: "Broken", phase: "build", manifest: "broken.json" },
    ],
  };
  const files = new FakeFiles({
    "/p/profile.json": JSON.stringify(profile),
    "/p/policy.json": JSON.stringify(POLICY_JSON),
    "/p/ok.json": JSON.stringify({ manifest_version: 3, name: "Ok", permissions: ["activeTab"] }),
    "/p/bad.json": JSON.stringify({ manifest_version: 3, name: "Bad", permissions: ["debugger"], host_permissions: ["<all_urls>"] }),
    "/p/broken.json": "{ not json",
  });
  it("each extension gets pass, fail or review from its manifest", async () => {
    const loaded = await new ProfileLoader(files).load("/p/profile.json", "/p/policy.json");
    const rows = await new ValidateProfileUseCase(files, silentLogger).run(loaded);
    expect(rows.map((r) => [r.target, r.outcome])).toEqual([
      ["ok", "pass"],
      ["bad", "fail"],
      ["gone", "review"], // file missing: we could not see it
      ["broken", "fail"],
    ]);
  });
  it("a bad policy file stops the run before any manifest is read", async () => {
    const bad = new FakeFiles({ "/p/profile.json": "{}", "/p/policy.json": "{}" });
    await expect(new ProfileLoader(bad).load("/p/profile.json", "/p/policy.json")).rejects.toThrow(PolicyError);
  });
});

describe("ChecklistBuilder", () => {
  it("steps are grouped by phase in policy order and empty phases are skipped", async () => {
    const files = new FakeFiles({
      "/p/profile.json": JSON.stringify({ name: "t", extensions: [{ id: "a", name: "A11y", phase: "accessibility", manifest: "a.json" }, { id: "b", name: "B", phase: "build", manifest: "b.json" }] }),
      "/p/policy.json": JSON.stringify(POLICY_JSON),
    });
    const { profile, policy } = await new ProfileLoader(files).load("/p/profile.json", "/p/policy.json");
    expect(new ChecklistBuilder().build(profile, policy).map((p) => p.phase)).toEqual(["build", "accessibility"]);
  });
});

describe("AccessibilityCheck", () => {
  const withAxe = (violations: number, incomplete: number) =>
    new AccessibilityCheck({
      run: async () => ({
        violations: Array.from({ length: violations }, () => ({ id: "image-alt", help: "h", nodes: 1 })),
        incomplete: Array.from({ length: incomplete }, () => ({ id: "color-contrast", help: "h", nodes: 1 })),
        passes: 30,
      }),
    });
  it("a violation is a fail and an incomplete rule is a review", async () => {
    expect(await outcomeOf(withAxe(1, 1))).toEqual(["fail", "review"]);
  });
  it("no violations and nothing incomplete gives one pass", async () => {
    expect(await outcomeOf(withAxe(0, 0))).toEqual(["pass"]);
  });
});

describe("SeoCheck", () => {
  const seo = new SeoCheck();
  it("a page without a title fails the title check", async () => {
    expect(await outcomeOf(seo, context({ page: { title: null } }), "seo-title")).toBe("fail");
  });
  it("a title over 60 characters needs review", async () => {
    expect(await outcomeOf(seo, context({ page: { title: "t".repeat(61) } }), "seo-title")).toBe("review");
  });
  it("a short description needs review, not fail", async () => {
    expect(await outcomeOf(seo, context({ page: { metaDescription: "short" } }), "seo-description")).toBe("review");
  });
  it("a relative canonical link fails", async () => {
    expect(await outcomeOf(seo, context({ page: { canonical: "/home" } }), "seo-canonical")).toBe("fail");
  });
  it("a canonical on another host needs review", async () => {
    expect(await outcomeOf(seo, context({ page: { canonical: "https://other.example/" } }), "seo-canonical")).toBe("review");
  });
  it("no JSON-LD needs review because it is optional", async () => {
    expect(await outcomeOf(seo, context(), "seo-json-ld")).toBe("review");
  });
  it("JSON-LD that is not JSON fails", async () => {
    expect(await outcomeOf(seo, context({ page: { jsonLdBlocks: ["{oops"] } }), "seo-json-ld")).toBe("fail");
  });
  it("JSON-LD with context and type passes", async () => {
    const block = JSON.stringify({ "@context": "https://schema.org", "@type": "Thing" });
    expect(await outcomeOf(seo, context({ page: { jsonLdBlocks: [block] } }), "seo-json-ld")).toBe("pass");
  });
});

describe("SecurityHeaderCheck", () => {
  const sec = new SecurityHeaderCheck();
  const good = "Content-Security-Policy: default-src 'self'\nStrict-Transport-Security: max-age=31536000\nX-Content-Type-Options: nosniff";
  it("good headers give three passes", async () => {
    expect(await outcomeOf(sec, context({ headers: headersFrom(good) }))).toEqual(["pass", "pass", "pass"]);
  });
  it("no saved headers gives three reviews, not three failures", async () => {
    expect(await outcomeOf(sec)).toEqual(["review", "review", "review"]);
  });
  it("a missing CSP fails and a report-only CSP needs review", async () => {
    expect(await outcomeOf(sec, context({ headers: headersFrom("x: y") }), "header-csp")).toBe("fail");
    expect(await outcomeOf(sec, context({ headers: headersFrom("Content-Security-Policy-Report-Only: default-src 'self'") }), "header-csp")).toBe("review");
  });
  it("a CSP that allows unsafe-inline scripts needs review", async () => {
    const h = headersFrom("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'");
    expect(await outcomeOf(sec, context({ headers: h }), "header-csp")).toBe("review");
  });
  it("HSTS with max-age 0 fails and a short max-age needs review", async () => {
    expect(await outcomeOf(sec, context({ headers: headersFrom("Strict-Transport-Security: max-age=0") }), "header-hsts")).toBe("fail");
    expect(await outcomeOf(sec, context({ headers: headersFrom("Strict-Transport-Security: max-age=60") }), "header-hsts")).toBe("review");
  });
  it("HSTS on an http URL needs review because it does not apply", async () => {
    expect(await outcomeOf(sec, context({ url: "http://a.example/", headers: headersFrom("x: y") }), "header-hsts")).toBe("review");
  });
  it("X-Content-Type-Options with another value fails", async () => {
    expect(await outcomeOf(sec, context({ headers: headersFrom("X-Content-Type-Options: sniff") }), "header-x-content-type-options")).toBe("fail");
  });
});

describe("AuditPageUseCase", () => {
  const files = new FakeFiles({ "page.html": "<title>x</title>" });
  const parser = { parse: () => ({ title: "x", metaDescription: null, canonical: null, jsonLdBlocks: [] }) };
  it("a check that throws becomes a review row that names the check and the target", async () => {
    const broken: Check = { id: "broken-check", run: async () => { throw new Error("boom"); } };
    const fine: Check = { id: "fine", run: async () => [{ check: "fine", target: "u", outcome: "pass", message: "" }] };
    const rows = await new AuditPageUseCase(files, parser, [broken, fine], silentLogger).run({ pagePath: "page.html", url: "https://a.example/" });
    expect(rows[0]).toMatchObject({ outcome: "review", message: "broken-check on https://a.example/: boom" });
    expect(rows[1]?.outcome).toBe("pass");
  });
  it("every check receives the same parsed page", async () => {
    let parses = 0;
    const counting = { parse: () => { parses++; return parser.parse(); } };
    const noop: Check = { id: "n", run: async () => [] };
    await new AuditPageUseCase(files, counting, [noop, noop, noop], silentLogger).run({ pagePath: "page.html", url: "https://a.example/" });
    expect(parses).toBe(1);
  });
  it("an unreadable page is an input error, not a review row", async () => {
    await expect(new AuditPageUseCase(files, parser, [], silentLogger).run({ pagePath: "nope.html", url: "u" })).rejects.toThrow(/cannot read/);
  });
});
