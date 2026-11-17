// Branching presentations (Mode C) built as HyperFrames slideshows
// (`/slideshow` skill, @hyperframes/player/slideshow). A deck starts as
// `deck.json` in its project folder (`tutor paths` → videos_dir/<id>/).
// `buildDeck` turns it into a slideshow composition: one top-level scene per
// slide, one slideshow island (slides, fragment reveals, hotspots that open
// branch sequences, speaker notes), a seekable root timeline with a
// deterministic visibility controller, and the scenes bootstrap message the
// bare player bundle needs (standalone-harness pattern of the official skill).
// A deck is a live, navigable experience: it is never rendered to MP4
// (`hyperframes render` keeps only the first slide). Stills come from
// `hyperframes snapshot`.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { hash } from './freshness.mjs';
import { isFile, readJson, readText, writeTextAtomic } from './io.mjs';
import { mediaUrl, topicPaths } from './topic-store.mjs';
import { readVisuals, writeVisuals } from './visuals.mjs';
import { compositionSafetyProblems, GSAP_CDN, HF_CORE_VERSION, publishComposition } from './composition-safety.mjs';
import { describeVisual, esc, FONT_FILES, HYPERFRAMES_VERSION, renderScene, runHyperframes, SCENE_CSS, sceneVisualProblems, sourcesFingerprint, topicContext } from './video.mjs';

const GENERATOR_VERSION = 1;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Seconds of timeline per slide. Navigation seeks; it never plays, so this only spaces the scenes. */
export const SLIDE_SECONDS = 4;
const FRAGMENT_GAP = 0.3;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const words = (value) => (text(value) ? value.trim().split(/\s+/).length : 0);
const r2 = (n) => Math.round(n * 100) / 100;
const js = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const PLAYER_CDN = `https://cdn.jsdelivr.net/npm/@hyperframes/player@${HF_CORE_VERSION}/dist`;

// --- spec ------------------------------------------------------------------------

function slideProblems(slide, at, projectDir, { branch }) {
  const problems = [];
  if (!slide || typeof slide !== 'object') return [`${at} must be an object`];
  if (!text(slide.id) || !ID.test(slide.id)) problems.push(`${at} needs a lowercase id`);
  if (!text(slide.heading)) problems.push(`${at} needs a heading`);
  if (words(slide.notes) < 6) problems.push(`${at} needs \`notes\` (6+ words): what to say or notice; they become the text alternative`);
  if (slide.visual?.type === 'custom') problems.push(`${at}: custom scenes are not supported in decks; use title, steps, flow, compare, equation, timeline or bars`);
  else problems.push(...sceneVisualProblems(slide.visual, at, projectDir));
  const hotspots = slide.hotspots ?? [];
  if (!Array.isArray(hotspots)) problems.push(`${at} hotspots must be a list`);
  else {
    if (branch && hotspots.length) problems.push(`${at}: a branch slide cannot open another branch; keep one level of depth`);
    if (hotspots.length > 3) problems.push(`${at} has ${hotspots.length} hotspots; at most 3 fit`);
    for (const h of hotspots) if (words(h?.label) < 2 || !text(h?.target)) problems.push(`${at}: each hotspot needs a \`label\` (2+ words) and a \`target\` sequence id`);
  }
  return problems;
}

/** { problems, warnings } of a deck.json. */
export function deckSpecProblems(spec, { id = null, sourceIds = null, conceptIds = null, projectDir = null } = {}) {
  const problems = [];
  const warnings = [];
  if (!spec || typeof spec !== 'object') return { problems: ['deck.json must be an object'], warnings };
  if (!text(spec.id) || !ID.test(spec.id)) problems.push('`id` must be lowercase words joined by dashes');
  else if (id && spec.id !== id) problems.push(`\`id\` is "${spec.id}" but the folder is "${id}"`);
  if (words(spec.title) < 3) problems.push('`title` must say what the deck explores (3+ words)');
  if (!text(spec.purpose)) problems.push('`purpose` must state the decision or comparison the learner explores');
  if (words(spec.summary) < 12) problems.push('`summary` (12+ words) is the text alternative of the whole deck');
  if (words(spec.explanation) < 8) problems.push('`explanation` (8+ words) is shown with the deck');
  if (!spec.learning_check || !text(spec.learning_check.question) || !text(spec.learning_check.answer)) problems.push('`learning_check` needs `question` and `answer`');
  for (const [key, known, label] of [['concept_ids', conceptIds, 'plan.curriculum'], ['source_ids', sourceIds, 'sources.json']]) {
    if (!Array.isArray(spec[key]) || !spec[key].length) problems.push(`\`${key}\` must not be empty`);
    else if (known) {
      const unknown = spec[key].filter((x) => !known.has(x));
      if (unknown.length) problems.push(`\`${key}\` not in ${label}: ${unknown.join(', ')}`);
    }
  }
  if (!Array.isArray(spec.used_in) || !spec.used_in.length) problems.push('`used_in` must list the lesson page that embeds the experience');
  const slides = Array.isArray(spec.slides) ? spec.slides : [];
  if (slides.length < 3 || slides.length > 12) problems.push('`slides` must have 3 to 12 main-line slides');
  const sequences = Array.isArray(spec.sequences) ? spec.sequences : [];
  if (!sequences.length) problems.push('`sequences` must list at least one branch: a deck with no branch is a video');
  const ids = new Set();
  const seqIds = new Set();
  const all = [];
  slides.forEach((slide, i) => { all.push([slide, `slide ${slide?.id ?? i + 1}`, false]); });
  for (const [i, seq] of sequences.entries()) {
    const at = `sequence ${seq?.id ?? i + 1}`;
    if (!text(seq?.id) || !ID.test(seq.id)) problems.push(`${at} needs a lowercase id`);
    else if (seqIds.has(seq.id)) problems.push(`duplicate sequence id ${seq.id}`);
    seqIds.add(seq?.id);
    if (words(seq?.label) < 2) problems.push(`${at} needs a \`label\` (2+ words)`);
    if (!Array.isArray(seq?.slides) || seq.slides.length < 1 || seq.slides.length > 4) problems.push(`${at} needs 1 to 4 slides`);
    else seq.slides.forEach((slide, j) => all.push([slide, `${at} slide ${slide?.id ?? j + 1}`, true]));
  }
  for (const [slide, at, branch] of all) {
    problems.push(...slideProblems(slide, at, projectDir, { branch }));
    if (text(slide?.id)) {
      if (ids.has(slide.id)) problems.push(`duplicate slide id ${slide.id}`);
      ids.add(slide.id);
    }
    if (Array.isArray(slide?.source_ids) && Array.isArray(spec.source_ids)) {
      const extra = slide.source_ids.filter((s) => !spec.source_ids.includes(s));
      if (extra.length) problems.push(`${at} source_ids must be a subset of the deck's source_ids (${extra.join(', ')})`);
    }
  }
  const targeted = new Set(slides.flatMap((s) => (Array.isArray(s?.hotspots) ? s.hotspots.map((h) => h?.target) : [])));
  for (const target of targeted) if (target && !seqIds.has(target)) problems.push(`a hotspot targets "${target}", which is not a sequence id`);
  for (const seq of sequences) if (seq?.id && !targeted.has(seq.id)) problems.push(`sequence ${seq.id} is never opened by a hotspot`);
  if (slides.length && ids.has(slides[0]?.id) && slides[0]?.visual?.type !== 'title') warnings.push('the first slide is usually a title that states the question');
  return { problems, warnings };
}

// --- composition -------------------------------------------------------------------

/** Fragment groups of a slide: what each Next press reveals. Empty without `reveal`. */
function fragmentsOf(slide, p) {
  if (!slide.reveal) return [];
  const v = slide.visual;
  switch (v.type) {
    case 'steps': return v.items.map((_, i) => ({ show: [`#${p}-i${i}`] }));
    case 'compare': {
      const out = [];
      const rows = Math.max(v.left.items.length, v.right.items.length);
      for (let i = 0; i < rows; i++) out.push({ show: [i < v.left.items.length ? `#${p}-l${i}` : null, i < v.right.items.length ? `#${p}-r${i}` : null].filter(Boolean) });
      if (v.verdict) out.push({ show: [`#${p}-v`] });
      return out;
    }
    case 'timeline': return v.events.map((_, i) => ({ show: [`#${p}-e${i}`] }));
    case 'bars': return v.items.map((_, i) => ({ show: [`#${p}-b${i}`, `#${p}-bv${i}`] }));
    case 'equation': return v.terms.map((_, i) => ({ show: [`#${p}-note${i}`], mark: `#${p}-t${i}` }));
    case 'flow': {
      const seen = [];
      for (const hop of v.path) { const key = `${hop.from}>${hop.to}`; if (!seen.includes(key)) seen.push(key); }
      return v.path.map((hop) => ({ edge: seen.indexOf(`${hop.from}>${hop.to}`), mark: `#${p}-n-${hop.to}`, note: [`#${p}-hn`, hop.label ?? ''] }));
    }
    default: return [];
  }
}

/** Scene timing, island and controller data of a deck. */
export function deckLayout(spec) {
  const scenes = [];
  let start = 0;
  const add = (slide, sequence) => {
    const p = `s${scenes.length + 1}`;
    const frags = fragmentsOf(slide, p);
    const fragmentTimes = frags.map((_, k) => r2(start + FRAGMENT_GAP * (k + 1)));
    scenes.push({ slide, sequence, p, id: slide.id, start, duration: SLIDE_SECONDS, frags, fragmentTimes });
    start += SLIDE_SECONDS;
  };
  for (const slide of spec.slides) add(slide, null);
  for (const seq of spec.sequences) for (const slide of seq.slides) add(slide, seq);
  const seqLabel = new Map(spec.sequences.map((s) => [s.id, s.label]));
  const islandSlide = (scene) => {
    const out = { sceneId: scene.id, notes: scene.slide.notes };
    if (scene.fragmentTimes.length) out.fragments = scene.fragmentTimes;
    const hotspots = scene.slide.hotspots ?? [];
    if (hotspots.length) out.hotspots = hotspots.map((h, i) => ({ id: `${scene.id}-h${i + 1}`, label: h.label, target: h.target, region: hotspotRegion(i, hotspots.length) }));
    return out;
  };
  const island = {
    slides: scenes.filter((s) => !s.sequence).map(islandSlide),
    slideSequences: spec.sequences.map((seq) => ({ id: seq.id, label: seq.label, slides: scenes.filter((s) => s.sequence?.id === seq.id).map(islandSlide) })),
  };
  return { scenes, island, total: start, seqLabel };
}

/** Percentage box of hotspot i of n: a row of cards at the bottom left, clear of the nav capsule. */
export function hotspotRegion(i, n) {
  const left = 5;
  const width = 64;
  const gap = 2;
  const w = (width - gap * (n - 1)) / n;
  return { x: r2(left + i * (w + gap)), y: 81, w: r2(w), h: 12 };
}

const DECK_CSS = `
      .scene-frame { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; overflow: hidden; background: var(--bg); opacity: 0; visibility: hidden; pointer-events: none; }
      .kicker { font-size: 40px; top: 56px; }
      .heading { top: 112px; font-size: 64px; }
      .steps li, .col ul, .notes, .tl-ev b, .bar-row, .hop-note, .node, .verdict { font-size: 40px; }
      .node small, .tl-ev small, .pkt-label { font-size: 40px; }
      .tl-ev { width: 300px; margin-left: -150px; }
      .packet { display: none; }
      [data-frag].frag-hidden { opacity: 0; }
      .marked { border-color: var(--accent) !important; background-color: var(--soft) !important; color: var(--accent); }
      .hotspot-card { position: absolute; display: flex; align-items: center; gap: 16px; padding: 0 28px; border: 4px solid var(--accent); border-radius: 18px; background: var(--soft); color: var(--ink); font-size: 40px; font-weight: 700; line-height: 1.1; }
      .hotspot-card::before { content: "+"; color: var(--accent); font-size: 52px; }
      .branch-note { position: absolute; left: 120px; bottom: 60px; font-size: 40px; color: var(--ink-2); }
`;

/** The slideshow composition (composition/index.html). */
export function deckCompositionHtml(spec, layout, { topicTitle = '' } = {}) {
  const { scenes, island, total, seqLabel } = layout;
  const mainCount = scenes.filter((s) => !s.sequence).length;
  const parts = scenes.map((scene, index) => {
    const { slide, p } = scene;
    const body = renderScene({ ...slide, narration: '' }, p, scene.start, scene.duration, null);
    const html = body.html;
    const position = scene.sequence ? `Deep dive: ${seqLabel.get(scene.sequence.id)}` : `${esc(topicTitle || spec.title)} · ${index + 1}/${mainCount}`;
    const header = slide.visual.type === 'title'
      ? ''
      : `<p class="kicker">${esc(position)}</p><h2 class="heading">${esc(slide.heading)}</h2>`;
    const cards = (slide.hotspots ?? []).map((h, i, list) => {
      const r = hotspotRegion(i, list.length);
      return `<div class="hotspot-card" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%">${esc(h.label)}</div>`;
    }).join('');
    const back = scene.sequence ? '<p class="branch-note">Press Previous (‹ or the left arrow key) to return to the main path.</p>' : '';
    return `<div id="${p}" class="scene-frame clip" data-composition-id="${scene.id}" data-start="${scene.start}" data-duration="${scene.duration}" data-label="${esc(slide.heading)}" data-width="1920" data-height="1080">${header}<div class="stage">${html}</div>${cards}${back}</div>`;
  });
  const control = scenes.map((s) => ({ el: s.p, start: s.start, end: s.start + s.duration, times: s.fragmentTimes, frags: s.frags }));
  const bootstrap = scenes.map((s) => ({ id: s.id, start: s.start, duration: s.duration }));
  return `<!doctype html>
<!-- Generated by \`tutor deck build\` from deck.json. Edit deck.json, not this file. -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(spec.title)}</title>
    <script src="${GSAP_CDN}"></script>
    <style>
${SCENE_CSS}
${DECK_CSS}
    </style>
  </head>
  <body>
    <script type="application/hyperframes-slideshow+json">
${JSON.stringify(island, null, 2)}
    </script>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
    ${parts.join('\n    ')}
    </div>
    <script>
      (function () {
        var TOTAL = ${total};
        var SCENES = ${js(control)};
        window.__timelines = window.__timelines || {};
        var tl = gsap.timeline({ paused: true });
        tl.to({}, { duration: TOTAL });
        window.__timelines["main"] = tl;
        function all(scope, sel) { return Array.prototype.slice.call(scope.querySelectorAll(sel)); }
        // Every visible state is a function of timeline time, so a seek straight
        // to any slide or fragment shows the right hold state.
        function update(t) {
          for (var i = 0; i < SCENES.length; i++) {
            var s = SCENES[i];
            var el = document.getElementById(s.el);
            if (!el) continue;
            var active = t >= s.start - 0.001 && t < s.end - 0.001;
            el.style.opacity = active ? "1" : "0";
            el.style.visibility = active ? "visible" : "hidden";
            el.style.pointerEvents = active ? "auto" : "none";
            var edges = all(el, ".edge");
            var reached = -1;
            for (var k = 0; k < s.frags.length; k++) {
              var on = t >= s.times[k] - 0.001;
              if (on) reached = k;
              var f = s.frags[k];
              (f.show || []).forEach(function (sel) { all(el, sel).forEach(function (n) { n.classList.toggle("frag-hidden", !on); }); });
              if (typeof f.edge === "number" && edges[f.edge]) edges[f.edge].classList.toggle("frag-hidden", !on && !edgeShownBefore(s, f.edge, k, t));
            }
            all(el, ".marked").forEach(function (n) { n.classList.remove("marked"); });
            if (reached >= 0) {
              var last = s.frags[reached];
              if (last.mark) all(el, last.mark).forEach(function (n) { n.classList.add("marked"); });
              if (last.note) all(el, last.note[0]).forEach(function (n) { n.textContent = last.note[1]; });
            } else {
              all(el, ".hop-note").forEach(function (n) { n.textContent = ""; });
            }
          }
        }
        function edgeShownBefore(s, edge, k, t) {
          for (var j = 0; j < s.frags.length; j++) if (j !== k && s.frags[j].edge === edge && t >= s.times[j] - 0.001) return true;
          return false;
        }
        // Fragment targets start hidden; the controller reveals them on navigation.
        SCENES.forEach(function (s) {
          var el = document.getElementById(s.el);
          if (!el) return;
          s.frags.forEach(function (f) {
            (f.show || []).forEach(function (sel) { all(el, sel).forEach(function (n) { n.setAttribute("data-frag", ""); }); });
            if (typeof f.edge === "number") all(el, ".edge").forEach(function (n) { n.setAttribute("data-frag", ""); });
          });
        });
        update(0);
        tl.eventCallback("onUpdate", function () { update(tl.time()); });
        window.__hfSetTime = update;
        function postTimeline() {
          parent.postMessage({ source: "hf-preview", type: "timeline", durationInFrames: Math.round(TOTAL * 30), scenes: ${js(bootstrap)} }, "*");
        }
        if (document.readyState === "complete") setTimeout(postTimeline, 300);
        else window.addEventListener("load", function () { setTimeout(postTimeline, 300); });
      })();
    </script>
  </body>
</html>
`;
}

/** The wrapper (project index.html) that opens as a working deck in a browser. */
export function deckWrapperHtml(spec, island) {
  return `<!doctype html>
<!-- Generated by \`tutor deck build\`. Opens the slideshow; the composition is in composition/. -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(spec.title)}</title>
    <script src="${PLAYER_CDN}/hyperframes-player.global.js"></script>
    <script src="${PLAYER_CDN}/slideshow/hyperframes-slideshow.global.js"></script>
    <style>* { box-sizing: border-box; margin: 0; padding: 0; } html, body { width: 100%; height: 100%; overflow: hidden; background: #111; }</style>
  </head>
  <body>
    <hyperframes-slideshow tabindex="0" notes-storage-key="${esc(spec.id)}" style="display: block; position: relative; width: 100vw; height: 100vh">
      <hyperframes-player interactive style="position: absolute; inset: 0" src="composition/index.html"></hyperframes-player>
      <script type="application/hyperframes-slideshow+json">
${JSON.stringify(island, null, 2)}
      </script>
    </hyperframes-slideshow>
  </body>
</html>
`;
}

/** Plain-text outline of every slide and branch: the deck's text alternative. */
export function deckOutline(spec, layout) {
  const out = [`# ${spec.title}`, '', spec.summary, '', `**Purpose.** ${spec.purpose}`, ''];
  const line = (scene, n) => {
    const s = scene.slide;
    const hot = (s.hotspots ?? []).map((h) => `deep dive "${h.label}"`).join(', ');
    return [`### ${n}. ${s.heading}`, '', `**On screen.** ${describeVisual(s.visual)}`, '', `**Notes.** ${s.notes}`, '', ...(hot ? [`**Branches.** ${hot}.`, ''] : [])];
  };
  out.push('## Main path', '');
  layout.scenes.filter((s) => !s.sequence).forEach((scene, i) => out.push(...line(scene, i + 1)));
  for (const seq of spec.sequences) {
    out.push(`## Deep dive: ${seq.label}`, '');
    layout.scenes.filter((s) => s.sequence?.id === seq.id).forEach((scene, i) => out.push(...line(scene, i + 1)));
  }
  return `${out.join('\n')}\n`;
}

// --- build, check, snapshot ----------------------------------------------------------

export function deckProject(root, topic, id) {
  if (!ID.test(id ?? '')) throw new Error(`deck id "${id}" must be lowercase words joined by dashes`);
  const relative = `${topicPaths(topic).videos_dir}/${id}`;
  return { relative, dir: path.join(root, relative), spec: path.join(root, relative, 'deck.json') };
}

export function readDeckSpec(root, topic, id) {
  const project = deckProject(root, topic, id);
  if (!isFile(project.spec)) return { project, spec: null, problem: `${project.relative}/deck.json is missing; write the deck first (see .claude/skills/learn-video)` };
  try {
    return { project, spec: readJson(project.spec), problem: null };
  } catch (error) {
    return { project, spec: null, problem: `${project.relative}/deck.json does not parse: ${error.message}` };
  }
}

function syncDeckRegistry(root, topic, spec, deck) {
  const { entries } = readVisuals(root, topic);
  const index = entries.findIndex((e) => e.id === spec.id);
  const entry = {
    ...(index === -1 ? {} : entries[index]),
    id: spec.id,
    title: spec.title,
    kind: 'presentation',
    format: 'hyperframes-slideshow',
    concept_ids: spec.concept_ids,
    source_ids: spec.source_ids,
    purpose: spec.purpose,
    explanation: spec.explanation,
    alt: spec.summary,
    learning_check: spec.learning_check,
    used_in: spec.used_in,
    deck: { ...(index === -1 ? {} : entries[index].deck), ...deck },
  };
  if (index === -1) entries.push(entry);
  else entries[index] = entry;
  writeVisuals(root, topic, entries);
  return entry;
}

/** Generate the slideshow project and publish its composition. Returns { ok, problems, warnings, files, entry }. */
export function buildDeck(root, topic, id) {
  const { project, spec, problem } = readDeckSpec(root, topic, id);
  if (problem) return { ok: false, problems: [problem], warnings: [] };
  const ctx = topicContext(root, topic);
  const { problems, warnings } = deckSpecProblems(spec, { id, ...ctx, projectDir: project.dir });
  if (problems.length) return { ok: false, problems, warnings };
  const layout = deckLayout(spec);
  const composition = deckCompositionHtml(spec, layout, { topicTitle: topic.title });
  const unsafe = compositionSafetyProblems(composition, { name: `${project.relative}/composition/index.html` });
  if (unsafe.length) return { ok: false, problems: unsafe, warnings };
  fs.mkdirSync(path.join(project.dir, 'composition', 'assets', 'fonts'), { recursive: true });
  for (const font of FONT_FILES) {
    const from = path.join(root, 'site', 'src', 'assets', 'fonts', font);
    const to = path.join(project.dir, 'composition', 'assets', 'fonts', font);
    if (isFile(from) && !isFile(to)) fs.copyFileSync(from, to);
  }
  const files = {
    'composition/index.html': composition,
    'index.html': deckWrapperHtml(spec, layout.island),
    'outline.md': deckOutline(spec, layout),
    'package.json': `${JSON.stringify({ name: `${topic.slug}-${id}`, private: true, type: 'module', scripts: {
      present: `npx --yes hyperframes@${HYPERFRAMES_VERSION} present composition`,
      check: `npx --yes hyperframes@${HYPERFRAMES_VERSION} check composition --json`,
    } }, null, 2)}\n`,
    '.gitignore': 'snapshots/\nnode_modules/\n.hyperframes/\ncomposition/.hyperframes/\n',
  };
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(project.dir, name);
    if (!isFile(file) || readText(file) !== content) writeTextAtomic(file, content);
  }
  const input_hash = hash(JSON.stringify({ GENERATOR_VERSION, HYPERFRAMES_VERSION, spec, sources: sourcesFingerprint(ctx.sourcesById, spec.source_ids) }));
  const paths = topicPaths(topic);
  const compositionRelative = `${paths.media_dir}/${id}/composition`;
  const published = publishComposition(root, path.join(project.dir, 'composition'), compositionRelative);
  if (!published.ok) warnings.push(`the deck was not published for the site: ${published.problems.join('; ')}`);
  const previous = readVisuals(root, topic).entries.find((e) => e.id === id)?.deck ?? {};
  const entry = syncDeckRegistry(root, topic, spec, {
    project_dir: project.relative,
    status: previous.check?.hash === input_hash && previous.check.errors === 0 ? 'checked' : 'built',
    input_hash,
    outline: `${project.relative}/outline.md`,
    island: layout.island,
    timeline: layout.scenes.map((s) => ({ id: s.id, heading: s.slide.heading, start: s.start, duration: s.duration, sequence: s.sequence?.id ?? null, fragments: s.fragmentTimes })),
    slides: spec.slides.length,
    branches: spec.sequences.map((s) => ({ id: s.id, label: s.label, slides: s.slides.length })),
    composition: published.ok ? `${compositionRelative}/index.html` : null,
    composition_url: published.ok ? `${mediaUrl(topic)}${id}/composition/index.html` : null,
    present_command: `npx --yes hyperframes@${HYPERFRAMES_VERSION} present ${project.relative}/composition`,
  });
  return { ok: true, problems: [], warnings, files: Object.keys(files).map((f) => `${project.relative}/${f}`), entry, published: published.ok };
}

/**
 * Run `hyperframes check --json` on the composition (the slideshow rule checks
 * that every sceneId resolves, hotspot targets exist and fragments sit inside
 * their slide). Cached by the deck hash. Returns { ok, cached, errors, problems }.
 */
export function checkDeck(root, topic, id, { spawn = spawnSync, run = true } = {}) {
  const built = buildDeck(root, topic, id);
  if (!built.ok) return { ok: false, problems: built.problems, warnings: built.warnings };
  const deck = built.entry.deck;
  const problems = [];
  if (!deck.composition) problems.push('the composition is not published for the site (see the build warnings)');
  if (deck.check && deck.check.hash === deck.input_hash) {
    return { ok: deck.check.errors === 0 && !problems.length, cached: true, errors: deck.check.errors, problems: [...problems, ...(deck.check.findings ?? [])], warnings: built.warnings };
  }
  if (!run) return { ok: !problems.length, skipped: true, problems, warnings: built.warnings };
  const result = runHyperframes(path.join(root, deck.project_dir, 'composition'), ['check', '.', '--json'], spawn);
  const report = result.json;
  if (!report) return { ok: !problems.length, skipped: true, problems, warnings: [...built.warnings, `hyperframes check gave no JSON (exit ${result.status}: ${result.stderr.trim().split('\n').slice(-2).join(' ').slice(0, 300)}); the deck stays unchecked, run it again`] };
  const { errors, warnings: warningCount, findings } = checkReportSummary(report);
  const entry = syncDeckRegistry(root, topic, readDeckSpec(root, topic, id).spec, {
    status: errors === 0 ? 'checked' : 'built',
    check: { hash: deck.input_hash, errors, warnings: warningCount, findings },
  });
  return { ok: errors === 0 && !problems.length, cached: false, errors, problems: [...problems, ...findings], warnings: built.warnings, entry };
}

/**
 * Errors, warnings and error findings of a `hyperframes check --json` report.
 * The report has one section per checker (lint, runtime, layout, motion,
 * contrast, craft, audio), each with its own counts and findings.
 */
export function checkReportSummary(report) {
  const sections = Object.values(report ?? {}).filter((v) => v && typeof v === 'object' && Array.isArray(v.findings));
  if (Array.isArray(report?.findings)) sections.push(report);
  let errors = 0;
  let warnings = 0;
  const findings = [];
  for (const section of sections) {
    errors += section.errorCount ?? section.findings.filter((f) => f.severity === 'error').length;
    warnings += section.warningCount ?? 0;
    findings.push(...section.findings.filter((f) => f.severity === 'error').map((f) => `${f.code ?? 'check'}: ${f.message}`));
  }
  if (report && report.ok === false && errors === 0) { errors = 1; findings.push('hyperframes check reported ok: false'); }
  return { errors, warnings, findings: findings.slice(0, 8) };
}

/** Problems of a registered deck entry (no build). */
export function deckEntryProblems(root, entry) {
  const problems = [];
  const deck = entry.deck;
  if (!deck || typeof deck !== 'object') return ['a presentation needs a `deck` object (written by `tutor deck build`)'];
  if (!['built', 'checked'].includes(deck.status)) problems.push('`deck.status` must be built or checked');
  if (!text(deck.project_dir) || !isFile(path.join(root, deck.project_dir, 'deck.json'))) problems.push(`${deck.project_dir ?? '(project)'}/deck.json is missing`);
  if (!deck.island || !Array.isArray(deck.island.slides)) problems.push('`deck.island` is missing; rebuild the deck');
  if (text(deck.composition) && !isFile(path.join(root, deck.composition))) problems.push(`the published composition ${deck.composition} is missing; run \`tutor deck <topic> build ${entry.id}\``);
  return problems;
}

/** Ids of every deck project of the topic. */
export function listDeckIds(root, topic) {
  const dir = path.join(root, topicPaths(topic).videos_dir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && isFile(path.join(dir, e.name, 'deck.json'))).map((e) => e.name).sort();
}
