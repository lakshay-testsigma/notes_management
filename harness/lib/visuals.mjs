// The visual registry of a topic (state/topics/<id>/visuals.json) and its
// export to the Obsidian vault. One entry ties a visual explanation to the
// concepts it teaches, the sources that support it, the files that show it,
// and a learning check that tests whether it helps. Every stage uses the same
// registry, so a diagram drawn once is reused by the site, the vault, and the
// final notes. Contract: harness/rubrics/visuals.md.

import fs from 'node:fs';
import path from 'node:path';
import { today } from './clock.mjs';
import { isFile, readJson, readText, writeJsonAtomic, writeTextAtomic } from './io.mjs';
import { splitFrontmatter, yamlEscape } from './markdown.mjs';
import { readSources } from './sources.mjs';
import { lessonPageUrl, siteUrl, topicPaths } from './topic-store.mjs';
import { probeMp4 } from './media-files.mjs';

export const VISUAL_KINDS = [
  'architecture', 'workflow', 'sequence', 'state-machine', 'data-flow', 'request-flow', 'timeline', 'lifecycle',
  'concept-map', 'dependency-graph', 'decision-tree', 'flowchart', 'algorithm', 'layered', 'comparison',
  'deployment', 'chart', 'illustration', 'simulation', 'video', 'presentation', 'experience',
];
export const VISUAL_FORMATS = ['mermaid', 'svg', 'image', 'component', 'hyperframes', 'hyperframes-slideshow', 'experience'];
export const VIDEO_STATUSES = ['planned', 'storyboard', 'rendered'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MERMAID_TYPES = /^(flowchart|graph|sequenceDiagram|stateDiagram(-v2)?|classDiagram|erDiagram|timeline|journey|gantt|mindmap|pie|quadrantChart|xychart-beta|block-beta|architecture-beta|requirementDiagram|gitGraph|sankey-beta)\b/;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const words = (value) => (text(value) ? value.trim().split(/\s+/).length : 0);

/** Minimum number of registered lesson visuals per depth for a visual-first plan. */
export const LESSON_VISUAL_MINIMUM = { quick: 2, standard: 3, deep: 5 };

export function visualsFile(root, topic) {
  return path.join(root, topicPaths(topic).visuals_json);
}

/** Returns { entries, error }. A missing file is an empty registry. */
export function readVisuals(root, topic) {
  const file = visualsFile(root, topic);
  if (!isFile(file)) return { entries: [], error: null };
  try {
    const data = readJson(file);
    if (!Array.isArray(data)) return { entries: [], error: 'is not a JSON array' };
    return { entries: data, error: null };
  } catch (error) {
    return { entries: [], error: `does not parse: ${error.message}` };
  }
}

export function writeVisuals(root, topic, entries) {
  writeJsonAtomic(visualsFile(root, topic), entries);
}

/** Concept ids from plan.curriculum, or null when the plan has no curriculum. */
export function curriculumIds(topic) {
  const concepts = topic.plan?.curriculum?.concepts;
  return Array.isArray(concepts) ? new Set(concepts.map((c) => c?.id).filter(text)) : null;
}

/**
 * Problems of one entry, as plain strings. `options.sourceIds` (Set) and
 * `options.conceptIds` (Set or null) come from the topic; `options.root` lets
 * file checks run. Shape-only checks run when root is omitted.
 */
export function visualEntryProblems(entry, { sourceIds = null, conceptIds = null, root = null, topic = null } = {}) {
  const problems = [];
  const fail = (problem) => problems.push(problem);
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return ['entry must be an object'];
  if (!text(entry.id) || !ID.test(entry.id)) fail('`id` must be lowercase words joined by dashes');
  if (!text(entry.title) || words(entry.title) < 3) fail('`title` must describe what the visual shows (3+ words)');
  if (!VISUAL_KINDS.includes(entry.kind)) fail(`\`kind\` must be one of ${VISUAL_KINDS.join(', ')}`);
  if (!VISUAL_FORMATS.includes(entry.format)) fail(`\`format\` must be one of ${VISUAL_FORMATS.join(', ')}`);
  if (!text(entry.purpose)) fail('`purpose` must say what the learner should understand from it');
  if (words(entry.explanation) < 8 || words(entry.explanation) > 90) fail('`explanation` must be a short accompanying explanation (8–90 words)');
  if (words(entry.alt) < 12) fail('`alt` must be a text alternative that states the structure and the conclusion (12+ words)');
  if (!Array.isArray(entry.concept_ids) || entry.concept_ids.length === 0 || !entry.concept_ids.every(text)) fail('`concept_ids` must list the concepts it teaches');
  else if (conceptIds) {
    const unknown = entry.concept_ids.filter((id) => !conceptIds.has(id));
    if (unknown.length) fail(`\`concept_ids\` has ids not in plan.curriculum: ${unknown.join(', ')}`);
  }
  if (!Array.isArray(entry.source_ids) || entry.source_ids.length === 0 || !entry.source_ids.every(text)) {
    fail('`source_ids` must list the vetted sources that support every relationship it shows');
  } else if (sourceIds) {
    const unknown = entry.source_ids.filter((id) => !sourceIds.has(id));
    if (unknown.length) fail(`\`source_ids\` has ids not in sources.json: ${unknown.join(', ')}`);
  }
  const check = entry.learning_check;
  if (!check || !text(check.question) || !text(check.answer)) fail('`learning_check` needs a `question` the visual should let the learner answer, and its `answer`');
  if (!Array.isArray(entry.used_in) || entry.used_in.length === 0 || !entry.used_in.every(text)) fail('`used_in` must list the repository-relative files that show it');
  if (entry.kind === 'workflow' && !['end-to-end', 'stage', 'detail'].includes(entry.scope)) fail('a workflow needs `scope`: end-to-end, stage or detail');
  if (entry.format === 'component' && !text(entry.component)) fail('`component` must name the lesson component that renders it');
  if (['mermaid', 'svg', 'image'].includes(entry.format) && !text(entry.file)) fail('`file` must point to the asset in the topic\'s visuals/assets folder');
  if (entry.format === 'hyperframes' || entry.kind === 'video') {
    if (entry.format !== 'hyperframes' || entry.kind !== 'video') fail('a video has kind `video` and format `hyperframes`');
    const video = entry.video;
    if (!video || typeof video !== 'object') fail('a video needs a `video` object (written by `tutor video build`)');
    else {
      if (!VIDEO_STATUSES.includes(video.status)) fail(`\`video.status\` must be one of ${VIDEO_STATUSES.join(', ')}`);
      if (!text(video.project_dir)) fail('`video.project_dir` must name the HyperFrames project folder');
      if (video.status !== 'rendered' && !text(video.blocker)) fail('a video that is not rendered needs `video.blocker`: what stopped the render');
    }
  }
  if (entry.format === 'hyperframes-slideshow' || entry.kind === 'presentation') {
    if (entry.format !== 'hyperframes-slideshow' || entry.kind !== 'presentation') fail('a deck has kind `presentation` and format `hyperframes-slideshow`');
    if (!entry.deck || typeof entry.deck !== 'object') fail('a deck needs a `deck` object (written by `tutor deck build`)');
  }
  if (entry.format === 'experience' || entry.kind === 'experience') {
    if (entry.format !== 'experience' || entry.kind !== 'experience') fail('an experience has kind `experience` and format `experience`');
    if (!entry.experience || typeof entry.experience !== 'object') fail('an experience needs an `experience` object (written by `tutor experience build`)');
  }
  if (root && topic) problems.push(...visualFileProblems(root, topic, entry));
  return problems;
}

/** File checks: the asset exists inside the topic's assets folder and is usable. */
export function visualFileProblems(root, topic, entry) {
  const problems = [];
  const paths = topicPaths(topic);
  for (const used of Array.isArray(entry.used_in) ? entry.used_in : []) {
    if (text(used) && !fs.existsSync(path.join(root, used))) problems.push(`\`used_in\` file ${used} does not exist`);
  }
  if (text(entry.file)) {
    const inside = entry.file.startsWith(`${paths.visual_assets_dir}/`);
    if (!inside) problems.push(`\`file\` must be inside ${paths.visual_assets_dir}/`);
    if (!new RegExp(`-${topic.slug}\\.(mmd|svg|png|jpe?g|webp|gif)$`).test(entry.file)) problems.push(`\`file\` must be named \`<id>-${topic.slug}.<ext>\` so Obsidian resolves it uniquely`);
    const file = path.join(root, entry.file);
    if (!isFile(file)) problems.push(`\`file\` ${entry.file} does not exist`);
    else if (entry.format === 'mermaid') problems.push(...mermaidProblems(readText(file)));
    else if (entry.format === 'svg') problems.push(...svgProblems(readText(file)));
    else if (entry.format === 'image' && !/\.(png|jpe?g|webp|gif)$/i.test(entry.file)) problems.push('an image must be .png, .jpg, .webp or .gif');
  }
  if (entry.format === 'hyperframes' && entry.video && typeof entry.video === 'object') {
    const video = entry.video;
    if (text(video.project_dir) && !fs.existsSync(path.join(root, video.project_dir, 'video.json'))) problems.push(`${video.project_dir}/video.json is missing`);
    if (video.status === 'rendered') {
      for (const key of ['mp4', 'captions', 'transcript']) {
        if (!text(video[key]) || !isFile(path.join(root, video[key]))) problems.push(`rendered video needs an existing \`video.${key}\``);
      }
      if (text(video.mp4) && isFile(path.join(root, video.mp4))) {
        const probe = probeMp4(path.join(root, video.mp4));
        if (!probe.ok) problems.push(`\`video.mp4\` is not a playable MP4: ${probe.problem}`);
        else if (typeof video.duration_s === 'number' && Math.abs(probe.duration - video.duration_s) > 1.5) {
          problems.push(`\`video.mp4\` lasts ${probe.duration.toFixed(1)} s but the storyboard says ${video.duration_s} s; render again`);
        }
      }
      if (text(video.input_hash) && text(video.rendered_hash) && video.input_hash !== video.rendered_hash) {
        problems.push('the storyboard changed after the last render; run `tutor video <topic> render <id>`');
      }
    }
  }
  return problems;
}

export function mermaidProblems(source) {
  const lines = source.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('%%'));
  if (!lines.length) return ['the mermaid file is empty'];
  const problems = [];
  if (!MERMAID_TYPES.test(lines[0])) problems.push(`the mermaid file starts with "${lines[0].slice(0, 30)}", not a diagram type such as flowchart or sequenceDiagram`);
  if (lines.length < 3) problems.push('the mermaid diagram has fewer than two relationships; a sentence is clearer');
  if (/click\s+\w+\s+(call|href)/.test(source)) problems.push('mermaid `click` callbacks are not allowed (strict security level)');
  return problems;
}

export function svgProblems(source) {
  const problems = [];
  if (!/<svg[\s>]/i.test(source)) problems.push('the SVG file has no <svg> element');
  if (!/viewBox\s*=/.test(source)) problems.push('the SVG needs a `viewBox` so it scales on mobile');
  if (!/<title[\s>]/i.test(source)) problems.push('the SVG needs a <title> for screen readers');
  if (/<script[\s>]/i.test(source) || /\son[a-z]+\s*=/i.test(source)) problems.push('the SVG must not contain scripts or event handlers');
  if (/(xlink:)?href\s*=\s*["']https?:/i.test(source)) problems.push('the SVG must not load external resources');
  if (!/<text[\s>]/i.test(source)) problems.push('the SVG has no <text> labels');
  if (source.length > 300_000) problems.push('the SVG is larger than 300 KB; simplify it');
  return problems;
}

/** Which stage owns a file listed in `used_in`. */
export function stageOfFile(topic, file) {
  const p = topicPaths(topic);
  if (file.startsWith(`${p.lessons_dir}/`) || file === p.lesson || file.startsWith(`${p.curriculum_dir}/`)) return 'lesson';
  if (file === p.brief) return 'brief';
  if (file.startsWith(`${p.digests_dir}/`)) return 'digest';
  if (file.startsWith(`${p.repo_intel_dir}/`)) return 'repo-intel';
  if (file.startsWith(`${p.capstone_dir}/`) || file === p.capstone) return 'capstone';
  if (file.startsWith(`${p.projects_dir}/mini-`) || file === p.mini_projects) return 'mini-projects';
  if (file === p.final_notes || file === p.recall) return 'notes';
  return null;
}

export function entriesForStage(topic, entries, stage) {
  return entries.filter((entry) => Array.isArray(entry.used_in) && entry.used_in.some((file) => stageOfFile(topic, file) === stage));
}

// --- vault export --------------------------------------------------------------

const KIND_LABELS = {
  experience: 'Interactive experiences', presentation: 'Branching presentations',
  'concept-map': 'Concept map', 'dependency-graph': 'Dependency graph', 'state-machine': 'State machine',
  'data-flow': 'Data flow', 'request-flow': 'Request flow', 'decision-tree': 'Decision tree',
};
const label = (kind) => KIND_LABELS[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1);

export function visualNoteName(topic, id) {
  return `visual-${id}-${topic.slug}`;
}

/** Keep everything from `## My insights` down, exactly as it is. */
function keepInsights(file) {
  if (!isFile(file)) return { created: today(), tail: '## My insights\n' };
  const existing = readText(file);
  const created = splitFrontmatter(existing).data?.created ?? today();
  const match = /^## My insights\s*$/m.exec(existing);
  return { created: String(created), tail: match ? existing.slice(match.index) : '## My insights\n' };
}

function noteFor(file) {
  return path.basename(file).replace(/\.mdx?$/, '');
}

/** Where a `used_in` file is shown: a wikilink for vault notes, the site path for lessons, the path otherwise. */
function usedInLine(topic, file) {
  const p = topicPaths(topic);
  if (file.startsWith('vault/') && file.endsWith('.md')) return `[[${noteFor(file)}]]`;
  if (file.startsWith(`${p.lessons_dir}/`)) return `lesson page \`${lessonPageUrl(topic, path.basename(file))}\` (file \`${file}\`)`;
  return `\`${file}\``;
}

function conceptLinks(root, topic, ids) {
  const titles = new Map((topic.plan?.curriculum?.concepts ?? []).map((c) => [c.id, c.title]));
  return ids.map((id) => {
    const title = titles.get(id) ?? id;
    const shared = path.join(root, 'vault', '_concepts', `${title}.md`);
    return isFile(shared) ? `[[${title}]]` : title;
  });
}

function renderVisualNote(root, topic, entry, sourcesById) {
  const p = topicPaths(topic);
  const out = [];
  out.push(`# ${entry.title}`, '', `**${label(entry.kind)}** · teaches ${conceptLinks(root, topic, entry.concept_ids ?? []).join(', ')}`, '');
  out.push(`**Why this visual.** ${entry.purpose}`, '');
  if (entry.format === 'mermaid' && entry.file && isFile(path.join(root, entry.file))) {
    out.push('```mermaid', readText(path.join(root, entry.file)).trim(), '```', '');
  } else if ((entry.format === 'svg' || entry.format === 'image') && entry.file) {
    out.push(`![[${path.basename(entry.file)}]]`, '');
  } else if (entry.format === 'component') {
    const page = (entry.used_in ?? []).find((f) => f.startsWith(`${p.lessons_dir}/`));
    out.push(`Interactive \`${entry.component}\`. Open it on the lesson site: ${page ? `\`${lessonPageUrl(topic, path.basename(page))}\`` : `\`${siteUrl(topic)}\``}. Run \`npm run site:dev\` first.`, '');
  } else if (entry.format === 'hyperframes' && entry.video) {
    const video = entry.video;
    if (video.status === 'rendered') {
      out.push(`Video (${Math.round(video.duration_s ?? 0)} s): \`${video.mp4}\`, captions \`${video.captions}\`. On the site: \`${video.url ?? siteUrl(topic)}\`.`, '');
    } else {
      out.push(`Video status: **${video.status}**. ${video.blocker ?? ''} The storyboard is in \`${video.project_dir}/storyboard.md\`.`, '');
    }
    out.push(`HyperFrames project: \`${video.project_dir}\` (editable: change \`video.json\`, then \`tutor video ${topic.id} build ${entry.id}\`). Storyboard: \`${video.project_dir}/storyboard.md\`.`, '');
    if (video.composition_url) out.push(`Interactive composition for the site player: \`${video.composition_url}\`.`, '');
    if (video.transcript && isFile(path.join(root, video.transcript))) {
      const transcript = readText(path.join(root, video.transcript)).replace(/^# .*\n+/, '').trim();
      out.push('## Transcript', '', transcript, '');
    }
  }
  if (entry.format === 'hyperframes-slideshow' && entry.deck) out.push(...deckNoteLines(root, topic, entry));
  if (entry.format === 'experience' && entry.experience) out.push(...experienceNoteLines(root, topic, entry));
  out.push('## What it shows', '', entry.explanation, '', `Text alternative: ${entry.alt}`, '');
  out.push('## Check yourself', '', entry.learning_check?.question ?? '', '', `Answer: ${entry.learning_check?.answer ?? ''}`, '');
  out.push('## Sources', '');
  for (const id of entry.source_ids ?? []) {
    const source = sourcesById.get(id);
    out.push(source ? `- ${source.title} — ${source.url} (\`${id}\`)` : `- \`${id}\``);
  }
  out.push('', '## Used in', '', ...(entry.used_in ?? []).map((file) => `- ${usedInLine(topic, file)}`), '');
  out.push(`Back to [[visuals-${topic.slug}|all visuals]].`, '');
  return out.join('\n');
}

const MODE_NAMES = { explainer: 'Explainer video (Mode A)', interactive: 'Interactive video lesson (Mode B)', branching: 'Branching presentation (Mode C)', hybrid: 'Hybrid learning lab (Mode D)' };
const TAB_NAMES = { watch: 'Watch', explore: 'Explore', guided: 'Guided', deepdive: 'Deep dive', practice: 'Practice' };

function deckNoteLines(root, topic, entry) {
  const deck = entry.deck;
  const out = [`Branching presentation (HyperFrames slideshow), ${deck.slides ?? '?'} main slides and ${(deck.branches ?? []).length} deep dives: ${(deck.branches ?? []).map((b) => `"${b.label}"`).join(', ')}. Status: **${deck.status}**.`, ''];
  out.push(`Editable project: \`${deck.project_dir}\` (change \`deck.json\`, then \`tutor deck ${topic.id} build ${entry.id}\`). Present it live: \`${deck.present_command}\`.`, '');
  if (deck.composition_url) out.push(`On the site it opens in the Deep dive tab of its experience; composition \`${deck.composition_url}\`.`, '');
  for (const shot of deck.snapshots ?? []) out.push(`![[${path.basename(shot)}]]`);
  if ((deck.snapshots ?? []).length) out.push('');
  if (deck.outline && isFile(path.join(root, deck.outline))) {
    out.push('## Outline', '', readText(path.join(root, deck.outline)).replace(/^# .*\n+/, '').replace(/^## /gm, '### ').trim(), '');
  }
  return out;
}

function experienceNoteLines(root, topic, entry) {
  const exp = entry.experience;
  const page = (entry.used_in ?? [])[0];
  const out = [`**${MODE_NAMES[exp.mode] ?? exp.mode}** · level ${exp.level ?? '?'} · modes ${(exp.tabs ?? []).map((t) => TAB_NAMES[t] ?? t).join(', ')}.`, ''];
  if (page) out.push(`Open it on the lesson site: \`${lessonPageUrl(topic, path.basename(page))}\`. Run \`npm run site:dev\` first.`, '');
  const parts = exp.parts ?? {};
  const link = (id) => `[[${visualNoteName(topic, id)}|${id}]]`;
  const lines = [];
  if (parts.watch) lines.push(`- Intro explainer: ${link(parts.watch)}`);
  if (parts.guided) lines.push(`- Guided walkthrough (HyperFrames composition): ${link(parts.guided)}`);
  if (parts.simulation) lines.push(`- Simulation: \`${parts.simulation}\` with named presets`);
  if (parts.deck) lines.push(`- Branching deep dives: ${link(parts.deck)}`);
  if (parts.summary_video) lines.push(`- Final animated summary: ${link(parts.summary_video)}`);
  if (exp.fallback_visual) lines.push(`- Static fallback: ${link(exp.fallback_visual)}`);
  if (lines.length) out.push('## Parts', '', ...lines, '');
  out.push(`Lesson definition: \`${exp.project_dir}/experience.json\` (rebuild with \`tutor experience ${topic.id} build ${entry.id}\`).`, '');
  if (exp.built && isFile(path.join(root, exp.built))) {
    try {
      const built = JSON.parse(readText(path.join(root, exp.built)));
      if (built.checkpoints?.length) {
        out.push('## Checkpoints', '');
        for (const cp of built.checkpoints) {
          const right = (cp.choices ?? []).find((c) => c.correct);
          out.push(`- **${cp.kind}.** ${cp.prompt}${right ? ` Answer: ${right.text}.` : ''} ${cp.explanation}`);
        }
        out.push('');
      }
    } catch { /* the validator reports a broken built file */ }
  }
  const prereqs = prerequisiteTitles(topic, entry.concept_ids ?? []);
  if (prereqs.length) out.push(`Needs first: ${conceptLinks(root, topic, prereqs).join(', ')}.`, '');
  return out;
}

function prerequisiteTitles(topic, ids) {
  const concepts = topic.plan?.curriculum?.concepts ?? [];
  const byId = new Map(concepts.map((c) => [c.id, c]));
  return [...new Set(ids.flatMap((id) => byId.get(id)?.prerequisites ?? []))].filter((id) => byId.has(id));
}

/** Mermaid concept dependency graph from plan.curriculum (parents and prerequisites). */
export function conceptMapMermaid(topic) {
  const concepts = (topic.plan?.curriculum?.concepts ?? []).filter((c) => c && c.disposition === 'included' && text(c.id));
  if (concepts.length < 2) return null;
  const ids = new Set(concepts.map((c) => c.id));
  const safe = (id) => id.replace(/-/g, '_');
  const lines = ['flowchart TD'];
  for (const c of concepts) lines.push(`  ${safe(c.id)}["${String(c.title ?? c.id).replace(/"/g, "'")}"]`);
  for (const c of concepts) {
    if (c.parent && ids.has(c.parent)) lines.push(`  ${safe(c.parent)} --> ${safe(c.id)}`);
    for (const pre of Array.isArray(c.prerequisites) ? c.prerequisites : []) {
      if (ids.has(pre)) lines.push(`  ${safe(pre)} -. needed for .-> ${safe(c.id)}`);
    }
  }
  return lines.join('\n');
}

function frontmatter(topic, title, created, extra = {}) {
  const lines = ['---', `title: "${yamlEscape(title)}"`, `topic: ${topic.id}`, 'stage: visual', `tags: [${topic.domain}, ${topic.subdomain}, visual]`, `created: ${created}`];
  for (const [key, value] of Object.entries(extra)) if (Array.isArray(value) && value.length) lines.push(`${key}: [${value.join(', ')}]`);
  lines.push('---', '');
  return lines.join('\n');
}

/**
 * Write the vault notes for every registered visual: one note per visual,
 * the index `visuals-<slug>.md`, and the concept map when the plan has a
 * curriculum. Learner text under `## My insights` is kept byte for byte.
 * Notes of visuals that are no longer registered are left alone.
 * Returns the written paths.
 */
export function exportVisuals(root, topic) {
  const p = topicPaths(topic);
  const { entries, error } = readVisuals(root, topic);
  const conceptMap = conceptMapMermaid(topic);
  if (error || (entries.length === 0 && !conceptMap && !topic.plan?.visual_first)) return [];
  const sourcesById = new Map(readSources(root, topic).entries.map((s) => [s.id, s]));
  const written = [];
  const write = (relative, body, title, extra) => {
    const file = path.join(root, relative);
    const { created, tail } = keepInsights(file);
    const next = `${frontmatter(topic, title, created, extra)}${body.trimEnd()}\n\n${tail}`;
    if (!isFile(file) || readText(file) !== next) writeTextAtomic(file, next);
    written.push(relative);
  };

  for (const entry of entries) {
    if (!text(entry?.id)) continue;
    write(`${p.visuals_dir}/${visualNoteName(topic, entry.id)}.md`, renderVisualNote(root, topic, entry, sourcesById), entry.title ?? entry.id, { sources: entry.source_ids ?? [] });
  }
  if (conceptMap) {
    write(`${p.visuals_dir}/concept-map-${topic.slug}.md`, [
      `# Concept map of ${topic.title}`, '',
      'Generated from the research curriculum. A solid arrow points from a concept to the concept that refines it; a dotted arrow shows a prerequisite.', '',
      '```mermaid', conceptMap, '```', '', `Back to [[visuals-${topic.slug}|all visuals]].`, '',
    ].join('\n'), `Concept map of ${topic.title}`);
  }

  const byKind = new Map();
  for (const entry of entries.filter((e) => text(e?.id))) {
    if (!byKind.has(entry.kind)) byKind.set(entry.kind, []);
    byKind.get(entry.kind).push(entry);
  }
  const index = [`# Visuals of ${topic.title}`, '', 'Every diagram, simulation and video of this topic, with the concepts it teaches and the sources behind it. Open one, answer its check question, then read the explanation.', ''];
  if (conceptMap) index.push(`- [[concept-map-${topic.slug}|Concept map]] — how the concepts of this topic depend on each other`, '');
  for (const [kind, list] of byKind) {
    index.push(`## ${label(kind)}`, '');
    for (const entry of list) {
      const status = entry.format === 'hyperframes' ? ` · video ${entry.video?.status ?? 'planned'}`
        : entry.format === 'experience' ? ` · ${MODE_NAMES[entry.experience?.mode] ?? 'experience'}`
          : entry.format === 'hyperframes-slideshow' ? ` · deck ${entry.deck?.status ?? 'built'}` : '';
      index.push(`- [[${visualNoteName(topic, entry.id)}|${entry.title}]] — ${entry.purpose}${status}`);
    }
    index.push('');
  }
  if (!entries.length) index.push('No visual is registered yet.', '');
  write(p.visuals_index, index.join('\n'), `Visuals of ${topic.title}`);
  return written;
}
