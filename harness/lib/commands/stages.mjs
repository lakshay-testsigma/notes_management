// Commands that move a stage through its lifecycle: start, unit, done, skip,
// fail, reset, and validate.

import path from 'node:path';
import { listFlag, stringFlag } from '../args.mjs';
import { isoNow } from '../clock.mjs';
import { UsageError, ValidationError } from '../errors.mjs';
import { formatFailure } from '../format.mjs';
import { relPath, isFile } from '../io.mjs';
import { stageDigest, RECEIPT_VERSION } from '../freshness.mjs';
import { refreshMaps } from '../maps.mjs';
import { readCards, syncCards } from '../recall.mjs';
import { CLI } from '../root.mjs';
import { blockersOf, runnableStages, STAGE_IDS } from '../stages.mjs';
import { appendLog, findStage, resolveTopic } from '../topic-store.mjs';
import { createContext, validateAll, validateStage } from '../validators/index.mjs';
import { nextActionLine, requireArg, saveAndRefresh } from './shared.mjs';

const UNIT_ACTIONS = ['add', 'start', 'done', 'fail'];

function loadStage(root, args, usage) {
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  const stage = findStage(topic, requireArg(args[1], '<stage>', usage));
  return { topic, stage };
}

/** A wave starts only when every earlier wave is done or skipped. */
function assertWaveOpen(topic, stage, force, verb) {
  const blockers = blockersOf(topic, stage);
  if (blockers.length === 0 || force) return blockers;
  const list = blockers.map((s) => `${s.id} (${s.status})`).join(', ');
  throw new ValidationError(
    `Cannot ${verb} "${stage.id}" yet: earlier stages are not finished: ${list}. ` +
      `Run \`${CLI} next ${topic.id}\` to see what can run now, or add --force to override.`,
  );
}

function stageResult(topic, stage, extra = {}) {
  return {
    topic: topic.id,
    stage: stage.id,
    status: stage.status,
    attempts: stage.attempts,
    note: stage.note,
    runnable: runnableStages(topic).map((s) => s.id),
    ...extra,
  };
}

// --- start ------------------------------------------------------------------

export function startCommand({ root, args, flags }) {
  const { topic, stage } = loadStage(root, args, 'start <topic> <stage>');
  const force = Boolean(flags.force);

  if (((stage.status === 'done' && stage.fresh !== false) || stage.status === 'skipped') && !force) {
    throw new ValidationError(
      `Stage "${stage.id}" is already ${stage.status}. To redo it run \`${CLI} reset ${topic.id} ${stage.id}\` first.`,
    );
  }
  const blockers = assertWaveOpen(topic, stage, force, 'start');

  stage.status = 'in_progress';
  stage.started_at = isoNow();
  stage.finished_at = null;
  stage.attempts += 1;
  stage.note = '';
  const forced = force && blockers.length > 0;
  appendLog(topic, forced ? 'start-forced' : 'start', `attempt ${stage.attempts}${forced ? ' (forced past unfinished earlier stages)' : ''}`, stage.id);
  saveAndRefresh(root, topic);

  return {
    data: stageResult(topic, stage, { forced }),
    text: [
      `Started "${stage.id}" for ${topic.id} (attempt ${stage.attempts}).`,
      `When the work is written: ${CLI} done ${topic.id} ${stage.id}`,
    ].join('\n'),
  };
}

// --- unit -------------------------------------------------------------------

export function unitCommand({ root, args, flags }) {
  const usage = 'unit <topic> <stage> add|start|done|fail <unit-id> [--handoff <path>]';
  const { topic, stage } = loadStage(root, args, usage);
  const action = requireArg(args[2], 'the action (add|start|done|fail)', usage);
  const unitId = requireArg(args[3], '<unit-id>', usage);
  const handoffFlag = stringFlag(flags, 'handoff');

  if (!UNIT_ACTIONS.includes(action)) {
    throw new UsageError(`Unknown unit action "${action}".`, `Use one of: ${UNIT_ACTIONS.join(', ')}`);
  }
  if (!/^[\w.-]+$/.test(unitId)) {
    throw new UsageError(`Unit id "${unitId}" may only use letters, digits, dot, dash, underscore.`);
  }

  let handoff = null;
  if (handoffFlag) {
    const absolute = path.resolve(root, handoffFlag);
    if (!absolute.startsWith(root + path.sep) || !isFile(absolute)) throw new UsageError('Handoff must name an existing file inside this repository.');
    handoff = absolute.startsWith(root + path.sep) ? relPath(root, absolute) : handoffFlag;
  }

  if (stage.status !== 'in_progress') throw new ValidationError('Start the stage before changing its units.');

  let unit = stage.units.find((u) => u.id === unitId);
  const existed = Boolean(unit);
  if (!unit) {
    unit = { id: unitId, status: 'pending', handoff: null };
    stage.units.push(unit);
  }

  const statusByAction = { start: 'in_progress', done: 'done', fail: 'failed' };
  if (action !== 'add') unit.status = statusByAction[action];
  if (handoff) unit.handoff = handoff;

  const changed = action !== 'add' || !existed;
  if (changed) {
    appendLog(topic, `unit-${action}`, `unit ${unitId}${handoff ? ` (handoff: ${handoff})` : ''}`, stage.id);
    saveAndRefresh(root, topic);
  }

  const done = stage.units.filter((u) => u.status === 'done').length;
  return {
    data: { topic: topic.id, stage: stage.id, unit, units: stage.units, changed },
    text: [
      action === 'add' && existed
        ? `Unit "${unitId}" already exists in "${stage.id}" (${unit.status}). Nothing changed.`
        : `Unit "${unitId}" of "${stage.id}" is now ${unit.status}.`,
      `Units of "${stage.id}": ${done} of ${stage.units.length} done.`,
    ].join('\n'),
  };
}

// --- done -------------------------------------------------------------------

export function doneCommand({ root, args, flags }) {
  const { topic, stage } = loadStage(root, args, 'done <topic> <stage> [--force]');
  const force = Boolean(flags.force);

  if (stage.status === 'skipped' && !force) {
    throw new ValidationError(
      `Stage "${stage.id}" is skipped. To run it after all, use \`${CLI} reset ${topic.id} ${stage.id}\` first.`,
    );
  }
  const blockers = assertWaveOpen(topic, stage, force, 'finish');

  // Generated notes (00-start-here, 09-resources) must be current before the gate reads them.
  refreshMaps(root, topic);
  const gate = validateStage(root, topic, stage.id);

  if (!gate.ok && !force) {
    appendLog(topic, 'gate-failed', `${gate.failures.length} problems`, stage.id);
    saveAndRefresh(root, topic);
    return {
      exitCode: 1,
      data: stageResult(topic, stage, { forced: false, failures: withLines(gate.failures), warnings: withLines(gate.warnings) }),
      text: [
        `Stage "${stage.id}" is NOT done: the gate found ${gate.failures.length} ${gate.failures.length === 1 ? 'problem' : 'problems'}.`,
        '',
        ...gate.failures.map((f) => `  ${formatFailure(f)}`),
        '',
        `Fix them, then run again: ${CLI} done ${topic.id} ${stage.id}`,
      ].join('\n'),
    };
  }

  const forced = force && (!gate.ok || blockers.length > 0);
  stage.status = 'done';
  stage.fresh = true;
  stage.continue_after_failure = false;
  stage.validation = {version:RECEIPT_VERSION, fingerprint:stageDigest(root,topic,stage.id), at:isoNow(), forced};
  stage.started_at = stage.started_at ?? isoNow();
  stage.finished_at = isoNow();
  stage.note = forced ? `forced: ${gate.failures.length} gate problems were ignored` : '';

  let recall = null;
  if (stage.id === 'notes') {
    recall = syncCards(topic, readCards(root, topic).cards);
  }
  appendLog(
    topic,
    forced ? 'done-forced' : 'done',
    forced ? `marked done with --force (${gate.failures.length} gate problems ignored)` : 'gate passed',
    stage.id,
  );
  saveAndRefresh(root, topic);

  const lines = [
    forced
      ? `Stage "${stage.id}" marked done with --force (${gate.failures.length} gate problems ignored; this is logged).`
      : `Stage "${stage.id}" is done: the gate passed.`,
  ];
  if (gate.warnings.length > 0) {
    lines.push('', `Warnings (${gate.warnings.length}) — they did not stop the gate, but are worth fixing:`, ...gate.warnings.map((w) => `  ${formatFailure(w)}`), '');
  }
  if (recall) lines.push(`Recall cards registered: ${recall.total} (${recall.added.length} new).`);
  lines.push(nextActionLine(topic));

  return {
    data: stageResult(topic, stage, { forced, failures: withLines(gate.failures), warnings: withLines(gate.warnings), recall }),
    text: lines.join('\n'),
  };
}

// --- skip, fail, reset ------------------------------------------------------

export function skipCommand({ root, args, flags }) {
  const usage = 'skip <topic> <stage> --reason "..."';
  const { topic, stage } = loadStage(root, args, usage);
  const reason = requireArg(stringFlag(flags, 'reason'), '--reason', usage);

  stage.status = 'skipped';
  stage.skip_kind = ['depth','domain'].includes(stage.scope) ? stage.scope : 'waiver';
  stage.finished_at = isoNow();
  stage.note = reason;
  appendLog(topic, 'skip', reason, stage.id);
  saveAndRefresh(root, topic);
  return {
    data: stageResult(topic, stage),
    text: `Stage "${stage.id}" skipped: ${reason}\n${nextActionLine(topic)}`,
  };
}

export function failCommand({ root, args, flags }) {
  const usage = 'fail <topic> <stage> --reason "..."';
  const { topic, stage } = loadStage(root, args, usage);
  const reason = requireArg(stringFlag(flags, 'reason'), '--reason', usage);

  if (flags.continue && ['intake','research'].includes(stage.id)) throw new UsageError('Intake/research failures must be repaired before continuing.');
  stage.status = 'failed';
  stage.continue_after_failure = Boolean(flags.continue);
  stage.finished_at = null;
  stage.note = reason;
  appendLog(topic, 'fail', reason, stage.id);
  saveAndRefresh(root, topic);
  return {
    data: stageResult(topic, stage),
    text: [
      `Stage "${stage.id}" marked failed: ${reason}`,
      `Retry with \`${CLI} start ${topic.id} ${stage.id}\`, or give up on it with \`${CLI} skip ${topic.id} ${stage.id} --reason "..."\`.`,
    ].join('\n'),
  };
}

export function resetCommand({ root, args }) {
  const { topic, stage } = loadStage(root, args, 'reset <topic> <stage>');
  const previous = stage.status;

  stage.history = [...(stage.history??[]), {at:isoNow(),status:stage.status,validation:stage.validation,units:stage.units,note:stage.note}].slice(-10);
  stage.status = 'pending';
  stage.units = [];
  stage.continue_after_failure = false;
  delete stage.validation;
  stage.started_at = null;
  stage.finished_at = null;
  stage.note = '';
  appendLog(topic, 'reset', `was ${previous}`, stage.id);
  saveAndRefresh(root, topic);
  return {
    data: stageResult(topic, stage, { previous }),
    text: `Stage "${stage.id}" is pending again (was ${previous}). Files were not touched.\n${nextActionLine(topic)}`,
  };
}

// --- validate ---------------------------------------------------------------

function withLines(failures, stageId = null) {
  return failures.map((f) => ({ ...(stageId ? { stage: stageId } : {}), ...f, line: formatFailure(f) }));
}

export function validateCommand({ root, args, flags }) {
  const usage = 'validate <topic> [<stage>|--all] [--files <path>[,<path>...]]';
  const topic = resolveTopic(root, requireArg(args[0], '<topic>', usage));
  const stageId = args[1];
  const files = listFlag(flags, 'files');

  if (stageId && flags.all) throw new UsageError('Give a stage or --all, not both.', `Usage: ${CLI} ${usage}`);
  if (stageId && !STAGE_IDS.includes(stageId)) {
    throw new UsageError(`Unknown stage "${stageId}".`, `Stages: ${STAGE_IDS.join(', ')}`);
  }
  if (flags.files !== undefined && files.length === 0) throw new UsageError('--files needs at least one path.', `Usage: ${CLI} ${usage}`);
  if (files.length > 0 && !stageId) {
    throw new UsageError('--files needs a stage: it checks the files of one unit against the gate of that stage.', `Usage: ${CLI} validate <topic> <stage> --files <path>[,<path>...]`);
  }

  const results = stageId
    ? [validateStage(root, topic, stageId, createContext(root, topic), { files, structuralOnly:Boolean(flags['structure-only']) })]
    : validateAll(root, topic, {structuralOnly:Boolean(flags['structure-only'])});
  const failures = results.flatMap((r) => withLines(r.failures, r.stage));
  const warnings = results.flatMap((r) => withLines(r.warnings ?? [], r.stage));
  const ok = failures.length === 0;
  const checked = results[0]?.files ?? null;

  const lines = [`Validate ${topic.id}${stageId ? ` — ${stageId}` : ' — all stages'}`, ''];
  if (checked) {
    lines.push(`  Only these files (checks of the whole stage, such as counts and index notes, are left out):`, ...checked.map((f) => `    ${f}`), '');
  }
  for (const result of results) {
    // With --all, the finalize row holds only the topic-wide checks (frontmatter and links of every note).
    if (!stageId && result.stage === 'finalize') result.label = 'finalize (artifacts, execution evidence and independent reviews)';
    if (result.skipped) {
      lines.push(`  SKIP  ${result.stage}  (stage is skipped)`);
    } else if (result.ok) {
      lines.push(`  PASS  ${result.label ?? result.stage}`);
    } else {
      lines.push(`  FAIL  ${result.label ?? result.stage}  (${result.failures.length} ${result.failures.length === 1 ? 'problem' : 'problems'})`);
      for (const f of result.failures) lines.push(`    ${formatFailure(f)}`);
    }
  }
  if (warnings.length > 0) {
    lines.push('', `Warnings (${warnings.length}) — they do not fail the gate, but are worth fixing:`, ...warnings.map((w) => `    ${w.line}`));
  }
  const passed = checked ? 'The listed files are clean.' : 'All checks passed.';
  lines.push('', ok ? passed : `${failures.length} ${failures.length === 1 ? 'problem' : 'problems'} to fix. Each line is \`path: problem. fix.\``);

  return {
    exitCode: ok ? 0 : 1,
    data: {
      topic: topic.id,
      stage: stageId ?? 'all',
      ...(checked ? { files: checked } : {}),
      failure_count: failures.length,
      warning_count: warnings.length,
      stages: results.map((r) => ({ stage: r.stage, ok: r.ok, skipped: r.skipped, failures: withLines(r.failures), warnings: withLines(r.warnings ?? []) })),
      failures,
      warnings,
    },
    text: lines.join('\n'),
  };
}
