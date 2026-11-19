# Personal AI tutor and note-taker

This repository is a local harness that turns "teach me <topic>" into a complete learning
package for a software developer learning an unfamiliar subject: a short brief, an interactive lesson site, mini projects, digests of
the key papers and docs, an Obsidian deep dive of a production repository, a capstone, final
notes, and recall cards. Everything is numbered and linear so the learner never hops around.
The full contract (paths, state, stages, CLI, gates) is `docs/ARCHITECTURE.md`; it wins over
any skill. Rubrics are in `harness/rubrics/`, domain playbooks in `harness/domains/<domain>/`.

## One command surface

All state, paths, scaffolding, and validation go through one CLI, run from the repository root:

```bash
node harness/bin/tutor.mjs <command>      # add --json for machine output
```

Exit code 0 is success, 1 is a validation failure, 2 is a usage error. A topic is addressed
by its full id `<domain>/<subdomain>/<slug>`, or by its slug when the slug is unique.

## Four roots, one shared path

Every topic lives at the same sub-path `<domain>/<subdomain>/<slug>` in four roots:

| Root | Holds |
|------|-------|
| `state/topics/…` | `topic.json` (progress and plan), `sources.json`, `handoffs/` |
| `vault/…` | the Obsidian notes, numbered `00-start-here` to `09-resources`, plus `my-insights` |
| `site/src/content/lessons/…` | the lesson pages (`NN-<page>.mdx`) |
| `projects/…` | `mini-NN-<name>/` and `capstone/` |

Roadmaps live in `state/roadmaps/<slug>/roadmap.json`, with views in
`site/public/roadmaps/<slug>.html` and `vault/_roadmaps/<slug>.md` (ARCHITECTURE §4.5).

Shared notes live in `vault/_concepts/` and `vault/_tech/`: created only with `tutor concept`,
named in sentence case ("Dense retrieval"), their backlinks filled by `tutor map`. Clones and
fetched pages stay in `.cache/`.

## Inputs folder

The learner drops topic files in `inputs/` (like `inputs/frontend.html`): roadmap HTML with
`const DATA`, roadmap JSON, or a plain topic list. They are read-only. `tutor roadmap inbox`
lists them and says which are new, imported, changed, or need conversion; the `learn`
orchestrator checks it first in every session.

## Always use the learn skills

- To learn a whole field end to end ("master frontend engineering"), or when the learner gives
  a roadmap HTML/JSON file, use the `learn-roadmap` skill: `tutor roadmap add` stores the
  roadmap and writes its HTML checklist (`/roadmaps/<slug>.html`) and vault map first; then
  each section becomes one topic, created only with the `init` command `tutor roadmap next`
  prints, and every roadmap item must be an included, covered curriculum concept.
- To teach, generate, continue, or report on a topic, use the `learn` skill. It runs the
  stages in waves and calls the stage skills (`learn-intake`, `learn-research`, `learn-brief`,
  `learn-digest`, `learn-repo-intel`, `learn-site`, `learn-projects`, `learn-capstone`,
  `learn-notes`). Use `learn-insight` to save the learner's own insight and `learn-recall` for
  a recall session.
- For the fastest run of a topic or roadmap, use `notes-management`: the same pipeline
  with a rolling worker pool and cross-stage queues, inside the CLI's wave rules. For a
  roadmap it runs **every phase in parallel**: one phase orchestrator per phase, each in
  its own git worktree, listed by `tutor roadmap phases <roadmap>` and merged back when
  done (`notes-management` section "Parallel phases"). Every research unit follows
  `tutor research worksheet`, so a smaller model researches as deeply as a large one. `.claude/settings.json` sets auto-compaction at 40% context.
- Runs are unattended: permissions in this repository are pre-approved, so never ask.
  After every passed `tutor done`, the orchestrator commits that phase's files
  (`notes-management` section "Unattended runs"). Never `git push`; a hook blocks it.
- Never build a path by hand. Take every path from `tutor paths <topic> --json`.
- Never edit `topic.json` by hand. Change state only with `tutor` commands (`plan --set`,
  `depth`, `start`, `unit`, `done`, `skip`, `fail`, `reset`, `sources add`, `sources update`,
  `sources remove`, `concept`, `insight`, `roadmap add`, `init --roadmap`).
- An explicit learner deletion request permits `tutor remove <topic> [<topic>...]`
  to preview and `--delete` to remove the selected packages, including insights and
  recall history. Never use removal during ordinary generation or resumption.
- Helpers: `tutor validate <topic> <stage> --files <paths>` (a unit worker checks only its own files), `tutor words <file>` (the validator's word count), `tutor next <topic>` on a finished topic (its reading order).
- A stage is finished only when `tutor done <topic> <stage>` passes. When the validator and
  a skill disagree, do what the validator says.
- Run the pipeline without check-in questions. The learner wants everything generated
  first and adds their own insights afterwards.

## Orchestrator layer and model tiers

`learn` is the single orchestrator: it calls every other skill in sequence and owns the
budgets (see "The orchestrator layer" in its skill). Fact work (research, digests, repo
analysis, projects, gap audits) runs on the cheaper tier (`model: MiMo V2.6 Flash` in the role
file); learner-facing wording (lesson pages, experiences, review, the inline brief and
notes) runs on the stronger tier (`model: MiMo V2.6 Pro`). Each topic has a worker-spawn cap
(14 / 36 / 56 by depth), and after `notes` a bounded coverage audit (1 round at quick, 2
otherwise, `tutor-coverage-auditor`) finds missed subtopics before `finalize`. Every concept
states its real use case and the benefit over the alternative, and every interactive object
must fit its page's topic (review check `interactive-topic-fit`). Independent workers of a
batch are spawned in one message so they run in parallel.

## Context budget

No agent may fill more than 40% of its context window. In practice, one unit of work reads
at most `min(60000, floor(0.4 * model_window) - reserve)` input tokens (default window32768, reserve3000; size instructions and inputs with `tutor budget`, cut files with `tutor slice` and read only returned ranges),
writes its findings to disk as it goes, and, when the unit is too big, hands off with a file
in `handoffs/` and the reply `CONTINUE: <path>`. Only the session running `learn` spawns
subagents: at most 5 at the same time (fewer at lower depth; the one table is "How many
workers at once" in the `learn` skill), one unit each, and each returns at most 150 words.
That session reads `tutor` output and worker summaries, never raw sources or cloned code.

## Lesson page style

New plans follow `docs/RESEARCH-WORKFLOW.md`: recursive concept discovery, six-aspect
coverage, adaptive visuals, and fresh independent reviewers. Record this learner's
software development experience in `plan.learner`; bridge unknown domain prerequisites.

A lesson page reads like a short blog post about one idea: a title, a one-line description,
10–15 lines of prose (110–260 words), and an activity component. Adaptive plans
choose visuals by complexity and importance (basic may omit); legacy plans require
one visual per page. Visuals explain the mechanism through observable changes. Use no quote blocks, boxes, callouts, `<aside>`,
or `<details>`; an important remark is a plain paragraph that starts with `**Note.**`. Shared
components need no `import` and no `client:` directive; their props are in
`site/COMPONENTS.md`; a prop that file does not document fails the gate. Only the last page
of a topic (the highest `order` in the plan) ends with `<Resources />`.

## Visual-first explanations and the writing standard

New plans are visual-first (`plan.visual_first: true`): explain simply, visualize,
interact, animate, practice, retain. Every stage draws through the shared skill
`learn-visuals` (and `learn-video` for a 30–90 s HyperFrames explainer of a real
sequence); never invent a separate way to draw. Every drawn relationship comes from
a vetted source. Register each visual with `tutor visuals <topic> add` (never edit
`visuals.json` by hand); the site (`<Diagram id>`, `<Video id>`) and the vault
(`tutor map` writes `<vault>/visuals/`) then show the same file with its
explanation, alt text, sources and learning check. Build and render videos only
with `tutor video <topic> build|render <id>`; with no FFmpeg or Docker the video
stays an honest storyboard, and no paid API is used. All prose follows
`harness/rubrics/writing-standard.md` (about 80% ASD-STE100: short active sentences,
terms defined first, beginner layer first, depth kept in `<Depth>` blocks or notes;
check with `tutor style <file>`). The contract and gates: `harness/rubrics/visuals.md`.

## Adaptive experiences

New plans also set `plan.experience_policy: "adaptive"`: per idea the selector chooses a
static diagram, an explainer video, an interactive video lesson, a branching HyperFrames
deck or a hybrid lab (`tutor experience select`, contract `harness/rubrics/experiences.md`).
Trust the selector; override only with `override_reason`. Build experiences only with
`tutor experience <topic> build <id>` and decks with `tutor deck`; never render a deck to
MP4, never edit `experience.built.json` or `progress.json` by hand. Learner checkpoint
results come back through `tutor experience <topic> progress --file <export.json>`.

## Source gate

Recommend a source only when its standing was verified from a live page during the current
run, never from memory. Each entry in `sources.json` is tier A (canonical) or tier B (strong
and widely used), carries its evidence, `verified_at`, and `verified_via`, and is added with
`tutor sources <topic> add --file` (corrected with `sources <topic> update <id> --file`,
removed with `sources <topic> remove <id> --reason`). Anything that cannot be verified is
dropped. Notes and lesson pages cite only sources that are in `sources.json`. Keep 5–12
sources per topic; the thresholds are in `harness/rubrics/source-quality.md`. Findings about
a repository cite `path/to/file:line @ <short-sha>`.

## The learner's own notes

Every generated vault note ends with the heading `## My insights`. Never write below it and
never overwrite `my-insights-<slug>.md`; that space belongs to the learner. When you
regenerate a note, keep everything from `## My insights` down exactly as it is.

For worker metadata, use `tutor plan <topic> --json` and `tutor paths <topic> --json` plus assigned sources. Do not load receipt/history/protected-content snapshots from full topic.json into workers. Apply this projection to stage input lists as well.
