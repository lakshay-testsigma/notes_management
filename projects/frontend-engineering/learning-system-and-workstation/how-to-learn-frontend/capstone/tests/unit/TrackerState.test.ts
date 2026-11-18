import { describe, expect, it } from 'vitest';
import { InvalidNoteError } from '../../src/domain/errors';
import { LearningNote } from '../../src/domain/LearningNote';
import { applyPatch, initialState } from '../../src/domain/TrackerState';

function stateWithTwoNotes() {
  const first = LearningNote.create({ id: 'baseline', title: 'Baseline' }, '2026-11-19');
  const second = LearningNote.create({ id: 'loop', title: 'The learning loop' }, '2026-11-19');
  return { notes: { baseline: first, loop: second } };
}

describe('applyPatch', () => {
  it('changes one note and leaves the other note exactly as it was', () => {
    const state = stateWithTwoNotes();

    const next = applyPatch(state, {
      notes: { loop: { steps: { read: { done: true, updatedAt: '2026-11-19T10:00:00.000Z' } } } },
    });

    expect(next.notes.loop?.steps.read.done).toBe(true);
    expect(next.notes.baseline).toBe(state.notes.baseline);
    expect(next.notes.baseline?.steps.read.done).toBe(false);
  });

  it('keeps the identity of the notes the patch does not touch', () => {
    const state = stateWithTwoNotes();

    const next = applyPatch(state, { notes: { loop: { title: 'Learning loop' } } });

    expect(next.notes.baseline).toBe(state.notes.baseline);
    expect(next.notes.loop).not.toBe(state.notes.loop);
  });

  it('does not change the old state', () => {
    const state = stateWithTwoNotes();

    applyPatch(state, { notes: { loop: { title: 'Learning loop' } } });

    expect(state.notes.loop?.title).toBe('The learning loop');
  });

  it('adds a note that is not in the log yet', () => {
    const state = initialState();

    const next = applyPatch(state, {
      notes: {
        loop: {
          title: 'The learning loop',
          steps: {
            read: { done: false, note: '', updatedAt: null },
            build: { done: false, note: '', updatedAt: null },
            measure: { done: false, note: '', updatedAt: null },
            explain: { done: false, note: '', updatedAt: null },
          },
          createdAt: '2026-11-19',
        },
      },
    });

    expect(next.notes.loop?.title).toBe('The learning loop');
    expect(next.notes.loop?.doneCount()).toBe(0);
  });

  it('refuses a new note without a title or without a creation date', () => {
    expect(() => applyPatch(initialState(), { notes: { loop: { createdAt: '2026-11-19' } } })).toThrow(InvalidNoteError);
    expect(() => applyPatch(initialState(), { notes: { loop: { title: 'The learning loop' } } })).toThrow(InvalidNoteError);
  });
});
