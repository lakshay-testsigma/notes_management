import { describe, expect, it } from "vitest";
import { BaselineCalculator } from "../../src/domain/baseline-calculator.js";
import type { FeatureData, SupportStatement } from "../../src/domain/feature.js";

// A tiny made-up world with two core browsers keeps each case readable.
const calc = new BaselineCalculator(["alpha", "beta"]);
const releases = {
  alpha: { "10": { release_date: "2022-01-01" }, "5": { release_date: "2020-01-01" } },
  beta: { "20": { release_date: "2023-06-01" } },
};
const feature = (alpha: SupportStatement | SupportStatement[] | undefined, beta: SupportStatement | undefined,
  status = {}): FeatureData => ({
  key: "css.properties.demo",
  releases,
  compat: { support: { ...(alpha ? { alpha } : {}), ...(beta ? { beta } : {}) }, status },
});
const at = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("BaselineCalculator", () => {
  it("is limited when a core browser has no entry", () => {
    expect(calc.statusFor(feature({ version_added: "10" }, undefined), at("2026-01-01")).baseline).toBe("limited");
  });

  it("is limited when a core browser only has the feature behind a flag", () => {
    const flagged = feature({ version_added: "10" }, { version_added: "20", flags: [{}] });
    expect(calc.statusFor(flagged, at("2026-01-01")).baseline).toBe("limited");
  });

  it("is newly until 30 months after the last browser shipped, then widely", () => {
    const f = feature({ version_added: "10" }, { version_added: "20" }); // last ship 2023-06-01
    expect(calc.statusFor(f, at("2025-11-30")).baseline).toBe("newly");
    expect(calc.statusFor(f, at("2025-12-01")).baseline).toBe("widely");
  });

  it("is limited before the last browser has shipped", () => {
    const f = feature({ version_added: "10" }, { version_added: "20" });
    expect(calc.statusFor(f, at("2023-05-01")).baseline).toBe("limited");
  });

  it("reads the newest plain statement from an array", () => {
    const f = feature([{ version_added: "5", prefix: "-x-" }, { version_added: "10" }], { version_added: "20" });
    expect(calc.statusFor(f, at("2023-07-01")).interoperableDate).toBe("2023-06-01");
  });

  it("marks maybeEarlier for an at-most version", () => {
    const f = feature({ version_added: "≤10" }, { version_added: "20" });
    const status = calc.statusFor(f, at("2026-01-01"));
    expect(status.maybeEarlier).toBe(true);
    expect(status.baseline).toBe("widely");
  });

  it("says unknown, not limited, when a release date is missing", () => {
    const f = feature({ version_added: "99" }, { version_added: "20" });
    expect(calc.statusFor(f, at("2026-01-01")).baseline).toBe("unknown");
  });

  it("says unknown for version_added true", () => {
    const f = feature({ version_added: true }, { version_added: "20" });
    expect(calc.statusFor(f, at("2026-01-01")).baseline).toBe("unknown");
  });

  it("carries the deprecated and experimental flags", () => {
    const f = feature({ version_added: "10" }, { version_added: "20" }, { deprecated: true, experimental: true });
    const status = calc.statusFor(f, at("2026-01-01"));
    expect([status.deprecated, status.experimental]).toEqual([true, true]);
  });

  it("treats a removed feature as limited", () => {
    const f = feature({ version_added: "10", version_removed: "15" }, { version_added: "20" });
    expect(calc.statusFor(f, at("2026-01-01")).baseline).toBe("limited");
  });
});
