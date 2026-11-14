// Stage list (§4.1), depth profiles (§4.2), and wave logic.

export const STATUSES = ['pending', 'in_progress', 'done', 'skipped', 'failed'];
export const DEPENDENCIES = { brief: ['research'], finalize: ['notes'] };
export const DEPTHS = ['quick', 'standard', 'deep'];

/** Generation order. Stages in the same wave are independent. */
export const STAGES = [
  { id: 'intake', wave: 0, skill: 'learn-intake', produces: 'plan in topic.json, 00-start-here' },
  { id: 'research', wave: 1, skill: 'learn-research', produces: 'sources.json, 09-resources' },
  { id: 'brief', wave: 1, skill: 'learn-brief', produces: '01-brief' },
  { id: 'digest', wave: 2, skill: 'learn-digest', produces: '04-digests/*' },
  { id: 'repo-intel', wave: 2, skill: 'learn-repo-intel', produces: '05-repo-intel/*, _tech/*, _concepts/*' },
  { id: 'lesson', wave: 3, skill: 'learn-site', produces: 'lesson .mdx pages, 02-lesson' },
  { id: 'mini-projects', wave: 3, skill: 'learn-projects', produces: 'projects/.../mini-*, 03-mini-projects' },
  { id: 'capstone', wave: 4, skill: 'learn-capstone', produces: 'projects/.../capstone, 06-capstone' },
  { id: 'notes', wave: 5, skill: 'learn-notes', produces: '07-final-notes, 08-recall' },
  { id: 'finalize', wave: 5, skill: 'learn', produces: 'maps regenerated, all validators + site build green' },
];

export const STAGE_IDS = STAGES.map((s) => s.id);

/** Stages a domain pack is never allowed to switch off. */
const ALWAYS_ON = new Set(['intake', 'finalize']);

/**
 * What each depth asks for. Ranges are [min, max].
 * `sources` and `recall_cards` come from the gates in §13.
 */
export const DEPTH_PROFILES = {
  quick: {
    lesson_pages: [3, 4],
    mini_projects: 1,
    digests: [1, 2],
    repos: [0, 0],
    capstone: false,
    sources: [3, 8],
    recall_cards: 5,
  },
  standard: {
    lesson_pages: [5, 7],
    mini_projects: 2,
    digests: [2, 3],
    repos: [1, 1],
    capstone: true,
    sources: [5, 12],
    recall_cards: 8,
  },
  deep: {
    lesson_pages: [8, 12],
    mini_projects: 3,
    digests: [4, 6],
    repos: [2, 3],
    capstone: true,
    sources: [5, 12],
    recall_cards: 8,
  },
};

const RANGE_KEYS = ['lesson_pages', 'digests', 'repos', 'sources'];
const NUMBER_KEYS = ['mini_projects', 'recall_cards'];

/**
 * The depth profile for one topic: the §4.2 defaults, then the pack's
 * `depth_overrides[depth]`, then the pack's switched-off stages.
 */
export function resolveProfile(depth, pack) {
  const profile = structuredClone(DEPTH_PROFILES[depth]);
  const overrides = pack?.depth_overrides?.[depth];

  if (overrides && typeof overrides === 'object') {
    for (const key of RANGE_KEYS) {
      const range = toRange(overrides[key]);
      if (range) profile[key] = range;
    }
    for (const key of NUMBER_KEYS) {
      const value = toCount(overrides[key]);
      if (value !== null) profile[key] = value;
    }
    if (typeof overrides.capstone === 'boolean') profile.capstone = overrides.capstone;
  }

  if (pack?.stages?.['repo-intel']?.enabled === false) profile.repos = [0, 0];
  if (pack?.stages?.capstone?.enabled === false) profile.capstone = false;
  return profile;
}

/** Accept 3, [2, 4], or { min: 2, max: 4 }. */
function toRange(value) {
  if (Number.isInteger(value) && value >= 0) return [value, value];
  if (Array.isArray(value) && value.length === 2 && value.every(Number.isInteger)) {
    return [Math.min(...value), Math.max(...value)];
  }
  if (value && Number.isInteger(value.min) && Number.isInteger(value.max)) {
    return [Math.min(value.min, value.max), Math.max(value.min, value.max)];
  }
  return null;
}

/** Accept 2, or a range (its minimum is used). */
function toCount(value) {
  if (Number.isInteger(value) && value >= 0) return value;
  const range = toRange(value);
  return range ? range[0] : null;
}

/** Build the stage list for a new topic. Switched-off stages start as `skipped`. */
export function buildStages(depth, pack, profile) {
  return STAGES.map((definition) => {
    const reason = skipReason(definition.id, depth, pack, profile);
    return {
      id: definition.id,
      wave: definition.wave,
      skill: definition.skill,
      status: reason ? 'skipped' : 'pending',
      scope: reason ? (pack?.stages?.[definition.id]?.enabled === false ? 'domain' : 'depth') : 'required',
      started_at: null,
      finished_at: null,
      attempts: 0,
      units: [],
      note: reason ?? '',
    };
  });
}

/** Why this depth or domain pack leaves a stage out, or null when the stage runs. */
export function skipReason(stageId, depth, pack, profile) {
  if (!ALWAYS_ON.has(stageId) && pack?.stages?.[stageId]?.enabled === false) {
    return `switched off by the ${pack.id} domain pack`;
  }
  if (stageId === 'repo-intel' && profile.repos[1] === 0) {
    return `depth "${depth}" has no repository deep dive`;
  }
  if (stageId === 'capstone' && !profile.capstone) {
    return `depth "${depth}" has no capstone`;
  }
  return null;
}

export function stageDefinition(stageId) {
  return STAGES.find((s) => s.id === stageId) ?? null;
}

export function isOmitted(stage) {
  return stage.status === 'skipped' && ['depth','domain'].includes(stage.scope);
}
export function isFinished(stage) {
  return (stage.status === 'done' && stage.fresh !== false) || isOmitted(stage);
}
export function isSettled(stage) {
  return isFinished(stage) || stage.status==='skipped' || (stage.status === 'failed' && stage.continue_after_failure === true);
}
export function completionOf(topic) {
  const failed_required = topic.stages.filter(s=>!isOmitted(s) && (s.status==='failed'||s.status==='skipped'||s.validation?.forced)).map(s=>s.id);
  const stale_stages = topic.stages.filter(s=>s.status==='done'&&s.fresh===false).map(s=>s.id);
  const generation_finished = topic.stages.every(isSettled);
  const complete = generation_finished && !failed_required.length && !stale_stages.length;
  return {complete,generation_finished,completion:complete?'complete':failed_required.length?'degraded':'in_progress',failed_required,stale_stages};
}
export function currentWave(topic) {
  const open=topic.stages.filter(s=>!isSettled(s));
  return open.length ? Math.min(...open.map(s=>s.wave)) : null;
}
export function blockersOf(topic,stage) {
  return topic.stages.filter(other =>
    (other.wave < stage.wave && !isSettled(other)) ||
    ((DEPENDENCIES[stage.id]??[]).includes(other.id) && !isFinished(other)));
}
export function runnableStages(topic) {
  const wave=currentWave(topic);
  return wave===null?[]:topic.stages.filter(s=>s.wave===wave&&!isSettled(s)&&!blockersOf(topic,s).length);
}
export function progressOf(topic) {
  const active=topic.stages.filter(s=>!isOmitted(s));
  return { finished:active.filter(s=>s.status==='done'&&s.fresh!==false&&!s.validation?.forced).length,total:active.length };
}
export function unitsSummary(stage) {
  if(!stage.units?.length)return '-';
  return `${stage.units.filter(u=>u.status==='done').length}/${stage.units.length}`;
}
