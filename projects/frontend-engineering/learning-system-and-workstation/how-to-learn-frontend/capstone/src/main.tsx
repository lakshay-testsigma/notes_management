import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AddNote } from "./application/add-note.js";
import { GetFeatureStatuses } from "./application/get-feature-statuses.js";
import { ListDueNotes } from "./application/list-due-notes.js";
import { ListNotes } from "./application/list-notes.js";
import { MarkReviewed } from "./application/mark-reviewed.js";
import { BaselineCalculator } from "./domain/baseline-calculator.js";
import { FeatureKeyExtractor } from "./domain/feature-key-extractor.js";
import { NoteValidator } from "./domain/note-validator.js";
import { ReviewScheduler } from "./domain/review-scheduler.js";
import snapshot from "./infrastructure/data/feature-snapshot.json";
import { Config } from "./infrastructure/config.js";
import { JsonLogger } from "./infrastructure/json-logger.js";
import { LocalStorageNoteRepository } from "./infrastructure/local-storage-note-repository.js";
import { SnapshotFeatureCatalog, type FeatureSnapshot } from "./infrastructure/snapshot-feature-catalog.js";
import { RandomIdGenerator, SystemClock } from "./infrastructure/system-clock.js";
import { App } from "./interface/App.js";
import "./interface/styles.css";

// Composition root: the only place that creates objects and wires them together.
const config = Config.fromEnv(import.meta.env);
const logger = new JsonLogger(config.logLevel, crypto.randomUUID());
const ids = new RandomIdGenerator();
const clock = new SystemClock();
const notes = new LocalStorageNoteRepository(window.localStorage, config.storageKey, logger);
const catalog = new SnapshotFeatureCatalog(snapshot as unknown as FeatureSnapshot);
const scheduler = new ReviewScheduler();

const services = {
  addNote: new AddNote(notes, new NoteValidator(), scheduler, clock, ids, logger),
  listNotes: new ListNotes(notes),
  listDueNotes: new ListDueNotes(notes, scheduler, clock),
  markReviewed: new MarkReviewed(notes, scheduler, clock, logger),
  featureStatuses: new GetFeatureStatuses(catalog, new FeatureKeyExtractor(), new BaselineCalculator(), () => new Date()),
};

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App services={services} onUnexpected={(error) => logger.error("ui.unexpected", { message: String(error) })} />
  </StrictMode>,
);
