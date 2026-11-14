// Index of every file in the vault, used to check that wikilinks resolve.
// Obsidian resolves `[[name]]` by file name, so the index is keyed by basename.

import path from 'node:path';
import { toPosix, walkFiles } from './io.mjs';

export function buildVaultIndex(root) {
  const vault = path.join(root, 'vault');
  const names = new Set();
  const lowerNames = new Map();
  const paths = new Set();

  for (const file of walkFiles(vault, { skipDirs: ['.obsidian', '.trash'] })) {
    const relative = toPosix(path.relative(vault, file));
    const base = path.basename(file);
    const isNote = base.toLowerCase().endsWith('.md');
    const name = isNote ? base.slice(0, -3) : base;

    names.add(name);
    lowerNames.set(name.toLowerCase(), name);
    paths.add(relative);
    if (isNote) paths.add(relative.slice(0, -3));
  }
  return { names, lowerNames, paths };
}

/**
 * Resolve one wikilink target (already stripped of `|alias` and `#heading`).
 * Returns { ok, suggestion }: `suggestion` is the exact name when only the
 * letter case differs.
 */
export function resolveWikilink(index, rawTarget) {
  let target = rawTarget.trim().replace(/^\/+/, '');
  if (target.toLowerCase().endsWith('.md')) target = target.slice(0, -3);

  if (target.includes('/')) {
    if (index.paths.has(target) || index.paths.has(target.replace(/^vault\//, ''))) {
      return { ok: true, suggestion: null };
    }
    const base = target.split('/').pop();
    return { ok: false, suggestion: index.names.has(base) ? base : null };
  }

  if (index.names.has(target)) return { ok: true, suggestion: null };
  return { ok: false, suggestion: index.lowerNames.get(target.toLowerCase()) ?? null };
}
