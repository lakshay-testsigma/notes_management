/**
 * The ports of the domain: what the rules need from the outside world.
 * The domain names what it needs; the infrastructure decides how it is done.
 */

import type { TrackerState } from './TrackerState';

/** Somewhere to keep the learning log between visits. */
export interface TrackerRepository {
  /** Reads the log. Returns an empty log when nothing was saved yet. */
  load(): Promise<TrackerState>;
  /** Writes the whole log. */
  save(state: TrackerState): Promise<void>;
}

/** A key and value store. The browser has one; a test has another. */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Where the app writes what happened. */
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
