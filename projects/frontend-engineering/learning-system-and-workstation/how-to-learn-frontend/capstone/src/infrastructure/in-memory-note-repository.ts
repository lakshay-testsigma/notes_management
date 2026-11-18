import type { Note } from "../domain/note.js";
import type { NoteRepository } from "../domain/ports.js";

// Used by unit tests and by the interface tests: no browser storage needed.
export class InMemoryNoteRepository implements NoteRepository {
  private readonly byId = new Map<string, Note>();

  all(): Note[] {
    return [...this.byId.values()];
  }

  save(note: Note): void {
    this.byId.set(note.id, note);
  }
}
