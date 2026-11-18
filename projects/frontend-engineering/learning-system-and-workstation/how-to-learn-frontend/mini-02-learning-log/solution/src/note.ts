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
export function buildNote(input: NoteInput): string {
  const lines: string[] = [
    `# Learning note: ${input.topic}`,
    "",
    `- Date: ${input.date}`,
    `- Roadmap item: ${input.topic}`,
    "",
  ];

  for (const step of STEPS) {
    // One heading per step, with an empty body under it.
    lines.push(`## ${HEADINGS[step]}`, "");
  }

  return lines.join("\n");
}

/**
 * Return the steps whose section holds no text yet.
 * A missing heading counts as an empty step, so a broken note never looks done.
 */
export function validateNote(markdown: string): StepId[] {
  const lines = markdown.split("\n");
  const empty: StepId[] = [];

  for (const step of STEPS) {
    const start = lines.findIndex((line) => line.trim() === `## ${HEADINGS[step]}`);
    if (start === -1) {
      empty.push(step);
      continue;
    }

    let hasText = false;
    for (let index = start + 1; index < lines.length; index += 1) {
      // The next heading ends the section.
      if (lines[index].startsWith("## ")) break;
      if (lines[index].trim() !== "") {
        hasText = true;
        break;
      }
    }

    if (!hasText) empty.push(step);
  }

  return empty;
}
