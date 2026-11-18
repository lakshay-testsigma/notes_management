/**
 * The storage of the browser.
 * When the browser refuses to give a local storage, for example in a private
 * window, the adapter keeps the values in memory so the app still works for
 * this session.
 */

import type { StorageAdapter } from '../domain/ports';

export class BrowserStorageAdapter implements StorageAdapter {
  private readonly memory = new Map<string, string>();

  constructor(private readonly storage: Storage | undefined = readBrowserStorage()) {}

  getItem(key: string): string | null {
    if (!this.storage) {
      return this.memory.get(key) ?? null;
    }
    return this.storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.storage) {
      this.memory.set(key, value);
      return;
    }
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (!this.storage) {
      this.memory.delete(key);
      return;
    }
    this.storage.removeItem(key);
  }
}

/** The local storage of the browser, when there is one. */
function readBrowserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    // Some privacy modes throw when the local storage is read.
    return undefined;
  }
}
