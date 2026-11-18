/**
 * The learning log in the browser.
 * The saved value carries a version number. An older version is migrated, a
 * newer version is not guessed at: the log is put aside and the app starts
 * with an empty one.
 */

import { LearningNote, type RawNote } from '../domain/LearningNote';
import { isStepId, STEP_IDS, type StepId, type StepPatch } from '../domain/model';
import type { Logger, StorageAdapter, TrackerRepository } from '../domain/ports';
import { initialState, type TrackerState } from '../domain/TrackerState';

/** The shape that is written to the storage. */
interface SavedLog {
  version: number;
  notes: unknown[];
}

export class LocalStorageTrackerRepository implements TrackerRepository {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly key: string,
    private readonly currentVersion: number,
    private readonly logger: Logger,
  ) {}

  /** Reads the log, and migrates it when it was written by an older build. */
  async load(): Promise<TrackerState> {
    const raw = this.storage.getItem(this.key);
    if (raw === null) {
      return initialState();
    }

    let parsed: Partial<SavedLog>;
    try {
      parsed = JSON.parse(raw) as Partial<SavedLog>;
    } catch {
      this.logger.error('the saved log is not valid JSON, starting with an empty log');
      this.storage.removeItem(this.key);
      return initialState();
    }

    const version = Number(parsed.version ?? 1);
    if (!Number.isInteger(version) || version < 1) {
      this.logger.error('the saved log has no usable version, starting with an empty log');
      this.storage.removeItem(this.key);
      return initialState();
    }

    if (version > this.currentVersion) {
      this.logger.error('the saved log was written by a newer build, starting with an empty log', {
        savedVersion: version,
        currentVersion: this.currentVersion,
      });
      this.storage.removeItem(this.key);
      return initialState();
    }

    const notes = readNotes(parsed.notes ?? [], version);
    if (version < this.currentVersion) {
      this.logger.info('the saved log was migrated', { savedVersion: version, currentVersion: this.currentVersion });
      await this.save({ notes });
    }
    return { notes };
  }

  /** Writes the whole log under the current version. */
  async save(state: TrackerState): Promise<void> {
    const payload: SavedLog = {
      version: this.currentVersion,
      notes: Object.values(state.notes).map((note) => note.toJSON()),
    };
    this.storage.setItem(this.key, JSON.stringify(payload));
  }
}

/** Turns the saved notes into notes of the current shape. */
function readNotes(saved: unknown[], version: number): Record<string, LearningNote> {
  const notes: Record<string, LearningNote> = {};
  for (const entry of saved) {
    const raw = entry as RawNote;
    if (!raw || typeof raw.id !== 'string' || typeof raw.title !== 'string') {
      continue;
    }
    try {
      const steps = version < 2 ? stepsFromVersionOne(raw.steps) : raw.steps;
      notes[raw.id] = LearningNote.restore({
        id: raw.id,
        title: raw.title,
        steps,
        createdAt: raw.createdAt ?? '',
        updatedAt: raw.updatedAt ?? raw.createdAt ?? '',
      });
    } catch {
      // One broken note must not stop the whole log from loading.
    }
  }
  return notes;
}

/** Version 1 kept the steps as a list of the ones that were done. */
function stepsFromVersionOne(old: unknown): Partial<Record<StepId, StepPatch>> {
  const done = Array.isArray(old) ? old.filter(isStepId) : [];
  const steps: Partial<Record<StepId, StepPatch>> = {};
  for (const step of STEP_IDS) {
    steps[step] = { done: done.includes(step), note: '', updatedAt: null };
  }
  return steps;
}
