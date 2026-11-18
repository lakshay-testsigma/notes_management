import type { Budgets } from "./Budgets.ts";
import type { Finding, SourceName } from "./model.ts";

// Reads a file as text. The real adapter uses the disk; tests use a map.
export interface FileSource {
  readText(path: string): Promise<string>;
}

export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

// Turns raw text into plain data. Throws InputError when the text is wrong.
export interface Gatherer<T> {
  readonly source: SourceName;
  parse(text: string): T;
}

// Judges plain data against budgets. It never reads files and never logs.
export interface Audit<T> {
  readonly source: SourceName;
  run(data: T, budgets: Budgets): Finding[];
}
