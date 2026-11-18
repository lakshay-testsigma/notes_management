import { describe, expect, it } from 'vitest';
import { InvalidNoteError, InvalidStepError } from '../../src/domain/errors';
import { LearningNote } from '../../src/domain/LearningNote';
import { STEP_IDS } from '../../src/domain/model';

describe('LearningNote', () => {
  it('starts with the four steps of the loop, none of them done', () => {
    const note = LearningNote.create({ id: 'learning-loop', title: 'The learning loop' }, '2026-11-19');

    expect(Object.keys(note.steps)).toEqual([...STEP_IDS]);
    expect(note.doneCount()).toBe(0);
    expect(note.missingSteps()).toEqual([...STEP_IDS]);
    expect(note.isComplete()).toBe(false);
  });

  it('refuses a note without a title', () => {
    expect(() => LearningNote.create({ id: 'learning-loop', title: '   ' }, '2026-11-19')).toThrow(InvalidNoteError);
  });

  it('marks one step as done and leaves the note text alone when none is given', () => {
    const note = LearningNote.create({ id: 'learning-loop', title: 'The learning loop' }, '2026-11-19');

    const updated = note.completeStep('build', undefined, '2026-11-19T10:00:00.000Z');

    expect(updated.steps.build.done).toBe(true);
    expect(updated.steps.build.note).toBe('');
    expect(updated.steps.build.updatedAt).toBe('2026-11-19T10:00:00.000Z');
    expect(updated.steps.read.done).toBe(false);
  });

  it('keeps the old note unchanged, so the dashboard can compare the two', () => {
    const note = LearningNote.create({ id: 'learning-loop', title: 'The learning loop' }, '2026-11-19');

    const updated = note.completeStep('read', 'Read the MDN page', '2026-11-19T10:00:00.000Z');

    expect(note.steps.read.done).toBe(false);
    expect(updated.steps.read.done).toBe(true);
    expect(updated.steps.read.note).toBe('Read the MDN page');
  });

  it('refuses a step outside the four steps of the loop', () => {
    const note = LearningNote.create({ id: 'learning-loop', title: 'The learning loop' }, '2026-11-19');

    expect(() => note.withPatch({ steps: { review: { done: true } } as never })).toThrow(InvalidStepError);
  });

  it('is complete only when all four steps are done', () => {
    const note = LearningNote.create({ id: 'learning-loop', title: 'The learning loop' }, '2026-11-19');

    const steps = [...STEP_IDS];
    const finished = steps.reduce((current, step) => current.completeStep(step, undefined, '2026-11-19'), note);

    expect(finished.isComplete()).toBe(true);
    expect(finished.doneCount()).toBe(4);
  });

  it('restores a saved note and fills the steps it does not hold', () => {
    const note = LearningNote.restore({
      id: 'learning-loop',
      title: 'The learning loop',
      steps: { read: { done: true, note: 'Read it', updatedAt: null } },
      createdAt: '2026-11-19',
      updatedAt: '2026-11-19',
    });

    expect(note.steps.read.done).toBe(true);
    expect(note.steps.build.done).toBe(false);
    expect(note.doneCount()).toBe(1);
  });
});
