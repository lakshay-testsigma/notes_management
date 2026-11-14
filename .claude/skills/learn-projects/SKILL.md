---
name: learn-projects
description: Build the hands-on mini projects for a topic in the tutor harness — each one a small real use case with a README, a runnable starter with TODO markers, and a tested solution — plus the vault index note 03-mini-projects. This is the `mini-projects` stage. Use it whenever `tutor next` lists the `mini-projects` stage, whenever a `tutor-project-builder` worker is given a mini-project unit, whenever the learner asks for "a practice project", "an exercise", "something to build" or "a hands-on task" for a topic in this repository, and whenever `tutor validate <topic> mini-projects` reports a failure to repair.
argument-hint: "<topic id or slug> [unit id such as mini-01]"
---

# learn-projects — mini projects (stage `mini-projects`)

A mini project is where the learner stops watching and starts doing. Each project
proves one concept from the topic inside a situation a working engineer actually
meets, takes one to three hours, and ends with a check the learner can run
themselves. The learner is a beginner, so a project that does not start, or a
solution whose tests do not pass, costs them an evening and their trust.

In this document, `tutor` means `node harness/bin/tutor.mjs`, run from the
repository root.

## When to use

Use this skill when the `mini-projects` stage of a topic is ready to run. Two
kinds of sessions read it:

- The **stage runner** is the session that runs the stage (the `learn`
  orchestrator, or a single session doing everything). It does Part A and Part C
  of the steps.
- A **worker** is a `tutor-project-builder` subagent that was given one unit id
  such as `mini-02`. It does Part B only, for that one project.

If no subagents are available, one session does Part A, then Part B once per
project in order, then Part C.

## Inputs

Run this first and take every path from its output (the projects folder is
`projects_dir`, the index note is `mini_projects`, the handoff folder is
`handoffs_dir`):

```bash
node harness/bin/tutor.mjs paths <topic> --json
```

Then read only these files:

1. The plan, printed by `node harness/bin/tutor.mjs plan <topic> --json`:
   `mini_projects` (each entry has `n`, `slug`, and `use_case`), `outcomes`,
   `prerequisites`, and `lesson_outline` (for the concept names).
2. `harness/domains/<domain>/pack.json`: `default_stack` and `safety`.
3. `harness/domains/<domain>/playbook.md`, only the sections under
   `## Mini project patterns` and `## Safety and ethics`.
4. `01-brief-<slug>.md`.
5. `04-digests/00-digests-<slug>.md`, the index only. Open one digest only when
   the project needs an exact fact from it (an API name, a default value).
6. For each analyzed repository, `<repo>-takeaways.md` in `05-repo-intel/`, when
   it exists. One realistic detail borrowed from production makes a project feel
   real.
7. The index note `03-mini-projects-<slug>.md`, which `tutor init` created from a
   template (stage runner only).
8. This skill's `references/project-readme-example.md` and
   `references/starter-and-solution.md` (workers), and
   `references/index-note-example.md` (stage runner).

Do not read the lesson `.mdx` pages. The lesson stage runs at the same time as
this one, so its pages may not exist yet.

Check the size before reading, and stay under 60,000 tokens:

```bash
node harness/bin/tutor.mjs budget <file1> <file2> ...
```

## Steps

### Part A — plan the units (stage runner)

1. Mark the stage as started. Skip this when the stage is already `in_progress`.

   ```bash
   node harness/bin/tutor.mjs start <topic> mini-projects
   ```

2. Read `mini_projects` from the plan. Each entry becomes one unit and one
   folder:

   | Plan entry | Unit id | Folder |
   |------------|---------|--------|
   | `{ "n": 1, "slug": "job-queue" }` | `mini-01` | `<projects path>/mini-01-job-queue/` |
   | `{ "n": 2, "slug": "event-replay" }` | `mini-02` | `<projects path>/mini-02-event-replay/` |

3. Register the units. Skip a unit that already exists.

   ```bash
   node harness/bin/tutor.mjs unit <topic> mini-projects add mini-01
   node harness/bin/tutor.mjs unit <topic> mini-projects add mini-02
   ```

4. Spawn one `tutor-project-builder` worker per unit. The projects are
   independent, so they run in parallel, within the limit of the table "How
   many workers at once" in `.claude/skills/learn/SKILL.md` (it depends on the
   depth and counts the lesson workers of the same wave too). Each worker
   needs the topic id, its unit id, and its folder path. It works out
   everything else from this skill and the plan.

### Part B — build one project (worker)

1. Mark the unit as started:

   ```bash
   node harness/bin/tutor.mjs unit <topic> mini-projects start mini-NN
   ```

2. Read the inputs listed above for workers. From the plan, find your own entry
   (unit `mini-02` is the entry with `"n": 2`) and note what the other entries
   cover, so that your project does not prove the same concept as another one.

   Then find your guidance level in this table. The progression matters:
   guidance is removed project by project, so that the learner ends up able to
   build without it. What each level means is defined in
   `references/starter-and-solution.md`.

   | Projects in the plan | Project 1 | Project 2 | Project 3 |
   |----------------------|-----------|-----------|-----------|
   | 1 (depth `quick`) | guided | — | — |
   | 2 (depth `standard`) | guided | less guided | — |
   | 3 (depth `deep`) | guided | less guided | independent |

3. Create the folder and write the top of `README.md` immediately: the title,
   `## The real use case`, and `## What this proves`. Writing these first fixes
   the scope before any code exists, and it leaves a record if the session ends
   early.

4. Decide the stack. Use `default_stack` from `pack.json` unless the plan entry
   or the playbook names another one. Keep dependencies minimal and pin every
   version exactly (no `^`, `~`, or `>=`), because a project that worked today
   must still install in a year.

5. Build `solution/` first: the complete, small, readable program and its tests.
   The starter is cut out of a working solution, which guarantees that every TODO
   can be solved. Follow `references/starter-and-solution.md` for the layout,
   size limits, and comment style.

6. Run the solution's tests. They must pass. Use the commands of the chosen
   stack, for example:

   ```bash
   npm --prefix <project path>/solution install
   npm --prefix <project path>/solution test
   ```

   Fix every failure before continuing. A solution that was not run is not a
   solution, and the count of passing tests goes into your return summary.

7. Derive `starter/` from the solution: copy it, then replace the parts the
   learner must write with numbered `TODO(n)` markers that match the numbered
   tasks in the README. Keep the tests in the starter. The exact marker format
   for each guidance level is in `references/starter-and-solution.md`.

8. Verify the starter. Install it and run its tests. The run must start without
   syntax or import errors, and the tests must fail only where a TODO is not yet
   implemented. That failing test run is the learner's starting line.

9. Finish `README.md` with the remaining headings, following
   `references/project-readme-example.md`.

10. Run the self-check at the end of `references/starter-and-solution.md`, then
    check your own folder with the validator, and only your folder:

    ```bash
    node harness/bin/tutor.mjs validate <topic> mini-projects --files <projects path>/mini-NN-<slug>
    node harness/bin/tutor.mjs unit <topic> mini-projects done mini-NN
    ```

    With `--files` the validator reports only failures inside that folder. Fix
    them before `unit … done`. Do not run the full
    `tutor validate <topic> mini-projects`: failures about other projects or
    about the index note are not your job. Then return the summary described
    under "Context budget".

### Part C — index note and gate (stage runner)

1. When every worker has returned, fill `03-mini-projects-<slug>.md` above its
   `## My insights` heading, following `references/index-note-example.md`. The
   workers' summaries contain the use case and the concept each project proves.
   If a summary is missing, read the first two sections of that project's
   `README.md`.
2. Run the gate.

## Output contract

For every entry in `plan.mini_projects`, under the projects path from
`tutor paths`:

```
mini-NN-<slug>/
├── README.md
├── starter/      runnable skeleton, TODO(n) markers, the tests, .gitignore
└── solution/     complete program, the same tests (passing), .gitignore
```

`README.md` has exactly these headings, in this order:

| Heading | Content |
|---------|---------|
| `# Mini project NN — <Title>` | One line under it: time estimate and guidance level. |
| `## The real use case` | Three to five sentences: who has this problem and what goes wrong without the concept. |
| `## What this proves` | The one concept from the topic that this project makes the learner use, and the plan outcome it serves. |
| `## Prerequisites` | Tools with versions, and services to start, with the exact commands. |
| `## How to run` | Commands for installing, starting, and testing the starter. |
| `## Your tasks` | Numbered tasks. Task `n` matches `TODO(n)` in the starter. |
| `## How to check your work` | The test command, the expected output, and one manual check. |
| `## Stretch goals` | Two or three extensions, without solutions. |
| `## Hints` | One `### Hint for task n` subheading per task. This section is far down the file on purpose, so that the learner tries first. |
| `## Compare with the solution` | Where the solution is, and two or three things to look for in it. |

The vault index note `03-mini-projects-<slug>.md` keeps the frontmatter and
title line of its template (`stage: mini-projects`). The scaffold lines
`<!-- tutor:placeholder -->` and "Not written yet" are deleted and replaced by
`## How to use these projects`, `## Projects` (one table row per project: title,
real use case, time, guidance level, and the path of its README as inline code;
the validator checks that every folder name such as `mini-01-job-queue` appears
in the note), and `## What each project proves`. `## My insights` stays the last heading with
nothing below it. The filled example is `references/index-note-example.md`.

Rules for both:

- The use case is real and specific ("a job queue that survives a worker crash"),
  not a toy ("print messages from a stream").
- Each project is sized for one to three hours. If the solution needs more than
  about 300 lines of code, cut the scope.
- No secrets in any file. Configuration that differs per machine goes into a
  `.env.example`.
- For a domain whose playbook defines a mini project as something other than
  code (an analysis, a worksheet, a threat model), `starter/` holds the blank
  working files and `solution/` holds a completed version with a way to check it.
  The folder names stay the same, because the gate looks for them.
- For the `security` domain, follow `## Safety and ethics` in the playbook: the
  project runs only against a local lab that the project itself starts.

## Gate

Only the stage runner runs this full gate. A worker checks its own folder with the
`--files` form of Part B, step 10; failures about files it does not own are not its job.

```bash
node harness/bin/tutor.mjs validate <topic> mini-projects
```

The validator prints each failure as `path: problem. fix.` Fix exactly the reported
lines and run it again. When it passes:

```bash
node harness/bin/tutor.mjs done <topic> mini-projects
```

Make at most three attempts. If the third validation still fails, stop and record
the remaining failures:

```bash
node harness/bin/tutor.mjs fail <topic> mini-projects --reason "<the failures that remain>"
```

The validator checks that the files exist. It cannot check that the tests pass,
so steps 6 and 8 of Part B are part of the gate even though the CLI does not run
them.

## Context budget

- One unit is one project. The unit id is `mini-NN`, with two digits, taken from
  `n` in the plan entry: `mini-01`, `mini-02`, `mini-03`. One
  `tutor-project-builder` worker builds one unit. Units are independent and run
  in parallel, within the limit of the table "How many workers at once" in
  `.claude/skills/learn/SKILL.md`.
- After the units, the stage runner writes the index note
  `03-mini-projects-<slug>.md` (see "Output contract") and runs the gate.
- A worker reads at most 60,000 tokens. Size the reading list with
  `tutor budget`; the inputs above are normally well under the limit. Do not read
  other projects' code or cloned repositories in `.cache/`.
- Write as you go: the README's first sections before the code, each solution
  file as soon as it is designed, each test as soon as its function exists.
- If the project turns out larger than planned, or the session is getting long,
  stop and hand off. Write `<state path>/handoffs/mini-projects-mini-NN.md` with
  the headings `## Done`, `## Remaining`, and `## Next step` (include the exact
  command that was failing, if any), then run:

  ```bash
  node harness/bin/tutor.mjs unit <topic> mini-projects fail mini-NN --handoff <state path>/handoffs/mini-projects-mini-NN.md
  ```

  and return the single line `CONTINUE: <handoff path>`. The stage runner starts
  a fresh worker with that file. A worker that receives a handoff file reads it
  first and continues from its `## Next step`; it does not start over.
- A finished worker returns at most 150 words. If the brief you were given
  defines a return format, use that one. Otherwise use this:

  ```
  STAGE: mini-projects  UNIT: mini-NN  STATUS: done
  FILES: <project path>/README.md, starter/ (<n> files), solution/ (<n> files)
  FINDINGS:
  - Title, real use case, and the one concept it proves (one sentence).
  - Stack, pinned dependencies, time estimate, guidance level; solution tests: <n> passed.
  - Starter check: runs, <n> tests fail on TODOs as intended.
  PROBLEMS: <"none", or one line each>
  ```

## Common mistakes

- Writing the starter first and the solution second. The TODOs then describe
  code that was never proven to work.
- Reporting tests as passing without running them.
- A starter that crashes on import. The learner should see failing tests, not a
  stack trace from a missing file.
- Hints placed directly under each task, or inside collapsible `<details>`
  blocks. Hints live under the `## Hints` heading near the end of the README.
- Unpinned dependencies, or five libraries where the standard library is enough.
- Three projects with the same level of guidance, or two projects that prove the
  same concept.
- Requiring a cloud account or a paid service. Everything runs locally, with
  Docker for services when needed.
- Committing `node_modules`, `.venv`, or build output. Each of `starter/` and
  `solution/` has a `.gitignore`.
- Writing wikilinks to project folders in the vault note. Project files are not
  vault notes; write their paths as inline code.
