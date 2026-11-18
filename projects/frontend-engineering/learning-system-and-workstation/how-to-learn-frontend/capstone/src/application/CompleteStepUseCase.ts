/**
 * Marks one step of one roadmap item as done.
 */

import { NoteNotFoundError } from '../domain/errors';
import type { Clock, StepId } from '../domain/model';
import type { TrackerState } from '../domain/TrackerState';
import { TrackerStore } from './TrackerStore';

/** What the developer wants to happen to one step. */
export interface StepChange {
  /** True marks the step as done, false opens it again. */
  done?: boolean;
  /** The text the developer wrote for the step. */
  note?: string;
}

export class CompleteStepUseCase {
  constructor(
    private readonly store: TrackerStore,
    private readonly clock: Clock,
  ) {}

  /** One patch that changes one step of one note. */
  async execute(noteId: string, step: StepId, change: StepChange = {}): Promise<TrackerState> {
    const note = this.store.getState().notes[noteId];
    if (!note) {
      throw new NoteNotFoundError(noteId);
    }
    const patch = {
      notes: {
        [noteId]: {
          steps: {
            [step]: {
              done: change.done ?? true,
              updatedAt: this.clock(),
              ...(change.note === undefined ? {} : { note: change.note }),
            },
          },
        },
      },
    };
    return this.store.applyPatch(patch);
  }
}
