import { describe, expect, it } from "vitest";
import { PolicyError, ProfileError } from "../../src/domain/errors.ts";
import { Policy } from "../../src/domain/Policy.ts";
import { Profile } from "../../src/domain/Profile.ts";
import { ResponseHeaders } from "../../src/domain/ResponseHeaders.ts";
import { Summary } from "../../src/domain/Summary.ts";
import { POLICY_JSON, makePolicy } from "./helpers.ts";

describe("Policy", () => {
  it("a valid policy judges scores as pass, review and fail", () => {
    const p = makePolicy();
    expect([p.judge(0), p.judge(30), p.judge(70)]).toEqual(["pass", "review", "fail"]);
  });
  it("a policy with a missing key is rejected before any run", () => {
    const { reviewAt: _omit, ...broken } = POLICY_JSON;
    expect(() => Policy.fromJson(broken)).toThrow(PolicyError);
  });
  it("a policy where reviewAt is not lower than rejectAt is rejected", () => {
    expect(() => Policy.fromJson({ ...POLICY_JSON, reviewAt: 80 })).toThrow(/lower than/);
  });
  it("the error lists every problem, not only the first", () => {
    expect(() => Policy.fromJson({})).toThrow(/phases.*broadHostPatterns/);
  });
});

describe("Profile", () => {
  const entry = { id: "a", name: "A", phase: "build", manifest: "a.json" };
  it("a valid profile keeps its extensions in order", () => {
    const profile = Profile.fromJson({ name: "team", extensions: [entry] }, makePolicy());
    expect(profile.extensions.map((e) => e.id)).toEqual(["a"]);
  });
  it("an extension with a phase the policy does not list is rejected", () => {
    expect(() => Profile.fromJson({ name: "t", extensions: [{ ...entry, phase: "deploy" }] }, makePolicy())).toThrow(/allows build, accessibility/);
  });
  it("two extensions with the same id are rejected", () => {
    expect(() => Profile.fromJson({ name: "t", extensions: [entry, entry] }, makePolicy())).toThrow(ProfileError);
  });
  it("an empty extension list is rejected", () => {
    expect(() => Profile.fromJson({ name: "t", extensions: [] }, makePolicy())).toThrow(/non-empty/);
  });
});

describe("ResponseHeaders", () => {
  it("header names are found whatever their case", () => {
    const h = ResponseHeaders.fromText("HTTP/2 200\nX-Content-Type-Options: nosniff\n");
    expect(h.get("x-content-type-options")).toBe("nosniff");
  });
  it("a value that contains a colon is kept whole", () => {
    expect(ResponseHeaders.fromText("Link: <https://a.example/>; rel=x").get("link")).toBe("<https://a.example/>; rel=x");
  });
});

describe("Summary", () => {
  const row = (outcome: "pass" | "fail" | "review") => ({ check: "c", target: "t", outcome, message: "" });
  it("a run with only review results exits 0 unless strict mode is on", () => {
    const s = new Summary([row("pass"), row("review")]);
    expect([s.exitCode(false), s.exitCode(true)]).toEqual([0, 1]);
  });
  it("a run with one failure always exits 1", () => {
    expect(new Summary([row("fail")]).exitCode(false)).toBe(1);
  });
});
