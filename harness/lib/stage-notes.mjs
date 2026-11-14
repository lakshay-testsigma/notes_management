// The notes of skipped stages stay honest. A stage that is `skipped` never
// gets its note written, so its scaffold must not say "Not written yet": it
// says that the step is not part of the topic and how to add it. When the
// stage becomes active again, the normal placeholder comes back. A note that
// holds real content is never changed.

import path from 'node:path';
import { isFile, readText, writeTextAtomic } from './io.mjs';
import { PLACEHOLDER, SKIPPED_MARK } from './markdown.mjs';
import { tryLoadPack } from './packs.mjs';
import { CLI } from './root.mjs';
import { DEPTHS, resolveProfile, skipReason } from './stages.mjs';
import { renderTemplate, topicVars, TOPIC_TEMPLATES } from './templates.mjs';
import { topicPaths } from './topic-store.mjs';

/** Stage id -> the scaffolded notes (topicPaths keys) that the stage fills. */
export const STAGE_NOTE_KEYS = {
  brief: ['brief'],
  lesson: ['lesson'],
  'mini-projects': ['mini_projects'],
  digest: ['digests_index'],
  'repo-intel': ['repo_intel_index'],
  capstone: ['capstone'],
  notes: ['final_notes', 'recall'],
};

/**
 * Why a skipped stage is not part of the topic, and how to add it.
 * Returns { kind: 'depth' | 'pack' | 'manual', add_depth, sentence, short }:
 * `sentence` is the body of the stage note, `short` the text for 00-start-here.
 */
export function skipInfo(root, topic, stage) {
  const pack = tryLoadPack(root, topic.domain);
  const reasonAt = (depth) => skipReason(stage.id, depth, pack, resolveProfile(depth, pack));
  const learn = (depth) => `\`/learn ${topic.slug}${depth ? ` --depth ${depth}` : ''}\``;

  if (reasonAt(topic.depth) === null) {
    const why = String(stage.note ?? '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
    const reset = `\`${CLI} reset ${topic.id} ${stage.id}\``;
    return {
      kind: 'manual',
      add_depth: null,
      sentence: `This required step remains undelivered: it was waived${why ? ` (${why})` : ''}. To add it, run ${reset} and then ask Claude: ${learn()}.`,
      short: `required work remains undelivered: it was waived${why ? ` (${why})` : ''}. To add it: ${reset}, then ${learn()}`,
    };
  }

  const addDepth = DEPTHS.find((depth) => reasonAt(depth) === null) ?? null;
  if (addDepth === null) {
    return {
      kind: 'pack',
      add_depth: null,
      sentence: `This step is not part of this topic: the ${pack?.title ?? topic.domain} domain does not have it.`,
      short: `not part of this topic (the ${pack?.title ?? topic.domain} domain does not have it)`,
    };
  }
  return {
    kind: 'depth',
    add_depth: addDepth,
    sentence: `This step is not part of this topic at its depth (${topic.depth}). To add it, ask Claude: ${learn(addDepth)}.`,
    short: `not part of this topic at its depth (${topic.depth}). To add it: ${learn(addDepth)}`,
  };
}

/** The two placeholder lines of a template: the marker and the "Not written yet" line. */
function templatePlaceholder(key, vars) {
  const lines = renderTemplate(TOPIC_TEMPLATES[key], vars).split('\n');
  const index = lines.findIndex((line) => line.trim() === PLACEHOLDER);
  if (index === -1) return [PLACEHOLDER, '_Not written yet._'];
  return [PLACEHOLDER, lines[index + 1] ?? '_Not written yet._'];
}

const isBodyLine = (line) => line !== undefined && line.trim() !== '' && !/^#{1,6}\s/.test(line) && !line.trim().startsWith('<!--');

/**
 * The lines of a skip text that was written by hand, before the CLI wrote it:
 * the whole body (between the title and `## My insights`) is one paragraph
 * that starts with "This step is not part of".
 * `strict` accepts only the two-sentence form with no other content, which is
 * safe to replace; without it, any such single paragraph counts (used when the
 * stage becomes active and the paragraph is no longer true).
 * Returns { start, end } line indexes (end exclusive) or null.
 */
function handWrittenSkipText(lines, { strict }) {
  let first = 0;
  if ((lines[0] ?? '').trim() === '---') {
    const close = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
    if (close !== -1) first = close + 1;
  }
  const insights = lines.findIndex((line, i) => i >= first && /^##\s+My insights\s*$/i.test(line));
  const end = insights === -1 ? lines.length : insights;

  const body = [];
  for (let i = first; i < end; i++) {
    if (lines[i].trim() === '' || /^#\s/.test(lines[i])) continue;
    body.push(i);
  }
  if (body.length === 0) return null;
  const contiguous = body.every((index, i) => i === 0 || index === body[i - 1] + 1);
  if (!contiguous || body.some((index) => !isBodyLine(lines[index]))) return null;

  const paragraph = body.map((index) => lines[index].trim()).join(' ');
  if (!/^This step is not part of\b/.test(paragraph)) return null;
  if (strict && !/^This step is not part of an? \w+ topic: [^.]+\. To add it, ask for the topic again at \w+ depth\.$/.test(paragraph)) return null;
  return { start: body[0], end: body.at(-1) + 1 };
}

/**
 * Bring the scaffolded notes in line with the stage statuses.
 * Returns the repository-relative paths that were rewritten.
 */
export function syncStageNotes(root, topic) {
  const paths = topicPaths(topic);
  const vars = topicVars(topic);
  const changed = [];

  for (const stage of topic.stages) {
    for (const key of STAGE_NOTE_KEYS[stage.id] ?? []) {
      const file = path.join(root, paths[key]);
      if (!isFile(file)) continue;
      const text = readText(file);
      const lines = text.split('\n');
      const placeholderAt = lines.findIndex((line) => line.trim() === PLACEHOLDER);
      const skippedAt = lines.findIndex((line) => line.trim() === SKIPPED_MARK);
      let next = null;

      if (stage.status === 'skipped') {
        const block = [SKIPPED_MARK, skipInfo(root, topic, stage).sentence];
        if (placeholderAt !== -1) {
          const span = isBodyLine(lines[placeholderAt + 1]) ? 2 : 1;
          next = [...lines.slice(0, placeholderAt), ...block, ...lines.slice(placeholderAt + span)];
        } else if (skippedAt !== -1) {
          const span = isBodyLine(lines[skippedAt + 1]) ? 2 : 1;
          next = [...lines.slice(0, skippedAt), ...block, ...lines.slice(skippedAt + span)];
        } else {
          const legacy = handWrittenSkipText(lines, { strict: true });
          if (legacy) next = [...lines.slice(0, legacy.start), ...block, ...lines.slice(legacy.end)];
        }
      } else if (skippedAt !== -1) {
        const span = isBodyLine(lines[skippedAt + 1]) ? 2 : 1;
        next = [...lines.slice(0, skippedAt), ...templatePlaceholder(key, vars), ...lines.slice(skippedAt + span)];
      } else if (placeholderAt === -1 && (stage.status === 'pending' || stage.status === 'in_progress')) {
        const legacy = handWrittenSkipText(lines, { strict: false });
        if (legacy) next = [...lines.slice(0, legacy.start), ...templatePlaceholder(key, vars), ...lines.slice(legacy.end)];
      }

      if (next && next.join('\n') !== text) {
        writeTextAtomic(file, next.join('\n'));
        changed.push(paths[key]);
      }
    }
  }
  return changed;
}
