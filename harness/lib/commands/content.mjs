// Commands that write learner-facing content: map, sources, concept, insight, recall.

import path from 'node:path';
import { stringFlag } from '../args.mjs';
import { today } from '../clock.mjs';
import { UsageError, ValidationError } from '../errors.mjs';
import { table } from '../format.mjs';
import { addInsight } from '../insights.mjs';
import { ensureDir, relPath, walkFiles, writeTextAtomic } from '../io.mjs';
import { refreshSharedMaps, refreshTopic } from '../maps.mjs';
import { yamlEscape } from '../markdown.mjs';
import { dueCards, GRADES, gradeCard, INTERVALS, readCards, syncCards } from '../recall.mjs';
import { CLI } from '../root.mjs';
import { readSources, sourceEntryProblems, writeSources } from '../sources.mjs';
import { renderTemplate, SHARED_TEMPLATES } from '../templates.mjs';
import { appendLog, loadAllTopics, resolveTopic, saveTopic, topicPaths } from '../topic-store.mjs';
import { createContext } from '../validators/index.mjs';
import { readInputFile, readJsonInput, requireArg, saveAndRefresh } from './shared.mjs';

// --- map --------------------------------------------------------------------

export function mapCommand({ root, args }) {
  if (!args[0]) {
    const written = refreshSharedMaps(root);
    return { data: { topic: null, written }, text: ['Regenerated:', ...written.map((f) => `  ${f}`)].join('\n') };
  }
  const topic = resolveTopic(root, args[0]);
  const { written, stage_notes: stageNotes, backlinks } = refreshTopic(root, topic);
  const lines = [`Regenerated the maps of ${topic.id}:`, ...written.map((f) => `  ${f}`)];
  if (stageNotes.length > 0) {
    lines.push('Notes of skipped (or re-opened) stages brought in line with the stage status:', ...stageNotes.map((f) => `  ${f}`));
  }
  if (backlinks.length > 0) {
    lines.push('Backlinks added under "## Where it shows up":');
    for (const item of backlinks) lines.push(`  ${item.note}: ${item.added.map((name) => `[[${name}]]`).join(', ')}`);
  }
  return { data: { topic: topic.id, written, stage_notes: stageNotes, backlinks }, text: lines.join('\n') };
}

// --- sources ----------------------------------------------------------------

const normalizeUrl = (url) => String(url).trim().replace(/\/+$/, '').toLowerCase();

export function sourcesCommand({ root, args, flags }) {
  const usage = 'sources <topic> add --file <entry.json>   |   sources <topic> list   |   sources <topic> update <id> --file <patch.json>   |   sources <topic> remove <id> --reason "..."';
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  const action = requireArg(args[1], 'the action (add|list|update|remove)', usage);
  const paths = topicPaths(topic);
  const { entries, error } = readSources(root, topic);

  if (action === 'list') {
    if (error) throw new ValidationError(`${paths.sources_json} ${error}.`);
    const rows = entries.map((e) => [e.id, e.tier, e.type, e.year, e.title]);
    const text = entries.length
      ? [`${entries.length} sources for ${topic.id}`, '', table(['Id', 'Tier', 'Type', 'Year', 'Title'], rows)].join('\n')
      : `No sources yet for ${topic.id}. Add one with: ${CLI} sources ${topic.id} add --file <entry.json>`;
    return { data: { topic: topic.id, count: entries.length, sources: entries }, text };
  }

  if (action === 'remove') {
    // A source that turns out to be weak or wrong is dropped through the CLI, so
    // the reason is logged and 09-resources is regenerated in the same step.
    if (error) throw new ValidationError(`${paths.sources_json} ${error}. Fix the file before removing from it.`);
    const id = requireArg(args[2], '<id>', usage);
    const reason = requireArg(stringFlag(flags, 'reason'), '--reason', usage);
    if (!entries.some((e) => e?.id === id)) {
      throw new ValidationError(`No source with id "${id}" in ${paths.sources_json}.`, [
        { path: paths.sources_json, problem: `id "${id}" not found`, fix: `run \`${CLI} sources ${topic.id} list\` to see the ids` },
      ]);
    }
    const kept = entries.filter((e) => e?.id !== id);
    writeSources(root, topic, kept);
    appendLog(topic, 'source-remove', `removed ${id}: ${reason}`, 'research');
    saveAndRefresh(root, topic);
    return {
      data: { topic: topic.id, removed: id, reason, total: kept.length },
      text: `Removed ${id} from ${paths.sources_json} (${reason}). Now ${kept.length} sources.`,
    };
  }

  if (action === 'update') {
    // Correct one entry in place (a wrong evidence value, a new verification date)
    // without remove + add, so the entry keeps its position and nothing is retyped.
    if (error) throw new ValidationError(`${paths.sources_json} ${error}. Fix the file before updating it.`);
    const id = requireArg(args[2], '<id>', usage);
    const file = requireArg(stringFlag(flags, 'file'), '--file', usage);
    const index = entries.findIndex((e) => e?.id === id);
    if (index === -1) {
      throw new ValidationError(`No source with id "${id}" in ${paths.sources_json}.`, [
        { path: paths.sources_json, problem: `id "${id}" not found`, fix: `run \`${CLI} sources ${topic.id} list\` to see the ids` },
      ]);
    }
    const patch = readJsonInput(file, '--file');
    if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new UsageError(`${file} must contain a JSON object with the fields to change.`, 'Example: { "evidence": { "stars": null }, "verified_at": "2026-11-14" }');
    }

    const current = entries[index];
    const updated = { ...current, ...patch };
    if ('evidence' in patch && patch.evidence && typeof patch.evidence === 'object' && !Array.isArray(patch.evidence)
      && current.evidence && typeof current.evidence === 'object') {
      updated.evidence = { ...current.evidence, ...patch.evidence };
    }

    const failures = sourceEntryProblems(updated).map((problem) => ({ path: file, problem: `entry "${id}": ${problem.field} ${problem.problem}`, fix: problem.fix }));
    if (updated.id !== id) {
      failures.push({ path: file, problem: `entry "${id}": id cannot be changed by an update`, fix: `leave "id" out of the patch; to rename a source use \`${CLI} sources ${topic.id} remove ${id} --reason "..."\` and add it again` });
    }
    if (typeof updated.url === 'string' && entries.some((e, i) => i !== index && normalizeUrl(e?.url ?? '') === normalizeUrl(updated.url))) {
      failures.push({ path: file, problem: `entry "${id}": url is already used by another source`, fix: 'keep the url of this entry, or remove the other entry first' });
    }
    if (failures.length > 0) {
      throw new ValidationError(`Nothing was changed: ${failures.length} ${failures.length === 1 ? 'problem' : 'problems'} with the updated entry "${id}".`, failures);
    }

    const changedKeys = Object.keys(patch).flatMap((key) => (
      key === 'evidence' && patch.evidence && typeof patch.evidence === 'object' && !Array.isArray(patch.evidence)
        ? Object.keys(patch.evidence).map((inner) => `evidence.${inner}`)
        : [key]
    )).filter((key) => {
      const read = (entry) => key.split('.').reduce((value, part) => value?.[part], entry);
      return JSON.stringify(read(current)) !== JSON.stringify(read(updated));
    });

    if (changedKeys.length > 0) {
      const all = entries.map((entry, i) => (i === index ? updated : entry));
      writeSources(root, topic, all);
      appendLog(topic, 'source-update', `updated ${id}: ${changedKeys.join(', ')}`, 'research');
      saveAndRefresh(root, topic);
    }
    return {
      data: { topic: topic.id, updated: id, changed: changedKeys, position: index, total: entries.length, entry: updated },
      text: changedKeys.length > 0
        ? `Updated ${id} in ${paths.sources_json}: ${changedKeys.join(', ')}. It keeps position ${index + 1} of ${entries.length}.`
        : `Nothing to change: ${id} already has these values.`,
    };
  }

  if (action !== 'add') throw new UsageError(`Unknown sources action "${action}".`, `Usage: ${CLI} ${usage}`);
  if (error && error !== 'file is missing') throw new ValidationError(`${paths.sources_json} ${error}. Fix the file before adding to it.`);

  const file = requireArg(stringFlag(flags, 'file'), '--file', usage);
  const incoming = [].concat(readJsonInput(file, '--file'));
  const ids = new Set(entries.map((e) => e?.id));
  const urls = new Set(entries.map((e) => normalizeUrl(e?.url ?? '')));
  const failures = [];

  incoming.forEach((entry, i) => {
    const label = typeof entry?.id === 'string' ? `entry "${entry.id}"` : `entry [${i}]`;
    for (const problem of sourceEntryProblems(entry)) {
      failures.push({ path: file, problem: `${label}: ${problem.field} ${problem.problem}`, fix: problem.fix });
    }
    if (typeof entry?.id === 'string') {
      if (ids.has(entry.id)) failures.push({ path: file, problem: `${label}: id is already in sources.json`, fix: 'choose another id, or leave the source out because it is already listed' });
      ids.add(entry.id);
    }
    if (typeof entry?.url === 'string') {
      const url = normalizeUrl(entry.url);
      if (urls.has(url)) failures.push({ path: file, problem: `${label}: url is already in sources.json`, fix: 'leave the source out; it is already listed' });
      urls.add(url);
    }
  });

  if (failures.length > 0) {
    throw new ValidationError(`Nothing was added: ${failures.length} ${failures.length === 1 ? 'problem' : 'problems'} in ${file}.`, failures);
  }

  const all = [...entries, ...incoming];
  writeSources(root, topic, all);
  const added = incoming.map((e) => e.id);
  appendLog(topic, 'source-add', `added ${added.join(', ')}`, 'research');
  saveAndRefresh(root, topic);

  const [min, max] = createContext(root, topic).profile.sources;
  const tierA = all.filter((e) => e.tier === 'A').length;
  return {
    data: { topic: topic.id, added, total: all.length, tier_a: tierA, wanted: [min, max] },
    text: [
      `Added ${added.join(', ')} to ${paths.sources_json}.`,
      `Now ${all.length} sources (${tierA} tier A). This depth wants ${min}–${max}, with at least 1 tier A.`,
    ].join('\n'),
  };
}

// --- concept ----------------------------------------------------------------

export function conceptCommand({ root, args, flags }) {
  const raw = requireArg(args[0], '"<Name>"', 'concept "<Name>" [--tech]');
  const name = String(raw).replace(/[\\/:*?"<>|#^[\]]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name) throw new UsageError('The name has no usable characters.');

  const kind = flags.tech ? 'tech' : 'concept';
  const folder = path.join(root, 'vault', flags.tech ? '_tech' : '_concepts');
  const vault = path.join(root, 'vault');

  // Obsidian resolves links by file name, so a note with this name anywhere in the vault is reused.
  const existing = walkFiles(vault, { skipDirs: ['.obsidian', '.trash'] }).find(
    (file) => path.basename(file).toLowerCase() === `${name.toLowerCase()}.md`,
  );
  if (existing) {
    const relative = relPath(root, existing);
    const actual = path.basename(existing, '.md');
    const caseOnly = actual !== name;
    return {
      data: { name: actual, kind, path: relative, created: false, link: `[[${actual}]]`, requested: name, case_mismatch: caseOnly },
      text: caseOnly
        ? `${relative}\n(a note with this name already exists with different letter case: "${actual}". No second note was created; link to it as [[${actual}]])`
        : `${relative}\n(already exists; link to it as [[${actual}]])`,
    };
  }

  ensureDir(folder);
  const file = path.join(folder, `${name}.md`);
  const template = flags.tech ? SHARED_TEMPLATES.tech : SHARED_TEMPLATES.concept;
  writeTextAtomic(file, renderTemplate(template, { name, name_yaml: yamlEscape(name), date: today() }));
  const relative = relPath(root, file);
  return {
    data: { name, kind, path: relative, created: true, link: `[[${name}]]`, requested: name, case_mismatch: false },
    text: `${relative}\n(created; replace the placeholder line under the title with one short paragraph, and link to it as [[${name}]]. "## Where it shows up" is filled by \`${CLI} map <topic>\`)`,
  };
}

// --- insight ----------------------------------------------------------------

export function insightCommand({ root, args, flags }) {
  const usage = 'insight <topic> --text "..." [--section "<heading>"] [--target <stage-file>]';
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  let text = requireArg(stringFlag(flags, 'text'), '--text', usage);
  if (text === '-') text = readInputFile('-', '--text');
  if (!text.trim()) throw new UsageError('--text is empty.');

  const result = addInsight(root, topic, {
    text,
    section: stringFlag(flags, 'section'),
    target: stringFlag(flags, 'target'),
  });
  appendLog(topic, 'insight', `"${result.heading}"${result.target ? ` linked from ${path.basename(result.target)}` : ''}`);
  saveTopic(root, topic);

  const lines = [`Insight added to ${result.file}`, `  under "## ${result.section}" as "### ${result.heading}"`];
  if (result.target) lines.push(`Backlink added under "## My insights" in ${result.target}`);
  return { data: { topic: topic.id, ...result }, text: lines.join('\n') };
}

// --- recall -----------------------------------------------------------------

export function recallCommand({ root, args }) {
  const usage = 'recall due [<topic>]   |   recall grade <topic> <card-id> <again|hard|good|easy>   |   recall sync <topic>';
  const action = requireArg(args[0], 'the action (due|grade|sync)', usage);

  if (action === 'due') return recallDue(root, args[1]);
  if (action === 'sync') return recallSync(root, requireArg(args[1], '<topic>', usage));
  if (action === 'grade') {
    return recallGrade(
      root,
      requireArg(args[1], '<topic>', usage),
      requireArg(args[2], '<card-id>', usage),
      requireArg(args[3], 'the grade (again|hard|good|easy)', usage),
    );
  }
  throw new UsageError(`Unknown recall action "${action}".`, `Usage: ${CLI} ${usage}`);
}

function recallDue(root, reference) {
  const topics = reference ? [resolveTopic(root, reference)] : loadAllTopics(root);
  const cards = [];
  const perTopic = [];
  let nextDue = null;

  for (const topic of topics) {
    const result = dueCards(root, topic);
    cards.push(...result.due);
    perTopic.push({ topic: topic.id, due: result.due.length, registered: result.registered, unsynced: result.unsynced, next_due: result.next_due });
    if (result.next_due && (nextDue === null || result.next_due < nextDue)) nextDue = result.next_due;
  }

  const lines = [];
  if (cards.length === 0) {
    lines.push(nextDue ? `No cards are due today (${today()}). The next card is due on ${nextDue}.` : `No cards are due today (${today()}).`);
  } else {
    lines.push(`${cards.length} ${cards.length === 1 ? 'card is' : 'cards are'} due (${today()})`, '');
    lines.push(table(['Topic', 'Card', 'Box', 'Due', 'Question'], cards.map((c) => [c.topic, c.id, c.box, c.due, c.question.split('\n')[0].slice(0, 70)])));
    lines.push('', `Grade a card: ${CLI} recall grade <topic> <card-id> again|hard|good|easy`);
  }
  for (const item of perTopic.filter((t) => t.unsynced > 0)) {
    lines.push(`Note: ${item.topic} has ${item.unsynced} cards that are not registered yet. Run: ${CLI} recall sync ${item.topic}`);
  }

  return {
    data: { date: today(), total: cards.length, next_due: nextDue, cards, topics: perTopic },
    text: lines.join('\n'),
  };
}

function recallSync(root, reference) {
  const topic = resolveTopic(root, reference);
  const { cards, problems } = readCards(root, topic);
  const result = syncCards(topic, cards);
  if (result.added.length > 0 || result.removed.length > 0) {
    appendLog(topic, 'recall-sync', `${result.added.length} added, ${result.removed.length} removed, ${result.total} total`);
  }
  saveTopic(root, topic);

  const lines = [`Recall cards of ${topic.id}: ${result.total} registered (${result.added.length} new, ${result.removed.length} removed).`];
  for (const problem of problems) lines.push(`  Skipped: ${problem}`);
  return { data: { topic: topic.id, ...result, problems }, text: lines.join('\n') };
}

function recallGrade(root, reference, cardId, grade) {
  const topic = resolveTopic(root, reference);
  if (!GRADES.includes(grade)) throw new UsageError(`Unknown grade "${grade}".`, `Use one of: ${GRADES.join(', ')}`);

  if (!topic.recall?.cards?.[cardId]) {
    syncCards(topic, readCards(root, topic).cards);
  }
  if (!topic.recall.cards[cardId]) {
    const known = Object.keys(topic.recall.cards);
    throw new UsageError(`No card "${cardId}" in ${topic.id}.`, `Cards: ${known.length ? known.join(', ') : '(none; write cards in 08-recall first)'}`);
  }

  const result = gradeCard(topic, cardId, grade);
  appendLog(topic, 'recall-grade', `${cardId}: ${grade}, box ${result.from} -> ${result.to}, due ${result.due}`);
  saveTopic(root, topic);
  return {
    data: { topic: topic.id, ...result, intervals: INTERVALS },
    text: `Card ${cardId}: ${grade}. Box ${result.from} -> ${result.to}. Next review on ${result.due} (in ${result.interval_days} ${result.interval_days === 1 ? 'day' : 'days'}).`,
  };
}
