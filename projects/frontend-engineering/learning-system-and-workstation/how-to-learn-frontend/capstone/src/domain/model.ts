/**
 * The four steps of the learning loop, and the shapes that go with them.
 * Everything here is a type or a pure function, so it can be tested without
 * a browser and without React.
 */

/** The four steps, in the order the loop runs. */
export const STEP_IDS = ['read', 'build', 'measure', 'explain'] as const;

export type StepId = (typeof STEP_IDS)[number];

/** What the app knows about one step of one note. */
export interface StepRecord {
  done: boolean;
  note: string;
  updatedAt: string | null;
}

/** All four steps of one note, keyed by step id. */
export type StepMap = Record<StepId, StepRecord>;

/** The part of one step that a change is allowed to touch. */
export type StepPatch = Partial<StepRecord>;

/** What the developer types when they add or rename a roadmap item. */
export interface NoteDraft {
  id: string;
  title: string;
}

/** A source of the current time. Tests pass a fixed one. */
export type Clock = () => string;

/** Narrows any string to a step id, so the rest of the code can trust it. */
export function isStepId(value: string): value is StepId {
  return (STEP_IDS as readonly string[]).includes(value);
}

/** A note with the four steps, none of them done yet. */
export function createEmptySteps(): StepMap {
  return {
    read: { done: false, note: '', updatedAt: null },
    build: { done: false, note: '', updatedAt: null },
    measure: { done: false, note: '', updatedAt: null },
    explain: { done: false, note: '', updatedAt: null },
  };
}

/** The id of a roadmap item has to be safe to use as a file name and a key. */
export function isValidNoteId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/** Turns a name into an id: lowercase words joined by dashes. */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
