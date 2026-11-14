// `tutor map`: regenerates the topic map (00-start-here), the resources note
// (09-resources), the domain map, and vault/Home.md.
// Only the region between the generated markers is replaced.
// It also keeps two things in sync: the notes of skipped stages
// (stage-notes.mjs) and the backlinks of shared notes (backlinks.mjs).

import { buildVaultIndex } from './vault-index.mjs';
import path from 'node:path';
import { isFile, listDirs, listFiles, readText, writeTextAtomic } from './io.mjs';
import { replaceGeneratedRegion, yamlEscape } from './markdown.mjs';
import { renderTemplate, topicVars, TOPIC_TEMPLATES, SHARED_TEMPLATES } from './templates.mjs';
import { lessonPageUrl, loadAllTopics, openLessonLine, topicPaths } from './topic-store.mjs';
import { syncBacklinks } from './backlinks.mjs';
import { skipInfo, syncStageNotes } from './stage-notes.mjs';
import { listPackIds, tryLoadPack } from './packs.mjs';
import { isOmitted, progressOf, runnableStages } from './stages.mjs';
import { readSources, SOURCE_TYPES, SOURCE_TYPE_LABELS } from './sources.mjs';
import { today } from './clock.mjs';
import { CLI } from './root.mjs';

/** Reading order 01 -> 09: which note, and which stage produces it. */
export const READING_ORDER = [
  { key: 'brief', stage: 'brief', label: 'Brief', short: 'brief', blurb: 'what it is, why it exists, where it is used' },
  { key: 'lesson', stage: 'lesson', label: 'Interactive lesson', short: 'lesson', blurb: 'the animated lesson pages on the local site' },
  { key: 'mini_projects', stage: 'mini-projects', label: 'Mini projects', short: 'mini projects', blurb: 'small builds with a real use case' },
  { key: 'digests_index', stage: 'digest', label: 'Digests', short: 'digests', blurb: 'short summaries of the key papers and docs' },
  { key: 'repo_intel_index', stage: 'repo-intel', label: 'Repository deep dive', short: 'repo deep dive', blurb: 'how a production open-source project does it' },
  { key: 'capstone', stage: 'capstone', label: 'Capstone', short: 'capstone', blurb: 'the production-style project' },
  { key: 'final_notes', stage: 'notes', label: 'Final notes', short: 'final notes', blurb: 'the one-page refresher' },
  { key: 'recall', stage: 'notes', label: 'Recall cards', short: 'recall cards', blurb: 'flashcards for spaced review' },
  { key: 'resources', stage: 'research', label: 'Resources', short: 'resources', blurb: 'the vetted sources behind everything above' },
];

/**
 * The reading order of one topic: only the steps the topic has (a step whose
 * stage is skipped is left out). Returns { steps: [{ n, step, label, path, note }], line }
 * where `line` is "01 brief → 02 lesson → …", ready to copy into a message.
 */
export function readingOrderOf(topic) {
  const paths = topicPaths(topic);
  const statusOf = (stageId) => topic.stages.find((s) => s.id === stageId)?.status ?? 'pending';
  const steps = READING_ORDER
    .map((step, index) => ({
      n: String(index + 1).padStart(2, '0'),
      step: step.short,
      label: step.label,
      stage: step.stage,
      path: paths[step.key],
      note: noteName(paths[step.key]),
    }))
    .filter((step) => !isOmitted(topic.stages.find(s=>s.id===step.stage)??{}));
  return { steps, line: steps.map((step) => `${step.n} ${step.step}`).join(' → ') };
}

const STATUS_WORDS = {
  pending: 'not started',
  in_progress: 'in progress',
  done: 'ready',
  skipped: 'skipped',
  failed: 'needs another try',
};

function noteName(relativePath) {
  return path.basename(relativePath, '.md');
}

let linkIndex;
function link(relativePath, shown) {
  const name=noteName(relativePath);
  const target=(linkIndex?.matches.get(name)?.length??0)>1?relativePath.replace(/^vault\//,'').replace(/\.md$/,''):name;
  return `[[${target}|${shown}]]`;
}

/** Write a note's generated region, creating the note from its template when it is missing or empty. */
function writeGenerated(file, template, vars, content) {
  const existing = isFile(file) ? readText(file) : '';
  const current = existing.trim() ? existing : renderTemplate(template, vars);
  const next = replaceGeneratedRegion(current, content);
  if (next !== existing) writeTextAtomic(file, next);
}

/** Regenerate every map that mentions this topic. Returns the files touched. */
export function refreshMaps(root, topic) {
  linkIndex=buildVaultIndex(root);
  return refreshTopic(root, topic).written;
}

/**
 * Everything `tutor map <topic>` does. Returns {
 *   written      the regenerated maps
 *   stage_notes  notes of skipped (or re-activated) stages whose scaffold text was switched
 *   backlinks    [{ note, added }] bullets added under "Where it shows up" of shared notes
 * }
 */
export function refreshTopic(root, topic) {
  linkIndex=buildVaultIndex(root);
  const paths = topicPaths(topic);
  const vars = topicVars(topic);

  const stageNotes = syncStageNotes(root, topic);
  writeGenerated(path.join(root, paths.start_here), TOPIC_TEMPLATES.start_here, vars, renderStartHere(root, topic));
  writeGenerated(path.join(root, paths.resources), TOPIC_TEMPLATES.resources, vars, renderResources(root, topic));
  const shared = refreshSharedMaps(root, [topic.domain]);
  const backlinks = syncBacklinks(root, topic);
  return { written: [paths.start_here, paths.resources, ...shared], stage_notes: stageNotes, backlinks };
}

/** Regenerate the domain maps (all domains that have topics, or the given ones) and Home. */
export function refreshSharedMaps(root, onlyDomains = null) {
  linkIndex=buildVaultIndex(root);
  const topics = loadAllTopics(root);
  const domains = onlyDomains ?? [...new Set(topics.map((t) => t.domain))];
  const written = [];

  for (const domain of domains) {
    const inDomain = topics.filter((t) => t.domain === domain);
    if (inDomain.length === 0 && !isFile(path.join(root, 'vault', domain, `${domain}.md`))) continue;
    const pack = tryLoadPack(root, domain);
    const title = pack?.title ?? domain;
    const vars = {
      title,
      title_yaml: yamlEscape(title),
      domain,
      description: pack?.description ?? '',
      date: today(),
    };
    const relative = `vault/${domain}/${domain}.md`;
    writeGenerated(path.join(root, relative), SHARED_TEMPLATES.domain_map, vars, renderDomainMap(inDomain, pack));
    written.push(relative);
  }

  writeGenerated(path.join(root, 'vault', 'Home.md'), SHARED_TEMPLATES.home, { date: today() }, renderHome(root, topics));
  written.push('vault/Home.md');
  return written;
}

// --- 00-start-here ----------------------------------------------------------

function renderStartHere(root, topic) {
  const paths = topicPaths(topic);
  const plan = topic.plan ?? {};
  const progress = progressOf(topic);
  const statusOf = (stageId) => topic.stages.find((s) => s.id === stageId)?.status ?? 'pending';
  const out = [];

  out.push(`**Depth:** ${topic.depth} · **Progress:** ${progress.finished} of ${progress.total} steps ready`);
  if (plan.summary) out.push('', plan.summary);

  out.push('', '## Read in this order', '');
  READING_ORDER.forEach((step, index) => {
    const stage = topic.stages.find((s) => s.id === step.stage);
    if (stage?.status === 'skipped') {
      // No link: the note of a skipped step has nothing to read.
      out.push(`${index + 1}. ${step.label} — ${skipInfo(root, topic, stage).short}.`);
      return;
    }
    out.push(
      `${index + 1}. ${link(paths[step.key], step.label)} — ${step.blurb} · *${STATUS_WORDS[statusOf(step.stage)]}*`,
    );
  });
  out.push('', `Your own additions live in ${link(paths.insights, 'My insights')}.`);

  const hasLesson = statusOf('lesson') !== 'skipped';
  if (hasLesson) out.push('', '## Open the lesson', '', openLessonLine(topic));

  const prerequisites = Array.isArray(plan.prerequisites) ? plan.prerequisites : [];
  if (prerequisites.length > 0) {
    out.push('', '## Before you start', '');
    for (const item of prerequisites) {
      const state = item.known ? 'you already know this' : 'new for you';
      const bridge = item.bridge ? ` — ${item.bridge}` : '';
      out.push(`- **${item.concept}** (${state})${bridge}`);
    }
  }

  const outcomes = Array.isArray(plan.outcomes) ? plan.outcomes : [];
  if (outcomes.length > 0) {
    out.push('', '## What you will be able to do', '');
    for (const outcome of outcomes) out.push(`- ${outcome}`);
  }

  const outline = Array.isArray(plan.lesson_outline) ? plan.lesson_outline : [];
  if (hasLesson && outline.length > 0) {
    // Each page with its site path: the file on disk when it is written, else the planned name.
    const onDisk = listFiles(path.join(root, paths.lessons_dir)).filter((name) => name.endsWith('.mdx'));
    out.push('', '## Lesson pages', '');
    [...outline]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((page, index) => {
        const number = String(page.order ?? index + 1).padStart(2, '0');
        const file = onDisk.find((name) => name.startsWith(`${number}-`)) ?? `${number}-${page.slug}`;
        out.push(`${index + 1}. ${page.title ?? page.slug} — \`${lessonPageUrl(topic, file)}\``);
      });
  }

  const curriculum = plan.curriculum;
  if (curriculum && Array.isArray(curriculum.concepts)) {
    out.push('', '## Research scope and concept notes', '', String(curriculum.scope ?? ''));
    for (const concept of curriculum.concepts.filter(c => c && typeof c === 'object')) {
      const coverage = Array.isArray(concept.coverage) ? concept.coverage : [];
      const files = [...new Set(coverage.map(c => c?.path).filter(f => typeof f === 'string' && f.startsWith(paths.vault_dir + '/') && isFile(path.join(root, f))))];
      const notes = files.map(f => link(f, concept.title ?? concept.id)).join(', ');
      out.push(`- ${concept.title ?? concept.id}: ${concept.disposition ?? 'planned'}${notes ? ` — ${notes}` : ''}${concept.reason ? ` — ${concept.reason}` : ''}`);
    }
    const rounds = Array.isArray(curriculum.discovery) ? curriculum.discovery : [];
    const last = rounds.at(-1);
    if (last?.stop_reason) out.push('', `Research stopped: ${last.stop_reason}. ${last.note ?? ''}`);
  }

  out.push('', '## Projects', '');
  const miniOnDisk = listDirs(path.join(root, paths.projects_dir)).filter((name) => name.startsWith('mini-'));
  const planned = Array.isArray(plan.mini_projects) ? plan.mini_projects : [];
  if (miniOnDisk.length > 0) {
    for (const name of miniOnDisk) out.push(`- Mini project: \`${paths.projects_dir}/${name}/\``);
  } else if (planned.length > 0) {
    for (const mini of planned) {
      const number = String(mini.n ?? planned.indexOf(mini) + 1).padStart(2, '0');
      const useCase = mini.use_case ? ` — ${mini.use_case}` : '';
      out.push(`- Mini project (planned): \`${paths.projects_dir}/mini-${number}-${mini.slug}/\`${useCase}`);
    }
  } else {
    out.push(`- Mini projects will appear in \`${paths.projects_dir}/\`.`);
  }
  if (statusOf('capstone') !== 'skipped') {
    const name = plan.capstone?.name ? ` — ${plan.capstone.name}` : '';
    out.push(`- Capstone: \`${paths.capstone_dir}/\`${name}`);
  }

  out.push('', '## Build status', '', '| Wave | Stage | Status |', '|------|-------|--------|');
  for (const stage of topic.stages) {
    out.push(`| ${stage.wave} | ${stage.id} | ${STATUS_WORDS[stage.status] ?? stage.status} |`);
  }
  const runnable = runnableStages(topic);
  if (runnable.length > 0) {
    out.push('', `Next to generate: ${runnable.map((s) => `\`${s.id}\``).join(', ')}. Ask Claude to continue this topic, or run \`${CLI} next ${topic.id}\`.`);
  } else {
    out.push('', 'Everything is generated. Review due cards with `' + `${CLI} recall due ${topic.slug}` + '`.');
  }
  return out.join('\n');
}

// --- 09-resources -----------------------------------------------------------

function renderResources(root, topic) {
  const paths = topicPaths(topic);
  const { entries } = readSources(root, topic);
  const valid = entries.filter((entry) => entry && typeof entry === 'object' && entry.title && entry.url);
  if (valid.length === 0) {
    return '_No sources yet. The research stage adds them._';
  }

  const out = [
    `**${valid.length} vetted sources.** Tier A is canonical (official docs, the defining paper, the standard book, the reference implementation). Tier B is strong and widely used.`,
  ];
  const types = [...SOURCE_TYPES, ...new Set(valid.map((e) => e.type).filter((t) => !SOURCE_TYPES.includes(t)))];

  for (const type of types) {
    const group = valid
      .filter((entry) => entry.type === type)
      .sort((a, b) => String(a.tier).localeCompare(String(b.tier)) || String(a.title).localeCompare(String(b.title)));
    if (group.length === 0) continue;

    out.push('', `## ${SOURCE_TYPE_LABELS[type] ?? 'Other'}`, '');
    for (const entry of group) {
      const byline = [entry.authors, entry.year].filter(Boolean).join(', ');
      out.push(`- **[${entry.title}](${entry.url})**${byline ? ` — ${byline}` : ''} · tier ${entry.tier}`);
      if (entry.why_trusted) out.push(`  - Why it is trusted: ${entry.why_trusted}`);
      if (Array.isArray(entry.use_for) && entry.use_for.length) out.push(`  - Used for: ${entry.use_for.join(', ')}`);
      if (entry.verified_at) out.push(`  - Verified: ${entry.verified_at}`);
      const digest = `${paths.digests_dir}/${entry.id}-${topic.slug}.md`;
      if (isFile(path.join(root, digest))) out.push(`  - Digest: ${link(digest, 'read the digest')}`);
    }
  }
  return out.join('\n');
}

// --- domain map and Home ----------------------------------------------------

function topicLine(topic) {
  const progress = progressOf(topic);
  const startHere = topicPaths(topic).start_here;
  return `- ${link(startHere, topic.title)} — ${topic.depth} · ${progress.finished}/${progress.total} steps ready`;
}

function renderDomainMap(topics, pack) {
  if (topics.length === 0) return '_No topics yet._';
  const out = [];
  const subdomains = [...new Set(topics.map((t) => t.subdomain))].sort();
  for (const subdomain of subdomains) {
    const title = pack?.subdomains?.find((s) => s.id === subdomain)?.title ?? subdomain;
    out.push(`## ${title}`, '');
    topics
      .filter((t) => t.subdomain === subdomain)
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((topic) => out.push(topicLine(topic)));
    out.push('');
  }
  return out.join('\n');
}

function renderHome(root, topics) {
  if (topics.length === 0) {
    return [
      '_No topics yet._',
      '',
      'Ask Claude: "teach me <topic>". The tutor creates the notes, the lesson site pages, and the projects, and lists the topic here.',
    ].join('\n');
  }

  const out = ['## Domains', ''];
  const domains = [...new Set(topics.map((t) => t.domain))].sort();
  const knownPacks = new Set(listPackIds(root));
  for (const domain of domains) {
    const title = knownPacks.has(domain) ? tryLoadPack(root, domain)?.title ?? domain : domain;
    const count = topics.filter((t) => t.domain === domain).length;
    out.push(`- [[${domain}|${title}]] — ${count} ${count === 1 ? 'topic' : 'topics'}`);
  }

  out.push('', '## All topics', '');
  [...topics]
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach((topic) => out.push(topicLine(topic)));

  out.push('', '## Review', '', `Ask Claude "what's due?" or run \`${CLI} recall due\` to see the recall cards that are due today.`);
  return out.join('\n');
}
