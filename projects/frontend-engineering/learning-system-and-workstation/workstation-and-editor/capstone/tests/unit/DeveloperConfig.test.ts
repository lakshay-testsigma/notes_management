import { describe, expect, it } from 'vitest';
import { DeveloperConfig, NodeVersion } from '../../src/features/configurator/model';
import { ConfigError, InvalidConfigError } from '../../src/shared/lib/errors';

const valid = {
  shell: 'zsh',
  gitName: 'Ada Lovelace',
  gitEmail: 'ada@example.com',
  editor: 'vscode',
  nodeVersion: '20.11.0',
};

describe('DeveloperConfig.create', () => {
  it('accepts a valid configuration', () => {
    const config = DeveloperConfig.create(valid);
    expect(config.shell).toBe('zsh');
    expect(config.git.name).toBe('Ada Lovelace');
    expect(config.git.email).toBe('ada@example.com');
    expect(config.editor).toBe('vscode');
    expect(config.node.toString()).toBe('20.11.0');
  });

  it('rejects a shell outside the allow-list with its own code', () => {
    expect(() => DeveloperConfig.create({ ...valid, shell: 'tcsh' })).toThrow(InvalidConfigError);
    expect(codeOf({ ...valid, shell: 'tcsh' })).toBe('INVALID_SHELL');
  });

  it('rejects an editor outside the allow-list with its own code', () => {
    expect(codeOf({ ...valid, editor: 'emacs' })).toBe('INVALID_EDITOR');
  });

  it('splits a missing git name from an invalid one', () => {
    expect(codeOf({ ...valid, gitName: '' })).toBe('MISSING_GIT_NAME');
    expect(codeOf({ ...valid, gitName: 'bad\nname' })).toBe('INVALID_GIT_NAME');
  });

  it('splits a missing git email from an invalid one', () => {
    expect(codeOf({ ...valid, gitEmail: '' })).toBe('MISSING_GIT_EMAIL');
    expect(codeOf({ ...valid, gitEmail: 'not-an-email' })).toBe('INVALID_GIT_EMAIL');
  });

  it('splits a missing Node version from an invalid one', () => {
    expect(codeOf({ ...valid, nodeVersion: '' })).toBe('MISSING_NODE_VERSION');
    expect(codeOf({ ...valid, nodeVersion: '20.11' })).toBe('INVALID_NODE_VERSION');
  });

  it('rejects hostile input in the git fields', () => {
    expect(() => DeveloperConfig.create({ ...valid, gitName: 'x\nrm -rf /' })).toThrow(
      InvalidConfigError,
    );
    expect(() =>
      DeveloperConfig.create({ ...valid, gitEmail: 'a@b.c\n; touch /tmp/pwn' }),
    ).toThrow(InvalidConfigError);
    expect(() => DeveloperConfig.create({ ...valid, gitName: '$(echo hi)' })).toThrow(
      InvalidConfigError,
    );
  });

  it('treats non-object input as invalid', () => {
    expect(() => DeveloperConfig.create(null)).toThrow(InvalidConfigError);
    expect(() => DeveloperConfig.create('zsh')).toThrow(InvalidConfigError);
  });
});

function codeOf(raw: unknown): string {
  try {
    DeveloperConfig.create(raw);
  } catch (error) {
    return (error as ConfigError).code;
  }
  throw new Error('expected a ConfigError');
}
