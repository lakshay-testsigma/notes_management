// The production storage adapter: remembers the developer's configuration in
// the browser's local storage, behind the ConfigStorage port.

import { DeveloperConfig, type ConfigStorage } from '../../features/configurator/model';
import { StorageError } from './errors';

// A small storage surface so tests can swap in an in-memory object.
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStorageConfigStorage implements ConfigStorage {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string,
  ) {}

  save(config: DeveloperConfig): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(config.toJSON()));
    } catch {
      throw new StorageError('STORAGE_WRITE');
    }
  }

  load(): DeveloperConfig | null {
    let raw: string | null;
    try {
      raw = this.storage.getItem(this.key);
    } catch {
      throw new StorageError('STORAGE_READ');
    }
    if (raw === null) {
      return null;
    }
    try {
      return DeveloperConfig.create(JSON.parse(raw));
    } catch {
      // Stored data is present but invalid: report it as "misconfigured", not "missing".
      throw new StorageError('STORAGE_READ');
    }
  }

  clear(): void {
    try {
      this.storage.removeItem(this.key);
    } catch {
      throw new StorageError('STORAGE_WRITE');
    }
  }
}
