// Gate: intake. The plan in topic.json is complete and fits the depth.

import { isFile } from '../io.mjs';
import { CLI } from '../root.mjs';
import { failure } from './context.mjs';
import { adaptiveVisualProblems, visualFirstOutlineProblems } from '../visual-policy.mjs';
import { experienceBudget, resolveExperience } from '../experience-mode.mjs';

const isText = (value) => typeof value === 'string' && value.trim().length > 0;

export function intakeGate(ctx) {
  const { topic, paths, profile } = ctx;
  const plan = topic.plan ?? {};
  const where = paths.topic_json;
  const setPlan = `fix it in a JSON file and run \`${CLI} plan ${topic.id} --set <file.json>\``;
  const failures = [];
  const fail = (problem, fix = setPlan) => failures.push(failure(where, problem, fix));

  if (plan.visual_policy !== undefined && !['adaptive', 'legacy'].includes(plan.visual_policy)) fail('plan.visual_policy must be adaptive or legacy');
  if (plan.visual_first !== undefined && typeof plan.visual_first !== 'boolean') fail('plan.visual_first must be true or false');
  if (plan.visual_first === true && plan.visual_policy !== 'adaptive') fail('plan.visual_first needs visual_policy "adaptive" (visuals are chosen per concept)');
  if (plan.experience_policy !== undefined && !['adaptive', 'none'].includes(plan.experience_policy)) fail('plan.experience_policy must be adaptive or none');
  if (plan.experience_policy === 'adaptive' && plan.visual_first !== true) fail('plan.experience_policy "adaptive" needs plan.visual_first true');
  if (plan.multi_stage !== undefined && typeof plan.multi_stage !== 'boolean') fail('plan.multi_stage must be true or false (true when the topic centers on a multi-stage process)');

  if(plan.requested_sources!==undefined && (!Array.isArray(plan.requested_sources)||plan.requested_sources.some(s=>!s||!isText(s.name)||!isText(s.url)||!Array.isArray(s.use_for)||!s.use_for.length)))fail('plan.requested_sources needs name, url and use_for for every explicit learner request');

  if (!isText(plan.summary)) fail('plan.summary is empty', `write one sentence that says what the topic is; ${setPlan}`);

  if (!Array.isArray(plan.prerequisites)) {
    fail('plan.prerequisites is not a list', `use [] when there are none, else items like { "concept": "...", "known": false, "bridge": "one line" }; ${setPlan}`);
  } else {
    plan.prerequisites.forEach((item, i) => {
      if (!item || !isText(item.concept) || typeof item.known !== 'boolean') {
        fail(`plan.prerequisites[${i}] needs "concept" (text) and "known" (true/false)`);
      } else if (!item.known && !isText(item.bridge)) {
        fail(`plan.prerequisites[${i}] ("${item.concept}") is unknown to the learner but has no "bridge"`, `add a one-line bridge that explains it; ${setPlan}`);
      }
    });
  }

  if (!Array.isArray(plan.outcomes) || plan.outcomes.length === 0 || !plan.outcomes.every(isText)) {
    fail('plan.outcomes must be a non-empty list of sentences', `list what the learner will be able to explain or build; ${setPlan}`);
  }

  const [minPages, maxPages] = profile.lesson_pages;
  const outline = plan.lesson_outline;
  if (!Array.isArray(outline) || outline.length === 0) {
    fail('plan.lesson_outline is empty', `add ${minPages}–${maxPages} pages, each with order, slug, title, visual, activity; ${setPlan}`);
  } else {
    if (outline.length < minPages || outline.length > maxPages) {
      fail(`plan.lesson_outline has ${outline.length} pages, depth "${topic.depth}" needs ${minPages}–${maxPages}`, `${outline.length < minPages ? 'add' : 'remove or merge'} pages; ${setPlan}`);
    }
    const orders = new Set();
    outline.forEach((page, i) => {
      const label = `plan.lesson_outline[${i}]`;
      if (!page || !Number.isInteger(page.order) || page.order < 1) {
        fail(`${label} needs a whole-number "order" starting at 1`);
        return;
      }
      if (orders.has(page.order)) fail(`${label} repeats order ${page.order}`, `give every page its own order; ${setPlan}`);
      orders.add(page.order);
      if (!isText(page.slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(page.slug)) fail(`${label} needs a lowercase "slug" such as "what-is-a-stream"`);
      if (!isText(page.title)) fail(`${label} needs a "title"`);
      if (plan.visual_first === true) {
        for (const problem of visualFirstOutlineProblems(page, ctx.kinds)) fail(`${label} ${problem}`);
      }
      if (plan.visual_policy === 'adaptive') {
        for (const problem of adaptiveVisualProblems(page, ctx.kinds)) fail(`${label} ${problem}`);
      } else if (!isText(page.visual)) fail(`${label} needs a "visual" component`, `pick one of ${ctx.kinds.visual.join(', ')}; ${setPlan}`);
      if (!ctx.kinds.activity.includes(page.activity)) fail(`${label} needs an "activity" component`, `pick one of ${ctx.kinds.activity.join(', ')}; ${setPlan}`);
    });
  }

  if (plan.visual_first === true && Array.isArray(outline)) {
    const ids = outline.map((page) => page?.video?.id).filter(Boolean);
    const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (twice.length) fail(`plan.lesson_outline plans video ${twice[0]} twice`, `give every planned video its own id; ${setPlan}`);
    if (ids.length > 3) fail(`plan.lesson_outline plans ${ids.length} videos`, `plan at most 3 videos per topic: one per chronological or causal sequence that a static diagram cannot show; ${setPlan}`);
  }

  if (plan.experience_policy === 'adaptive' && Array.isArray(outline)) failures.push(...experienceFailures(ctx, outline, fail, setPlan));

  failures.push(...targetFailure(ctx, 'digest_targets', profile.digests, 'digest', setPlan));
  failures.push(...targetFailure(ctx, 'repo_targets', profile.repos, 'repo-intel', setPlan));

  if (!isFile(ctx.abs(paths.start_here))) {
    failures.push(failure(paths.start_here, 'file is missing', `run \`${CLI} map ${topic.id}\``));
  }
  return failures;
}

/** digest_targets / repo_targets are optional, but when set they must fit the depth. */
function targetFailure(ctx, key, [min, max], stageId, setPlan) {
  const value = ctx.topic.plan?.[key];
  if (value == null || ctx.stageStatus(stageId) === 'skipped') return [];
  if (!Number.isInteger(value) || value < min || value > max) {
    const range = min === max ? `${min}` : `${min}–${max}`;
    return [failure(ctx.paths.topic_json, `plan.${key} is ${JSON.stringify(value)}, depth "${ctx.topic.depth}" allows ${range}`, `set it inside that range; ${setPlan}`)];
  }
  return [];
}

/**
 * Adaptive experiences: every page records the signals the mode selector
 * reads; the selector's choice (or a justified override) is the page's mode;
 * the plan fits the production budget of its depth.
 */
function experienceFailures(ctx, outline, fail, setPlan) {
  const { topic } = ctx;
  // Gates read only the plan: recorded mastery is frozen into
  // `signals.mastery` by \`tutor experience <topic> plan\`, so later learner
  // progress never changes a gate's verdict.
  const ids = new Set();
  outline.forEach((page, i) => {
    const label = `plan.lesson_outline[${i}]`;
    const resolved = resolveExperience(page);
    for (const problem of resolved.problems) fail(`${label} experience: ${problem}`, `see harness/rubrics/experiences.md and run \`tutor experience ${topic.id} plan\`; ${setPlan}`);
    const id = page?.experience?.id;
    if (id) {
      if (ids.has(id)) fail(`${label} experience id ${id} is planned twice`);
      ids.add(id);
    }
    if (['interactive', 'branching', 'hybrid'].includes(resolved.mode) && page.visual !== 'Experience') {
      fail(`${label} is a ${resolved.mode} experience, so its \`visual\` must be "Experience"`);
    }
  });
  const budget = experienceBudget(outline, topic.depth);
  if (budget.over) {
    const heavy = budget.pages.filter((p) => p.cost > 2).map((p) => `${p.page} (${p.mode}, cost ${p.cost})`).join(', ');
    fail(`planned experiences cost ${budget.total}, depth "${topic.depth}" allows ${budget.budget}`, `keep the richest mode for critical ideas and set a lighter \`experience.mode\` with \`override_reason\` on supporting pages (${heavy}); ${setPlan}`);
  }
  return [];
}
