// Commands that do not belong to one topic: slice, budget, words, doctor.

import path from 'node:path';
import { listFlag, stringFlag } from '../args.mjs';
import { UsageError } from '../errors.mjs';
import { formatNumber, table } from '../format.mjs';
import { isDir, isFile, readJson, readText, relPath } from '../io.mjs';
import { loadComponentKinds, manifestPath } from '../components.mjs';
import { aboveInsights, countWords, splitFrontmatter } from '../markdown.mjs';
import { analyzeLessonPage } from '../mdx.mjs';
import { EXPECTED_DOMAINS, domainsDir, listPackIds, packProblems, playbookProblems } from '../packs.mjs';
import { CLI, TEMPLATES_DIR } from '../root.mjs';
import { buildSlices, DEFAULT_BUDGET, estimateTokens, scanDirectory } from '../slicer.mjs';
import { STAGES, STAGE_IDS, STATUSES } from '../stages.mjs';
import { ALL_TEMPLATE_FILES } from '../templates.mjs';
import { loadAllTopics, readRegistry, rebuildRegistry, registryPath, scanTopicIds, topicJsonPath, topicPaths } from '../topic-store.mjs';
import { BRIEF_WORDS } from '../validators/brief.mjs';
import { LESSON_WORDS } from '../validators/lesson.mjs';
import { FINAL_NOTES_WORDS } from '../validators/notes.mjs';
import { requireArg } from './shared.mjs';
import { videoTools } from '../video.mjs';

function budgetFlag(flags) {
  const window=Number(stringFlag(flags,'window')??32768),reserve=Number(stringFlag(flags,'reserve')??3000);
  const cap=Math.floor(window*0.4)-reserve;
  const requested=Number(stringFlag(flags,'budget')??Math.min(60000,cap));
  if(!Number.isInteger(window)||!Number.isInteger(reserve)||reserve<0||!Number.isInteger(requested)||requested<1000||cap<1000)throw new UsageError('Budget/window must allow at least 1000 input tokens after overhead and reserve.');
  return Math.min(requested,cap);
}
export function readCommand({args,flags}) {
  const file=path.resolve(requireArg(args[0],'<file>','read <file> --start <char> --end <char>'));
  const text=readText(file),start=Number(stringFlag(flags,'start')),end=Number(stringFlag(flags,'end'));
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>text.length)throw new UsageError('Use valid zero-based [start,end) character offsets from a slice range.');
  const excerpt=text.slice(start,end),tokens=estimateTokens(excerpt),budget=budgetFlag(flags);
  if(tokens>budget)throw new UsageError('Excerpt exceeds the input allowance; request a smaller range.');
  return {data:{file,start_char:start,end_char:end,tokens,text:excerpt},text:excerpt};
}

// --- slice ------------------------------------------------------------------

export function sliceCommand({ args, flags }) {
  const usage = 'slice <dir> [--budget 60000] [--include "<glob>"] [--pack]';
  const dir = path.resolve(requireArg(args[0], '<dir>', usage));
  if (!isDir(dir)) throw new UsageError(`Not a directory: ${args[0]}`);

  const budget = budgetFlag(flags);
  const include = listFlag(flags, 'include');
  const { files, skipped } = scanDirectory(dir, { include });
  const slices = buildSlices(files, budget, { pack: Boolean(flags.pack) });

  const totalTokens = files.reduce((sum, file) => sum + file.tokens, 0);
  const skippedCount = Object.values(skipped).reduce((sum, n) => sum + n, 0);
  const oversized = slices.filter((s) => s.oversized).length;
  const totals = { files: files.length, tokens: totalTokens, slices: slices.length, skipped: skippedCount, oversized_slices: oversized };

  const rows = slices.map((s) => [s.id, formatNumber(s.tokens), s.files.length, s.covers.join(', ').slice(0, 70) + (s.oversized ? '  [over budget: read by section]' : '')]);
  const lines = [`Slices of ${dir} (budget ${formatNumber(budget)} tokens each)`, ''];
  lines.push(slices.length ? table(['Slice', 'Tokens', 'Files', 'Covers'], rows) : '  (no readable files found)');
  lines.push('', `Total: ${formatNumber(files.length)} files, ~${formatNumber(totalTokens)} tokens, ${slices.length} slices (budget ${formatNumber(budget)}).`);
  if (skippedCount > 0) {
    const reasons = Object.entries(skipped).map(([reason, count]) => `${count} ${reason}`).join(', ');
    lines.push(`Skipped: ${reasons}.`);
  }
  lines.push('Add --json for the file list of every slice.');

  return { data: { dir, budget, include, totals, skipped, slices }, text: lines.join('\n') };
}

// --- budget -----------------------------------------------------------------

export function budgetCommand({ args, flags }) {
  const usage = 'budget <file...> [--budget 60000]';
  requireArg(args[0], '<file...>', usage);
  const budget = budgetFlag(flags);
  const files = [];

  for (const arg of args) {
    const absolute = path.resolve(arg);
    if (isFile(absolute)) {
      files.push({ path: arg, tokens: estimateTokens(readText(absolute)) });
    } else if (isDir(absolute)) {
      const scanned = scanDirectory(absolute).files;
      files.push({ path: `${arg.replace(/\/+$/, '')}/`, tokens: scanned.reduce((sum, f) => sum + f.tokens, 0), files: scanned.length });
    } else {
      throw new UsageError(`File not found: ${arg}`);
    }
  }

  const total = files.reduce((sum, file) => sum + file.tokens, 0);
  const over = total > budget;
  const rows = files.map((f) => [formatNumber(f.tokens), f.path]);
  const lines = [
    table(['Tokens', 'File'], rows),
    '',
    `Total: ~${formatNumber(total)} tokens for ${files.length} ${files.length === 1 ? 'file' : 'files'} (budget ${formatNumber(budget)}).`,
    over
      ? `OVER BUDGET by ~${formatNumber(total - budget)} tokens. Split this reading into more units, or read long files by section.`
      : 'Within budget.',
  ];
  return { data: { budget, total, over_budget: over, files }, text: lines.join('\n') };
}

// --- words ------------------------------------------------------------------

/** Which stage file this is, when it is one whose words a gate counts: { topic, stage, range }. */
function knownStageFile(root, relative) {
  let safeTopics = [];
  try {
    safeTopics = loadAllTopics(root);
  } catch {
    // A broken topic.json must not stop a word count.
  }
  for (const topic of safeTopics) {
    const paths = topicPaths(topic);
    if (relative === paths.brief) return { topic: topic.id, stage: 'brief', range: BRIEF_WORDS };
    if (relative === paths.final_notes) return { topic: topic.id, stage: 'notes', range: FINAL_NOTES_WORDS };
    if (relative.startsWith(`${paths.lessons_dir}/`) && relative.endsWith('.mdx')) return { topic: topic.id, stage: 'lesson', range: LESSON_WORDS };
    if (relative.startsWith(`${paths.vault_dir}/`)) return { topic: topic.id, stage: null, range: null };
  }
  return { topic: null, stage: null, range: null };
}

/**
 * The word count of one file, counted exactly as the gates count it. `wc -w`
 * also counts frontmatter, code blocks, and component props, so it can be a
 * few hundred words higher than the number the gate uses.
 */
export function wordsCommand({ root, args }) {
  const usage = 'words <file>';
  const given = String(requireArg(args[0], '<file>', usage));
  const absolute = [path.resolve(root, given), path.resolve(given)].find((candidate) => isFile(candidate));
  if (!absolute) throw new UsageError(`File not found: ${given}`, 'Give the path relative to the repository root.');

  const inside = absolute.startsWith(root + path.sep);
  const file = inside ? relPath(root, absolute) : given;
  const text = readText(absolute);
  const isLessonPage = absolute.endsWith('.mdx');

  const words = isLessonPage
    ? analyzeLessonPage(text).words
    : countWords(aboveInsights(splitFrontmatter(text).body));
  const counted = isLessonPage
    ? 'prose only: frontmatter, imports, code blocks, and components are not counted (as the lesson gate counts)'
    : 'the note above "## My insights": frontmatter, code blocks, and comments are not counted (as the note gates count)';

  const { topic, stage, range } = knownStageFile(root, file);
  const [min, max] = range ?? [null, null];
  const within = range ? words >= min && words <= max : null;
  const verdict = !range
    ? null
    : words < min
      ? `Under the minimum by ${min - words}: add about ${min - words} words.`
      : words > max
        ? `Over the maximum by ${words - max}: cut about ${words - max} words.`
        : 'Inside the range.';

  const lines = [`${file}: ${words} words`, `  Counted: ${counted}.`];
  lines.push(range
    ? `  Allowed by the ${stage} gate: ${min}–${max} words. ${verdict}`
    : '  No word range applies to this file (only the brief, the final notes, and lesson pages have one).');

  return {
    data: { file, kind: isLessonPage ? 'lesson-page' : 'vault-note', words, counted, topic, stage, range, within, verdict },
    text: lines.join('\n'),
  };
}

// --- doctor -----------------------------------------------------------------

const STAGE_SKILLS = [...new Set([...STAGES.map((s) => s.skill), 'learn-insight', 'learn-recall', 'learn-visuals', 'learn-video'])];
const RUBRIC_FILES = ['source-quality.md', 'lesson-page.md', 'vault-notes.md', 'visuals.md', 'writing-standard.md', 'experiences.md'];
/** Official HyperFrames agent skills the video workflow reads (installed by `npx hyperframes skills update`). */
const HYPERFRAMES_SKILLS = ['hyperframes', 'hyperframes-cli', 'hyperframes-registry', 'media-use', 'slideshow'];

export function doctorCommand({ root, flags }) {
  const checks = [];
  const add = (check, status, detail, fix = null) => checks.push({ check, status, detail, ...(fix ? { fix } : {}) });

  // Node
  const [major,minor,patch]=process.versions.node.split('.').map(Number);
  const supported=major>22||(major===22&&(minor>23||(minor===23&&patch>=4)));
  add('node',supported?'ok':'fail',`Node ${process.versions.node}; complete workflow needs >=22.23.4`,supported?null:'install Node >=22.23.4 as required by site/package.json');

  // Domain packs and playbooks
  const packIds = listPackIds(root);
  if (packIds.length === 0) {
    add('domain packs', 'fail', 'no pack.json found under harness/domains/', 'create harness/domains/<domain>/pack.json and playbook.md (ARCHITECTURE.md §8)');
  }
  for (const id of packIds) {
    const folder = path.join(domainsDir(root), id);
    try {
      const problems = packProblems(readJson(path.join(folder, 'pack.json')), id);
      add(`pack ${id}`, problems.length ? 'fail' : 'ok', problems.length ? problems.join('; ') : 'pack.json has all required fields', problems.length ? `fix harness/domains/${id}/pack.json` : null);
    } catch (error) {
      add(`pack ${id}`, 'fail', `pack.json is not valid JSON: ${error.message}`, `fix harness/domains/${id}/pack.json`);
    }
    const playbook = path.join(folder, 'playbook.md');
    if (!isFile(playbook)) {
      add(`playbook ${id}`, 'fail', 'playbook.md is missing', `write harness/domains/${id}/playbook.md with the fixed headings of §8`);
    } else {
      const problems = playbookProblems(readText(playbook));
      add(`playbook ${id}`, problems.length ? 'fail' : 'ok', problems.length ? problems.join('; ') : 'all fixed headings present', problems.length ? `add the headings to harness/domains/${id}/playbook.md` : null);
    }
  }
  const missingDomains = EXPECTED_DOMAINS.filter((id) => !packIds.includes(id));
  if (packIds.length > 0) {
    add('domain list', missingDomains.length ? 'warn' : 'ok', missingDomains.length ? `no pack for: ${missingDomains.join(', ')}` : `all ${EXPECTED_DOMAINS.length} domains of §8 have a pack`);
  }

  // Templates and rubrics
  const missingTemplates = ALL_TEMPLATE_FILES.filter((name) => !isFile(path.join(TEMPLATES_DIR, name)));
  add('templates', missingTemplates.length ? 'fail' : 'ok', missingTemplates.length ? `missing: ${missingTemplates.join(', ')}` : `${ALL_TEMPLATE_FILES.length} templates present`, missingTemplates.length ? 'restore the files in harness/templates/' : null);

  const missingRubrics = RUBRIC_FILES.filter((name) => !isFile(path.join(root, 'harness', 'rubrics', name)));
  add('rubrics', missingRubrics.length ? 'warn' : 'ok', missingRubrics.length ? `missing in harness/rubrics/: ${missingRubrics.join(', ')}` : 'all rubrics present');

  // Site
  if (!isDir(path.join(root, 'site'))) {
    add('site', 'warn', 'site/ folder not found; lesson pages cannot be built yet');
  } else {
    add('site', isFile(path.join(root, 'site', 'package.json')) ? 'ok' : 'warn', isFile(path.join(root, 'site', 'package.json')) ? 'site/ present' : 'site/package.json not found');
    const kinds = loadComponentKinds(root);
    if (!isFile(manifestPath(root))) {
      add('components manifest', 'warn', 'site/components.manifest.json not found; using the fixed component names of §12');
    } else if (kinds.problem) {
      add('components manifest', 'fail', `site/components.manifest.json is unusable: ${kinds.problem}`, 'it must be { "visual": [...], "activity": [...], "utility": [...], "props": { "<Component>": ["<prop>", ...] } } ("props" is optional)');
    } else {
      const all = [...kinds.visual, ...kinds.activity, ...kinds.utility];
      const withoutProps = kinds.props ? all.filter((name) => !Array.isArray(kinds.props[name])) : [];
      const propsDetail = !kinds.props
        ? 'no "props" list, so unknown props are not checked'
        : withoutProps.length
          ? `props listed for ${all.length - withoutProps.length} of ${all.length} components (not for: ${withoutProps.join(', ')})`
          : `props listed for all ${all.length} components`;
      add('components manifest', 'ok', `${kinds.visual.length} visual, ${kinds.activity.length} activity, ${kinds.utility.length} utility components; ${propsDetail}`);
    }
    add('components reference', isFile(path.join(root, 'site', 'COMPONENTS.md')) ? 'ok' : 'warn', isFile(path.join(root, 'site', 'COMPONENTS.md')) ? 'site/COMPONENTS.md present' : 'site/COMPONENTS.md not found');
  }

  // Skills
  const missingSkills = STAGE_SKILLS.filter((skill) => !isFile(path.join(root, '.claude', 'skills', skill, 'SKILL.md')));
  add('skills', missingSkills.length ? 'warn' : 'ok', missingSkills.length ? `no SKILL.md for: ${missingSkills.join(', ')}` : `${STAGE_SKILLS.length} skills present`);

  // Video tooling (optional: without it videos stay honest storyboards)
  const tools = videoTools();
  add('video', tools.renderer ? 'ok' : 'warn',
    tools.renderer
      ? `HyperFrames ${tools.hyperframes} renders ${tools.renderer === 'docker' ? 'in Docker' : 'locally'}; narration: ${tools.kokoro ? 'Kokoro' : tools.say ? 'macOS say' : 'none (captions only)'}`
      : `videos stay storyboards: ${tools.blocker}`,
    tools.renderer ? null : 'install FFmpeg or start Docker, then `tutor video <topic> render <id>`');

  // Official HyperFrames skills, in the project or the user's skill folders.
  const home = process.env.HOME ?? '';
  const skillDirs = [path.join(root, '.claude', 'skills'), path.join(home, '.claude', 'skills'), path.join(home, '.agents', 'skills')];
  const missingHf = HYPERFRAMES_SKILLS.filter((skill) => !skillDirs.some((dir) => isFile(path.join(dir, skill, 'SKILL.md'))));
  add('hyperframes-skills', missingHf.length ? 'warn' : 'ok',
    missingHf.length ? `official HyperFrames skills missing: ${missingHf.join(', ')}` : `official skills present: ${HYPERFRAMES_SKILLS.join(', ')}`,
    missingHf.length ? 'run `npx hyperframes skills update` and `npx hyperframes skills update slideshow`, then start a new agent session' : null);
  const vendor = ['site/node_modules/@hyperframes/player/package.json', 'site/node_modules/gsap/package.json'].filter((f) => !isFile(path.join(root, f)));
  add('player', vendor.length ? 'warn' : 'ok', vendor.length ? `site dependencies missing: ${vendor.join(', ')}` : '@hyperframes/player and gsap installed for interactive experiences', vendor.length ? 'run `npm install` in site/' : null);

  // Vault
  add('vault', isFile(path.join(root, 'vault', 'Home.md')) ? 'ok' : 'warn', isFile(path.join(root, 'vault', 'Home.md')) ? 'vault/Home.md present' : 'vault/Home.md not found', isFile(path.join(root, 'vault', 'Home.md')) ? null : `run \`${CLI} map\``);

  // Registry against the topic.json files on disk
  let fixed = false;
  const onDisk = scanTopicIds(root);
  let registered = null;
  try {
    registered = isFile(registryPath(root)) ? readRegistry(root).topics.map((t) => t.id) : null;
  } catch (error) {
    add('registry', 'fail', `state/registry.json is not valid JSON: ${error.message}`, `run \`${CLI} doctor --fix\``);
  }
  if (registered === null && !checks.some((c) => c.check === 'registry')) {
    add('registry', 'fail', 'state/registry.json is missing', `run \`${CLI} doctor --fix\``);
  }
  if (registered !== null) {
    const notRegistered = onDisk.filter((id) => !registered.includes(id));
    const notOnDisk = registered.filter((id) => !onDisk.includes(id));
    if (notRegistered.length || notOnDisk.length) {
      const detail = [
        notRegistered.length ? `on disk but not in the registry: ${notRegistered.join(', ')}` : '',
        notOnDisk.length ? `in the registry but without topic.json: ${notOnDisk.join(', ')}` : '',
      ].filter(Boolean).join('; ');
      add('registry', 'fail', detail, `run \`${CLI} doctor --fix\``);
    } else {
      add('registry', 'ok', `${onDisk.length} ${onDisk.length === 1 ? 'topic' : 'topics'}, registry matches the disk`);
    }
  }
  if (flags.fix && checks.some((c) => c.check === 'registry' && c.status === 'fail')) {
    const count = rebuildRegistry(root);
    fixed = true;
    const entry = checks.find((c) => c.check === 'registry');
    entry.status = 'ok';
    entry.detail = `rebuilt from disk (${count} topics)`;
    delete entry.fix;
  }

  // Each topic.json is well formed
  for (const id of onDisk) {
    try {
      const topic = readJson(topicJsonPath(root, id));
      const problems = [];
      if (topic.id !== id) problems.push(`"id" is "${topic.id}" but the folder is ${id}`);
      if (!Array.isArray(topic.stages)) problems.push('"stages" is not a list');
      else {
        const unknown = topic.stages.filter((s) => !STAGE_IDS.includes(s.id) || !STATUSES.includes(s.status));
        if (unknown.length) problems.push(`stages with an unknown id or status: ${unknown.map((s) => s.id).join(', ')}`);
      }
      if (problems.length) add(`topic ${id}`, 'fail', problems.join('; '), `fix state/topics/${id}/topic.json`);
    } catch (error) {
      add(`topic ${id}`, 'fail', `topic.json is not valid JSON: ${error.message}`, `fix state/topics/${id}/topic.json`);
    }
  }

  const summary = { ok: 0, warn: 0, fail: 0 };
  for (const check of checks) summary[check.status] += 1;
  const label = { ok: 'OK  ', warn: 'WARN', fail: 'FAIL' };
  const lines = ['tutor doctor', ''];
  for (const check of checks) {
    lines.push(`  ${label[check.status]}  ${check.check}: ${check.detail}${check.fix ? `. Fix: ${check.fix}.` : ''}`);
  }
  lines.push('', `${summary.ok} ok, ${summary.warn} warnings, ${summary.fail} failures.` + (summary.fail === 0 ? ' The harness is usable.' : ''));

  return { exitCode: summary.fail === 0 ? 0 : 1, data: { summary, fixed, checks }, text: lines.join('\n') };
}
