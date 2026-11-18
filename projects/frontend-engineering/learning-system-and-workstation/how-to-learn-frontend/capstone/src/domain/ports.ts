import type { FeatureData } from "./feature.js";
import type { Note } from "./note.js";

// Ports: the domain says what it needs; infrastructure supplies it.

export interface NoteRepository {
  all(): Note[];
  save(note: Note): void;
}

export interface FeatureCatalog {
  // Returns undefined when the key is not in the local snapshot.
  find(key: string): FeatureData | undefined;
}

export interface Clock {
  today(): string; // ISO date, YYYY-MM-DD
}

export interface IdGenerator {
  next(): string;
}

export interface Logger {
  info(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
}
