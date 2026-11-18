// The four steps of the learning loop, in the order a learner walks them.
export const STEPS = ["read", "build", "measure", "explain"] as const;

export type StepId = (typeof STEPS)[number];

// The heading each step gets inside the note.
export const HEADINGS: Record<StepId, string> = {
  read: "Read",
  build: "Build",
  measure: "Measure",
  explain: "Explain",
};

export type NoteInput = {
  topic: string;
  date: string;
};

/**
 * Build the markdown skeleton of one learning note.
 * Every section starts empty, so the learner writes each step after doing it.
 */
// TODO(1): Build the markdown skeleton of one learning note.
export function buildNote(input: NoteInput): string {
  throw new Error("TODO(1): buildNote is not implemented yet");
}

/**
 * Return the steps whose section holds no text yet.
 * A missing heading counts as an empty step, so a broken note never looks done.
 */
// TODO(2): Return the steps whose section holds no text yet.
export function validateNote(markdown: string): StepId[] {
  throw new Error("TODO(2): validateNote is not implemented yet");
}
