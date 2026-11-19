import { DeveloperConfig, type ConfigStorage } from '../../src/features/configurator/model';

export class MemoryConfigStorage implements ConfigStorage {
  private stored: DeveloperConfig | null = null;

  save(config: DeveloperConfig): void {
    this.stored = config;
  }

  load(): DeveloperConfig | null {
    return this.stored;
  }

  clear(): void {
    this.stored = null;
  }
}
