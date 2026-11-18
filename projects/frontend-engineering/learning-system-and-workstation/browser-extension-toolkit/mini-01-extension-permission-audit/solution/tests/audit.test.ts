import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  auditManifest,
  collectHosts,
  findBroadHostFindings,
  findContentScriptFindings,
  findRiskyApiFindings,
  isBroadHost,
  verdictFor,
} from "../src/audit.js";
import type { Manifest, Policy } from "../src/types.js";

const policy = JSON.parse(readFileSync("policy.json", "utf8")) as Policy;
const load = (name: string) =>
  JSON.parse(readFileSync(`sample/manifests/${name}.json`, "utf8")) as Manifest;
const base: Manifest = { name: "T", manifest_version: 3 };

describe("collectHosts (given)", () => {
  it("reads host patterns from V2 permissions and V3 host_permissions", () => {
    const m: Manifest = { ...base, permissions: ["tabs", "<all_urls>"], host_permissions: ["https://a.com/*"] };
    expect(collectHosts(m)).toEqual(["https://a.com/*", "<all_urls>"]);
  });
});

describe("TODO(1) isBroadHost", () => {
  it("flags patterns that match almost every site", () => {
    expect(isBroadHost("<all_urls>", policy)).toBe(true);
    expect(isBroadHost("*://*/*", policy)).toBe(true);
  });
  it("accepts a narrow pattern", () => {
    expect(isBroadHost("https://*.example.com/*", policy)).toBe(false);
  });
});

describe("TODO(2) findBroadHostFindings", () => {
  it("returns one finding per broad host, with the policy points", () => {
    const m: Manifest = { ...base, host_permissions: ["<all_urls>", "https://a.com/*"] };
    const found = findBroadHostFindings(m, policy);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ rule: "broad-host", points: policy.broadHostPoints });
  });
  it("sees a V2 style <all_urls> inside permissions", () => {
    const m: Manifest = { ...base, manifest_version: 2, permissions: ["<all_urls>"] };
    expect(findBroadHostFindings(m, policy)).toHaveLength(1);
  });
});

describe("TODO(3) findRiskyApiFindings", () => {
  it("scores each listed API and ignores unlisted ones", () => {
    const m: Manifest = { ...base, permissions: ["debugger", "storage"] };
    const found = findRiskyApiFindings(m, policy);
    expect(found.map((f) => f.detail)).toEqual(["Permission debugger"]);
    expect(found[0].points).toBe(50);
  });
  it("scores declarativeNetRequestWithHostAccess higher than declarativeNetRequest", () => {
    const plain = findRiskyApiFindings({ ...base, permissions: ["declarativeNetRequest"] }, policy);
    const withHost = findRiskyApiFindings({ ...base, permissions: ["declarativeNetRequestWithHostAccess"] }, policy);
    expect(withHost[0].points).toBeGreaterThan(plain[0].points);
  });
  it("adds a combo finding for scripting plus a broad host", () => {
    const narrow = findRiskyApiFindings({ ...base, permissions: ["scripting"], host_permissions: ["https://a.com/*"] }, policy);
    const broad = findRiskyApiFindings({ ...base, permissions: ["scripting"], host_permissions: ["<all_urls>"] }, policy);
    expect(narrow).toHaveLength(0);
    expect(broad).toHaveLength(1);
    expect(broad[0].points).toBe(policy.scriptingWithBroadHostPoints);
  });
});

describe("TODO(4) findContentScriptFindings", () => {
  it("flags a content script that matches all sites", () => {
    const m: Manifest = { ...base, content_scripts: [{ matches: ["*://*/*"] }, { matches: ["https://a.com/*"] }] };
    const found = findContentScriptFindings(m, policy);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ rule: "content-script-all-sites", points: policy.contentScriptAllSitesPoints });
  });
  it("returns nothing when there are no content scripts", () => {
    expect(findContentScriptFindings(base, policy)).toEqual([]);
  });
});

describe("TODO(5) verdictFor and auditManifest", () => {
  it("maps score to a verdict using the policy thresholds", () => {
    expect(verdictFor(policy.reviewAt - 1, policy)).toBe("approve");
    expect(verdictFor(policy.reviewAt, policy)).toBe("review");
    expect(verdictFor(policy.rejectAt, policy)).toBe("reject");
  });
  it("approves the color picker", () => {
    const r = auditManifest(load("color-picker"), policy);
    expect(r).toMatchObject({ score: 0, verdict: "approve" });
  });
  it("sends the tab helper to review", () => {
    const r = auditManifest(load("tab-helper"), policy);
    expect(r).toMatchObject({ score: 45, verdict: "review" });
  });
  it("rejects the super helper", () => {
    const r = auditManifest(load("super-helper"), policy);
    expect(r.verdict).toBe("reject");
    expect(r.score).toBe(40 + 35 + 30 + 25 + 25 + 30);
  });
});
