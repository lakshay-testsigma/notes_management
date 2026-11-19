import { describe, expect, it } from 'vitest';
import { EnvConfig } from '../../src/shared/config';

describe('EnvConfig.from', () => {
  it('uses defaults when variables are absent', () => {
    const config = EnvConfig.from({});
    expect(config.appTitle).toBe('Dev environment configurator');
    expect(config.storageKey).toBe('dev-env-configurator');
  });

  it('reads present variables', () => {
    const config = EnvConfig.from({ VITE_APP_TITLE: 'My setup', VITE_STORAGE_KEY: 'my-key' });
    expect(config.appTitle).toBe('My setup');
    expect(config.storageKey).toBe('my-key');
  });

  it('rejects a value that could break the page', () => {
    expect(() => EnvConfig.from({ VITE_APP_TITLE: 'a\n<script>' })).toThrow();
  });
});
