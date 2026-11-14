// Gate: capstone. README.md, ARCHITECTURE.md, at least one ADR, src/, tests/,
// and the vault note.

import { dirHasFiles, isFile, listFiles, readText } from '../io.mjs';
import { failure } from './context.mjs';
import { checkNote } from './note.mjs';

export function capstoneGate(ctx) {
  const { paths } = ctx;
  const folder = paths.capstone_dir;
  const failures = [];

  const documents = {
    'README.md': 'write the README: the problem, how to run it, how to test it',
    'ARCHITECTURE.md': 'write the architecture: the classes or modules, their responsibilities, and the main flow',
  };
  for (const [name, fix] of Object.entries(documents)) {
    const file = ctx.abs(`${folder}/${name}`);
    if (!isFile(file) || readText(file).trim() === '') {
      failures.push(failure(`${folder}/${name}`, 'file is missing or empty', fix));
    }
  }

  const adrs = listFiles(ctx.abs(`${folder}/docs/adr`)).filter((name) => name.endsWith('.md'));
  if (adrs.length === 0) {
    failures.push(failure(`${folder}/docs/adr`, 'has no ADR', 'add at least one decision record, for example `docs/adr/0001-<decision>.md` (context, decision, consequences)'));
  }
  if (!dirHasFiles(ctx.abs(`${folder}/src`))) {
    failures.push(failure(`${folder}/src`, 'folder is missing or empty', 'add the project source code'));
  }
  if (!dirHasFiles(ctx.abs(`${folder}/tests`))) {
    failures.push(failure(`${folder}/tests`, 'folder is missing or empty', 'add the tests of the project'));
  }

  failures.push(...checkNote(ctx, paths.capstone, { stage: 'capstone' }).failures);
  return failures;
}
