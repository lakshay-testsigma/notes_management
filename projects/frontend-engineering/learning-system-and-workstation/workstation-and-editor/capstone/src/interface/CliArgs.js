import { parseArgs } from 'node:util';
import { UsageError } from '../domain/errors.js';

export const USAGE = `Usage:
  devkit doctor [--project DIR] [--strict]
  devkit lint (--edit FILE | --last | --from REF --to REF) [--strict]
  devkit notes --from REF --to REF [--version V] [--date YYYY-MM-DD]`;

const OPTIONS = {
  project: { type: 'string' },
  strict: { type: 'boolean' },
  edit: { type: 'string' },
  last: { type: 'boolean' },
  from: { type: 'string' },
  to: { type: 'string' },
  version: { type: 'string' },
  date: { type: 'string' },
};

/** Turns argv into { command, options }, or throws UsageError. */
export function parseCliArgs(argv) {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true });
  } catch (error) {
    throw new UsageError(error.message);
  }
  const [command, ...extra] = parsed.positionals;
  if (!['doctor', 'lint', 'notes'].includes(command)) throw new UsageError(`Unknown or missing command "${command ?? ''}"`);
  if (extra.length > 0) throw new UsageError(`Unexpected argument "${extra[0]}"`);
  return { command, options: parsed.values };
}
