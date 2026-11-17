# Adaptive learning experiences

This rubric is the contract for explainer videos, interactive video lessons,
branching presentations and hybrid labs. It extends `visuals.md`. The gates in
`harness/lib/validators/` enforce it for plans with `experience_policy: "adaptive"`.

The rule: **watch when explanation is enough, interact when experimentation
matters, explore paths when decisions matter, combine everything only when the
idea is genuinely complex.** Choose the experience that helps the learner
understand. Do not choose the one that looks most impressive.

## 1. Modes

| Mode | Name | Use it when | Built from |
|------|------|-------------|------------|
| `static` | Diagram and text | One idea with no process, no parameters and no decisions | `<Diagram id>` or a component |
| `explainer` | Mode A, explainer video | A chronological or causal sequence that the learner only needs to follow | `video.json` → MP4 (`tutor video`) |
| `interactive` | Mode B, interactive video lesson | The behavior changes when the learner changes an input (algorithms, state machines, scheduling) | a guided HyperFrames composition in `<hyperframes-player>`, plus a simulation or inspect regions, plus checkpoints |
| `branching` | Mode C, branching presentation | Several valid decisions or paths exist (architecture choices, strategies, threat models) | `deck.json` → HyperFrames slideshow (`tutor deck`) |
| `hybrid` | Mode D, hybrid lab | Complex, interconnected mechanisms that need a sequence, experiments and decisions | intro video, simulation, guided walkthrough, optional deck, checkpoints, final summary video |

A rendered MP4 is not interactive. Play, pause and seek are playback, not
learning interaction. Interaction means the learner predicts, changes a
parameter, clicks to inspect, chooses a path or answers a question.

## 2. Selection (`harness/lib/experience-mode.mjs`)

Every outline page of an adaptive plan records `experience.signals`:

| Signal | Meaning |
|--------|---------|
| `complexity` | 1 (one simple idea) to 5 (many interacting mechanisms) |
| `concepts` | concepts this idea combines |
| `dependent_steps` | steps that depend on the step before |
| `changes_over_time` | the behavior is a process in time |
| `spatial` | position or shape carries meaning |
| `parameters` | inputs the learner can change to see different behavior |
| `decision_paths` | valid alternative decisions or paths (0 or 1 = one path) |
| `benefit` | `low`, `medium` or `high`: expected gain of active participation |
| `mastery` | optional, 0–1: the learner's recorded mastery, frozen in by `tutor experience <topic> plan` |

Default routing: interconnected (complexity ≥ 4 and ≥ 4 concepts) with two or
more needs → `hybrid`; parameters that change behavior → `interactive`; two or
more decision paths → `branching`; a time sequence or three or more dependent
steps → `explainer`; otherwise `static`. Low benefit caps the mode at
`explainer`. Mastery ≥ 0.8 lowers the mode by one step; mastery < 0.4 turns an
explainer with parameters into an interactive lesson.

The selection is automatic. To override it, set `experience.mode` with an
`override_reason` (6+ words). Interactive, branching and hybrid pages need
`experience.id` and `visual: "Experience"`; explainer pages need `video`.

Cost: static 0, explainer 2, interactive 3, branching 3, hybrid 6. Budget per
topic: quick 4, standard 10, deep 18. Over budget, keep the rich mode for
critical ideas and override supporting pages to a lighter mode.

Check a decision with `tutor experience select --file <signals.json>` and the
whole plan with `tutor experience <topic> plan`.

## 3. HyperFrames production (every video)

Follow the official `/hyperframes` explainer guidance and this order:

1. Verified facts from `sources.json` only; every scene has `source_ids`.
2. One learning objective (`purpose`) and the learner level.
3. A short script: about 19 spoken words per scene, at most 2.8 words per second.
4. A storyboard (`video.json`): one idea per scene, 3–10 scenes, 30–90 s.
   Split a long topic into several short videos.
5. Motion shows change or cause. Diagrams explain mechanisms, bars show
   evidence, reveals add one part at a time. Labels stay readable (28 px or more).
6. Narration is optional and free (`say` or Kokoro); captions always.
7. `tutor video <topic> build <id>`: composition, captions, transcript,
   storyboard, published composition for the site player.
8. Preview: `npx hyperframes@0.9.59 preview` in the project folder.
9. Check: `tutor experience build` runs `hyperframes lint`; `tutor video render` lints again.
10. Render only when the experience needs a file (Watch tab, summary video):
    `tutor video <topic> render <id>`. A guided walkthrough plays the
    composition itself and needs no MP4.
11. Review frames (`npx hyperframes@0.9.59 snapshot`) before you claim quality.
12. Embed with `<Experience id>` (or `<Video id>` for a bare explainer).

Never copy assets or a protected style of another creator. Never claim an MP4
that `tutor video <topic> check <id>` cannot open.

## 4. Decks (`deck.json`, Mode C)

- 3–12 main slides, one idea each; at least one branch sequence of 1–4 slides.
- Every sequence opens from a hotspot (at most 3 per slide, labels of 2+ words).
  Branch slides open no further branch. Previous returns to the main path.
- `reveal: true` turns the items of a slide into fragments.
- Every slide has `notes` (6+ words); the notes and the outline are the text alternative.
- Text is at least 40 px at 1920 × 1080. Hotspot cards stay out of the
  bottom-right corner, where the navigation capsule sits.
- A deck is a live, navigable experience. Never render it to MP4. Check it with
  `tutor deck <topic> check <id>`; present it with `tutor deck <topic> present <id>`.

## 5. Experiences (`experience.json`)

Fields: `id`, `title`, `mode`, `objective` (6+ words), `level`, `summary`
(12+ words, the text alternative), `concept_ids`, `source_ids`, `used_in` (one
lesson page), and the parts of the mode:

| Mode | Required | Optional |
|------|----------|----------|
| explainer | `watch` | — |
| interactive | `guided`, `simulation` or `inspect`, `fallback_visual`, one `predict` checkpoint | `watch` |
| branching | `deck`, `fallback_visual` | `watch` |
| hybrid | `watch`, `guided`, `simulation`, `summary_video`, `fallback_visual`, one `predict` and one `experiment` checkpoint | `deck`, `inspect` |

- `simulation`: `{ component: "ClusterSim" | "AlgorithmStepper", props, presets }`.
  The simulation state stays separate from the video timeline. `sync` only names
  the preset the guided walkthrough loads when a scene starts.
- `inspect`: clickable regions (percent of the frame) during one scene, each with a concept and 6–60 words.
- `fallback_visual`: a registered static diagram, shown without JavaScript and when the player fails.

## 6. Checkpoints

| Kind | The learner | Needs |
|------|-------------|-------|
| `predict` | says what happens next, before it happens | 2–4 choices, one correct, a `misconception` for each wrong choice |
| `experiment` | changes the simulation until a condition holds | `goal.condition` on the simulation state, `goal.hint` |
| `observe` | watches for one change | `look_for` |
| `explain` | explains in their own words, then reads the explanation | `explanation` |
| `verify` | answers a short question | like `predict` |

Every checkpoint has an `explanation` (why the behavior happens) and
`concept_ids`. `revisit` names a guided scene to replay after a wrong answer.
`at` is `{ scene }`, `{ slide }`, `{ after: "watch" }` or `{ tab: "practice" }`.
Limits: explainer 0–1, interactive 2–6, branching 1–4, hybrid 3–8. Two
checkpoints never interrupt the same moment. Do not interrupt a simple
explanation.

## 7. The site

`<Experience id>` shows the tabs of its mode: Watch, Explore, Guided, Deep dive,
Practice. Switching tabs keeps progress. The player loads compositions with
`sandbox-origin="opaque"`; compositions are checked for network, storage,
parent-page access and external assets before they are published, and run
offline with the pinned GSAP and HyperFrames runtime under a strict
Content-Security-Policy. Player and slideshow code load only when a tab needs
them. Every part has captions or a transcript; reduced motion never autoplays.

## 8. Progress, mastery and recall

Practice → Export progress downloads the checkpoint results. `tutor experience
<topic> progress --file <file>` merges them into `state/topics/<id>/progress.json`
(idempotent), computes concept mastery and misconceptions, makes recall cards
about weak concepts due today, and names scenes to replay. `tutor experience
<topic> plan` shows recorded mastery so the next plan can freeze it into
`signals.mastery`. Gates read only the plan, so progress never changes a verdict.

## 9. Obsidian

`tutor map` writes one note per experience, video and deck under
`<vault>/visuals/`: mode, lesson URL, parts with links, editable project paths,
storyboard and transcript, deck outline, checkpoints, sources, prerequisites.
Final notes link these notes instead of repeating them.

## 10. Review checks

`experience-behavior`: the selected mode fits the idea; checkpoints ask about the
mechanism; the experiment condition matches the explanation; sync presets match
their scenes; branches return to the main path. `video-consistency` covers every
video, guided or rendered.
