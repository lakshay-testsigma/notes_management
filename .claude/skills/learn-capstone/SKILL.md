---
name: learn-capstone
description: Build the production-style capstone project for a topic in the tutor harness — a real problem solved with a clear layered, class-based architecture a beginner can follow, with ARCHITECTURE.md, a decision record, tests that pass, and the vault note 06-capstone. This is the `capstone` stage. Use it whenever `tutor next` lists the `capstone` stage, whenever a `tutor-project-builder` worker is given the unit `capstone`, whenever the learner asks for "a real project", "a production-ready project", "a portfolio project" or "a capstone" for a topic in this repository, and whenever `tutor validate <topic> capstone` reports a failure to repair.
argument-hint: "<topic id or slug>"
---

# learn-capstone — the production-style project (stage `capstone`)

The capstone is where everything the topic taught is put to work on one real
problem. The learner is a beginner who asked for two things: an architecture
that a fresher can follow, and code organized in classes with object-oriented
ideas applied well. So the project has to be readable before it is clever. Every
class has one job, every layer has one direction of dependency, and
`ARCHITECTURE.md` says where each idea is used and why. It also has to be honest:
it borrows at least three practices from the production repositories that were
analyzed, and it names them.

In this document, `tutor` means `node harness/bin/tutor.mjs`, run from the
repository root.

## When to use

Use this skill when the `capstone` stage of a topic is ready to run, which means
the lesson and mini-projects stages are `done` or `skipped`. Two kinds of
sessions read it:

- The **stage runner** (the `learn` orchestrator, or a single session doing
  everything) starts the stage, registers the one unit, and runs the gate.
- A **worker** is a `tutor-project-builder` subagent that was given the unit
  `capstone`. It does the numbered steps below.

If no subagents are available, one session does both.

### Capacity-aware input allowance

The input allowance is `min(60000, floor(0.4 * actual_window) - reserve)`, including
instructions, role/skill text and assigned excerpts. Ask `tutor budget --window
<actual_window> --reserve <overhead> <files>` before reading. Unknown window defaults
to 32768 and reserve3000. Any 60,000-token figure below is a ceiling only; the CLI's
smaller allowance wins. Split oversized units and persist handoffs before dispatch.
Learner experience comes from plan.learner; this learner is an existing software
developer learning a new subject. Keep clear prerequisite bridges, avoid redundant
basic programming lessons, and teach practical mechanisms and failure modes.

## Inputs

Run this first and take every path from its output (the project folder is
`capstone_dir`, the vault note is `capstone`, the handoff folder is
`handoffs_dir`):

```bash
node harness/bin/tutor.mjs paths <topic> --json
```

Then read only these files:

1. The plan, printed by `node harness/bin/tutor.mjs plan <topic> --json`:
   `capstone` (name and problem), `outcomes`, and `mini_projects`.
2. `harness/domains/<domain>/pack.json`: `stages.capstone.kind`, `default_stack`,
   and `safety`.
3. `harness/domains/<domain>/playbook.md`, only the sections under
   `## Capstone shape` and `## Safety and ethics`.
4. `05-repo-intel/00-repo-intel-<slug>.md`, and for each analyzed repository
   `<repo>-takeaways.md` and `<repo>-findings.md`. These are the source of what
   the capstone borrows. Read `<repo>-architecture.md` too when the budget
   allows.
5. `03-mini-projects-<slug>.md`, so that the capstone builds on what the learner
   already made instead of repeating it.
6. `01-brief-<slug>.md`.
7. The note `06-capstone-<slug>.md`, which `tutor init` created from a template.
8. The names of the shared notes, for links: `ls vault/_concepts vault/_tech`.
9. This skill's references: `references/layers-and-oop.md` before designing,
   `references/architecture-example.md` before writing `ARCHITECTURE.md`, and
   `references/adr-and-vault-note.md` before writing the decision record and the
   vault note. When the capstone is not a program, also
   `references/non-code-capstones.md`.
10. The handoff file `<state path>/handoffs/capstone-capstone.md`, when it
    exists. Read it first and continue from its `## Next step`.

Check the size before reading, and stay under 60,000 tokens:

```bash
node harness/bin/tutor.mjs budget <file1> <file2> ...
```

If the `repo-intel` stage was skipped, item 4 is replaced by the digests index
`04-digests/00-digests-<slug>.md` and the one or two digests most relevant to
the problem. The three borrowed practices then come from those sources, and
`ARCHITECTURE.md` says in one sentence that no repository was analyzed.

## Steps

The stage runner first runs these two commands, unless they were already run:

```bash
node harness/bin/tutor.mjs start <topic> capstone
node harness/bin/tutor.mjs unit <topic> capstone add capstone
```

The worker then does the following. The work has two phases with a planned
stopping point between them.

### Phase 1 — design, domain, application

1. Mark the unit as started:

   ```bash
   node harness/bin/tutor.mjs unit <topic> capstone start capstone
   ```

2. Read `stages.capstone.kind` in `pack.json` and the playbook's
   `## Capstone shape`. If the kind is a code project (`service`, `web-app`,
   `mobile-app`, `game`, `pipeline`, `model`), continue with these steps. If it
   is not (`case-study`, `analysis-report`, `lab-and-hardening-report`, or
   anything the playbook redefines), read "Capstones that are not a service"
   below before continuing.

3. Create the project folder and start `ARCHITECTURE.md` with the section
   `## Borrowed from production`. While reading the takeaways and findings,
   write each practice you will apply into that table at once: what it is, which
   note it comes from, and where it will live in this project. Choose at least
   three. Writing them first means the design is built around them instead of
   having them attached at the end.

4. Design the project in `ARCHITECTURE.md` before writing code: the layers, the
   classes with one responsibility each, the interfaces between layers, and the
   main request or data flow. Follow `references/layers-and-oop.md` and the
   filled example in `references/architecture-example.md`. Keep the design
   small: 8 to 15 classes is enough for a beginner to hold in their head.

5. Create the folder layout from "Output contract", the dependency manifest with
   exact pinned versions, `.gitignore`, and `.env.example`.

6. Write the domain layer and its unit tests, then the application layer (one
   class per use case) and its unit tests. Use in-memory fakes for the ports in
   these tests. Run the tests after each layer; they must pass before you
   continue.

7. Decide whether to hand off. If more than about ten source files remain to be
   written, or this session has already been long, stop here: follow the handoff
   procedure in "Context budget". This boundary is a good one, because the next
   worker only needs `ARCHITECTURE.md` and the port interfaces to continue.

### Phase 2 — infrastructure, interface, operations, documents

8. Write the infrastructure layer: one adapter class per port (database, queue,
   HTTP client), the configuration class that reads environment variables and
   fails at startup when one is missing, and the structured logger.

9. Write the interface layer (HTTP routes, CLI commands, or consumers) and the
   composition root (`main`), the single place where objects are created and
   wired together.

10. Add error handling: domain errors are their own classes, the interface layer
    translates them into responses, and unexpected errors are logged with
    context and never swallowed.

11. Write at least one integration test that runs a whole use case through the
    real adapters (with Docker or an embedded substitute). Then run every test:

    ```bash
    npm --prefix <projects path>/capstone install
    npm --prefix <projects path>/capstone test
    ```

    Use the equivalent commands of the chosen stack. All tests must pass. A
    capstone whose tests were not run is not finished.

12. Add the run recipe: a `Dockerfile` (and `docker-compose.yml` when a service
    such as a database is needed), or the equivalent for the kind of project.
    Start the project once and confirm that it answers.

13. Write `docs/adr/0001-<decision>.md` for the most important design decision,
    following `references/adr-and-vault-note.md`. Add a second record when
    another decision had a real alternative.

14. Finish `ARCHITECTURE.md` so that it matches the code that now exists (class
    names, file paths, the flow). Then write `README.md`.

15. Fill the vault note `06-capstone-<slug>.md` above its `## My insights`
    heading, following `references/adr-and-vault-note.md`. For a link to a
    shared note that does not exist yet, create it with
    `node harness/bin/tutor.mjs concept "<Name>"` (add `--tech` for a
    technology), replace the placeholder line under its title with 1–3 plain
    sentences, and leave `## Where it shows up` empty; `tutor map` fills it.

16. Run the self-check at the end of `references/layers-and-oop.md`, then
    check your own files with the validator, and only those:

    ```bash
    node harness/bin/tutor.mjs validate <topic> capstone --files <projects path>/capstone,<path of 06-capstone-<slug>.md>
    node harness/bin/tutor.mjs unit <topic> capstone done capstone
    ```

    Fix what the first command reports before the second. Then return the
    summary described under "Context budget".

### Capstones that are not a service

The playbook's `## Capstone shape` defines the deliverable for the domain, and
it wins over the layer names in this skill. The gate still checks for the same
file names (`README.md`, `ARCHITECTURE.md`, `docs/adr/`, `src/`, `tests/`), so
the deliverable is mapped onto them. The mapping and the rules for these kinds
are in `references/non-code-capstones.md`. Read it before step 3.

## Output contract

Everything is under `<projects path>/capstone/`:

```
capstone/
├── README.md
├── ARCHITECTURE.md
├── docs/adr/0001-<decision>.md
├── src/
│   ├── domain/            entities, value objects, domain errors, ports (interfaces)
│   ├── application/       use cases: one class each, depends only on domain
│   ├── infrastructure/    adapters for the ports, configuration, logger
│   ├── interface/         HTTP / CLI / consumers: turns input into use-case calls
│   └── main.<ext>         composition root: creates and wires the objects
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── Dockerfile             or the run recipe the playbook names
└── <dependency manifest with exact versions>
```

The four layer names are the default. Use the folder names from the playbook's
`## Capstone shape` when it gives others (for example `http/` and `config/` in
a backend service, or `components / hooks / services` in a web app), and keep
the rule that dependencies point inward.

Required headings:

| File | Headings, in this order |
|------|-------------------------|
| `README.md` | `# <Name>`, `## The problem`, `## What it does`, `## How to run`, `## How to test`, `## Configuration`, `## Project layout`, `## Where to read next` |
| `ARCHITECTURE.md` | `# Architecture`, `## Overview`, `## Layers` (mermaid diagram), `## Classes and their responsibilities` (table), `## Request flow` (mermaid sequence diagram), `## Object-oriented ideas and where they are used`, `## Borrowed from production`, `## Error handling, configuration, logging`, `## How to extend it` |
| `docs/adr/NNNN-*.md` | `# NNNN. <Decision>`, `## Status`, `## Context`, `## Decision`, `## Alternatives considered`, `## Consequences` |
| `06-capstone-<slug>.md` | frontmatter with `stage: capstone`, `## What it is`, `## Architecture at a glance` (mermaid), `## Layers and key classes`, `## Ideas applied`, `## Borrowed from production`, `## How to run it`, `## How to extend it`, `## My insights` (last, nothing below it) |

Rules:

- In the vault note, keep the template's frontmatter and title line, and delete
  the scaffold lines `<!-- tutor:placeholder -->` and "Not written yet".
- `## Borrowed from production` lists at least three practices. Each row names
  the practice, the repo-intel note it comes from, and the file in this project
  where it is applied. In the vault note the source is a wikilink; in
  `ARCHITECTURE.md` it is the note's file name.
- Configuration comes from environment variables only. No secret is written in
  any file.
- Logs are structured (JSON or key=value) and carry a request or job id.
- Comments explain why, in one line. They do not restate the code.
- Dependencies are few and pinned to exact versions. No dependency-injection
  framework: constructors receive what they need.
- Follow the `safety` list in `pack.json` and `## Safety and ethics` in the
  playbook. In the `security` domain everything runs against a local lab that
  the project starts itself.

## Gate

The stage runner runs this full gate after the worker has returned. The worker checks its
own files with the `--files` form of step 16.

```bash
node harness/bin/tutor.mjs validate <topic> capstone
```

The validator prints each failure as `path: problem. fix.` Fix exactly the reported
lines and run it again. When it passes:

```bash
node harness/bin/tutor.mjs done <topic> capstone
```

Make at most three attempts. If the third validation still fails, stop and record
the remaining failures:

```bash
node harness/bin/tutor.mjs fail <topic> capstone --reason "<the failures that remain>"
```

The validator checks that the files exist. It does not run the tests, so step 11
is part of the gate even though the CLI cannot see it.

## Context budget

- The stage is one unit with the id `capstone`, built by one
  `tutor-project-builder` worker. It is not split into parallel units, because
  the layers depend on each other.
- A large capstone is cut in time instead: Phase 1 (design, domain, application,
  unit tests) and Phase 2 (infrastructure, interface, integration test, run
  recipe, documents, vault note), with a handoff between them. One or two
  `CONTINUE` returns are normal for this stage.
- A worker reads at most 60,000 tokens. Size the list with `tutor budget`. Read
  takeaways and findings, not the module notes, and never the cloned repository
  in `.cache/`.
- Write as you go: borrowed practices into `ARCHITECTURE.md` while reading, each
  class file as soon as it is designed, each test with its class.
- To hand off, write `<state path>/handoffs/capstone-capstone.md` with these
  headings: `## Done` (files written, test results), `## Remaining` (the steps
  of this skill not yet done, by number), `## Next step` (the first action for
  the next worker), and `## Interfaces` (each port with its method signatures,
  so the next worker does not need to read all the code). Then run:

  ```bash
  node harness/bin/tutor.mjs unit <topic> capstone fail capstone --handoff <state path>/handoffs/capstone-capstone.md
  ```

  and return the single line `CONTINUE: <handoff path>`. The word `fail` here
  only means "not finished yet"; the fresh worker continues from the file.
- A finished worker returns at most 150 words. If the brief you were given
  defines a return format, use that one. Otherwise use this:

  ```
  STAGE: capstone  UNIT: capstone  STATUS: done
  FILES: <projects path>/capstone/ (<n> source files, <n> test files), <path to 06-capstone note>
  FINDINGS:
  - What it solves, and the layers and number of classes.
  - The three practices borrowed, each with its source note.
  - Tests: <n> unit and <n> integration passed; run recipe verified or not.
  PROBLEMS: <"none", or one line each>
  ```

## Common mistakes

- Writing code first and `ARCHITECTURE.md` afterwards. The document then
  describes an accident instead of a design.
- A `utils` folder, a `Manager` class, or a class that does three jobs.
- The domain layer importing a database client or a web framework.
- Inheritance used to share code. Use composition.
- Naming SOLID principles without pointing to the file where each is visible.
- "Borrowed from production" with vague entries such as "best practices from
  BullMQ". Each entry names one practice, one note, and one file.
- Reporting tests as passing without running them, or no integration test.
- Hard-coded configuration, a committed `.env`, or `console.log` in place of
  the logger.
- Forcing classes onto a language or a deliverable where they do not fit, and
  not saying so.
- Writing below `## My insights` in the vault note, or linking to a `_concepts`
  or `_tech` note that does not exist.
