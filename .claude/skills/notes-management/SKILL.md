---
name: notes-management
description: Parallel-first orchestrator for the tutor pipeline. Runs every stage of one topic, or every section of a roadmap such as frontend-engineering, with the most work in flight that the tutor CLI allows - a rolling worker pool instead of batch barriers, one shared queue across all stages of a wave, inline stages done while workers run, and for a roadmap every phase running at the same time (one phase orchestrator per phase, each in its own git worktree, merged back when done). Research units follow a fixed `tutor research worksheet` so even a smaller model researches in depth. Keeps the orchestrator context under 40% with disk handoffs and automatic compaction. Use it when the learner says "/notes-management <topic|roadmap>", "run all phases in parallel", "generate <topic> fast", "speed up <roadmap>", or "continue <roadmap> in parallel".
argument-hint: "<topic | roadmap> [--depth quick|standard|deep]  |  continue <topic | roadmap>  |  status"
---

# notes-management — the parallel orchestrator

This skill is a scheduling layer over `learn` and `learn-roadmap`. It does not change what
is generated, how it is gated, or who writes what. It changes only **when** work starts, so
that worker slots are never idle while legal work is waiting.

`docs/ARCHITECTURE.md`, the `tutor` CLI and the `learn` skill still own the rules. Read
`.claude/skills/learn/SKILL.md` once per session (and `learn-roadmap` for a roadmap) and
follow it, with the scheduling changes below replacing its "spawn one batch, wait, spawn
the next batch" loop. When this file and the validator disagree, the validator wins.

## What can and cannot run in parallel

The CLI enforces the dependency graph; never try to get around it.

- Inside one topic, stages run in waves (`harness/lib/stages.mjs`): `tutor next` only
  returns stages of the lowest unsettled wave, and `brief` also needs `research` finished.
  So `digest` can never start before `brief` is settled, and `lesson` never before
  `digest` and `repo-intel`. All stages of the **same** wave run together.
- Inside a stage, all units are independent and run together.
- Across a roadmap, **every phase runs in parallel** (section "Parallel phases" below):
  one phase orchestrator per phase, each in its own git worktree. Inside one phase the
  sections run in roadmap order. `tutor roadmap phases <roadmap> --json` lists the lanes.
  The old "current + one lookahead" rule applies only inside one phase lane.
- Concurrency limit per phase orchestrator: min(host slots, the depth table "How many
  workers at once" in `learn`, 5). The main session caps live phase orchestrators at
  `MAX_PHASES` (default 6; raise it when the host and rate limits allow).

Parallel speed comes from filling every legal slot, not from skipping order.

## The scheduler

Keep one in-memory **ready queue** and one **running set**. Each entry is
`{topic, stage, unit, agent, brief}`.

1. **Refill the queue.** For every active topic run `tutor next <topic> --json`. For each
   runnable stage, `tutor start` it, register its units (`tutor unit <topic> <stage> add`,
   as `learn/references/stage-runbook.md` says for that stage), fill one worker brief per
   unit and push it to the queue. Stages of the same wave share the queue
   (digest + repo-intel units mixed; lesson + video/experience + mini-project units mixed).
2. **Order the queue** so the longest work starts first: repo-intel scout and module
   units, then digest units, then video/experience units, then lesson pages, then mini
   projects. Units of the current topic go before units of the lookahead topic.
3. **Fill free slots.** Spawn as many queue heads as there are free slots, all in **one
   message** with `run_in_background: true`, each with its role's `subagent_type` (the
   model tier comes from the role file).
4. **Rolling refill, not batch barriers.** When any worker returns, handle its return
   (`tutor unit ... done|fail`, `CONTINUE:` handoffs re-queued at the head), then
   immediately spawn the next queue head into that slot. Do not wait for the rest of
   the batch. The concurrency limit still holds at every moment.
5. **Do inline work while workers run.** Inline stages (`intake`, quick-depth `research`,
   `brief`, `notes`) and the short "after the units" steps run in this session while
   background workers are busy, as soon as their own prerequisites pass. Example: run the
   lookahead topic's intake inline while the current topic's wave-3 workers are running.
6. **Gate as soon as a stage's last unit returns.** Run the stage's `tutor check`, the
   after-units step, and `tutor done <topic> <stage>` at once, then go to step 1: a gate
   that opens a new wave adds units to the queue while other stages are still running.
7. **Spawn budget.** Before each spawn, check the per-topic cap from `learn` (14/36/56)
   and log with `tutor log <topic> "SPAWN <n>/<cap>"`. Failure handling, retries and
   degraded stages follow `learn` "Gates and failures" unchanged.

Index notes that need every unit's FINDINGS (digest index, repo synthesis, 02-lesson,
03-mini-projects) still wait for **all** returns of their own stage; only other stages
keep running.

## Unattended runs: no questions, commit every phase, never push

The learner runs this skill overnight and 24x7 and is not there to answer. Permissions for
this repository are pre-approved (`.claude/settings.local.json`, `bypassPermissions`), so
never stop to ask; decide, record the assumption with `tutor log`, and continue.

**Commit after every passed gate.** Right after `tutor done <topic> <stage>` exits 0 (and
after `finalize`), commit that phase's files. Only this orchestrator session commits;
workers never run git. Commits are serialized: never run two git commands at once.

```bash
# paths come from `tutor paths <topic> --json`; skip any that do not exist yet
git add -A -- <state_dir> <vault_dir> <lessons_dir> <projects_dir> <media_dir> \
  <topic_components_dir> vault/_concepts vault/_tech vault/_roadmaps vault/Home.md \
  state/registry.json state/roadmaps site/public/roadmaps
git commit -m "docs(<slug>): <stage> done" -m "Topic: <topic>
Units: <n done>/<n>; spawns <n>/<cap>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- Stage only these topic paths, never `git add -A` on the whole repository, so unrelated
  work in the tree stays out of the commit.
- Files of other stages still running may be half written; that is fine, the next phase
  commit includes their final state.
- If there is nothing to commit, continue. If the commit fails (a git hook, a lock), log it
  with `tutor log` and continue the pipeline; retry the commit at the next gate.
- **Never push**, never amend, never rebase, never reset, never switch branches. A
  `PreToolUse` hook (`.claude/hooks/repo-guard.mjs`) blocks `git push` in any form;
  pushing is the learner's job.

**Changes stay inside this repository.** Reading anything and exploring the web is free;
writing is confined to the repository root. Two layers enforce it:

- Bash runs in the OS sandbox (`sandbox` in `.claude/settings.local.json`): writes outside
  the repository and `$TMPDIR` fail with "Operation not permitted". Never retry with
  `dangerouslyDisableSandbox`; the guard hook blocks it. Log the blocker with `tutor log`
  and continue.
- `Edit`, `Write` and `NotebookEdit` outside the repository are blocked by the guard hook.
- Caches (npm, browsers, XDG) are pointed into `.cache/` by `env`, so installs and renders
  never write to the home folder. Use `$TMPDIR` for scratch files.

## Parallel phases (default for a roadmap)

A roadmap runs **all its phases at the same time**. The main session is only a
dispatcher: it never runs a stage itself.

1. `tutor roadmap inbox`; import `new` or `changed` files with `learn-roadmap` first.
2. `tutor roadmap phases <roadmap> --json [--from <phase>] [--to <phase>]` gives one lane
   per phase with open work: `phase`, `title`, `branch`, and `sections[]` with the exact
   `command` (an `init` for a new section, `tutor next` for a started one). Use the
   learner's range if they gave one.
3. Write the lane table to `.cache/tmp/<roadmap>-phases.md` (phase, agent id, worktree,
   status, pending phases). This file is the resume point after a compaction.
4. Start one **phase orchestrator** per lane, up to `MAX_PHASES` live at once:
   - `Agent` with `subagent_type: general-purpose`, `isolation: "worktree"`,
     `run_in_background: true`, prompt = `references/phase-orchestrator-brief.md` with
     its placeholders filled from the lane.
   - **Spawn one phase orchestrator per message.** Several `isolation: "worktree"`
     spawns in the same message race on git and are refused ("git identity could not be
     verified"), leaving dead worktrees behind.
5. Rolling refill: when a phase orchestrator returns,
   - `CONTINUE: <worktree> <topic> <stage>`: start a fresh orchestrator **without**
     isolation, same brief plus "Work only in `<worktree>`; cd there first; resume at
     `<topic>` `<stage>`".
   - finished: merge its branch (section "Merging a phase branch"), mark the lane done in
     the lane table, then spawn the next pending lane.
6. When every lane is merged: `tutor roadmap status <roadmap>` and the final message.

### Merging a phase branch

Run in the main checkout, one merge at a time:

```bash
git merge --no-ff --no-edit <branch>
# Conflicts only appear in shared, generated files. Take either side, then rebuild them:
git checkout --theirs -- state/registry.json vault/Home.md vault/_roadmaps site/public/roadmaps 2>/dev/null
node harness/bin/tutor.mjs doctor --fix      # rebuilds state/registry.json from disk
node harness/bin/tutor.mjs map               # rebuilds maps, Home and concept backlinks
node harness/bin/tutor.mjs roadmap render <roadmap>
git add -A -- state vault site/public/roadmaps && git commit --no-edit
```

For an add/add conflict on a `vault/_concepts` or `vault/_tech` note, keep the side
with more content, then `tutor map` refills its backlinks. Never resolve a conflict in a
topic's own folders by hand: each phase owns disjoint topic paths, so such a conflict
means two lanes worked on one topic; stop that lane and report it. The learner removes
merged worktrees with `git worktree remove <path>` (the sandbox cannot).

### Research quality on any model

Every research unit, on any model tier, starts with
`tutor research worksheet <topic> --unit <unit-id> [--concepts <ids>]`. It writes a fixed
checklist (exact search queries per concept and source role, the six questions per
concept, the verification check per source type, the entry template, a self-check) to
`.cache/tmp/<slug>/research-worksheet-<unit>.md`. Put that path in the worker brief and
tell the worker to tick every box. This makes a smaller model do the same in-depth,
verified research as a large one: the judgement is in the worksheet, not the model.
Keep each research unit to at most 4 concepts, so a small context window holds it.

## Roadmap mode, one lane at a time (fallback)

Use this only when the learner asks for sequential order, or inside one phase lane.

1. Run `tutor roadmap inbox`; import `new` or `changed` files with `learn-roadmap` first.
2. Loop on `tutor roadmap next <roadmap> --json`:
   - `next.action` `create` or `resume`: make that topic the current topic and schedule it.
   - `lookahead` not null and the current topic has finished `intake`: run the printed
     `init_command`, then schedule the lookahead's `intake` (inline) and `research`
     (workers) into free slots. Stop the lookahead after `research` passes.
3. When the current topic is finalized, the lookahead becomes current and its `brief`
   starts at once; the next `lookahead` is fetched in the same step.
4. After each finished topic, write
   `tutor log <topic> "ROADMAP <roadmap>: section <num> done; next <num>"`.

## Context budget: never above 40%

The orchestrator's context is the scarce resource of a parallel run, because more workers
mean more returns in the same window.

- Read only `tutor ... --json` output (filtered with `node -e` or `grep` to the fields you
  need) and worker returns (max 150 words each). Never read sources, pages, notes or code.
- Do not re-read a skill file already followed in this session.
- After every gate, write a three-line handoff with
  `tutor log <topic> "WAVE <n> done; running: <units>; queued: <units>"`. The disk state
  plus this line is the whole resume point.
- **Automatic compaction at 40%.** The project sets `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=40` in
  `.claude/settings.json`, so Claude Code runs `/compact` by itself when the context
  reaches 40% of the window. A skill cannot type `/compact` itself; this setting is the
  mechanism. Keep handoffs current so a compaction at any moment loses nothing.
- **After a compaction** (the SessionStart `compact` hook reminds you): reload this skill,
  run `tutor status <topic> --json` for every active topic, treat units still
  `in_progress` whose worker return was not seen as running if their background task is
  alive, otherwise re-queue them, then continue the scheduler from step 1.
- Rule of thumb if the setting is missing: after about 20 worker returns, write the
  handoff and tell the learner to run `/compact`, then continue.

## Status

`status` prints, for each active topic, `tutor status <topic>` plus the running and queued
units, and for a roadmap `tutor roadmap status <roadmap>`.

## Final message

Use `learn`'s final message per finished topic (five lines in roadmap mode), plus one line:
`Peak parallel workers: <n>; total spawns: <n>/<cap>`.
