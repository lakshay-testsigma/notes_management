import { describe, expect, it } from "vitest";

import { noteFileName, toSlug } from "../src/paths";

describe("toSlug", () => {
  it("turns a roadmap item name into a file-safe slug", () => {
    expect(toSlug("Learning Loop: read, build, measure, explain")).toBe(
      "learning-loop-read-build-measure-explain",
    );
  });

  it("keeps digits", () => {
    expect(toSlug("CSS Grid 2026")).toBe("css-grid-2026");
  });

  it("never starts or ends with a dash", () => {
    expect(toSlug("  Baseline & caniuse  ")).toBe("baseline-caniuse");
  });
});

describe("noteFileName", () => {
  it("joins the date and the slug", () => {
    expect(noteFileName("2026-11-18", "Learning Loop")).toBe("2026-11-18-learning-loop.md");
  });
});
