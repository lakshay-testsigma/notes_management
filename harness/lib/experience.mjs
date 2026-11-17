// Interactive learning experiences (Modes A–D) for the lesson site.
//
// An experience is one reusable lesson definition, `experience.json`, in
// `tutor paths` → experiences_dir/<id>/. It composes parts the harness already
// builds: HyperFrames videos (watch, guided walkthrough, final summary), a
// HyperFrames slideshow deck (branching deep dives), a site simulation
// (ClusterSim, AlgorithmStepper) with named presets, clickable inspection
// regions, and checkpoints (predict, experiment, observe, explain, verify).
// `buildExperience` validates it against the topic, builds and publishes the
// parts that changed, and writes `experience.built.json`: the resolved
// configuration the site's <Experience id> renders. The simulation state stays
// separate from the video timeline; `sync` only says which preset the guided
// walkthrough loads when a scene starts. Contract: harness/rubrics/experiences.md.

import fs from 'node:fs';
import path from 'node:path';
import { hash } from './freshness.mjs';
import { isFile, readJson, readText, writeJsonAtomic, writeTextAtomic } from './io.mjs';
import { today, isoNow } from './clock.mjs';
import { lessonPageUrl, topicPaths } from './topic-store.mjs';
import { readVisuals, writeVisuals } from './visuals.mjs';
import { buildVideo, lintVideo, readSpec as readVideoSpec, sourcesFingerprint, topicContext, videoTools } from './video.mjs';
import { buildDeck, readDeckSpec } from './deck.mjs';
import { EXPERIENCE_MODES } from './experience-mode.mjs';
import { readCards } from './recall.mjs';

const GENERATOR_VERSION = 1;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const words = (value) => (text(value) ? value.trim().split(/\s+/).length : 0);

export const CHECKPOINT_KINDS = ['predict', 'experiment', 'observe', 'explain', 'verify'];
export const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const TAB_ORDER = ['watch', 'explore', 'guided', 'deepdive', 'practice'];
/** How many checkpoints each mode may hold: enough to practice, few enough not to interrupt. */
export const CHECKPOINT_LIMITS = { explainer: [0, 1], interactive: [2, 6], branching: [1, 4], hybrid: [3, 8] };
/** Simulations an experience can host, with the keys of the state snapshot they report. */
export const SIMULATIONS = {
  ClusterSim: ['tick', 'mode', 'leader', 'term', 'latency', 'servers', 'live', 'failed', 'committed', 'pending', 'delivered', 'rerouted', 'explanation', 'writes'],
  AlgorithmStepper: ['frame', 'frames', 'done', 'caption', 'vars', 'pointers'],
};
export const CONDITION_OPS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'includes'];
const STATIC_FORMATS = ['mermaid', 'svg', 'image'];

// --- spec ------------------------------------------------------------------------

function conditionProblems(condition, component, at) {
  const list = condition?.all ?? (condition ? [condition] : []);
  if (!list.length) return [`${at} needs \`goal.condition\`: { path, op, value } or { all: [...] }`];
  const keys = SIMULATIONS[component] ?? [];
  const problems = [];
  for (const c of list) {
    const head = String(c?.path ?? '').split('.')[0];
    if (!keys.includes(head)) problems.push(`${at} condition path "${c?.path}" is not in the ${component} state (${keys.join(', ')})`);
    if (!CONDITION_OPS.includes(c?.op)) problems.push(`${at} condition op must be one of ${CONDITION_OPS.join(', ')}`);
    if (!('value' in (c ?? {}))) problems.push(`${at} condition needs a \`value\``);
  }
  return problems;
}

/**
 * Shape problems of an experience.json. `ctx` may hold sourceIds, conceptIds
 * (Sets), `scenes` (Set of guided-video scene ids), `slides` (Set of deck
 * slide ids) for reference checks done at build time.
 */
export function experienceSpecProblems(spec, { id = null, sourceIds = null, conceptIds = null, scenes = null, slides = null } = {}) {
  const problems = [];
  const fail = (p) => problems.push(p);
  if (!spec || typeof spec !== 'object') return ['experience.json must be an object'];
  if (!text(spec.id) || !ID.test(spec.id)) fail('`id` must be lowercase words joined by dashes');
  else if (id && spec.id !== id) fail(`\`id\` is "${spec.id}" but the folder is "${id}"`);
  if (words(spec.title) < 3) fail('`title` must say what the learner explores (3+ words)');
  const mode = spec.mode;
  if (!EXPERIENCE_MODES.includes(mode) || mode === 'static') fail('`mode` must be explainer, interactive, branching or hybrid (a static idea needs no experience)');
  if (words(spec.objective) < 6) fail('`objective` (6+ words) states the one thing the learner can do afterwards');
  if (!LEVELS.includes(spec.level)) fail(`\`level\` must be one of ${LEVELS.join(', ')}`);
  if (words(spec.summary) < 12) fail('`summary` (12+ words) is the text alternative of the whole experience');
  for (const [key, known, label] of [['concept_ids', conceptIds, 'plan.curriculum'], ['source_ids', sourceIds, 'sources.json']]) {
    if (!Array.isArray(spec[key]) || !spec[key].length) fail(`\`${key}\` must not be empty`);
    else if (known) {
      const unknown = spec[key].filter((x) => !known.has(x));
      if (unknown.length) fail(`\`${key}\` not in ${label}: ${unknown.join(', ')}`);
    }
  }
  if (!Array.isArray(spec.used_in) || spec.used_in.length !== 1 || !text(spec.used_in[0])) fail('`used_in` must name the one lesson page that embeds <Experience id="…" />');
  const ref = (value) => value === undefined || value === null || (text(value) && ID.test(value));
  for (const key of ['watch', 'guided']) {
    if (spec[key] !== undefined && (typeof spec[key] !== 'object' || !text(spec[key]?.video) || !ID.test(spec[key].video))) fail(`\`${key}\` must be { "video": "<video id>" }`);
  }
  if (!ref(spec.deck)) fail('`deck` must be a deck id');
  if (!ref(spec.summary_video)) fail('`summary_video` must be a video id');
  if (!ref(spec.fallback_visual)) fail('`fallback_visual` must be a registered static visual id');

  const sim = spec.simulation;
  if (sim !== undefined) {
    if (!sim || !SIMULATIONS[sim.component]) fail(`\`simulation.component\` must be one of ${Object.keys(SIMULATIONS).join(', ')}`);
    else {
      if (!sim.props || typeof sim.props !== 'object' || Array.isArray(sim.props)) fail('`simulation.props` must be the props object of the component');
      if (sim.presets !== undefined && (typeof sim.presets !== 'object' || Array.isArray(sim.presets) || !Object.values(sim.presets).every((p) => p && typeof p === 'object'))) fail('`simulation.presets` must map a name to a props override');
      if (sim.component === 'AlgorithmStepper' && !(Array.isArray(sim.props?.frames) && sim.props.frames.length >= 2)) fail('an AlgorithmStepper simulation needs `props.frames` (2+ frames)');
      if (sim.component === 'ClusterSim' && !['replication', 'broadcast', 'load-balance'].includes(sim.props?.mode)) fail('a ClusterSim simulation needs `props.mode`: replication, broadcast or load-balance');
    }
  }
  const presets = new Set(Object.keys(sim?.presets ?? {}));
  for (const [i, s] of (spec.sync ?? []).entries()) {
    if (!text(s?.scene) || !text(s?.preset)) fail(`sync ${i + 1} needs \`scene\` and \`preset\``);
    else {
      if (!presets.has(s.preset)) fail(`sync ${i + 1} names preset "${s.preset}", which \`simulation.presets\` does not define`);
      if (scenes && !scenes.has(s.scene)) fail(`sync ${i + 1} names scene "${s.scene}", which the guided video does not have`);
    }
  }
  if (spec.sync?.length && !spec.guided) fail('`sync` needs a `guided` video');
  for (const [i, h] of (spec.inspect ?? []).entries()) {
    const at = `inspect ${h?.id ?? i + 1}`;
    if (!text(h?.id) || !ID.test(h.id)) fail(`${at} needs a lowercase id`);
    if (!text(h?.label) || words(h?.text) < 6 || words(h?.text) > 60) fail(`${at} needs a \`label\` and a \`text\` of 6–60 words`);
    const r = h?.region;
    if (!r || ![r.x, r.y, r.w, r.h].every((n) => typeof n === 'number' && n >= 0 && n <= 100) || r.x + r.w > 100 || r.y + r.h > 100 || r.w < 4 || r.h < 4) fail(`${at} needs \`region\` {x, y, w, h} in percent of the frame (at least 4 × 4)`);
    if (!text(h?.scene)) fail(`${at} needs the \`scene\` during which it is clickable`);
    else if (scenes && !scenes.has(h.scene)) fail(`${at} names scene "${h.scene}", which the guided video does not have`);
    if (h?.concept_id && conceptIds && !conceptIds.has(h.concept_id)) fail(`${at} concept_id "${h.concept_id}" is not in plan.curriculum`);
  }
  if ((spec.inspect ?? []).length > 6) fail('at most 6 inspection regions; more is a tour, not a lesson');

  const cps = Array.isArray(spec.checkpoints) ? spec.checkpoints : [];
  if (spec.checkpoints !== undefined && !Array.isArray(spec.checkpoints)) fail('`checkpoints` must be a list');
  const seenAt = new Set();
  const cpIds = new Set();
  for (const [i, cp] of cps.entries()) {
    const at = `checkpoint ${cp?.id ?? i + 1}`;
    if (!text(cp?.id) || !ID.test(cp.id)) fail(`${at} needs a lowercase id`);
    else if (cpIds.has(cp.id)) fail(`duplicate checkpoint id ${cp.id}`);
    cpIds.add(cp?.id);
    if (!CHECKPOINT_KINDS.includes(cp?.kind)) fail(`${at} kind must be one of ${CHECKPOINT_KINDS.join(', ')}`);
    if (words(cp?.prompt) < 4) fail(`${at} needs a \`prompt\` (4+ words)`);
    if (words(cp?.explanation) < 8) fail(`${at} needs an \`explanation\` (8+ words): why the behavior happens`);
    if (!Array.isArray(cp?.concept_ids) || !cp.concept_ids.length || (Array.isArray(spec.concept_ids) && cp.concept_ids.some((c) => !spec.concept_ids.includes(c)))) fail(`${at} \`concept_ids\` must be a non-empty subset of the experience's concept_ids`);
    if (['predict', 'verify'].includes(cp?.kind)) {
      const choices = Array.isArray(cp.choices) ? cp.choices : [];
      if (choices.length < 2 || choices.length > 4) fail(`${at} needs 2–4 \`choices\``);
      else {
        if (choices.filter((c) => c?.correct === true).length !== 1) fail(`${at} needs exactly one choice with "correct": true`);
        for (const c of choices) {
          if (!text(c?.text)) fail(`${at}: every choice needs \`text\``);
          if (c?.correct !== true && words(c?.misconception) < 4) fail(`${at}: wrong choice "${c?.text}" needs a \`misconception\` (4+ words) naming the wrong idea`);
        }
      }
    }
    if (cp?.kind === 'experiment') {
      if (!sim) fail(`${at}: an experiment needs a \`simulation\``);
      else {
        if (!cp.goal || typeof cp.goal !== 'object') fail(`${at} needs \`goal\` { preset?, condition, hint }`);
        else {
          problems.push(...conditionProblems(cp.goal.condition, sim.component, at));
          if (cp.goal.preset && !presets.has(cp.goal.preset)) fail(`${at} goal preset "${cp.goal.preset}" is not defined`);
          if (words(cp.goal.hint) < 4) fail(`${at} goal needs a \`hint\` (4+ words)`);
        }
      }
    }
    if (cp?.kind === 'observe' && words(cp?.look_for) < 4) fail(`${at} needs \`look_for\` (4+ words): what to watch for`);
    const where = cp?.at;
    let key = null;
    if (where?.scene) {
      key = `scene:${where.scene}`;
      if (!spec.guided) fail(`${at} pauses at a scene, so the experience needs a \`guided\` video`);
      else if (scenes && !scenes.has(where.scene)) fail(`${at} names scene "${where.scene}", which the guided video does not have`);
    } else if (where?.slide) {
      key = `slide:${where.slide}`;
      if (!spec.deck) fail(`${at} waits on a slide, so the experience needs a \`deck\``);
      else if (slides && !slides.has(where.slide)) fail(`${at} names slide "${where.slide}", which the deck does not have`);
    } else if (where?.after === 'watch') {
      key = 'after:watch';
      if (!spec.watch) fail(`${at} follows the watch video, so the experience needs \`watch\``);
    } else if (where?.tab !== 'practice') fail(`${at} \`at\` must be { scene }, { slide }, { after: "watch" } or { tab: "practice" }`);
    if (key && seenAt.has(key)) fail(`${at}: two checkpoints interrupt the same moment (${key}); merge them`);
    if (key) seenAt.add(key);
    if (cp?.revisit && scenes && !scenes.has(cp.revisit)) fail(`${at} revisit scene "${cp.revisit}" is not in the guided video`);
    if (cp?.revisit && !spec.guided) fail(`${at} \`revisit\` replays a guided scene, so it needs a \`guided\` video`);
  }

  const limits = CHECKPOINT_LIMITS[mode];
  if (limits && (cps.length < limits[0] || cps.length > limits[1])) fail(`a ${mode} experience holds ${limits[0]}–${limits[1]} checkpoints, not ${cps.length}${mode === 'explainer' ? '; do not interrupt a simple explanation' : ''}`);
  const kinds = new Set(cps.map((c) => c?.kind));
  switch (mode) {
    case 'explainer':
      if (!spec.watch) fail('an explainer experience needs `watch`');
      if (spec.simulation || spec.deck || spec.guided) fail('an explainer stays a video: move the simulation, guided walkthrough or deck to an interactive, branching or hybrid experience');
      break;
    case 'interactive':
      if (!spec.guided) fail('an interactive lesson needs `guided` (the HyperFrames composition the learner steps through)');
      if (!spec.simulation && !(spec.inspect ?? []).length) fail('an interactive lesson needs a `simulation` or `inspect` regions: something the learner changes or clicks');
      if (!kinds.has('predict')) fail('an interactive lesson needs at least one `predict` checkpoint');
      if (!spec.fallback_visual) fail('an interactive lesson needs `fallback_visual` (a registered static diagram for no-JavaScript and reduced-capability views)');
      break;
    case 'branching':
      if (!spec.deck) fail('a branching experience needs `deck`');
      if (!spec.fallback_visual) fail('a branching experience needs `fallback_visual`');
      break;
    case 'hybrid':
      for (const key of ['watch', 'guided', 'simulation', 'summary_video', 'fallback_visual']) if (!spec[key]) fail(`a hybrid lab needs \`${key}\``);
      if (!kinds.has('experiment')) fail('a hybrid lab needs at least one `experiment` checkpoint');
      if (!kinds.has('predict')) fail('a hybrid lab needs at least one `predict` checkpoint');
      break;
    default: break;
  }
  return problems;
}

/** The tabs the site shows, in order, for a valid spec. */
export function experienceTabs(spec) {
  const tabs = new Set();
  if (spec.watch || (spec.mode === 'hybrid' && spec.summary_video)) tabs.add('watch');
  if (spec.simulation) tabs.add('explore');
  if (spec.guided) tabs.add('guided');
  if (spec.deck) tabs.add('deepdive');
  tabs.add('practice');
  return TAB_ORDER.filter((t) => tabs.has(t));
}

// --- build ---------------------------------------------------------------------------

export function experienceProject(root, topic, id) {
  if (!ID.test(id ?? '')) throw new Error(`experience id "${id}" must be lowercase words joined by dashes`);
  const relative = `${topicPaths(topic).experiences_dir}/${id}`;
  return { relative, dir: path.join(root, relative), spec: path.join(root, relative, 'experience.json'), built: path.join(root, relative, 'experience.built.json') };
}

export function readExperienceSpec(root, topic, id) {
  const project = experienceProject(root, topic, id);
  if (!isFile(project.spec)) return { project, spec: null, problem: `${project.relative}/experience.json is missing; write it first (see .claude/skills/learn-video)` };
  try {
    return { project, spec: readJson(project.spec), problem: null };
  } catch (error) {
    return { project, spec: null, problem: `${project.relative}/experience.json does not parse: ${error.message}` };
  }
}

export function listExperienceIds(root, topic) {
  const dir = path.join(root, topicPaths(topic).experiences_dir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && isFile(path.join(dir, e.name, 'experience.json'))).map((e) => e.name).sort();
}

function videoPart(root, entry) {
  const v = entry.video;
  const transcript = v.transcript && isFile(path.join(root, v.transcript)) ? readText(path.join(root, v.transcript)) : '';
  return {
    video_id: entry.id,
    title: entry.title,
    status: v.status,
    blocker: v.blocker ?? null,
    mp4_url: v.status === 'rendered' ? v.url ?? null : null,
    captions_url: v.status === 'rendered' ? v.captions_url ?? null : null,
    composition_url: v.composition_url ?? null,
    duration: v.duration_s,
    scenes: v.timeline ?? [],
    transcript,
    explanation: entry.explanation,
    alt: entry.alt,
  };
}

/**
 * Build an experience: build its videos and deck when they changed, check
 * every reference, and write experience.built.json for the site. Returns
 * { ok, problems, warnings, built, entry, cached }.
 */
export function buildExperience(root, topic, id, { tools = null, spawn = undefined, lint = true } = {}) {
  const { project, spec, problem } = readExperienceSpec(root, topic, id);
  if (problem) return { ok: false, problems: [problem], warnings: [] };
  const ctx = topicContext(root, topic);
  const shape = experienceSpecProblems(spec, { id, sourceIds: ctx.sourceIds, conceptIds: ctx.conceptIds });
  if (shape.length) return { ok: false, problems: shape, warnings: [] };
  const warnings = [];
  const problems = [];
  const toolset = tools ?? videoTools();

  const videoIds = [...new Set([spec.watch?.video, spec.guided?.video, spec.summary_video].filter(Boolean))];
  const partHashes = {};
  for (const vid of videoIds) {
    const { spec: vspec, problem: vproblem } = readVideoSpec(root, topic, vid);
    if (vproblem) { problems.push(vproblem); continue; }
    if (!vspec.used_in?.includes(spec.used_in[0])) warnings.push(`video ${vid} does not list ${spec.used_in[0]} in its used_in`);
    const built = buildVideo(root, topic, vid, { tools: toolset });
    if (!built.ok) { problems.push(...built.problems.map((p) => `video ${vid}: ${p}`)); continue; }
    warnings.push(...built.warnings.map((w) => `video ${vid}: ${w}`));
    partHashes[vid] = built.input_hash;
    if (lint) {
      const linted = lintVideo(root, topic, vid, { tools: toolset, ...(spawn ? { spawn } : {}) });
      if (!linted.ok) problems.push(...(linted.problems?.length ? linted.problems : ['lint failed']).map((p) => `video ${vid} HyperFrames lint: ${p}`));
      else if (linted.skipped) warnings.push(`video ${vid}: HyperFrames lint skipped (${linted.reason})`);
    }
  }
  if (spec.deck) {
    const { spec: dspec, problem: dproblem } = readDeckSpec(root, topic, spec.deck);
    if (dproblem) problems.push(dproblem);
    else {
      const built = buildDeck(root, topic, spec.deck);
      if (!built.ok) problems.push(...built.problems.map((p) => `deck ${spec.deck}: ${p}`));
      else {
        warnings.push(...built.warnings.map((w) => `deck ${spec.deck}: ${w}`));
        partHashes[spec.deck] = built.entry.deck.input_hash;
        if (!dspec.used_in?.includes(spec.used_in[0])) warnings.push(`deck ${spec.deck} does not list ${spec.used_in[0]} in its used_in`);
      }
    }
  }
  if (problems.length) return { ok: false, problems, warnings };

  const registry = readVisuals(root, topic).entries;
  const byId = new Map(registry.map((e) => [e.id, e]));
  const guided = spec.guided ? byId.get(spec.guided.video) : null;
  const deck = spec.deck ? byId.get(spec.deck) : null;
  const scenes = guided ? new Set((guided.video.timeline ?? []).map((s) => s.id)) : null;
  const slides = deck ? new Set((deck.deck.timeline ?? []).map((s) => s.id)) : null;
  problems.push(...experienceSpecProblems(spec, { id, scenes, slides }).filter((p) => /names (scene|slide)|revisit scene/.test(p)));
  const firstScene = guided?.video?.timeline?.[0]?.id;
  for (const cp of spec.checkpoints ?? []) {
    if (firstScene && cp.at?.scene === firstScene) problems.push(`checkpoint ${cp.id} pauses at the first scene "${firstScene}", before anything plays; attach it to a later scene or to { "tab": "practice" }`);
  }
  if (guided && !guided.video.composition_url) problems.push(`the guided video ${guided.id} has no published composition (install site dependencies: \`npm install\` in site/)`);
  if (deck && !deck.deck.composition_url) problems.push(`the deck ${deck.id} has no published composition (install site dependencies: \`npm install\` in site/)`);
  if (spec.fallback_visual) {
    const fallback = byId.get(spec.fallback_visual);
    if (!fallback) problems.push(`fallback_visual "${spec.fallback_visual}" is not registered; register a static diagram with \`tutor visuals ${topic.id} add\``);
    else if (!STATIC_FORMATS.includes(fallback.format)) problems.push(`fallback_visual "${spec.fallback_visual}" is ${fallback.format}; it must be a static mermaid, svg or image visual`);
  }
  if (problems.length) return { ok: false, problems, warnings };

  const input_hash = hash(JSON.stringify({ GENERATOR_VERSION, spec, partHashes, sources: sourcesFingerprint(ctx.sourcesById, spec.source_ids) }));
  const page = spec.used_in[0];
  const builtConfig = {
    generated_by: 'tutor experience build',
    id: spec.id,
    topic: topic.id,
    title: spec.title,
    mode: spec.mode,
    objective: spec.objective,
    level: spec.level,
    summary: spec.summary,
    page,
    page_url: lessonPageUrl(topic, path.basename(page)),
    tabs: experienceTabs(spec),
    watch: spec.watch ? videoPart(root, byId.get(spec.watch.video)) : null,
    guided: guided ? videoPart(root, guided) : null,
    summary_video: spec.summary_video ? videoPart(root, byId.get(spec.summary_video)) : null,
    simulation: spec.simulation ? { component: spec.simulation.component, props: spec.simulation.props, presets: spec.simulation.presets ?? {} } : null,
    sync: spec.sync ?? [],
    inspect: spec.inspect ?? [],
    deck: deck ? {
      deck_id: deck.id,
      title: deck.title,
      composition_url: deck.deck.composition_url,
      island: deck.deck.island,
      scenes: deck.deck.timeline,
      outline: isFile(path.join(root, deck.deck.outline)) ? readText(path.join(root, deck.deck.outline)) : '',
      explanation: deck.explanation,
    } : null,
    checkpoints: (spec.checkpoints ?? []).map((cp) => ({ ...cp, at: cp.at ?? { tab: 'practice' } })),
    fallback_visual: spec.fallback_visual ?? null,
    concept_ids: spec.concept_ids,
    sources: spec.source_ids.map((sid) => {
      const s = ctx.sourcesById.get(sid);
      return { id: sid, title: s?.title ?? sid, url: s?.url ?? null };
    }),
    input_hash,
  };
  const previous = isFile(project.built) ? readText(project.built) : null;
  const next = `${JSON.stringify(builtConfig, null, 2)}\n`;
  const cached = previous === next;
  if (!cached) writeTextAtomic(project.built, next);

  const entries = readVisuals(root, topic).entries;
  const index = entries.findIndex((e) => e.id === spec.id);
  const entry = {
    ...(index === -1 ? {} : entries[index]),
    id: spec.id,
    title: spec.title,
    kind: 'experience',
    format: 'experience',
    component: 'Experience',
    concept_ids: spec.concept_ids,
    source_ids: spec.source_ids,
    purpose: spec.objective,
    explanation: experienceExplanation(spec),
    alt: spec.summary,
    learning_check: firstCheck(spec),
    used_in: spec.used_in,
    experience: {
      mode: spec.mode,
      level: spec.level,
      project_dir: project.relative,
      built: `${project.relative}/experience.built.json`,
      tabs: builtConfig.tabs,
      parts: { watch: spec.watch?.video ?? null, guided: spec.guided?.video ?? null, deck: spec.deck ?? null, summary_video: spec.summary_video ?? null, simulation: spec.simulation?.component ?? null },
      checkpoints: (spec.checkpoints ?? []).length,
      fallback_visual: spec.fallback_visual ?? null,
      input_hash,
      spec_hash: hash(JSON.stringify(spec)),
      built_at: cached && index !== -1 ? entries[index].experience?.built_at ?? isoNow() : isoNow(),
    },
  };
  if (index === -1) entries.push(entry);
  else entries[index] = entry;
  writeVisuals(root, topic, entries);
  return { ok: true, problems: [], warnings, built: `${project.relative}/experience.built.json`, entry, cached };
}

function experienceExplanation(spec) {
  const parts = { explainer: 'Watch a short explainer', interactive: 'Step through an animated walkthrough, change the simulation and answer the checkpoints', branching: 'Choose a path through the deck and open the deep dives', hybrid: 'Watch, experiment with the simulation, step through the walkthrough, explore the deep dives and practice' };
  return `${parts[spec.mode] ?? 'Explore'}. ${spec.objective}`.split(/\s+/).slice(0, 90).join(' ');
}

function firstCheck(spec) {
  const cp = (spec.checkpoints ?? []).find((c) => ['predict', 'verify'].includes(c.kind));
  if (cp) return { question: cp.prompt, answer: `${cp.choices.find((c) => c.correct)?.text}. ${cp.explanation}` };
  const any = (spec.checkpoints ?? [])[0];
  return any ? { question: any.prompt, answer: any.explanation } : { question: `What can you do after "${spec.title}"?`, answer: spec.objective };
}

/** Problems of a registered experience entry and its built file (no build). */
export function experienceEntryProblems(root, topic, entry) {
  const problems = [];
  const exp = entry.experience;
  if (!exp || typeof exp !== 'object') return ['an experience needs an `experience` object (written by `tutor experience build`)'];
  if (!EXPERIENCE_MODES.includes(exp.mode)) problems.push('`experience.mode` is not a known mode');
  if (!text(exp.built) || !isFile(path.join(root, exp.built))) return [...problems, `${exp.built ?? 'experience.built.json'} is missing; run \`tutor experience ${topic.id} build ${entry.id}\``];
  const { spec } = readExperienceSpec(root, topic, entry.id);
  if (!spec) problems.push(`${exp.project_dir}/experience.json is missing`);
  try {
    const built = readJson(path.join(root, exp.built));
    if (built.input_hash !== exp.input_hash) problems.push('experience.built.json is out of date; rebuild');
    if (spec && exp.spec_hash !== hash(JSON.stringify(spec))) problems.push(`experience.json changed after the last build; run \`tutor experience ${topic.id} build ${entry.id}\``);
  } catch (error) {
    problems.push(`experience.built.json does not parse: ${error.message}`);
  }
  return problems;
}

// --- learner progress, misconceptions and mastery ------------------------------------

export function progressFile(root, topic) {
  return path.join(root, topicPaths(topic).progress_json);
}

export function readProgress(root, topic) {
  const file = progressFile(root, topic);
  if (!isFile(file)) return { records: {}, concepts: {}, imported: [] };
  try { return readJson(file); } catch { return { records: {}, concepts: {}, imported: [] }; }
}

const STATUSES = ['correct', 'wrong', 'done', 'skipped'];

/** Problems of an exported progress file. */
export function progressProblems(data, topic) {
  if (!data || data.format !== 'tutor-progress' || data.v !== 1) return ['not a tutor progress export (format "tutor-progress", v 1)'];
  const problems = [];
  if (data.topic !== topic.id) problems.push(`the export is for topic ${data.topic}, not ${topic.id}`);
  if (!data.experiences || typeof data.experiences !== 'object') problems.push('`experiences` must map an experience id to its progress');
  for (const [eid, exp] of Object.entries(data.experiences ?? {})) {
    for (const [cid, cp] of Object.entries(exp?.checkpoints ?? {})) {
      if (!STATUSES.includes(cp?.status)) problems.push(`${eid}/${cid}: status must be one of ${STATUSES.join(', ')}`);
      if (!Array.isArray(cp?.history ?? [])) problems.push(`${eid}/${cid}: history must be a list`);
    }
  }
  return problems;
}

/** Mastery of one concept from its graded attempts: Laplace-smoothed share correct. */
export function masteryOf(stats) {
  const graded = (stats?.correct ?? 0) + (stats?.wrong ?? 0);
  return graded === 0 ? null : Math.round(((stats.correct + 1) / (graded + 2)) * 100) / 100;
}

/**
 * Merge an exported progress file into state/topics/<id>/progress.json, then
 * recompute concept mastery and misconceptions. Re-importing the same export
 * changes nothing. Returns { progress, weak, problems }.
 */
export function mergeProgress(root, topic, data) {
  const problems = progressProblems(data, topic);
  if (problems.length) return { problems };
  const progress = readProgress(root, topic);
  progress.records ??= {};
  const definitions = new Map();
  for (const eid of Object.keys(data.experiences)) {
    const project = experienceProject(root, topic, eid);
    if (!isFile(project.built)) { problems.push(`experience ${eid} is not built in this repository`); continue; }
    for (const cp of readJson(project.built).checkpoints ?? []) definitions.set(`${eid}/${cp.id}`, cp);
  }
  if (problems.length) return { problems };
  for (const [eid, exp] of Object.entries(data.experiences)) {
    for (const [cid, cp] of Object.entries(exp.checkpoints ?? {})) {
      const key = `${eid}/${cid}`;
      const def = definitions.get(key);
      if (!def) { problems.push(`${key} is not a checkpoint of the built experience`); continue; }
      const record = progress.records[key] ?? { experience: eid, checkpoint: cid, kind: def.kind, concept_ids: def.concept_ids, attempts: [] };
      const seen = new Set(record.attempts.map((a) => a.at));
      for (const attempt of cp.history ?? [{ at: cp.at ?? data.exported_at, status: cp.status, misconception: cp.misconception ?? null }]) {
        if (!attempt?.at || seen.has(attempt.at) || !STATUSES.includes(attempt.status)) continue;
        record.attempts.push({ at: attempt.at, status: attempt.status, misconception: attempt.misconception ?? null });
        seen.add(attempt.at);
      }
      record.attempts.sort((a, b) => String(a.at).localeCompare(String(b.at)));
      record.status = record.attempts.at(-1)?.status ?? cp.status;
      record.concept_ids = def.concept_ids;
      record.revisit = def.revisit ?? null;
      progress.records[key] = record;
    }
    progress.experiences ??= {};
    progress.experiences[eid] = { tab: exp.tab ?? null, watched: exp.watched ?? {}, visited_slides: exp.visited_slides ?? [], branches: exp.branches ?? [], updated: exp.updated ?? data.exported_at ?? null };
  }
  if (problems.length) return { problems };
  progress.concepts = conceptStats(progress.records);
  progress.imported = [...new Set([...(progress.imported ?? []), String(data.exported_at ?? isoNow())])].slice(-50);
  progress.updated = today();
  writeJsonAtomic(progressFile(root, topic), progress);
  return { problems: [], progress, weak: weakConcepts(topic, progress) };
}

function conceptStats(records) {
  const concepts = {};
  for (const record of Object.values(records)) {
    for (const cid of record.concept_ids ?? []) {
      const c = concepts[cid] ?? { correct: 0, wrong: 0, misconceptions: [], checkpoints: [] };
      for (const a of record.attempts) {
        if (a.status === 'correct') c.correct += 1;
        if (a.status === 'wrong') c.wrong += 1;
        if (a.misconception && !c.misconceptions.includes(a.misconception)) c.misconceptions.push(a.misconception);
      }
      c.checkpoints.push(`${record.experience}/${record.checkpoint}`);
      concepts[cid] = c;
    }
  }
  for (const c of Object.values(concepts)) c.mastery = masteryOf(c);
  return concepts;
}

/** Concepts below 0.6 mastery, weakest first, with the scene to replay. */
export function weakConcepts(topic, progress, threshold = 0.6) {
  const titles = new Map((topic.plan?.curriculum?.concepts ?? []).map((c) => [c.id, c.title]));
  return Object.entries(progress.concepts ?? {})
    .filter(([, c]) => c.mastery !== null && c.mastery < threshold)
    .sort((a, b) => a[1].mastery - b[1].mastery)
    .map(([id, c]) => ({
      id,
      title: titles.get(id) ?? id,
      mastery: c.mastery,
      misconceptions: c.misconceptions,
      revisit: Object.values(progress.records ?? {}).filter((r) => r.concept_ids?.includes(id) && r.status === 'wrong' && r.revisit).map((r) => ({ experience: r.experience, scene: r.revisit })),
    }));
}

/** Recall cards whose question or answer names one of the concepts (by title). */
export function cardsForConcepts(root, topic, conceptIds) {
  const titles = (topic.plan?.curriculum?.concepts ?? []).filter((c) => conceptIds.includes(c.id)).map((c) => String(c.title ?? c.id).toLowerCase());
  if (!titles.length) return [];
  return readCards(root, topic).cards.filter((card) => {
    const body = `${card.question}\n${card.answer}`.toLowerCase();
    return titles.some((t) => body.includes(t));
  }).map((card) => card.id);
}

/**
 * Average recorded mastery (0–1) of concepts across every topic, matched by
 * concept id within a topic and by concept title across topics. Null when
 * nothing was recorded. Used by the experience-mode selector.
 */
export function recordedMastery(root, topics, { topicId = null, conceptIds = [], titles = [] } = {}) {
  const wanted = new Set(titles.map((t) => String(t).toLowerCase()));
  const values = [];
  for (const topic of topics) {
    const progress = readProgress(root, topic);
    const byTitle = new Map((topic.plan?.curriculum?.concepts ?? []).map((c) => [c.id, String(c.title ?? c.id).toLowerCase()]));
    for (const [cid, stats] of Object.entries(progress.concepts ?? {})) {
      if (stats.mastery === null || stats.mastery === undefined) continue;
      if ((topic.id === topicId && conceptIds.includes(cid)) || wanted.has(byTitle.get(cid))) values.push(stats.mastery);
    }
  }
  return values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null;
}
