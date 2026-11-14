// Runs the §13 gates. One gate per stage; `finalize` is all of them plus a
// check of every note in the topic's vault folder.

import path from 'node:path';
import { exists, relPath, toPosix, walkFiles } from '../io.mjs';
import { createContext, failure } from './context.mjs';
import { checkNote } from './note.mjs';
import { intakeGate } from './intake.mjs';
import { researchGate } from './research.mjs';
import { briefGate } from './brief.mjs';
import { digestGate } from './digest.mjs';
import { repoIntelGate } from './repo-intel.mjs';
import { lessonGate } from './lesson.mjs';
import { miniProjectsGate } from './mini-projects.mjs';
import { capstoneGate } from './capstone.mjs';
import { notesGate } from './notes.mjs';

const GATES = {
  intake: intakeGate,
  research: researchGate,
  brief: briefGate,
  digest: digestGate,
  'repo-intel': repoIntelGate,
  lesson: lessonGate,
  'mini-projects': miniProjectsGate,
  capstone: capstoneGate,
  notes: notesGate,
};

/** Topic-wide checks of `finalize`: every note has frontmatter and resolving links. */
function topicWideChecks(ctx) {
  const failures = [];
  const folder = ctx.abs(ctx.paths.vault_dir);
  for (const file of walkFiles(folder)) {
    if (!file.endsWith('.md')) continue;
    const relative = relPath(ctx.root, file);
    const result = checkNote(ctx, relative, { requireInsights: false, allowPlaceholder: true });
    failures.push(...result.failures);
  }
  return failures;
}

function dedupe(failures) {
  const seen = new Set();
  return failures.filter((f) => {
    const key = `${f.path}\u0000${f.problem}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Stage ids whose gates apply to this topic (skipped stages are left out). */
function activeStageIds(topic) {
  return topic.stages.filter((s) => s.status !== 'skipped' && s.id !== 'finalize').map((s) => s.id);
}

/**
 * Turn the `--files` values into repository-relative paths with forward
 * slashes ("./a/b/" -> "a/b"; an absolute path inside the root -> relative).
 */
export function normalizeFileList(root, files) {
  return [...new Set(files.map((item) => {
    const absolute = path.resolve(root, item);
    const relative = absolute === root || absolute.startsWith(root + path.sep) ? relPath(root, absolute) : toPosix(item);
    return relative.replace(/^\.\//, '').replace(/\/+$/, '');
  }).filter(Boolean))];
}

/** True when `candidate` is one of the listed paths or lies under a listed directory. */
function isListed(files, candidate) {
  return files.some((item) => candidate === item || candidate.startsWith(`${item}/`));
}

/**
 * Validate one stage. Returns { stage, ok, skipped, failures, warnings }.
 * A skipped stage passes without being checked. Warnings never change `ok`.
 *
 * options.files (repository-relative paths) is the view of one unit worker:
 * only problems of those files (or of files under those directories) are
 * reported, and checks of the stage as a whole are left out.
 */
export function validateStage(root, topic, stageId, ctx = createContext(root, topic), options = {}) {
  const files = options.files?.length ? normalizeFileList(root, options.files) : null;
  const stage = topic.stages.find((s) => s.id === stageId);
  if (stage?.status === 'skipped') {
    return { stage: stageId, ok: true, skipped: true, failures: [], warnings: [], ...(files ? { files } : {}) };
  }

  let found;
  if (stageId === 'finalize') {
    found = [
      ...activeStageIds(topic).flatMap((id) => GATES[id](ctx)),
      ...topicWideChecks(ctx),
    ];
  } else {
    found = GATES[stageId](ctx);
  }

  if (files) {
    found = found.filter((f) => f.scope !== 'stage' && isListed(files, f.path));
    for (const item of files) {
      if (!exists(ctx.abs(item))) {
        found.push(failure(item, 'does not exist', 'write it, or correct the path given to --files (paths are relative to the repository root)'));
      }
    }
  }

  const clean = dedupe(found).map(({ scope, level, ...rest }) => ({ ...rest, level }));
  const failures = clean.filter((f) => f.level !== 'warning').map(({ level, ...rest }) => rest);
  const warnings = clean.filter((f) => f.level === 'warning').map(({ level, ...rest }) => rest);
  return { stage: stageId, ok: failures.length === 0, skipped: false, failures, warnings, ...(files ? { files } : {}) };
}

/**
 * Validate every stage of the topic, reported stage by stage. The `finalize`
 * entry holds only the topic-wide checks, so no failure is listed twice.
 */
export function validateAll(root, topic) {
  const ctx = createContext(root, topic);
  const results = topic.stages
    .filter((stage) => stage.id !== 'finalize')
    .map((stage) => validateStage(root, topic, stage.id, ctx));

  const reported = new Set(results.flatMap((r) => r.failures.map((f) => `${f.path}\u0000${f.problem}`)));
  const wide = dedupe(topicWideChecks(ctx)).filter((f) => !reported.has(`${f.path}\u0000${f.problem}`));
  results.push({ stage: 'finalize', ok: wide.length === 0, skipped: false, failures: wide, warnings: [] });
  return results;
}

export { createContext } from './context.mjs';
