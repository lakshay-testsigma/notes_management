/**
 * The configuration of the app.
 * Every value comes from an environment variable. A missing variable stops the
 * app at startup and says which one it is.
 */

import { ConfigError } from '../domain/errors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AppConfig {
  storageKey: string;
  schemaVersion: number;
  logLevel: LogLevel;
}

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

export class Config {
  private constructor(private readonly values: AppConfig) {}

  /** Reads and checks the environment. Throws a ConfigError for a bad value. */
  static fromEnv(env: Record<string, string | undefined>): Config {
    const storageKey = readText(env, 'VITE_TRACKER_STORAGE_KEY');
    const schemaVersion = readNumber(env, 'VITE_TRACKER_SCHEMA_VERSION');
    const logLevel = readLevel(env, 'VITE_TRACKER_LOG_LEVEL');
    return new Config({ storageKey, schemaVersion, logLevel });
  }

  get storageKey(): string {
    return this.values.storageKey;
  }

  get schemaVersion(): number {
    return this.values.schemaVersion;
  }

  get logLevel(): LogLevel {
    return this.values.logLevel;
  }
}

function readText(env: Record<string, string | undefined>, name: string): string {
  const value = env[name];
  if (value === undefined || value.trim() === '') {
    throw new ConfigError(name, 'it is missing. Copy .env.example to .env and set it');
  }
  return value.trim();
}

function readNumber(env: Record<string, string | undefined>, name: string): number {
  const value = readText(env, name);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ConfigError(name, 'it must be a whole number of 1 or more');
  }
  return parsed;
}

function readLevel(env: Record<string, string | undefined>, name: string): LogLevel {
  const value = readText(env, name);
  if (!LOG_LEVELS.includes(value as LogLevel)) {
    throw new ConfigError(name, `it must be one of ${LOG_LEVELS.join(', ')}`);
  }
  return value as LogLevel;
}
