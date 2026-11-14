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

Read the depth with `node harness/bin/tutor.mjs plan <topic> --json` (you also need
`digest_targets` and `repo_targets` from it).

**Depth `quick`: inline.** Read `.claude/skills/learn-research/SKILL.md` and follow Part B
yourself for all three categories, with a total of 3–6 sources. Keep every fetch narrow. Then
do Part C of that skill, which includes the coverage check of step 4 below.

**Depth `standard` or `deep`: three units.**

| Unit id | Category | Sources to add | Flags to set |
|---------|----------|----------------|--------------|
| `docs` | official docs and standards | 2–4 | exactly 1 source gets `digest` |
| `papers` | defining papers and standard books | 2–5 | exactly `digest_targets − 1` sources get `digest` (0 when `digest_targets` is 1) |
| `repos` | production repositories and engineering blogs | 2–4 | exactly `repo_targets` repositories get `repo-intel` |

Put the numbers from the table into the `TASK` line of each brief, for example: "Add 2–4
verified sources in the category papers and books. Flag exactly 2 of them with `digest`."
Agent: `tutor-researcher`. Output file of each unit: none in the vault; the worker adds entries
with `tutor sources <topic> add --file` and keeps its entry files in `.cache/tmp/<slug>/sources/`.

**After the units.**

1. Run `node harness/bin/tutor.mjs sources <topic> list --json`.
2. Count the entries whose `use_for` contains `digest` and those whose `use_for` contains
   `repo-intel`. If a count is lower than the plan, lower the plan to the real number. Write
   `{"digest_targets": <n>}` or `{"repo_targets": <n>}` to `.cache/tmp/<slug>/plan-patch.json`
   and run `node harness/bin/tutor.mjs plan <topic> --set .cache/tmp/<slug>/plan-patch.json`.
   Log it: `node harness/bin/tutor.mjs log <topic> "research: digest_targets lowered to <n> (only <n> sources verified)"`.
3. If the total is below the gate minimum (5, or 3 for `quick`), spawn one more
   `tutor-researcher` for the category with the fewest entries, asking for the missing number.
4. Coverage check (Part C of `learn-research` has the details): every plan outcome is
   supported by at least one source, and every planned lesson page has a source to draw on.
   For a gap, find one more source (Part B yourself, for that single source) or patch the
   outcome with `tutor plan <topic> --set`.
5. Run `node harness/bin/tutor.mjs map <topic>` so `09-resources-<slug>.md` is generated.
6. Gate.

If `repo_targets` is now 0 and a `repo-intel` stage exists, close it when its wave comes with
`node harness/bin/tutor.mjs skip <topic> repo-intel --reason "no repository passed the source gate"`.

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
- Index note: `<vault>/02-lesson-<slug>.md`. It names, for each page, the plan outcome the
  page serves, so an outcome that no page teaches is visible.

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

**Step 2 — a failing build or smoke check.** If `npm --prefix site run build` fails, read
only the last 40 lines of its output. The error names a file. Fix that file yourself if the
problem is small (a wrong prop, an unclosed tag); otherwise spawn one `tutor-lesson-builder`
with the error lines in `FIX LIST`. If `npm --prefix site run smoke` fails, it names the page
and the console or hydration error. Do not fix it yourself: spawn one `tutor-lesson-builder`
with those lines in `FIX LIST` and that page as its only output file. After each repair run
the build and then `smoke` again; at most 3 rounds, then record `finalize` as failed with the
remaining lines.

**Step 3 — the verifier.** Use the verifier briefs in `worker-brief-examples.md`.

| Depth | Verifiers | Scope |
|-------|-----------|-------|
| `quick` | 1 | sources, lesson pages, stage notes, digests, and the mini project (README and tests) |
| `standard`, `deep` | 2, in one batch | verifier 1: sources, lesson pages, stage notes, digests, repo deep dive; verifier 2: each project README and running each project's tests |

Fill the input list of the brief from `tutor paths <topic> --json` with exactly these:
`sources.json`; the lesson `.mdx` files; the numbered stage notes that exist (`01-brief` to
`08-recall`, with the index notes of `04-digests/` and `05-repo-intel/`); the digest notes;
for a topic with a deep dive, `<repo>-findings.md` and `<repo>-takeaways.md`; and each
project's `README.md` (the verifier also runs each project's tests). Never pass "every
path": the verifier then spends its budget on harness files. Each verifier reads at most
the capacity-aware budget printed by `tutor budget`.

**Step 4 — the findings.** Fix up to 5 small findings yourself with the Edit tool. Give
larger groups to the worker of the stage that owns the file, with the findings in
`FIX LIST`. Correct one field of a source with
`node harness/bin/tutor.mjs sources <topic> update <id> --file <patch.json>`; remove a source
that fails the quality gate with `sources <topic> remove <id> --reason "..."` (both rows are
in `troubleshooting.md`). A sentence that cites a page outside `sources.json` is either
backed by a newly verified source or removed. Then rerun `validate <topic> --all`, the
build, and `smoke` once.

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
