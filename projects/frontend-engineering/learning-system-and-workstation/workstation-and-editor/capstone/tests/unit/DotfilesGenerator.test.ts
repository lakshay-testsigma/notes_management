import { describe, expect, it } from 'vitest';
import { DeveloperConfig } from '../../src/features/configurator/model';
import { DotfilesGenerator } from '../../src/features/configurator/DotfilesGenerator';

const generator = new DotfilesGenerator();
const config = DeveloperConfig.create({
  shell: 'zsh',
  gitName: 'Ada Lovelace',
  gitEmail: 'ada@example.com',
  editor: 'vscode',
  nodeVersion: '20.11.0',
});

describe('DotfilesGenerator', () => {
  it('produces every file, an installer, and a checklist', () => {
    const bundle = generator.generate(config);
    const paths = bundle.files.map((file) => file.path);
    expect(paths).toContain('.zshrc');
    expect(paths).toContain('.gitconfig');
    expect(paths).toContain('.nvmrc');
    expect(paths).toContain('.editorconfig');
    expect(paths).toContain('.dotfiles/README.md');
    expect(paths).toContain('.dotfiles/CHECKLIST.md');
    expect(bundle.checklist.length).toBeGreaterThanOrEqual(5);
    expect(bundle.installScript).toContain('#!/usr/bin/env bash');
  });

  it('writes each file atomically: temp file then a single rename', () => {
    const bundle = generator.generate(config);
    expect(bundle.installScript).toContain('mktemp');
    expect(bundle.installScript).toContain('mv "$tmp" "$path"');
  });

  it('is idempotent: appends the PATH line only when absent', () => {
    const bundle = generator.generate(config);
    expect(bundle.installScript).toContain('append_once');
    expect(bundle.installScript).toContain('grep -qF');
  });

  it('embeds the git identity and node version', () => {
    const bundle = generator.generate(config);
    expect(bundle.installScript).toContain('name = Ada Lovelace');
    expect(bundle.installScript).toContain('email = ada@example.com');
    expect(bundle.installScript).toContain('20.11.0');
  });

  it('writes fish configuration to the fish path', () => {
    const fish = DeveloperConfig.create({ ...config.toJSON(), shell: 'fish' });
    const bundle = generator.generate(fish);
    expect(bundle.files.some((file) => file.path === '.config/fish/config.fish')).toBe(true);
  });
});
