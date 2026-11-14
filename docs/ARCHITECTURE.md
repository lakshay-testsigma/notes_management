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

The learner is a beginner. Everything is linear and numbered so they never hop
around to understand a topic.

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
├── .claude/
│   ├── skills/                  one skill per workflow checkpoint (see §6)
│   └── agents/                  subagent definitions used by the skills (see §7)
├── harness/                     the engine
│   ├── bin/tutor.mjs            CLI: state, scaffolding, validation, slicing (see §5)
│   ├── lib/                     CLI internals
│   ├── domains/<domain>/        domain packs: pack.json + playbook.md (see §8)
│   ├── rubrics/                 source-quality.md, lesson-page.md, vault-notes.md
│   ├── templates/               file templates used by `tutor init`
│   └── tests/                   CLI tests
├── state/
│   ├── registry.json            index of all topics
│   └── topics/<domain>/<subdomain>/<slug>/
│       ├── topic.json           progress + plan (see §4)
│       ├── sources.json         vetted sources (see §9)
│       └── handoffs/            subagent checkpoint files
├── vault/                       OBSIDIAN VAULT — open this folder in Obsidian
│   ├── Home.md                  map of all domains
│   ├── _concepts/               one note per shared concept (links topics together)
│   ├── _tech/                   one note per technology / external service
│   └── <domain>/
│       ├── <domain>.md          domain map (lists subdomains and topics)
│       └── <subdomain>/<slug>/  one topic (see §3.1)
├── site/                        ASTRO SITE — the reading interface
│   ├── COMPONENTS.md            authoritative reference for lesson components
│   ├── components.manifest.json machine list of component names by kind
│   └── src/content/lessons/<domain>/<subdomain>/<slug>/NN-<page>.mdx
├── projects/<domain>/<subdomain>/<slug>/
│   ├── mini-01-<name>/          README.md, starter/, solution/
│   ├── mini-02-<name>/
│   └── capstone/                README.md, ARCHITECTURE.md, docs/adr/, src/, tests/
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
after `notes`. A wave starts only when the previous wave is `done` or `skipped`.
Stages a domain pack or depth switches off stay in the list as `skipped`.

### 4.2 Depth profiles

| Depth      | Lesson pages | Mini projects | Digests | Repos | Capstone | Use for                  |
|------------|--------------|---------------|---------|-------|----------|--------------------------|
| `quick`    | 3–4          | 1             | 1–2     | 0     | skipped  | small concept, 1 sitting |
| `standard` | 5–7          | 2             | 2–3     | 1     | yes      | default                  |
| `deep`     | 8–12         | 3             | 4–6     | 2–3   | yes      | core career topic        |

The domain pack may switch stages off (for example `repo-intel` in a non-code
domain) or rename what the capstone is (a campaign, a model, a threat model).

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
| `status [<topic>]` | Stage table for one topic, or summary for all. |
| `paths <topic>` | Every path for the topic, including each numbered vault file, plus `site_url` and `open_lesson` (the one canonical sentence that says how to open the lesson: `npm run site:dev`, then the site path). Skills use this instead of building paths by hand. |
| `next <topic>` | The stages that can run now (the current wave), with skill name, inputs, outputs, and gate. When every stage is done or skipped: the reading order of this topic with only the steps it has (`reading_order`, `reading_order_line`), the skipped stage ids (`not_part_of_topic`), and `open_lesson`. |
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
| `learn-insight` | "add this to my notes", "I learned that…" | Add the learner's own insight to a topic. |
| `learn-recall` | "quiz me", "what's due" | Run a spaced-recall session and reopen weak spots. |

## 7. Subagents

Defined in `.claude/agents/`. Subagents cannot spawn subagents, so only the
session running `learn` fans out. Each agent definition names the skill file it
must read first.

| Agent | Used by stage | One unit of work |
|-------|---------------|------------------|
| `tutor-researcher` | research | one source category (docs / papers+books / repos) |
| `tutor-digester` | digest | one source |
| `tutor-repo-analyst` | repo-intel | one repo slice from `tutor slice` |
| `tutor-lesson-builder` | lesson | 2–3 lesson pages |
| `tutor-project-builder` | mini-projects, capstone | one project |
| `tutor-verifier` | finalize | independent quality review of one topic |

### 7.1 Context budget protocol (the 40% rule)

A worker must stay under 40% of its context window. Nobody can read a token meter,
so the rule is enforced by planning, not by hoping:

- **Budget per unit: 60,000 tokens of reading** (40% of a 200k window is 80k; the
  other 20k is instructions, tool output, and writing). Use `tutor budget` /
  `tutor slice` to size units before spawning.
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
  summaries. If its own session grows long, it stops after a wave; state on disk
  lets a new session continue with `/learn <topic>`.

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
<repo>-tech-and-services.md   every technology and external service, why it is used
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
- **Visual first.** At least one *visual* component and at least one *activity*
  component per page. Across a topic: at least one animated flow, and at least one
  3D component when the topic has spatial or graph structure.
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
| visual | `FlowAnimation`, `SystemDiagram`, `SequenceDiagram`, `StateMachine`, `Graph3D`, `VectorSpace3D`, `Chart`, `ParamPlayground`, `CodeWalkthrough`, `Timeline`, `Mermaid` |
| activity | `Quiz`, `PredictReveal`, `OrderSteps`, `MatchPairs` |
| utility | `Resources`, `Figure` |

`Graph3D` supports an `editable` mode (add, connect, remove nodes) so the learner
can build a system, not just watch one.

The site also renders the vault notes of each topic (brief, digests, repo intel,
capstone, final notes, recall, insights) so the whole journey is readable in one
place, in order, with previous / next links. Navigation is derived from
`state/`, `vault/`, and the lessons folder — nothing is registered by hand.

## 13. Validation gates (`tutor validate`)

| Stage | Gate |
|-------|------|
| intake | `plan` has summary, prerequisites, outcomes, lesson_outline (count fits depth) |
| research | `sources.json` parses; 5–12 entries (quick: 3–8); every entry has all §9 fields, tier A/B, `verified_at`, `verified_via`; ≥1 tier A |
| brief | file exists, frontmatter valid, 150–400 words, sections present, links resolve |
| digest | index + one note per planned digest; each cites its source id |
| repo-intel | per repo: overview, architecture, ≥1 module, tech-and-services, findings, takeaways; overview names a commit SHA; findings contain evidence citations |
| lesson | page count fits depth; every page passes §12; the final page (highest `order` in `plan.lesson_outline`) ends with `<Resources />` and no other page has it; no attribute of a shared component outside its `props` list in `site/components.manifest.json` (checked when the manifest has `props`) |
| mini-projects | each project has README.md, `starter/`, `solution/`; index note lists them |
| capstone | README.md, ARCHITECTURE.md, ≥1 ADR, `src/`, `tests/`; vault note exists |
| notes | final notes 200–600 words; ≥8 recall cards with ids (quick: ≥5) |
| finalize | all of the above + every wikilink in the topic resolves |

All notes: frontmatter present, no content below `## My insights` written by a
generator.

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

**Skipped stages.** A skipped stage is not checked. Its scaffolded note holds
`<!-- tutor:skipped -->` and one sentence that says the step is not part of
this topic at its depth and how to add it (`/learn <slug> --depth standard`);
`00-start-here` lists the step as plain text without a link. When the stage
becomes active again the normal placeholder returns, but only if the note still
holds the skip text. `tutor depth <topic> <depth>` moves a topic to another
depth without touching `done` stages or real content.
