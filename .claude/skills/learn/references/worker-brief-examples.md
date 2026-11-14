# Filled worker briefs

One example per agent. Copy the one you need and replace the values. The structure is the
template from `SKILL.md`; the four closing blocks (BUDGET, IF THE UNIT IS TOO BIG, WHEN FINISHED,
RETURN FORMAT) are identical in every brief, so they are written out once in the first example
and shown as `<same four blocks>` in the others. Always send them in full.

Every brief for a worker that writes files also has a `SELF-CHECK` line. It is always
`tutor validate <topic> <stage> --files <that worker's own output files>`: the worker sees only
failures in its own files. The full `tutor validate <topic> <stage>` is run only by you, the
stage runner. Shared notes created with `tutor concept` are listed under OUTPUT FILES wherever
the skill tells the worker to create them; they are wanted files, never strays.

The examples use the topic `backend-engineering/messaging/redis-streams` (slug
`redis-streams`).

Contents: tutor-researcher · tutor-digester · tutor-repo-analyst (scout, module, synthesis) ·
tutor-lesson-builder · tutor-project-builder (mini project, capstone) · tutor-verifier ·
continuation brief.

---

## tutor-researcher

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: research
UNIT: papers
READ FIRST: .claude/skills/learn-research/SKILL.md — follow the part written for one unit.

INPUT FILES (read these and nothing else):
- harness/rubrics/source-quality.md
- harness/domains/backend-engineering/playbook.md (only the heading "## Trusted sources")
- the plan, printed by: node harness/bin/tutor.mjs plan backend-engineering/messaging/redis-streams --json

OUTPUT FILES (write only these):
- .cache/tmp/redis-streams/sources/<source-id>.json (one file per source, then add each with the CLI)

TASK: Add 2–4 verified sources in the category papers and books. Flag exactly 1 of them with `digest`.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: `node harness/bin/tutor.mjs sources backend-engineering/messaging/redis-streams add --file <entry>`
rejects a bad entry and names the field; fix it and add again. Do not run `tutor validate`:
the stage totals are checked by the stage runner, not by you.

BUDGET: Use the capacity-aware input allowance, including instructions and reserve. Before reading files, size them with
`node harness/bin/tutor.mjs budget <files>`. After each file or section you read, write what you
learned into the output file. Never keep findings only in memory.

IF THE UNIT IS TOO BIG: write state/topics/backend-engineering/messaging/redis-streams/handoffs/research-papers.md
with the headings Done / Remaining / Next step, run
`node harness/bin/tutor.mjs unit backend-engineering/messaging/redis-streams research fail papers --handoff state/topics/backend-engineering/messaging/redis-streams/handoffs/research-papers.md`,
and reply with only this line: CONTINUE: state/topics/backend-engineering/messaging/redis-streams/handoffs/research-papers.md

WHEN FINISHED: run `node harness/bin/tutor.mjs unit backend-engineering/messaging/redis-streams research done papers`.

RETURN FORMAT (150 words at most, no other text):
STAGE: research  UNIT: papers  STATUS: done | failed
FILES: <paths written>
FINDINGS:
- <finding 1>
- <finding 2>
- <finding 3>
PROBLEMS: <"none", or what is missing and why>
```

## tutor-digester

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: digest
UNIT: redis-streams-docs
READ FIRST: .claude/skills/learn-digest/SKILL.md — follow the part written for one unit.

INPUT FILES (read these and nothing else):
- https://redis.io/docs/latest/develop/data-types/streams/ (the source; read it by section)
- vault/backend-engineering/messaging/redis-streams/01-brief-redis-streams.md
- the source entry, printed by: node harness/bin/tutor.mjs sources backend-engineering/messaging/redis-streams list --json

OUTPUT FILES (write only these):
- vault/backend-engineering/messaging/redis-streams/04-digests/redis-streams-docs-redis-streams.md
- vault/_concepts/<Concept>.md (at most 4 new shared concept notes, created only with `node harness/bin/tutor.mjs concept "<Concept>"`)

TASK: Write the digest of the source `redis-streams-docs` with the exact template of the skill. The topic's depth is `standard`, so the target is 800–1,200 words. Cite no page that is not in sources.json; name such a page under PROBLEMS instead.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: run `node harness/bin/tutor.mjs validate backend-engineering/messaging/redis-streams digest --files vault/backend-engineering/messaging/redis-streams/04-digests/redis-streams-docs-redis-streams.md`
and fix what it reports. The index note and other digests are not your files.

<same four blocks, with stage `digest` and unit `redis-streams-docs`>
```

## tutor-repo-analyst — scout

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: repo-intel
UNIT: redis-redis-scout
READ FIRST: .claude/skills/learn-repo-intel/SKILL.md — follow Part A (scout).

INPUT FILES (read these and nothing else):
- https://github.com/redis/redis (clone it as the skill says; do not browse it on the web)
- harness/domains/backend-engineering/playbook.md (only the heading "## Repository analysis focus")
- the plan, printed by: node harness/bin/tutor.mjs plan backend-engineering/messaging/redis-streams --json

OUTPUT FILES (write only these):
- vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis/redis-overview.md
- state/topics/backend-engineering/messaging/redis-streams/handoffs/repo-intel-redis-redis-slices.md
- .cache/tmp/redis-streams/redis-redis-module-<name>.files.txt (one per chosen slice)

TASK: Scout: clone, record the commit, slice, choose the 4–8 slices that implement Redis Streams, write the overview and the slice plan. Return the module unit ids and the skipped slices.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: run `node harness/bin/tutor.mjs validate backend-engineering/messaging/redis-streams repo-intel --files vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis/redis-overview.md`
and fix what it reports. Notes that do not exist yet are not your job.

<same four blocks, with stage `repo-intel` and unit `redis-redis-scout`>
```

## tutor-repo-analyst — module

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: repo-intel
UNIT: redis-redis-module-stream-core
READ FIRST: .claude/skills/learn-repo-intel/SKILL.md — follow Part B (module).

INPUT FILES (read these and nothing else):
- state/topics/backend-engineering/messaging/redis-streams/handoffs/repo-intel-redis-redis-slices.md
- .cache/tmp/redis-streams/redis-redis-module-stream-core.files.txt (the files of this slice, inside .cache/repos/redis__redis/)

OUTPUT FILES (write only these):
- vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis/redis-module-stream-core.md

TASK: Module: analyze this one slice and write its module note with evidence citations.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: run `node harness/bin/tutor.mjs validate backend-engineering/messaging/redis-streams repo-intel --files vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis/redis-module-stream-core.md`
and fix what it reports. Other module notes and the synthesis notes are not your files.

<same four blocks, with stage `repo-intel` and unit `redis-redis-module-stream-core`>
```

## tutor-repo-analyst — synthesis

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: repo-intel
UNIT: redis-redis-synthesis
READ FIRST: .claude/skills/learn-repo-intel/SKILL.md — follow Part C (synthesis).

INPUT FILES (read these and nothing else):
- vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis/redis-overview.md
- state/topics/backend-engineering/messaging/redis-streams/handoffs/repo-intel-redis-redis-slices.md
- vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis/redis-module-*.md (all of them)

OUTPUT FILES (write only these):
- .../05-repo-intel/redis-redis/redis-architecture.md
- .../05-repo-intel/redis-redis/redis-tech-and-services.md
- .../05-repo-intel/redis-redis/redis-findings.md
- .../05-repo-intel/redis-redis/redis-takeaways.md
- .../05-repo-intel/redis-redis/redis-pattern-<name>.md (2–5 notes)
- vault/_tech/<Name>.md and vault/_concepts/<Name>.md (shared notes, created only with `node harness/bin/tutor.mjs concept "<Name>" --tech` and `concept "<Name>"`)

TASK: Synthesis: write the repository-level notes from the module notes only. Do not open the cloned code except to confirm one citation.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: run `node harness/bin/tutor.mjs validate backend-engineering/messaging/redis-streams repo-intel --files vault/backend-engineering/messaging/redis-streams/05-repo-intel/redis-redis`
(the repository folder) and fix the lines that name a note you wrote. A line that names the
overview or a module note is not yours: copy it under PROBLEMS.

<same four blocks, with stage `repo-intel` and unit `redis-redis-synthesis`>
```

Write the `...` paths in full in a real brief.

## tutor-lesson-builder

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: lesson
UNIT: pages-01-03
READ FIRST: .claude/skills/learn-site/SKILL.md — follow the part written for one unit.

INPUT FILES (read these and nothing else):
- the files listed in the Inputs section of that skill (of site/COMPONENTS.md only the sections it names)
- outline entries with order 1 to 3, printed by: node harness/bin/tutor.mjs plan backend-engineering/messaging/redis-streams --json

OUTPUT FILES (write only these):
- site/src/content/lessons/backend-engineering/messaging/redis-streams/01-what-is-a-stream.mdx
- site/src/content/lessons/backend-engineering/messaging/redis-streams/02-appending-entries.mdx
- site/src/content/lessons/backend-engineering/messaging/redis-streams/03-consumer-groups.mdx

TASK: Write lesson pages 1 to 3 exactly as planned in the outline (title, visual, activity). The final page of this topic is page 6, so none of your pages gets `<Resources />`.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: run `node harness/bin/tutor.mjs validate backend-engineering/messaging/redis-streams lesson --files site/src/content/lessons/backend-engineering/messaging/redis-streams/01-what-is-a-stream.mdx,site/src/content/lessons/backend-engineering/messaging/redis-streams/02-appending-entries.mdx,site/src/content/lessons/backend-engineering/messaging/redis-streams/03-consumer-groups.mdx`
and fix what it reports. Pages of other units, the page count, and the pointer note are not your job.

<same four blocks, with stage `lesson` and unit `pages-01-03`>
```

A lesson worker writes no vault note, so it creates no concept notes. In the `TASK` line,
always say which page is the final page of the topic (the highest `order` in the plan) and
whether it belongs to this unit; only that page ends with `<Resources />`. For a repair
after a failed build or smoke check, the output files are only the pages named in `FIX LIST`.

## tutor-project-builder — mini project

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: mini-projects
UNIT: mini-01
READ FIRST: .claude/skills/learn-projects/SKILL.md — follow the part written for one unit.

INPUT FILES (read these and nothing else):
- the files listed in the Inputs section of that skill
- mini project number 1, printed by: node harness/bin/tutor.mjs plan backend-engineering/messaging/redis-streams --json

OUTPUT FILES (write only these):
- projects/backend-engineering/messaging/redis-streams/mini-01-job-queue/ (README.md, starter/, solution/)

TASK: Build mini project 1 (job-queue) with its real use case from the plan.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: run `node harness/bin/tutor.mjs validate backend-engineering/messaging/redis-streams mini-projects --files projects/backend-engineering/messaging/redis-streams/mini-01-job-queue`
and fix what it reports. Other projects and the index note are not your files.

<same four blocks, with stage `mini-projects` and unit `mini-01`>
```

## tutor-project-builder — capstone

Same as the mini project brief with these changes: `STAGE: capstone`, `UNIT: capstone`,
`READ FIRST: .claude/skills/learn-capstone/SKILL.md`, output files
`projects/<domain>/<subdomain>/<slug>/capstone/`, `<vault>/06-capstone-<slug>.md`, and
"vault/_concepts/<Name>.md and vault/_tech/<Name>.md (shared notes the vault note links to,
created only with `node harness/bin/tutor.mjs concept`)",
`TASK: Build the capstone "<plan.capstone.name>" that solves: <plan.capstone.problem>.`, and
`SELF-CHECK: run node harness/bin/tutor.mjs validate <topic> capstone --files projects/<domain>/<subdomain>/<slug>/capstone,<vault>/06-capstone-<slug>.md and fix what it reports.`

## tutor-verifier

The verifier has its own return format, so its brief ends differently. Its input list is
short and explicit. Fill it from `node harness/bin/tutor.mjs paths <topic> --json` and leave
out what the topic does not have. Never write "every path": the verifier then spends its
budget on harness files and reports the projects as not checked.

```text
You are the independent reviewer of one finished topic. You change nothing.

TOPIC: backend-engineering/messaging/redis-streams
STAGE: finalize
UNIT: verify
READ FIRST: harness/rubrics/source-quality.md, harness/rubrics/lesson-page.md, harness/rubrics/vault-notes.md
(in source-quality.md skip the section "One valid entry per type"; it holds only examples)

INPUT FILES (read these and nothing else):
- state/topics/backend-engineering/messaging/redis-streams/sources.json
- site/src/content/lessons/backend-engineering/messaging/redis-streams/*.mdx (the lesson pages)
- vault/backend-engineering/messaging/redis-streams/01-brief-redis-streams.md, 02-lesson-…, 03-mini-projects-…, 06-capstone-…, 07-final-notes-…, 08-recall-… (the numbered stage notes that exist)
- vault/backend-engineering/messaging/redis-streams/04-digests/*.md (the digest notes and their index)
- vault/backend-engineering/messaging/redis-streams/05-repo-intel/00-repo-intel-redis-streams.md, and redis-redis/redis-findings.md and redis-takeaways.md
- projects/backend-engineering/messaging/redis-streams/mini-01-job-queue/README.md (one line per project)

OUTPUT FILES: none. Do not create, edit, or delete any file.

TASK: Review source quality, claims without evidence (including any citation of a page that is not in sources.json), the lesson page rules, and broken links. For each project, run its solution tests as its README says and report the real result. Follow the review order in your instructions.

BUDGET: Use the capacity-aware input allowance, including instructions and reserve. Size the list with `node harness/bin/tutor.mjs budget <files>`
first. If it is over, read the sources, the lesson pages, and the brief in full and sample the rest.

RETURN FORMAT (300 words at most, no other text):
VERDICT: pass | fix-needed
FINDINGS (most important first, at most 15, one per line):
<path>: <problem>. <fix>.
NOT CHECKED: <what you could not review within the budget, or "nothing">
```

**Depth `standard` or `deep`: two verifiers in one batch.** Split the brief above:

- Verifier 1 (`UNIT: verify`): the same brief without the `projects/…` lines, without
  `03-mini-projects` and `06-capstone`, and without the sentence about running tests.
- Verifier 2 (`UNIT: verify-projects`): `READ FIRST` is only `harness/rubrics/vault-notes.md`.
  Input files: `03-mini-projects-<slug>.md`, `06-capstone-<slug>.md`, and for each project
  its `README.md` (for the capstone also `ARCHITECTURE.md`). `TASK`: "Review the projects
  only. For each project, run the solution's tests as its README says and report how many
  ran and passed; check that the starter starts and fails only on its TODOs; check that the
  README's commands and file names match the folder. Do not review sources or lesson pages."

At depth `quick`, one verifier with the full brief is the whole review.

## Continuation brief (after `CONTINUE: <path>`)

Send the same brief again with two changes:

```text
INPUT FILES (read these and nothing else):
- <the handoff path>            ← add this line first
- <the original input files>

HANDOFF IN: <the handoff path>
```

Add this sentence to `TASK`: "Start from the 'Next step' in the handoff file. Do not redo what
is listed under 'Done'."
