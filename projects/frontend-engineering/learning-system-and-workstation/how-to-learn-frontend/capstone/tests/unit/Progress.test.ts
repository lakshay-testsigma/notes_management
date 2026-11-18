import { describe, expect, it } from 'vitest';
import { LearningNote } from '../../src/domain/LearningNote';
import { buildDashboard, computeProgress, findGaps, renderLog } from '../../src/domain/Progress';

function noteWithDoneSteps(id: string, title: string, done: string[]): LearningNote {
  let note = LearningNote.create({ id, title }, '2026-11-19');
  for (const step of done) {
    note = note.completeStep(step as never, undefined, '2026-11-19');
  }
  return note;
}

describe('the dashboard of the log', () => {
  it('counts the done steps of every note', () => {
    const notes = [noteWithDoneSteps('baseline', 'Baseline', ['read', 'build']), noteWithDoneSteps('loop', 'Loop', ['read'])];

    const progress = computeProgress(notes);

    expect(progress.totalNotes).toBe(2);
    expect(progress.doneSteps).toBe(3);
    expect(progress.totalSteps).toBe(8);
    expect(progress.completeNotes).toBe(0);
    expect(progress.percent).toBe(38);
  });

  it('counts no progress when the log is empty', () => {
    expect(computeProgress([]).percent).toBe(0);
  });

  it('names every step that is still missing', () => {
    const notes = [noteWithDoneSteps('baseline', 'Baseline', ['read', 'build'])];

    const gaps = findGaps(notes);

    expect(gaps.map((gap) => gap.step)).toEqual(['measure', 'explain']);
    expect(gaps[0]?.noteTitle).toBe('Baseline');
  });

  it('builds one row per note and sorts the notes by their id', () => {
    const state = {
      notes: {
        loop: noteWithDoneSteps('loop', 'The learning loop', ['read']),
        baseline: noteWithDoneSteps('baseline', 'Baseline', []),
      },
    };

    const dashboard = buildDashboard(state);

    expect(dashboard.notes.map((row) => row.id)).toEqual(['baseline', 'loop']);
    expect(dashboard.notes[1]?.missing).toEqual(['build', 'measure', 'explain']);
    expect(dashboard.gaps).toHaveLength(7);
  });

  it('renders the log as Markdown with one section per step', () => {
    const note = LearningNote.create({ id: 'loop', title: 'The learning loop' }, '2026-11-19').completeStep(
      'read',
      'Read the MDN page',
      '2026-11-19',
    );

    const markdown = renderLog({ notes: { loop: note } });

    expect(markdown).toContain('# Learning log');
    expect(markdown).toContain('## The learning loop');
    expect(markdown).toContain('### read - done');
    expect(markdown).toContain('Read the MDN page');
    expect(markdown).toContain('### build - missing');
  });
});
