import { describe, expect, it } from "vitest";

import { HEADINGS, STEPS, buildNote, validateNote, type StepId } from "../src/note";

const topic = "learning-loop";
const date = "2026-11-18";

function freshNote(): string {
  return buildNote({ topic, date });
}

function fillStep(markdown: string, step: StepId, text: string): string {
  const heading = `## ${HEADINGS[step]}\n`;
  return markdown.replace(heading, () => `${heading}${text}\n`);
}

describe("the learning loop", () => {
  it("has four steps in order", () => {
    expect(STEPS).toEqual(["read", "build", "measure", "explain"]);
  });
});

describe("buildNote", () => {
  it("writes the topic and the date into the note", () => {
    const note = freshNote();
    expect(note).toContain("# Learning note: learning-loop");
    expect(note).toContain("- Date: 2026-11-18");
  });

  it("gives every step its own section", () => {
    const note = freshNote();
    expect(note).toContain("## Read");
    expect(note).toContain("## Build");
    expect(note).toContain("## Measure");
    expect(note).toContain("## Explain");
  });

  it("keeps the four sections in the order of the loop", () => {
    const note = freshNote();
    const positions = STEPS.map((step) => note.indexOf(`## ${HEADINGS[step]}`));
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });
});

describe("validateNote", () => {
  it("reports every step of a fresh note as empty", () => {
    expect(validateNote(freshNote())).toEqual(["read", "build", "measure", "explain"]);
  });

  it("reports only the step that has no content", () => {
    let note = freshNote();
    note = fillStep(note, "read", "- Read the MDN page on the web platform.");
    note = fillStep(note, "build", "- Built a demo with a flex layout.");
    note = fillStep(note, "explain", "- Flexbox places items along one axis.");
    expect(validateNote(note)).toEqual(["measure"]);
  });

  it("treats a section with only spaces as empty", () => {
    const note = freshNote().replace("## Measure\n", "## Measure\n   \n");
    expect(validateNote(note)).toContain("measure");
  });

  it("reports a step whose heading is missing", () => {
    const note = freshNote().replace("## Build\n", "");
    expect(validateNote(note)).toContain("build");
  });

  it("accepts a note where every step has content", () => {
    let note = freshNote();
    for (const step of STEPS) note = fillStep(note, step, `- Wrote the ${step} step.`);
    expect(validateNote(note)).toEqual([]);
  });
});
