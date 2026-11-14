import { UsageError } from './errors.mjs';

// Flags that never take a value. Every other `--flag` consumes the next argument.
const BOOLEAN_FLAGS = new Set(['json', 'all', 'force', 'tech', 'pack', 'fix', 'help', 'continue', 'structure-only', 'delete']);

/**
 * Parse argv into positionals and flags.
 * Supports `--flag value`, `--flag=value`, boolean flags, and `--` to stop parsing.
 * A flag given twice becomes an array.
 */
export function parseArgs(argv) {
  const positionals = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (arg === '-h') {
      flags.help = true;
      continue;
    }
    if (!arg.startsWith('--') || arg.length <= 2) {
      positionals.push(arg);
      continue;
    }

    const eq = arg.indexOf('=');
    const name = eq === -1 ? arg.slice(2) : arg.slice(2, eq);

    if (BOOLEAN_FLAGS.has(name)) {
      flags[name] = eq === -1 ? true : arg.slice(eq + 1) !== 'false';
      continue;
    }

    let value;
    if (eq !== -1) {
      value = arg.slice(eq + 1);
    } else {
      value = argv[i + 1];
      if (value === undefined) throw new UsageError(`Flag --${name} needs a value.`);
      i++;
    }
    flags[name] = name in flags ? [].concat(flags[name], value) : value;
  }

  return { positionals, flags };
}

/** Throw a usage error when a flag is not in the allowed list of a command. */
export function checkFlags(flags, allowed, commandName) {
  const known = new Set([...allowed, 'json', 'help', 'continue', 'structure-only']);
  for (const name of Object.keys(flags)) {
    if (!known.has(name)) {
      const list = allowed.length ? allowed.map((f) => `--${f}`).join(', ') : 'none';
      throw new UsageError(
        `Unknown flag --${name} for "${commandName}".`,
        `Flags for ${commandName}: ${list}, --json`,
      );
    }
  }
}

/** Read a flag that must be a single string. */
export function stringFlag(flags, name) {
  const value = flags[name];
  if (value === undefined) return undefined;
  if (Array.isArray(value)) throw new UsageError(`Flag --${name} was given more than once.`);
  return String(value);
}

/** Read a flag as a list (repeated flag and/or comma separated). */
export function listFlag(flags, name) {
  const value = flags[name];
  if (value === undefined) return [];
  return []
    .concat(value)
    .flatMap((v) => String(v).split(','))
    .map((v) => v.trim())
    .filter(Boolean);
}
