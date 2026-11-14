// Gate: repo-intel. Per repository: overview, architecture, at least one module
// note, tech-and-services, findings, takeaways (§10), with evidence.

import { listDirs, listFiles } from '../io.mjs';
import { extractWikilinks } from '../markdown.mjs';
import { failure, stageFailure } from './context.mjs';
import { checkNote } from './note.mjs';

const COMMIT_SHA = /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/;
const EVIDENCE = /[\w./-]+:\d+(-\d+)?\s*@\s*[0-9a-f]{7,40}\b/;

/** How many repositories this topic needs: the plan's number, else the depth minimum. */
export function repoTarget(ctx) {
  const planned = ctx.topic.plan?.repo_targets;
  return Number.isInteger(planned) && planned > 0 ? planned : ctx.profile.repos[0];
}

/**
 * The `<repo>-overview.md` note of a `<org>-<repo>` folder. When several notes
 * end in -overview.md, the one whose prefix matches the folder name wins.
 */
function findOverview(folderName, notes) {
  const candidates = notes
    .filter((name) => name.endsWith('-overview.md'))
    .sort((a, b) => a.length - b.length);
  const matching = candidates.find((name) => {
    const prefix = name.slice(0, -'-overview.md'.length);
    return folderName === prefix || folderName.endsWith(`-${prefix}`);
  });
  return matching ?? candidates[0] ?? null;
}

export function repoIntelGate(ctx) {
  const { paths } = ctx;
  const failures = [];

  const index = checkNote(ctx, paths.repo_intel_index, { stage: 'repo-intel' });
  failures.push(...index.failures);
  const linked = new Set(index.note ? extractWikilinks(index.note.body) : []);

  const repos = listDirs(ctx.abs(paths.repo_intel_dir));
  const target = repoTarget(ctx);
  if (repos.length < target) {
    failures.push(stageFailure(paths.repo_intel_dir, `has ${repos.length} repository folders, the plan needs ${target}`, 'create one folder per analyzed repository, named `<org>-<repo>/`'));
  }

  for (const repo of repos) {
    const folder = `${paths.repo_intel_dir}/${repo}`;
    const notes = listFiles(ctx.abs(folder)).filter((name) => name.endsWith('.md'));
    const overview = findOverview(repo, notes);

    if (!overview) {
      failures.push(failure(folder, 'has no `<repo>-overview.md`', 'write the overview note: what the repository is, why it was chosen, the commit SHA analyzed, license, stack'));
      continue;
    }
    const prefix = overview.slice(0, -'-overview.md'.length);

    for (const part of ['architecture', 'tech-and-services', 'findings', 'takeaways']) {
      if (!notes.includes(`${prefix}-${part}.md`)) {
        failures.push(failure(folder, `has no \`${prefix}-${part}.md\``, `write the ${part} note (see ARCHITECTURE.md §10)`));
      }
    }
    if (!notes.some((name) => name.startsWith(`${prefix}-module-`))) {
      failures.push(failure(folder, `has no \`${prefix}-module-<name>.md\``, 'write one module note per analyzed slice'));
    }

    for (const name of notes) {
      const relative = `${folder}/${name}`;
      const result = checkNote(ctx, relative, { stage: 'repo-intel', requireInsights: false });
      failures.push(...result.failures);
      if (!name.startsWith(`${prefix}-`)) {
        failures.push(failure(relative, `file name does not start with "${prefix}-"`, `rename it to \`${prefix}-<part>.md\` so the note name is unique in the vault`));
      }
      if (!result.note) continue;

      if (name === overview && !COMMIT_SHA.test(result.note.body)) {
        failures.push(failure(relative, 'does not name the commit SHA that was analyzed', 'add the short SHA from `git rev-parse --short HEAD` in the cloned repository'));
      }
      if (name === `${prefix}-findings.md` && !EVIDENCE.test(result.note.body)) {
        failures.push(failure(relative, 'has no evidence citation', 'cite every finding as `path/to/file.ext:line @ <short-sha>`'));
      }
    }

    if (index.note && ![...linked].some(t=>t.replace(/\.md$/,'')===overview.slice(0,-3)||t.replace(/\.md$/,'').endsWith('/'+repo+'/'+overview.slice(0,-3)))) {
      failures.push(failure(paths.repo_intel_index, `does not link to ${overview}`, `add \`[[${overview.slice(0, -3)}|${repo}]]\` to the list of repositories`));
    }
  }
  return failures;
}
