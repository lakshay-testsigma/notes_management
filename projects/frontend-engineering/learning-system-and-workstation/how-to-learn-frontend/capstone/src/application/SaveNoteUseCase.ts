/**
 * Adds a roadmap item to the log, or renames one that is already there.
 */

import { InvalidNoteError } from '../domain/errors';
import { createEmptySteps, isValidNoteId, type Clock, type NoteDraft } from '../domain/model';
import type { TrackerState } from '../domain/TrackerState';
import { TrackerStore } from './TrackerStore';

export class SaveNoteUseCase {
  constructor(
    private readonly store: TrackerStore,
    private readonly clock: Clock,
  ) {}

  /** One patch that adds the note or changes its title. */
  async execute(draft: NoteDraft): Promise<TrackerState> {
    if (!isValidNoteId(draft.id)) {
      throw new InvalidNoteError(draft.id, 'the id must be lowercase words joined by dashes');
    }
    const now = this.clock();
    const existing = this.store.getState().notes[draft.id];
    const patch = existing
      ? { notes: { [draft.id]: { title: draft.title, updatedAt: now } } }
      : {
          notes: {
            [draft.id]: {
              title: draft.title,
              steps: createEmptySteps(),
              createdAt: now,
              updatedAt: now,
            },
          },
        };
    return this.store.applyPatch(patch);
  }
}
