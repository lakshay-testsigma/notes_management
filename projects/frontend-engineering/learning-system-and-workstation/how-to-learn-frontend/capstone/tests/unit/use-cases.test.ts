import { beforeEach, describe, expect, it } from "vitest";
import { AddNote } from "../../src/application/add-note.js";
import { GetFeatureStatuses } from "../../src/application/get-feature-statuses.js";
import { ListDueNotes } from "../../src/application/list-due-notes.js";
import { ListNotes } from "../../src/application/list-notes.js";
import { MarkReviewed } from "../../src/application/mark-reviewed.js";
import { BaselineCalculator } from "../../src/domain/baseline-calculator.js";
import { NoteNotFoundError, ValidationError } from "../../src/domain/errors.js";
import { FeatureKeyExtractor } from "../../src/domain/feature-key-extractor.js";
import { NoteValidator } from "../../src/domain/note-validator.js";
import { ReviewScheduler } from "../../src/domain/review-scheduler.js";
import { InMemoryNoteRepository } from "../../src/infrastructure/in-memory-note-repository.js";
import { CountingIds, FixedClock, RecordingLogger, goodDraft } from "../helpers.js";

let repo: InMemoryNoteRepository;
let clock: FixedClock;
let logger: RecordingLogger;
let add: AddNote;
const scheduler = new ReviewScheduler();

beforeEach(() => {
  repo = new InMemoryNoteRepository();
  clock = new FixedClock("2026-03-01");
  logger = new RecordingLogger();
  add = new AddNote(repo, new NoteValidator(), scheduler, clock, new CountingIds(), logger);
});

describe("AddNote", () => {
  it("saves a note due tomorrow and logs it", () => {
    const note = add.execute(goodDraft);
    expect(note).toMatchObject({ id: "note-1", createdOn: "2026-03-01", nextReviewOn: "2026-03-02" });
    expect(repo.all()).toHaveLength(1);
    expect(logger.events[0].event).toBe("note.added");
  });

  it("saves nothing when the draft is invalid", () => {
    expect(() => add.execute({ ...goodDraft, title: "" })).toThrow(ValidationError);
    expect(repo.all()).toHaveLength(0);
  });
});

describe("ListDueNotes and ListNotes", () => {
  it("lists only due notes, most overdue first", () => {
    add.execute({ ...goodDraft, title: "A" });
    clock.date = "2026-03-05";
    add.execute({ ...goodDraft, title: "B" });
    clock.date = "2026-03-06";
    const due = new ListDueNotes(repo, scheduler, clock).execute();
    expect(due.map((n) => n.title)).toEqual(["A", "B"]);
    clock.date = "2026-03-02";
    expect(new ListDueNotes(repo, scheduler, clock).execute().map((n) => n.title)).toEqual(["A"]);
  });

  it("lists all notes newest first", () => {
    add.execute({ ...goodDraft, title: "Old" });
    clock.date = "2026-03-09";
    add.execute({ ...goodDraft, title: "New" });
    expect(new ListNotes(repo).execute().map((n) => n.title)).toEqual(["New", "Old"]);
  });
});

describe("MarkReviewed", () => {
  it("moves the next review later", () => {
    add.execute(goodDraft);
    clock.date = "2026-03-02";
    const updated = new MarkReviewed(repo, scheduler, clock, logger).execute("note-1");
    expect(updated).toMatchObject({ reviewStep: 1, nextReviewOn: "2026-03-05" });
    expect(new ListDueNotes(repo, scheduler, clock).execute()).toHaveLength(0);
  });

  it("throws NoteNotFoundError for an unknown id", () => {
    expect(() => new MarkReviewed(repo, scheduler, clock, logger).execute("nope")).toThrow(NoteNotFoundError);
  });
});

describe("GetFeatureStatuses", () => {
  const catalog = {
    find: (key: string) =>
      key === "css.properties.demo"
        ? { key, compat: { support: { chrome: { version_added: "1" } } }, releases: { chrome: { "1": { release_date: "2010-01-01" } } } }
        : undefined,
  };
  const statuses = new GetFeatureStatuses(catalog, new FeatureKeyExtractor(), new BaselineCalculator(["chrome"]), () => new Date("2026-01-01"));

  it("returns a status for known keys and none for unknown keys", () => {
    const result = statuses.execute("`css.properties.demo` and `css.properties.other`");
    expect(result[0].status?.baseline).toBe("widely");
    expect(result[1]).toEqual({ key: "css.properties.other" });
  });
});
