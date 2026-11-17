// Command table and dispatcher of the `tutor` CLI.

import { checkCommand, orderCommand, rerunCommand, reviewCommand, writeNoteCommand } from './commands/quality.mjs';
import { removeCommand } from './commands/remove.mjs';
import { roadmapCommand } from './commands/roadmap.mjs';
import { styleCommand, videoCommand, visualsCommand } from './commands/media.mjs';
import { deckCommand, experienceCommand } from './commands/experience.mjs';
import { checkFlags, parseArgs } from './args.mjs';
import { UsageError } from './errors.mjs';
import { formatFailure } from './format.mjs';
import { withLock } from './io.mjs';
import { CLI, lockDir, repoRoot } from './root.mjs';
import { conceptCommand, insightCommand, mapCommand, recallCommand, sourcesCommand } from './commands/content.mjs';
import { doneCommand, failCommand, resetCommand, skipCommand, startCommand, unitCommand, validateCommand } from './commands/stages.mjs';
import { budgetCommand, doctorCommand, readCommand, sliceCommand, wordsCommand } from './commands/tools.mjs';
import { depthCommand, domainsCommand, initCommand, listCommand, logCommand, nextCommand, pathsCommand, planCommand, statusCommand } from './commands/topics.mjs';

/**
 * name -> { usage, summary, flags, mutates, run }
 * `mutates` (true, or a function of ctx) makes the command hold the state lock.
 */
export const COMMANDS = {
  remove: { usage: 'remove <topic> [<topic>...] [--delete]', summary: 'Preview or explicitly delete topic packages, including learner data; refresh registry/maps.', flags: ['delete'], mutates: ctx => Boolean(ctx.flags.delete), run: removeCommand },
  order: {usage:'order <topic> [import-indexes|set --file <json>]',summary:'Persist and verify the authored reading sequence.',flags:['file'],mutates:ctx=>Boolean(ctx.args[1]),run:orderCommand},
  rerun: {usage:'rerun <topic>',summary:'Reopen checkpoints, preserving artifacts, insights and history.',flags:[],mutates:true,run:rerunCommand},
  check: {usage:'check <topic> research|mini-projects|capstone|finalize',summary:'Execute checks and capture evidence for the current inputs.',flags:[],mutates:false,run:checkCommand},
  review: {usage:'review <topic> [--file <json>]',summary:'Print the current review fingerprint and checks, or record an independent assessment.',flags:['file'],mutates:ctx=>ctx.flags.file!==undefined,run:reviewCommand},
  'write-note': {usage:'write-note <topic> <note> --file <draft>',summary:'Replace generated prose while protecting existing insights.',flags:['file'],mutates:true,run:writeNoteCommand},
  roadmap: {
    usage: 'roadmap add --file <roadmap.json|roadmap.html> --domain <d> [--slug <s>] [--title "<T>"] [--depth auto|quick|standard|deep] | inbox | list | status <roadmap> | next <roadmap> | section <roadmap> <num> | render [<roadmap>]',
    summary: 'A roadmap over a whole field: one topic per section, every item a required concept; writes the HTML checklist and the vault map.',
    flags: ['file', 'domain', 'slug', 'title', 'depth'],
    mutates: (ctx) => ['add', 'render'].includes(ctx.args[0]),
    run: roadmapCommand,
  },
  domains: { usage: 'domains', summary: 'List domain packs and their subdomains.', flags: [], mutates: false, run: domainsCommand },
  init: {
    usage: 'init "<Title>" --domain <d> --subdomain <s> [--depth quick|standard|deep] [--slug <slug>] [--roadmap <roadmap> --section <num>]',
    summary: 'Create a topic: state, vault notes, lessons folder, projects folder. With --roadmap, link it to that roadmap section.',
    flags: ['domain', 'subdomain', 'depth', 'slug', 'roadmap', 'section'],
    mutates: true,
    run: initCommand,
  },
  list: { usage: 'list', summary: 'All topics with progress.', flags: [], mutates: false, run: listCommand },
  status: { usage: 'status [<topic>]', summary: 'Stage table for one topic, or a summary of all.', flags: [], mutates: false, run: statusCommand },
  paths: { usage: 'paths <topic>', summary: 'Every path of the topic.', flags: [], mutates: false, run: pathsCommand },
  next: { usage: 'next <topic>', summary: 'The stages that can run now, with inputs, outputs, and gate; when all are finished, the reading order.', flags: [], mutates: false, run: nextCommand },
  depth: {
    usage: 'depth <topic> <quick|standard|deep>',
    summary: 'Change the depth of an existing topic: opens the stages the new depth adds, skips unstarted ones it drops.',
    flags: [],
    mutates: true,
    run: depthCommand,
  },
  plan: {
    usage: 'plan <topic> [--set <file.json>]',
    summary: 'Print the plan, or merge a plan object into topic.json.',
    flags: ['set'],
    mutates: (ctx) => ctx.flags.set !== undefined,
    run: planCommand,
  },
  start: { usage: 'start <topic> <stage> [--force]', summary: 'Mark a stage in_progress.', flags: ['force'], mutates: true, run: startCommand },
  unit: {
    usage: 'unit <topic> <stage> add|start|done|fail <unit-id> [--handoff <path>]',
    summary: 'Track the parallel units of a stage.',
    flags: ['handoff'],
    mutates: true,
    run: unitCommand,
  },
  done: { usage: 'done <topic> <stage> [--force]', summary: 'Run the gate; mark done only when it passes.', flags: ['force'], mutates: true, run: doneCommand },
  skip: { usage: 'skip <topic> <stage> --reason "..."', summary: 'Mark a stage skipped.', flags: ['reason'], mutates: true, run: skipCommand },
  fail: { usage: 'fail <topic> <stage> --reason "..."', summary: 'Mark a stage failed.', flags: ['reason', 'continue'], mutates: true, run: failCommand },
  reset: { usage: 'reset <topic> <stage>', summary: 'Back to pending (files untouched).', flags: [], mutates: true, run: resetCommand },
  validate: {
    usage: 'validate <topic> [<stage>|--all] [--files <path>[,<path>...]]',
    summary: 'Run the artifact gates. Prints `path: problem. fix.` With --files: only the files of one unit.',
    flags: ['all', 'files', 'structure-only'],
    mutates: false,
    run: validateCommand,
  },
  map: { usage: 'map [<topic>]', summary: 'Regenerate 00-start-here, 09-resources, the domain map, Home; sync skipped-stage notes and concept backlinks.', flags: [], mutates: true, run: mapCommand },
  sources: {
    usage: 'sources <topic> add --file <entry.json> | sources <topic> list | sources <topic> update <id> --file <patch.json> | sources <topic> remove <id> --reason "..."',
    summary: 'Append, list, correct, or remove vetted sources.',
    flags: ['file', 'reason'],
    mutates: (ctx) => ['add', 'update', 'remove'].includes(ctx.args[1]),
    run: sourcesCommand,
  },
  visuals: {
    usage: 'visuals <topic> list | add --file <entry.json> | update <id> --file <patch.json> | remove <id> --reason "..." | check | export',
    summary: 'Register, check, and export the visual explanations of a topic (diagrams, simulations, videos) with their concepts and sources.',
    flags: ['file', 'reason'],
    mutates: (ctx) => ['add', 'update', 'remove', 'export'].includes(ctx.args[1]),
    run: visualsCommand,
  },
  video: {
    usage: 'video tools | video <topic> list | build <id> | render <id> [--docker] [--force] | check <id>',
    summary: 'Build a HyperFrames explainer from its storyboard (video.json), render it to MP4 when tools allow, and check it.',
    flags: ['docker', 'force'],
    mutates: (ctx) => ['build', 'render'].includes(ctx.args[1]),
    run: videoCommand,
  },
  experience: {
    usage: 'experience select --file <signals.json> | experience <topic> plan | list | build <id> [--skip-lint] | check <id> | progress [--file <export.json>]',
    summary: 'Choose the learning experience per idea (explainer, interactive lesson, branching deck, hybrid lab), build it for the site, and import learner progress.',
    flags: ['file', 'skip-lint'],
    mutates: (ctx) => ['build', 'progress'].includes(ctx.args[1]) && (ctx.args[1] !== 'progress' || Boolean(ctx.flags?.file)),
    run: experienceCommand,
  },
  deck: {
    usage: 'deck <topic> list | build <id> | check <id> [--offline] | present <id>',
    summary: 'Build a branching HyperFrames slideshow from deck.json, check it with the HyperFrames CLI, and print how to present it live.',
    flags: ['offline'],
    mutates: (ctx) => ['build', 'check'].includes(ctx.args[1]),
    run: deckCommand,
  },
  style: { usage: 'style <file>', summary: 'Writing-standard report (ASD-STE100, ~80% target): sentence length, passive voice, plain words.', flags: [], mutates: false, run: styleCommand },
  slice: {
    usage: 'slice <dir> [--budget <tokens>] [--window <tokens>] [--reserve <tokens>] [--include "<glob>"] [--pack]',
    summary: 'Cut a directory into slices that fit the token budget.',
    flags: ['budget', 'include', 'pack', 'window', 'reserve'],
    mutates: false,
    run: sliceCommand,
  },
  budget: { usage: 'budget <file...> [--budget <tokens>] [--window <tokens>] [--reserve <tokens>]', summary: 'Token estimate for files a worker is about to read.', flags: ['budget','window','reserve'], mutates: false, run: budgetCommand },
  read: {usage:'read <file> --start <char> --end <char> [--window <tokens>] [--reserve <tokens>]',summary:'Read one bounded slice range.',flags:['start','end','window','reserve','budget'],mutates:false,run:readCommand},
  words: { usage: 'words <file>', summary: 'Word count of a note or lesson page exactly as the gate counts it, with the allowed range.', flags: [], mutates: false, run: wordsCommand },
  concept: { usage: 'concept "<Name>" [--tech]', summary: 'Create a shared concept (or tech) note if missing (also when only the letter case differs); print its path.', flags: ['tech'], mutates: true, run: conceptCommand },
  insight: {
    usage: 'insight <topic> --text "..." [--section "<heading>"] [--target <stage-file>]',
    summary: "Append the learner's insight and add a backlink.",
    flags: ['text', 'section', 'target'],
    mutates: true,
    run: insightCommand,
  },
  recall: {
    usage: 'recall due [<topic>] | recall grade <topic> <card-id> <again|hard|good|easy> | recall sync <topic> | recall import <topic> --file <json>',
    summary: 'Spaced review with Leitner boxes.',
    flags: ['file'],
    mutates: (ctx) => ctx.args[0] !== 'due',
    run: recallCommand,
  },
  log: { usage: 'log <topic> ["<message>"]', summary: 'Append to the topic log (or print the last entries).', flags: [], mutates: (ctx) => ctx.args.length > 1, run: logCommand },
  doctor: { usage: 'doctor [--fix]', summary: 'Check the harness: packs, templates, site, registry.', flags: ['fix'], mutates: (ctx) => Boolean(ctx.flags.fix), run: doctorCommand },
};

export function usageText() {
  const lines = [
    'tutor — state, scaffolding, validation, and slicing for the learning harness',
    '',
    `Usage: ${CLI} <command> [arguments] [--json]`,
    '',
    'A <topic> is the full id (domain/subdomain/slug) or the slug when it is unique.',
    '',
    'Commands:',
  ];
  for (const command of Object.values(COMMANDS)) {
    lines.push(`  ${command.usage}`, `      ${command.summary}`);
  }
  lines.push('', 'Exit codes: 0 success, 1 validation failure, 2 usage error.');
  return lines.join('\n');
}

function print(text) {
  process.stdout.write(`${text}\n`);
}

function printResult(result, asJson) {
  const exitCode = result.exitCode ?? 0;
  if (asJson) print(JSON.stringify({ ok: exitCode === 0, ...result.data }, null, 2));
  else print(result.text);
  return exitCode;
}

function printError(error, asJson) {
  if (asJson) {
    const body = { ok: false, error: error.message, code: error.code };
    if (error.hint) body.hint = error.hint;
    if (error.failures?.length) body.failures = error.failures.map((f) => ({ ...f, line: formatFailure(f) }));
    print(JSON.stringify(body, null, 2));
    return;
  }
  const lines = [`Error: ${error.message}`];
  if (error.failures?.length) lines.push('', ...error.failures.map((f) => `  ${formatFailure(f)}`));
  if (error.hint) lines.push(error.hint);
  process.stderr.write(`${lines.join('\n')}\n`);
}

/** Run the CLI. Returns the process exit code. */
export function main(argv) {
  const asJson = argv.includes('--json');
  try {
    const { positionals, flags } = parseArgs(argv);
    const [name, ...args] = positionals;

    if (!name || name === 'help') {
      print(usageText());
      return name || flags.help ? 0 : 2;
    }
    const command = COMMANDS[name];
    if (!command) {
      throw new UsageError(`Unknown command "${name}".`, `Run \`${CLI} help\` to see every command.`);
    }
    if (flags.help) {
      print(`Usage: ${CLI} ${command.usage}\n\n${command.summary}`);
      return 0;
    }
    checkFlags(flags, command.flags, name);

    const ctx = { root: repoRoot(), args, flags, json: Boolean(flags.json) };
    const mutates = typeof command.mutates === 'function' ? command.mutates(ctx) : command.mutates;
    const result = mutates ? withLock(lockDir(ctx.root), () => command.run(ctx)) : command.run(ctx);
    return printResult(result, ctx.json);
  } catch (error) {
    if (error.exitCode === 1 || error.exitCode === 2) {
      printError(error, asJson);
      return error.exitCode;
    }
    throw error;
  }
}
