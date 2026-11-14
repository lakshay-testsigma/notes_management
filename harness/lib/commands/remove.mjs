// Topic deletion is explicit; normal regeneration never removes learner data.
import fs from 'node:fs';
import path from 'node:path';
import { UsageError, ValidationError } from '../errors.mjs';
import { resolveTopic, resolveTopicId, topicPaths, loadAllTopics, rebuildRegistry } from '../topic-store.mjs';
import { refreshSharedMaps } from '../maps.mjs';

export function removeCommand({ root, args, flags }) {
  if (!args.length) throw new UsageError('Use remove <topic> [<topic>...] [--delete].');
  // Resolve every argument and validate every path before deleting anything.
  const ids = [...new Set(args.map(ref => resolveTopicId(root, ref)))];
  const topics = ids.map(id => {
    const topic = resolveTopic(root, id);
    if (topic.id !== id || [topic.domain, topic.subdomain, topic.slug].join('/') !== id ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new ValidationError('Topic identity does not match its canonical directory.');
    }
    return topic;
  });
  const remaining = loadAllTopics(root).filter(topic => !ids.includes(topic.id));
  const directories = topics.flatMap(topic => {
    const p = topicPaths(topic);
    const files = [p.state_dir, p.vault_dir, p.lessons_dir, p.projects_dir];
    if (!remaining.some(other => other.slug === topic.slug)) files.push(p.topic_components_dir);
    return files;
  });
  const targets = [...new Set(directories)];
  for (const relative of targets) {
    const parts = relative.split('/');
    if (path.isAbsolute(relative) || parts.includes('..') || parts.includes('')) throw new ValidationError(`Unsafe removal path: ${relative}`);
    // Refuse symlinks at every level, including a missing target's ancestors.
    let cursor = root;
    for (const part of parts) {
      cursor = path.join(cursor, part);
      try {
        if (fs.lstatSync(cursor).isSymbolicLink()) throw new ValidationError(`Removal path contains a symlink: ${relative}`);
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  const data = { topics: ids, directories: targets, deleted: Boolean(flags.delete) };
  if (!flags.delete) return {
    data,
    text: `Would remove ${ids.join(', ')} including notes, insights, recall history, lessons and projects.\n${targets.map(p => `  ${p}`).join('\n')}\nRun again with --delete to apply. Shared notes, cached research and external review files are retained.`,
  };
  for (const relative of targets) fs.rmSync(path.join(root, relative), { recursive: true, force: true });
  rebuildRegistry(root);
  refreshSharedMaps(root, [...new Set([...topics, ...remaining].map(topic => topic.domain))]);
  return { data, text: `Removed ${ids.join(', ')}. Registry and generated maps refreshed. Shared notes, cached research and external review files were retained.` };
}
