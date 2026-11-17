// Shared context for the gates: the topic, its paths, its depth profile, and
// lazily built lookups (vault index, component kinds, source ids).

import path from 'node:path';
import { topicPaths } from '../topic-store.mjs';
import { tryLoadPack } from '../packs.mjs';
import { resolveProfile } from '../stages.mjs';
import { buildVaultIndex } from '../vault-index.mjs';
import { loadComponentKinds } from '../components.mjs';
import { sourceIds } from '../sources.mjs';
import { readVisuals } from '../visuals.mjs';

export function createContext(root, topic) {
  const pack = tryLoadPack(root, topic.domain);
  const cache = {};

  return {
    root,
    topic,
    pack,
    paths: topicPaths(topic),
    profile: topic.profile ?? resolveProfile(topic.depth, pack),
    abs: (relative) => path.join(root, relative),
    stageStatus: (stageId) => topic.stages.find((s) => s.id === stageId)?.status ?? 'pending',
    get vaultIndex() {
      return (cache.vaultIndex ??= buildVaultIndex(root));
    },
    get kinds() {
      return (cache.kinds ??= loadComponentKinds(root));
    },
    get sourceIds() {
      return (cache.sourceIds ??= sourceIds(root, topic));
    },
    /** { entries, error } of the topic's visual registry (visuals.json). */
    get visuals() {
      return (cache.visuals ??= readVisuals(root, topic));
    },
    /** True for plans that follow the visual-first standard (harness/rubrics/visuals.md). */
    get visualFirst() {
      return topic.plan?.visual_first === true;
    },
  };
}

/** One gate failure. Printed as `path: problem. fix.` */
export function failure(filePath, problem, fix) {
  return { path: filePath, problem, fix };
}

/**
 * A failure of the stage as a whole (a count, a rule across all pages). One
 * unit worker cannot fix it, so `validate --files` never reports it.
 */
export function stageFailure(filePath, problem, fix) {
  return { path: filePath, problem, fix, scope: 'stage' };
}

/** A warning: printed under "Warnings", never fails the gate. */
export function warning(filePath, problem, fix) {
  return { path: filePath, problem, fix, level: 'warning' };
}
