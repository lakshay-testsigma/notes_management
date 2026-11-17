# Current worker contract

For new plans, first apply `docs/RESEARCH-WORKFLOW.md`. Examples below show base
artifact paths; add learner profile, assigned concept ids/source entries and planned
coverage from the projected plan. Research includes bounded recursive frontier units.
For reviewers obtain tutor review <topic> --json,
launch a fresh isolated context without author history, and require the exact JSON
return specified by `.claude/agents/tutor-verifier.md` (including all required
assessments, actual worker id and input fingerprint). Use this JSON contract in every verifier brief. Never import a textual summary as proof
that checks were performed. Input lists include supplementary curriculum notes.

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

Visual-first plans add to the lesson brief's INPUT FILES:
`.claude/skills/learn-visuals/SKILL.md`, the "Every visual must" section of
`harness/rubrics/visuals.md`, the entries of `<handoffs_dir>/visual-candidates.md`
for these pages, and `node harness/bin/tutor.mjs visuals <topic> list --json`; to
OUTPUT FILES: the assets `<visual_assets_dir>/<id>-<slug>.svg|.mmd` it draws (registered
with `tutor visuals add`); and to the RETURN FORMAT a `VISUALS:` line.

## tutor-video-producer

```text
You are one worker in the tutor pipeline. Do exactly one unit of work, then return.

TOPIC: system-design/consistency-consensus/raft
STAGE: lesson
UNIT: video-raft-write-commit
READ FIRST: .claude/agents/tutor-video-producer.md, then .claude/skills/learn-video/SKILL.md.

INPUT FILES (read these and nothing else):
- outline entry 2 (video.reason) from: node harness/bin/tutor.mjs plan system-design/consistency-consensus/raft --json
- assigned sources: raft-paper (sections 5.3 Log replication, 5.4 Safety)
- vault/system-design/consistency-consensus/raft/04-digests/raft-paper-raft.md (sections "How it works", "Results")
- state/topics/system-design/consistency-consensus/raft/handoffs/visual-candidates.md (entries for the write path)
- harness/examples/videos/raft-write-commit.json (format only; write your own content)

OUTPUT FILES (write only these):
- projects/system-design/consistency-consensus/raft/videos/raft-write-commit/video.json
- projects/system-design/consistency-consensus/raft/videos/raft-write-commit/scenes/ (only if a custom scene is needed)

TASK: Make the 30–90 s explainer of how one write commits (planned for page 02-the-write-path.mdx, used_in that page). Build and render it with tutor video; the lesson builder of pages-01-03 embeds <Video id="raft-write-commit" />.
FIX LIST: none
HANDOFF IN: none

SELF-CHECK: node harness/bin/tutor.mjs video system-design/consistency-consensus/raft check raft-write-commit

<same budget, handoff and finish blocks, with stage `lesson` and unit `video-raft-write-commit`>

RETURN FORMAT: the block under "Worker unit" in learn-video (STATUS done | blocked | failed).
```

An experience unit (`experience-<id>`, adaptive plans) differs only in these lines:

```text
UNIT: experience-raft-consensus-lab
INPUT FILES (add to the list above):
- outline entry 4 (experience.signals, experience.id) and the output of:
  node harness/bin/tutor.mjs experience system-design/consistency-consensus/raft plan --json
- the fallback diagram id registered by the page worker (or draw it: learn-visuals)
- harness/examples/experiences/distributed-consensus/ (format only; write your own content)
OUTPUT FILES (write only these):
- projects/system-design/consistency-consensus/raft/videos/<intro|guided|summary id>/video.json
- projects/system-design/consistency-consensus/raft/videos/<deck id>/deck.json (only if the mode or the plan needs branches)
- projects/system-design/consistency-consensus/raft/experiences/raft-consensus-lab/experience.json
TASK: Build the hybrid lab selected for page 04-break-the-cluster.mdx: intro video, ClusterSim presets synced to the guided walkthrough, 3–8 checkpoints (one predict, one experiment), a deck of deep dives, a final summary video. Run `tutor experience <topic> build raft-consensus-lab`; render the intro and summary when `video tools` reports a renderer. The page worker embeds <Experience id="raft-consensus-lab" />.
SELF-CHECK: node harness/bin/tutor.mjs experience system-design/consistency-consensus/raft check raft-consensus-lab
```

A page unit writes only its assigned MDX. A separate concept-<id> unit follows
learn-site Part B2 and writes its assigned supplementary vault note through write-note. In the `TASK` line,
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

Use the host's fresh-worker API with an empty context, explicitly loading the role
file. Budget the complete brief. Fill exact artifact paths from tutor paths, include
project verification recipes, and omit artifacts absent from this topic.

```text
You are the independent reviewer of one finished topic. You change no authored files.
TOPIC: <actual full topic id>
STAGE: finalize
UNIT: verify-content or verify-projects (quick may cover both)
READ FIRST: .claude/agents/tutor-verifier.md, docs/RESEARCH-WORKFLOW.md,
  harness/rubrics/source-quality.md, lesson-page.md, vault-notes.md, and for
  visual-first plans visuals.md and writing-standard.md
LEARNER REQUEST: <the actual original request and explicit requirements>
LEARNER: <experience, known prerequisites and goals>
REVIEW PACKET: <output of tutor review <topic> --json: fingerprint and required checks>
PLAN: <scoped tutor plan output: outcomes, outline, curriculum and source assignments>
PREVIEW URL: <live test URL provided by orchestrator for the current build>
BROWSER: <actual host browser tool, or installed headless Playwright procedure>
INPUT FILES:
- <assigned sources.json entries plus URLs/sections>
- <exact assigned MDX pages and supplementary curriculum notes>
- <numbered notes, digest/repo notes within this inspection scope>
- <project READMEs, verification.json and architecture for project scope>
- <visual-first: tutor visuals <topic> list --json, the notes under <vault>/visuals/,
  and the video projects' storyboard.md and transcript.md>
OUTPUT FILES: none (return JSON to orchestrator).
TASK: Inspect every assigned requirement and record actual evidence. Content scope
  checks all six concept aspects, source support and runtime visual controls/reset;
  projects scope executes declared checks against established services. Never treat
  source inspection as proof of working browser interaction. Record unperformed
  requirements in not_checked; required gaps prevent pass.
BUDGET: <actual allowance from tutor budget for filled brief plus inputs>
RETURN: Exact JSON per assigned scope matching tutor-verifier.md, with scope,
  reviewer, verdict, checks, findings, not_checked, independent:true,
  reviewer_run_id (actual host worker id), input_fingerprint and evidence-based
  assessments for EVERY required check. No prose or VERDICT/FINDINGS shorthand.
```

Standard/deep use different fresh workers for content and projects. Quick may return
two JSON objects in one worker response. For a large curriculum, split read-only
inspection units, persist their evidence outside state through the orchestrator,
and let a fresh final reviewer consolidate the inspected evidence. Anything unread
remains not_checked, even if a structural validator passes.

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
