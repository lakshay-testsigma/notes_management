import { describe, expect, it } from "vitest";
import { baselineTable, type FeatureRecord } from "../src/baseline.ts";
import { buildDetection } from "../src/detect.ts";
import { decideShip } from "../src/decide.ts";
import { parseTarget, resolveFeature } from "../src/features.ts";
import { formatReport } from "../src/report.ts";

function feature(id: string): FeatureRecord {
  const found = baselineTable.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`The table has no feature "${id}"`);
  }
  return found;
}

describe("resolveFeature", () => {
  it("finds a feature by id and ignores case", () => {
    expect(resolveFeature("CSS-Nesting").id).toBe("css-nesting");
  });

  it("throws an error that names the known ids", () => {
    expect(() => resolveFeature("not-a-feature")).toThrow(/css-nesting/);
  });
});

describe("parseTarget", () => {
  it("rejects a target it does not know", () => {
    expect(() => parseTarget("1999")).toThrow(/widely/);
  });
});

describe("decideShip", () => {
  it("calls a widely available feature safe today", () => {
    const decision = decideShip(feature("css-nesting"), "widely");
    expect(decision.verdict).toBe("safe today");
    expect(decision.advice).toBeNull();
    expect(decision.reason).toMatch(/widely/i);
  });

  it("calls a newly available feature outside the target a fallback", () => {
    const decision = decideShip(feature("popover"), "2024");
    expect(decision.verdict).toBe("needs a fallback");
    expect(decision.reason).toMatch(/newly/i);
  });

  it("calls a newly available feature inside the target safe today", () => {
    const decision = decideShip(feature("popover"), "2025");
    expect(decision.verdict).toBe("safe today");
  });

  it("calls a limited feature a fallback whatever the target is", () => {
    const decision = decideShip(feature("limited-example"), "2026");
    expect(decision.verdict).toBe("needs a fallback");
    expect(decision.reason).toMatch(/limited/i);
  });

  it("asks for progressive enhancement when the feature is an enhancement", () => {
    const decision = decideShip(feature("popover"), "2024");
    expect(decision.advice).toBe("progressive enhancement");
  });

  it("asks for a polyfill when the feature is critical", () => {
    const critical: FeatureRecord = { ...feature("popover"), failure: "critical" };
    const decision = decideShip(critical, "2024");
    expect(decision.advice).toBe("polyfill");
    expect(decision.detection?.needsPolyfill).toBe(true);
  });
});

describe("buildDetection", () => {
  it("writes an @supports test for a CSS feature", () => {
    expect(buildDetection(feature("css-nesting")).snippet).toContain("@supports");
  });

  it("writes a boolean test for a JavaScript feature", () => {
    expect(buildDetection(feature("popover")).snippet).toContain("HTMLElement.prototype");
  });
});

describe("formatReport", () => {
  it("names the target and every feature", () => {
    const decisions = [
      decideShip(feature("css-nesting"), "widely"),
      decideShip(feature("popover"), "2024"),
    ];
    const report = formatReport("2024", decisions);
    expect(report).toContain("2024");
    expect(report).toContain("CSS Nesting");
    expect(report).toContain("Popover API");
    expect(report).toContain("safe today");
    expect(report).toContain("needs a fallback");
  });
});
