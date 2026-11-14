// Commands about topics as a whole: domains, init, list, status, paths, next, plan, log.

import path from 'node:path';
import { isFile } from '../io.mjs';
import { stringFlag } from '../args.mjs';
import { isoNow } from '../clock.mjs';
import { UsageError } from '../errors.mjs';
import { keyValues, table } from '../format.mjs';
import { slugify } from '../markdown.mjs';
import { listPackIds, loadPack, packProblems, tryLoadPack } from '../packs.mjs';
import { CLI } from '../root.mjs';
import { scaffoldTopic } from '../scaffold.mjs';
import { readingOrderOf, refreshMaps } from '../maps.mjs';
import { buildStages, currentWave, DEPTHS, progressOf, resolveProfile, runnableStages, skipReason } from '../stages.mjs';
import { describeStage } from '../stage-io.mjs';
import {
  appendLog, loadAllTopics, loadTopic, openLessonLine, resolveTopic, saveTopic, scanTopicIds,
  SITE_DEV_COMMAND, siteUrl, topicId, topicJsonPath, topicPaths, upsertRegistry,
} from '../topic-store.mjs';
import { createContext, validateStage } from '../validators/index.mjs';
import { nextActionLine, readJsonInput, requireArg, saveAndRefresh, stageTable, topicSummary } from './shared.mjs';

// --- domains ----------------------------------------------------------------

export function domainsCommand({ root }) {
  const domains = listPackIds(root).map((id) => {
    const pack = tryLoadPack(root, id);
    if (!pack) return { id, error: 'pack.json cannot be read' };
    return {
      id,
      title: pack.title ?? id,
      description: pack.description ?? '',
      subdomains: Array.isArray(pack.subdomains) ? pack.subdomains : [],
      stages: pack.stages ?? {},
      default_stack: pack.default_stack ?? {},
      problems: packProblems(pack, id),
    };
  });

  const lines = [];
  if (domains.length === 0) {
    lines.push('No domain packs found in harness/domains/.');
  }
  for (const domain of domains) {
    if (domain.error) {
      lines.push(`${domain.id} — ${domain.error}`, '');
      continue;
    }
    lines.push(`${domain.id} — ${domain.title}`);
    if (domain.description) lines.push(`  ${domain.description}`);
    if (domain.subdomains.length > 0) {
      const rows = domain.subdomains.map((sub) => [sub.id, sub.title ?? '', (sub.examples ?? []).join(', ')]);
      lines.push(table(['Subdomain', 'Title', 'Examples'], rows, { indent: 4 }));
    }
    lines.push('');
  }
  return { data: { domains }, text: lines.join('\n').trimEnd() };
}

// --- init -------------------------------------------------------------------

function newTopic({ title, slug, domain, subdomain, depth, pack }) {
  const id = topicId(domain, subdomain, slug);
  const profile = resolveProfile(depth, pack);
  const stages = buildStages(depth, pack, profile);
  const isSkipped = (stageId) => stages.find((s) => s.id === stageId).status === 'skipped';
  const timestamp = isoNow();

  return {
    schema: 1,
    id,
    title,
    slug,
    domain,
    subdomain,
    depth,
    created_at: timestamp,
    updated_at: timestamp,
    paths: {
      state: `state/topics/${id}`,
      vault: `vault/${id}`,
      lessons: `site/src/content/lessons/${id}`,
      projects: `projects/${id}`,
      cache: '.cache',
    },
    profile,
    plan: {
      summary: '',
      prerequisites: [],
      outcomes: [],
      lesson_outline: [],
      mini_projects: [],
      digest_targets: isSkipped('digest') ? 0 : profile.digests[0],
      repo_targets: isSkipped('repo-intel') ? 0 : profile.repos[0],
      capstone: { name: '', problem: '' },
    },
    stages,
    recall: { cards: {} },
    log: [],
  };
}

export function initCommand({ root, args, flags }) {
  const usage = 'init "<Title>" --domain <domain> --subdomain <subdomain> [--depth quick|standard|deep] [--slug <slug>]';
  const title = String(requireArg(args[0], '"<Title>"', usage)).trim();
  const domain = requireArg(stringFlag(flags, 'domain'), '--domain', usage);
  const subdomain = slugify(requireArg(stringFlag(flags, 'subdomain'), '--subdomain', usage));
  const depth = stringFlag(flags, 'depth') ?? 'standard';
  const slug = slugify(stringFlag(flags, 'slug') ?? title);

  if (!DEPTHS.includes(depth)) throw new UsageError(`Unknown depth "${depth}".`, `Use one of: ${DEPTHS.join(', ')}`);
  if (!subdomain) throw new UsageError('--subdomain must contain letters or digits.');
  if (!slug) throw new UsageError('The title gives an empty slug.', 'Pass --slug <slug> with lowercase letters, digits, and dashes.');

  const pack = loadPack(root, domain);
  const id = topicId(domain, subdomain, slug);
  const notes = [];

  const knownSubdomains = (pack.subdomains ?? []).map((s) => s.id);
  if (!knownSubdomains.includes(subdomain)) {
    notes.push(`Subdomain "${subdomain}" is new for ${domain} (the pack lists: ${knownSubdomains.join(', ') || 'none'}). That is allowed.`);
  }

  const alreadyExisted = isFile(topicJsonPath(root, id));
  let topic;
  if (alreadyExisted) {
    topic = loadTopic(root, id);
    if (stringFlag(flags, 'depth') && topic.depth !== depth) {
      notes.push(`The topic already exists with depth "${topic.depth}"; it was not changed to "${depth}".`);
    }
  } else {
    const sameSlug = scanTopicIds(root).filter((other) => other.split('/')[2] === slug);
    if (sameSlug.length > 0) {
      notes.push(`The slug "${slug}" is also used by ${sameSlug.join(', ')}. Address this topic by its full id.`);
    }
    topic = newTopic({ title, slug, domain, subdomain, depth, pack });
    appendLog(topic, 'init', `created with depth ${depth}`);
    saveTopic(root, topic);
  }

  upsertRegistry(root, topic);
  const { created, existed } = scaffoldTopic(root, topic);
  refreshMaps(root, topic);

  const paths = topicPaths(topic);
  const text = [
    alreadyExisted
      ? `Topic already exists: ${id}  (depth: ${topic.depth}). Nothing was overwritten.`
      : `Created topic: ${id}  (depth: ${topic.depth})`,
    '',
    keyValues([
      ['State', paths.state_dir],
      ['Vault', paths.vault_dir],
      ['Lessons', paths.lessons_dir],
      ['Projects', paths.projects_dir],
      ['Site path', siteUrl(topic)],
    ]),
    '',
    `  ${created.length} files created, ${existed.length} already existed.`,
    ...notes.map((note) => `  Note: ${note}`),
    '',
    stageTable(topic),
    '',
    nextActionLine(topic),
  ].join('\n');

  return {
    data: {
      topic: id,
      created: !alreadyExisted,
      title: topic.title,
      slug: topic.slug,
      depth: topic.depth,
      profile: topic.profile,
      files_created: created,
      files_existing: existed,
      notes,
      stages: topic.stages.map((s) => ({ id: s.id, wave: s.wave, status: s.status, note: s.note })),
      next_command: `${CLI} next ${id}`,
    },
    text,
  };
}

// --- list and status --------------------------------------------------------

export function listCommand({ root }) {
  const topics = loadAllTopics(root).map((topic) => ({
    ...topicSummary(topic),
    site_url: siteUrl(topic),
    start_here: topicPaths(topic).start_here,
  }));

  let text;
  if (topics.length === 0) {
    text = `No topics yet. Create one with: ${CLI} init "<Title>" --domain <domain> --subdomain <subdomain>`;
  } else {
    const rows = topics.map((t) => [
      t.id,
      t.depth,
      `${t.progress.finished}/${t.progress.total}`,
      t.complete ? 'complete' : `wave ${t.wave}: ${t.runnable.join(', ')}`,
    ]);
    text = [`${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}`, '', table(['Topic', 'Depth', 'Done', 'Now'], rows)].join('\n');
  }
  return { data: { count: topics.length, topics }, text };
}

export function statusCommand(ctx) {
  const { root, args } = ctx;
  if (!args[0]) {
    const result = listCommand(ctx);
    return result;
  }

  const topic = resolveTopic(root, args[0]);
  const progress = progressOf(topic);
  const summary = topicSummary(topic);
  const text = [
    `${topic.title}  ·  ${topic.id}  ·  depth: ${topic.depth}`,
    '',
    stageTable(topic),
    '',
    `Progress: ${progress.finished} of ${progress.total} stages done` +
      (topic.stages.some((s) => s.status === 'skipped') ? ' (skipped stages are not counted).' : '.'),
    nextActionLine(topic),
  ].join('\n');

  return {
    data: {
      topic: topic.id,
      title: topic.title,
      depth: topic.depth,
      profile: topic.profile ?? null,
      progress,
      complete: summary.complete,
      wave: summary.wave,
      runnable: summary.runnable,
      stages: topic.stages,
      site_url: siteUrl(topic),
      updated_at: topic.updated_at,
    },
    text,
  };
}

// --- paths ------------------------------------------------------------------

export function pathsCommand({ root, args }) {
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', 'paths <topic>'));
  const paths = topicPaths(topic);
  const absolute = Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, path.join(root, value)]));

  const text = [
    `Paths of ${topic.id} (relative to ${root})`,
    '',
    keyValues([...Object.entries(paths), ['site_url', siteUrl(topic)], ['open_lesson', openLessonLine(topic)]]),
  ].join('\n');

  return {
    data: {
      topic: topic.id,
      title: topic.title,
      slug: topic.slug,
      domain: topic.domain,
      subdomain: topic.subdomain,
      depth: topic.depth,
      root,
      site_url: siteUrl(topic),
      open_lesson: openLessonLine(topic),
      ...paths,
      abs: absolute,
    },
    text,
  };
}

// --- next -------------------------------------------------------------------

export function nextCommand({ root, args }) {
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', 'next <topic>'));
  const ctx = createContext(root, topic);
  const paths = topicPaths(topic);
  const wave = currentWave(topic);
  const base = {
    topic: topic.id,
    title: topic.title,
    depth: topic.depth,
    profile: ctx.profile,
    domain: {
      id: topic.domain,
      capstone_kind: ctx.pack?.stages?.capstone?.kind ?? null,
      default_stack: ctx.pack?.default_stack ?? {},
      safety: ctx.pack?.safety ?? [],
    },
  };

  if (wave === null) {
    const message = 'Every stage is done or skipped. Nothing left to generate.';
    // The reading order of this topic: only the steps it has. Copy it; do not rebuild it by hand.
    const order = readingOrderOf(topic);
    const notPart = topic.stages.filter((s) => s.status === 'skipped').map((s) => s.id);
    const hasLesson = !notPart.includes('lesson');
    return {
      data: {
        ...base,
        complete: true,
        wave: null,
        stages: [],
        message,
        reading_order: order.steps.map(({ n, step, label, path: file, note }) => ({ n, step, label, path: file, note })),
        reading_order_line: order.line,
        not_part_of_topic: notPart,
        open_lesson: hasLesson ? openLessonLine(topic) : null,
        site_url: siteUrl(topic),
        site_dev_command: SITE_DEV_COMMAND,
        start_here: paths.start_here,
        vault_dir: paths.vault_dir,
        recall_command: `${CLI} recall due ${topic.id}`,
      },
      text: [
        `${topic.title}  ·  ${topic.id}`,
        '',
        message,
        '',
        'Reading order of this topic (only the steps it has):',
        `  ${order.line}`,
        ...(notPart.length ? [`  Not part of this topic: ${notPart.join(', ')}.`] : []),
        '',
        keyValues([
          ...(hasLesson ? [['Open the lesson', openLessonLine(topic)]] : []),
          ['Read in Obsidian', paths.start_here],
          ['Review cards', `${CLI} recall due ${topic.id}`],
        ]),
      ].join('\n'),
    };
  }

  const stages = runnableStages(topic).map((stage) => ({
    id: stage.id,
    wave: stage.wave,
    status: stage.status,
    attempts: stage.attempts,
    units: stage.units,
    note: stage.note,
    ...describeStage(ctx, stage.id),
  }));

  const lines = [
    `${topic.title}  ·  ${topic.id}  ·  depth: ${topic.depth}`,
    '',
    `Wave ${wave}: ${stages.length} ${stages.length === 1 ? 'stage' : 'stages'} can run now` +
      (stages.length > 1 ? ' (independent of each other).' : '.'),
  ];
  for (const stage of stages) {
    lines.push('', `  ${stage.id}  [${stage.status}]  skill: ${stage.skill}`);
    lines.push('    Read:');
    for (const item of stage.inputs) {
      const section = item.section ? `  (section "${item.section}")` : '';
      const missing = item.exists ? '' : '  [not there yet]';
      lines.push(`      ${item.path}${section}${missing}`);
    }
    lines.push('    Write:');
    for (const item of stage.outputs) lines.push(`      ${item.path}`);
    lines.push('    Commands:');
    lines.push(`      ${stage.commands.start}`);
    lines.push(`      ${stage.commands.validate}`);
    lines.push(`      ${stage.commands.done}`);
  }
  lines.push('', 'Add --json for the full detail (why each file is read, targets, units).');

  return {
    data: {
      ...base,
      complete: false,
      wave,
      stages,
      message: `Wave ${wave}: run ${stages.map((s) => s.id).join(', ')}.`,
    },
    text: lines.join('\n'),
  };
}

// --- depth ------------------------------------------------------------------

/** The plan numbers that must sit inside the depth's range once their stage runs. */
const PLAN_TARGETS = [
  { key: 'digest_targets', stage: 'digest', profileKey: 'digests' },
  { key: 'repo_targets', stage: 'repo-intel', profileKey: 'repos' },
];

export function depthCommand({ root, args }) {
  const usage = 'depth <topic> <quick|standard|deep>';
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  const depth = requireArg(args[1], 'the depth (quick|standard|deep)', usage);
  if (!DEPTHS.includes(depth)) throw new UsageError(`Unknown depth "${depth}".`, `Use one of: ${DEPTHS.join(', ')}`);

  const previous = topic.depth;
  if (previous === depth) {
    return {
      data: { topic: topic.id, depth, previous, changed: false, profile: topic.profile ?? null, stages: [], plan: [], kept: [], needs_rework: [], files_created: [], next_command: `${CLI} next ${topic.id}` },
      text: `${topic.id} already has depth "${depth}". Nothing changed.\n${nextActionLine(topic)}`,
    };
  }

  const pack = tryLoadPack(root, topic.domain);
  const oldProfile = resolveProfile(previous, pack);
  const profile = resolveProfile(depth, pack);
  const changes = [];
  const kept = [];

  for (const stage of topic.stages) {
    const before = skipReason(stage.id, previous, pack, oldProfile);
    const after = skipReason(stage.id, depth, pack, profile);

    if (before && !after) {
      // The new depth has this stage. Only a stage that the depth itself had skipped is opened.
      if (stage.status === 'skipped' && stage.note === before) {
        stage.status = 'pending';
        stage.started_at = null;
        stage.finished_at = null;
        stage.note = '';
        changes.push({ stage: stage.id, from: 'skipped', to: 'pending', why: `depth "${depth}" has this stage` });
      } else if (stage.status === 'skipped') {
        kept.push({ stage: stage.id, status: stage.status, why: `it was skipped for another reason (${stage.note || 'no reason recorded'}); open it with \`${CLI} reset ${topic.id} ${stage.id}\`` });
      }
    } else if (!before && after) {
      // The new depth leaves this stage out. Work that exists is never thrown away.
      if (stage.status === 'pending') {
        stage.status = 'skipped';
        stage.started_at = null;
        stage.finished_at = null;
        stage.note = after;
        changes.push({ stage: stage.id, from: 'pending', to: 'skipped', why: after });
      } else if (stage.status !== 'skipped') {
        kept.push({ stage: stage.id, status: stage.status, why: `depth "${depth}" leaves it out, but it is already ${stage.status.replace('_', ' ')}, so it stays` });
      }
    } else if (before && after && stage.status === 'skipped' && stage.note === before) {
      stage.note = after;
    }
  }

  // Plan numbers that fall outside the new range are moved to its nearest end.
  const planChanges = [];
  topic.plan = topic.plan ?? {};
  for (const target of PLAN_TARGETS) {
    const value = topic.plan[target.key];
    const [min, max] = profile[target.profileKey];
    if (!Number.isInteger(value)) continue;
    const skipped = topic.stages.find((s) => s.id === target.stage)?.status === 'skipped';
    const wanted = skipped ? Math.min(value, max) : Math.min(Math.max(value, min), max);
    if (wanted !== value) {
      topic.plan[target.key] = wanted;
      planChanges.push({ key: target.key, from: value, to: wanted });
    }
  }

  topic.depth = depth;
  topic.profile = profile;
  appendLog(
    topic,
    'depth',
    `depth ${previous} -> ${depth}` + (changes.length ? `; ${changes.map((c) => `${c.stage}: ${c.from} -> ${c.to}`).join(', ')}` : '; no stage changed'),
  );
  saveTopic(root, topic);
  upsertRegistry(root, topic);
  const { created } = scaffoldTopic(root, topic);
  refreshMaps(root, topic);

  // Stages that are done but were made for the old depth: their gate may fail now.
  const ctx = createContext(root, topic);
  const needsRework = topic.stages
    .filter((stage) => stage.status === 'done' && stage.id !== 'finalize')
    .map((stage) => ({ stage: stage.id, gate: validateStage(root, topic, stage.id, ctx) }))
    .filter(({ gate }) => !gate.ok)
    .map(({ stage, gate }) => ({
      stage,
      problems: gate.failures.map((f) => `${f.path}: ${f.problem}`),
      redo: `${CLI} reset ${topic.id} ${stage}`,
    }));
  const finalize = topic.stages.find((s) => s.id === 'finalize');
  const reopened = changes.some((c) => c.to === 'pending');
  if (finalize?.status === 'done' && (reopened || needsRework.length > 0)) {
    needsRework.push({
      stage: 'finalize',
      problems: ['the topic was finalized at the old depth; the final checks must run again after the new work'],
      redo: `${CLI} reset ${topic.id} finalize`,
    });
  }

  const range = ([min, max]) => (min === max ? `${min}` : `${min}–${max}`);
  const outlinePages = Array.isArray(topic.plan.lesson_outline) ? topic.plan.lesson_outline.length : 0;
  const [minPages, maxPages] = profile.lesson_pages;
  const lines = [`Depth of ${topic.id}: ${previous} -> ${depth}.`, ''];

  lines.push('Stages:');
  if (changes.length === 0) lines.push('  no stage changed its status');
  for (const change of changes) lines.push(`  ${change.stage}: ${change.from} -> ${change.to}  (${change.why})`);
  for (const item of kept) lines.push(`  ${item.stage}: stays ${item.status}  (${item.why})`);
  for (const change of planChanges) lines.push(`  plan.${change.key}: ${change.from} -> ${change.to}`);
  if (created.length > 0) lines.push(`  ${created.length} note ${created.length === 1 ? 'scaffold' : 'scaffolds'} created: ${created.join(', ')}`);

  lines.push(
    '',
    `Depth "${depth}" asks for: lesson pages ${range(profile.lesson_pages)}, mini projects ${profile.mini_projects}, digests ${range(profile.digests)}, ` +
      `repositories ${range(profile.repos)}, capstone ${profile.capstone ? 'yes' : 'no'}, sources ${range(profile.sources)}, recall cards at least ${profile.recall_cards}.`,
  );
  if (outlinePages < minPages || outlinePages > maxPages) {
    lines.push(
      `The plan has ${outlinePages} lesson pages; this depth needs ${range(profile.lesson_pages)}. ` +
        `${outlinePages < minPages ? 'Add pages to' : 'Remove pages from'} plan.lesson_outline with \`${CLI} plan ${topic.id} --set <file.json>\` (skill: learn-intake).`,
    );
  }
  if (needsRework.length > 0) {
    lines.push('', 'Done stages that no longer pass their gate at this depth (nothing was reset; existing work is kept):');
    for (const item of needsRework) {
      lines.push(`  ${item.stage}: ${item.problems.length} ${item.problems.length === 1 ? 'problem' : 'problems'}. To redo it: ${item.redo}`);
      for (const problem of item.problems.slice(0, 3)) lines.push(`    ${problem}`);
      if (item.problems.length > 3) lines.push(`    … and ${item.problems.length - 3} more (\`${CLI} validate ${topic.id} ${item.stage === 'finalize' ? '--all' : item.stage}\`)`);
    }
  }
  lines.push('', nextActionLine(topic));

  return {
    data: {
      topic: topic.id,
      depth,
      previous,
      changed: true,
      profile,
      stages: changes,
      kept,
      plan: planChanges,
      lesson_pages: { planned: outlinePages, wanted: profile.lesson_pages, fits: outlinePages >= minPages && outlinePages <= maxPages },
      needs_rework: needsRework,
      files_created: created,
      runnable: runnableStages(topic).map((s) => s.id),
      next_command: `${CLI} next ${topic.id}`,
    },
    text: lines.join('\n'),
  };
}

// --- plan -------------------------------------------------------------------

export function planCommand({ root, args, flags }) {
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', 'plan <topic> [--set <file.json>]'));
  const file = stringFlag(flags, 'set');
  const data = { topic: topic.id, title: topic.title, depth: topic.depth, profile: topic.profile ?? null };

  if (file === undefined) {
    return { data: { ...data, plan: topic.plan }, text: JSON.stringify(topic.plan, null, 2) };
  }

  let incoming = readJsonInput(file, '--set');
  if (incoming && typeof incoming === 'object' && !Array.isArray(incoming) && incoming.plan && typeof incoming.plan === 'object' && Object.keys(incoming).length === 1) {
    incoming = incoming.plan;
  }
  if (incoming === null || typeof incoming !== 'object' || Array.isArray(incoming)) {
    throw new UsageError(`${file} must contain a JSON object with plan fields.`, 'Example: { "summary": "...", "outcomes": ["..."] }');
  }

  topic.plan = { ...(topic.plan ?? {}), ...incoming };
  appendLog(topic, 'plan', `plan fields set: ${Object.keys(incoming).join(', ')}`, 'intake');
  saveAndRefresh(root, topic);

  const gate = validateStage(root, topic, 'intake');
  const lines = [`Plan of ${topic.id} updated: ${Object.keys(incoming).join(', ')}.`];
  if (gate.ok) {
    lines.push('The intake gate passes.');
  } else {
    lines.push(`The intake gate still has ${gate.failures.length} open ${gate.failures.length === 1 ? 'problem' : 'problems'}:`);
    for (const f of gate.failures) lines.push(`  ${f.problem}. ${f.fix}.`);
  }

  return {
    data: { ...data, plan: topic.plan, updated_keys: Object.keys(incoming), intake_gate: { ok: gate.ok, failures: gate.failures } },
    text: lines.join('\n'),
  };
}

// --- log --------------------------------------------------------------------

export function logCommand({ root, args }) {
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', 'log <topic> "<message>"'));
  const message = args.slice(1).join(' ').trim();

  if (!message) {
    const entries = (topic.log ?? []).slice(-20);
    const text = entries.length
      ? entries.map((e) => `${e.at}  ${e.event}${e.stage ? ` [${e.stage}]` : ''}  ${e.message}`).join('\n')
      : 'The log is empty.';
    return { data: { topic: topic.id, entries }, text };
  }

  appendLog(topic, 'note', message);
  saveTopic(root, topic);
  return { data: { topic: topic.id, logged: message, entries: topic.log.length }, text: `Logged for ${topic.id}: ${message}` };
}
