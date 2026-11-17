# Architecture — Personal AI Tutor + Note-Taker Harness

This file is the contract every part of the harness follows. Skills, the CLI, the
Astro site, and the domain packs all agree on the names, paths, and rules below.
If something here and a skill disagree, this file wins — fix the skill.

## 1. What this repository is

A local harness that turns "teach me `<topic>`" into a complete, well-structured
learning package, and keeps it as long-term notes:

1. a short brief (what it is, why it matters)
2. an interactive Astro lesson site (animated flows, 3D graphs, playful activities)
3. mini projects with real use cases
4. digests of the canonical papers / docs
5. an Obsidian deep dive into a production open-source repository
6. a production-style capstone project with clear, class-based architecture
7. small final notes for refreshing a year later
8. recall cards with spaced review

Plus two on-demand abilities: adding the learner's own insights to any topic, and
running a recall session.

Across all of them runs one shared visual and communication capability
(§14): sourced diagrams, interactive simulations, short HyperFrames explainer
videos, and one writing standard (about 80% of ASD-STE100), registered once and
shown in both the lesson site and the Obsidian vault.

The learner is an existing software developer who may be new to the subject. Record
known prerequisites and goals; bridge unfamiliar concepts without re-teaching basic
programming. Everything stays linear and numbered.

## 2. Design principles

- **Reading order ≠ generation order.** The learner reads 01 → 08. The harness
  generates research first so every later artifact is grounded in real sources.
- **Same skeleton, domain-specific content.** Every topic runs the same stages.
  The *domain pack* decides what a lesson, a mini project, and a capstone look like
  for that domain (frontend ≠ backend ≠ security).
- **State on disk, not in the model's head.** Every stage is tracked by the `tutor`
  CLI. Any session, any model, can resume by running `tutor next`.
- **Small context per worker.** No agent fills more than 40% of its context window.
  Work is cut into units; each unit is one subagent; at most 5 run at once.
- **Evidence over fluency.** Every recommended resource is verified as industry
  standard. Every open-source finding cites repo, file, and commit.
- **Explain simply → visualize → interact → animate → practice → retain.** New
  plans are visual-first (§14): each concept gets the visual, simulation or video
  that makes its mechanism visible, every drawn relationship is sourced, and every
  explanation is written in short, active, defined terms with depth in layers.
- **Visuals serve understanding.** New plans use adaptive visuals: basic concepts may
  need no diagram, intermediate/critical concepts get focused visuals, and advanced
  concepts get meaningful manipulation or simulation. No decorative 3D or callout boxes.
- **Mastery, not volume.** Each lesson page has a predict-or-quiz activity; each
  topic ends with recall cards scheduled for spaced review.
- **Depth is a dial.** `quick`, `standard`, `deep` — not every topic deserves the
  full pipeline.

## 3. Repository layout

Four content roots share one identical sub-path: `<domain>/<subdomain>/<topic-slug>`.
Knowing a topic's path in one root means knowing it in all of them.

```
notes_management/
├── README.md                    start here (how to use the tutor)
├── CLAUDE.md                    rules every Claude session in this repo follows
├── docs/                        how the harness works (this file, workflow guide)
├── inputs/                      the learner's topic files (roadmap HTML/JSON or topic lists); read-only to the harness, listed by `tutor roadmap inbox`
├── .claude/
│   ├── skills/                  one skill per workflow checkpoint (see §6)
│   └── agents/                  subagent definitions used by the skills (see §7)
├── harness/                     the engine
│   ├── bin/tutor.mjs            CLI: state, scaffolding, validation, slicing (see §5)
│   ├── lib/                     CLI internals
│   ├── domains/<domain>/        domain packs: pack.json + playbook.md (see §8)
│   ├── rubrics/                 source-quality.md, lesson-page.md, vault-notes.md, visuals.md, writing-standard.md
│   ├── examples/videos/         storyboard examples in three domains (video.json)
│   ├── templates/               file templates used by `tutor init`
│   └── tests/                   CLI tests
├── state/
│   ├── registry.json            index of all topics
│   └── topics/<domain>/<subdomain>/<slug>/
│       ├── topic.json           progress + plan (see §4)
│       ├── sources.json         vetted sources (see §9)
│       ├── visuals.json         visual registry (see §14), written only by `tutor visuals` / `video` / `deck` / `experience`
│       ├── progress.json        learner checkpoint results and concept mastery (§15), written only by `tutor experience progress`
│       └── handoffs/            subagent checkpoint files
├── vault/                       OBSIDIAN VAULT — open this folder in Obsidian
│   ├── Home.md                  map of all domains
│   ├── _concepts/               one note per shared concept (links topics together)
│   ├── _tech/                   one note per technology / external service
│   └── <domain>/
│       ├── <domain>.md          domain map (lists subdomains and topics)
│       └── <subdomain>/<slug>/  one topic (see §3.1)
├── site/public/media/<domain>/<subdomain>/<slug>/   rendered explainer MP4 + WebVTT captions
├── site/                        ASTRO SITE — the reading interface
│   ├── COMPONENTS.md            authoritative reference for lesson components
│   ├── components.manifest.json machine list of component names by kind
│   └── src/content/lessons/<domain>/<subdomain>/<slug>/NN-<page>.mdx
├── projects/<domain>/<subdomain>/<slug>/
│   ├── mini-01-<name>/          README.md, starter/, solution/
│   ├── mini-02-<name>/
│   ├── capstone/                README.md, ARCHITECTURE.md, docs/adr/, src/, tests/
│   └── videos/<id>/             HyperFrames project: video.json (authored), index.html, captions.vtt, transcript.md, storyboard.md (generated)
└── .cache/                      gitignored: cloned repos, fetched pages
    └── repos/<org>__<repo>/
```

### 3.1 One topic inside the vault

File names carry the topic slug so every note name is unique across the vault
(Obsidian resolves `[[links]]` by file name, and the graph shows file names).

```
vault/<domain>/<subdomain>/<slug>/
├── 00-start-here-<slug>.md      the topic map: every step, in order, with links
├── 01-brief-<slug>.md           what it is, why it exists, where it is used
├── 02-lesson-<slug>.md          index of the interactive lesson pages + site URL
├── 03-mini-projects-<slug>.md   index of mini projects + what each one proves
├── 04-digests/
│   ├── 00-digests-<slug>.md     index
│   └── <source-id>-<slug>.md    one digest per paper / doc
├── 05-repo-intel/
│   ├── 00-repo-intel-<slug>.md  index
│   └── <org>-<repo>/            one deep dive per repository (see §10)
├── 06-capstone-<slug>.md        architecture summary + link to the project
├── 07-final-notes-<slug>.md     the one-page refresher
├── 08-recall-<slug>.md          flashcards (Obsidian Spaced Repetition format)
├── 09-resources-<slug>.md       vetted resources, generated from sources.json
├── visuals/                     generated by `tutor map` from visuals.json (§14)
│   ├── visuals-<slug>.md        index of every diagram, simulation and video
│   ├── visual-<id>-<slug>.md    one note per visual: embed, explanation, alt, check question, sources, used in, transcript
│   ├── concept-map-<slug>.md    concept dependency graph from plan.curriculum
│   └── assets/<id>-<slug>.svg|.mmd   the diagram files, shared with the site
└── my-insights-<slug>.md        the learner's own additions (never overwritten)
```

## 4. State model

`state/topics/<domain>/<subdomain>/<slug>/topic.json`:

```json
{
  "schema": 1,
  "id": "backend-engineering/messaging/redis-streams",
  "title": "Redis Streams",
  "slug": "redis-streams",
  "domain": "backend-engineering",
  "subdomain": "messaging",
  "depth": "standard",
  "created_at": "2026-11-14T10:00:00Z",
  "updated_at": "2026-11-14T10:00:00Z",
  "paths": {
    "state": "state/topics/backend-engineering/messaging/redis-streams",
    "vault": "vault/backend-engineering/messaging/redis-streams",
    "lessons": "site/src/content/lessons/backend-engineering/messaging/redis-streams",
    "projects": "projects/backend-engineering/messaging/redis-streams",
    "cache": ".cache"
  },
  "plan": {
    "summary": "one sentence",
    "prerequisites": [{ "concept": "Redis basics", "known": false, "bridge": "one line" }],
    "outcomes": ["explain ...", "build ..."],
    "lesson_outline": [{ "order": 1, "slug": "what-is-a-stream", "title": "...", "visual": "FlowAnimation", "activity": "PredictReveal" }],
    "mini_projects": [{ "n": 1, "slug": "job-queue", "use_case": "..." }],
    "digest_targets": 3,
    "repo_targets": 1,
    "capstone": { "name": "...", "problem": "..." }
  },
  "stages": [
    {
      "id": "intake", "wave": 0, "skill": "learn-intake", "status": "pending",
      "started_at": null, "finished_at": null, "attempts": 0,
      "units": [], "note": ""
    }
  ],
  "recall": { "cards": {} },
  "log": []
}
```

`status` is one of `pending | in_progress | done | skipped | failed`.
`units` are the parallel work items inside a stage (one digest, one repo slice, one
lesson page batch): `{ "id": "...", "status": "...", "handoff": "path or null" }`.

### 4.1 Stages (generation order)

| Wave | Stage id        | Skill              | Produces                                              |
|------|-----------------|--------------------|-------------------------------------------------------|
| 0    | `intake`        | `learn-intake`     | `plan` in topic.json, `00-start-here`                 |
| 1    | `research`      | `learn-research`   | `sources.json`, `09-resources`                        |
| 1    | `brief`         | `learn-brief`      | `01-brief`                                            |
| 2    | `digest`        | `learn-digest`     | `04-digests/*`                                        |
| 2    | `repo-intel`    | `learn-repo-intel` | `05-repo-intel/*`, `_tech/*`, `_concepts/*`           |
| 3    | `lesson`        | `learn-site`       | lesson `.mdx` pages, `02-lesson`                      |
| 3    | `mini-projects` | `learn-projects`   | `projects/.../mini-*`, `03-mini-projects`             |
| 4    | `capstone`      | `learn-capstone`   | `projects/.../capstone`, `06-capstone`                |
| 5    | `notes`         | `learn-notes`      | `07-final-notes`, `08-recall`                         |
| 5    | `finalize`      | `learn` (orchestr.)| maps regenerated, all validators + site build green   |

Stages in the same wave run in parallel, with two ordering exceptions: `brief`
runs after `research` (it is grounded in the vetted sources) and `finalize` runs
after `notes`. Earlier waves must be verified or explicitly continued after failure. Research must precede brief, and notes must precede finalize even inside the same wave.
Stages a domain pack or depth switches off stay in the list as `skipped`.

### 4.2 Depth profiles

| Depth      | Lesson pages | Mini projects | Digests | Repos | Capstone | Use for                  |
|------------|--------------|---------------|---------|-------|----------|--------------------------|
| `quick`    | 3–4          | 1             | 1–2     | 0     | skipped  | small concept, 1 sitting |
| `standard` | 5–7          | 2             | 2–3     | 1     | yes      | default                  |
| `deep`     | 8–12         | 3             | 4–6     | 2–3   | yes      | core career topic        |

The domain pack may switch stages off (for example `repo-intel` in a non-code
domain) or rename what the capstone is (a campaign, a model, a threat model).

### 4.3 Verified completion and retained-artifact reruns

`complete` means every required stage has a current successful gate receipt. `generation_finished`
is scheduling state; a run with failed, waived or forced required work is `degraded`, never
complete. `fail --continue` permits useful downstream generation except after intake/research;
it preserves the failure. Only configured depth/domain omissions belong in `not_part_of_topic`.
`done` always runs its gate, including on an already-done stage. Content fingerprints bind
receipts to plan, sources, generated artifacts and validator code. Changed inputs appear stale.

`tutor rerun <topic>` archives units/receipts and reopens requirements while retaining all
notes, insights and recall state. `write-note <topic> <note> --file <draft>` replaces only
generated prose, preserving the existing insight suffix byte-for-byte. Rerun snapshots also
reject deleted/changed learner content at gates. Never write `my-insights-*` through this API.

An explicit learner request to delete a topic is a separate operation:
`tutor remove <topic> [<topic>...]` previews canonical package paths; `--delete`
removes selected state, notes (including insights and recall history), lessons,
projects and topic components not shared by another same-slug topic. It validates
all targets first, refuses symlinked roots, rebuilds the registry and refreshes maps.
Shared concept/tech notes, research caches and external review files are retained
for separate cleanup when explicitly requested. Normal generation never uses removal.

`tutor order <topic> import-indexes` records `reader_order.digest` and `reader_order.repo-intel`
as topic-relative child paths in the authored index sequence. Every child occurs exactly once.
Site navigation uses that same sequence. Legacy topic previews derive missing sequences from
the authored indexes without writing state; readiness gates still require persisted sequences. Duplicate basenames require vault-relative wikilinks;
ambiguous bare links fail validation. Existing note identities are retained.

`plan.requested_sources` optionally holds `{name,url,use_for}` entries explicitly named by the
learner. Research either includes their vetted URLs or records `resolution:"rejected"` with a
reason. A request is not silently discarded during delegation.

`tutor check <topic> research|mini-projects|capstone|finalize` executes checks outside the state
lock, then commits evidence only if inputs still match. Research records HTTP status/body
hashes for verification/evidence URLs. Projects declare argv-based commands in `verification.json`:
solution-tests, starter-tests and starter-start for minis; solution-tests for capstones, plus
appropriate build, integration, end-to-end, type and dependency checks. Starter TODO failures
are expected only when explicit exit/output expectations match. Every npm package with
dependencies needs an audit check. Finalize runs site build, smoke and manifest checks.

`tutor review <topic> --file <json>` records independent assessment, with scope content/projects,
reviewer, verdict pass/fix-needed, checks, findings, not_checked. Required checks are listed in
`harness/lib/quality.mjs`. All required checks must be assessed and no errors remain for pass.
These are reviewer attestations, not automatic semantic proofs. Changed inputs invalidate them.
`validate --files` and `validate --structure-only` are authoring diagnostics, not completion.

Recall exports use `{schema:1,topic,events:[{id,card_id,grade,at}]}`. `recall import <topic> --file`
validates the whole batch and applies new events once; repeated IDs are deduplicated, conflicting
reuse is rejected. Card IDs and history survive regeneration. The static site exports events;
there is no unauthenticated filesystem-writing web service.

### 4.4 Evidence-led concept discovery and adaptive plans

New plans authored by `learn-intake` include `learner`, `visual_policy: "adaptive"`,
and `curriculum`. Legacy plans remain valid and are upgraded only through the CLI.
The executable curriculum contract is in `harness/lib/curriculum.mjs`; the operating
procedure and a complete field example are in [RESEARCH-WORKFLOW.md](RESEARCH-WORKFLOW.md).

`curriculum` holds schema 1, an explicit scope, max_depth/max_concepts (and optional
max_rounds), a concept tree and discovery rounds. Concepts have stable ids, parents,
complexity/importance, included/deferred/excluded dispositions, source_ids and coverage.
Nonincluded concepts need reasons. Research requires vetted evidence for every included
concept, chronological frontier expansion and a documented stop decision. Recursive
breadth-first discovery replaces a fixed search quota as the research strategy; retain
source quality and per-topic source caps. Scope/budget limits are reported, never called
exhaustive coverage of a field.

Each included concept is taught through explanation, mechanism, use-case, trade-offs,
failure-modes and practice. Coverage entries name topic-relative artifacts through
repository-relative paths, declare taught aspects, and optionally name a literal anchor.
Each referenced generated body contains `<!-- concept: <id> -->`. Finalize checks paths,
markers, references and all six aspects; independent reviewers assess their correctness.
These checks prove traceability, not understanding or universal research completeness.

Keep the short lesson-page profile; deeper concepts also get one-topic notes at
`curriculum_dir` from `tutor paths` (`<vault>/concepts/`). Write them through `write-note`,
link them in prerequisite order from the lesson index, and include them in coverage.
The site renders these as More notes; the topic map exposes coverage and deferrals.
Branches needing their own source budgets become separate CLI topics; queue them in
handoffs and do not declare the requested whole course finished until delivered.

Adaptive outlines record complexity basic/intermediate/advanced, importance
supporting/core/critical, spatial boolean, visual name or null, visual_reason and
interaction_goal for visuals. The intake/lesson gates enforce these decisions. Advanced
spatial concepts require Graph3D (editable) or VectorSpace3D; advanced nonspatial concepts
use a justified ParamPlayground, StateMachine or FlowAnimation. Basic noncritical pages
may omit visuals; every page retains an activity and the no-box prose rules.

`tutor review <topic> --json` returns the current input_fingerprint and required_checks.
Curriculum content reviews additionally cover research-coverage, practical-depth,
visual-usefulness and learner-fit. Both scopes require independent:true, the actual fresh
reviewer_run_id, input_fingerprint, and an assessments object explaining every check with
inspected evidence. Standard/deep use separate reviewer runs. The CLI rejects stale imports
and missing assessments. Fresh isolation is a host-backed attestation, not a semantic proof.

The harness is provider-neutral: use native fresh-worker APIs with explicit role files,
min(host slots, depth limit), bounded inputs and durable CLI checkpoints. No provider API,
model id, reasoning setting or comparative model-quality claim is hardcoded. If fresh
review workers are unavailable, keep review pending for a separate session.

### 4.5 Roadmaps: a whole field as a sequence of topics

A topic is bounded (at most 60 curriculum concepts at `deep`). A request to master a whole
field ("frontend engineering end to end") is a **roadmap**: ordered phases → sections →
items. Each section that has items becomes exactly one topic of the normal pipeline; each
item of that section is a required concept of that topic. Sections without items (tables,
appendices) are reference sections and have no topic.

State lives in `state/roadmaps/<slug>/roadmap.json` (plus `source.html|json`, the input as
given) and is written only by `tutor roadmap`. The input is roadmap JSON or an HTML page
that embeds `const DATA = {...}` (the format of `harness/templates/roadmap.html`):

```json
{ "title": "...", "goal": "...", "intro": ["..."],
  "phases": [{ "num": "00", "title": "...", "blurb": "...", "subdomain": "optional",
    "sections": [{ "num": "00.1", "title": "...", "notes": [], "depth": "optional",
      "items": [{ "id": "kebab-id", "title": "...", "level": "core|adv|opt",
                  "desc": "...", "details": [{ "key": "Docs", "value": "..." }] }] }] }] }
```

`roadmap add` assigns each section a topic id `<domain>/<phase subdomain>/<section slug>`
and a depth (`--depth auto`: ≤3 items and no `adv` → quick; ≥9 items or ≥3 `adv` → deep;
else standard). `roadmap next` returns the first section that is in progress, else the first
not started, with its items and the exact `init ... --roadmap <r> --section <num>` command.
`init` refuses any other id for that section and stores `topic.roadmap = {id, section}`.
Topics are generated one at a time, in roadmap order. To save time, `roadmap next --json`
also returns `lookahead`: when exactly one section is in progress, the next not-started
section, whose intake and research may run in free worker slots (never its writer stages).
So at most two topics are active at once.

The learner drops input files in `inputs/`. `tutor roadmap inbox` lists them as `new`,
`imported` (byte-identical to a stored `source.*`), `changed-since-import`, or
`needs-conversion` (not roadmap HTML/JSON: the orchestrator converts it to
`.cache/roadmaps/<slug>.json` first), each with the next command to run.

**Gate.** For a linked topic, intake and finalize require `plan.curriculum`, and every item
of the section must appear in `roadmap_items` of at least one `included` concept. A `core`
item needs a concept with importance `core` or `critical`; an `adv` item needs complexity
`intermediate` or `advanced`, so the adaptive visual gate (§4.4) requires a visual lesson for
it. Finalize's curriculum coverage (six aspects per included concept) then proves each item
was taught. An item cannot be deferred or excluded.

**Views.** `roadmap add`, `roadmap render`, `init` on a linked topic, and `tutor map` write
`site/public/roadmaps/<slug>.html` (the interactive checklist: search, filters, progress,
per-section status and a link to each generated lesson; served at `/roadmaps/<slug>.html`
and listed on the site home) and `vault/_roadmaps/<slug>.md` (Obsidian map with a link to each
topic's `00-start-here`; listed on `Home`). The learner's checkbox state stays in their browser.

## 5. The `tutor` CLI

Run as `node harness/bin/tutor.mjs <command>` from the repository root. Zero
dependencies, Node ≥ 20. Every command accepts `--json` for machine output. A topic
is addressed by full id (`domain/subdomain/slug`) or by slug when unique.
Exit code 0 = success, 1 = validation failure, 2 = usage error.

| Command | Purpose |
|---------|---------|
| `domains` | List domain packs and their subdomains. |
| `init "<Title>" --domain <d> --subdomain <s> [--depth quick\|standard\|deep] [--slug <slug>]` | Create state, scaffold all four roots from templates, build the stage list from the domain pack and depth. Idempotent: never overwrites existing files. The slug comes from the title; a trailing acronym in parentheses is dropped ("Retrieval-Augmented Generation (RAG)" → `retrieval-augmented-generation`). |
| `list` | All topics with progress. |
| `roadmap add --file <roadmap.json\|roadmap.html> --domain <d> [--slug <s>] [--title "<T>"] [--depth auto\|quick\|standard\|deep]` / `roadmap list` / `roadmap status <r>` / `roadmap next <r>` / `roadmap section <r> <num>` / `roadmap render [<r>]` | Roadmaps (§4.5): store a field-wide roadmap, plan one topic per section, show progress, name the next section with its exact `init` command, print a section's required items, and regenerate the HTML checklist and vault map. `init ... --roadmap <r> --section <num>` links the planned topic. |
| `remove <topic> [<topic>...] [--delete]` | Preview or explicitly delete selected learning packages, including learner data. Rebuilds registry/maps; retains shared notes, caches and external reviews. |
| `status [<topic>]` | Stage table for one topic, or summary for all. |
| `paths <topic>` | Every path for the topic, including each numbered vault file, plus `site_url` and `open_lesson` (the one canonical sentence that says how to open the lesson: `npm run site:dev`, then the site path). Skills use this instead of building paths by hand. |
| `next <topic>` | The stages that can run now (the current wave), with skill name, inputs, outputs, and gate. When all required stages have current passing receipts and depth/domain omissions are accounted for: the reading order of this topic with only the steps it has (`reading_order`, `reading_order_line`), the skipped stage ids (`not_part_of_topic`), and `open_lesson`. |
| `depth <topic> <quick\|standard\|deep>` | Change the depth of an existing topic: recompute `profile`; stages the new depth adds go from `skipped` to `pending` (their notes are scaffolded); `pending` stages it drops go to `skipped`; `done` stages and real file content are never touched. Prints what changed, whether the plan needs more lesson pages, which done stages no longer pass their gate, and the `next` hint. |
| `plan <topic> --set <file.json>` | Merge a plan object into topic.json (used by intake). `plan <topic>` prints it. |
| `start <topic> <stage>` | Mark `in_progress`. |
| `unit <topic> <stage> add\|start\|done\|fail <unit-id> [--handoff <path>]` | Track parallel units. |
| `done <topic> <stage>` | Run `validate` for that stage; mark `done` only if it passes. |
| `skip <topic> <stage> --reason "..."` / `fail <topic> <stage> --reason "..."` | Record outcome. |
| `reset <topic> <stage>` | Back to `pending` (files untouched). |
| `validate <topic> [<stage>\|--all] [--files <path>[,<path>...]]` | Run artifact gates (see §13). Prints each failure as `path: problem. fix.`; warnings are listed apart and never change the exit code. With `--files` (repository-relative files or directories; a stage is required) it is the check of one unit worker: only problems of those files are reported and checks of the stage as a whole are left out. Exit 0 when the listed files are clean. |
| `map <topic>` | Regenerate `00-start-here`, `09-resources`, the domain map, `vault/Home.md`. Also syncs the backlinks of shared notes (one `- [[<linking-note>]]` bullet per linking topic note under `## Where it shows up` of each linked `_concepts/` or `_tech/` note; only adds) and the skip text of skipped-stage notes. Safe to run any time; runs after every state change and before the gate in `done`. |
| `sources <topic> add --file <entry.json>` / `sources <topic> list` / `sources <topic> update <id> --file <patch.json>` / `sources <topic> remove <id> --reason "..."` | Append, list, correct, or remove vetted sources; `add` rejects entries that fail the quality gate fields. `update` merges the patch into one entry (`evidence` one level deep, `null` clears a value), runs the entry gate again, and keeps the entry's position. |
| `slice <dir> [--budget 60000] [--include "<glob>"]` | Estimate tokens (chars/4) and cut a directory into slices that each fit the budget, grouped by top-level module. Used to plan repo analysis. |
| `budget <file...>` | Token estimate for files a worker is about to read. |
| `words <file>` | The word count of a lesson page or vault note exactly as its gate counts it, plus the allowed range when the file has one (brief, final notes, lesson page). Use it instead of `wc -w`. |
| `concept "<Name>" [--tech]` | Create `vault/_concepts/<Name>.md` (or `_tech/`) from template if missing; print its path. A name that differs from an existing note only by letter case creates nothing and prints the existing path. The author replaces the placeholder line under the title; `map` fills `## Where it shows up`. |
| `insight <topic> --text "..." [--section "<heading>"] [--target <stage-file>]` | Append a dated entry to `my-insights` and add a backlink line under "My insights" in the target note. |
| `recall due [<topic>]` / `recall grade <topic> <card-id> <again\|hard\|good\|easy>` / `recall sync <topic>` | Spaced review: Leitner boxes with intervals 1, 3, 7, 16, 35, 90, 180, 365 days. `sync` reads cards from `08-recall`. |
| `log <topic> "<message>"` | Append to the topic log. |
| `visuals <topic> list\|add --file\|update <id> --file\|remove <id> --reason\|check\|export` | The visual registry (§14): add/update reject unknown sources or concepts, missing assets, unsafe SVG and missing alt/explanation/learning check; every change re-exports `<vault>/visuals/`. |
| `video tools` · `video <topic> list\|build <id>\|render <id> [--docker] [--force]\|check <id>` | HyperFrames explainers (§14): build validates the storyboard and generates the composition, captions, transcript and storyboard note (optional local narration); render lints, renders locally or in Docker, verifies the MP4 and publishes it; unchanged storyboards are not rendered again; a missing renderer leaves an honest `storyboard` with its blocker. |
| `experience select --file <signals.json>` · `experience <topic> plan\|list\|build <id> [--skip-lint]\|check <id>\|progress [--file <export.json>]` | Adaptive experiences (§15): the mode selector and its reasons; per-page modes, cost against the depth budget and recorded mastery; build validates `experience.json`, builds and lints its videos and deck, publishes sandbox-safe compositions and writes `experience.built.json` (cached by content and source versions); progress imports exported checkpoint results into `progress.json`, recomputes mastery and misconceptions, and makes recall cards about weak concepts due. |
| `deck <topic> list\|build <id>\|check <id> [--offline]\|present <id>` | Branching HyperFrames slideshows (§15): build generates the slideshow composition and wrapper from `deck.json`; check runs `hyperframes check` (slideshow rule, runtime, layout, contrast), cached by hash; present prints the live presenter command. A deck is never rendered to MP4. |
| `style <file>` | Writing-standard report: sentence length, passive voice, academic words, share of compliant sentences (target 80%). |
| `doctor` | Check the harness itself: packs parse, templates exist, site present, registry consistent. |

## 6. Skills

All live in `.claude/skills/<name>/SKILL.md`. Each stage skill follows the same
shape so a smaller model can run it without guessing:

1. **Inputs** — exactly which files to read (from `tutor paths`), nothing more.
2. **Steps** — numbered, each with the command or file to produce.
3. **Output contract** — exact files and required sections.
4. **Gate** — `tutor validate <topic> <stage>` must pass, then `tutor done`.
5. **Context budget** — how the work is cut into units and when to hand off.

| Skill | Trigger | Job |
|-------|---------|-----|
| `learn` | "teach me X", "generate notes for X", `/learn X` | Orchestrator. Runs waves, spawns subagents (≤5), tracks state, resumes. |
| `learn-intake` | stage `intake` | Classify domain/subdomain, pick depth, map prerequisites, write the plan. |
| `learn-research` | stage `research` | Find and verify industry-standard sources. |
| `learn-brief` | stage `brief` | Write the small description. |
| `learn-digest` | stage `digest` | Summarize one paper / doc per unit. |
| `learn-repo-intel` | stage `repo-intel` | Clone, slice, analyze a production repo into Obsidian notes. |
| `learn-site` | stage `lesson` | Write the interactive lesson pages. |
| `learn-projects` | stage `mini-projects` | Build mini projects (starter + solution). |
| `learn-capstone` | stage `capstone` | Build the production-style project. |
| `learn-notes` | stage `notes` | Final notes + recall cards. |
| `learn-roadmap` | "master <field> end to end", a roadmap HTML/JSON, "continue <roadmap>" | Create or import a roadmap (§4.5), publish its checklist, then run `learn` for every section topic in order. |
| `learn-insight` | "add this to my notes", "I learned that…" | Add the learner's own insight to a topic. |
| `learn-recall` | "quiz me", "what's due" | Run a spaced-recall session and reopen weak spots (and their visual refresher). |
| `learn-visuals` | called by every stage skill; "draw / diagram / visualize X" | Shared capability: choose, ground, draw, register visuals; writing standard. |
| `learn-video` | a planned `video`; "make a video / animation of X" | Storyboard → HyperFrames composition → narration → captions → MP4 → validate → embed. |

## 7. Subagents

Defined in `.claude/agents/`. Subagents cannot spawn subagents, so only the
session running `learn` fans out. Each agent definition names the skill file it
must read first.

| Agent | Tier (`model:`) | Used by stage | One unit of work |
|-------|-----------------|---------------|------------------|
| `tutor-researcher` | fact (`sonnet`) | research | one source category (docs / papers+books / repos) |
| `tutor-digester` | fact (`sonnet`) | digest | one source |
| `tutor-repo-analyst` | fact (`sonnet`) | repo-intel | one repo slice from `tutor slice` |
| `tutor-project-builder` | fact (`sonnet`) | mini-projects, capstone | one project |
| `tutor-coverage-auditor` | fact (`sonnet`) | coverage audit (after notes) | one gap-finding round over one topic, read-only |
| `tutor-lesson-builder` | writer (`opus`) | lesson | 2–3 lesson pages |
| `tutor-video-producer` | writer (`opus`) | lesson | one planned explainer video (`video-<id>`) |
| `tutor-verifier` | writer (`opus`) | finalize | independent quality review of one topic |

Fact-tier workers find and extract public facts; writer-tier workers (and the inline `brief`
and `notes` stages of the orchestrator) turn them into the learner-facing wording. The
orchestrator caps total worker spawns per topic (14 / 36 / 56 by depth, retries included)
and runs at most 1 / 2 / 2 coverage-audit rounds (`learn` skill, "The orchestrator layer").

### 7.1 Context budget protocol (the 40% rule)

A worker must stay under 40% of its context window. Nobody can read a token meter,
so the rule is enforced by planning, not by hoping:

- **Budget per unit:** `min(60000, floor(0.4 * model_window) - reserve)` input tokens,
  counting instructions and prior tool results. Pass `--window` and `--reserve` to
  `budget` and `slice`. Unknown capacity defaults to32768 with3000 reserved. Character/4
  estimates are planning aids, not actual context telemetry or a hard runtime guarantee.
  Large text files split into contiguous zero-based character ranges, read with `tutor read`.
- **One unit, one subagent.** A unit is one source, one repo slice, 2–3 lesson
  pages, or one project.
- **Write as you go.** After each file or section read, append findings to the
  output note. Never hold findings only in memory.
- **Handoff instead of pushing on.** If a unit turns out bigger than planned, the
  worker writes `state/.../handoffs/<stage>-<unit>.md` (done / remaining / next
  step), runs `tutor unit ... fail --handoff <path>`, and returns
  `CONTINUE: <handoff path>`. The orchestrator spawns a fresh worker on the rest.
- **Return small.** A worker returns ≤150 words: files written, 3 key findings,
  open problems. The orchestrator reads summaries, never raw sources.
- **Fetch narrow.** Web pages are fetched with a specific question; long docs are
  read by section, not whole.
- **Max 5 concurrent subagents.** More units than 5 → queue them in batches.
- The orchestrator itself only reads `topic.json`, `tutor next` output, and worker
  summaries. Persist a wave handoff; after compaction reload CLI state and continue. Use host-native continuations when available. A host that cannot continue must report that limitation honestly;15 returns alone never require another learner request.

## 8. Domain packs

`harness/domains/<domain>/pack.json` (machine) + `playbook.md` (guidance the
stage skills read). Domains:

`frontend-engineering`, `backend-engineering`, `system-design`, `devops`,
`ai-engineering`, `core-ai`, `data-engineering`, `data-analytics`,
`mobile-development`, `game-development`, `security`, `general`.

`general` is the adaptive fallback for anything else (marketing, business, math).

`pack.json`:

```json
{
  "id": "backend-engineering",
  "title": "Backend Engineering",
  "description": "one sentence",
  "subdomains": [{ "id": "messaging", "title": "Messaging & Streaming", "examples": ["Kafka", "Redis Streams"] }],
  "stages": {
    "repo-intel": { "enabled": true },
    "capstone": { "enabled": true, "kind": "service" }
  },
  "depth_overrides": {},
  "default_stack": { "language": "TypeScript", "runtime": "Node.js", "test": "vitest" },
  "safety": []
}
```

`stages.<id>.enabled: false` removes a stage for the whole domain. Anything
omitted uses the defaults in §4.

`playbook.md` has these fixed headings, each read by exactly one skill:

- `## How this domain is learned` — intake
- `## Trusted sources` — research (canonical docs, books, papers, engineering
  blogs, organizations whose repositories count as production grade)
- `## Lesson recipes` — site (which component fits which kind of concept here)
- `## Mini project patterns` — projects
- `## Repository analysis focus` — repo-intel
- `## Capstone shape` — capstone (what "production ready" means in this domain)
- `## Recall focus` — notes
- `## Safety and ethics` — all (security: authorized labs only)

## 9. Source quality gate

The learner's time is the scarce resource. A source is recommended only when its
standing is verified now, from a live page — never from memory.

`sources.json` is an array of:

```json
{
  "id": "redis-streams-docs",
  "type": "official-docs | paper | book | repo | engineering-blog | course | talk | standard",
  "title": "...",
  "url": "https://...",
  "authors": "person or organization",
  "year": 2024,
  "tier": "A | B",
  "why_trusted": "one sentence a senior engineer would accept",
  "evidence": { "stars": 68000, "last_commit": "2026-11-01", "citations": null, "venue": null, "publisher": null, "used_by": ["..."] },
  "verified_at": "2026-11-14",
  "verified_via": "https://... (page where the evidence was read)",
  "use_for": ["brief", "digest", "repo-intel", "lesson"]
}
```

Tier A = canonical (official docs, the defining paper, the standard book, the
reference implementation). Tier B = strong and widely used. Anything else is not
written to the file. Thresholds live in `harness/rubrics/source-quality.md`.
Fewer, better: 5–12 sources per topic.

## 10. Repository deep dive (Obsidian)

Per repository, under `05-repo-intel/<org>-<repo>/`, every file name prefixed with
`<repo>-` to stay unique:

```
<repo>-overview.md            what it is, why chosen, commit SHA analyzed, license, stack
<repo>-architecture.md        module map + mermaid diagram + main request/data flow
<repo>-module-<name>.md       one per slice: responsibility, key files, how it works
<repo>-tech-and-services.md   scoped inventory of direct/runtime/build/test dependencies and services
<repo>-pattern-<name>.md      one per best practice, with evidence
<repo>-findings.md            ranked: what they do beyond the textbook version
<repo>-takeaways.md           what to borrow for the capstone
```

Every claim cites evidence as `path/to/file.ext:line @ <short-sha>`. Technologies
and services link to `[[_tech notes]]`; ideas link to `[[_concepts notes]]`. Those
shared notes are what connect topics into one graph.

Repositories are shallow-cloned into `.cache/repos/<org>__<repo>/` and never
copied into the vault.

## 11. Vault note rules

Every vault note starts with frontmatter:

```yaml
---
title: Human title
topic: backend-engineering/messaging/redis-streams
stage: brief            # brief | lesson | mini-projects | digest | repo-intel | capstone | final-notes | recall | resources | insights | map | concept | tech
tags: [backend-engineering, messaging]
created: 2026-11-14
sources: [redis-streams-docs]   # ids from sources.json, when the note relies on them
---
```

- Links are Obsidian wikilinks: `[[note-file-name|Shown text]]`. Every link must
  resolve to a file in the vault.
- Each stage note ends with a `## My insights` heading (the insight skill appends
  backlinks there) — generated notes never write below it.
- Diagrams are mermaid code blocks.
- Recall cards use the Obsidian Spaced Repetition multi-line format, each card
  preceded by an id comment:

  ```
  <!-- card: rs-01 -->
  What does XACK do?
  ?
  Removes the entry from the group's pending list.
  ```

## 12. Lesson page rules (the website)

The site is a minimal blog. Read `site/COMPONENTS.md` for exact props.

A lesson page is `site/src/content/lessons/<domain>/<subdomain>/<slug>/NN-<page>.mdx`:

```mdx
---
title: What is a stream?
description: One-line mini description shown under the title.
order: 1
concepts: [append-only log, message id]
---
```

Rules the validator enforces:

- **Short prose.** 10–15 lines of description: 110–260 words of prose per page
  (everything outside frontmatter, code, and components).
- **Adaptive visuals.** For new adaptive plans, follow §4.4: a basic noncritical
  page may omit visuals; intermediate/critical pages require a visual and advanced
  pages need meaningful interaction. Every page has an activity. Legacy plans retain
  one visual/activity per page, an animated flow per topic, and planned 3D.
- **No boxes, no quotes.** No blockquotes (`>`), no `:::` asides, no `<aside>`,
  `<blockquote>`, `<details>`, no card or callout markup. An important note is a
  plain paragraph starting with `**Note.**`.
- **No imports for shared components.** Shared components are available in every
  lesson page without `import` and without `client:` directives. Topic-specific
  components live in `site/src/components/topics/<slug>/` and are imported
  explicitly.
- **One idea per page.** Title, mini description, prose, visuals, activity.
- The final lesson page ends with `<Resources />`, which renders the topic's
  vetted sources.

Shared component names (fixed; props in `site/COMPONENTS.md`):

| Kind | Components |
|------|-----------|
| visual | `FlowAnimation`, `SystemDiagram`, `SequenceDiagram`, `StateMachine`, `Graph3D`, `VectorSpace3D`, `Chart`, `ParamPlayground`, `CodeWalkthrough`, `Timeline`, `Mermaid`, `Diagram`, `Video`, `ClusterSim`, `AlgorithmStepper`, `CompareView`, `CodePlayground` |
| activity | `Quiz`, `PredictReveal`, `OrderSteps`, `MatchPairs`, `SortBuckets` |
| utility | `Resources`, `Figure`, `Depth` |

`Graph3D` supports an `editable` mode (add, connect, remove nodes) so the learner
can build a system, not just watch one.

The site also renders the vault notes of each topic (brief, digests, repo intel,
capstone, final notes, recall, insights) so the whole journey is readable in one
place, in order, with previous / next links. Navigation is derived from
`state/`, `vault/`, and the lessons folder — nothing is registered by hand.

## 13. Validation gates (`tutor validate`)

| Stage | Gate |
|-------|------|
| intake | `plan` has summary, prerequisites, outcomes, lesson_outline (count fits depth); adaptive and curriculum contracts when present |
| research | `sources.json` parses; 5–12 entries (quick: 3–8); every entry has all §9 fields, tier A/B, `verified_at`, `verified_via`; ≥1 tier A |
| brief | file exists, frontmatter valid, 150–400 words, sections present, links resolve |
| digest | index + one note per planned digest; each cites its source id |
| repo-intel | per repo: overview, architecture, ≥1 module, tech-and-services, findings, takeaways; overview names a commit SHA; findings contain evidence citations |
| lesson | page count fits depth; every page passes §12; the final page (highest `order` in `plan.lesson_outline`) ends with `<Resources />` and no other page has it; no attribute of a shared component outside its `props` list in `site/components.manifest.json` (checked when the manifest has `props`) |
| mini-projects | each project has README.md, `starter/`, `solution/`; index note lists them |
| capstone | README.md, ARCHITECTURE.md, ≥1 ADR, `src/`, `tests/`; vault note exists |
| notes | final notes 200–600 words; ≥8 recall cards with ids (quick: ≥5) |
| finalize | all artifact gates, concept coverage when planned, resolving unambiguous links, all required stages current, passing execution receipts, independent content/project reviews for current inputs |

All notes: frontmatter present, no content below `## My insights` written by a
generator.

**Visual-first plans** add to these gates (§14): brief ≥1 diagram; every digest ≥1;
each `<repo>-architecture.md` ≥2; each mini-project README ≥1; capstone
`ARCHITECTURE.md` ≥3 and its note ≥1; lesson ≥2/3/5 registered visuals
(quick/standard/deep), an end-to-end workflow diagram for multi-stage topics, every
planned `extra_visuals`/`video` on its page, at most two `<Depth>` blocks of 20–180
words; final notes link `[[visuals-<slug>]]` with a visual refresher and a recall
card links a visual note; every registry entry used by the stage is valid; finalize
checks the vault export. Writing-standard findings are warnings.

**Warnings.** A gate may also return warnings. They are printed under a
"Warnings" heading, returned in `--json` as `warnings`, and never fail the gate
or change the exit code. Today: a `SystemDiagram`, `FlowAnimation`, or
`SequenceDiagram` with more than 7 nodes or actors.

**One unit.** `tutor validate <topic> <stage> --files <path>[,<path>...]` runs
the same gate for the files of one unit worker. It reports only the problems of
the listed files (a directory covers everything under it) and leaves out what
one unit cannot satisfy: counts, the index or pointer note, rules across all
pages, and the "final page" check when that page is not among the files. The
stage runner runs the full gate before `done`.

**Word counts.** `tutor words <file>` prints the number a word-range check
uses: for a lesson page the prose outside frontmatter, imports, code, and
components; for a vault note the body above `## My insights` without
frontmatter, code blocks, and comments.

**Skipped stages.** Only stages omitted by depth/domain are excluded. A required stage skipped by a user remains an undelivered requirement and fails readiness validation. Its scaffolded note holds
`<!-- tutor:skipped -->` and one sentence that says the step is not part of
this topic at its depth and how to add it (`/learn <slug> --depth standard`);
`00-start-here` lists the step as plain text without a link. When the stage
becomes active again the normal placeholder returns, but only if the note still
holds the skip text. `tutor depth <topic> <depth>` moves a topic to another
depth without touching `done` stages or real content.

Repository coverage is evidence-scoped: declare selected first-party paths, direct runtime,
build/test/CI tools, transitive/vendor scope and skipped areas at the pinned commit. Do not
call a selected slice an exhaustive whole-repository audit. Group aliases and routine shell
commands into canonical families for new shared notes; retain existing shared notes. The
Retained inventories preserve existing definitions and explicitly state unreviewed vendor scope.

The full workflow requires Node >=22.23.4 (site engine), network access for source checks,
and any services named by project recipes. Doctor checks the runtime; the orchestrator must
verify required tools/services before dispatch, including Docker daemon readiness when using
Compose or an explicitly documented external Redis URL. Untested environments remain stated
limitations, not passing checks.

Worker metadata is projected through `tutor plan --json` and `tutor paths --json`; pass only assigned source entries. Full topic.json now includes execution evidence and protection/history snapshots and must not be copied into worker prompts. Size the complete filled brief and instructions before dispatch.

## 14. Visual-first learning (shared visual and communication capability)

New plans set `plan.visual_first: true` (with `visual_policy: "adaptive"`), and
`plan.multi_stage` when the topic centers on a multi-stage process. Outline
entries may add `extra_visuals` (more shared visuals on a complex page) and
`video: {id, reason}` (at most three per topic, only for chronological or causal
sequences). Legacy plans are unchanged.

**One capability, every stage.** `learn-visuals` decides the visual for a concept,
grounds every drawn relationship in a vetted source, draws it reproducibly
(mermaid or SVG asset, a lesson component, or a video through `learn-video`),
and registers it. Research records sourced visual candidates; brief, digest,
repo-intel, lesson, projects and capstone draw through it; notes and recall
reuse the registered visuals. Contracts: `harness/rubrics/visuals.md`,
`harness/rubrics/writing-standard.md`.

**One registry, two readers.** `state/topics/<topic>/visuals.json` ties each
visual to `concept_ids`, `source_ids`, its `purpose`, `explanation`, `alt`,
`learning_check` and `used_in` files. The site renders `<Diagram id>` and
`<Video id>` from it; `tutor map` exports it to `<vault>/visuals/` (index, one
note per visual, concept map), keeping learner insights byte for byte. Assets live
once, in the vault (`visuals/assets/`); rendered video lives in `site/public/media/`.

**Videos.** HeyGen's open-source HyperFrames (pinned in `harness/lib/video.mjs`)
renders an HTML + GSAP composition to MP4 in headless Chrome and FFmpeg, locally or
in its Docker image. `tutor video` generates the composition from a storyboard
(`projects/.../videos/<id>/video.json`; scene types title, steps, flow, compare,
equation, timeline, bars, custom), checks pace (≤2.8 words/s), sources and the
narration/label consistency, adds optional free local narration (macOS `say`,
Kokoro), captions (WebVTT, burned in and shipped), a transcript and a storyboard,
runs `hyperframes lint`, renders, verifies the MP4 with a zero-dependency parser,
and caches by storyboard hash. No paid API. Without a renderer the video stays
`storyboard` with its blocker; the site shows the storyboard and transcript.

**Site.** One design system (tokens in `global.css`, components in `learn.css` and
`media.css`): minimal, keyboard reachable, captions, reduced motion respected,
375 px without sideways scroll. New components: `Diagram` (zoom/pan), `Video`
(captions, transcript, sources, honest fallback), `ClusterSim` (add/remove/fail
servers, latency, concurrent writes, step/pause/reset; replication, gossip, load
balancing), `AlgorithmStepper`, `CompareView`, `CodePlayground` (sandboxed iframe,
no network), `SortBuckets`, and `Depth` with a site-wide depth control
(Essentials / + Internals / + Production) for progressive disclosure.

**Quality.** Gates in §13; `npm --prefix site run interact` drives the shared
components (controls change results, Reset restores, sandbox isolation, captions,
accessible names, 375 px layout, reduced motion); content reviews add
visual-accuracy, visual-efficacy (answer each visual's learning check without and
with the visual), interaction-behavior, interactive-topic-fit, accessibility-responsive, writing-standard
and video-consistency; project reviews add project-diagrams. Regression tests cover
three domains (`harness/tests/visual-first.test.mjs`); the end-to-end script
`harness/tests/e2e/visual-topic-site.mjs [--render]` builds a visual-first topic
into a real site and drives it in a browser.

## 15. Adaptive explainer videos and interactive video learning

New plans set `plan.experience_policy: "adaptive"` (with `visual_first: true`).
Every outline entry records `experience.signals`; the deterministic selector
(`harness/lib/experience-mode.mjs`) chooses one of five modes per idea:
`static` (diagram and text), `explainer` (Mode A, MP4), `interactive` (Mode B,
guided composition plus simulation or inspect regions plus checkpoints),
`branching` (Mode C, HyperFrames slideshow with hotspot branches) or `hybrid`
(Mode D, intro video, simulation, guided walkthrough, optional deck, checkpoints,
summary video). Low benefit and high recorded mastery lighten the mode; an
override needs `override_reason`; the plan must fit a cost budget per depth.
Recorded mastery enters only through `signals.mastery`, so gates read the plan
alone. Contract: `harness/rubrics/experiences.md`.

**Layers.** HyperFrames is the animation layer: storyboards (`video.json`) and
decks (`deck.json`) in `projects/.../videos/<id>/` generate compositions that
pass the official `lint`/`check`. `tutor video build` also publishes each
composition to `site/public/media/<sub>/<id>/composition/`, rewritten to run
offline under a strict CSP with the pinned GSAP and HyperFrames runtime
(`site/public/media/_hf/`), after a safety check that rejects network, storage,
parent-page access, eval and external assets (`harness/lib/composition-safety.mjs`).
The lesson definition (`projects/.../experiences/<id>/experience.json`) composes
the parts; `tutor experience build` resolves it into `experience.built.json`, the
one file the site reads. Simulation state lives in the site component and stays
separate from the video timeline; `sync` only loads a named preset when a guided
scene starts.

**Site.** `<Experience id>` renders the tabs of its mode (Watch, Explore,
Guided, Deep dive, Practice) and keeps progress across tabs. It plays
compositions in `@hyperframes/player` with `sandbox-origin="opaque"`, decks in
`<hyperframes-slideshow>`, loads both only when a tab needs them, never
autoplays, offers captions or transcripts for every part, falls back to the MP4,
the transcript and the static fallback diagram, and exports checkpoint results.

**Assessment loop.** `tutor experience <topic> progress --file` merges the export
into `state/topics/<sub>/progress.json` (idempotent), computes concept mastery and
misconceptions, makes related recall cards due today, and lists scenes to replay;
`learn-recall` asks weak concepts first; `tutor experience <topic> plan` proposes
recorded mastery for the next plan.

**Vault.** `tutor map` writes one note per experience and deck: mode, lesson
URL, parts as links, editable project paths, deck outline, checkpoints, sources
and prerequisites. Final notes link them.

**Cost and caching.** Local, open-source tools only (HyperFrames via pinned
`npx`, `say`/Kokoro, Docker or FFmpeg for MP4). Video, deck and experience
hashes include the spec, the generator version and the fingerprint of the cited
sources; unchanged parts are neither rebuilt, re-linted, re-checked nor
re-rendered. Only Watch and summary videos are rendered; guided parts play the
composition.

**Tests.** `harness/tests/experiences.test.mjs` covers the selector, the four
representative experiences (HTTP lifecycle, binary search, Raft consensus,
marketing funnel strategy), gates, caching, safety and the progress loop;
`harness/tests/e2e/experiences-site.mjs` builds all four into a real site and
drives them in a browser.

