import { describe, expect, it } from 'vitest';
import { NodeVersion } from '../../src/features/configurator/model';

describe('NodeVersion.parse', () => {
  it('parses a three-part version', () => {
    const version = NodeVersion.parse('20.11.0');
    expect(version.major).toBe(20);
    expect(version.minor).toBe(11);
    expect(version.patch).toBe(0);
    expect(version.toString()).toBe('20.11.0');
    expect(version.line()).toBe('20');
  });

  it('rejects malformed versions', () => {
    expect(() => NodeVersion.parse('20')).toThrow();
    expect(() => NodeVersion.parse('20.11')).toThrow();
    expect(() => NodeVersion.parse('v20.11.0')).toThrow();
    expect(() => NodeVersion.parse('20.11.0.1')).toThrow();
    expect(() => NodeVersion.parse('abc')).toThrow();
  });
});
