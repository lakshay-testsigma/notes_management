// Reads and validates the environment variables at startup. A missing or
// invalid variable fails fast instead of surfacing later as a blank page.

import { ConfigError } from './lib/errors';

export interface EnvRecord {
  [key: string]: string | undefined;
}

export class EnvConfig {
  private constructor(
    readonly appTitle: string,
    readonly storageKey: string,
  ) {}

  static from(env: EnvRecord): EnvConfig {
    return new EnvConfig(
      EnvConfig.readString(env, 'VITE_APP_TITLE', 'Dev environment configurator'),
      EnvConfig.readString(env, 'VITE_STORAGE_KEY', 'dev-env-configurator'),
    );
  }

  private static readString(env: EnvRecord, key: string, fallback: string): string {
    const value = env[key];
    if (value === undefined || value === '') {
      return fallback;
    }
    if (value.length > 100 || /[\r\n]/.test(value)) {
      throw new ConfigError('UNEXPECTED', key);
    }
    return value;
  }
}
