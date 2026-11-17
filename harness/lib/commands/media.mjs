// Commands of the shared visual capability: `visuals`, `video`, `style`.

import path from 'node:path';
import { UsageError, ValidationError } from '../errors.mjs';
import { table } from '../format.mjs';
import { isFile, readText } from '../io.mjs';
import { CLI } from '../root.mjs';
import { sourceIds } from '../sources.mjs';
import { styleReport } from '../style.mjs';
import { appendLog, resolveTopic, saveTopic, topicPaths } from '../topic-store.mjs';
import { buildVideo, checkVideo, listVideoIds, renderVideo, videoTools } from '../video.mjs';
import { curriculumIds, exportVisuals, readVisuals, visualEntryProblems, writeVisuals } from '../visuals.mjs';
import { readJsonInput, requireArg } from './shared.mjs';

function entryContext(root, topic) {
  return { sourceIds: sourceIds(root, topic), conceptIds: curriculumIds(topic), root, topic };
}

export function visualsCommand({ root, args, flags }) {
  const usage = 'visuals <topic> list | add --file <entry.json> | update <id> --file <patch.json> | remove <id> --reason "..." | check | export';
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  const action = requireArg(args[1], 'the action (list|add|update|remove|check|export)', usage);
  const paths = topicPaths(topic);
  const { entries, error } = readVisuals(root, topic);
  if (error && action !== 'list') throw new ValidationError(`${paths.visuals_json} ${error}.`);

  if (action === 'list') {
    const rows = entries.map((e) => [e.id, e.kind, e.format, e.format === 'hyperframes' ? (e.video?.status ?? '?') : '', (e.used_in ?? []).length]);
    const text = entries.length
      ? [`${entries.length} visuals for ${topic.id}`, '', table(['Id', 'Kind', 'Format', 'Video', 'Used in'], rows)].join('\n')
      : `No visuals yet for ${topic.id}. Register one with: ${CLI} visuals ${topic.id} add --file <entry.json>`;
    return { data: { topic: topic.id, count: entries.length, visuals: entries }, text };
  }

  if (action === 'check') {
    const ctx = entryContext(root, topic);
    const failures = [];
    const ids = new Set();
    for (const entry of entries) {
      if (ids.has(entry.id)) failures.push({ id: entry.id, problem: 'duplicate id' });
      ids.add(entry.id);
      for (const problem of visualEntryProblems(entry, ctx)) failures.push({ id: entry.id ?? '?', problem });
    }
    const text = failures.length
      ? [`${failures.length} problems in ${paths.visuals_json}:`, ...failures.map((f) => `  ${f.id}: ${f.problem}`)].join('\n')
      : `${entries.length} visuals, all valid.`;
    return { exitCode: failures.length ? 1 : 0, data: { topic: topic.id, count: entries.length, failures }, text };
  }

  if (action === 'export') {
    const written = exportVisuals(root, topic);
    return { data: { topic: topic.id, written }, text: written.length ? ['Wrote:', ...written.map((f) => `  ${f}`)].join('\n') : 'Nothing to export.' };
  }

  if (action === 'add') {
    const entry = readJsonInput(flags.file, 'file');
    if (entries.some((e) => e.id === entry.id)) throw new ValidationError(`Visual "${entry.id}" already exists. Use \`${CLI} visuals ${topic.id} update ${entry.id} --file <patch.json>\`.`);
    const problems = visualEntryProblems(entry, entryContext(root, topic));
    if (problems.length) throw new ValidationError(`The visual "${entry.id ?? '?'}" is not valid.`, problems.map((problem) => ({ path: paths.visuals_json, problem, fix: 'correct the entry (harness/rubrics/visuals.md)' })));
    entries.push(entry);
    writeVisuals(root, topic, entries);
    exportVisuals(root, topic);
    appendLog(topic, 'visual', `added visual ${entry.id}`);
    saveTopic(root, topic);
    return { data: { topic: topic.id, added: entry.id, count: entries.length }, text: `Added visual ${entry.id} (${entries.length} total) and refreshed ${paths.visuals_index}.` };
  }

  if (action === 'update') {
    const id = requireArg(args[2], '<id>', usage);
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new ValidationError(`No visual "${id}".`);
    const patch = readJsonInput(flags.file, 'file');
    const next = { ...entries[index] };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value && typeof value === 'object' && !Array.isArray(value) && next[key] && typeof next[key] === 'object') next[key] = { ...next[key], ...value };
      else next[key] = value;
    }
    next.id = id;
    const problems = visualEntryProblems(next, entryContext(root, topic));
    if (problems.length) throw new ValidationError(`The update leaves "${id}" invalid.`, problems.map((problem) => ({ path: paths.visuals_json, problem, fix: 'correct the patch' })));
    entries[index] = next;
    writeVisuals(root, topic, entries);
    exportVisuals(root, topic);
    return { data: { topic: topic.id, updated: id }, text: `Updated visual ${id}.` };
  }

  if (action === 'remove') {
    const id = requireArg(args[2], '<id>', usage);
    const reason = flags.reason;
    if (typeof reason !== 'string' || !reason.trim()) throw new UsageError('`remove` needs --reason "..."');
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new ValidationError(`No visual "${id}".`);
    entries.splice(index, 1);
    writeVisuals(root, topic, entries);
    exportVisuals(root, topic);
    appendLog(topic, 'visual', `removed visual ${id}: ${reason}`);
    saveTopic(root, topic);
    return { data: { topic: topic.id, removed: id }, text: `Removed visual ${id}. Its vault note stays (it may hold your insights); delete it by hand if you want.` };
  }
  throw new UsageError(`Unknown action "${action}".`, `Usage: ${CLI} ${usage}`);
}

export function videoCommand({ root, args, flags }) {
  const usage = 'video tools | video <topic> list | build <id> | render <id> [--docker] [--force] | check <id>';
  if (args[0] === 'tools') {
    const tools = videoTools();
    const lines = [
      `HyperFrames CLI: npx hyperframes@${tools.hyperframes} (${tools.npx ? 'npx available' : 'npx missing'})`,
      `FFmpeg: ${tools.ffmpeg ? 'found' : 'not found'} · Docker: ${tools.docker ? 'running' : 'not running'}`,
      `Narration: macOS say ${tools.say ? 'available' : 'unavailable'} · Kokoro ${tools.kokoro ? 'available' : 'unavailable'}`,
      tools.renderer ? `Renders will run ${tools.renderer === 'docker' ? 'inside Docker (`render --docker`)' : 'locally'}.` : `Cannot render MP4 now: ${tools.blocker}. Storyboards, captions and transcripts still build.`,
    ];
    return { data: tools, text: lines.join('\n') };
  }
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  const action = requireArg(args[1], 'the action (list|build|render|check)', usage);
  if (action === 'list') {
    const ids = listVideoIds(root, topic);
    const { entries } = readVisuals(root, topic);
    const rows = ids.map((id) => {
      const video = entries.find((e) => e.id === id)?.video ?? {};
      return [id, video.status ?? 'not built', video.duration_s ?? '', video.narration ?? ''];
    });
    return { data: { topic: topic.id, videos: rows.map(([id, status, duration, narration]) => ({ id, status, duration, narration })) }, text: ids.length ? table(['Id', 'Status', 'Seconds', 'Narration'], rows) : `No video projects under ${topicPaths(topic).videos_dir}/.` };
  }
  const id = requireArg(args[2], '<id>', usage);
  const lines = (result) => [...result.problems.map((p) => `  problem: ${p}`), ...(result.warnings ?? []).map((w) => `  warning: ${w}`)];

  if (action === 'build') {
    const result = buildVideo(root, topic, id);
    if (!result.ok) return { exitCode: 1, data: { topic: topic.id, id, ...result }, text: [`Storyboard ${id} has problems:`, ...lines(result)].join('\n') };
    exportVisuals(root, topic);
    return { data: { topic: topic.id, id, ...result, entry: undefined, status: result.entry.video.status }, text: [`Built ${id}: ${result.duration} s, narration ${result.narration}, status ${result.entry.video.status}.`, ...result.files.map((f) => `  ${f}`), ...lines(result)].join('\n') };
  }
  if (action === 'render') {
    const result = renderVideo(root, topic, id, { force: Boolean(flags.force), docker: Boolean(flags.docker) });
    exportVisuals(root, topic);
    if (!result.ok) {
      appendLog(topic, 'video', `video ${id} not rendered: ${result.problems[0]}`);
      saveTopic(root, topic);
      return { exitCode: 1, data: { topic: topic.id, id, ...result }, text: [`Video ${id} was NOT rendered.`, ...lines(result)].join('\n') };
    }
    const text = result.cached
      ? `Video ${id} is current (${result.mp4}); the storyboard did not change, so nothing was rendered.`
      : `Rendered ${id} with ${result.renderer}: ${result.mp4}, ${result.duration.toFixed(1)} s, ${result.width}×${result.height}, ${result.has_audio ? 'with' : 'without'} narration.`;
    appendLog(topic, 'video', text);
    saveTopic(root, topic);
    return { data: { topic: topic.id, id, ...result }, text: [text, ...lines(result)].join('\n') };
  }
  if (action === 'check') {
    const result = checkVideo(root, topic, id);
    return { exitCode: result.ok ? 0 : 1, data: { topic: topic.id, id, ...result }, text: [result.ok ? `Video ${id}: ${result.status}, checks pass.` : `Video ${id} has problems:`, ...lines(result)].join('\n') };
  }
  throw new UsageError(`Unknown action "${action}".`, `Usage: ${CLI} ${usage}`);
}

export function styleCommand({ root, args }) {
  const file = requireArg(args[0], '<file>', 'style <file>');
  const absolute = [path.resolve(root, file), path.resolve(file)].find((candidate) => isFile(candidate));
  if (!absolute) throw new UsageError(`File not found: ${file}`);
  const report = styleReport(readText(absolute));
  const lines = [
    `${file}: ${report.sentences} sentences, ${report.averageWords} words on average, ${report.score}% follow the length and voice rules (target 80%).`,
    ...report.warnings.map((w) => `  warning: ${w}`),
  ];
  return { data: { file, ...report }, text: lines.join('\n') };
}
