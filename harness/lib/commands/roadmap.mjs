// `tutor roadmap`: create, inspect, and walk a roadmap of topics (see ../roadmap.mjs).

import fs from 'node:fs';
import path from 'node:path';
import { stringFlag } from '../args.mjs';
import { UsageError, ValidationError } from '../errors.mjs';
import { keyValues, table } from '../format.mjs';
import { isFile } from '../io.mjs';
import { slugify } from '../markdown.mjs';
import { tryLoadPack } from '../packs.mjs';
import { CLI } from '../root.mjs';
import { DEPTHS } from '../stages.mjs';
import {
  findSection, loadAllRoadmaps, nextSection, normalizeRoadmap, parseRoadmapInput, resolveRoadmap,
  roadmapFile, roadmapPaths, roadmapProgress, roadmapShapeProblems, saveRoadmap, sectionStatus, storedRoadmapProblems,
  writeRoadmapViews,
} from '../roadmap.mjs';
import { requireArg } from './shared.mjs';
import { refreshSharedMaps } from '../maps.mjs';

const USAGE = 'roadmap add --file <roadmap.json|roadmap.html> --domain <domain> [--slug <slug>] [--title "<Title>"] [--depth auto|quick|standard|deep] | roadmap inbox | roadmap list | roadmap status <roadmap> | roadmap next <roadmap> | roadmap section <roadmap> <num> | roadmap render [<roadmap>]';

export function roadmapCommand(ctx) {
  const action = ctx.args[0];
  switch (action) {
    case 'add': return addRoadmap(ctx);
    case 'inbox': return inboxRoadmaps(ctx);
    case 'list': return listRoadmaps(ctx);
    case 'status': return statusRoadmap(ctx);
    case 'next': return nextRoadmap(ctx);
    case 'section': return showSection(ctx);
    case 'render': return renderRoadmaps(ctx);
    default:
      throw new UsageError(action ? `Unknown roadmap action "${action}".` : 'Missing roadmap action.', `Usage: ${CLI} ${USAGE}`);
  }
}

/** The exact init command for a section, so no agent builds ids by hand. */
export function initCommandFor(roadmap, section) {
  const [domain, subdomain, slug] = section.topic.id.split('/');
  const title = section.topic.title.replace(/"/g, '\\"');
  return `${CLI} init "${title}" --domain ${domain} --subdomain ${subdomain} --slug ${slug} --depth ${section.topic.depth} --roadmap ${roadmap.id} --section ${section.num}`;
}

function addRoadmap({ root, flags }) {
  const file = requireArg(stringFlag(flags, 'file'), '--file', USAGE);
  const domain = requireArg(stringFlag(flags, 'domain'), '--domain', USAGE);
  const depth = stringFlag(flags, 'depth') ?? 'auto';
  if (depth !== 'auto' && !DEPTHS.includes(depth)) throw new UsageError(`Unknown depth "${depth}".`, `Use auto or one of: ${DEPTHS.join(', ')}`);
  if (!tryLoadPack(root, domain)) throw new UsageError(`No domain pack "${domain}".`, `Run \`${CLI} domains\` to see the domains.`);

  const input = parseRoadmapInput(path.resolve(root, file));
  const titleFlag = stringFlag(flags, 'title');
  if (titleFlag) input.title = titleFlag;
  const shape = roadmapShapeProblems(input);
  if (shape.length) throw new ValidationError(`${file} is not a usable roadmap.`, shape.map((problem) => ({ path: file, problem, fix: 'correct the roadmap data and run roadmap add again' })));

  const slug = slugify(stringFlag(flags, 'slug') ?? input.title);
  if (!slug) throw new UsageError('The roadmap title gives an empty slug.', 'Pass --slug <slug>.');
  if (isFile(roadmapFile(root, slug))) {
    throw new UsageError(`Roadmap "${slug}" already exists.`, `Use \`${CLI} roadmap status ${slug}\`, or pass another --slug.`);
  }

  const paths = roadmapPaths(slug);
  const extension = /\.html?$/i.test(file) ? '.html' : '.json';
  const sourceCopy = `${paths.source_copy}${extension}`;
  const roadmap = normalizeRoadmap(input, { slug, domain, depth, source: { file: path.basename(file), copy: sourceCopy } });
  const problems = storedRoadmapProblems(root, roadmap);
  if (problems.length) throw new ValidationError(`The roadmap cannot be stored.`, problems.map((problem) => ({ path: file, problem, fix: 'correct the roadmap data' })));

  saveRoadmap(root, roadmap);
  fs.copyFileSync(path.resolve(root, file), path.join(root, sourceCopy));
  const written = writeRoadmapViews(root, roadmap);
  refreshSharedMaps(root);
  const { totals } = roadmapProgress(root, roadmap);
  const depths = {};
  for (const row of roadmapProgress(root, roadmap).rows) depths[row.planned_depth] = (depths[row.planned_depth] ?? 0) + 1;

  return {
    data: { roadmap: slug, title: roadmap.title, domain, totals, depths, files: [paths.roadmap_json, sourceCopy, ...written], html_url: paths.html_url, next_command: `${CLI} roadmap next ${slug}` },
    text: [
      `Created roadmap: ${slug}  (${roadmap.title})`,
      '',
      keyValues([
        ['Phases', String(roadmap.phases.length)],
        ['Topics', `${totals.topics} (one per section with items; depths: ${Object.entries(depths).map(([d, n]) => `${n} ${d}`).join(', ')})`],
        ['Items', `${totals.items} (each one must be taught by its topic)`],
        ['State', paths.roadmap_json],
        ['Checklist', `${paths.html}  (site: ${paths.html_url})`],
        ['Obsidian', paths.vault_note],
      ]),
      '',
      `Next: ${CLI} roadmap next ${slug}`,
    ].join('\n'),
  };
}

/** The folder where the learner drops roadmap / curriculum input files. */
export const INPUTS_DIR = 'inputs';

function classifyInput(file) {
  if (/\.html?$/i.test(file)) {
    const raw = fs.readFileSync(file, 'utf8');
    return raw.includes('const DATA = ') ? 'roadmap-html' : 'needs-conversion';
  }
  if (/\.json$/i.test(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return Array.isArray(data?.phases) ? 'roadmap-json' : 'needs-conversion';
    } catch {
      return 'needs-conversion';
    }
  }
  return 'needs-conversion';
}

/** List input files in inputs/ and say which are imported, changed since import, or new. */
function inboxRoadmaps({ root }) {
  const dir = path.join(root, INPUTS_DIR);
  const names = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => !name.startsWith('.') && name.toLowerCase() !== 'readme.md' && isFile(path.join(dir, name))).sort()
    : [];
  const roadmaps = loadAllRoadmaps(root);
  const files = names.map((name) => {
    const rel = `${INPUTS_DIR}/${name}`;
    const kind = classifyInput(path.join(root, rel));
    const owner = roadmaps.find((r) => r.source?.file === name);
    let status = 'new';
    if (owner) {
      const copy = owner.source?.copy ? path.join(root, owner.source.copy) : null;
      const same = copy && isFile(copy) && fs.readFileSync(copy).equals(fs.readFileSync(path.join(root, rel)));
      status = same ? 'imported' : 'changed-since-import';
    }
    const next = status === 'imported'
      ? `${CLI} roadmap next ${owner.id}`
      : status === 'changed-since-import'
        ? `Compare ${rel} with ${owner.source.copy}; add new items as a new roadmap or report the difference to the learner.`
        : kind === 'needs-conversion'
          ? `Convert ${rel} to roadmap JSON at .cache/roadmaps/<slug>.json (learn-roadmap Step 2C), then: ${CLI} roadmap add --file .cache/roadmaps/<slug>.json --domain <domain> --slug <slug>`
          : `${CLI} roadmap add --file ${rel} --domain <domain> --slug <slug>`;
    return { file: rel, kind, status, roadmap: owner?.id ?? null, next };
  });
  const text = files.length
    ? [table(['File', 'Kind', 'Status', 'Roadmap'], files.map((f) => [f.file, f.kind, f.status, f.roadmap ?? '—'])), '', ...files.map((f) => `${f.file}: ${f.next}`)].join('\n')
    : `No input files. Put a roadmap HTML (with const DATA = {...}), roadmap JSON, or a topic list (.md/.txt) in ${INPUTS_DIR}/.`;
  return { data: { dir: INPUTS_DIR, count: files.length, files }, text };
}

function listRoadmaps({ root }) {
  const roadmaps = loadAllRoadmaps(root).map((roadmap) => ({ id: roadmap.id, title: roadmap.title, domain: roadmap.domain, ...roadmapProgress(root, roadmap).totals, html_url: roadmapPaths(roadmap.id).html_url }));
  const text = roadmaps.length
    ? table(['Roadmap', 'Domain', 'Topics ready', 'Items covered'], roadmaps.map((r) => [r.id, r.domain, `${r.complete}/${r.topics}`, `${r.items_covered}/${r.items}`]))
    : `No roadmaps yet. Create one with: ${CLI} roadmap add --file <roadmap.json|roadmap.html> --domain <domain>`;
  return { data: { count: roadmaps.length, roadmaps }, text };
}

function statusRoadmap({ root, args }) {
  const roadmap = resolveRoadmap(root, requireArg(args[1], '<roadmap>', 'roadmap status <roadmap>'));
  const { rows, totals } = roadmapProgress(root, roadmap);
  const label = (r) => r.status === 'in-progress' ? `in progress (wave ${r.wave}, ${r.progress.finished}/${r.progress.total})` : r.status === 'degraded' ? `degraded: ${r.failed_required.join(', ')}` : r.status;
  return {
    data: { roadmap: roadmap.id, title: roadmap.title, totals, sections: rows, html_url: roadmapPaths(roadmap.id).html_url },
    text: [
      `${roadmap.title}  ·  ${roadmap.id}`,
      '',
      table(['Section', 'Topic', 'Items', 'Depth', 'Status'], rows.map((r) => [r.section, r.title, String(r.items), r.depth ?? r.planned_depth, label(r)])),
      '',
      `Topics ready: ${totals.complete}/${totals.topics} · items covered: ${totals.items_covered}/${totals.items} · in progress: ${totals.in_progress} · degraded: ${totals.degraded} · not started: ${totals.not_started}`,
    ].join('\n'),
  };
}

function sectionBrief(root, roadmap, section) {
  const state = sectionStatus(root, section);
  return {
    roadmap: roadmap.id,
    section: section.num,
    phase: { num: section.phase.num, title: section.phase.title, blurb: section.phase.blurb },
    title: section.title,
    topic: section.topic,
    status: state.status,
    items: section.items.map(({ id, title, level, desc, details }) => ({ id, title, level, desc, details })),
    init_command: section.topic ? initCommandFor(roadmap, section) : null,
  };
}

function nextRoadmap({ root, args }) {
  const roadmap = resolveRoadmap(root, requireArg(args[1], '<roadmap>', 'roadmap next <roadmap>'));
  const row = nextSection(root, roadmap);
  const { totals } = roadmapProgress(root, roadmap);
  if (!row) {
    return {
      data: { roadmap: roadmap.id, complete: true, totals, next: null },
      text: `Every topic of ${roadmap.title} has finished notes (${totals.complete}/${totals.topics}). Open ${roadmapPaths(roadmap.id).html_url} on the site.`,
    };
  }
  const brief = sectionBrief(root, roadmap, findSection(roadmap, row.section));
  const action = row.status === 'not-started'
    ? { kind: 'create', command: brief.init_command, then: 'Follow learn-intake with these items as required concepts, then run the wave loop until finalize.' }
    : { kind: 'resume', command: `${CLI} next ${row.topic}`, then: row.status === 'degraded' ? 'Rerun the failed stages listed in `tutor status`.' : 'Continue the wave loop of this topic.' };
  const lookahead = lookaheadSection(root, roadmap, row);
  const lines = [
    `${roadmap.title}  ·  ${totals.complete}/${totals.topics} topics ready`,
    '',
    `Next: section ${brief.section} "${brief.title}" (phase ${brief.phase.num} ${brief.phase.title}) — ${row.status}`,
    `Topic: ${brief.topic.id}  ·  depth ${brief.topic.depth}  ·  ${brief.items.length} required items`,
    '',
    'Required items (each must become an included concept with roadmap_items):',
    ...brief.items.map((item) => `  - ${item.id}  [${item.level}]  ${item.title}`),
    '',
    `Run: ${action.command}`,
    action.then,
    ...(lookahead ? ['', `Lookahead (intake + research only, while this topic is in wave 3 or later): section ${lookahead.section} "${lookahead.title}"`, `  ${lookahead.init_command}`] : []),
  ];
  return { data: { roadmap: roadmap.id, complete: false, totals, next: { ...brief, action }, lookahead }, text: lines.join('\n') };
}

/**
 * The one section that may be prepared (intake + research) while the current one
 * finishes. Only when exactly one section is in progress, so at most two topics
 * are ever active at once.
 */
function lookaheadSection(root, roadmap, row) {
  if (row.status !== 'in-progress') return null;
  const { rows } = roadmapProgress(root, roadmap);
  if (rows.filter((r) => r.status === 'in-progress').length !== 1) return null;
  const after = rows.slice(rows.findIndex((r) => r.section === row.section) + 1).find((r) => r.status === 'not-started');
  if (!after) return null;
  const section = findSection(roadmap, after.section);
  return { section: section.num, title: section.title, topic: section.topic.id, items: section.items.length, init_command: initCommandFor(roadmap, section) };
}

function showSection({ root, args }) {
  const usage = 'roadmap section <roadmap> <num>';
  const roadmap = resolveRoadmap(root, requireArg(args[1], '<roadmap>', usage));
  const section = findSection(roadmap, requireArg(args[2], '<num>', usage));
  const brief = sectionBrief(root, roadmap, section);
  return {
    data: brief,
    text: [
      `${roadmap.id} § ${brief.section} ${brief.title}  ·  ${brief.status}`,
      brief.topic ? `Topic: ${brief.topic.id} (depth ${brief.topic.depth})` : 'Reference section: no topic.',
      '',
      ...brief.items.map((item) => `- ${item.id}  [${item.level}]  ${item.title}${item.desc ? ` — ${item.desc}` : ''}`),
      ...(brief.init_command ? ['', `Create: ${brief.init_command}`] : []),
    ].join('\n'),
  };
}

function renderRoadmaps({ root, args }) {
  const roadmaps = args[1] ? [resolveRoadmap(root, args[1])] : loadAllRoadmaps(root);
  const written = roadmaps.flatMap((roadmap) => writeRoadmapViews(root, roadmap));
  if (roadmaps.length) written.push(...refreshSharedMaps(root));
  return { data: { written }, text: written.length ? `Refreshed:\n${written.map((f) => `  ${f}`).join('\n')}` : 'No roadmaps to render.' };
}
