// Gate: lesson. The page count fits the depth and every page passes §12.

import { listFiles, readText } from '../io.mjs';
import { analyzeLessonPage, countArrayItems } from '../mdx.mjs';
import { sharedComponentNames } from '../components.mjs';
import { siteUrl } from '../topic-store.mjs';
import { failure, stageFailure, warning } from './context.mjs';
import { checkNote, wordRangeFailure } from './note.mjs';

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
  const pages = listFiles(ctx.abs(paths.lessons_dir)).filter((name) => name.endsWith('.mdx'));

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
    const result = checkLessonPage(relative, readText(ctx.abs(relative)), ctx.kinds, { isLast: name === finalPage, finalPage });
    failures.push(...result.failures);
    result.components.forEach((component) => used.add(component));

    if (Number.isInteger(result.order)) {
      if (orders.has(result.order)) {
        failures.push(failure(relative, `has the same \`order\` (${result.order}) as ${orders.get(result.order)}`, 'give every page its own order: 1, 2, 3, …'));
      }
      orders.set(result.order, name);
    }
  });

  if (pages.length > 0) {
    if (!used.has(FLOW_COMPONENT)) {
      failures.push(stageFailure(paths.lessons_dir, 'no page has an animated flow', `add a \`<${FLOW_COMPONENT} />\` to the page that explains the main flow of the topic`));
    }
    const planned3D = (topic.plan?.lesson_outline ?? []).some((page) => is3D(page?.visual));
    if (planned3D && ![...used].some(is3D)) {
      failures.push(stageFailure(paths.lessons_dir, 'the plan asks for a 3D component but no page has one', 'add the 3D component named in plan.lesson_outline (for example `<Graph3D />`) to its page'));
    }
  }

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
export function checkLessonPage(relative, text, kinds, { isLast, finalPage = null } = {}) {
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

  if (!names.some((name) => kindOf(name) === 'visual')) {
    fail('has no visual component', `add one of ${kinds.visual.join(', ')}`);
  }
  if (!names.some((name) => kindOf(name) === 'activity')) {
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
