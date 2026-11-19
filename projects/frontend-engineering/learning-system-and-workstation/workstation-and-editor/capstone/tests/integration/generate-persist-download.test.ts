import { describe, expect, it } from 'vitest';
import { DeveloperConfig } from '../../src/features/configurator/model';
import { DotfilesGenerator } from '../../src/features/configurator/DotfilesGenerator';
import { MemoryConfigStorage } from '../fakes/MemoryConfigStorage';
import { FakeBundleDownloader } from '../fakes/FakeBundleDownloader';
import { ConfigError } from '../../src/shared/lib/errors';

describe('generate → persist → download', () => {
  it('runs the whole flow through the real generator and the fakes', () => {
    const storage = new MemoryConfigStorage();
    const downloader = new FakeBundleDownloader();
    const generator = new DotfilesGenerator();

    const config = DeveloperConfig.create({
      shell: 'zsh',
      gitName: 'Katherine Johnson',
      gitEmail: 'katherine@example.com',
      editor: 'zed',
      nodeVersion: '18.19.0',
    });

    const bundle = generator.generate(config);
    storage.save(config);
    const loaded = storage.load();
    downloader.download(bundle, 'install.sh');

    expect(loaded?.shell).toBe('zsh');
    expect(loaded?.editor).toBe('zed');
    expect(downloader.downloaded?.filename).toBe('install.sh');
    expect(downloader.downloaded?.bundle.installScript).toContain('Katherine Johnson');
    expect(downloader.downloaded?.bundle.checklist.length).toBeGreaterThanOrEqual(5);
  });

  it('rejects hostile input before anything is persisted', () => {
    const storage = new MemoryConfigStorage();

    expect(() =>
      DeveloperConfig.create({
        shell: 'zsh',
        gitName: 'x; rm -rf ~',
        gitEmail: 'katherine@example.com',
        editor: 'zed',
        nodeVersion: '18.19.0',
      }),
    ).toThrow(ConfigError);

    expect(storage.load()).toBeNull();
  });
});
