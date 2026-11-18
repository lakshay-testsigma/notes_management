import type { Note } from "../domain/note.js";
import type { Logger, NoteRepository } from "../domain/ports.js";

// The part of window.localStorage we use; tests pass a fake.
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// Local-first: all notes live in one JSON value in the browser. No server, no account.
export class LocalStorageNoteRepository implements NoteRepository {
  constructor(
    private readonly storage: StorageLike,
    private readonly key: string,
    private readonly logger: Logger,
  ) {}

  all(): Note[] {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("stored value is not a list");
      return parsed as Note[];
    } catch (error) {
      // Log with context and show an empty journal; the bad value stays until the next save.
      this.logger.error("storage.corrupt", { key: this.key, message: String(error) });
      return [];
    }
  }

  save(note: Note): void {
    const others = this.all().filter((n) => n.id !== note.id);
    this.storage.setItem(this.key, JSON.stringify([...others, note]));
  }
}
