---
name: learn-video
description: The shared HyperFrames and interactive-experience capability of the tutor harness. Chooses, per idea, between a static diagram, an explainer video (Mode A), an interactive video lesson (Mode B), a branching HyperFrames slideshow (Mode C) or a hybrid lab (Mode D) with `tutor experience`, then builds it from verified sources - storyboard (video.json), slideshow (deck.json), lesson definition (experience.json) with simulation presets and checkpoints - checks it with the official HyperFrames CLI, renders an MP4 only when the experience needs a file, publishes sandbox-safe compositions for the site, and embeds <Experience id> or <Video id>. Use it whenever an outline entry plans a `video` or an `experience`, whenever a `tutor-video-producer` worker gets a `video-<id>`, `deck-<id>` or `experience-<id>` unit, whenever `tutor experience|deck|video` or the lesson gate reports a problem, and whenever the learner asks for "a video", "an animation", "an explainer", "an interactive lesson", "a simulation", "let me try it", "a presentation", "compare the options", or "show me how X happens step by step" for a topic in this repository.
argument-hint: "<topic id> <experience, deck or video id>"
---

# learn-video — explainer videos and interactive experiences

**Watch when explanation is enough. Interact when experimentation matters.
Explore paths when decisions matter. Combine everything only when the idea is
genuinely complex.** The contract is `harness/rubrics/experiences.md`; read
it once per run. `tutor` means `node harness/bin/tutor.mjs`. Take every path
from `tutor paths <topic> --json`.

## 0. Official HyperFrames skills (read, do not duplicate)

The official agent skills are installed in `~/.claude/skills` (check with
`tutor doctor`, row `hyperframes-skills`; install with `npx hyperframes skills
update` and `npx hyperframes skills update slideshow`). Read the part you need:

| Need | Read |
|------|------|
| Composition contract, explainer craft, review | `/hyperframes` (`references/types/explainer.md`, `motion.md`, `captions.md`) |
| Preview, lint, check, snapshot, render flags | `/hyperframes-cli` |
| A named effect, chart, transition or caption style | `/hyperframes-registry` (`npx hyperframes@0.9.59 catalog --query "…" --json`; search is local) |
| Narration, captions, transcripts, sound | `/media-use` — free local tools only: `say`, Kokoro (`npx hyperframes tts`), `npx hyperframes transcribe` |
| Decks: slides, fragments, hotspots, branches, presenter mode | `/slideshow` |

Harness rules win over the official skills where they differ:

- Run the CLI pinned: `npx --yes hyperframes@0.9.59 …`, with
  `HYPERFRAMES_NO_TELEMETRY=1`. Skip the official "usage beacon" and the
  `usage` and `auth` steps: no account, no telemetry, no paid media. The
  learner's request for no paid services counts as asking for local tools.
- Never write `index.html` by hand and never edit `visuals.json`: write the
  JSON spec, then run `tutor video|deck|experience build`.
- Do not install skills, upgrade the pinned CLI or open the desktop app on
  your own; report what is missing.

## 1. Choose the experience

1. Fill `experience.signals` for the idea (complexity, concepts,
   dependent_steps, changes_over_time, spatial, parameters, decision_paths,
   benefit; table in the rubric §2). Count from the sources, not from
   ambition.
2. `tutor experience select --file <signals.json>` prints the mode and why.
   `tutor experience <topic> plan` prints every page, the cost against the
   depth budget, and recorded learner mastery to freeze into
   `signals.mastery`.
3. Keep the selection. Override only with `experience.mode` and an
   `override_reason` the learner would accept (for example a budget cut on a
   supporting page).

| Mode | You write | You run |
|------|-----------|---------|
| static | a diagram (`learn-visuals`) | `tutor visuals <topic> add` |
| explainer | `videos_dir/<id>/video.json` (+ `experience.json` with `watch`, optional) | `tutor video <topic> build <id>`, `render <id>` |
| interactive | guided `video.json`, `experience.json` (simulation presets, sync, inspect, checkpoints), a static fallback diagram | `tutor experience <topic> build <id>` |
| branching | `videos_dir/<id>/deck.json`, `experience.json`, a static fallback diagram | `tutor deck <topic> check <id>`, `tutor experience <topic> build <id>` |
| hybrid | intro, guided and summary `video.json`, optional `deck.json`, `experience.json`, a fallback diagram | `tutor experience <topic> build <id>`; `tutor video <topic> render` for the intro and summary |

Examples of all four, valid and tested, are in
`harness/examples/experiences/` (HTTP lifecycle, binary search, Raft
consensus, marketing funnel strategy). Copy the closest one.

## 2. Produce each video (14 steps)

1. Gather verified facts from the topic's digests, brief and
   `tutor sources <topic> list`; drop any claim without a source id.
2. One learning objective (`purpose`).
3. The learner level (from `plan.learner`).
4. A teaching script: one concrete example worked through; about 19 spoken
   words per scene, at most 2.8 words per second, writing standard.
5. A storyboard: `video.json` (`references/storyboard.md`).
6. One idea per scene, 3–10 scenes, 30–90 s. Split a large topic into several
   short videos (intro, guided, summary) instead of one long one.
7. Timing and transitions: scene durations; scenes grow to fit narration.
8. Graphics: built-in scene types (`title`, `steps`, `flow`, `compare`,
   `equation`, `timeline`, `bars`); motion shows change or cause; one diagram
   grows a part at a time. Search the registry before a `custom` scene.
9. Narration (`say`, Kokoro or none) and captions (always, from the narration).
10. Preview: `npx --yes hyperframes@0.9.59 preview` in the project folder.
11. Check: `tutor video <topic> build <id>`, then `tutor experience … build`
    (runs `hyperframes lint`) or `tutor video … render` (lints again). Fix every
    error. Leave the sub-composition warnings (`nested_structure_needs_subcomposition`,
    `timeline_track_too_dense`): the site needs one self-contained file (rubric §3).
12. Render only when the output needs a file: the Watch part of an explainer
    or hybrid, and the hybrid summary. A guided walkthrough plays the
    composition in the player and needs no MP4.
13. Review frames: `npx --yes hyperframes@0.9.59 snapshot <project dir>
    --frames 6` and look at them; fix arrows, overlaps and unreadable labels.
14. Embed: `<Experience id="…" />` (or `<Video id="…" />` for a bare
    explainer) after the paragraph that sets it up.

## 3. Decks (Mode C)

Write `deck.json` (`references/experiences.md` §Deck): 3–12 main slides with
`notes`, `reveal: true` for fragment reveals, up to 3 `hotspots` per slide,
each opening a branch `sequence` of 1–4 slides. `tutor deck <topic> build
<id>` writes the slideshow composition (the `/slideshow` island, top-level
scenes in a `main` root, a seekable timeline, the scenes bootstrap) and a
wrapper `index.html`; `tutor deck <topic> check <id>` runs `hyperframes check`.
Never render a deck to MP4. `tutor deck <topic> present <id>` prints the live
presenter command.

## 4. Experiences and checkpoints

Write `experiences_dir/<id>/experience.json` (`references/experiences.md`).
Checkpoints follow predict → experiment → observe → explain → verify →
continue, only where they help: explainer 0–1, interactive 2–6, branching
1–4, hybrid 3–8. Every wrong choice names its misconception; every
checkpoint explains why. An experiment's `goal.condition` reads the
simulation state (keys in `SIMULATIONS`, `harness/lib/experience.mjs`).
`revisit` replays a guided scene after a wrong answer. `sync` loads a
simulation preset when a guided scene starts; the simulation keeps its own
state.

`tutor experience <topic> build <id>` builds every part that changed, lints
the compositions, checks every reference, publishes sandbox-safe compositions
(no network, storage or parent access; pinned local GSAP and runtime; strict
CSP) and writes `experience.built.json`. An unchanged experience is not
rebuilt; a re-verified source rebuilds it.

## 5. When rendering is not possible

Without FFmpeg or Docker, `tutor video render` records `status: storyboard`
with the blocker and exits 1. Interactive, branching and guided parts still
work, because they play compositions. Report the blocker. **Never** claim an
MP4 that `tutor video <topic> check <id>` cannot open.

## Worker units (lesson stage)

The `learn` orchestrator gives one unit per `tutor-video-producer`:
`video-<id>`, `deck-<id>` or `experience-<id>` (an experience unit builds its
own videos and deck when the brief lists them). Write only inside the unit's
project folders; add the `<Experience>` or `<Video>` tag to the page only if
the brief says the page is yours.

Return at most 150 words:

```
STAGE: lesson  UNIT: <video|deck|experience>-<id>  STATUS: done | blocked | failed
FILES: <spec files>, <built.json / mp4 path or "no MP4">
FINDINGS:
- mode <mode> (selector: <mode>, reasons), tabs <tabs>, <n> checkpoints
- videos <id: length, status>; deck <id: slides, branches, check>
- sources used
PROBLEMS: <"none", the render blocker, lint/check errors, or claims left out>
```

## Common mistakes

- An interactive lab for a simple idea, or a passive video for an idea the
  learner must manipulate to understand. Trust the selector; justify overrides.
- Treating play/pause as interaction. Interaction is predict, change, inspect, choose.
- Checkpoints that quiz trivia, or that interrupt a short explainer.
- A deck rendered to MP4; a deck without branches (that is a video).
- Narration that does not name what is on screen; more than 2.8 words per second.
- A `flow` whose arrows imply a path the protocol does not take.
- Claiming a rendered video after a failed render.
