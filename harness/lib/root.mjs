import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDir } from './io.mjs';
import { UsageError } from './errors.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** The harness folder this CLI is installed in (holds lib/ and templates/). */
export const HARNESS_DIR = path.resolve(here, '..');

/** Templates always come from the CLI's own folder, even when TUTOR_ROOT is set. */
export const TEMPLATES_DIR = path.join(HARNESS_DIR, 'templates');

/** How the CLI is called in every hint it prints. */
export const CLI = 'node harness/bin/tutor.mjs';

/**
 * Repository root. `TUTOR_ROOT` overrides it (used by tests and dry runs);
 * otherwise it is the folder that contains harness/.
 */
export function repoRoot() {
  const override = process.env.TUTOR_ROOT;
  if (!override) return path.resolve(HARNESS_DIR, '..');
  const root = path.resolve(override);
  if (!isDir(root)) throw new UsageError(`TUTOR_ROOT is not a directory: ${root}`);
  return root;
}

export function lockDir(root) {
  return path.join(root, 'state', '.tutor.lock');
}
