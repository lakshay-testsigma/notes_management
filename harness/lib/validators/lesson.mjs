// Gate: lesson. The page count fits the depth and every page passes §12.

import { listFiles, readText, walkFiles, relPath } from '../io.mjs';
import { analyzeLessonPage, countArrayItems, stringProp } from '../mdx.mjs';
import { sharedComponentNames } from '../components.mjs';
import { siteUrl } from '../topic-store.mjs';
import { failure, stageFailure, warning } from './context.mjs';
import { checkNote, wordRangeFailure } from './note.mjs';
import { adaptiveVisualProblems, visualFirstOutlineProblems } from '../visual-policy.mjs';
import { countWords } from '../markdown.mjs';
import { styleReport } from '../style.mjs';
import { visualRegistryFailures } from './visuals.mjs';
import { LESSON_VISUAL_MINIMUM } from '../visuals.mjs';
import { resolveExperience } from '../experience-mode.mjs';

export const LESSON_WORDS = [110, 260];
const PAGE_NAME = /^(\d{2})-[a-z0-9]+(-[a-z0-9]+)*\.mdx$/;
const FLOW_COMPONENT = 'FlowAnimation';
const BOX_COMPONENTS = new Set(['Card', 'Callout', 'Aside', 'Note', 'Tip', 'Warning', 'Alert', 'Admonition', 'Details', 'Blockquote', 'Box', 'Info']);

/** Diagrams whose nodes are counted: component -> the props that hold the nodes. */
const DIAGRAM_NODE_PROPS = {
  SystemDiagram: ['nodes'],
  FlowAnimation: ['nodes'],
  SequenceDiagram: ['actors', 'participants'],
};
export const DIAGRAM_MAX_NODES = 7;
/** Words a <Depth> block may hold, and how many blocks a page may have. */
export const DEPTH_WORDS = [20, 180];
export const DEPTH_BLOCKS = 2;
/** Components that show a registered visual by id. */
const REGISTRY_COMPONENTS = { Diagram: 'diagram', Video: 'video', Experience: 'experience' };

const is3D = (name) => /3D$/.test(name ?? '');
const pageNumber = (name) => {
  const match = /^(\d{2})-/.exec(name);
  return match ? Number(match[1]) : null;
};

/**
 * The file name of the final lesson page: the page with the highest `order`
 * in plan.lesson_outline. Null while that page is not written yet, so a
 * worker that writes pages 1–2 of 4 is never told that page 2 is the final
 * one. Only a topic without an outline falls back to the last file on disk.
 */
export function finalLessonPage(topic, pages) {
  const orders = (topic.plan?.lesson_outline ?? []).map((page) => page?.order).filter(Number.isInteger);
  if (orders.length === 0) return pages.at(-1) ?? null;
  const last = Math.max(...orders);
  return pages.find((name) => pageNumber(name) === last) ?? null;
}

export function lessonGate(ctx) {
  const { topic, paths, profile } = ctx;
  const failures = [];
  for (const file of walkFiles(ctx.abs(paths.curriculum_dir))) {
    if (file.endsWith('.md')) failures.push(...checkNote(ctx, relPath(ctx.root, file), { stage: 'concept' }).failures);
  }
  const pages = listFiles(ctx.abs(paths.lessons_dir)).filter((name) => name.endsWith('.mdx'));
  const outlined = topic.plan?.lesson_outline;
  if (Array.isArray(outlined) && outlined.length) {
    const planned = outlined.map(page => `${String(page.order).padStart(2, '0')}-${page.slug}.mdx`);
    for (const name of planned) if (!pages.includes(name)) {
      failures.push(stageFailure(paths.lessons_dir, `planned lesson page ${name} is missing`, 'write every planned page before closing the lesson stage'));
    }
    for (const name of pages) if (!planned.includes(name)) {
      failures.push(stageFailure(paths.lessons_dir, `lesson page ${name} is not in the outline`, 'reconcile filenames with the plan before closing the lesson stage'));
    }
  }

  const [min, max] = profile.lesson_pages;
  if (pages.length < min || pages.length > max) {
    const fix = pages.length < min
      ? 'write the missing pages from plan.lesson_outline, one file per page named `NN-<page>.mdx`'
      : 'merge or remove pages until the count fits';
    failures.push(stageFailure(paths.lessons_dir, `has ${pages.length} lesson pages, depth "${topic.depth}" needs ${min}–${max}`, fix));
  }

  const used = new Set();
  const orders = new Map();
  const finalPage = finalLessonPage(topic, pages);
  pages.forEach((name) => {
    const relative = `${paths.lessons_dir}/${name}`;
    const adaptive = topic.plan?.visual_policy === 'adaptive';
    const outline = (topic.plan?.lesson_outline ?? []).find(entry => entry?.order === pageNumber(name));
    const result = checkLessonPage(relative, readText(ctx.abs(relative)), ctx.kinds, {
      isLast: name === finalPage, finalPage, adaptive, outline,
      visuals: ctx.visuals.entries, visualFirst: ctx.visualFirst, experiences: topic.plan?.experience_policy === 'adaptive',
    });
    failures.push(...result.failures);
    result.components.forEach((component) => used.add(component));

    if (Number.isInteger(result.order)) {
      if (orders.has(result.order)) {
        failures.push(failure(relative, `has the same \`order\` (${result.order}) as ${orders.get(result.order)}`, 'give every page its own order: 1, 2, 3, …'));
      }
      orders.set(result.order, name);
    }
  });

  if (pages.length > 0 && topic.plan?.visual_policy !== 'adaptive') {
    if (!used.has(FLOW_COMPONENT)) {
      failures.push(stageFailure(paths.lessons_dir, 'no page has an animated flow', `add a \`<${FLOW_COMPONENT} />\` to the page that explains the main flow of the topic`));
    }
    const planned3D = (topic.plan?.lesson_outline ?? []).some((page) => is3D(page?.visual));
    if (planned3D && ![...used].some(is3D)) {
      failures.push(stageFailure(paths.lessons_dir, 'the plan asks for a 3D component but no page has one', 'add the 3D component named in plan.lesson_outline (for example `<Graph3D />`) to its page'));
    }
  }

  failures.push(...visualFirstLessonFailures(ctx, pages));

  const index = checkNote(ctx, paths.lesson, { stage: 'lesson' });
  failures.push(...index.failures);
  if (index.note && !index.note.body.includes(siteUrl(topic))) {
    failures.push(failure(paths.lesson, 'does not show the site path of the lesson', `mention \`${siteUrl(topic)}\` so the learner knows where to open it`));
  }
  return failures;
}

/**
 * Check one lesson page against §12.
 * options.isLast: true = this is the final page (must end with <Resources />),
 * false = it is not (must not use <Resources />), undefined = not checked.
 * Returns { failures, components: [names used], order }. `failures` also holds
 * the warnings of the page (entries with `level: 'warning'`).
 */
export function checkLessonPage(relative, text, kinds, { isLast, finalPage = null, adaptive = false, outline, visuals = null, visualFirst = false, experiences = false } = {}) {
  const failures = [];
  const fail = (problem, fix) => failures.push(failure(relative, problem, fix));
  const page = analyzeLessonPage(text);
  const shared = sharedComponentNames(kinds);
  const fileName = relative.split('/').pop();

  // file name and frontmatter
  const nameMatch = PAGE_NAME.exec(fileName);
  if (!nameMatch) fail('file name is not `NN-<page>.mdx`', 'rename it, for example `01-what-is-a-stream.mdx` (two digits, lowercase words, dashes)');

  const data = page.frontmatter.data;
  if (!page.frontmatter.has) {
    fail('has no frontmatter', 'start the file with a `---` block that has title, description, order, concepts');
  } else {
    if (typeof data.title !== 'string' || !data.title.trim()) fail('frontmatter has no `title`', 'add `title: <page title>`');
    if (typeof data.description !== 'string' || !data.description.trim()) fail('frontmatter has no `description`', 'add `description: <one line shown under the title>`');
    if (!Number.isInteger(data.order) || data.order < 1) {
      fail('frontmatter `order` is not a whole number', `add \`order: ${nameMatch ? Number(nameMatch[1]) : 1}\``);
    } else if (nameMatch && data.order !== Number(nameMatch[1])) {
      fail(`frontmatter \`order\` is ${data.order} but the file name starts with ${nameMatch[1]}`, `set \`order: ${Number(nameMatch[1])}\` or rename the file`);
    }
    if (!Array.isArray(data.concepts) || data.concepts.length === 0) fail('frontmatter `concepts` is not a list', 'add `concepts: [first concept, second concept]`');
  }

  // imports
  const imported = new Set();
  const topicComponents = new Set();
  for (const item of page.imports) {
    const isTopicImport = item.from.includes('components/topics/') || item.from.startsWith('@topics/');
    item.names.forEach((name) => imported.add(name));
    if (isTopicImport) item.names.forEach((name) => topicComponents.add(name));

    const sharedNames = item.names.filter((name) => shared.has(name));
    if (sharedNames.length > 0) {
      fail(`imports the shared component ${sharedNames.join(', ')}`, 'delete that import line; shared components are available on every lesson page without an import');
    } else if (!isTopicImport && /(^|\/)components\//.test(item.from)) {
      fail(`imports from "${item.from}"`, 'only topic-specific components under `site/src/components/topics/<slug>/` may be imported; delete the import');
    }
  }

  // components
  const names = page.elements.map((element) => element.name);
  const kindOf = (name) => {
    if (kinds.visual.includes(name) || topicComponents.has(name)) return 'visual';
    if (kinds.activity.includes(name)) return 'activity';
    if (kinds.utility.includes(name)) return 'utility';
    return null;
  };

  for (const name of new Set(names)) {
    if (BOX_COMPONENTS.has(name) && !shared.has(name) && !imported.has(name)) {
      fail(`uses <${name}>, which is card or callout markup`, 'write an important note as a plain paragraph that starts with `**Note.**`');
    } else if (!shared.has(name) && !imported.has(name)) {
      fail(`uses <${name}>, which is not a shared lesson component`, `use one of ${[...shared].join(', ')} — or import a topic-specific component from \`components/topics/<slug>/\``);
    }
  }
  for (const element of page.elements) {
    if (!shared.has(element.name)) continue;
    if (/\sclient:[a-z]+/.test(element.attrs)) {
      fail(`<${element.name}> has a \`client:\` directive`, 'remove it; shared components are used without `client:` directives');
    }

    // Unknown props: only when the manifest lists the props of this component.
    const allowed = kinds.props?.[element.name];
    if (Array.isArray(allowed)) {
      const unknown = [...new Set(element.props.map((prop) => prop.name).filter((name) => name && !name.startsWith('client:') && !allowed.includes(name)))];
      if (unknown.length > 0) {
        const list = unknown.map((name) => `\`${name}\``).join(', ');
        fail(
          `<${element.name}> has ${unknown.length === 1 ? 'an unknown prop' : 'unknown props'} ${list}`,
          `use only the props of ${element.name}: ${allowed.length ? allowed.join(', ') : '(it takes none)'} — see site/COMPONENTS.md`,
        );
      }
    }

    // Diagram size (a warning): a diagram with many nodes is hard to read on a short page.
    for (const propName of DIAGRAM_NODE_PROPS[element.name] ?? []) {
      const count = countArrayItems(element.props.find((prop) => prop.name === propName)?.value);
      if (count !== null && count > DIAGRAM_MAX_NODES) {
        failures.push(warning(
          relative,
          `<${element.name}> has ${count} ${propName}, more than ${DIAGRAM_MAX_NODES}`,
          `merge or drop ${propName} until at most ${DIAGRAM_MAX_NODES} remain, or split the diagram over two pages (harness/rubrics/lesson-page.md)`,
        ));
      }
    }
  }
  for (const name of page.unclosed) {
    fail(`<${name}> is opened but never closed`, `add \`</${name}>\` or write it as a self-closing tag \`<${name} ... />\``);
  }

  // Registered visuals: <Diagram id> and <Video id> must name an entry of visuals.json.
  for (const element of page.elements) {
    const expected = REGISTRY_COMPONENTS[element.name];
    if (!expected) continue;
    const id = stringProp(element, 'id');
    if (!id) {
      fail(`<${element.name}> has no plain \`id\``, `write \`<${element.name} id="<visual id>" />\` with the id from visuals.json`);
      continue;
    }
    if (!Array.isArray(visuals)) continue;
    const entry = visuals.find((e) => e?.id === id);
    if (!entry) fail(`<${element.name} id="${id}"> is not registered`, `register it with \`tutor visuals <topic> add --file <entry.json>\` (or \`tutor video <topic> build ${id}\` for a video)`);
    else if (expected === 'video' && entry.format !== 'hyperframes') fail(`<Video id="${id}"> names a ${entry.format} visual`, `use <Diagram id="${id}" /> or register a video`);
    else if (expected === 'experience' && entry.format !== 'experience') fail(`<Experience id="${id}"> names a ${entry.format} visual`, `build the experience with \`tutor experience <topic> build ${id}\``);
    else if (expected !== 'experience' && entry.format === 'experience') fail(`<${element.name} id="${id}"> names an experience`, `use <Experience id="${id}" />`);
    else if (expected === 'diagram' && !['mermaid', 'svg', 'image'].includes(entry.format)) fail(`<Diagram id="${id}"> names a ${entry.format} visual`, entry.format === 'hyperframes' ? `use <Video id="${id}" />` : `use the <${entry.component ?? 'component'}> itself`);
    else if (!(entry.used_in ?? []).includes(relative)) fail(`visual "${id}" does not list this page in \`used_in\``, `add "${relative}" to its used_in with \`tutor visuals <topic> update ${id}\``);
  }

  // Progressive disclosure: <Depth> blocks hold deeper prose, counted apart and capped.
  const depthBlocks = page.elements.filter((element) => element.name === 'Depth');
  if (depthBlocks.length > DEPTH_BLOCKS) fail(`has ${depthBlocks.length} <Depth> blocks`, `keep at most ${DEPTH_BLOCKS}; move the rest to a concept note`);
  for (const block of depthBlocks) {
    const level = stringProp(block, 'level');
    if (!['internals', 'production'].includes(level)) fail('<Depth> needs level="internals" or level="production"', 'set the level of the deeper explanation');
    const words = countWords(analyzeLessonPage(`---\n---\n${block.inner}`).prose);
    if (words < DEPTH_WORDS[0] || words > DEPTH_WORDS[1]) fail(`<Depth level="${level}"> has ${words} words`, `write ${DEPTH_WORDS[0]}–${DEPTH_WORDS[1]} words; longer internals belong in a concept note`);
  }

  if (visualFirst) {
    for (const problem of visualFirstOutlineProblems(outline, kinds)) fail(`visual-first plan ${problem}`, 'repair plan.lesson_outline with tutor plan --set');
    for (const name of outline?.extra_visuals ?? []) if (!names.includes(name)) fail(`does not use its planned extra visual <${name}>`, 'add it, or update the plan');
    if (outline?.video?.id) {
      // The video plays either alone or as the Watch part of an explainer experience.
      const used = page.elements.some((element) => (element.name === 'Video' && stringProp(element, 'id') === outline.video.id)
        || (element.name === 'Experience' && Array.isArray(visuals) && visuals.find((v) => v?.id === stringProp(element, 'id'))?.experience?.parts?.watch === outline.video.id));
      if (!used) fail(`does not embed its planned video <Video id="${outline.video.id}" />`, 'build it with `tutor video <topic> build <id>` and embed it after the paragraph it explains');
    }
    if (experiences && outline?.experience) {
      const resolved = resolveExperience(outline);
      const planned = outline.experience.id;
      if (['interactive', 'branching', 'hybrid'].includes(resolved.mode)) {
        const element = page.elements.find((e) => e.name === 'Experience' && stringProp(e, 'id') === planned);
        const entry = Array.isArray(visuals) ? visuals.find((e) => e?.id === planned) : null;
        if (!element) fail(`does not embed its planned ${resolved.mode} experience <Experience id="${planned}" />`, `write experience.json, run \`tutor experience <topic> build ${planned}\`, and embed it where the idea starts`);
        else if (entry?.experience && entry.experience.mode !== resolved.mode) fail(`experience "${planned}" is ${entry.experience.mode}, but the plan selected ${resolved.mode}`, 'set `mode` in experience.json to the planned mode, or change the plan with an override_reason');
      } else if (resolved.mode === 'static' && page.elements.some((e) => e.name === 'Experience' || e.name === 'Video')) {
        fail('embeds a video or experience although the selector chose a static explanation', 'remove it, or record an `experience.mode` override with a reason in the plan');
      }
    }
    for (const warn of styleReport(page.prose).warnings) failures.push(warning(relative, `writing standard: ${warn}`, 'shorten sentences and use active voice (harness/rubrics/writing-standard.md)'));
  }

  if (adaptive) {
    for (const problem of adaptiveVisualProblems(outline, kinds)) fail(`adaptive visual plan ${problem}`, 'repair plan.lesson_outline with tutor plan --set');
    if (outline) {
      const expected = `${String(outline.order).padStart(2, '0')}-${outline.slug}.mdx`;
      if (fileName !== expected) fail(`does not match its planned file ${expected}`, 'use the planned order and slug');
      if (outline.visual && !names.includes(outline.visual)) fail(`does not use its planned visual <${outline.visual}>`, 'add the planned component with the recorded interaction goal');
      if (outline.visual === null && names.some(name => kindOf(name) === 'visual')) fail('has a visual although the adaptive plan omits it', 'remove unnecessary visuals or update the plan with a reason');
      if (outline.complexity === 'advanced' && outline.visual === 'Graph3D') {
        const graphs = page.elements.filter(element => element.name === 'Graph3D');
        const editable = graphs.some(element => element.props.some(prop => prop.name === 'editable' && (prop.value === null || /^\{\s*true\s*\}$/.test(prop.value))));
        if (graphs.length && !editable) fail('advanced Graph3D has no editable interaction', 'use editable or editable={true} so the learner can change the graph');
      }
    }
  } else if (!names.some((name) => kindOf(name) === 'visual')) {
    fail('has no visual component', `add one of ${kinds.visual.join(', ')}`);
  }
  // A built experience with checkpoints is its own practice activity.
  const practiced = page.elements.some((e) => e.name === 'Experience' && Array.isArray(visuals) && (visuals.find((v) => v?.id === stringProp(e, 'id'))?.experience?.checkpoints ?? 0) > 0);
  if (!practiced && !names.some((name) => kindOf(name) === 'activity')) {
    fail('has no activity component', `add one of ${kinds.activity.join(', ')}`);
  }

  // prose
  const range = wordRangeFailure(relative, page.words, ...LESSON_WORDS);
  if (range) {
    range.problem = range.problem.replace('words', 'words of prose');
    failures.push(range);
  }
  failures.push(...forbiddenMarkup(relative, page.prose));

  if (isLast === true && page.endsWith !== 'Resources') {
    fail('is the final lesson page but does not end with `<Resources />`', 'put `<Resources />` as the last line of the page');
  }
  if (isLast === false && names.includes('Resources')) {
    const where = finalPage ? `the final page ${finalPage}` : 'the final page (the highest `order` in plan.lesson_outline)';
    fail('has `<Resources />` but is not the final lesson page', `remove it from this page; \`<Resources />\` belongs only at the end of ${where}`);
  }

  return { failures, components: names, order: data.order };
}

/** §12 "No boxes, no quotes", checked on the prose outside code and components. */
function forbiddenMarkup(relative, prose) {
  const failures = [];
  const note = 'write it as a plain paragraph; an important note starts with `**Note.**`';
  const lines = prose.split('\n');

  const quoteLine = lines.findIndex((line) => /^\s{0,3}>/.test(line));
  if (quoteLine !== -1) {
    failures.push(failure(relative, `has a blockquote ("${lines[quoteLine].trim().slice(0, 40)}")`, `remove the \`>\`; ${note}`));
  }
  if (lines.some((line) => /^\s*:::/.test(line))) {
    failures.push(failure(relative, 'has a `:::` aside', `remove the \`:::\` lines; ${note}`));
  }
  const tag = /<\s*(aside|blockquote|details|summary)\b/i.exec(prose);
  if (tag) {
    failures.push(failure(relative, `has a <${tag[1].toLowerCase()}> element`, `remove the element; ${note}`));
  }
  if (/class(Name)?\s*=\s*["'{][^"'}]*\b(card|callout|admonition|alert)\b/i.test(prose) || /\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/.test(prose)) {
    failures.push(failure(relative, 'has card or callout markup', `remove it; ${note}`));
  }
  return failures;
}

/**
 * Stage-wide checks of a visual-first plan: enough registered visuals for the
 * depth, an end-to-end workflow diagram when the topic has a multi-stage
 * process, every planned video, and every registry entry of the lesson valid.
 */
function visualFirstLessonFailures(ctx, pages) {
  const { topic, paths } = ctx;
  if (!ctx.visualFirst) return [];
  const failures = [];
  const { entries, error } = ctx.visuals;
  if (error) return [stageFailure(paths.visuals_json, error, 'repair the registry with tutor visuals')];
  const onPages = entries.filter((e) => (e.used_in ?? []).some((f) => f.startsWith(`${paths.lessons_dir}/`)));
  const minimum = LESSON_VISUAL_MINIMUM[topic.depth] ?? 3;
  if (pages.length && onPages.length < minimum) {
    failures.push(stageFailure(paths.visuals_json, `registers ${onPages.length} lesson visuals, depth "${topic.depth}" needs at least ${minimum}`, 'register each meaningful diagram, simulation and video of the pages (learn-visuals skill)'));
  }
  const outline = topic.plan?.lesson_outline ?? [];
  const sequences = topic.plan?.multi_stage === true || outline.some((page) => page?.video);
  if (pages.length && sequences && !onPages.some((e) => e.kind === 'workflow' && e.scope === 'end-to-end')) {
    failures.push(stageFailure(paths.visuals_json, 'has no end-to-end workflow diagram although the topic has a multi-stage process', 'register a `kind: "workflow"`, `scope: "end-to-end"` diagram of the whole process and show it on the page that introduces the process'));
  }
  for (const page of outline) {
    if (!page?.video?.id) continue;
    const entry = entries.find((e) => e.id === page.video.id);
    if (!entry) failures.push(stageFailure(paths.visuals_json, `planned video "${page.video.id}" is not built`, `write ${paths.videos_dir}/${page.video.id}/video.json and run \`tutor video ${topic.id} build ${page.video.id}\``));
    else if (entry.video?.status !== 'rendered') failures.push(warning(paths.visuals_json, `video "${page.video.id}" is not rendered: ${entry.video?.blocker ?? 'no reason recorded'}`, `run \`tutor video ${topic.id} render ${page.video.id}\` when FFmpeg or Docker is available`));
  }
  if (topic.plan?.experience_policy === 'adaptive') {
    for (const page of outline) {
      const id = page?.experience?.id;
      if (!id) continue;
      const mode = resolveExperience(page).mode;
      if (!['interactive', 'branching', 'hybrid'].includes(mode)) continue;
      const entry = entries.find((e) => e.id === id);
      if (!entry) failures.push(stageFailure(paths.visuals_json, `planned ${mode} experience "${id}" is not built`, `write ${paths.experiences_dir}/${id}/experience.json and run \`tutor experience ${topic.id} build ${id}\``));
    }
  }
  failures.push(...visualRegistryFailures(ctx, 'lesson'));
  return failures;
}
