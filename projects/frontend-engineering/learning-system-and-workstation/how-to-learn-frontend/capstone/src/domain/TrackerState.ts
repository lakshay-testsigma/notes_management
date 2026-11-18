/**
 * The state of the tracker and the one way to change it.
 * A change is a patch: it names what changes and leaves the rest alone.
 */

import { InvalidNoteError } from './errors';
import { LearningNote, type NotePatch, type RawNote } from './LearningNote';
import type { StepId, StepPatch } from './model';

/** Every roadmap item the developer has a note for, keyed by its id. */
export interface TrackerState {
  notes: Record<string, LearningNote>;
}

/** The change to make. One patch can touch several notes at once. */
export interface TrackerPatch {
  notes?: Record<string, NotePatch>;
}

/** A log with no notes yet. */
export function initialState(): TrackerState {
  return { notes: {} };
}

/**
 * Merges a patch over the state and returns a new state.
 * The notes the patch does not touch keep their identity, so the dashboard
 * only has to redraw the notes that really changed.
 */
export function applyPatch(state: TrackerState, patch: TrackerPatch): TrackerState {
  const notes: Record<string, LearningNote> = { ...state.notes };
  for (const [noteId, notePatch] of Object.entries(patch.notes ?? {})) {
    const existing = notes[noteId];
    notes[noteId] = existing ? existing.withPatch(notePatch) : createNote(noteId, notePatch);
  }
  return { notes };
}

/** A note that the patch brings into the log. */
function createNote(noteId: string, patch: NotePatch): LearningNote {
  if (!patch.title || patch.title.trim().length === 0) {
    throw new InvalidNoteError(noteId, 'a new note needs a title');
  }
  if (!patch.createdAt) {
    throw new InvalidNoteError(noteId, 'a new note needs a creation date');
  }
  const steps: Partial<Record<StepId, StepPatch>> = patch.steps ?? {};
  const raw: RawNote = {
    id: noteId,
    title: patch.title.trim(),
    steps,
    createdAt: patch.createdAt,
    updatedAt: patch.updatedAt ?? patch.createdAt,
  };
  return LearningNote.restore(raw);
}
