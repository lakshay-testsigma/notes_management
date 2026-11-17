# Stage runbook for the orchestrator

Read only the section for the stage you are running. Each section says who does the work, how
to name the units, and what you do before and after the workers. `<topic>` is the full topic
id. `<state>`, `<vault>`, `<lessons>`, and `<projects>` are the paths printed by
`node harness/bin/tutor.mjs paths <topic> --json`. `<slug>` is the last part of the topic id.

Contents: intake · research · brief · digest · repo-intel · lesson · mini-projects · capstone ·
notes · finalize · rule for stages owned by other skills.

For every worker stage the shape is the same:

1. Register each unit: `node harness/bin/tutor.mjs unit <topic> <stage> add <unit-id>`.
2. Fill one worker brief per unit (template in `SKILL.md`).
3. Spawn in batches. How many workers run at once is decided only by the table "How many
   workers at once" in `SKILL.md`; no stage skill overrides it.
4. Wait for every worker of the batch to return (workers may run in the background and
   return by notification), handle the returns (table in `SKILL.md`), then confirm unit
   status with `node harness/bin/tutor.mjs status <topic> --json`.
5. Do the "after the units" step of this section.
6. Gate: `node harness/bin/tutor.mjs done <topic> <stage>`.

Skip step 1 for a unit that already exists (you are resuming).

---

## intake

Inline. Read `.claude/skills/learn-intake/SKILL.md` and follow it. It runs `tutor init`,
`tutor start`, writes the plan, and gates itself. You only need the topic id it produces.

## research

Read `docs/RESEARCH-WORKFLOW.md` and `.claude/skills/learn-research/SKILL.md`.
The latter's Parts A/B/C own source seeding, recursive frontier units, merging and
closing. Register a bounded discovery queue, in addition to useful source-category
units. Give each worker the assigned concepts, exact source slots, search/fetch
budget, proposal path and learner requirements. Only the orchestrator merges the
curriculum. Do not substitute three category searches for recursive discovery.

Each research unit also returns visual candidates (sequences, dependencies, comparisons,
state changes, key numbers, each with source id and section); merge them into
`<handoffs_dir>/visual-candidates.md` for the lesson, digest and video workers.

After each round, persist source evidence and the unfinished frontier. At closing,
freeze source assignments and planned six-aspect coverage paths, re-gate intake,
run check research, then done research. Do not lower required digest/repo minima or
skip required repo-intel when source discovery fails. Report a research failure or
split the subject into bounded linked topics, preserving the requested course queue.

## brief

Inline, after `research` is done. Read `.claude/skills/learn-brief/SKILL.md` and follow it.
If `research` failed, the pipeline has already stopped, so this case does not occur.

## digest

One unit per source whose `use_for` contains `digest`. Get them from
`node harness/bin/tutor.mjs sources <topic> list --json`.

- Unit id: the source id (for example `redis-streams-docs`).
- Agent: `tutor-digester`.
- Input files: the source URL, plus `<vault>/01-brief-<slug>.md`.
- Output files: `<vault>/04-digests/<source-id>-<slug>.md`, plus the shared concept notes
  the worker creates with `tutor concept` (at most 4). Those notes are wanted; never delete
  them.

**After the units.** Write the index note `<vault>/04-digests/00-digests-<slug>.md` yourself,
from the worker summaries and the source list, using the index template in
`.claude/skills/learn-digest/references/digest-template.md`. Do not open the digests to do
this; the summaries are enough. Then gate.

## repo-intel

One repository per source whose `use_for` contains `repo-intel`. The folder name is
`<org>-<repo>` and the clone goes to `.cache/repos/<org>__<repo>/`. The work has three phases
per repository. Phases of different repositories can share a batch.

**Phase 1 — scout (one unit per repository).**

- Unit id: `<org>-<repo>-scout`.
- Agent: `tutor-repo-analyst`. `TASK`: "Scout: clone, record the commit, slice, choose the
  slices, write the overview and the slice plan (Part A of the skill)."
- Input files: the repository URL and the playbook path.
- Output files: `<vault>/05-repo-intel/<org>-<repo>/<repo>-overview.md`,
  `<state>/handoffs/repo-intel-<org>-<repo>-slices.md`, and one file list per chosen slice,
  `.cache/tmp/<slug>/<org>-<repo>-module-<name>.files.txt`.
- The scout returns the list of module unit ids it planned (4–8), each in the form
  `<org>-<repo>-module-<name>`, and the names of the slices it skipped.

**Phase 2 — modules (one unit per chosen slice).** Register each unit id the scout returned.

- Agent: `tutor-repo-analyst`. `TASK`: "Module: analyze this one slice (Part B of the skill)."
- Input files: `<state>/handoffs/repo-intel-<org>-<repo>-slices.md` and the file list
  `.cache/tmp/<slug>/<unit-id>.files.txt` that the scout wrote.
- Output file: `<vault>/05-repo-intel/<org>-<repo>/<repo>-module-<name>.md`.
- Spawn within the limit of the table "How many workers at once" in `SKILL.md`; queue the
  rest.

**Phase 3 — synthesis (one unit per repository), after all module units are done or failed.**

- Unit id: `<org>-<repo>-synthesis`.
- Agent: `tutor-repo-analyst`. `TASK`: "Synthesis: write architecture, tech-and-services,
  findings, takeaways, and pattern notes from the module notes only (Part C of the skill)."
- Input files: the overview, the slice plan, and every `<repo>-module-*.md` note.
- Output files: `<repo>-architecture.md`, `<repo>-tech-and-services.md`, `<repo>-findings.md`,
  `<repo>-takeaways.md`, `<repo>-pattern-*.md` in the repository folder, plus the `_tech` and
  `_concepts` notes it creates with `tutor concept`.
- If fewer than 2 module notes exist, do not run the synthesis; treat the stage as failed.

**After the units.** Write the index note `<vault>/05-repo-intel/00-repo-intel-<slug>.md`
yourself from the worker summaries, using the index template in
`.claude/skills/learn-repo-intel/references/note-templates.md`. Then gate.

## lesson

Skill: `learn-site`. Agent: `tutor-lesson-builder`. First apply the "Rule for stages owned by
other skills" below. The defaults, used only when the skill does not say otherwise:

- Units: cut `plan.lesson_outline` (from `tutor plan <topic> --json`), in order, into batches of
  2–3 pages. Unit id: `pages-<first order>-<last order>` with two digits, for example
  `pages-01-03`.
- Input files: whatever the Inputs section of `learn-site` lists; add the line "Outline entries
  with order <first> to <last> from `tutor plan <topic> --json`".
- Output files: one `.mdx` file per page in `<lessons>/`, named `NN-<page-slug>.mdx`.
- Extra units: `concept-<id>` for each included curriculum concept needing its own
  note. Use curriculum_dir from tutor paths; one `<id>-<topic-slug>.md` per worker.
  Follow learn-site Part B2, stage:concept, all six aspects with direct evidence,
  marker above My insights, and write-note. Paths were assigned before generation.
  Register and complete these as lesson units; gate MDX and concept notes together.
- Video units (visual-first plans): `video-<id>` for each outline entry with a `video`, agent
  `tutor-video-producer`, `READ FIRST` `.claude/skills/learn-video/SKILL.md`. Input files: the
  outline entry, its assigned source entries, the brief, the digest index and the digests or
  repo-intel findings that state the sequence, `<handoffs_dir>/visual-candidates.md`, and one
  example from `harness/examples/videos/`. Output: `<videos_dir>/<id>/video.json` (plus
  `scenes/` when needed). Spawn video units in the first batch. A unit that returns
  `STATUS: blocked` (no FFmpeg/Docker) is done: the storyboard is the honest deliverable; record
  the blocker with `tutor log` and in the final message.
- Experience units (adaptive plans): `experience-<id>` for each outline entry whose mode
  (`tutor experience <topic> plan`) is interactive, branching or hybrid; agent
  `tutor-video-producer`; `READ FIRST` learn-video and `harness/rubrics/experiences.md`. It
  writes the experience's videos, deck and `experience.json`, runs `tutor experience <topic>
  build <id>` (lint and publish; renders only Watch and summary videos) and `tutor deck <topic>
  check <id>`. Videos owned by an experience get no separate `video-<id>` unit. The page worker
  embeds `<Experience id>`; a missing build is expected until the unit returns. Before `done`,
  `tutor experience <topic> list` shows every planned experience built.
- Visuals: page workers draw and register their visuals through
  `.claude/skills/learn-visuals/SKILL.md`; add `.claude/skills/learn-visuals/SKILL.md`,
  `harness/rubrics/visuals.md` (section "Every visual must") and `<handoffs_dir>/visual-candidates.md`
  to their input files. After all units: `tutor visuals <topic> check` and `tutor map <topic>`.
- Index note: `<vault>/02-lesson-<slug>.md`. It names, for each page, the plan outcome the
  page serves, and links supplementary notes in prerequisite order. Do not rewrite
  the curriculum from parallel author workers. If the frozen plan changes, re-gate
  earlier stages and renew checks before continuing.

## mini-projects

Skill: `learn-projects`. Agent: `tutor-project-builder`. First apply the rule below. Defaults:

- Units: one per entry of `plan.mini_projects`. Unit id: `mini-<nn>` with two digits, for
  example `mini-01`.
- Output: the folder `<projects>/mini-<nn>-<project-slug>/`.
- `READ FIRST` in the brief: `.claude/skills/learn-projects/SKILL.md`.
- Index note: `<vault>/03-mini-projects-<slug>.md`.

## capstone

Skill: `learn-capstone`. Agent: `tutor-project-builder`. First apply the rule below. Defaults:

- One unit with the id `capstone`.
- Output: the folder `<projects>/capstone/` and the note `<vault>/06-capstone-<slug>.md`.
- `READ FIRST` in the brief: `.claude/skills/learn-capstone/SKILL.md`.
- A capstone is large. Expect one or two `CONTINUE` returns; that is normal.

## notes

Inline. Read `.claude/skills/learn-notes/SKILL.md` and follow it, reading only the files its
Inputs section lists. Run it before `finalize`.

## finalize

Inline. The commands and the five steps are in `SKILL.md` under "Finalize". The details of
steps 2 to 4:

**Step 2 — a failing build, smoke or interact check.** If `npm --prefix site run build` fails, read
only the last 40 lines of its output. The error names a file. Fix that file yourself if the
problem is small (a wrong prop, an unclosed tag); otherwise spawn one `tutor-lesson-builder`
with the error lines in `FIX LIST`. If `npm --prefix site run smoke` fails, it names the page
and the console or hydration error. Do not fix it yourself: spawn one `tutor-lesson-builder`
with those lines in `FIX LIST` and that page as its only output file. After each repair run
the build and then `smoke` again; at most 3 rounds, then record `finalize` as failed with the
remaining lines. Then run `npm --prefix site run interact` (it drives the shared simulations,
checks Reset, captions, the sandbox, accessibility names and a 375 px layout); a failure in a
shared component is a harness bug to report, a failure on a topic page goes to the
`tutor-lesson-builder` like a smoke failure. Visual-first topics: run `tutor visuals <topic>
check` and `tutor map <topic>` before the reviewers so the vault visual notes are current.

**Step 3 — the verifier.** Use the verifier briefs in `worker-brief-examples.md`,
explicitly loading `.claude/agents/tutor-verifier.md`. Get current checks and fingerprint
with tutor review <topic> --json. Fresh reviewers receive learner request, scoped plan,
source assignments, curriculum and artifacts, without author reasoning. If the host
cannot supply fresh isolation, save a handoff and leave review pending. Content checks
include all concepts and six-aspect teaching coverage, not just a two-page sample.
The orchestrator starts a bounded preview of the current build (follow site/AGENTS.md
for dev lifecycle, or use the static-server procedure in site/scripts/smoke.mjs).
Pass the actual live URL, host browser capability or installed headless Playwright
procedure, and required interaction tasks. Keep it available through review and stop
it afterwards. Reviewers must test visual controls/observable changes/reset. An
unavailable browser or preview leaves visual-usefulness in not_checked.
Visual-first topics add the checks of `harness/rubrics/visuals.md` "Review":
visual-accuracy, visual-efficacy (answer each visual's learning_check from the
prose alone, then with the visual), interaction-behavior, accessibility-responsive,
writing-standard, video-consistency when the topic has a video, and project-diagrams
for the projects scope. Pass `tutor visuals <topic> list --json` and the visual
notes under `<vault>/visuals/` in the input list.

| Depth | Verifiers | Scope |
|-------|-----------|-------|
| `quick` | 1 | sources, lesson pages, stage notes, digests, and the mini project (README and tests) |
| `standard`, `deep` | 2, in one batch | verifier 1: sources, lesson pages, stage notes, digests, repo deep dive; verifier 2: each project README and running each project's tests |

Fill the input list of the brief from `tutor paths <topic> --json` with exactly these:
`sources.json`; the lesson `.mdx` files; the numbered stage notes that exist (`01-brief` to
`08-recall`, with the index notes of `04-digests/` and `05-repo-intel/`); the digest notes;
for a topic with a deep dive, `<repo>-findings.md` and `<repo>-takeaways.md`; supplementary concept notes; and each
project's `README.md` (the verifier also runs each project's tests). Never pass "every
path": the verifier then spends its budget on harness files. Each verifier reads at most
the capacity-aware budget printed by tutor budget. Split large reviews into fresh
bounded inspection units with evidence files, then a final isolated reviewer checks
all required assessments. Unread requirements go in not_checked and block pass.
Reviewers use validate --all --structure-only for artifact findings and inspect
execution status separately. Missing review imports are expected until they return;
full readiness validation runs after both scopes are imported, never as a circular
prerequisite for producing the reviews.
Return exact review JSON (checks from the packet, findings, not_checked, evidence
assessments, independent:true, input_fingerprint and actual reviewer_run_id); the
orchestrator saves/imports it. Standard/deep scopes use different worker ids.

**Step 4 — the findings.** Fix up to 5 small findings yourself with the Edit tool. Give
larger groups to the worker of the stage that owns the file, with the findings in
`FIX LIST`. Correct one field of a source with
`node harness/bin/tutor.mjs sources <topic> update <id> --file <patch.json>`; remove a source
that fails the quality gate with `sources <topic> remove <id> --reason "..."` (both rows are
in `troubleshooting.md`). A sentence that cites a page outside `sources.json` is either
backed by a newly verified source or removed. After repairs, inspect stale receipts
with status/next. Re-gate affected stages in generation order, renewing research and
project execution checks before done as necessary. Plan/source changes may stale
all stages. Run tutor check <topic> finalize after the final edit and stage re-gating;
plain build/smoke does not record evidence. Obtain a fresh review packet and refresh
BOTH scopes for its new fingerprint, then done finalize without changing artifacts.

---

## Rule for stages owned by other skills (lesson, mini-projects, capstone, notes)

Those skills follow the same section order as every stage skill, and their Steps are split
into parts: a part for the stage runner before the workers (plan the units), a part for one
worker, and a part for the stage runner after the workers (index note and gate). You are the
stage runner. The skill wins over the defaults in this runbook, with one exception: how many
workers run at once is decided only by the table "How many workers at once" in `SKILL.md`.

1. List the headings of the skill:

   ```bash
   grep -n '^## \|^### ' .claude/skills/<skill>/SKILL.md
   ```

2. Read only the stage-runner parts of "Steps" (usually "Part A" and "Part C") with the Read
   tool (`offset` and `limit`). Do not read the worker part; the worker reads it.
3. Follow Part A: it names the unit ids and what each worker needs. Register the units, fill
   one worker brief per unit from the template in `SKILL.md`, and spawn in batches.
4. After every worker has returned, follow Part C: it usually asks you to write the index
   note from the worker summaries, then to run the gate. You are the only one who runs the
   full `tutor validate <topic> <stage>`; workers check their own files with `--files`.
5. If the skill has no such parts, use the defaults of this runbook, then run
   `node harness/bin/tutor.mjs validate <topic> <stage>`. If it reports the index note as
   missing or incomplete, read the "Output contract" section of the skill and write the index
   note yourself from the worker summaries. It is a short list of links.

If a skill tells you to run `tutor start` and the stage is already `in_progress`, skip that
command.
