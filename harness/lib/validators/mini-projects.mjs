// Gate: mini-projects. Each project has README.md, starter/, solution/, and the
// index note lists every project.

import { dirHasFiles, isFile, listDirs, readText } from '../io.mjs';
import { failure, stageFailure } from './context.mjs';
import { checkNote } from './note.mjs';

const MINI_FOLDER = /^mini-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$/;

export function miniProjectsGate(ctx) {
  const { topic, paths, profile } = ctx;
  const failures = [];
  const folders = listDirs(ctx.abs(paths.projects_dir)).filter((name) => name.startsWith('mini-'));

  if (folders.length < profile.mini_projects) {
    failures.push(stageFailure(paths.projects_dir, `has ${folders.length} mini projects, depth "${topic.depth}" needs ${profile.mini_projects}`, 'create the missing project folders, named `mini-NN-<name>/` (for example `mini-01-job-queue/`)'));
  }

  for (const name of folders) {
    const folder = `${paths.projects_dir}/${name}`;
    if (!MINI_FOLDER.test(name)) {
      failures.push(failure(folder, 'folder name is not `mini-NN-<name>`', 'rename it, for example `mini-01-job-queue` (two digits, lowercase words, dashes)'));
    }
    const readme = ctx.abs(`${folder}/README.md`);
    if (!isFile(readme) || readText(readme).trim() === '') {
      failures.push(failure(`${folder}/README.md`, 'file is missing or empty', 'write the README: the use case, what to build, how to run it, what it proves'));
    }
    for (const part of ['starter', 'solution']) {
      if (!dirHasFiles(ctx.abs(`${folder}/${part}`))) {
        failures.push(failure(`${folder}/${part}`, 'folder is missing or empty', part === 'starter' ? 'add the runnable starter code with TODO markers' : 'add the working solution'));
      }
    }
  }

  const index = checkNote(ctx, paths.mini_projects, { stage: 'mini-projects' });
  failures.push(...index.failures);
  if (index.note) {
    for (const name of folders) {
      if (!index.note.body.includes(name)) {
        failures.push(failure(paths.mini_projects, `does not list the project ${name}`, `add an entry with the path \`${paths.projects_dir}/${name}/\` and what the project proves`));
      }
    }
  }
  return failures;
}
