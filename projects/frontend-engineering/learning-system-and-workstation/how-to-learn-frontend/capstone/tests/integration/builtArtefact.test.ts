import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

/**
 * The artefact the developer opens is the built bundle, not the source.
 * This test builds the app the way the run recipe does and checks the files
 * that come out of it.
 */
describe('the built artefact', () => {
  it(
    'ships an index.html that loads a bundle with the app in it',
    async () => {
      const root = process.cwd();
      await build({ root, configFile: path.join(root, 'vite.config.ts'), logLevel: 'error' });

      const outDir = path.join(root, 'dist');
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');

      expect(html).toContain('<div id="root">');
      expect(html).toContain('Learning tracker');

      const script = /src="([^"]+\.js)"/.exec(html)?.[1] ?? '';
      expect(script).not.toBe('');

      const bundle = path.join(outDir, script.replace(/^\//, ''));
      expect(fs.existsSync(bundle)).toBe(true);
      expect(fs.readFileSync(bundle, 'utf8')).toContain('Learning tracker');
    },
    180000,
  );
});
