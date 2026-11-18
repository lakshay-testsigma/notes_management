import { describe, expect, it } from "vitest";
import { keyOf, newViolations } from "../src/baseline.js";
import type { Finding } from "../src/types.js";

const f = (rule: string, outcome: Finding["outcome"], target = "img"): Finding =>
  ({ page: "home", rule, outcome, target, detail: "" });

describe("newViolations", () => {
  it("ignores violations that are in the baseline", () => {
    const old = f("image-alt", "violation");
    expect(newViolations([old], [keyOf(old)])).toEqual([]);
  });
  it("returns a violation the baseline does not know", () => {
    const fresh = f("link-name", "violation", "a");
    expect(newViolations([f("image-alt", "violation"), fresh], [keyOf(f("image-alt", "violation"))])).toEqual([fresh]);
  });
  it("never fails on pass or needs-review findings", () => {
    expect(newViolations([f("a", "pass"), f("b", "incomplete")], [])).toEqual([]);
  });
  it("treats the same rule on another element as new", () => {
    const second = f("image-alt", "violation", "img:nth-child(2)");
    expect(newViolations([second], [keyOf(f("image-alt", "violation"))])).toEqual([second]);
  });
});
