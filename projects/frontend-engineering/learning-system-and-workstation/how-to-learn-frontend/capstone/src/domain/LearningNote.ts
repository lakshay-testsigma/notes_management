/**
 * One roadmap item and its four learning steps.
 * The class keeps its fields private, so no other class can put the note into
 * a state the rules forbid. Every change returns a new note.
 */

import { InvalidNoteError, InvalidStepError } from './errors';
import {
  createEmptySteps,
  isStepId,
  type NoteDraft,
  type StepId,
  type StepMap,
  type StepPatch,
  type StepRecord,
} from './model';

/** The shape of a note as it is saved in the browser. */
export interface RawNote {
  id: string;
  title: string;
  steps: Partial<Record<StepId, StepPatch>>;
  createdAt: string;
  updatedAt: string;
}

/** The part of a note that a change is allowed to touch. */
export interface NotePatch {
  title?: string;
  steps?: Partial<Record<StepId, StepPatch>>;
  createdAt?: string;
  updatedAt?: string;
}

export class LearningNote {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly steps: StepMap,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /** A new note with the four steps, none of them done. */
  static create(draft: NoteDraft, now: string): LearningNote {
    const title = draft.title.trim();
    if (title.length === 0) {
      throw new InvalidNoteError(draft.id, 'the title is empty');
    }
    return new LearningNote(draft.id, title, createEmptySteps(), now, now);
  }

  /** A note that comes back from the storage. Missing steps stay empty. */
  static restore(raw: RawNote): LearningNote {
    if (raw.title.trim().length === 0) {
      throw new InvalidNoteError(raw.id, 'the saved title is empty');
    }
    const steps = createEmptySteps();
    for (const [id, record] of Object.entries(raw.steps ?? {})) {
      if (!isStepId(id)) {
        throw new InvalidStepError(id);
      }
      steps[id] = {
        done: record?.done ?? false,
        note: record?.note ?? '',
        updatedAt: record?.updatedAt ?? null,
      };
    }
    return new LearningNote(raw.id, raw.title, steps, raw.createdAt, raw.updatedAt);
  }

  /** A new note with the given parts replaced. The old one stays untouched. */
  withPatch(patch: NotePatch): LearningNote {
    const title = patch.title === undefined ? this.title : patch.title.trim();
    if (title.length === 0) {
      throw new InvalidNoteError(this.id, 'the title is empty');
    }
    const steps: StepMap = { ...this.steps };
    for (const [id, part] of Object.entries(patch.steps ?? {})) {
      if (!isStepId(id)) {
        throw new InvalidStepError(id);
      }
      const current = steps[id];
      steps[id] = {
        done: part?.done ?? current.done,
        note: part?.note ?? current.note,
        updatedAt: part?.updatedAt ?? current.updatedAt,
      };
    }
    return new LearningNote(
      this.id,
      title,
      steps,
      patch.createdAt ?? this.createdAt,
      patch.updatedAt ?? this.updatedAt,
    );
  }

  /** A new note with one step marked as done. */
  completeStep(step: StepId, noteText: string | undefined, now: string): LearningNote {
    if (!isStepId(step)) {
      throw new InvalidStepError(step);
    }
    const part: Partial<StepRecord> = { done: true, updatedAt: now };
    if (noteText !== undefined) {
      part.note = noteText;
    }
    return this.withPatch({ steps: { [step]: part } });
  }

  /** The steps that are still not done, in the order of the loop. */
  missingSteps(): StepId[] {
    return (Object.keys(this.steps) as StepId[]).filter((id) => !this.steps[id].done);
  }

  /** How many of the four steps are done. */
  doneCount(): number {
    return Object.values(this.steps).filter((step) => step.done).length;
  }

  /** True when the note holds all four steps of the loop. */
  isComplete(): boolean {
    return this.missingSteps().length === 0;
  }

  /** The note as it is written to the storage. */
  toJSON(): RawNote {
    return {
      id: this.id,
      title: this.title,
      steps: this.steps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
