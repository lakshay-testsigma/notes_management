// Commands of the adaptive experience capability: `experience` and `deck`.

import { UsageError } from '../errors.mjs';
import { table } from '../format.mjs';
import { today } from '../clock.mjs';
import { CLI } from '../root.mjs';
import { appendLog, loadAllTopics, resolveTopic, saveTopic, topicPaths } from '../topic-store.mjs';
import { exportVisuals, readVisuals } from '../visuals.mjs';
import { EXPERIENCE_BUDGET, MODE_LABELS, resolveExperience, selectExperienceMode, signalProblems } from '../experience-mode.mjs';
import { buildExperience, cardsForConcepts, experienceEntryProblems, listExperienceIds, mergeProgress, readProgress, recordedMastery, weakConcepts } from '../experience.mjs';
import { buildDeck, checkDeck, listDeckIds } from '../deck.mjs';
import { readJsonInput, requireArg } from './shared.mjs';

const EXPERIENCE_USAGE = 'experience select --file <signals.json> | experience <topic> plan | list | build <id> [--skip-lint] | check <id> | progress [--file <export.json>]';
const DECK_USAGE = 'deck <topic> list | build <id> | check <id> [--offline] | present <id>';
const lines = (result) => [...(result.problems ?? []).map((p) => `  problem: ${p}`), ...(result.warnings ?? []).map((w) => `  warning: ${w}`)];

export function experienceCommand({ root, args, flags }) {
  if (args[0] === 'select') {
    const input = readJsonInput(flags.file, 'file');
    const signals = input?.signals ?? input;
    const problems = signalProblems(signals);
    if (problems.length) return { exitCode: 1, data: { problems }, text: ['The signals are not valid:', ...problems.map((p) => `  ${p}`)].join('\n') };
    const result = selectExperienceMode(signals);
    return { data: result, text: [`${MODE_LABELS[result.mode]} (cost ${result.cost}).`, ...result.reasons.map((r) => `  because ${r}`)].join('\n') };
  }
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', EXPERIENCE_USAGE));
  const action = requireArg(args[1], 'the action (plan|list|build|check|progress)', EXPERIENCE_USAGE);
  const paths = topicPaths(topic);

  if (action === 'plan') {
    const outline = topic.plan?.lesson_outline ?? [];
    let topics = null;
    const rows = [];
    const pages = [];
    let total = 0;
    for (const page of outline) {
      if (!page?.experience) { rows.push([page?.order ?? '?', page?.slug ?? '?', 'no signals', '', '', '']); continue; }
      const conceptIds = page.experience.concept_ids ?? page.concepts ?? [];
      topics ??= loadAllTopics(root);
      const titles = (topic.plan?.curriculum?.concepts ?? []).filter((c) => conceptIds.includes(c.id)).map((c) => c.title);
      const mastery = conceptIds.length ? recordedMastery(root, topics, { topicId: topic.id, conceptIds, titles }) : null;
      const resolved = resolveExperience(page);
      const live = resolved.selected ? selectExperienceMode(page.experience.signals, { mastery }) : null;
      if (resolved.mode) total += resolved.cost;
      const suggestion = live && mastery !== null && page.experience.signals.mastery === undefined ? `set signals.mastery ${mastery} (gives ${live.mode})` : '';
      rows.push([page.order, page.slug, resolved.selected?.mode ?? 'invalid', resolved.mode ?? '', resolved.cost ?? '', suggestion || resolved.problems.join('; ')]);
      pages.push({ order: page.order, slug: page.slug, selected: resolved.selected, mode: resolved.mode, cost: resolved.cost, recorded_mastery: mastery, problems: resolved.problems });
    }
    const budget = EXPERIENCE_BUDGET[topic.depth] ?? EXPERIENCE_BUDGET.standard;
    return {
      data: { topic: topic.id, pages, total, budget, over: total > budget },
      text: [table(['Page', 'Slug', 'Selected', 'Planned', 'Cost', 'Note'], rows), '', `Cost ${total} of ${budget} for depth "${topic.depth}".${total > budget ? ' Over budget: lighten supporting pages with an override_reason.' : ''}`].join('\n'),
    };
  }

  if (action === 'list') {
    const { entries } = readVisuals(root, topic);
    const ids = listExperienceIds(root, topic);
    const rows = ids.map((id) => {
      const exp = entries.find((e) => e.id === id)?.experience;
      return [id, exp?.mode ?? 'not built', (exp?.tabs ?? []).join(' '), exp?.checkpoints ?? ''];
    });
    return { data: { topic: topic.id, experiences: rows.map(([id, mode, tabs, checkpoints]) => ({ id, mode, tabs, checkpoints })) }, text: ids.length ? table(['Id', 'Mode', 'Tabs', 'Checkpoints'], rows) : `No experiences under ${paths.experiences_dir}/.` };
  }

  if (action === 'progress') {
    if (flags.file) {
      const data = readJsonInput(flags.file, 'file');
      const merged = mergeProgress(root, topic, data);
      if (merged.problems.length) return { exitCode: 1, data: { topic: topic.id, problems: merged.problems }, text: ['The progress export was not imported:', ...merged.problems.map((p) => `  ${p}`)].join('\n') };
      // Weak concepts feed the recall schedule: their cards are due today.
      const due = cardsForConcepts(root, topic, merged.weak.map((w) => w.id));
      const cards = topic.recall?.cards ?? {};
      const moved = due.filter((id) => cards[id] && cards[id].due > today());
      for (const id of moved) cards[id].due = today();
      appendLog(topic, 'progress', `imported learner progress: ${merged.weak.length} weak concepts, ${moved.length} recall cards due now`);
      saveTopic(root, topic);
      return { data: { topic: topic.id, weak: merged.weak, cards_due_now: moved }, text: progressText(merged.weak, moved) };
    }
    const progress = readProgress(root, topic);
    const weak = weakConcepts(topic, progress);
    return { data: { topic: topic.id, concepts: progress.concepts ?? {}, weak }, text: Object.keys(progress.concepts ?? {}).length ? progressText(weak, []) : `No progress imported yet. In an experience, choose "Export progress", then run \`${CLI} experience ${topic.id} progress --file <file>\`.` };
  }

  const id = requireArg(args[2], '<id>', EXPERIENCE_USAGE);
  if (action === 'build') {
    const result = buildExperience(root, topic, id, { lint: !flags['skip-lint'] });
    if (!result.ok) return { exitCode: 1, data: { topic: topic.id, id, ...result }, text: [`Experience ${id} has problems:`, ...lines(result)].join('\n') };
    exportVisuals(root, topic);
    const e = result.entry.experience;
    return {
      data: { topic: topic.id, id, built: result.built, mode: e.mode, tabs: e.tabs, cached: result.cached, warnings: result.warnings },
      text: [`${result.cached ? 'Experience is current' : 'Built experience'} ${id}: ${MODE_LABELS[e.mode]}, tabs ${e.tabs.join(', ')}, ${e.checkpoints} checkpoints → ${result.built}.`, ...lines(result)].join('\n'),
    };
  }
  if (action === 'check') {
    const entry = readVisuals(root, topic).entries.find((e) => e.id === id);
    const problems = entry ? experienceEntryProblems(root, topic, entry) : [`experience ${id} is not built; run \`${CLI} experience ${topic.id} build ${id}\``];
    return { exitCode: problems.length ? 1 : 0, data: { topic: topic.id, id, problems }, text: problems.length ? [`Experience ${id} has problems:`, ...problems.map((p) => `  ${p}`)].join('\n') : `Experience ${id}: built and current.` };
  }
  throw new UsageError(`Unknown action "${action}".`, `Usage: ${CLI} ${EXPERIENCE_USAGE}`);
}

function progressText(weak, moved) {
  if (!weak.length) return 'Every practiced concept is at or above 0.6 mastery.';
  return [
    'Weak concepts (lowest mastery first):',
    ...weak.map((w) => `  ${w.title}: mastery ${w.mastery}${w.misconceptions.length ? `; misconceptions: ${w.misconceptions.join(' | ')}` : ''}${w.revisit.length ? `; replay ${w.revisit.map((r) => `${r.experience} scene ${r.scene}`).join(', ')}` : ''}`),
    ...(moved.length ? [`Recall cards due now: ${moved.join(', ')}.`] : []),
  ].join('\n');
}

export function deckCommand({ root, args, flags }) {
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', DECK_USAGE));
  const action = requireArg(args[1], 'the action (list|build|check|present)', DECK_USAGE);
  if (action === 'list') {
    const { entries } = readVisuals(root, topic);
    const rows = listDeckIds(root, topic).map((id) => {
      const deck = entries.find((e) => e.id === id)?.deck;
      return [id, deck?.status ?? 'not built', deck?.slides ?? '', (deck?.branches ?? []).length];
    });
    return { data: { topic: topic.id, decks: rows.map(([id, status, slides, branches]) => ({ id, status, slides, branches })) }, text: rows.length ? table(['Id', 'Status', 'Slides', 'Branches'], rows) : `No decks under ${topicPaths(topic).videos_dir}/.` };
  }
  const id = requireArg(args[2], '<id>', DECK_USAGE);
  if (action === 'build') {
    const result = buildDeck(root, topic, id);
    if (!result.ok) return { exitCode: 1, data: { topic: topic.id, id, ...result }, text: [`Deck ${id} has problems:`, ...lines(result)].join('\n') };
    exportVisuals(root, topic);
    return { data: { topic: topic.id, id, files: result.files, status: result.entry.deck.status, warnings: result.warnings }, text: [`Built deck ${id} (${result.entry.deck.status}).`, ...result.files.map((f) => `  ${f}`), ...lines(result)].join('\n') };
  }
  if (action === 'check') {
    const result = checkDeck(root, topic, id, { run: !flags.offline });
    exportVisuals(root, topic);
    const head = result.ok ? `Deck ${id}: ${result.skipped ? 'built (HyperFrames check skipped)' : `HyperFrames check passes${result.cached ? ' (cached)' : ''}`}.` : `Deck ${id} has problems:`;
    return { exitCode: result.ok ? 0 : 1, data: { topic: topic.id, id, ...result, entry: undefined }, text: [head, ...lines(result)].join('\n') };
  }
  if (action === 'present') {
    const deck = readVisuals(root, topic).entries.find((e) => e.id === id)?.deck;
    if (!deck) return { exitCode: 1, data: { topic: topic.id, id }, text: `Deck ${id} is not built; run \`${CLI} deck ${topic.id} build ${id}\`.` };
    return { data: { topic: topic.id, id, command: deck.present_command }, text: `Present it live (presenter notes, audience tab): ${deck.present_command}\nOn the lesson site it opens in the Deep dive tab of its experience. Never render a deck to MP4.` };
  }
  throw new UsageError(`Unknown action "${action}".`, `Usage: ${CLI} ${DECK_USAGE}`);
}
