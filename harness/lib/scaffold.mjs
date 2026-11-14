// Creates the folders and note files of a topic. Never overwrites a file.

import path from 'node:path';
import { ensureDir, writeIfMissing } from './io.mjs';
import { renderTemplate, topicVars, TOPIC_TEMPLATES } from './templates.mjs';
import { topicPaths } from './topic-store.mjs';

/**
 * Scaffold all four roots of a topic (state, vault, lessons, projects).
 * Returns { created, existed }: lists of repository-relative file paths.
 */
export function scaffoldTopic(root, topic) {
  const paths = topicPaths(topic);
  const created = [];
  const existed = [];

  const folders = [
    paths.handoffs_dir,
    paths.vault_dir,
    paths.digests_dir,
    paths.repo_intel_dir,
    paths.lessons_dir,
    paths.projects_dir,
    paths.concepts_dir,
    paths.tech_dir,
  ];
  for (const folder of folders) ensureDir(path.join(root, folder));

  if (writeIfMissing(path.join(root, paths.sources_json), '[]\n')) created.push(paths.sources_json);
  else existed.push(paths.sources_json);

  const vars = topicVars(topic);
  for (const [key, template] of Object.entries(TOPIC_TEMPLATES)) {
    const relative = paths[key];
    const wasCreated = writeIfMissing(path.join(root, relative), renderTemplate(template, vars));
    (wasCreated ? created : existed).push(relative);
  }
  return { created, existed };
}
