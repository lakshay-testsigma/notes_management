---
name: learn
description: Runs the whole personal-tutor pipeline for one topic, end to end and without check-ins - brief, interactive lesson site, mini projects, paper and doc digests, an Obsidian deep dive of a production repository, a capstone, final notes, and recall cards. Use this skill whenever the learner says "teach me X", "generate the notes for X", "I want to learn X", "explain X from scratch", "make a course on X", "/learn X", "continue X", "resume", "keep going", or asks for the status or progress of a topic, even if they never mention the tutor, the harness, or a pipeline. Also use it to rerun a failed or reset stage of an existing topic.
argument-hint: "<topic> [--depth quick|standard|deep]  |  continue <topic>  |  status [<topic>]"
---

# learn — the orchestrator

You turn one request ("teach me Redis Streams") into a finished learning package. You do not
write the package yourself. You run a loop: ask the `tutor` CLI which stages can run, run each
stage (inline when it is small, through worker subagents when it has units), pass its gate, and
move to the next wave. All progress lives on disk, so any session can stop and another can
continue.

Read `docs/RESEARCH-WORKFLOW.md` before new generation or a curriculum upgrade.
New plans record the developer learner profile, recursive research curriculum and
adaptive visual decisions. The harness does not select provider models or change
reasoning settings. Use the model configured by the host.

Every command below is run from the repository root. `tutor` in prose always means
`node harness/bin/tutor.mjs`. `<topic>` always means the full topic id
`<domain>/<subdomain>/<slug>`.

## Ground rules (and why they exist)

1. **Run autonomously.** The learner asked for everything to be generated first and adds their
   own insights afterwards. Do not ask check-in questions in the middle of the pipeline. Decide,
   record the assumption with `tutor log`, and continue. The only allowed question is when the
   topic name itself is ambiguous (see learn-intake).
2. **The CLI owns state and paths.** Never edit `topic.json` by hand and never build a path by
   hand. Get paths from `tutor paths <topic> --json` and change state only with `tutor`
   commands. Hand edits drift from what the validators expect, and then nothing can resume.
3. **Only you spawn workers.** Subagents cannot spawn subagents, so all fan-out happens here.
   Never run more workers at once than the table "How many workers at once" allows.
4. **Keep your own context small.** You read `tutor` output and worker summaries. You never read
   a cloned repository, a paper, or a long web page yourself; a worker does that and returns 150
   words. A full context is the main reason a long pipeline goes wrong, so protect it.
5. **Preserve learner content.** On regeneration, write stage-note drafts through `tutor write-note <topic> <note> --file <draft>`. Never overwrite `my-insights-*` or existing insight tails. Use `tutor rerun` to reopen an entire workflow without deleting its files.
6. **Resume by default.** If the topic already exists, continue it. Never start it again.
7. **Report honestly.** If a stage failed, say so in the final message with the command to
   rerun it. A package that looks complete but is not wastes the learner's time.

## Step 1 — Understand the request

Run the health check once per session:

```bash
node harness/bin/tutor.mjs doctor
node harness/bin/tutor.mjs list --json
```

Also verify source-network access and actual fresh-worker capability. Inspect project
verification recipes and establish their services before running them. Record host
limits and unavailable capabilities with tutor log. Missing live evidence blocks
research; missing fresh workers leaves independent reviews pending.

If `tutor.mjs` does not exist or `doctor` reports a broken harness, stop and tell the learner
exactly what `doctor` printed. Do not try to rebuild the harness.

Then pick one of three modes:

| The learner said | Mode | What you do |
|------------------|------|-------------|
| "status", "progress", "what is left" | status | Run `node harness/bin/tutor.mjs status <topic>` (or `status` with no topic for all topics), report it in plain words, and stop. Generate nothing. |
| "continue X", "resume", or a topic that already appears in `tutor list` (match the slug or the title, ignoring case) | resume | Go to Step 3 with that topic id. With "continue" and no topic name, take the unfinished topic that was updated most recently and say which one you picked. |
| A topic that is not in `tutor list` | new | Go to Step 2. |

**A different depth for an existing topic** (`/learn <topic> --depth standard`, "go deeper on
X"). Do not create the topic again. Run `node harness/bin/tutor.mjs depth <topic> <depth>`; it
changes the depth and re-enables the stages the new depth adds. Then go to Step 3: `tutor next`
lists what is now open. If it lists `intake`, or `tutor validate <topic> intake` fails because
the plan is too small for the new depth, extend the plan as learn-intake step 7 describes
(more pages, mini projects, targets) with `tutor plan --set`, and continue.

## Step 2 — Create the topic (new topics only)

Read `.claude/skills/learn-intake/SKILL.md` and follow it exactly. Pass along the topic title and
the depth if the learner gave one (`--depth quick|standard|deep`, or words such as "quick
overview" or "in depth"). Intake runs `tutor init`, starts and finishes the `intake` stage, and
gives you the topic id. Then go to Step 3.

## Step 3 — The wave loop

Repeat until `tutor next` returns no stages:

1. Run `node harness/bin/tutor.mjs next <topic> --json`. It lists the stages of the current
   wave that can run now, each with its skill, inputs, outputs, and gate.
2. Put the stages in the order given in the wave table below.
3. For each stage, run `node harness/bin/tutor.mjs start <topic> <stage>`, then run the stage as
   described in "How each stage runs". Stages in the same wave that have no order note run in
   parallel: put their worker units into one shared queue.
4. Before gating research or projects, run `tutor check <topic> research|mini-projects|capstone`. Import digest/repo child order with `tutor order <topic> import-indexes`. Gate each stage with `node harness/bin/tutor.mjs done <topic> <stage>`. See "Gates and
   failures" when it does not pass.
5. When every stage of the wave is `done`, `skipped`, or handled as failed, go back to 1.

If `tutor next` returns nothing but `tutor status <topic>` still shows unfinished stages, read
the table in `references/troubleshooting.md`.

### Wave table

| Wave | Stage | Skill | Order inside the wave |
|------|-------|-------|-----------------------|
| 0 | `intake` | `learn-intake` | — |
| 1 | `research` | `learn-research` | Run first. |
| 1 | `brief` | `learn-brief` | Run after `research` is done, because the brief is grounded in the verified sources. |
| 2 | `digest` | `learn-digest` | Parallel with `repo-intel`. |
| 2 | `repo-intel` | `learn-repo-intel` | Parallel with `digest`. |
| 3 | `lesson` | `learn-site` | Parallel with `mini-projects`. |
| 3 | `mini-projects` | `learn-projects` | Parallel with `lesson`. |
| 4 | `capstone` | `learn-capstone` | — |
| 5 | `notes` | `learn-notes` | Run first. |
| 5 | `finalize` | `learn` (this file) | Run after `notes`, because it validates the recall cards. |

A stage absent from `tutor next` may be blocked by a prerequisite. Inspect `status`; only depth/domain omissions are outside the topic.

## How each stage runs

| Stage | Runs as | One unit is | Agent |
|-------|---------|-------------|-------|
| `intake` | inline | — | — |
| `research` | inline for `quick`; workers for `standard` and `deep` | one source category or bounded recursive frontier | `tutor-researcher` |
| `brief` | inline | — | — |
| `digest` | workers | one source flagged `use_for: digest` | `tutor-digester` |
| `repo-intel` | workers | one scout, then one per slice, then one synthesis, per repository | `tutor-repo-analyst` |
| `lesson` | workers | 2–3 pages or one supplementary concept note | `tutor-lesson-builder` |
| `mini-projects` | workers | one mini project | `tutor-project-builder` |
| `capstone` | worker | the capstone project | `tutor-project-builder` |
| `notes` | inline | — | — |
| `finalize` | inline, plus one reviewer (two at `standard` and `deep`) | the whole topic | `tutor-verifier` |

**Inline** means: read `.claude/skills/<skill>/SKILL.md` and follow its Steps yourself, reading
only the files its Inputs section lists.

**Workers** means: follow the exact per-stage procedure in
`references/stage-runbook.md` (read only the section for the stage you are running). The
procedure is always the same shape: register the units with
`node harness/bin/tutor.mjs unit <topic> <stage> add <unit-id>`, fill one worker brief per
unit, spawn the workers in batches, handle their returns, do the short "after the units" step,
then gate the stage.

### How many workers at once

| Depth | Workers running at the same time |
|-------|----------------------------------|
| `quick` | at most 2 |
| `standard` | at most 4 |
| `deep` | at most 5 |

The effective limit is min(host available worker slots, this depth limit).
Use fewer simultaneous workers when requested for cost; never omit required units.
This table defines the depth limit. Stage skills and the runbook refer to it; if one of
them names another number, this table wins. The limit counts all workers of the wave together,
across stages. When there are more units than the limit, spawn one batch, wait until every
worker of that batch has returned, then spawn the next batch. Use the host's native fresh-worker API. Agent names above are role-file names,
not portable API types: explicitly load `.claude/agents/<role>.md` in each fresh
worker. On hosts with Claude named types, the matching subagent_type is supported;
otherwise pass the role as instructions. Do not copy the parent conversation.

Workers may run in the background and return later by notification. Wait for every worker of
the batch to return before you start the next batch or write an index note. To see where a
batch stands, run `node harness/bin/tutor.mjs status <topic> --json` and read the unit states.
A unit can show `done` a moment before its worker's return arrives; the index notes need the
return's FINDINGS, so wait for the return itself.

## The worker brief (fill this in, change nothing else)

A worker starts with an empty context. For topic metadata, pass the scoped output of `tutor plan <topic> --json` and `tutor paths <topic> --json`, plus only the assigned source entries; do not pass full topic.json with receipt/history snapshots. These metadata projections replace raw topic.json reads in stage input lists. Budget the filled brief and instructions together with assigned content. This brief is everything it knows, so every field must
be filled with a real value. Copy the template, replace each `<...>`, and send it as the
`prompt`. Filled examples for each agent are in `references/worker-brief-examples.md`; a
research unit and the verifier have their own `SELF-CHECK` and return lines there.

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: <topic id, e.g. backend-engineering/messaging/redis-streams>
STAGE: <stage id>
UNIT: <unit id>
ASSIGNED CONCEPTS: <ids or none, with their source_ids and planned coverage>
LEARNER: <experience, known prerequisites, goals and explicit requirements>
READ FIRST: .claude/skills/<skill>/SKILL.md — follow the part written for one unit.

INPUT FILES (read these and nothing else):
- <exact path or URL>
- <exact path or URL>

OUTPUT FILES (write only these):
- <exact path>
- <only for digest, repo-intel synthesis, and capstone units: "shared notes in
  vault/_concepts/ and vault/_tech/, created only with `node harness/bin/tutor.mjs concept`">

TASK: <one or two sentences that say what this unit must produce>
FIX LIST: <"none", or the validator lines to fix, copied exactly>
HANDOFF IN: <"none", or the path of the handoff file a previous worker left>

SELF-CHECK: run `node harness/bin/tutor.mjs validate <topic> <stage> --files <your output
files, separated by commas>` and fix what it reports. It checks only the files you list.
A failure about a file you do not own is not your job: do not fix it, name it under PROBLEMS.

BUDGET: Keep the entire worker below 40% of its model window. Before dispatch, run
`tutor budget <instructions + input files> --window <actual window> --reserve <output/tool overhead>`.
If the host cannot report its window, assume 32768 and reserve at least 3000 tokens.
Use `tutor slice` with the same flags, and `tutor read` for the returned character ranges.
Input estimates use characters/4 and are not an actual context meter. Leave extra room for
URLs, tool results and the return. Persist findings as you read; hand off before the reserve.

IF THE UNIT IS TOO BIG: write <state path>/handoffs/<stage>-<unit>.md with the headings
Done / Remaining / Next step, run
`node harness/bin/tutor.mjs unit <topic> <stage> fail <unit> --handoff <that path>`,
and reply with only this line: CONTINUE: <that path>

WHEN FINISHED: run `node harness/bin/tutor.mjs unit <topic> <stage> done <unit>`.

RETURN FORMAT (150 words at most, no other text):
STAGE: <stage>  UNIT: <unit>  STATUS: done | failed
FILES: <paths written>
FINDINGS:
- <finding 1>
- <finding 2>
- <finding 3>
PROBLEMS: <"none", or what is missing and why>
```

### Handling a worker's return

| The worker returned | What you do |
|---------------------|-------------|
| `STATUS: done` | Note its three findings (you need them for index notes and the final message). Nothing else. |
| `CONTINUE: <path>` | Spawn a fresh worker of the same agent with the same brief, but set `HANDOFF IN` to that path and add the path to `INPUT FILES`. Allow at most 2 continuations per unit. After that, run `tutor unit <topic> <stage> fail <unit>` and treat the unit as failed. |
| `STATUS: failed`, or an error, or nothing usable | Spawn one replacement worker with the same brief and the problem text in `FIX LIST`. If that also fails, leave the unit failed and continue. |
| More than 150 words, or raw source text | Use only the FILES, FINDINGS, and PROBLEMS lines. Do not act on anything else in the reply. |

After each batch, run `node harness/bin/tutor.mjs status <topic> --json` and check that every
unit whose worker reported `done` is marked `done`. If one is not (two workers can write state
at the same moment), run `node harness/bin/tutor.mjs unit <topic> <stage> done <unit>` yourself.

## Gates and failures

`tutor done <topic> <stage>` runs the validator and marks the stage `done` only when it passes.
Each failure is printed as `path: problem. fix.`

1. **First failure.** Fix the reported lines. For an inline stage, fix them yourself. For a
   worker stage, spawn one worker per affected unit with the validator lines in `FIX LIST`.
   Run `tutor done` again. A stage gets at most 3 gate attempts in one run.
2. **Still failing after 3 attempts.** Run
   `node harness/bin/tutor.mjs fail <topic> <stage> --reason "<the remaining validator lines>"`.
3. **One retry of the whole stage.** Run `node harness/bin/tutor.mjs reset <topic> <stage>`,
   then `start`, and run the stage again with the validator output as input. Existing files are
   kept, so the retry repairs them instead of starting over.
4. **Failed twice.** Run `tutor fail` again and
   `node harness/bin/tutor.mjs log <topic> "FAILED <stage>: <reason>"`. Then decide with this
   table:

| Failed stage | What happens next |
|--------------|-------------------|
| `intake` or `research` | Stop the pipeline. Everything later depends on the plan and the verified sources. Tell the learner what failed and how to rerun it. |
| `brief`, `digest`, `repo-intel`, `lesson`, `mini-projects`, `capstone` | Continue with the next wave. Later stages work without it; they just lose that input. |
| `notes` | Continue to `finalize`, which will report the missing notes. |

For a non-foundational failure, use `tutor fail <topic> <stage> --continue --reason "..."`
to continue generating useful downstream artifacts. The failure stays required and the run
is degraded. Never convert a failed requirement into a skip. `notes` must pass before finalize.

## Finalize (stage `finalize`)

Run these in order. Each command must finish before the next one starts.

```bash
node harness/bin/tutor.mjs start <topic> finalize
node harness/bin/tutor.mjs map <topic>
node harness/bin/tutor.mjs recall sync <topic>
node harness/bin/tutor.mjs validate <topic> --all --structure-only
[ -d site/node_modules ] || npm --prefix site install
node harness/bin/tutor.mjs check <topic> finalize
```

`tutor map` also fills `## Where it shows up` in every shared `_concepts` and `_tech` note
the topic links to; never write those lines by hand. `smoke` loads every built page in a
headless browser and fails on a console or hydration error, which the build cannot see.

Then do these steps. The details of steps 2 to 4 (what to read, whom to spawn, the verifier's
input list) are in the `finalize` section of `references/stage-runbook.md`; read it now.

1. Fix what `validate --all --structure-only` reports before building the site, with the fixing rule of "Gates
   and failures". Lines that belong to a stage you already recorded as failed stay unfixed;
   list them in the final message.
2. Repair a failing build or a failing `smoke` check. A smoke failure always goes to one
   `tutor-lesson-builder` with the smoke lines in `FIX LIST`. At most 3 rounds.
3. Obtain `tutor review <topic> --json` (fingerprint and required checks), then spawn
   fresh isolated reviewers. Pass the learner request, scoped plan/sources and artifact
   paths, not author reasoning or self-review verdicts. One `tutor-verifier` at depth `quick`; at `standard` and `deep` a
   second one in the same batch, scoped to the projects. It edits nothing.
   Before dispatch, provide a live current-build preview URL and the host browser tool
   or installed headless Playwright procedure. The orchestrator owns the preview's
   bounded lifecycle and stops it after review. Test each required visual's controls,
   observable changes and reset; a smoke pass alone checks rendering, not semantics.
   If runtime inspection is unavailable, keep visual-usefulness unreviewed.
4. Fix what the verifier reports through the owning worker. Renew stale receipts
   in generation order: re-gate intake if plan/sources changed, run check research
   when its inputs changed, then done each affected required stage (project stages
   need their check renewed before done). All plan/source changes may stale all
   earlier stages; use status/next, never assume only the edited file's stage changed.
   After the LAST edit and stage re-gating, run tutor check <topic> finalize, then
   obtain a NEW review packet and refresh BOTH review scopes against that fingerprint.
   Direct build/smoke calls diagnose errors but do not renew CLI execution evidence.
   Record both scopes through tutor review --file. Curriculum reviews require the
   current input_fingerprint, independent:true, actual reviewer_run_id and evidence
   assessments for every required check. Standard/deep use separate fresh runs.
   Missing fresh workers leave review pending. Repeat repair/recheck/review within
   the retry limits; no artifact may change between passing reviews and done finalize.
5. After passing review imports, run `tutor validate <topic> --all`, then
   `node harness/bin/tutor.mjs done <topic> finalize`. If it cannot pass only because of
   stages recorded as failed, run
   `node harness/bin/tutor.mjs fail <topic> finalize --reason "blocked by failed stages: <list>"`
   and say so in the final message.

## When to stop before the end

Persist a compact handoff after each wave. After compaction, reload this skill and `tutor next`
and continue automatically. Do not require a second learner request after 15 returns. If the
host supports fresh workers/continuations, use its native facility. If it cannot continue,
report the concrete host limitation and saved resume command; never claim a context guarantee.

## The final message to the learner

Send this when `finalize` is done (or failed). Keep it short and plain; the learner is a
beginner. Fill it from `tutor status <topic>` and from `node harness/bin/tutor.mjs next <topic>`:
on a finished topic it prints the topic's own reading order (`reading_order_line` with
`--json`) and the line that says how to open the lesson (`open_lesson` with `--json`). Copy both as printed. Do not write the reading
order from memory: a `quick` topic has no repository deep dive and no capstone, and naming
them sends the learner to notes that do not exist.

```text
Your notes for <Title> are ready.

What I made: a short brief, <N> lesson pages, <N> supplementary concept notes, <N> mini projects, <N> digests of
the key papers and docs, a deep dive into <org>/<repo>, a capstone project (<name>), one-page
final notes, and <N> recall cards.

Read in this order. You never need to jump around:
<the reading order, exactly as `tutor next <topic>` printed it>

<the "open the lesson" line, exactly as `tutor next <topic>` printed it>
Open the notes: open the `vault/` folder in Obsidian and start at `00-start-here-<slug>`.
Projects: `projects/<domain>/<subdomain>/<slug>/`.

Not finished: <"nothing", or each failed stage/required child topic with what is missing and the
command to resume it>.
Research boundary: <scope, stop reason, deferred/excluded concepts and any unresolved evidence>.

Later you can say "add this to my notes: ..." to save your own insight, and "quiz me on
<Title>" for a recall session.
```

In "What I made", leave out any item that this topic does not have (for example, no deep
dive and no capstone at `quick` depth). If the learner may want them, add one line: "For a
repository deep dive and a capstone, say `/learn <slug> --depth standard`."

## Troubleshooting

When something does not behave as this file says (a stage stuck `in_progress`, an agent type
that is missing, exit code 2, a worker that wrote extra files, a wrong or weak source, a
request for a deeper version of an existing topic, an install that fails), look it up in
`references/troubleshooting.md` and do what its table says. Two rules hold everywhere: when
the validator and a skill disagree, the validator wins; and never delete a note in
`vault/_concepts/` or `vault/_tech/` that was created with `tutor concept`.

## Reference files

- `references/stage-runbook.md` — for each stage: the units, the unit ids, what to do before
  and after the workers. Read only the section of the stage you are running.
- `references/worker-brief-examples.md` — one filled brief per agent, including the verifier.
- `references/troubleshooting.md` — what to do when a command or a worker misbehaves.
