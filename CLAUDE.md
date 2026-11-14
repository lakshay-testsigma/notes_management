# Personal AI tutor and note-taker

This repository is a local harness that turns "teach me <topic>" into a complete learning
package for a beginner: a short brief, an interactive lesson site, mini projects, digests of
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

Shared notes live in `vault/_concepts/` and `vault/_tech/`: created only with `tutor concept`,
named in sentence case ("Dense retrieval"), their backlinks filled by `tutor map`. Clones and
fetched pages stay in `.cache/`.

## Always use the learn skills

- To teach, generate, continue, or report on a topic, use the `learn` skill. It runs the
  stages in waves and calls the stage skills (`learn-intake`, `learn-research`, `learn-brief`,
  `learn-digest`, `learn-repo-intel`, `learn-site`, `learn-projects`, `learn-capstone`,
  `learn-notes`). Use `learn-insight` to save the learner's own insight and `learn-recall` for
  a recall session.
- Never build a path by hand. Take every path from `tutor paths <topic> --json`.
- Never edit `topic.json` by hand. Change state only with `tutor` commands (`plan --set`,
  `depth`, `start`, `unit`, `done`, `skip`, `fail`, `reset`, `sources add`, `sources update`,
  `sources remove`, `concept`, `insight`).
- Helpers: `tutor validate <topic> <stage> --files <paths>` (a unit worker checks only its own files), `tutor words <file>` (the validator's word count), `tutor next <topic>` on a finished topic (its reading order).
- A stage is finished only when `tutor done <topic> <stage>` passes. When the validator and
  a skill disagree, do what the validator says.
- Run the pipeline without check-in questions. The learner wants everything generated
  first and adds their own insights afterwards.

## Context budget

No agent may fill more than 40% of its context window. In practice, one unit of work reads
at most 60,000 tokens (size files with `tutor budget`, cut repositories with `tutor slice`),
writes its findings to disk as it goes, and, when the unit is too big, hands off with a file
in `handoffs/` and the reply `CONTINUE: <path>`. Only the session running `learn` spawns
subagents: at most 5 at the same time (fewer at lower depth; the one table is "How many
workers at once" in the `learn` skill), one unit each, and each returns at most 150 words.
That session reads `tutor` output and worker summaries, never raw sources or cloned code.

## Lesson page style

A lesson page reads like a short blog post about one idea: a title, a one-line description,
10–15 lines of prose (110–260 words), and at least one visual and one activity component,
with the visual doing most of the explaining. Use no quote blocks, boxes, callouts, `<aside>`,
or `<details>`; an important remark is a plain paragraph that starts with `**Note.**`. Shared
components need no `import` and no `client:` directive; their props are in
`site/COMPONENTS.md`; a prop that file does not document fails the gate. Only the last page
of a topic (the highest `order` in the plan) ends with `<Resources />`.

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
