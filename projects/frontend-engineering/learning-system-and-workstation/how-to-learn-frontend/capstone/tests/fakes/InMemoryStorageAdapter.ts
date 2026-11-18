import type { StorageAdapter } from '../../src/domain/ports';

/** A key and value store that lives in a map. Used by the unit tests. */
export class InMemoryStorageAdapter implements StorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}
