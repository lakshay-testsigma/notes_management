import type { Note } from "../domain/note.js";
import type { NoteRepository } from "../domain/ports.js";

export class ListNotes {
  constructor(private readonly notes: NoteRepository) {}

  // Newest first.
  execute(): Note[] {
    return [...this.notes.all()].sort((a, b) => b.createdOn.localeCompare(a.createdOn));
  }
}
