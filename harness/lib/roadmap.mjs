// Roadmaps: one learning path over a whole field ("frontend engineering end to end").
//
// A roadmap is an ordered list of phases -> sections -> items. Every section that
// has items becomes exactly one topic of the normal pipeline, generated in roadmap
// order; every item of that section is a required concept of that topic. The
// intake and finalize gates check the item -> concept mapping, and the existing
// curriculum coverage gate then proves every item was taught.
//
// State:  state/roadmaps/<slug>/roadmap.json   (written only by `tutor roadmap`)
// Views:  site/public/roadmaps/<slug>.html     (interactive checklist, served by the site)
//         vault/_roadmaps/<slug>.md            (Obsidian map with links to every topic)

import fs from 'node:fs';
import path from 'node:path';
import { isoNow, today } from './clock.mjs';
import { UsageError, ValidationError } from './errors.mjs';
import { isFile, listDirs, readJson, readText, writeJsonAtomic, writeTextAtomic } from './io.mjs';
import { INSIGHTS_HEADING, replaceGeneratedRegion, slugify, yamlEscape } from './markdown.mjs';
import { tryLoadPack } from './packs.mjs';
import { TEMPLATES_DIR } from './root.mjs';
import { completionOf, currentWave, DEPTHS, progressOf } from './stages.mjs';
import { loadTopic, siteUrl, topicJsonPath, topicPaths } from './topic-store.mjs';

export const ROADMAP_LEVELS = ['core', 'adv', 'opt'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const COMPLEXITY_RANK = { basic: 0, intermediate: 1, advanced: 2 };
const IMPORTANCE_RANK = { supporting: 0, core: 1, critical: 2 };

// --- paths -------------------------------------------------------------------

export function roadmapPaths(slug) {
  return {
    state_dir: `state/roadmaps/${slug}`,
    roadmap_json: `state/roadmaps/${slug}/roadmap.json`,
    source_copy: `state/roadmaps/${slug}/source`,
    html: `site/public/roadmaps/${slug}.html`,
    html_url: `/roadmaps/${slug}.html`,
    vault_note: `vault/_roadmaps/${slug}.md`,
  };
}

// --- reading the input -------------------------------------------------------

/**
 * Accept either a roadmap JSON file or an HTML roadmap page that embeds its data
 * as `const DATA = {...};` (the format of the interactive roadmap template).
 */
export function parseRoadmapInput(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (error) {
    throw new UsageError(`Cannot read ${file}: ${error.message}`);
  }
  if (/\.html?$/i.test(file) || /^\s*<!doctype html|^\s*<html/i.test(raw)) {
    const marker = raw.indexOf('const DATA = ');
    if (marker === -1) throw new UsageError(`${file} has no embedded "const DATA = {...}" roadmap data.`, 'Pass a roadmap JSON file instead (see docs/ARCHITECTURE.md, "Roadmaps").');
    const start = raw.indexOf('{', marker);
    const end = matchingBrace(raw, start);
    if (start === -1 || end === -1) throw new UsageError(`${file}: the embedded roadmap data is not a complete object.`);
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (error) {
      throw new UsageError(`${file}: the embedded roadmap data is not JSON: ${error.message}`);
    }
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new UsageError(`${file} is not valid JSON: ${error.message}`);
  }
}

function matchingBrace(textValue, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < textValue.length; i++) {
    const c = textValue[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

// --- normalizing and checking ------------------------------------------------

/** Plain problems of a roadmap object (before or after normalization). */
export function roadmapShapeProblems(data) {
  const problems = [];
  if (!object(data)) return ['the roadmap must be a JSON object'];
  if (!text(data.title)) problems.push('title is missing');
  if (!Array.isArray(data.phases) || data.phases.length === 0) {
    problems.push('phases must be a non-empty list');
    return problems;
  }
  const itemIds = new Set();
  let items = 0;
  data.phases.forEach((phase, p) => {
    const where = `phases[${p}]`;
    if (!object(phase)) { problems.push(`${where} must be an object`); return; }
    if (!text(phase.title)) problems.push(`${where} needs a title`);
    if (!Array.isArray(phase.sections) || phase.sections.length === 0) { problems.push(`${where} needs a non-empty sections list`); return; }
    phase.sections.forEach((section, s) => {
      const at = `${where}.sections[${s}]`;
      if (!object(section)) { problems.push(`${at} must be an object`); return; }
      if (!text(section.title)) problems.push(`${at} needs a title`);
      if (section.items !== undefined && !Array.isArray(section.items)) { problems.push(`${at}.items must be a list`); return; }
      for (const [i, item] of (section.items ?? []).entries()) {
        const it = `${at}.items[${i}]`;
        if (!object(item)) { problems.push(`${it} must be an object`); continue; }
        items++;
        if (!text(item.title)) problems.push(`${it} needs a title`);
        if (item.id !== undefined && (!text(item.id) || !ID.test(item.id))) problems.push(`${it} id "${item.id}" must be lowercase words joined by dashes`);
        if (text(item.id) && itemIds.has(item.id)) problems.push(`${it} repeats item id ${item.id}`);
        if (text(item.id)) itemIds.add(item.id);
        if (item.level !== undefined && !ROADMAP_LEVELS.includes(item.level)) problems.push(`${it} level must be one of ${ROADMAP_LEVELS.join(', ')}`);
        if (item.details !== undefined && (!Array.isArray(item.details) || item.details.some((d) => !object(d) || !text(d.key) || typeof d.value !== 'string'))) problems.push(`${it} details must be a list of {key, value}`);
      }
    });
  });
  if (items === 0) problems.push('the roadmap has no items');
  return problems;
}

/** Suggested depth of a section topic from its size and how advanced it is. */
export function suggestDepth(items) {
  const advanced = items.filter((i) => i.level === 'adv').length;
  if (items.length <= 3 && advanced === 0) return 'quick';
  if (items.length >= 9 || advanced >= 3) return 'deep';
  return 'standard';
}

function shortSlug(title, words = 6) {
  const base = slugify(String(title).replace(/\s*\([^)]*\)\s*/g, ' '));
  return base.split('-').slice(0, words).join('-').slice(0, 60).replace(/-+$/, '');
}

/**
 * Turn raw input into the stored roadmap: stable ids, numbering, and one planned
 * topic per section that has items.
 */
export function normalizeRoadmap(data, { slug, domain, depth = 'auto', source = null }) {
  const usedItemIds = new Set();
  const usedTopicIds = new Set();
  let n = 0;
  const phases = data.phases.map((phase, p) => {
    const num = text(phase.num) ? String(phase.num) : String(p).padStart(2, '0');
    const subdomain = text(phase.subdomain) ? slugify(phase.subdomain) : shortSlug(phase.title, 4) || `phase-${num}`;
    return {
      id: text(phase.id) && ID.test(phase.id) ? phase.id : `p${num.replace(/[^0-9a-z]/gi, '').toLowerCase()}`,
      num,
      title: phase.title.trim(),
      blurb: text(phase.blurb) ? phase.blurb.trim() : '',
      subdomain,
      sections: phase.sections.map((section, s) => {
        const sectionNum = text(section.num) ? String(section.num) : `${num}.${s + 1}`;
        const items = (section.items ?? []).map((item) => {
          let id = text(item.id) ? item.id : shortSlug(item.title, 8) || `item-${n + 1}`;
          while (usedItemIds.has(id)) id = `${id}-${sectionNum.replace(/[^0-9]/g, '')}`;
          usedItemIds.add(id);
          n++;
          return {
            id,
            n,
            title: item.title.trim(),
            level: ROADMAP_LEVELS.includes(item.level) ? item.level : 'core',
            desc: text(item.desc) ? item.desc.trim() : '',
            details: Array.isArray(item.details) ? item.details.map((d) => ({ key: d.key, value: d.value })) : [],
          };
        });
        let topic = null;
        if (items.length > 0) {
          let topicSlug = text(section.slug) ? slugify(section.slug) : shortSlug(section.title) || `section-${sectionNum.replace(/[^0-9]+/g, '-')}`;
          while (usedTopicIds.has(`${subdomain}/${topicSlug}`)) topicSlug = `${topicSlug}-${sectionNum.replace(/[^0-9]+/g, '-')}`;
          usedTopicIds.add(`${subdomain}/${topicSlug}`);
          topic = {
            id: `${domain}/${subdomain}/${topicSlug}`,
            title: section.title.trim(),
            depth: DEPTHS.includes(section.depth) ? section.depth : depth === 'auto' ? suggestDepth(items) : depth,
          };
        }
        return {
          num: sectionNum,
          title: section.title.trim(),
          notes: Array.isArray(section.notes) ? section.notes.filter((l) => typeof l === 'string') : [],
          items,
          topic,
        };
      }),
    };
  });
  const timestamp = isoNow();
  return {
    schema: 1,
    id: slug,
    title: data.title.trim(),
    domain,
    goal: text(data.goal) ? data.goal.trim() : '',
    intro: Array.isArray(data.intro) ? data.intro.filter((l) => typeof l === 'string') : [],
    depth_policy: depth,
    source,
    created_at: timestamp,
    updated_at: timestamp,
    phases,
  };
}

/** Problems of a stored roadmap that make it unusable. */
export function storedRoadmapProblems(root, roadmap) {
  const problems = roadmapShapeProblems(roadmap);
  if (roadmap?.schema !== 1) problems.push('schema must be 1');
  if (!text(roadmap?.id) || !ID.test(roadmap.id)) problems.push('id must be a lowercase slug');
  if (!text(roadmap?.domain) || !tryLoadPack(root, roadmap.domain)) problems.push(`domain "${roadmap?.domain}" has no pack in harness/domains/`);
  const topics = new Set();
  for (const section of sectionsOf(roadmap)) {
    if (section.items.length && !object(section.topic)) problems.push(`section ${section.num} has items but no planned topic`);
    if (object(section.topic)) {
      if (!/^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/.test(section.topic.id ?? '')) problems.push(`section ${section.num} topic id "${section.topic.id}" is not domain/subdomain/slug`);
      if (topics.has(section.topic.id)) problems.push(`section ${section.num} reuses topic ${section.topic.id}`);
      topics.add(section.topic.id);
      if (!DEPTHS.includes(section.topic.depth)) problems.push(`section ${section.num} topic depth must be one of ${DEPTHS.join(', ')}`);
    }
  }
  return problems;
}

// --- storage -------------------------------------------------------------------

export function roadmapFile(root, slug) {
  return path.join(root, roadmapPaths(slug).roadmap_json);
}

export function scanRoadmapIds(root) {
  return listDirs(path.join(root, 'state', 'roadmaps')).filter((slug) => isFile(roadmapFile(root, slug))).sort();
}

export function loadRoadmap(root, slug) {
  try {
    return readJson(roadmapFile(root, slug));
  } catch (error) {
    throw new ValidationError(`Cannot read ${roadmapPaths(slug).roadmap_json}: ${error.message}`);
  }
}

export function saveRoadmap(root, roadmap) {
  roadmap.updated_at = isoNow();
  writeJsonAtomic(roadmapFile(root, roadmap.id), roadmap);
}

export function loadAllRoadmaps(root) {
  return scanRoadmapIds(root).map((slug) => loadRoadmap(root, slug));
}

export function resolveRoadmap(root, reference) {
  if (!text(reference)) throw new UsageError('Missing <roadmap>.', 'Give the roadmap slug. `tutor roadmap list` shows them.');
  const ids = scanRoadmapIds(root);
  const ref = slugify(reference);
  if (ids.includes(ref)) return loadRoadmap(root, ref);
  throw new UsageError(`No roadmap "${reference}".`, ids.length ? `Known roadmaps: ${ids.join(', ')}` : 'No roadmaps yet. Create one with `tutor roadmap add --file <roadmap.json|roadmap.html> --domain <domain>`.');
}

export function sectionsOf(roadmap) {
  return (roadmap?.phases ?? []).flatMap((phase) => (phase.sections ?? []).map((section) => ({ ...section, phase })));
}

export function findSection(roadmap, num) {
  const section = sectionsOf(roadmap).find((s) => s.num === String(num));
  if (!section) throw new UsageError(`Roadmap ${roadmap.id} has no section "${num}".`, `Sections: ${sectionsOf(roadmap).filter((s) => s.topic).map((s) => s.num).join(', ')}`);
  return section;
}

/** The roadmap section that a topic id belongs to, from any roadmap on disk. */
export function roadmapOfTopic(root, topic) {
  const link = topic.roadmap;
  if (!object(link) || !text(link.id)) return null;
  if (!isFile(roadmapFile(root, link.id))) return { link, roadmap: null, section: null };
  const roadmap = loadRoadmap(root, link.id);
  const section = sectionsOf(roadmap).find((s) => s.num === String(link.section)) ?? null;
  return { link, roadmap, section };
}

// --- progress ------------------------------------------------------------------

/** Status of one section: reference | not-started | in-progress | degraded | complete. */
export function sectionStatus(root, section) {
  if (!section.topic) return { status: 'reference', topic: null };
  const id = section.topic.id;
  if (!isFile(topicJsonPath(root, id))) return { status: 'not-started', topic: id };
  const topic = loadTopic(root, id);
  const outcome = completionOf(topic);
  const progress = progressOf(topic);
  const status = outcome.complete ? 'complete' : outcome.generation_finished ? 'degraded' : 'in-progress';
  return {
    status,
    topic: id,
    depth: topic.depth,
    wave: currentWave(topic),
    progress,
    failed_required: outcome.failed_required,
    site_url: siteUrl(topic),
    start_here: topicPaths(topic).start_here,
    linked: topic.roadmap?.id !== undefined,
  };
}

export function roadmapProgress(root, roadmap) {
  const rows = sectionsOf(roadmap).filter((s) => s.topic).map((section) => ({
    phase: section.phase.num,
    phase_title: section.phase.title,
    section: section.num,
    title: section.title,
    items: section.items.length,
    planned_depth: section.topic.depth,
    ...sectionStatus(root, section),
  }));
  const count = (status) => rows.filter((r) => r.status === status).length;
  const items = rows.reduce((sum, r) => sum + r.items, 0);
  const itemsDone = rows.filter((r) => r.status === 'complete').reduce((sum, r) => sum + r.items, 0);
  return {
    rows,
    totals: {
      topics: rows.length,
      complete: count('complete'),
      in_progress: count('in-progress'),
      degraded: count('degraded'),
      not_started: count('not-started'),
      items,
      items_covered: itemsDone,
    },
  };
}

/** The next section in roadmap order that is not complete (in-progress first, then the first not started). */
export function nextSection(root, roadmap) {
  const { rows } = roadmapProgress(root, roadmap);
  return rows.find((r) => r.status === 'in-progress') ?? rows.find((r) => r.status === 'not-started') ?? rows.find((r) => r.status === 'degraded') ?? null;
}

// --- the gate: every item of a section is a covered concept of its topic --------

/**
 * Problems for a topic linked to a roadmap section. Intake checks the mapping;
 * finalize additionally relies on curriculum coverage of the mapped concepts.
 */
export function roadmapTopicProblems(ctx, stage) {
  const link = ctx.topic.roadmap;
  if (link === undefined) return [];
  const problems = [];
  const fail = (problem) => problems.push(`roadmap: ${problem}`);
  if (!object(link) || !text(link.id) || !text(String(link.section ?? ''))) return ['roadmap: topic.roadmap must hold the roadmap id and section number'];
  if (!isFile(roadmapFile(ctx.root, link.id))) return [`roadmap: roadmap "${link.id}" does not exist at ${roadmapPaths(link.id).roadmap_json}`];
  const roadmap = loadRoadmap(ctx.root, link.id);
  const section = sectionsOf(roadmap).find((s) => s.num === String(link.section));
  if (!section) return [`roadmap: section ${link.section} is not in roadmap ${link.id}`];
  if (section.topic?.id !== ctx.topic.id) fail(`section ${section.num} of ${link.id} belongs to ${section.topic?.id ?? 'no topic'}, not ${ctx.topic.id}`);
  if (!['intake', 'finalize'].includes(stage)) return problems;

  const curriculum = ctx.topic.plan?.curriculum;
  if (!object(curriculum) || !Array.isArray(curriculum.concepts)) {
    fail(`plan.curriculum is required for a roadmap topic: add one concept per roadmap item of section ${section.num} (${section.items.length} items) with roadmap_items naming the item ids`);
    return problems;
  }
  const itemIds = new Set(section.items.map((i) => i.id));
  const coveredBy = new Map();
  for (const concept of curriculum.concepts.filter(object)) {
    if (concept.roadmap_items === undefined) continue;
    if (!Array.isArray(concept.roadmap_items) || !concept.roadmap_items.every(text)) { fail(`concept ${concept.id} roadmap_items must be a list of roadmap item ids`); continue; }
    for (const itemId of concept.roadmap_items) {
      if (!itemIds.has(itemId)) { fail(`concept ${concept.id} names roadmap item ${itemId}, which is not in section ${section.num}`); continue; }
      if (!coveredBy.has(itemId)) coveredBy.set(itemId, []);
      coveredBy.get(itemId).push(concept);
    }
  }
  for (const item of section.items) {
    const concepts = coveredBy.get(item.id) ?? [];
    const included = concepts.filter((c) => c.disposition === 'included');
    if (included.length === 0) {
      fail(`roadmap item ${item.id} ("${item.title}") is not mapped to an included curriculum concept; every roadmap item must be taught (add it to a concept's roadmap_items)`);
      continue;
    }
    if (item.level === 'adv' && !included.some((c) => COMPLEXITY_RANK[c.complexity] >= COMPLEXITY_RANK.intermediate)) {
      fail(`roadmap item ${item.id} is level adv, so a concept that covers it needs complexity intermediate or advanced (this makes the visual gate require a visual lesson)`);
    }
    if (item.level === 'core' && !included.some((c) => IMPORTANCE_RANK[c.importance] >= IMPORTANCE_RANK.core)) {
      fail(`roadmap item ${item.id} is level core, so a concept that covers it needs importance core or critical`);
    }
  }
  return problems;
}

// --- views -----------------------------------------------------------------------

const STATUS_LABEL = {
  complete: 'Notes ready',
  'in-progress': 'Being generated',
  degraded: 'Generated with gaps',
  'not-started': 'Not generated yet',
};

function htmlData(root, roadmap) {
  const { totals } = roadmapProgress(root, roadmap);
  const intro = [
    ...(roadmap.goal ? [roadmap.goal] : []),
    ...roadmap.intro,
    `**Generated notes:** ${totals.complete} of ${totals.topics} roadmap topics are ready (${totals.items_covered} of ${totals.items} items). Each section below links to its lesson once it is generated. Work top to bottom.`,
  ];
  const total = sectionsOf(roadmap).reduce((sum, s) => sum + s.items.length, 0);
  return {
    title: roadmap.title,
    intro,
    builtAt: today(),
    total,
    phases: roadmap.phases.map((phase) => ({
      id: phase.id,
      num: phase.num,
      title: phase.title,
      blurb: phase.blurb,
      sections: phase.sections.map((section) => {
        const state = sectionStatus(root, section);
        const notes = [...section.notes];
        if (section.topic) {
          const label = STATUS_LABEL[state.status];
          const lesson = state.status === 'not-started' ? '' : ` · [Open the lesson](${state.site_url})`;
          notes.unshift(`**Topic:** \`${section.topic.id}\` · depth ${state.depth ?? section.topic.depth} · **${label}**${lesson}`);
        }
        return {
          num: section.num,
          title: section.title,
          notes,
          items: section.items.map((item) => ({
            id: item.id,
            n: item.n,
            title: item.title,
            level: item.level,
            desc: item.desc,
            details: [
              ...item.details,
              ...(state.status !== 'not-started' && state.site_url ? [{ key: 'Notes', value: `[Lesson for this section](${state.site_url}) · Obsidian: \`${state.start_here}\`` }] : []),
            ],
          })),
        };
      }),
    })),
  };
}

const htmlAttr = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderRoadmapHtml(root, roadmap) {
  const template = readText(path.join(TEMPLATES_DIR, 'roadmap.html'));
  // `<` inside a script must not close it; JSON stays valid with the escape.
  const data = JSON.stringify(htmlData(root, roadmap)).replace(/</g, '\\u003c');
  const replacements = {
    '/*ROADMAP_TITLE*/': htmlAttr(roadmap.title),
    '/*ROADMAP_DESCRIPTION*/': htmlAttr(roadmap.goal || `Sequential roadmap: ${roadmap.title}`),
    '/*ROADMAP_BRAND*/': htmlAttr(roadmap.title),
    '/*ROADMAP_STORE_KEY*/': `tutor-roadmap:${roadmap.id}:v1`,
    '/*ROADMAP_DATA*/null': data,
  };
  let out = template;
  for (const [key, value] of Object.entries(replacements)) out = out.split(key).join(value);
  return out;
}

function vaultLink(target, label) {
  return `[[${target.replace(/^vault\//, '').replace(/\.md$/, '')}|${label.replace(/[|\]]/g, ' ')}]]`;
}

function renderRoadmapBody(root, roadmap) {
  const { rows, totals } = roadmapProgress(root, roadmap);
  const byNum = new Map(rows.map((r) => [r.section, r]));
  const out = [
    `Progress: **${totals.complete} of ${totals.topics}** topics have finished notes (${totals.items_covered} of ${totals.items} roadmap items).`,
    `Interactive checklist: run \`npm run site:dev\` and open \`${roadmapPaths(roadmap.id).html_url}\`.`,
    '',
  ];
  for (const phase of roadmap.phases) {
    out.push(`## ${phase.num} ${phase.title}`, '');
    if (phase.blurb) out.push(phase.blurb, '');
    for (const section of phase.sections) {
      const row = byNum.get(section.num);
      if (!row) {
        out.push(`### ${section.num} ${section.title}`, '', '_Reference section: no topic._', '');
        continue;
      }
      const done = row.status === 'complete' ? 'x' : ' ';
      const title = row.status === 'not-started' ? section.title : vaultLink(row.start_here, section.title);
      out.push(`- [${done}] **${section.num}** ${title} — ${STATUS_LABEL[row.status]} · ${section.items.length} items · \`${section.topic.id}\``);
      for (const item of section.items) out.push(`    - ${item.title} (${item.level})`);
    }
    out.push('');
  }
  return out.join('\n').trimEnd();
}

export function renderRoadmapNote(root, roadmap, existing = '') {
  const body = renderRoadmapBody(root, roadmap);
  if (existing.trim()) return replaceGeneratedRegion(existing, body);
  return [
    '---',
    `title: "${yamlEscape(roadmap.title)}"`,
    'type: roadmap',
    `roadmap: ${roadmap.id}`,
    `domain: ${roadmap.domain}`,
    `updated: ${today()}`,
    '---',
    '',
    `# ${roadmap.title}`,
    '',
    roadmap.goal || 'One sequential path through the field. Each section is one topic; work top to bottom.',
    '',
    '<!-- tutor:generated:start -->',
    body,
    '<!-- tutor:generated:end -->',
    '',
    INSIGHTS_HEADING,
    '',
  ].join('\n');
}

/** Write the HTML checklist and the vault note. Returns the written paths. */
export function writeRoadmapViews(root, roadmap) {
  const p = roadmapPaths(roadmap.id);
  const html = path.join(root, p.html);
  const note = path.join(root, p.vault_note);
  const nextHtml = renderRoadmapHtml(root, roadmap);
  if (!isFile(html) || readText(html) !== nextHtml) writeTextAtomic(html, nextHtml);
  const existing = isFile(note) ? readText(note) : '';
  const nextNote = renderRoadmapNote(root, roadmap, existing);
  if (nextNote !== existing) writeTextAtomic(note, nextNote);
  return [p.html, p.vault_note];
}

/** Refresh the views of every roadmap that contains this topic id (or all when null). */
export function refreshRoadmapViews(root, topicIdOrNull = null) {
  const written = [];
  for (const slug of scanRoadmapIds(root)) {
    let roadmap;
    try { roadmap = loadRoadmap(root, slug); } catch { continue; }
    if (topicIdOrNull && !sectionsOf(roadmap).some((s) => s.topic?.id === topicIdOrNull)) continue;
    written.push(...writeRoadmapViews(root, roadmap));
  }
  return written;
}
