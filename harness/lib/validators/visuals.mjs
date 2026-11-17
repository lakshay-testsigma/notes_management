// Visual-first checks shared by the stage gates (harness/rubrics/visuals.md).
// They run only for plans with `visual_first: true`, so legacy topics keep the
// gates they were generated against.

import fs from 'node:fs';
import path from 'node:path';
import { isFile, readText } from '../io.mjs';
import { stripHtmlComments } from '../markdown.mjs';
import { styleReport } from '../style.mjs';
import { entriesForStage, visualEntryProblems, visualNoteName } from '../visuals.mjs';
import { curriculumIds } from '../visuals.mjs';
import { deckEntryProblems } from '../deck.mjs';
import { experienceEntryProblems } from '../experience.mjs';
import { failure, stageFailure, warning } from './context.mjs';

const MERMAID_BLOCK = /```mermaid\s*\n([\s\S]*?)```/g;

/** Number of diagrams in a Markdown file: mermaid blocks plus embedded images/SVGs. */
export function diagramCount(markdown) {
  const text = stripHtmlComments(markdown);
  const mermaid = [...text.matchAll(MERMAID_BLOCK)].filter((m) => m[1].trim().split('\n').length >= 2).length;
  const embeds = (text.match(/!\[\[[^\]]+\.(svg|png|jpe?g|webp)(\|[^\]]*)?\]\]/gi) ?? []).length
    + (text.match(/!\[[^\]]*\]\([^)]+\.(svg|png|jpe?g|webp)\)/gi) ?? []).length;
  return mermaid + embeds;
}

/** Every visual registered for one stage is valid; files exist; sources and concepts are known. */
export function visualRegistryFailures(ctx, stage) {
  const { paths } = ctx;
  const { entries, error } = ctx.visuals;
  if (error) return [stageFailure(paths.visuals_json, error, 'repair it with `tutor visuals <topic> check`')];
  const scoped = stage === 'finalize' ? entries : entriesForStage(ctx.topic, entries, stage);
  const options = { sourceIds: ctx.sourceIds, conceptIds: curriculumIds(ctx.topic), root: ctx.root, topic: ctx.topic };
  const failures = [];
  const seen = new Set();
  for (const entry of scoped) {
    if (seen.has(entry.id)) failures.push(failure(paths.visuals_json, `visual "${entry.id}" is registered twice`, 'remove the duplicate'));
    seen.add(entry.id);
    for (const problem of visualEntryProblems(entry, options)) {
      failures.push(failure(paths.visuals_json, `visual "${entry?.id ?? '?'}": ${problem}`, 'fix it with `tutor visuals <topic> update <id> --file <patch.json>`'));
    }
    if (entry?.format === 'hyperframes-slideshow' && entry.deck) {
      for (const problem of deckEntryProblems(ctx.root, entry)) failures.push(failure(paths.visuals_json, `deck "${entry.id}": ${problem}`, `run \`tutor deck <topic> build ${entry.id}\``));
    }
    if (entry?.format === 'experience' && entry.experience) {
      for (const problem of experienceEntryProblems(ctx.root, ctx.topic, entry)) failures.push(failure(paths.visuals_json, `experience "${entry.id}": ${problem}`, `run \`tutor experience <topic> build ${entry.id}\``));
    }
  }
  return failures;
}

/**
 * A Markdown artifact must carry at least `minimum` diagrams. Used for digests,
 * repository notes, project READMEs and architecture documents.
 */
export function diagramFailures(ctx, relative, minimum, what) {
  if (!ctx.visualFirst || !isFile(ctx.abs(relative))) return [];
  const count = diagramCount(readText(ctx.abs(relative)));
  if (count >= minimum) return [];
  return [failure(relative, `has ${count} diagram${count === 1 ? '' : 's'}, a visual-first ${what} needs at least ${minimum}`, 'add mermaid diagrams (or embed a registered SVG) that show the mechanism; follow .claude/skills/learn-visuals')];
}

/** Writing-standard warnings for a generated note (never fail the gate). */
export function styleWarnings(ctx, relative) {
  if (!ctx.visualFirst || !isFile(ctx.abs(relative))) return [];
  const body = readText(ctx.abs(relative)).split(/^## My insights\s*$/m)[0];
  return styleReport(body).warnings.map((text) => warning(relative, `writing standard: ${text}`, 'shorten sentences and use active voice (harness/rubrics/writing-standard.md)'));
}

/** Finalize: the vault visual index lists every registered visual, and each has its note. */
export function visualExportFailures(ctx) {
  if (!ctx.visualFirst) return [];
  const { paths, topic } = ctx;
  const failures = [];
  const { entries } = ctx.visuals;
  if (!isFile(ctx.abs(paths.visuals_index))) {
    return [stageFailure(paths.visuals_index, 'the visual index is missing', 'run `tutor map <topic>` (it exports visuals.json to the vault)')];
  }
  const index = readText(ctx.abs(paths.visuals_index));
  for (const entry of entries) {
    const name = visualNoteName(topic, entry.id);
    if (!index.includes(`[[${name}`)) failures.push(failure(paths.visuals_index, `does not list visual "${entry.id}"`, 'run `tutor map <topic>`'));
    if (!isFile(ctx.abs(path.posix.join(paths.visuals_dir, `${name}.md`)))) failures.push(failure(paths.visuals_dir, `has no note for visual "${entry.id}"`, 'run `tutor map <topic>`'));
  }
  return failures;
}

/**
 * The visual-first part of each stage gate. Lesson pages are checked by the
 * lesson gate itself (it needs the parsed pages); this covers the notes and
 * projects of the other stages, and the topic-wide export at finalize.
 */
export function visualStageFailures(ctx, stage) {
  if (!ctx.visualFirst) return [];
  const { paths, topic } = ctx;
  const out = [];
  const mdIn = (dir) => walkMarkdown(ctx, dir);
  switch (stage) {
    case 'brief':
      out.push(...diagramFailures(ctx, paths.brief, 1, 'brief'), ...styleWarnings(ctx, paths.brief));
      break;
    case 'digest':
      for (const file of mdIn(paths.digests_dir).filter((f) => f !== paths.digests_index)) {
        out.push(...diagramFailures(ctx, file, 1, 'digest'), ...styleWarnings(ctx, file));
      }
      break;
    case 'repo-intel':
      for (const file of mdIn(paths.repo_intel_dir).filter((f) => f.endsWith('-architecture.md'))) {
        out.push(...diagramFailures(ctx, file, 2, 'architecture note (module map and request flow)'));
      }
      break;
    case 'mini-projects':
      for (const file of listDirsSafe(ctx, paths.projects_dir).filter((d) => d.startsWith('mini-')).map((d) => `${paths.projects_dir}/${d}/README.md`)) {
        out.push(...diagramFailures(ctx, file, 1, 'mini-project README (architecture or execution flow)'));
      }
      break;
    case 'capstone':
      out.push(...diagramFailures(ctx, `${paths.capstone_dir}/ARCHITECTURE.md`, 3, 'capstone architecture (system, data flow, deployment)'));
      out.push(...diagramFailures(ctx, paths.capstone, 1, 'capstone note'));
      break;
    case 'notes': {
      const text = isFile(ctx.abs(paths.final_notes)) ? readText(ctx.abs(paths.final_notes)) : '';
      if (text && !text.includes(`[[visuals-${topic.slug}`)) out.push(failure(paths.final_notes, 'does not link the visual index', `add a "Visual refresher" line that links [[visuals-${topic.slug}|all visuals]]`));
      if (text && diagramCount(text) + (text.match(/\[\[visual-[a-z0-9-]+/g) ?? []).length < 1) out.push(failure(paths.final_notes, 'has no visual refresher', 'embed or link the one to three visuals that best restore the mental model'));
      out.push(...styleWarnings(ctx, paths.final_notes));
      const recall = isFile(ctx.abs(paths.recall)) ? readText(ctx.abs(paths.recall)) : '';
      if (recall && !/\[\[visual-[a-z0-9-]+/.test(recall)) out.push(failure(paths.recall, 'no card points to a visual', 'add at least one card whose answer links the visual note that explains it, e.g. [[visual-<id>-<slug>]]'));
      break;
    }
    case 'finalize':
      out.push(...visualExportFailures(ctx));
      break;
    default:
  }
  if (stage !== 'lesson') out.push(...visualRegistryFailures(ctx, stage));
  return out;
}

function walkMarkdown(ctx, dir) {
  const results = [];
  const visit = (relative) => {
    let entries = [];
    try { entries = fs.readdirSync(ctx.abs(relative), { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const child = `${relative}/${entry.name}`;
      if (entry.isDirectory()) visit(child);
      else if (entry.name.endsWith('.md')) results.push(child);
    }
  };
  visit(dir);
  return results.sort();
}

function listDirsSafe(ctx, dir) {
  try {
    return fs.readdirSync(ctx.abs(dir), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}
