import { describe, expect, it } from 'vitest';
import { DeveloperConfig } from '../../src/features/configurator/model';
import {
  LocalStorageConfigStorage,
  type KeyValueStorage,
} from '../../src/shared/lib/LocalStorageConfigStorage';
import { StorageError } from '../../src/shared/lib/errors';

const config = DeveloperConfig.create({
  shell: 'bash',
  gitName: 'Grace Hopper',
  gitEmail: 'grace@example.com',
  editor: 'neovim',
  nodeVersion: '22.0.0',
});

class FakeStorage implements KeyValueStorage {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

describe('LocalStorageConfigStorage', () => {
  it('round-trips a saved configuration', () => {
    const storage = new LocalStorageConfigStorage(new FakeStorage(), 'key');
    storage.save(config);
    const loaded = storage.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.git.email).toBe('grace@example.com');
  });

  it('returns null when nothing is saved', () => {
    const storage = new LocalStorageConfigStorage(new FakeStorage(), 'key');
    expect(storage.load()).toBeNull();
  });

  it('reports present-but-invalid data as a read error', () => {
    const fake = new FakeStorage();
    fake.setItem('key', '{ not json');
    const storage = new LocalStorageConfigStorage(fake, 'key');
    expect(() => storage.load()).toThrow(StorageError);
  });

  it('clears a saved configuration', () => {
    const fake = new FakeStorage();
    const storage = new LocalStorageConfigStorage(fake, 'key');
    storage.save(config);
    storage.clear();
    expect(storage.load()).toBeNull();
  });
});
