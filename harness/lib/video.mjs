// Short explainer videos built with HeyGen's open-source HyperFrames
// (https://github.com/heygen-com/hyperframes, Apache 2.0).
//
// A video starts as a storyboard file, `video.json`, inside its project folder
// (`tutor paths` → videos_dir/<id>/). `buildVideo` turns it into a HyperFrames
// composition (index.html with a paused GSAP timeline registered on
// window.__timelines), captions (WebVTT), a transcript and a storyboard note,
// and synthesizes optional narration with a free local voice. `renderVideo`
// runs `npx hyperframes render` (locally when FFmpeg is installed, else with
// `--docker`), verifies the MP4 without ffprobe, and publishes it next to the
// site. A storyboard whose hash did not change is never rendered twice.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { hash } from './freshness.mjs';
import { isFile, readJson, readText, writeTextAtomic } from './io.mjs';
import { probeMp4, probeWav, vttStamp } from './media-files.mjs';
import { readSources } from './sources.mjs';
import { mediaUrl, topicPaths } from './topic-store.mjs';
import { curriculumIds, readVisuals, writeVisuals } from './visuals.mjs';
import { isoNow } from './clock.mjs';
import { compositionSafetyProblems, GSAP_CDN, publishComposition } from './composition-safety.mjs';

export const HYPERFRAMES_VERSION = '0.9.59';
export const GSAP_URL = GSAP_CDN;
const GENERATOR_VERSION = 8;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const wordCount = (value) => (text(value) ? value.trim().split(/\s+/).length : 0);
export const SCENE_TYPES = ['title', 'steps', 'flow', 'compare', 'equation', 'timeline', 'bars', 'custom'];
/** Comfortable narration pace for a technical explanation. */
export const MAX_WORDS_PER_SECOND = 2.8;
export const HF_ENV = { HYPERFRAMES_NO_TELEMETRY: '1', DO_NOT_TRACK: '1', HYPERFRAMES_SKIP_SKILLS: '1' };

// --- spec ------------------------------------------------------------------------

/** { problems, warnings } of a storyboard. */
export function videoSpecProblems(spec, { id = null, sourceIds = null, conceptIds = null, projectDir = null } = {}) {
  const problems = [];
  const warnings = [];
  const fail = (p) => problems.push(p);
  if (!spec || typeof spec !== 'object') return { problems: ['video.json must be an object'], warnings };
  if (!text(spec.id) || !ID.test(spec.id)) fail('`id` must be lowercase words joined by dashes');
  else if (id && spec.id !== id) fail(`\`id\` is "${spec.id}" but the folder is "${id}"`);
  if (wordCount(spec.title) < 3) fail('`title` must say what the video explains (3+ words)');
  if (!text(spec.purpose)) fail('`purpose` must state the one thing the learner should understand');
  if (wordCount(spec.sequence_reason) < 6) fail('`sequence_reason` must say why motion explains this better than a static diagram (a chronological process, a lifecycle, causality)');
  if (wordCount(spec.summary) < 12) fail('`summary` (12+ words) is the text alternative of the whole video');
  if (wordCount(spec.explanation) < 8) fail('`explanation` (8+ words) is shown under the player');
  if (!spec.learning_check || !text(spec.learning_check.question) || !text(spec.learning_check.answer)) fail('`learning_check` needs `question` and `answer`');
  if (!Array.isArray(spec.concept_ids) || !spec.concept_ids.length) fail('`concept_ids` must list the concepts it teaches');
  else if (conceptIds) {
    const unknown = spec.concept_ids.filter((c) => !conceptIds.has(c));
    if (unknown.length) fail(`\`concept_ids\` not in plan.curriculum: ${unknown.join(', ')}`);
  }
  if (!Array.isArray(spec.source_ids) || !spec.source_ids.length) fail('`source_ids` must list the vetted sources of every claim');
  else if (sourceIds) {
    const unknown = spec.source_ids.filter((s) => !sourceIds.has(s));
    if (unknown.length) fail(`\`source_ids\` not in sources.json: ${unknown.join(', ')}`);
  }
  if (!Array.isArray(spec.used_in) || !spec.used_in.length) fail('`used_in` must list the lesson page that embeds it with <Video id="…" />');
  if (spec.narration !== undefined && (typeof spec.narration !== 'object' || !['auto', 'say', 'kokoro', 'none'].includes(spec.narration.engine ?? 'auto'))) {
    fail('`narration.engine` must be auto, say, kokoro or none');
  }
  const scenes = Array.isArray(spec.scenes) ? spec.scenes : [];
  if (scenes.length < 3 || scenes.length > 10) fail('`scenes` must have 3 to 10 scenes');
  const ids = new Set();
  let total = 0;
  for (const [index, scene] of scenes.entries()) {
    const at = `scene ${scene?.id ?? index + 1}`;
    if (!scene || typeof scene !== 'object') { fail(`${at} must be an object`); continue; }
    if (!text(scene.id) || !ID.test(scene.id)) fail(`${at} needs a lowercase id`);
    else if (ids.has(scene.id)) fail(`duplicate scene id ${scene.id}`);
    ids.add(scene.id);
    if (typeof scene.duration !== 'number' || scene.duration < 3 || scene.duration > 20) fail(`${at} duration must be 3–20 seconds`);
    else total += scene.duration;
    if (!text(scene.heading)) fail(`${at} needs a heading`);
    const n = wordCount(scene.narration);
    if (n < 3 || n > 60) fail(`${at} narration must be 3–60 words (it is also the caption)`);
    else if (typeof scene.duration === 'number' && n / scene.duration > MAX_WORDS_PER_SECOND) {
      fail(`${at} narration has ${n} words for ${scene.duration} s; at most ${Math.floor(scene.duration * MAX_WORDS_PER_SECOND)} fit, so lengthen the scene or cut words`);
    }
    if (Array.isArray(scene.source_ids) && Array.isArray(spec.source_ids)) {
      const extra = scene.source_ids.filter((s) => !spec.source_ids.includes(s));
      if (extra.length) fail(`${at} source_ids must be a subset of the video's source_ids (${extra.join(', ')})`);
    }
    problems.push(...sceneVisualProblems(scene.visual, at, projectDir));
    const labels = visualLabels(scene.visual);
    if (labels.length && n >= 3 && !labels.some((labelText) => overlaps(scene.narration, labelText))) {
      warnings.push(`${at}: the narration names none of the labels on screen (${labels.slice(0, 4).join(', ')}); say what the learner sees`);
    }
  }
  if (total && (total < 20 || total > 120)) fail(`total length is ${total} s; keep a video between 20 and 120 s (aim for 30–90)`);
  else if (total && (total < 30 || total > 90)) warnings.push(`total length is ${total} s; 30–90 s works best`);
  return { problems, warnings };
}

export function sceneVisualProblems(visual, at, projectDir) {
  if (!visual || typeof visual !== 'object') return [`${at} needs a \`visual\``];
  const problems = [];
  const list = (value, min, max) => Array.isArray(value) && value.length >= min && value.length <= max;
  switch (visual.type) {
    case 'title': break;
    case 'steps': if (!list(visual.items, 2, 6) || !visual.items.every(text)) problems.push(`${at} steps need 2–6 text items`); break;
    case 'flow': {
      if (!list(visual.nodes, 2, 6) || !visual.nodes.every((n) => text(n?.id) && text(n?.label))) { problems.push(`${at} flow needs 2–6 nodes with id and label`); break; }
      const known = new Set(visual.nodes.map((n) => n.id));
      if (!list(visual.path, 1, 8)) problems.push(`${at} flow needs a path of 1–8 hops`);
      else for (const hop of visual.path) if (!known.has(hop?.from) || !known.has(hop?.to) || hop.from === hop.to) problems.push(`${at} flow hop ${hop?.from}→${hop?.to} must join two different known nodes`);
      break;
    }
    case 'compare':
      if (!text(visual.left?.label) || !text(visual.right?.label) || !list(visual.left?.items, 1, 5) || !list(visual.right?.items, 1, 5)) problems.push(`${at} compare needs left and right, each with a label and 1–5 items`);
      break;
    case 'equation':
      if (!text(visual.expression) || !list(visual.terms, 1, 5)) problems.push(`${at} equation needs an expression and 1–5 terms`);
      else for (const term of visual.terms) if (!text(term?.text) || !visual.expression.includes(term.text) || !text(term?.note)) problems.push(`${at} equation term "${term?.text}" must occur in the expression and have a note`);
      break;
    case 'timeline': if (!list(visual.events, 2, 7) || !visual.events.every((e) => text(e?.label))) problems.push(`${at} timeline needs 2–7 events with labels`); break;
    case 'bars': if (!list(visual.items, 2, 7) || !visual.items.every((b) => text(b?.label) && typeof b?.value === 'number' && b.value >= 0)) problems.push(`${at} bars need 2–7 items with label and a value ≥ 0`); break;
    case 'custom':
      if (!text(visual.html) || !/^scenes\/[\w.-]+\.html$/.test(visual.html)) problems.push(`${at} custom needs \`html\`: scenes/<name>.html`);
      else if (projectDir && !isFile(path.join(projectDir, visual.html))) problems.push(`${at} custom file ${visual.html} is missing`);
      if (visual.script !== undefined && (!/^scenes\/[\w.-]+\.js$/.test(visual.script) || (projectDir && !isFile(path.join(projectDir, visual.script))))) problems.push(`${at} custom \`script\` must be an existing scenes/<name>.js`);
      if (!Array.isArray(visual.labels) || !visual.labels.length) problems.push(`${at} custom needs \`labels\`: the words shown on screen (used for consistency checks)`);
      break;
    default: problems.push(`${at} visual.type must be one of ${SCENE_TYPES.join(', ')}`);
  }
  return problems;
}

export function visualLabels(visual) {
  if (!visual || typeof visual !== 'object') return [];
  switch (visual.type) {
    case 'steps': return visual.items ?? [];
    case 'flow': return (visual.nodes ?? []).map((n) => n.label);
    case 'compare': return [visual.left?.label, visual.right?.label].filter(Boolean);
    case 'equation': return (visual.terms ?? []).map((t) => t.text);
    case 'timeline': return (visual.events ?? []).map((e) => e.label);
    case 'bars': return (visual.items ?? []).map((b) => b.label);
    case 'custom': return visual.labels ?? [];
    default: return [];
  }
}

const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'or', 'in', 'on', 'is', 'it', 'its', 'for', 'with', 'by', 'at', 'as', 'be']);
function overlaps(narration, labelText) {
  const tokens = (s) => String(s).toLowerCase().match(/[a-z0-9]+/g)?.filter((w) => !STOP.has(w) && w.length > 1) ?? [];
  const said = new Set(tokens(narration).map((w) => w.replace(/s$/, '')));
  return tokens(labelText).some((w) => said.has(w.replace(/s$/, '')));
}

// --- timing, captions, transcript ---------------------------------------------------

/** Start and duration of every scene; a scene grows to fit its narration audio. */
export function sceneTiming(spec, audio = {}) {
  let start = 0;
  return spec.scenes.map((scene) => {
    const spoken = audio[scene.id]?.duration ?? 0;
    const duration = Math.max(scene.duration, spoken ? Math.ceil((spoken + 0.8) * 10) / 10 : 0);
    const timing = { id: scene.id, start: Math.round(start * 100) / 100, duration };
    start += duration;
    return timing;
  });
}

/** Split narration into caption cues of at most 12 words, spread over the scene by word count. */
export function captionCues(spec, timing) {
  const cues = [];
  spec.scenes.forEach((scene, index) => {
    const { start, duration } = timing[index];
    const sentences = scene.narration.trim().split(/(?<=[.!?])\s+/);
    const chunks = [];
    for (const sentence of sentences) {
      chunks.push(...splitCaption(sentence.split(/\s+/)));
    }
    const total = chunks.reduce((sum, c) => sum + c.split(/\s+/).length, 0);
    const usable = Math.max(1, duration - 0.4);
    let at = start + 0.2;
    for (const chunk of chunks) {
      const length = (chunk.split(/\s+/).length / total) * usable;
      cues.push({ scene: scene.id, start: Math.round(at * 100) / 100, end: Math.round((at + length) * 100) / 100, text: chunk });
      at += length;
    }
  });
  return cues;
}

/** Split a sentence into caption lines of at most 12 words, at a comma when one is near the middle. */
function splitCaption(words) {
  if (words.length <= 12) return [words.join(' ')];
  const parts = Math.ceil(words.length / 12);
  const size = Math.ceil(words.length / parts);
  let cut = size;
  for (let offset = 0; offset <= 3; offset++) {
    const candidates = [size - offset, size + offset].filter((i) => i > 2 && i < words.length - 2 && i <= 12 && words.length - i <= 12 * (parts - 1));
    const comma = candidates.find((i) => /[,;:]$/.test(words[i - 1]));
    if (comma) { cut = comma; break; }
  }
  return [words.slice(0, cut).join(' '), ...splitCaption(words.slice(cut))];
}

export function vttText(cues) {
  return ['WEBVTT', '', ...cues.flatMap((cue, i) => [`${i + 1}`, `${vttStamp(cue.start)} --> ${vttStamp(cue.end)}`, cue.text, ''])].join('\n');
}

function transcriptText(spec, timing, sourcesById) {
  const out = [`# ${spec.title}`, '', spec.summary, ''];
  spec.scenes.forEach((scene, i) => {
    out.push(`**${vttStamp(timing[i].start).slice(3, 8)} ${scene.heading}.** ${scene.narration}`, '');
  });
  out.push('Sources:', '');
  for (const id of spec.source_ids ?? []) {
    const s = sourcesById.get(id);
    out.push(s ? `- ${s.title} — ${s.url}` : `- ${id}`);
  }
  return `${out.join('\n')}\n`;
}

export function describeVisual(visual) {
  switch (visual?.type) {
    case 'title': return `Title card${visual.subtitle ? ` with "${visual.subtitle}"` : ''}.`;
    case 'steps': return `Numbered steps appear one at a time: ${visual.items.join(' → ')}.`;
    case 'flow': return `Nodes ${visual.nodes.map((n) => n.label).join(', ')}. A packet moves ${visual.path.map((h) => `${h.from}→${h.to}${h.label ? ` (${h.label})` : ''}`).join(', ')}; each node lights up when the packet arrives.`;
    case 'compare': return `Two columns, "${visual.left.label}" and "${visual.right.label}", fill in pairs${visual.verdict ? `; verdict: ${visual.verdict}` : ''}.`;
    case 'equation': return `The expression ${visual.expression} with ${visual.terms.map((t) => `"${t.text}"`).join(', ')} highlighted in turn and explained.`;
    case 'timeline': return `A timeline reveals ${visual.events.map((e) => e.label).join(' → ')}.`;
    case 'bars': return `Bars grow for ${visual.items.map((b) => `${b.label} ${b.value}${visual.unit ?? ''}`).join(', ')}.`;
    case 'custom': return `Custom scene ${visual.html}${visual.description ? `: ${visual.description}` : ''}.`;
    default: return '';
  }
}

function storyboardText(spec, timing) {
  const out = [`# Storyboard: ${spec.title}`, '', `**Purpose.** ${spec.purpose}`, '', `**Why a video.** ${spec.sequence_reason}`, '', `**Length.** ${timing.reduce((t, s) => t + s.duration, 0).toFixed(1)} s, ${spec.scenes.length} scenes.`, ''];
  spec.scenes.forEach((scene, i) => {
    const t = timing[i];
    out.push(`## ${i + 1}. ${scene.heading} (${t.start.toFixed(1)}–${(t.start + t.duration).toFixed(1)} s)`, '', `**On screen.** ${describeVisual(scene.visual)}`, '', `**Narration and caption.** ${scene.narration}`, '');
    if (scene.source_ids?.length) out.push(`**Sources.** ${scene.source_ids.join(', ')}`, '');
  });
  return out.join('\n');
}

// --- composition -------------------------------------------------------------------

export const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const js = (value) => JSON.stringify(value);
const r2 = (n) => Math.round(n * 100) / 100;

/** HTML and timeline lines for one scene. `p` is the element id prefix, `T` its start, `d` its length. */
export function renderScene(scene, p, T, d, projectDir) {
  const v = scene.visual;
  const anim = [];
  const at = (offset) => r2(T + offset);
  let html = '';
  switch (v.type) {
    case 'title':
      html = `<div class="title-card"><h1 id="${p}-big">${esc(scene.heading)}</h1>${v.subtitle ? `<p id="${p}-sub">${esc(v.subtitle)}</p>` : ''}</div>`;
      // The first frame is the thumbnail: a title at 0 s is already on screen.
      if (T > 0) anim.push(`tl.from(${js(`#${p}-big`)}, { opacity: 0, y: 30, duration: 0.7, ease: "power2.out" }, ${at(0.2)});`);
      if (v.subtitle) anim.push(`tl.from(${js(`#${p}-sub`)}, { opacity: 0, y: 16, duration: 0.6 }, ${at(0.9)});`);
      break;
    case 'steps': {
      const n = v.items.length;
      const step = Math.max(0.6, (d - 1.2) / n);
      html = `<ol class="steps">${v.items.map((item, i) => `<li id="${p}-i${i}"><span class="num">${i + 1}</span><span>${esc(item)}</span></li>`).join('')}</ol>`;
      v.items.forEach((_, i) => {
        anim.push(`tl.from(${js(`#${p}-i${i}`)}, { opacity: 0, x: -24, duration: 0.45 }, ${at(0.6 + i * step)});`);
        anim.push(`tl.to(${js(`#${p}-i${i}`)}, { borderLeftColor: "var(--accent)", backgroundColor: "var(--soft)", duration: 0.3 }, ${at(0.6 + i * step)});`);
        if (i > 0) anim.push(`tl.to(${js(`#${p}-i${i - 1}`)}, { borderLeftColor: "var(--line)", backgroundColor: "rgba(0,0,0,0)", opacity: 0.7, duration: 0.3 }, ${at(0.6 + i * step)});`);
      });
      break;
    }
    case 'flow': {
      const n = v.nodes.length;
      const slot = 1600 / n;
      const bw = Math.min(280, slot - 48);
      const cx = Object.fromEntries(v.nodes.map((node, i) => [node.id, 160 + slot * (i + 0.5)]));
      const y = 250, laneY = 430, topY = 90;
      const order = Object.fromEntries(v.nodes.map((node, i) => [node.id, i]));
      // Adjacent forward hops are straight lines. A forward hop that skips a node
      // goes over an upper lane, and every backward hop under a lower lane, so no
      // arrow passes through a node it does not touch (that would suggest a chain).
      const laneOf = (hop) => (cx[hop.from] < cx[hop.to] ? (order[hop.to] - order[hop.from] === 1 ? 'mid' : 'top') : 'low');
      const edges = [];
      const seen = new Set();
      v.path.forEach((hop) => {
        const key = `${hop.from}>${hop.to}`;
        if (seen.has(key)) return;
        seen.add(key);
        const lane = laneOf(hop);
        const d0 = lane === 'mid'
          ? `M ${r2(cx[hop.from] + bw / 2)} ${y} L ${r2(cx[hop.to] - bw / 2 - 6)} ${y}`
          : lane === 'top'
            ? `M ${r2(cx[hop.from])} ${y - 60} L ${r2(cx[hop.from])} ${topY} L ${r2(cx[hop.to])} ${topY} L ${r2(cx[hop.to])} ${y - 66}`
            : `M ${r2(cx[hop.from])} ${y + 60} L ${r2(cx[hop.from])} ${laneY} L ${r2(cx[hop.to])} ${laneY} L ${r2(cx[hop.to])} ${y + 66}`;
        edges.push(`<path d="${d0}" class="edge" marker-end="url(#${p}-arrow)"/>`);
      });
      html = `<svg class="edges" viewBox="0 0 1920 600" width="1920" height="600"><defs><marker id="${p}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--line-strong)"/></marker></defs>${edges.join('')}</svg>`
        + v.nodes.map((node) => `<div class="node" id="${p}-n-${node.id}" style="left:${r2(cx[node.id] - bw / 2)}px;top:${y - 60}px;width:${r2(bw)}px">${esc(node.label)}${node.sub ? `<small>${esc(node.sub)}</small>` : ''}</div>`).join('')
        + `<div class="packet" id="${p}-pkt"><span class="dot"></span><span class="pkt-label" id="${p}-pl"></span></div>`
        + `<p class="hop-note" id="${p}-hn"></p>`;
      const hops = v.path.length;
      const h = Math.max(0.9, (d - 1.4) / hops);
      anim.push(`tl.from(${js(`#${p} .node`)}, { opacity: 0, y: 20, duration: 0.5, stagger: 0.12 }, ${at(0.2)});`);
      anim.push(`tl.from(${js(`#${p} .edge`)}, { opacity: 0, duration: 0.4 }, ${at(0.5)});`);
      anim.push(`tl.set(${js(`#${p}-pkt`)}, { opacity: 0 }, ${at(0)});`);
      v.path.forEach((hop, k) => {
        const t0 = 0.9 + k * h;
        const lane = laneOf(hop);
        const sx = lane === 'mid' ? cx[hop.from] + bw / 2 : cx[hop.from];
        const sy = lane === 'mid' ? y : lane === 'top' ? topY : laneY;
        const ex = lane === 'mid' ? cx[hop.to] - bw / 2 - 20 : cx[hop.to];
        anim.push(`tl.set(${js(`#${p}-pkt`)}, { x: ${r2(sx)}, y: ${sy}, opacity: 1 }, ${at(t0)});`);
        // The label sits below the node row on the middle lane, below the line on
        // the upper lane, and above the line on the lower lane, so it never covers
        // a node or the hop note.
        anim.push(`tl.set(${js(`#${p}-pl`)}, { textContent: ${js(hop.packet ?? '')}, top: ${lane === 'mid' ? 76 : lane === 'top' ? 26 : -74} }, ${at(t0)});`);
        anim.push(`tl.set(${js(`#${p}-hn`)}, { textContent: ${js(hop.label ?? '')} }, ${at(t0)});`);
        anim.push(`tl.to(${js(`#${p}-pkt`)}, { x: ${r2(ex)}, duration: ${r2(h * 0.6)}, ease: "power1.inOut" }, ${at(t0)});`);
        anim.push(`tl.to(${js(`#${p}-n-${hop.to}`)}, { borderColor: "var(--accent)", backgroundColor: "var(--soft)", duration: 0.25 }, ${at(t0 + h * 0.6)});`);
        anim.push(`tl.to(${js(`#${p} .node:not(#${p}-n-${hop.to})`)}, { borderColor: "var(--line-strong)", backgroundColor: "var(--bg)", duration: 0.25 }, ${at(t0 + h * 0.6)});`);
      });
      break;
    }
    case 'compare': {
      const col = (side, data) => `<div class="col" id="${p}-${side}"><h3>${esc(data.label)}</h3><ul>${data.items.map((item, i) => `<li id="${p}-${side}${i}">${esc(item)}</li>`).join('')}</ul></div>`;
      html = `<div class="compare">${col('l', v.left)}${col('r', v.right)}</div>${v.verdict ? `<p class="verdict" id="${p}-v">${esc(v.verdict)}</p>` : ''}`;
      const rows = Math.max(v.left.items.length, v.right.items.length);
      const step = Math.max(0.5, (d - 2) / (rows * 2));
      anim.push(`tl.from(${js(`#${p} .col h3`)}, { opacity: 0, y: 16, duration: 0.4, stagger: 0.2 }, ${at(0.3)});`);
      for (let i = 0; i < rows; i++) {
        if (i < v.left.items.length) anim.push(`tl.from(${js(`#${p}-l${i}`)}, { opacity: 0, x: -20, duration: 0.4 }, ${at(0.9 + i * 2 * step)});`);
        if (i < v.right.items.length) anim.push(`tl.from(${js(`#${p}-r${i}`)}, { opacity: 0, x: 20, duration: 0.4 }, ${at(0.9 + (i * 2 + 1) * step)});`);
      }
      // A closing line stays at least 0.5 s + 0.3 s per word on screen.
      if (v.verdict) anim.push(`tl.from(${js(`#${p}-v`)}, { opacity: 0, y: 12, duration: 0.4 }, ${at(Math.max(1.2, d - Math.max(2.2, 0.9 + 0.3 * wordCount(v.verdict))))});`);
      break;
    }
    case 'equation': {
      // Wrap each term at its first free occurrence in the expression, whatever
      // the order of the terms list (terms are highlighted in list order).
      const taken = [];
      const spans = [];
      v.terms.forEach((term, i) => {
        let from = 0;
        let index;
        while ((index = v.expression.indexOf(term.text, from)) !== -1) {
          const end = index + term.text.length;
          const free = !taken.some(([a, b]) => index < b && end > a);
          const word = !/\w/.test(v.expression[index - 1] ?? '') && !/\w/.test(v.expression[end] ?? '');
          if (free && word) break;
          from = index + 1;
        }
        if (index === -1) return;
        taken.push([index, index + term.text.length]);
        spans.push({ index, end: index + term.text.length, i, text: term.text });
      });
      spans.sort((a, b) => a.index - b.index);
      const parts = [];
      let cursor = 0;
      for (const span of spans) {
        parts.push(esc(v.expression.slice(cursor, span.index)), `<span class="term" id="${p}-t${span.i}">${esc(span.text)}</span>`);
        cursor = span.end;
      }
      parts.push(esc(v.expression.slice(cursor)));
      html = `<p class="expression">${parts.join('')}</p><ul class="notes">${v.terms.map((term, i) => `<li id="${p}-note${i}"><b>${esc(term.text)}</b> ${esc(term.note)}</li>`).join('')}</ul>`;
      const step = Math.max(0.8, (d - 1.5) / v.terms.length);
      anim.push(`tl.from(${js(`#${p} .expression`)}, { opacity: 0, scale: 0.96, duration: 0.6 }, ${at(0.2)});`);
      v.terms.forEach((_, i) => {
        if (!spans.some((span) => span.i === i)) return;
        anim.push(`tl.to(${js(`#${p}-t${i}`)}, { color: "var(--accent)", backgroundColor: "var(--soft)", duration: 0.3 }, ${at(0.9 + i * step)});`);
        anim.push(`tl.from(${js(`#${p}-note${i}`)}, { opacity: 0, y: 12, duration: 0.4 }, ${at(0.9 + i * step)});`);
      });
      break;
    }
    case 'timeline': {
      const n = v.events.length;
      const gap = 1500 / Math.max(1, n - 1);
      html = `<div class="tl-line"></div>${v.events.map((event, i) => `<div class="tl-ev" id="${p}-e${i}" style="left:${r2(210 + i * gap)}px"><span class="tl-dot"></span><b>${esc(event.label)}</b>${event.detail ? `<small>${esc(event.detail)}</small>` : ''}</div>`).join('')}`;
      const step = Math.max(0.6, (d - 1.2) / n);
      anim.push(`tl.from(${js(`#${p} .tl-line`)}, { scaleX: 0, transformOrigin: "left center", duration: 0.8 }, ${at(0.2)});`);
      v.events.forEach((_, i) => anim.push(`tl.from(${js(`#${p}-e${i}`)}, { opacity: 0, y: 18, duration: 0.4 }, ${at(0.7 + i * step)});`));
      break;
    }
    case 'bars': {
      const max = Math.max(...v.items.map((b) => b.value), 1);
      html = `<div class="bars">${v.items.map((b, i) => `<div class="bar-row"><span class="bar-label">${esc(b.label)}</span><span class="bar" id="${p}-b${i}" style="width:${r2((b.value / max) * 1000)}px"></span><span class="bar-value" id="${p}-bv${i}">${esc(`${b.value.toLocaleString('en-US')}${v.unit ?? ''}`)}</span></div>`).join('')}</div>`;
      const step = Math.max(0.5, (d - 1.2) / v.items.length);
      v.items.forEach((_, i) => {
        anim.push(`tl.from(${js(`#${p}-b${i}`)}, { scaleX: 0, transformOrigin: "left center", duration: 0.6, ease: "power2.out" }, ${at(0.5 + i * step)});`);
        anim.push(`tl.from(${js(`#${p}-bv${i}`)}, { opacity: 0, duration: 0.3 }, ${at(0.9 + i * step)});`);
      });
      break;
    }
    case 'custom': {
      html = `<div class="custom">${readText(path.join(projectDir, v.html))}</div>`;
      if (v.script) anim.push(`(function (tl, T, D, scene) {\n${readText(path.join(projectDir, v.script))}\n})(tl, ${T}, ${d}, document.getElementById(${js(p)}));`);
      break;
    }
  }
  return { html, anim };
}

export const FONT_FILES = ['atkinson-regular.woff', 'atkinson-bold.woff'];

/** Styles shared by video and deck compositions: fonts, tokens and every scene visual. */
export const SCENE_CSS = `      @font-face { font-family: "Atkinson"; src: url("assets/fonts/${FONT_FILES[0]}") format("woff"); font-weight: 400; }
      @font-face { font-family: "Atkinson"; src: url("assets/fonts/${FONT_FILES[1]}") format("woff"); font-weight: 700; }
      :root { --bg: #fcfcfb; --surface: #f3f2ee; --ink: #1a1a19; --ink-2: #52514e; --line: #e1e0d9; --line-strong: #c3c2b7; --accent: #2a78d6; --soft: rgba(42, 120, 214, 0.12); --good: #0ca30c; --bad: #d03b3b; --font: "Atkinson", "Helvetica Neue", Arial, sans-serif; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: var(--bg); color: var(--ink); font-family: var(--font); }
      #root { position: relative; width: 1920px; height: 1080px; }
      .scene { position: absolute; inset: 0; }
      .kicker { position: absolute; left: 120px; top: 70px; font-size: 28px; color: var(--ink-2); letter-spacing: 0.02em; }
      .heading { position: absolute; left: 120px; top: 112px; right: 120px; font-size: 60px; line-height: 1.1; letter-spacing: -0.01em; }
      .stage { position: absolute; left: 0; top: 240px; width: 1920px; height: 600px; }
      .title-card { position: absolute; inset: 0 160px; display: flex; flex-direction: column; justify-content: center; gap: 28px; }
      .title-card h1 { font-size: 92px; line-height: 1.05; letter-spacing: -0.02em; }
      .title-card p { font-size: 40px; color: var(--ink-2); }
      .steps { list-style: none; position: absolute; left: 160px; right: 160px; top: 10px; display: grid; gap: 18px; }
      .steps li { display: flex; gap: 24px; align-items: center; font-size: 40px; padding: 14px 24px; border-left: 8px solid var(--line); border-radius: 6px; }
      .steps .num { font-weight: 700; color: var(--accent); min-width: 40px; }
      .edges { position: absolute; left: 0; top: 0; overflow: visible; }
      .edge { fill: none; stroke: var(--line-strong); stroke-width: 4; }
      .node { position: absolute; height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-size: 34px; font-weight: 700; border: 4px solid var(--line-strong); border-radius: 14px; background: var(--bg); padding: 8px 12px; line-height: 1.1; }
      .node small { font-size: 28px; font-weight: 400; color: var(--ink-2); margin-top: 6px; }
      .packet { position: absolute; left: 0; top: 0; opacity: 0; }
      .packet .dot { position: absolute; left: -18px; top: -18px; width: 36px; height: 36px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 8px var(--soft); }
      .pkt-label { position: absolute; left: -200px; width: 400px; top: 28px; text-align: center; font-size: 30px; font-weight: 700; color: var(--accent); }
      .hop-note { position: absolute; left: 160px; right: 160px; top: 520px; text-align: center; font-size: 32px; color: var(--ink-2); }
      .compare { position: absolute; left: 160px; right: 160px; top: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
      .col h3 { font-size: 44px; padding-bottom: 14px; border-bottom: 4px solid var(--line-strong); margin-bottom: 18px; }
      .col ul { list-style: none; display: grid; gap: 16px; font-size: 34px; }
      .col li::before { content: "– "; color: var(--accent); }
      .verdict { position: absolute; left: 160px; right: 160px; top: 500px; font-size: 38px; font-weight: 700; }
      .expression { position: absolute; left: 120px; right: 120px; top: 30px; text-align: center; font-size: 76px; font-family: "SF Mono", Menlo, Consolas, monospace; }
      .term { padding: 0 10px; border-radius: 8px; }
      .notes { position: absolute; left: 220px; right: 220px; top: 220px; list-style: none; display: grid; gap: 16px; font-size: 34px; }
      .notes b { color: var(--accent); font-family: "SF Mono", Menlo, Consolas, monospace; margin-right: 12px; }
      .tl-line { position: absolute; left: 200px; right: 200px; top: 160px; height: 6px; background: var(--line-strong); border-radius: 3px; }
      .tl-ev { position: absolute; top: 140px; width: 260px; margin-left: -130px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
      .tl-dot { width: 46px; height: 46px; border-radius: 50%; background: var(--accent); border: 8px solid var(--bg); }
      .tl-ev b { font-size: 32px; }
      .tl-ev small { font-size: 28px; color: var(--ink-2); }
      .bars { position: absolute; left: 160px; right: 160px; top: 0; display: grid; gap: 22px; }
      .bar-row { display: grid; grid-template-columns: 340px auto 1fr; align-items: center; gap: 24px; font-size: 34px; }
      .bar { display: block; height: 52px; background: var(--accent); border-radius: 6px; }
      .bar-value { font-weight: 700; white-space: nowrap; }
      .custom { position: absolute; inset: 0; }
      .caption { position: absolute; left: 0; right: 0; bottom: 70px; display: flex; justify-content: center; }
      .caption p { max-width: 1500px; font-size: 40px; line-height: 1.3; text-align: center; background: rgba(26, 26, 25, 0.86); color: #fff; padding: 14px 28px; border-radius: 10px; }`;

export function compositionHtml(spec, timing, cues, { projectDir, audio = {}, topicTitle = '' } = {}) {
  const total = r2(timing.reduce((t, s) => t + s.duration, 0));
  const scenes = [];
  const anim = [];
  spec.scenes.forEach((scene, i) => {
    const { start, duration } = timing[i];
    const p = `sc${i + 1}`;
    const body = renderScene(scene, p, start, duration, projectDir);
    const header = scene.visual.type === 'title' ? '' : `<p class="kicker">${esc(topicTitle || spec.title)} · ${i + 1}/${spec.scenes.length}</p><h2 class="heading" id="${p}-h">${esc(scene.heading)}</h2>`;
    scenes.push(`<section id="${p}" class="clip scene" data-start="${start}" data-duration="${duration}" data-track-index="0">${header}<div class="stage">${body.html}</div></section>`);
    if (header && start > 0) anim.push(`tl.from(${js(`#${p}-h`)}, { opacity: 0, y: 20, duration: 0.5 }, ${r2(start + 0.05)});`);
    anim.push(...body.anim);
  });
  const captions = cues.map((cue, i) => `<div class="clip caption" id="cap${i + 1}" data-start="${cue.start}" data-duration="${r2(cue.end - cue.start)}" data-track-index="1"><p>${esc(cue.text)}</p></div>`);
  const voices = spec.scenes.map((scene, i) => audio[scene.id]
    ? `<audio id="vo${i + 1}" data-start="${timing[i].start}" data-duration="${r2(audio[scene.id].duration)}" data-track-index="2" data-volume="1" src="${audio[scene.id].file}"></audio>`
    : '').filter(Boolean);
  return `<!doctype html>
<!-- Generated by \`tutor video build\` from video.json. Edit video.json (or scenes/*.html), not this file. -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(spec.title)}</title>
    <script src="${GSAP_URL}"></script>
    <style>
${SCENE_CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
      ${scenes.join('\n      ')}
      ${captions.join('\n      ')}
      ${voices.join('\n      ')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${anim.join('\n      ')}
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}

// --- tools ---------------------------------------------------------------------------

function runs(command, args) {
  try {
    const result = spawnSync(command, args, { encoding: 'utf8', timeout: 20_000 });
    return result.status === 0;
  } catch {
    return false;
  }
}

/** What this machine can do for video. Cheap: no download, no network. */
export function videoTools() {
  const ffmpeg = runs('ffmpeg', ['-version']);
  const docker = runs('docker', ['info', '--format', '{{.ServerVersion}}']);
  const say = process.platform === 'darwin' && runs('which', ['say']);
  const kokoro = runs('python3', ['-c', 'import kokoro_onnx']);
  const npx = runs('npx', ['--version']);
  const renderer = !npx ? null : ffmpeg ? 'local' : docker ? 'docker' : null;
  const blocker = renderer ? null : !npx
    ? 'npx is not available, so the HyperFrames CLI cannot run'
    : 'FFmpeg is not installed and Docker is not running; install FFmpeg (for example `brew install ffmpeg`) or start Docker';
  return { ffmpeg, docker, say, kokoro, npx, renderer, blocker, hyperframes: HYPERFRAMES_VERSION };
}

function narrationEngine(spec, tools) {
  const wanted = spec.narration?.engine ?? 'auto';
  if (spec.narration?.enabled === false || wanted === 'none') return null;
  if (wanted === 'kokoro') return tools.kokoro ? 'kokoro' : null;
  if (wanted === 'say') return tools.say ? 'say' : null;
  return tools.kokoro ? 'kokoro' : tools.say ? 'say' : null;
}

function synthesize(engine, voice, textToSay, out, projectDir) {
  const scratch = `${out}.txt`;
  fs.writeFileSync(scratch, textToSay);
  let result;
  if (engine === 'say') {
    const args = ['-o', out, '--file-format=WAVE', '--data-format=LEI16@22050', '-f', scratch];
    if (voice) args.unshift('-v', voice);
    result = spawnSync('say', args, { encoding: 'utf8', timeout: 120_000 });
  } else {
    const args = ['--yes', `hyperframes@${HYPERFRAMES_VERSION}`, 'tts', scratch, '--output', out];
    if (voice) args.push('--voice', voice);
    result = spawnSync('npx', args, { cwd: projectDir, encoding: 'utf8', timeout: 300_000, env: { ...process.env, ...HF_ENV } });
  }
  fs.rmSync(scratch, { force: true });
  return result.status === 0 && isFile(out);
}

// --- build, render, check -------------------------------------------------------------

export function videoProject(root, topic, id) {
  if (!ID.test(id ?? '')) throw new Error(`video id "${id}" must be lowercase words joined by dashes`);
  const paths = topicPaths(topic);
  const relative = `${paths.videos_dir}/${id}`;
  return { relative, dir: path.join(root, relative), spec: path.join(root, relative, 'video.json') };
}

/**
 * Fingerprint of the vetted sources a storyboard cites: a source that was
 * re-verified or corrected changes the hash, so the video is rebuilt and
 * re-rendered; an unrelated source does not.
 */
export function sourcesFingerprint(sourcesById, ids = []) {
  return hash(JSON.stringify([...new Set(ids)].sort().map((id) => {
    const s = sourcesById.get(id);
    return s ? [id, s.url, s.title, s.verified_at ?? null] : [id, null];
  })));
}

function inputHash(spec, projectDir, engine, voice, sourcesById = new Map()) {
  const custom = spec.scenes
    .filter((s) => s.visual?.type === 'custom')
    .flatMap((s) => [s.visual.html, s.visual.script].filter(Boolean))
    .map((file) => (isFile(path.join(projectDir, file)) ? readText(path.join(projectDir, file)) : ''));
  return hash(JSON.stringify({ GENERATOR_VERSION, HYPERFRAMES_VERSION, spec, custom, engine, voice, sources: sourcesFingerprint(sourcesById, spec.source_ids) }));
}

export function topicContext(root, topic) {
  const sources = readSources(root, topic).entries;
  return { sourceIds: new Set(sources.map((s) => s.id)), sourcesById: new Map(sources.map((s) => [s.id, s])), conceptIds: curriculumIds(topic) };
}

export function readSpec(root, topic, id) {
  const project = videoProject(root, topic, id);
  if (!isFile(project.spec)) return { project, spec: null, problem: `${project.relative}/video.json is missing; write the storyboard first (see .claude/skills/learn-video)` };
  try {
    return { project, spec: readJson(project.spec), problem: null };
  } catch (error) {
    return { project, spec: null, problem: `${project.relative}/video.json does not parse: ${error.message}` };
  }
}

/** Upsert the registry entry of a video from its storyboard and render state. */
function syncRegistry(root, topic, spec, video) {
  const { entries } = readVisuals(root, topic);
  const index = entries.findIndex((e) => e.id === spec.id);
  const entry = {
    ...(index === -1 ? {} : entries[index]),
    id: spec.id,
    title: spec.title,
    kind: 'video',
    format: 'hyperframes',
    concept_ids: spec.concept_ids,
    source_ids: spec.source_ids,
    purpose: spec.purpose,
    explanation: spec.explanation,
    alt: spec.summary,
    learning_check: spec.learning_check,
    used_in: spec.used_in,
    video: { ...(index === -1 ? {} : entries[index].video), ...video },
  };
  if (index === -1) entries.push(entry);
  else entries[index] = entry;
  writeVisuals(root, topic, entries);
  return entry;
}

/**
 * Generate the HyperFrames project from video.json. Returns
 * { ok, problems, warnings, files, duration, narration, input_hash, entry }.
 */
export function buildVideo(root, topic, id, { tools = videoTools() } = {}) {
  const { project, spec, problem } = readSpec(root, topic, id);
  if (problem) return { ok: false, problems: [problem], warnings: [] };
  const ctx = topicContext(root, topic);
  const { problems, warnings } = videoSpecProblems(spec, { id, ...ctx, projectDir: project.dir });
  if (problems.length) return { ok: false, problems, warnings };
  const paths = topicPaths(topic);

  const engine = narrationEngine(spec, tools);
  const voice = spec.narration?.voice ?? null;
  const audio = {};
  if (engine) {
    fs.mkdirSync(path.join(project.dir, 'narration'), { recursive: true });
    for (const scene of spec.scenes) {
      const file = `narration/${scene.id}-${hash(`${engine}|${voice}|${scene.narration}`).slice(0, 10)}.wav`;
      const abs = path.join(project.dir, file);
      if (!isFile(abs) && !synthesize(engine, voice, scene.narration, abs, project.dir)) {
        warnings.push(`narration for scene ${scene.id} could not be synthesized with ${engine}; the video keeps captions only`);
        continue;
      }
      const probe = probeWav(abs);
      if (probe.ok) audio[scene.id] = { file, duration: probe.duration };
    }
  } else if ((spec.narration?.enabled ?? true) && (spec.narration?.engine ?? 'auto') !== 'none') {
    warnings.push('no local voice is available (macOS `say` or Kokoro); the video has captions but no narration');
  }

  const timing = sceneTiming(spec, audio);
  const cues = captionCues(spec, timing);
  const duration = r2(timing.reduce((t, s) => t + s.duration, 0));
  fs.mkdirSync(path.join(project.dir, 'assets', 'fonts'), { recursive: true });
  for (const font of FONT_FILES) {
    const from = path.join(root, 'site', 'src', 'assets', 'fonts', font);
    const to = path.join(project.dir, 'assets', 'fonts', font);
    if (isFile(from) && !isFile(to)) fs.copyFileSync(from, to);
  }
  const files = {
    'index.html': compositionHtml(spec, timing, cues, { projectDir: project.dir, audio, topicTitle: topic.title }),
    'captions.vtt': vttText(cues),
    'transcript.md': transcriptText(spec, timing, ctx.sourcesById),
    'storyboard.md': storyboardText(spec, timing),
    'package.json': `${JSON.stringify({ name: `${topic.slug}-${id}`, private: true, type: 'module', scripts: {
      dev: `npx --yes hyperframes@${HYPERFRAMES_VERSION} preview`,
      check: `npx --yes hyperframes@${HYPERFRAMES_VERSION} check`,
      render: `npx --yes hyperframes@${HYPERFRAMES_VERSION} render -o renders/${id}.mp4`,
    } }, null, 2)}\n`,
    'hyperframes.json': `${JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' } }, null, 2)}\n`,
    '.gitignore': 'renders/\nnode_modules/\n.hyperframes/\n',
  };
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(project.dir, name);
    if (!isFile(file) || readText(file) !== content) writeTextAtomic(file, content);
  }
  const input_hash = inputHash(spec, project.dir, engine, voice, ctx.sourcesById);
  const customScripts = spec.scenes.filter((s) => s.visual?.type === 'custom' && s.visual.script).map((s) => s.visual.script);
  const unsafe = compositionSafetyProblems(files['index.html'], { name: `${project.relative}/index.html` });
  if (unsafe.length) return { ok: false, problems: unsafe, warnings };
  // Publish the composition so the site can play it in <hyperframes-player>
  // (guided, interactive lessons need no MP4). Unchanged files are not rewritten.
  const compositionRelative = `${paths.media_dir}/${id}/composition`;
  const published = publishComposition(root, project.dir, compositionRelative, { extraScripts: customScripts });
  if (!published.ok) warnings.push(`the composition was not published for the site: ${published.problems.join('; ')}`);
  const timeline = spec.scenes.map((scene, i) => ({ id: scene.id, heading: scene.heading, start: timing[i].start, duration: timing[i].duration }));
  const previous = readVisuals(root, topic).entries.find((e) => e.id === id)?.video ?? {};
  const rendered = previous.status === 'rendered' && previous.rendered_hash === input_hash;
  const entry = syncRegistry(root, topic, spec, {
    project_dir: project.relative,
    status: rendered ? 'rendered' : 'storyboard',
    blocker: rendered ? null : (previous.rendered_hash ? 'the storyboard changed since the last render; run `tutor video <topic> render <id>`' : (tools.blocker ?? 'not rendered yet; run `tutor video <topic> render <id>`')),
    storyboard: `${project.relative}/storyboard.md`,
    transcript: `${project.relative}/transcript.md`,
    captions_source: `${project.relative}/captions.vtt`,
    duration_s: duration,
    scenes: spec.scenes.length,
    narration: engine ? `${engine}${voice ? ` (${voice})` : ''}` : 'none',
    input_hash,
    timeline,
    composition: published.ok ? `${compositionRelative}/index.html` : null,
    composition_url: published.ok ? `${mediaUrl(topic)}${id}/composition/index.html` : null,
  });
  return { ok: true, problems: [], warnings, files: Object.keys(files).map((f) => `${project.relative}/${f}`), duration, narration: engine ?? 'none', input_hash, entry };
}

/**
 * Render the project to MP4 and publish it under the topic's media folder.
 * Skips the render when the storyboard hash equals the last rendered hash
 * and the MP4 still exists (unless `force`). Never claims a render that did
 * not produce a playable MP4.
 */
export function renderVideo(root, topic, id, { force = false, docker = false, tools = videoTools(), spawn = spawnSync } = {}) {
  const built = buildVideo(root, topic, id, { tools });
  if (!built.ok) return { ok: false, rendered: false, problems: built.problems, warnings: built.warnings };
  const paths = topicPaths(topic);
  const { project, spec } = readSpec(root, topic, id);
  const mp4Relative = `${paths.media_dir}/${id}.mp4`;
  const vttRelative = `${paths.media_dir}/${id}.vtt`;
  const entry = built.entry;
  if (!force && entry.video.status === 'rendered' && isFile(path.join(root, mp4Relative))) {
    return { ok: true, rendered: false, cached: true, mp4: mp4Relative, duration: entry.video.duration_s, warnings: built.warnings, problems: [] };
  }
  const renderer = docker ? (tools.docker ? 'docker' : null) : tools.renderer;
  if (!renderer) {
    const blocker = docker ? 'Docker is not running' : tools.blocker;
    syncRegistry(root, topic, spec, { status: 'storyboard', blocker: `${blocker}. The storyboard, captions and transcript are ready; render later with \`tutor video ${topic.id} render ${id}\`.` });
    return { ok: false, rendered: false, blocked: true, problems: [`cannot render: ${blocker}`], warnings: built.warnings };
  }
  const env = { ...process.env, ...HF_ENV };
  const lintReport = runHyperframes(project.dir, ['lint', '.', '--json'], spawn).json;
  if (lintReport && lintReport.errorCount > 0) {
    const findings = lintErrors(lintReport);
    syncRegistry(root, topic, spec, { status: 'storyboard', blocker: `HyperFrames lint failed: ${findings.join('; ')}` });
    return { ok: false, rendered: false, problems: [`hyperframes lint found ${lintReport.errorCount} error(s)`, ...findings], warnings: built.warnings };
  }
  const out = `renders/${id}.mp4`;
  const args = ['--yes', `hyperframes@${HYPERFRAMES_VERSION}`, 'render', '-o', out, '--quality', 'standard'];
  if (renderer === 'docker') args.push('--docker');
  const started = Date.now();
  // Progress output of a long render (and of the one-time Docker image build) is
  // large: write it to a log file instead of holding it in memory.
  fs.mkdirSync(path.join(project.dir, 'renders'), { recursive: true });
  const logFile = path.join(project.dir, 'renders', 'render.log');
  const log = fs.openSync(logFile, 'w');
  let result;
  try {
    result = spawn('npx', args, { cwd: project.dir, timeout: 45 * 60_000, env, stdio: ['ignore', log, log] });
  } finally {
    fs.closeSync(log);
  }
  const produced = path.join(project.dir, out);
  const probe = isFile(produced) ? probeMp4(produced) : { ok: false, problem: 'no MP4 was written' };
  if (result.status !== 0 || !probe.ok) {
    const written = isFile(logFile) ? readText(logFile) : '';
    const tail = `${written}${result.stderr ?? ''}${result.stdout ?? ''}`.trim().split('\n').filter((line) => !line.startsWith('@hf-progress')).slice(-8).join(' | ');
    syncRegistry(root, topic, spec, { status: 'storyboard', blocker: `render failed (${renderer}): ${probe.problem ?? ''} ${tail}`.slice(0, 600) });
    return { ok: false, rendered: false, problems: [`hyperframes render failed with ${renderer}: ${probe.problem ?? `exit ${result.status}`}`, tail], warnings: built.warnings };
  }
  if (Math.abs(probe.duration - built.duration) > 1.5) {
    syncRegistry(root, topic, spec, { status: 'storyboard', blocker: `rendered MP4 lasts ${probe.duration.toFixed(1)} s, storyboard ${built.duration} s` });
    return { ok: false, rendered: false, problems: [`the MP4 lasts ${probe.duration.toFixed(1)} s but the storyboard lasts ${built.duration} s`], warnings: built.warnings };
  }
  fs.mkdirSync(path.join(root, paths.media_dir), { recursive: true });
  fs.copyFileSync(produced, path.join(root, mp4Relative));
  fs.copyFileSync(path.join(project.dir, 'captions.vtt'), path.join(root, vttRelative));
  syncRegistry(root, topic, spec, {
    status: 'rendered',
    blocker: null,
    mp4: mp4Relative,
    captions: vttRelative,
    url: `${mediaUrl(topic)}${id}.mp4`,
    captions_url: `${mediaUrl(topic)}${id}.vtt`,
    duration_s: r2(probe.duration),
    width: probe.width,
    height: probe.height,
    has_audio: probe.hasAudio,
    renderer,
    rendered_at: isoNow(),
    render_seconds: Math.round((Date.now() - started) / 1000),
    rendered_hash: built.input_hash,
  });
  return { ok: true, rendered: true, mp4: mp4Relative, duration: probe.duration, width: probe.width, height: probe.height, has_audio: probe.hasAudio, renderer, warnings: built.warnings, problems: [] };
}

/** Run a pinned HyperFrames CLI command in a project; parses JSON stdout when it has any. */
export function runHyperframes(cwd, args, spawn = spawnSync) {
  const result = spawn('npx', ['--yes', `hyperframes@${HYPERFRAMES_VERSION}`, ...args], { cwd, encoding: 'utf8', timeout: 300_000, env: { ...process.env, ...HF_ENV }, maxBuffer: 32 * 1024 * 1024 });
  let json = null;
  try { json = JSON.parse(result.stdout); } catch {
    // Some versions print a notice before the JSON document: parse the outermost object.
    const out = String(result.stdout ?? '');
    const first = out.indexOf('{');
    const last = out.lastIndexOf('}');
    if (first !== -1 && last > first) { try { json = JSON.parse(out.slice(first, last + 1)); } catch { /* not JSON */ } }
  }
  return { status: result.status, json, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

export function lintErrors(report, limit = 5) {
  return (report?.findings ?? []).filter((f) => f.severity === 'error').slice(0, limit).map((f) => `${f.code ?? f.rule ?? 'lint'}: ${f.message}`);
}

/**
 * Lint a built composition with the pinned HyperFrames CLI (static, fast, no
 * browser). The result is cached in the registry by the storyboard hash, so an
 * unchanged composition is not linted twice. Returns { ok, cached, errors, warnings }.
 */
export function lintVideo(root, topic, id, { spawn = spawnSync, tools = null } = {}) {
  const entry = readVisuals(root, topic).entries.find((e) => e.id === id);
  const video = entry?.video;
  if (!video?.project_dir) return { ok: false, problems: [`video ${id} is not built; run \`tutor video ${topic.id} build ${id}\``] };
  if (video.lint && video.lint.hash === video.input_hash) return { ok: video.lint.errors === 0, cached: true, errors: video.lint.errors, warnings: video.lint.warnings, problems: video.lint.findings ?? [] };
  if (tools && !tools.npx) return { ok: true, skipped: true, problems: [], reason: 'npx is not available' };
  const report = runHyperframes(path.join(root, video.project_dir), ['lint', '.', '--json'], spawn).json;
  if (!report) return { ok: true, skipped: true, problems: [], reason: 'hyperframes lint gave no JSON (offline?)' };
  const findings = lintErrors(report);
  const { entries } = readVisuals(root, topic);
  const target = entries.find((e) => e.id === id);
  target.video = { ...target.video, lint: { hash: video.input_hash, errors: report.errorCount ?? 0, warnings: report.warningCount ?? 0, findings } };
  writeVisuals(root, topic, entries);
  return { ok: (report.errorCount ?? 0) === 0, cached: false, errors: report.errorCount ?? 0, warnings: report.warningCount ?? 0, problems: findings };
}

/** Validate one video without rendering: storyboard, generated files, registry, MP4. */
export function checkVideo(root, topic, id) {
  const { project, spec, problem } = readSpec(root, topic, id);
  if (problem) return { ok: false, problems: [problem], warnings: [] };
  const ctx = topicContext(root, topic);
  const { problems, warnings } = videoSpecProblems(spec, { id, ...ctx, projectDir: project.dir });
  for (const name of ['index.html', 'captions.vtt', 'transcript.md', 'storyboard.md']) {
    if (!isFile(path.join(project.dir, name))) problems.push(`${project.relative}/${name} is missing; run \`tutor video ${topic.id} build ${id}\``);
  }
  const entry = readVisuals(root, topic).entries.find((e) => e.id === id);
  if (!entry) problems.push(`visuals.json has no entry "${id}"; run \`tutor video ${topic.id} build ${id}\``);
  else {
    const engine = entry.video?.narration && entry.video.narration !== 'none' ? entry.video.narration.split(' ')[0] : null;
    const current = inputHash(spec, project.dir, engine, spec.narration?.voice ?? null, ctx.sourcesById);
    if (entry.video?.input_hash !== current) problems.push(`the generated project is older than video.json; run \`tutor video ${topic.id} build ${id}\``);
    if (entry.video?.status === 'rendered') {
      if (entry.video.rendered_hash !== current) problems.push('the MP4 is older than the storyboard; render again');
      const probe = entry.video.mp4 ? probeMp4(path.join(root, entry.video.mp4)) : { ok: false, problem: 'no mp4 path' };
      if (!probe.ok) problems.push(`rendered MP4 is not playable: ${probe.problem}`);
    } else {
      warnings.push(`not rendered: ${entry.video?.blocker ?? 'unknown reason'}`);
    }
    const html = isFile(path.join(project.dir, 'index.html')) ? readText(path.join(project.dir, 'index.html')) : '';
    // Captions split narration across elements, so compare against the page text, not raw markup.
    const htmlText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    for (const scene of spec.scenes) if (!htmlText.includes(esc(scene.narration.split(/\s+/).slice(0, 6).join(' ')))) problems.push(`scene ${scene.id}: its caption text is missing from index.html; rebuild`);
    if (!/window\.__timelines\["main"\]/.test(html)) problems.push('index.html does not register its timeline on window.__timelines');
  }
  return { ok: problems.length === 0, problems, warnings, status: entry?.video?.status ?? 'missing' };
}

/** Ids of every video project of the topic. */
export function listVideoIds(root, topic) {
  const dir = path.join(root, topicPaths(topic).videos_dir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && isFile(path.join(dir, e.name, 'video.json'))).map((e) => e.name).sort();
}
