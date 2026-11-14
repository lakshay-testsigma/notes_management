// A bounded, evidence-backed concept tree. This checks traceability, not the
// truth or teaching quality of prose; isolated reviewers still assess those.
import fs from 'node:fs';
import path from 'node:path';

export const COVERAGE_ASPECTS = ['explanation', 'mechanism', 'use-case', 'trade-offs', 'failure-modes', 'practice'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const within = (base, file) => file.startsWith(base + path.sep);
const COMPLEXITY_RANK = { basic: 0, intermediate: 1, advanced: 2 };

/**
 * Optional for legacy topics. Intake checks shape only; research checks sources
 * and the discovery ledger; finalize also checks generated content coverage.
 * Returns plain problems so callers can attach the appropriate CLI path/fix.
 */
export function curriculumProblems(ctx, stage) {
  const curriculum = ctx.topic.plan?.curriculum;
  if (curriculum === undefined) return [];
  const problems = [];
  const fail = problem => problems.push(`plan.curriculum: ${problem}`);
  if (!object(curriculum)) return ['plan.curriculum must be an object'];
  if (curriculum.schema !== 1) fail('schema must be 1');
  if (!text(curriculum.scope)) fail('scope must describe the bounded learning scope');
  if (!Number.isInteger(curriculum.max_depth) || curriculum.max_depth < 1 || curriculum.max_depth > 8) fail('max_depth must be an integer from 1 to 8 (root depth is 0)');
  if (!Number.isInteger(curriculum.max_concepts) || curriculum.max_concepts < 1 || curriculum.max_concepts > 200) fail('max_concepts must be an integer from 1 to 200');
  const maxRounds = curriculum.max_rounds ?? 6;
  if (!Number.isInteger(maxRounds) || maxRounds < 1 || maxRounds > 20) fail('max_rounds must be an integer from 1 to 20');
  if (!Array.isArray(curriculum.concepts) || curriculum.concepts.length === 0) {
    fail('concepts must be a non-empty list');
    return problems;
  }
  const concepts = curriculum.concepts;
  if (concepts.length > curriculum.max_concepts) fail(`has ${concepts.length} concepts, exceeding max_concepts ${curriculum.max_concepts}; defer scope to a separate topic`);
  const known = new Map();
  const valid = concepts.filter(object);
  for (const [index, concept] of concepts.entries()) {
    if (!object(concept)) { fail(`concepts[${index}] must be an object`); continue; }
    const label = `concept ${concept.id ?? index}`;
    if (!text(concept.id) || !ID.test(concept.id)) fail(`${label} needs a stable lowercase id`);
    else if (known.has(concept.id)) fail(`duplicate concept id ${concept.id}`);
    else known.set(concept.id, concept);
    if (!text(concept.title)) fail(`${label} needs a title`);
    if (concept.parent !== null && (!text(concept.parent) || !ID.test(concept.parent))) fail(`${label} parent must be null or a concept id`);
    if (!['basic', 'intermediate', 'advanced'].includes(concept.complexity)) fail(`${label} has invalid complexity`);
    if (!['supporting', 'core', 'critical'].includes(concept.importance)) fail(`${label} has invalid importance`);
    if (!['included', 'deferred', 'excluded'].includes(concept.disposition)) fail(`${label} has invalid disposition`);
    if (concept.disposition !== 'included' && !text(concept.reason)) fail(`${label} needs a reason for deferral or exclusion`);
    if (concept.source_ids !== undefined && (!Array.isArray(concept.source_ids) || !concept.source_ids.every(text))) fail(`${label} source_ids must be a list of source ids`);
    if (concept.coverage !== undefined && !Array.isArray(concept.coverage)) fail(`${label} coverage must be a list`);
  }
  if (!valid.some(c => c.parent === null)) fail('needs at least one root concept with parent null');
  if (!valid.some(c => c.disposition === 'included')) fail('needs at least one included concept');
  for (const concept of valid) {
    if (typeof concept.parent === 'string' && !known.has(concept.parent)) fail(`concept ${concept.id} has unknown parent ${concept.parent}`);
    if (concept.disposition === 'included' && known.has(concept.parent) && known.get(concept.parent).disposition !== 'included') fail(`included concept ${concept.id} has a deferred or excluded parent`);
    const seen = new Set();
    let current = concept, depth = 0;
    while (current && current.parent !== null) {
      if (seen.has(current.id)) { fail(`concept ${concept.id} has a cycle in its parent chain`); break; }
      seen.add(current.id);
      current = known.get(current.parent);
      if (current) depth++;
    }
    if (depth > curriculum.max_depth) fail(`concept ${concept.id} depth ${depth} exceeds max_depth ${curriculum.max_depth}`);
  }
  if (!['research', 'finalize'].includes(stage)) return problems;

  const sources = ctx.sourceIds;
  const checkSources = (values, label) => {
    if (!Array.isArray(values) || values.length === 0 || !values.every(text)) { fail(`${label} needs non-empty source_ids`); return; }
    for (const id of values) if (!sources.has(id)) fail(`${label} cites unknown source ${id}`);
  };
  for (const concept of valid) {
    if (concept.disposition === 'included') checkSources(concept.source_ids, `concept ${concept.id}`);
    else if (Array.isArray(concept.source_ids)) for (const id of concept.source_ids) if (!sources.has(id)) fail(`concept ${concept.id} cites unknown source ${id}`);
  }
  const rounds = curriculum.discovery;
  if (!Array.isArray(rounds) || rounds.length === 0) fail('discovery must record at least one live research round');
  else {
    if (rounds.length > maxRounds) fail(`discovery exceeds max_rounds ${maxRounds}`);
    const added = new Set(), expanded = new Set();
    for (const [index, round] of rounds.entries()) {
      const label = `discovery round ${index + 1}`;
      if (!object(round)) { fail(`${label} must be an object`); continue; }
      if (round.round !== index + 1) fail(`${label} needs consecutive round number ${index + 1}`);
      checkSources(round.source_ids, label);
      const previouslyAdded = new Set(added);
      for (const [key, accumulated] of [['frontier', expanded], ['added', added]]) {
        if (!Array.isArray(round[key]) || !round[key].every(text)) { fail(`${label} ${key} must be a list of concept ids`); continue; }
        if (new Set(round[key]).size !== round[key].length) fail(`${label} ${key} repeats a concept id`);
        for (const id of round[key]) {
          if (!known.has(id)) fail(`${label} ${key} names unknown concept ${id}`);
          if (key === 'added' && added.has(id)) fail(`${label} adds already discovered concept ${id}`);
          accumulated.add(id);
        }
      }
      // Roots can be seeded and investigated in the first round. Other
      // concepts must be discovered before a later round expands them.
      for (const id of Array.isArray(round.frontier) ? round.frontier : []) {
        const seededRoot = known.get(id)?.parent === null && Array.isArray(round.added) && round.added.includes(id);
        if (!previouslyAdded.has(id) && !seededRoot) fail(`${label} expands ${id} before it was discovered in an earlier round`);
      }
      for (const id of Array.isArray(round.added) ? round.added : []) {
        const parent = known.get(id)?.parent;
        if (typeof parent === 'string' && (!Array.isArray(round.frontier) || !round.frontier.includes(parent))) fail(`${label} adds ${id} without expanding parent ${parent} in its frontier`);
      }
      if (index !== rounds.length - 1 && round.stop_reason !== undefined) fail(`${label} has a stop_reason before the final round`);
    }
    for (const concept of valid) {
      if (!added.has(concept.id)) fail(`concept ${concept.id} was not recorded in discovery.added`);
      if (concept.disposition === 'included' && !expanded.has(concept.id)) fail(`included concept ${concept.id} was never expanded in a discovery frontier`);
    }
    const last = rounds.at(-1);
    if (!object(last) || !['saturation', 'scope-boundary', 'budget-limit'].includes(last.stop_reason) || !text(last.note)) fail('final discovery round needs stop_reason (saturation, scope-boundary or budget-limit) and an honest note about remaining scope');
  }
  if (stage !== 'finalize') return problems;

  for (const concept of valid.filter(c => c.disposition === 'included')) {
    const aspects = new Set();
    let hasVisualLesson = false;
    if (!Array.isArray(concept.coverage) || concept.coverage.length === 0) { fail(`included concept ${concept.id} has no generated coverage`); continue; }
    for (const entry of concept.coverage) {
      const label = `concept ${concept.id} coverage`;
      if (!object(entry) || !text(entry.path)) { fail(`${label} needs a path`); continue; }
      const file = coveragePath(ctx, entry.path);
      if (!file) { fail(`${label} path ${entry.path} must be a generated .md/.mdx file inside this topic's vault or lessons, excluding learner insights`); continue; }
      let body;
      try {
        if (!fs.statSync(file).isFile()) throw Error('not a file');
        body = fs.readFileSync(file, 'utf8').split(/^## My insights\s*$/m)[0];
      } catch { fail(`${label} file ${entry.path} does not exist or cannot be read`); continue; }
      const hasMarker = body.includes(`<!-- concept: ${concept.id} -->`);
      if (!hasMarker) fail(`${label} file ${entry.path} lacks <!-- concept: ${concept.id} --> in its generated region`);
      if (hasMarker && visualLessonCovers(ctx, concept, file)) hasVisualLesson = true;
      if (entry.anchor !== undefined && (!text(entry.anchor) || !body.includes(entry.anchor))) fail(`${label} anchor does not occur in the generated region of ${entry.path}`);
      if (!Array.isArray(entry.aspects) || entry.aspects.length === 0 || !entry.aspects.every(aspect => COVERAGE_ASPECTS.includes(aspect))) fail(`${label} aspects must name one or more of ${COVERAGE_ASPECTS.join(', ')}`);
      else entry.aspects.forEach(aspect => aspects.add(aspect));
    }
    const missing = COVERAGE_ASPECTS.filter(aspect => !aspects.has(aspect));
    if (missing.length) fail(`included concept ${concept.id} coverage omits ${missing.join(', ')}`);
    if (ctx.topic.plan.visual_policy === 'adaptive' && (COMPLEXITY_RANK[concept.complexity] > 0 || concept.importance === 'critical') && !hasVisualLesson) {
      fail(`included concept ${concept.id} needs coverage by a planned MDX lesson with complexity at least ${concept.complexity}, ${concept.importance === 'critical' ? 'critical importance, ' : ''}and a nonnull visual; add its concept marker and coverage path using the outline's exact NN-slug.mdx filename, or repair the outline classification`);
    }
  }
  return problems;
}

function visualLessonCovers(ctx, concept, file) {
  const outline = ctx.topic.plan?.lesson_outline;
  if (!Array.isArray(outline)) return false;
  const relative = path.relative(path.resolve(ctx.root, ctx.topic.paths.lessons), file);
  return outline.some(page => object(page) && Number.isInteger(page.order) && page.order > 0 && text(page.slug)
    && relative === `${String(page.order).padStart(2, '0')}-${page.slug}.mdx`
    && COMPLEXITY_RANK[page.complexity] >= COMPLEXITY_RANK[concept.complexity]
    && (concept.importance !== 'critical' || page.importance === 'critical')
    && text(page.visual));
}

function coveragePath(ctx, relative) {
  if (path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..')) return null;
  const target = path.resolve(ctx.root, relative);
  const vault = path.resolve(ctx.root, ctx.topic.paths.vault);
  const lessons = path.resolve(ctx.root, ctx.topic.paths.lessons);
  const allowed = within(vault, target) && target.endsWith('.md') && !path.basename(target).startsWith('my-insights-')
    || within(lessons, target) && target.endsWith('.mdx');
  if (!allowed) return null;
  // A symlink must not turn an apparently scoped file into unrelated content.
  try {
    const real = fs.realpathSync(target);
    const base = fs.realpathSync(within(vault, target) ? vault : lessons);
    if (!within(base, real)) return null;
  } catch { /* Missing paths are diagnosed by the caller. */ }
  return target;
}
