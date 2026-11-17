// The adaptive experience-mode selector. For one lesson idea it decides which
// learning experience helps most: a static diagram, a short explainer video
// (Mode A), an interactive video lesson (Mode B), a branching presentation
// (Mode C) or a hybrid lab (Mode D). The decision depends on what helps the
// learner understand, not on what looks impressive, and it weighs the
// production cost. The policy is deterministic and explains itself, so the
// intake stage, the gates and the tests all agree. Contract:
// harness/rubrics/experiences.md.

export const EXPERIENCE_MODES = ['static', 'explainer', 'interactive', 'branching', 'hybrid'];
export const MODE_LABELS = {
  static: 'Static diagram and text',
  explainer: 'Explainer video (Mode A)',
  interactive: 'Interactive video lesson (Mode B)',
  branching: 'Branching presentation (Mode C)',
  hybrid: 'Hybrid learning lab (Mode D)',
};
/** Relative production and rendering cost of one experience. */
export const MODE_COST = { static: 0, explainer: 2, interactive: 3, branching: 3, hybrid: 6 };
/** Cost budget of one topic by depth; a plan over budget must downgrade or justify. */
export const EXPERIENCE_BUDGET = { quick: 4, standard: 10, deep: 18 };
const BENEFITS = ['low', 'medium', 'high'];
const ORDER = { static: 0, explainer: 1, interactive: 2, branching: 2, hybrid: 3 };

const int = (value) => Number.isInteger(value) && value >= 0;

/** Problems of an `experience.signals` object, as plain strings. */
export function signalProblems(signals) {
  if (!signals || typeof signals !== 'object' || Array.isArray(signals)) return ['`signals` must be an object'];
  const problems = [];
  if (!Number.isInteger(signals.complexity) || signals.complexity < 1 || signals.complexity > 5) problems.push('`signals.complexity` must be an integer from 1 (one simple idea) to 5 (many interacting mechanisms)');
  if (!int(signals.concepts) || signals.concepts < 1) problems.push('`signals.concepts` must count the concepts this idea combines (1 or more)');
  if (!int(signals.dependent_steps)) problems.push('`signals.dependent_steps` must count the steps that depend on the previous step (0 or more)');
  for (const key of ['changes_over_time', 'spatial']) if (typeof signals[key] !== 'boolean') problems.push(`\`signals.${key}\` must be true or false`);
  if (!int(signals.parameters)) problems.push('`signals.parameters` must count the inputs a learner can change to see different behavior (0 or more)');
  if (!int(signals.decision_paths)) problems.push('`signals.decision_paths` must count the valid alternative decisions or paths (0 or 1 when there is one path)');
  if (!BENEFITS.includes(signals.benefit)) problems.push('`signals.benefit` must be low, medium or high: the expected gain of active participation');
  if (signals.mastery !== undefined && signals.mastery !== null && !(typeof signals.mastery === 'number' && signals.mastery >= 0 && signals.mastery <= 1)) {
    problems.push('`signals.mastery` must be a number from 0 to 1, or left out to use the recorded mastery');
  }
  return problems;
}

/**
 * Choose the experience mode for one idea. `signals` follow signalProblems;
 * `mastery` (0–1 or null) is the learner's recorded mastery of the concepts
 * and wins over nothing; `signals.mastery` wins over the recorded value.
 * Returns { mode, base, needs, reasons, cost, mastery }.
 */
export function selectExperienceMode(signals, { mastery = null } = {}) {
  const reasons = [];
  const s = signals;
  const sequence = s.changes_over_time || s.dependent_steps >= 3;
  const manipulate = s.parameters >= 1 && (s.changes_over_time || s.complexity >= 3 || s.spatial);
  const decide = s.decision_paths >= 2;
  const interconnected = s.complexity >= 4 && s.concepts >= 4;
  const needs = { sequence, manipulate, decide, interconnected };
  const active = [sequence, manipulate, decide].filter(Boolean).length;

  let base;
  if (interconnected && active >= 2 && (manipulate || decide)) {
    base = 'hybrid';
    reasons.push(`complexity ${s.complexity} with ${s.concepts} interconnected concepts and ${active} learning needs (${needsText(needs)}) call for a combined lab`);
  } else if (manipulate) {
    base = 'interactive';
    reasons.push(`the learner can change ${s.parameters} parameter${s.parameters === 1 ? '' : 's'} and the behavior changes${s.changes_over_time ? ' over time' : ''}, so experimentation helps`);
  } else if (decide) {
    base = 'branching';
    reasons.push(`${s.decision_paths} valid paths or decisions exist, so the learner benefits from exploring them`);
  } else if (sequence) {
    base = 'explainer';
    reasons.push(s.changes_over_time ? 'the idea is a process that changes over time, so motion explains it' : `${s.dependent_steps} dependent steps form a chronological sequence`);
  } else {
    base = 'static';
    reasons.push('one idea with no process, parameters or decisions: a diagram and text are enough');
  }

  let mode = base;
  if (s.benefit === 'low' && ORDER[mode] > ORDER.explainer) {
    mode = sequence ? 'explainer' : 'static';
    reasons.push('expected benefit of participation is low, so a passive explanation is enough');
  }
  const known = typeof s.mastery === 'number' ? s.mastery : mastery;
  if (typeof known === 'number' && known >= 0.8 && mode !== 'static') {
    const lower = downgrade(mode, needs);
    reasons.push(`recorded mastery ${known.toFixed(2)} is high, so a lighter ${MODE_LABELS[lower].toLowerCase()} replaces ${MODE_LABELS[mode].toLowerCase()}`);
    mode = lower;
  } else if (typeof known === 'number' && known < 0.4 && mode === 'explainer' && s.parameters >= 1) {
    mode = 'interactive';
    reasons.push(`recorded mastery ${known.toFixed(2)} is low and the idea has parameters, so the learner practices with an interactive lesson`);
  }
  return { mode, base, needs, reasons, cost: MODE_COST[mode], mastery: typeof known === 'number' ? known : null };
}

function needsText(needs) {
  return [needs.sequence && 'a time sequence', needs.manipulate && 'parameter changes', needs.decide && 'alternative paths'].filter(Boolean).join(', ');
}

function downgrade(mode, needs) {
  if (mode === 'hybrid') return needs.manipulate ? 'interactive' : needs.decide ? 'branching' : 'explainer';
  if (mode === 'interactive' || mode === 'branching') return needs.sequence ? 'explainer' : 'static';
  return 'static';
}

/**
 * The resolved experience of one outline entry: the selected mode, the mode
 * the plan uses (an override needs `override_reason`), and problems. Only the
 * plan is read: recorded mastery enters through `signals.mastery`, which
 * `tutor experience <topic> plan` fills in, so the verdict never drifts.
 */
export function resolveExperience(page) {
  const exp = page?.experience;
  if (!exp || typeof exp !== 'object') return { problems: ['needs `experience` with `signals` (see harness/rubrics/experiences.md)'], selected: null, mode: null };
  const problems = signalProblems(exp.signals);
  if (problems.length) return { problems, selected: null, mode: null };
  const selected = selectExperienceMode(exp.signals);
  let mode = selected.mode;
  if (exp.mode !== undefined && exp.mode !== null) {
    if (!EXPERIENCE_MODES.includes(exp.mode)) problems.push(`\`experience.mode\` must be one of ${EXPERIENCE_MODES.join(', ')} (or left out for automatic selection)`);
    else {
      mode = exp.mode;
      if (exp.mode !== selected.mode && !(typeof exp.override_reason === 'string' && exp.override_reason.trim().split(/\s+/).length >= 6)) {
        problems.push(`the selector chose ${selected.mode} (${selected.reasons.join('; ')}); to use ${exp.mode}, add \`override_reason\` (6+ words) or remove \`mode\``);
      }
    }
  }
  if (['interactive', 'branching', 'hybrid'].includes(mode) && !(typeof exp.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(exp.id))) {
    problems.push(`a ${mode} experience needs \`experience.id\` (lowercase words joined by dashes): the folder of its experience.json`);
  }
  if (mode === 'explainer' && !(page.video && typeof page.video.id === 'string')) problems.push('an explainer needs the page\'s `video` ({ id, reason })');
  return { problems, selected, mode, cost: MODE_COST[mode] ?? 0 };
}

/** Total experience cost of a plan's outline and the budget of its depth. */
export function experienceBudget(outline, depth) {
  const pages = [];
  let total = 0;
  for (const page of Array.isArray(outline) ? outline : []) {
    if (!page?.experience) continue;
    const resolved = resolveExperience(page);
    if (!resolved.mode) continue;
    total += resolved.cost;
    pages.push({ page: page.page ?? page.name ?? page.order, mode: resolved.mode, selected: resolved.selected.mode, cost: resolved.cost, importance: page.importance ?? null });
  }
  const budget = EXPERIENCE_BUDGET[depth] ?? EXPERIENCE_BUDGET.standard;
  return { total, budget, over: total > budget, pages };
}
