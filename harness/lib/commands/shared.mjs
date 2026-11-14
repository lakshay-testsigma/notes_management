// Helpers shared by the command handlers.

import fs from 'node:fs';
import path from 'node:path';
import { isFile, readText } from '../io.mjs';
import { table } from '../format.mjs';
import { UsageError } from '../errors.mjs';
import { CLI } from '../root.mjs';
import { saveTopic } from '../topic-store.mjs';
import { refreshMaps } from '../maps.mjs';
import { currentWave, progressOf, runnableStages, unitsSummary } from '../stages.mjs';

/** Read a file argument; "-" means standard input. Paths are relative to the working directory. */
export function readInputFile(file, flagName) {
  if (file === '-') return fs.readFileSync(0, 'utf8');
  const absolute = path.resolve(file);
  if (!isFile(absolute)) throw new UsageError(`File for ${flagName} not found: ${file}`);
  return readText(absolute);
}

export function readJsonInput(file, flagName) {
  const text = readInputFile(file, flagName);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new UsageError(`${file} is not valid JSON: ${error.message}`);
  }
}

/** Save the topic, then refresh the maps so 00-start-here shows the new status. */
export function saveAndRefresh(root, topic) {
  saveTopic(root, topic);
  refreshMaps(root, topic);
}

export function stageTable(topic) {
  const rows = topic.stages.map((stage) => [
    stage.wave,
    stage.id,
    stage.status,
    stage.skill,
    unitsSummary(stage),
    stage.note ?? '',
  ]);
  return table(['Wave', 'Stage', 'Status', 'Skill', 'Units', 'Note'], rows);
}

/** One line that tells the reader what to do next for this topic. */
export function nextActionLine(topic) {
  const runnable = runnableStages(topic);
  if (runnable.length === 0) {
    return `All stages are finished. Review cards with: ${CLI} recall due ${topic.id}`;
  }
  return `Next: ${CLI} next ${topic.id}   (wave ${currentWave(topic)}: ${runnable.map((s) => s.id).join(', ')})`;
}

/** Small summary used by `list`, `status`, and after state changes. */
export function topicSummary(topic) {
  const progress = progressOf(topic);
  const runnable = runnableStages(topic);
  return {
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    domain: topic.domain,
    subdomain: topic.subdomain,
    depth: topic.depth,
    progress,
    complete: runnable.length === 0,
    wave: currentWave(topic),
    runnable: runnable.map((s) => s.id),
    updated_at: topic.updated_at,
  };
}

export function requireArg(value, name, usage) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new UsageError(`Missing ${name}.`, `Usage: ${CLI} ${usage}`);
  }
  return value;
}
