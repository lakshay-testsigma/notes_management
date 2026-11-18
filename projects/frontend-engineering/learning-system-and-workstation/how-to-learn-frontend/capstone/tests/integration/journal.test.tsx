import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AddNote } from "../../src/application/add-note.js";
import { GetFeatureStatuses } from "../../src/application/get-feature-statuses.js";
import { ListDueNotes } from "../../src/application/list-due-notes.js";
import { ListNotes } from "../../src/application/list-notes.js";
import { MarkReviewed } from "../../src/application/mark-reviewed.js";
import { BaselineCalculator } from "../../src/domain/baseline-calculator.js";
import { FeatureKeyExtractor } from "../../src/domain/feature-key-extractor.js";
import { NoteValidator } from "../../src/domain/note-validator.js";
import { ReviewScheduler } from "../../src/domain/review-scheduler.js";
import snapshot from "../../src/infrastructure/data/feature-snapshot.json";
import { LocalStorageNoteRepository, type StorageLike } from "../../src/infrastructure/local-storage-note-repository.js";
import { SnapshotFeatureCatalog, type FeatureSnapshot } from "../../src/infrastructure/snapshot-feature-catalog.js";
import { App } from "../../src/interface/App.js";
import type { Services } from "../../src/interface/services.js";
import { FEATURE_KEYS } from "../../scripts/feature-keys.js";
import { CountingIds, FixedClock, RecordingLogger, goodDraft } from "../helpers.js";

class FakeStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

// Real adapters (local storage fake, real snapshot file), real use cases.
function build(storage: FakeStorage, clock: FixedClock) {
  const logger = new RecordingLogger();
  const repo = new LocalStorageNoteRepository(storage, "journal", logger);
  const catalog = new SnapshotFeatureCatalog(snapshot as unknown as FeatureSnapshot);
  const scheduler = new ReviewScheduler();
  const services: Services = {
    addNote: new AddNote(repo, new NoteValidator(), scheduler, clock, new CountingIds(), logger),
    listNotes: new ListNotes(repo),
    listDueNotes: new ListDueNotes(repo, scheduler, clock),
    markReviewed: new MarkReviewed(repo, scheduler, clock, logger),
    featureStatuses: new GetFeatureStatuses(catalog, new FeatureKeyExtractor(), new BaselineCalculator(), () => new Date("2026-11-17T00:00:00Z")),
  };
  return { services, catalog };
}

describe("journal with real adapters", () => {
  it("covers every key listed in scripts/feature-keys.ts", () => {
    const { catalog } = build(new FakeStorage(), new FixedClock("2026-11-17"));
    expect(catalog.keys().sort()).toEqual([...FEATURE_KEYS].sort());
  });

  it("gives css.properties.gap a Baseline status from the snapshot", () => {
    const { services } = build(new FakeStorage(), new FixedClock("2026-11-17"));
    const [lookup] = services.featureStatuses.execute("`css.properties.gap`");
    expect(lookup.status?.baseline).toBe("widely");
  });

  it("keeps notes across a reload (a second repository on the same storage)", () => {
    const storage = new FakeStorage();
    const clock = new FixedClock("2026-11-17");
    build(storage, clock).services.addNote.execute(goodDraft);
    const reloaded = build(storage, new FixedClock("2026-11-18")).services;
    expect(reloaded.listNotes.execute()).toHaveLength(1);
    expect(reloaded.listDueNotes.execute()).toHaveLength(1);
    reloaded.markReviewed.execute(reloaded.listNotes.execute()[0].id);
    expect(reloaded.listDueNotes.execute()).toHaveLength(0);
  });
});

describe("App screen", () => {
  it("shows empty states and labelled form fields", () => {
    const html = renderToString(<App services={build(new FakeStorage(), new FixedClock("2026-11-17")).services} />);
    expect(html).toContain("Nothing is due");
    expect(html).toContain("No notes yet");
    expect(html).toContain('for="roadmap-item"');
    expect(html).toContain('role="status"');
  });

  it("shows a due note with its badge, source link, and a review button", () => {
    const storage = new FakeStorage();
    build(storage, new FixedClock("2026-11-10")).services.addNote.execute(goodDraft);
    const html = renderToString(<App services={build(storage, new FixedClock("2026-11-17")).services} />).replaceAll("<!-- -->", ""); // React marks text joins
    expect(html).toContain("Due for review (1)");
    expect(html).toContain("Widely available");
    expect(html).toContain("https://developer.mozilla.org/docs/Web/CSS/gap");
    expect(html).toContain("as reviewed");
  });
});
