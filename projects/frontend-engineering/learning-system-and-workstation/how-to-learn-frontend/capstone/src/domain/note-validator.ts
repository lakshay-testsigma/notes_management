import { ValidationError } from "./errors.js";
import type { NoteDraft } from "./note.js";

const MAX_TITLE = 120;
const MAX_BODY = 4000;

// Schema first: one place that says what a good note is, with messages that say how to fix it.
export class NoteValidator {
  validate(draft: NoteDraft): NoteDraft {
    const issues: string[] = [];
    const title = draft.title.trim();
    const roadmapItem = draft.roadmapItem.trim();
    const body = draft.body.trim();

    if (!roadmapItem) issues.push("Roadmap item is empty. Name the roadmap item you studied.");
    if (!title) issues.push("Title is empty. Write one line that says what you learned.");
    if (title.length > MAX_TITLE) issues.push(`Title is ${title.length} characters. Shorten it to ${MAX_TITLE}.`);
    if (!body) issues.push("Note text is empty. Write at least one sentence.");
    if (body.length > MAX_BODY) issues.push(`Note text is too long. Keep it under ${MAX_BODY} characters.`);
    if (draft.sources.length === 0) issues.push("Add at least one primary source link.");

    const sources = draft.sources.map((source) => {
      if (!this.isWebUrl(source.url)) {
        issues.push(`Source "${source.url}" is not a web address. Use a link that starts with https://.`);
      }
      return { label: source.label.trim() || source.url.trim(), url: source.url.trim() };
    });

    if (issues.length > 0) throw new ValidationError(issues);
    return { roadmapItem, title, body, sources };
  }

  // Only http(s): a "javascript:" link in a saved note would run code when clicked.
  private isWebUrl(value: string): boolean {
    try {
      const url = new URL(value.trim());
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }
}
