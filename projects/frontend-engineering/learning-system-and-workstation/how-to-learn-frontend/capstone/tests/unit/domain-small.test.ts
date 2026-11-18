import { describe, expect, it } from "vitest";
import { ValidationError, UnknownFeatureError } from "../../src/domain/errors.js";
import { FeatureKeyExtractor } from "../../src/domain/feature-key-extractor.js";
import { NoteValidator } from "../../src/domain/note-validator.js";
import { ReviewScheduler } from "../../src/domain/review-scheduler.js";
import { CompatTreeReader } from "../../src/infrastructure/compat-tree-reader.js";
import { goodDraft } from "../helpers.js";

describe("NoteValidator", () => {
  const validator = new NoteValidator();

  it("trims a good draft", () => {
    const note = validator.validate({ ...goodDraft, title: "  Hello  " });
    expect(note.title).toBe("Hello");
  });

  it("collects every problem with a fix-it message", () => {
    try {
      validator.validate({ roadmapItem: "", title: "", body: "", sources: [] });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toHaveLength(4);
    }
  });

  it("rejects a javascript: link", () => {
    const draft = { ...goodDraft, sources: [{ label: "x", url: "javascript:alert(1)" }] };
    expect(() => validator.validate(draft)).toThrow(/not a web address/);
  });

  it("uses the URL as label when the label is empty", () => {
    const draft = { ...goodDraft, sources: [{ label: " ", url: "https://web.dev/baseline" }] };
    expect(validator.validate(draft).sources[0].label).toBe("https://web.dev/baseline");
  });
});

describe("FeatureKeyExtractor", () => {
  const extractor = new FeatureKeyExtractor();

  it("finds keys in backticks once each", () => {
    const text = "`css.properties.gap` and `api.Navigator.share` and `css.properties.gap` again";
    expect(extractor.extract(text)).toEqual(["css.properties.gap", "api.Navigator.share"]);
  });

  it("ignores keys outside backticks and plain words in backticks", () => {
    expect(extractor.extract("css.properties.gap is nice, `flexbox` too")).toEqual([]);
  });
});

describe("ReviewScheduler", () => {
  const scheduler = new ReviewScheduler();

  it("schedules the first review for the next day", () => {
    expect(scheduler.first("2026-02-28")).toEqual({ reviewStep: 0, nextReviewOn: "2026-03-01" });
  });

  it("waits longer after each review and repeats the last interval", () => {
    expect(scheduler.afterReview(0, "2026-01-01")).toEqual({ reviewStep: 1, nextReviewOn: "2026-01-04" });
    expect(scheduler.afterReview(9, "2026-01-01").nextReviewOn).toBe("2026-01-31");
  });

  it("treats today and earlier as due", () => {
    expect(scheduler.isDue("2026-01-01", "2026-01-01")).toBe(true);
    expect(scheduler.isDue("2026-01-02", "2026-01-01")).toBe(false);
  });
});

describe("CompatTreeReader", () => {
  const reader = new CompatTreeReader({ css: { properties: { gap: { __compat: { support: {} } }, empty: {} } } });

  it("returns __compat for a dotted path", () => {
    expect(reader.read("css.properties.gap")).toEqual({ support: {} });
  });

  it("names the part that failed", () => {
    expect(() => reader.read("css.propertys.gap")).toThrow(UnknownFeatureError);
    expect(() => reader.read("css.propertys.gap")).toThrow(/no part named "propertys"/);
  });

  it("fails when the node has no __compat", () => {
    expect(() => reader.read("css.properties.empty")).toThrow(/__compat/);
  });
});
