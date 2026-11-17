// Shared lesson component names by kind. The site's manifest wins when present;
// otherwise the fixed names from ARCHITECTURE.md §12 are used.
// The manifest may also list the props each component accepts:
//   { "visual": [...], "activity": [...], "utility": [...],
//     "props": { "FlowAnimation": ["nodes", "steps", ...], ... } }
// Without `props`, the unknown-prop check of the lesson gate is switched off.

import path from 'node:path';
import { isFile, readJson } from './io.mjs';

export const FALLBACK_KINDS = {
  visual: [
    'FlowAnimation',
    'SystemDiagram',
    'SequenceDiagram',
    'StateMachine',
    'Graph3D',
    'VectorSpace3D',
    'Chart',
    'ParamPlayground',
    'CodeWalkthrough',
    'Timeline',
    'Mermaid',
    'Diagram',
    'Video',
    'Experience',
    'ClusterSim',
    'AlgorithmStepper',
    'CompareView',
    'CodePlayground',
  ],
  activity: ['Quiz', 'PredictReveal', 'OrderSteps', 'MatchPairs', 'SortBuckets'],
  utility: ['Resources', 'Figure', 'Depth'],
};

export function manifestPath(root) {
  return path.join(root, 'site', 'components.manifest.json');
}

/**
 * Returns { visual, activity, utility, props, source, problem }.
 * `props` is { ComponentName: [prop names] } or null when the manifest has none.
 * `source` is "manifest" or "fallback"; `problem` explains a broken manifest.
 */
export function loadComponentKinds(root) {
  const file = manifestPath(root);
  if (!isFile(file)) return { ...FALLBACK_KINDS, props: null, source: 'fallback', problem: null };

  try {
    const manifest = readJson(file);
    const kinds = {};
    for (const kind of ['visual', 'activity', 'utility']) {
      if (!Array.isArray(manifest[kind])) throw new Error(`"${kind}" must be an array`);
      kinds[kind] = manifest[kind]
        .map((item) => (typeof item === 'string' ? item : item?.name))
        .filter((name) => typeof name === 'string' && name.length > 0);
    }
    if (kinds.visual.length === 0 || kinds.activity.length === 0) {
      throw new Error('"visual" and "activity" must not be empty');
    }
    return { ...kinds, props: readProps(manifest.props), source: 'manifest', problem: null };
  } catch (error) {
    return { ...FALLBACK_KINDS, props: null, source: 'fallback', problem: error.message };
  }
}

/** The optional `props` object of the manifest: { Name: ["prop", ...] }. */
function readProps(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('"props" must be an object of component name -> list of prop names');
  const props = {};
  for (const [name, list] of Object.entries(value)) {
    if (!Array.isArray(list) || !list.every((item) => typeof item === 'string')) {
      throw new Error(`"props.${name}" must be a list of prop names`);
    }
    props[name] = list;
  }
  return props;
}

export function sharedComponentNames(kinds) {
  return new Set([...kinds.visual, ...kinds.activity, ...kinds.utility]);
}
