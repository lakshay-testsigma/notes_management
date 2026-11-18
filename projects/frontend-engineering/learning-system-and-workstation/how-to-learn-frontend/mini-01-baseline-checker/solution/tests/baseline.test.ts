import { describe, expect, it } from "vitest";
import { checkFeature, classify, interoperableDate } from "../src/baseline.js";
import { getFeature } from "../src/bcd.js";
import { parseVersion, supportFor } from "../src/support.js";
import type { BcdData } from "../src/types.js";

// A tiny made-up tree: one test per edge case, no real data needed.
const releases = (date: string) => ({ "1": { release_date: date } });
const fake = {
  browsers: {
    chrome: { releases: releases("2020-01-01") },
    chrome_android: { releases: releases("2020-01-01") },
    edge: { releases: releases("2020-01-01") },
    firefox: { releases: releases("2021-06-01") },
    firefox_android: { releases: releases("2021-06-01") },
    safari: { releases: releases("2022-03-01") },
    safari_ios: { releases: releases("2022-03-01") },
  },
  css: {
    properties: {
      all: { __compat: { support: Object.fromEntries(
        ["chrome", "chrome_android", "edge", "firefox", "firefox_android", "safari", "safari_ios"]
          .map((b) => [b, { version_added: "1" }])), status: { deprecated: false } } },
      oneMissing: { __compat: { support: { chrome: { version_added: "1" } } } },
    },
  },
} as unknown as BcdData;

describe("getFeature", () => {
  it("finds a feature by dotted path", () => {
    expect(getFeature(fake, "css.properties.all").support).toBeDefined();
  });
  it("names the part that is wrong", () => {
    expect(() => getFeature(fake, "css.props.all")).toThrow(/no part named "props"/);
  });
  it("rejects a group that has no __compat", () => {
    expect(() => getFeature(fake, "css.properties")).toThrow(/group/);
  });
});

describe("parseVersion", () => {
  it("reads an exact version", () => {
    expect(parseVersion("57")).toEqual({ kind: "yes", version: "57", atMost: false });
  });
  it("reads an at-most version", () => {
    expect(parseVersion("≤37")).toEqual({ kind: "yes", version: "37", atMost: true });
  });
  it("treats false and preview as no", () => {
    expect(parseVersion(false)).toEqual({ kind: "no" });
    expect(parseVersion("preview")).toEqual({ kind: "no" });
  });
  it("treats true and null as unknown", () => {
    expect(parseVersion(true)).toEqual({ kind: "unknown" });
    expect(parseVersion(null)).toEqual({ kind: "unknown" });
  });
});

describe("supportFor", () => {
  it("treats a missing browser as no", () => {
    expect(supportFor({ support: {} }, "chrome")).toEqual({ kind: "no" });
  });
  it("skips flagged and prefixed statements in an array", () => {
    const compat = { support: { chrome: [
      { version_added: "90", flags: [{ name: "x" }] },
      { version_added: "40", prefix: "webkit" },
      { version_added: "100" },
    ] } };
    expect(supportFor(compat, "chrome")).toEqual({ kind: "yes", version: "100", atMost: false });
  });
  it("says no when the newest statement was removed", () => {
    const compat = { support: { chrome: { version_added: "10", version_removed: "20" } } };
    expect(supportFor(compat, "chrome")).toEqual({ kind: "no" });
  });
});

describe("interoperableDate", () => {
  it("returns the latest release date", () => {
    expect(interoperableDate(["2020-01-01", "2022-03-01", "2021-06-01"])).toBe("2022-03-01");
  });
});

describe("classify", () => {
  it("is limited with no date", () => {
    expect(classify(undefined, new Date("2030-01-01"))).toBe("limited");
  });
  it("is limited when the date is still in the future", () => {
    expect(classify("2031-01-01", new Date("2030-01-01"))).toBe("limited");
  });
  it("is newly before 30 months", () => {
    expect(classify("2022-03-01", new Date("2024-08-31"))).toBe("newly");
  });
  it("is widely at 30 months", () => {
    expect(classify("2022-03-01", new Date("2024-09-01"))).toBe("widely");
  });
});

describe("checkFeature", () => {
  it("uses the date of the last browser, and the 30-month rule", () => {
    const early = checkFeature(fake, "css.properties.all", new Date("2023-01-01"));
    expect(early.status).toBe("newly");
    expect(early.interoperableDate).toBe("2022-03-01");
    expect(checkFeature(fake, "css.properties.all", new Date("2025-01-01")).status).toBe("widely");
  });
  it("is limited when one core browser lacks the feature", () => {
    expect(checkFeature(fake, "css.properties.oneMissing", new Date("2030-01-01")).status).toBe("limited");
  });
});

describe("real data (pinned @mdn/browser-compat-data)", () => {
  it("reads css.properties.gap and api.Navigator.share", async () => {
    const { bcd } = await import("../src/bcd.js");
    const now = new Date("2026-11-17");
    expect(checkFeature(bcd, "css.properties.gap", now).status).toBe("widely");
    expect(checkFeature(bcd, "api.Navigator.share", now).status).toBe("limited"); // desktop Firefox lacks it
  });
});
