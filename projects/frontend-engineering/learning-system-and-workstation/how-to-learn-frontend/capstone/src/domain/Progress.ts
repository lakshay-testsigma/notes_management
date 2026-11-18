/**
 * What the dashboard shows: how far the roadmap has come and what is missing.
 * These are pure functions, so they can be tested without a browser.
 */

import type { LearningNote } from './LearningNote';
import { STEP_IDS, type StepId, type StepMap } from './model';
import type { TrackerState } from './TrackerState';

/** How much of the roadmap is done. */
export interface ProgressSummary {
  totalNotes: number;
  completeNotes: number;
  doneSteps: number;
  totalSteps: number;
  percent: number;
}

/** One step of one note that is still not done. */
export interface Gap {
  noteId: string;
  noteTitle: string;
  step: StepId;
}

/** One roadmap item, as the dashboard shows it. */
export interface NoteSummary {
  id: string;
  title: string;
  steps: StepMap;
  doneSteps: number;
  totalSteps: number;
  complete: boolean;
  missing: StepId[];
}

/** Everything the dashboard needs. */
export interface Dashboard {
  notes: NoteSummary[];
  progress: ProgressSummary;
  gaps: Gap[];
}

/** Counts the done steps and the finished notes. */
export function computeProgress(notes: LearningNote[]): ProgressSummary {
  const totalSteps = notes.length * STEP_IDS.length;
  const doneSteps = notes.reduce((sum, note) => sum + note.doneCount(), 0);
  const completeNotes = notes.filter((note) => note.isComplete()).length;
  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
  return { totalNotes: notes.length, completeNotes, doneSteps, totalSteps, percent };
}

/** Names every step of every note that is still not done. */
export function findGaps(notes: LearningNote[]): Gap[] {
  return notes.flatMap((note) =>
    note.missingSteps().map((step) => ({
      noteId: note.id,
      noteTitle: note.title,
      step,
    })),
  );
}

/** The whole dashboard, built from the state of the log. */
export function buildDashboard(state: TrackerState): Dashboard {
  const notes = Object.values(state.notes).sort((a, b) => a.id.localeCompare(b.id));
  return {
    notes: notes.map((note) => ({
      id: note.id,
      title: note.title,
      steps: note.steps,
      doneSteps: note.doneCount(),
      totalSteps: STEP_IDS.length,
      complete: note.isComplete(),
      missing: note.missingSteps(),
    })),
    progress: computeProgress(notes),
    gaps: findGaps(notes),
  };
}

/** The whole log as Markdown, ready to paste into a note or a blog post. */
export function renderLog(state: TrackerState): string {
  const notes = Object.values(state.notes).sort((a, b) => a.id.localeCompare(b.id));
  const lines: string[] = ['# Learning log', ''];
  for (const note of notes) {
    lines.push(`## ${note.title}`, '', `Roadmap item: ${note.id}`, '');
    for (const step of STEP_IDS) {
      const record = note.steps[step];
      lines.push(`### ${step} - ${record.done ? 'done' : 'missing'}`, '');
      lines.push(record.note.trim() || '_no note yet_', '');
    }
  }
  return lines.join('\n');
}
