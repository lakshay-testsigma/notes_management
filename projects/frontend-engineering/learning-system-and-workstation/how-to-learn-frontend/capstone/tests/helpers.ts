import type { Clock, IdGenerator, Logger } from "../src/domain/ports.js";
import type { NoteDraft } from "../src/domain/note.js";

export class FixedClock implements Clock {
  constructor(public date: string) {}
  today(): string { return this.date; }
}

export class CountingIds implements IdGenerator {
  private n = 0;
  next(): string { return `note-${++this.n}`; }
}

export class RecordingLogger implements Logger {
  events: { level: string; event: string; fields: Record<string, unknown> }[] = [];
  info(event: string, fields: Record<string, unknown> = {}) { this.events.push({ level: "info", event, fields }); }
  error(event: string, fields: Record<string, unknown> = {}) { this.events.push({ level: "error", event, fields }); }
}

export const goodDraft: NoteDraft = {
  roadmapItem: "CSS layout",
  title: "Grid gap replaces margins",
  body: "Use `css.properties.gap` between grid items.",
  sources: [{ label: "MDN gap", url: "https://developer.mozilla.org/docs/Web/CSS/gap" }],
};
