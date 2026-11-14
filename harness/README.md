# The `tutor` CLI

The engine of the learning harness. It keeps the state of every topic on disk,
creates the files of a topic, checks the work of every stage, and cuts big
reading jobs into pieces that fit one worker.

The contract it implements is [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).

```bash
node harness/bin/tutor.mjs <command> [arguments] [--json]
npm run tutor -- <command> [arguments]        # the same thing
npm test                                       # run the CLI tests
```

- Node 20 or newer. No npm dependencies.
- Run it from the repository root.
- Every command accepts `--json`. JSON output always has `"ok": true|false`.
- A `<topic>` is the full id `domain/subdomain/slug`, or just the slug when only
  one topic has it. An ambiguous slug is an error that lists the candidates.
- Exit codes: `0` success, `1` validation failure, `2` usage error.
- Errors in `--json` mode look like `{ "ok": false, "error": "...", "code": "usage" | "validation", "hint": "..." }`.

## How a stage skill uses the CLI

Every stage follows the same five steps. `<t>` is the topic, `<s>` the stage.

```bash
node harness/bin/tutor.mjs next <t> --json        # 1. what can run now: skill, inputs, outputs, targets
node harness/bin/tutor.mjs paths <t> --json       # 2. every path; never build a path by hand
node harness/bin/tutor.mjs start <t> <s>          # 3. mark the stage in_progress
#    ... read the inputs, write the outputs ...
node harness/bin/tutor.mjs validate <t> <s>       # 4. check the work; fix every printed line
node harness/bin/tutor.mjs done <t> <s>           # 5. runs the gate again; marks done only if it passes
```

When the gate fails, each problem is one line: `path: problem. fix.` Fix exactly
those lines and run `validate` again. If a stage cannot be finished, record it
with `fail <t> <s> --reason "..."` (retry later) or `skip <t> <s> --reason "..."`.

A worker that owns one unit of a stage (two lesson pages, one digest, one
project) checks only its own files, so it never sees problems that belong to
the stage runner or to another worker:

```bash
node harness/bin/tutor.mjs validate <t> <s> --files <path>[,<path>...]   # exit 0 when the listed files are clean
node harness/bin/tutor.mjs words <file>                                  # the word count the gate uses (not `wc -w`)
```

## Stage lifecycle

```
pending ──start──▶ in_progress ──done (gate passes)──▶ done
   ▲                    │
   │                    ├──fail --reason──▶ failed ──start──▶ in_progress
   └──────reset─────────┴──skip --reason──▶ skipped
```

- Stages run in waves (0 → 5). A stage can start only when every stage of the
  earlier waves is `done` or `skipped`. Stages of the same wave are independent.
- `tutor init` marks a stage `skipped` when the depth leaves it out (`quick`
  skips `repo-intel` and `capstone`) or when the domain pack switches it off.
  Skipped stages stay in the list, so every topic has the same ten stage ids.
- The note of a skipped stage never says "Not written yet". Its body is the
  line `<!-- tutor:skipped -->` followed by one sentence: the step is not part
  of this topic at its depth, and how to add it (`/learn <slug> --depth
  standard`). `00-start-here` lists that step as plain text, without a link.
  When the stage becomes active again (`reset`, `depth`), the normal
  placeholder returns — but only when the note still holds the skip text. A
  note with real content is never rewritten. `tutor depth` changes the depth
  of an existing topic.
- `units` are the parallel work items inside a stage (one digest, one repository
  slice, a batch of lesson pages). They are tracked with `tutor unit`.
- Every state change is written to the topic `log` (the last 200 entries are kept).
- State files are written atomically, and state-changing commands take a lock,
  so parallel workers can call the CLI at the same time.

| Wave | Stage | Skill | Gate (what `validate` checks) |
|------|-------|-------|-------------------------------|
| 0 | `intake` | `learn-intake` | plan has summary, prerequisites, outcomes, lesson_outline; page count fits the depth |
| 1 | `research` | `learn-research` | `sources.json` parses; 5–12 entries (quick: 3–8); every §9 field; at least one tier A |
| 1 | `brief` | `learn-brief` | frontmatter; 150–400 words; sections "What it is", "The problem it solves" (or "Why it exists"), "Where it is used…"; links resolve |
| 2 | `digest` | `learn-digest` | index + one `<source-id>-<slug>.md` per planned digest; each cites its source id; index links each |
| 2 | `repo-intel` | `learn-repo-intel` | per repository folder: overview (with commit SHA), architecture, ≥1 module, tech-and-services, findings (with `file:line @ sha`), takeaways |
| 3 | `lesson` | `learn-site` | page count fits the depth; every page passes the lesson rules below; `<Resources />` ends the final page and is on no other page; `02-lesson` shows the site path |
| 3 | `mini-projects` | `learn-projects` | each `mini-NN-<name>/` has README.md, `starter/`, `solution/`; the index note lists each folder |
| 4 | `capstone` | `learn-capstone` | README.md, ARCHITECTURE.md, ≥1 ADR in `docs/adr/`, `src/`, `tests/`; vault note written |
| 5 | `notes` | `learn-notes` | final notes 200–600 words; ≥8 valid recall cards (quick: ≥5) |
| 5 | `finalize` | `learn` | every gate above, plus every note of the topic has frontmatter and resolving links |

Rules for every vault note the gates check: frontmatter with `title`, `topic`,
`stage`, `tags`, `created`; `sources` ids exist in `sources.json`; every
`[[wikilink]]` resolves to a file name in `vault/` (exact letter case);
`## My insights` is the last heading; the `<!-- tutor:placeholder -->` line of
the scaffold is gone.

Rules for every lesson page (`NN-<page>.mdx`): frontmatter `title`,
`description`, `order` (equal to `NN`), `concepts`; 110–260 words of prose
(frontmatter, imports, code blocks, and components are not counted); at least one
visual and one activity component; no blockquotes, `:::` asides, `<aside>`,
`<blockquote>`, `<details>`, cards or callouts; no import of a shared component
and no `client:` directive on one; no unknown component; no unknown prop on a
shared component. Across the topic: at least one `FlowAnimation`, and a 3D
component when the plan asks for one. A component imported from
`components/topics/…` (or `@topics/…`) counts as a visual.

- **The final page** is the page with the highest `order` in
  `plan.lesson_outline` (the last file on disk only when the plan has no
  outline). It must end with `<Resources />`, and no other page may use
  `<Resources />`. While the final page is not written yet, no page is treated
  as final.
- **Component names and props** come from `site/components.manifest.json`:
  `{ "visual": [...], "activity": [...], "utility": [...], "props": { "FlowAnimation": ["nodes", "steps", ...], ... } }`.
  When `props` is there, an attribute of a shared component that is not in its
  list fails; the message names the allowed props and points to
  `site/COMPONENTS.md`. Without `props` (or for a component that `props` does
  not list) this check is off.
- **Warnings** do not fail the gate. They are printed under a `Warnings`
  heading and returned in `--json` as `warnings`; the exit code does not
  change. There is one today: a `SystemDiagram` or `FlowAnimation` with more
  than 7 `nodes`, or a `SequenceDiagram` with more than 7 `actors`.

## Commands

### `domains`

Lists the domain packs in `harness/domains/` with their subdomains.

```bash
node harness/bin/tutor.mjs domains
```

### `init "<Title>" --domain <d> --subdomain <s> [--depth quick|standard|deep] [--slug <slug>]`

Creates the topic: `topic.json`, an empty `sources.json`, the registry entry, all
vault notes of §3.1 from the templates, the lessons folder, and the projects
folder. Then regenerates the maps. Running it again overwrites nothing.
An unknown domain is an error. A new subdomain is allowed and noted.

The slug is made from the title (or from `--slug`). A trailing acronym in
parentheses is dropped, because it only repeats the title:
"Retrieval-Augmented Generation (RAG)" becomes `retrieval-augmented-generation`.
The title itself is kept as written.

```bash
node harness/bin/tutor.mjs init "Redis Streams" --domain backend-engineering --subdomain messaging --depth standard
```

### `list`

All topics with progress.

```bash
node harness/bin/tutor.mjs list --json     # { count, topics: [{ id, title, depth, progress, complete, wave, runnable, site_url, start_here }] }
```

### `status [<topic>]`

The stage table of one topic (with `--json`: the full `stages` array including
`units`), or the same summary as `list` when no topic is given.

```bash
node harness/bin/tutor.mjs status redis-streams
```

### `paths <topic>`

Every path of the topic, relative to the repository root. `abs` holds the same
keys as absolute paths.

```bash
node harness/bin/tutor.mjs paths redis-streams --json
```

Keys: `state_dir`, `topic_json`, `sources_json`, `handoffs_dir`, `vault_dir`,
`start_here`, `brief`, `lesson`, `mini_projects`, `digests_dir`, `digests_index`,
`repo_intel_dir`, `repo_intel_index`, `capstone`, `final_notes`, `recall`,
`resources`, `insights`, `lessons_dir`, `topic_components_dir`, `projects_dir`,
`capstone_dir`, `cache_dir`, `repos_cache_dir`, `concepts_dir`, `tech_dir`,
`domain_map`, `home`, `pack_json`, `playbook`, `site_components`,
`components_manifest`, plus `root`, `site_url`, `open_lesson`, `topic`,
`title`, `slug`, `domain`, `subdomain`, `depth`, and `abs`.

`open_lesson` is the one sentence that says how to open the lesson:
``Run `npm run site:dev` in the repository root, then open `<site_url>` on the local address it prints.``
`next`, `00-start-here`, and the `02-lesson` scaffold print the same sentence.
Copy it; do not write another form of it.

### `next <topic>`

The unfinished stages of the lowest unfinished wave.

```bash
node harness/bin/tutor.mjs next redis-streams --json
```

```jsonc
{
  "ok": true, "topic": "…", "title": "…", "depth": "standard",
  "profile": { "lesson_pages": [5, 7], "mini_projects": 2, "digests": [2, 3], "repos": [1, 1], "capstone": true, "sources": [5, 12], "recall_cards": 8 },
  "domain": { "id": "…", "capstone_kind": "service", "default_stack": {}, "safety": [] },
  "complete": false, "wave": 1,
  "stages": [{
    "id": "research", "wave": 1, "status": "pending", "attempts": 0, "units": [], "note": "",
    "skill": "learn-research", "skill_file": ".claude/skills/learn-research/SKILL.md", "produces": "…",
    "inputs":  [{ "path": "…", "why": "…", "section": "## Trusted sources", "exists": true }],
    "outputs": [{ "path": "…", "what": "…" }],
    "targets": { "sources": [5, 12], "tier_a_min": 1 },
    "gate": "node harness/bin/tutor.mjs validate <topic> research",
    "commands": { "start": "…", "validate": "…", "done": "…" }
  }],
  "message": "Wave 1: run research, brief."
}
```

Inputs that belong to a skipped stage are left out. The inputs of `brief` are
exactly the "Inputs" of the brief skill (no rubric).

When everything is finished the output is the hand-over for the final message:

```bash
node harness/bin/tutor.mjs next retrieval-augmented-generation
```

```
Reading order of this topic (only the steps it has):
  01 brief → 02 lesson → 03 mini projects → 04 digests → 07 final notes → 08 recall cards → 09 resources
  Not part of this topic: repo-intel, capstone.

  Open the lesson   Run `npm run site:dev` in the repository root, then open `/ai-engineering/rag/retrieval-augmented-generation/` on the local address it prints.
```

```jsonc
{
  "ok": true, "complete": true, "wave": null, "stages": [],
  "reading_order": [{ "n": "01", "step": "brief", "label": "Brief", "path": "vault/…/01-brief-<slug>.md", "note": "01-brief-<slug>" }],
  "reading_order_line": "01 brief → 02 lesson → …",      // copy this into the message
  "not_part_of_topic": ["repo-intel", "capstone"],          // skipped stage ids
  "open_lesson": "Run `npm run site:dev` …",                // null when the lesson stage is skipped
  "site_url": "…", "site_dev_command": "npm run site:dev", "start_here": "…", "vault_dir": "…", "recall_command": "…"
}
```

A step whose stage is skipped is not in `reading_order`.

### `depth <topic> <quick|standard|deep>`

Changes the depth of an existing topic and prints what changed.

```bash
node harness/bin/tutor.mjs depth retrieval-augmented-generation standard
```

- `profile` is computed again for the new depth (with the domain pack).
- A stage that the old depth had skipped and the new depth has becomes
  `pending`; its note gets the normal placeholder back (only when it still
  holds the skip text), and a missing scaffold is created.
- A `pending` stage that the new depth leaves out becomes `skipped`. A stage
  that is `in_progress`, `failed`, or `done` is kept as it is and listed under
  `kept`. A stage that was skipped by hand for another reason stays skipped.
- `done` stages and the real content of existing files are never touched.
- `plan.digest_targets` and `plan.repo_targets` are moved into the new range
  when they fall outside it.
- The change is logged and the maps are regenerated.

The output also says what the new depth asks for, whether the plan now has too
few (or too many) lesson pages, and which `done` stages no longer pass their
gate at the new depth, each with the command to redo it. Nothing is reset for
you. `--json`:
`{ depth, previous, changed, profile, stages: [{ stage, from, to, why }], kept, plan: [{ key, from, to }], lesson_pages: { planned, wanted, fits }, needs_rework: [{ stage, problems, redo }], files_created, runnable, next_command }`.
Giving the depth the topic already has changes nothing (`"changed": false`).

### `plan <topic> [--set <file.json>]`

Prints the plan (`--json`: `{ topic, title, depth, profile, plan }`). With
`--set`, merges the top-level keys of the JSON file into the plan, regenerates
the maps, and reports what the intake gate still misses (`intake_gate`).
`--set -` reads standard input.

```bash
node harness/bin/tutor.mjs plan redis-streams --set .cache/tmp/redis-streams/plan.json
```

### `start <topic> <stage> [--force]`

Marks the stage `in_progress` and counts the attempt. Refuses (exit 1) when an
earlier wave is unfinished, or when the stage is already done or skipped.

```bash
node harness/bin/tutor.mjs start redis-streams research
```

### `unit <topic> <stage> add|start|done|fail <unit-id> [--handoff <path>]`

Tracks one parallel work item: `add` → `pending`, `start` → `in_progress`,
`done` → `done`, `fail` → `failed`. `--handoff` stores the path of the handoff
file. A unit that does not exist yet is created.

```bash
node harness/bin/tutor.mjs unit redis-streams digest fail redis-streams-docs --handoff state/topics/backend-engineering/messaging/redis-streams/handoffs/digest-redis-streams-docs.md
```

### `done <topic> <stage> [--force]`

Regenerates the maps, runs the gate of the stage, and marks it `done` only when
the gate passes. On failure it exits 1, prints every problem, and leaves the
status unchanged. `--force` marks it done anyway and logs that it was forced.
`done … notes` also registers the recall cards.

```bash
node harness/bin/tutor.mjs done redis-streams research
```

### `skip <topic> <stage> --reason "…"` and `fail <topic> <stage> --reason "…"`

Record an outcome. The reason is stored in the stage `note` and in the log.

```bash
node harness/bin/tutor.mjs skip redis-streams repo-intel --reason "no repository passed the source gate"
node harness/bin/tutor.mjs fail redis-streams brief --reason "gate still fails after 3 attempts"
```

### `reset <topic> <stage>`

Back to `pending`. Files and units are not touched.

```bash
node harness/bin/tutor.mjs reset redis-streams brief
```

### `validate <topic> [<stage>|--all] [--files <path>[,<path>...]]`

Runs the gate of one stage, or of every stage (the default). Read-only.
Each failure is printed as `path: problem. fix.` and, in JSON, as
`{ stage, path, problem, fix, line }`. Warnings have the same shape; they are
printed under `Warnings`, returned as `warnings`, and never change the exit code.

```bash
node harness/bin/tutor.mjs validate redis-streams lesson
node harness/bin/tutor.mjs validate redis-streams --all --json    # { failure_count, warning_count, stages: [{ stage, ok, skipped, failures, warnings }], failures, warnings }
```

`--files` is for a worker that owns one unit of the stage. It runs the same
gate, but:

- only failures (and warnings) of the listed files are reported — a path is
  either a file, or a directory that covers everything under it;
- checks of the stage as a whole are left out: the page, digest, repository,
  and project counts, the index or pointer note (unless it is listed), rules
  across all pages ("at least one animated flow"), and the "final page" check
  when the final page is not one of the files;
- a listed path that does not exist is a failure.

Paths are relative to the repository root, separated by commas (the flag may
also be repeated). The exit code is 0 when the listed files are clean. A stage
is required.

```bash
# lesson worker, unit pages-01-02
node harness/bin/tutor.mjs validate redis-streams lesson --files site/src/content/lessons/backend-engineering/messaging/redis-streams/01-what-is-a-stream.mdx,site/src/content/lessons/backend-engineering/messaging/redis-streams/02-reading-a-stream.mdx
# digest worker
node harness/bin/tutor.mjs validate redis-streams digest --files vault/backend-engineering/messaging/redis-streams/04-digests/redis-streams-docs-redis-streams.md
# project worker: the project folder
node harness/bin/tutor.mjs validate redis-streams mini-projects --files projects/backend-engineering/messaging/redis-streams/mini-01-job-queue
```

The stage runner still runs `validate <topic> <stage>` without `--files`
before `done`.

### `map [<topic>]`

Regenerates `00-start-here-<slug>.md`, `09-resources-<slug>.md`, the domain map
`vault/<domain>/<domain>.md`, and `vault/Home.md`. Without a topic: only the
domain maps and Home. Only the text between `<!-- tutor:generated:start -->` and
`<!-- tutor:generated:end -->` is replaced; everything else in the note stays.
Safe to run at any time. The CLI also runs it after every state change, and
`done` runs it before the gate.

```bash
node harness/bin/tutor.mjs map redis-streams     # --json: { written, stage_notes, backlinks: [{ note, added }] }
```

With a topic it also keeps two things in sync:

- **Backlinks of shared notes.** For every note in `vault/_concepts/` or
  `vault/_tech/` that a note of the topic links to, there is one bullet
  `- [[<linking-note>]]` per linking note under that note's
  `## Where it shows up` heading. A note that is already linked there (with or
  without an alias, with any text after it) is not added again. Lines are never
  removed. A missing heading is created above `## My insights`. Nobody writes
  these bullets by hand.
- **Notes of skipped stages.** See "Stage lifecycle": the skip text is written
  into a scaffold of a skipped stage, and the placeholder returns when the
  stage is active again. Notes with real content are left alone.

`00-start-here` shows the canonical "open the lesson" sentence and lists each
lesson page with its site path (`<site_url>lesson/<NN-page>/`).

### `sources <topic> add --file <entry.json>`, `sources <topic> list`, `sources <topic> update <id> --file <patch.json>`, `sources <topic> remove <id> --reason "..."`

`add` checks the entry (an object, or an array of objects) against the §9 shape:
all fields, known `type`, tier `A` or `B`, ISO dates, http(s) URLs, at least one
evidence value. It rejects an id or url that is already listed. Nothing is
written unless every entry is valid. `--file -` reads standard input.

```bash
node harness/bin/tutor.mjs sources redis-streams add --file .cache/tmp/redis-streams/source.json
node harness/bin/tutor.mjs sources redis-streams list --json    # { count, sources: [...] }
node harness/bin/tutor.mjs sources redis-streams remove some-weak-blog --reason "abandoned since 2021"
```

`update` corrects one entry in place. The patch is a JSON object with only the
fields to change. It is merged into the entry; `evidence` is merged one level
deep, and `null` clears an evidence value. The entry is checked again with the
same rules as `add`, and nothing is written when it fails. The entry keeps its
position, the change is logged, and `09-resources` is regenerated. The `id`
cannot be changed.

```bash
echo '{ "evidence": { "stars": null, "used_by": null }, "verified_at": "2026-11-14" }' > .cache/tmp/redis-streams/patch.json
node harness/bin/tutor.mjs sources redis-streams update redis-streams-docs --file .cache/tmp/redis-streams/patch.json
# --json: { updated, changed: ["evidence.stars", "evidence.used_by", "verified_at"], position, total, entry }
```

`remove` drops one entry by id, logs the reason, and regenerates `09-resources`.
Use these commands instead of editing `sources.json` by hand.

### `slice <dir> [--budget 60000] [--include "<glob>"] [--pack]`

Estimates tokens as characters / 4 and cuts a directory into slices of at most
`--budget` tokens: one slice per top-level directory; a directory over the
budget is split along its sub-directories. Skips `.git`, `node_modules`, `dist`,
`build`, `vendor` and similar folders, lockfiles, images, binaries, and files
over 400 KB. `--include` keeps only matching files (`*`, `**`, `?`; several
globs separated by commas). `--pack` joins small neighbouring top-level groups.
A single file over the budget becomes its own slice with `"oversized": true`.

```bash
node harness/bin/tutor.mjs slice .cache/repos/taskforcesh__bullmq --budget 60000 --json
# { dir, budget, totals: { files, tokens, slices, skipped, oversized_slices }, skipped: {…}, slices: [{ id, tokens, files: [...], covers: [...] }] }
```

### `budget <file...> [--budget 60000]`

Token estimate per file and in total, with `over_budget` set when the total is
above the budget. A directory argument is summed like `slice` would read it.

```bash
node harness/bin/tutor.mjs budget vault/backend-engineering/messaging/redis-streams/01-brief-redis-streams.md site/COMPONENTS.md
```

### `words <file>`

Prints the word count of one file exactly as the gate counts it, and the
allowed range when the file is one a gate measures. Use it instead of `wc -w`,
which also counts frontmatter, code blocks, and component props and can be
about 200 words higher.

- A lesson page (`.mdx`): prose only, as the lesson gate counts (110–260).
- A vault note (`.md`): the body above `## My insights`, without frontmatter,
  code blocks, and comments, as the note gates count. The brief has the range
  150–400, the final notes 200–600; other notes have no range.

```bash
node harness/bin/tutor.mjs words vault/ai-engineering/rag/retrieval-augmented-generation/07-final-notes-retrieval-augmented-generation.md
# vault/…/07-final-notes-retrieval-augmented-generation.md: 543 words
#   Counted: the note above "## My insights": frontmatter, code blocks, and comments are not counted (as the note gates count).
#   Allowed by the notes gate: 200–600 words. Inside the range.
```

`--json`: `{ file, kind: "lesson-page" | "vault-note", words, counted, topic, stage, range: [min, max] | null, within: true | false | null, verdict }`.
The exit code is 0 also when the count is outside the range (`validate` is the
gate); a file that does not exist is a usage error.

### `concept "<Name>" [--tech]`

Creates `vault/_concepts/<Name>.md` (or `vault/_tech/<Name>.md`) from the
template when no note with that name exists anywhere in the vault. Never
overwrites. Prints the path on the first line
(`--json`: `{ name, kind, path, created, link, requested, case_mismatch }`).

```bash
node harness/bin/tutor.mjs concept "Consumer group"
node harness/bin/tutor.mjs concept "Redis" --tech
```

- A name that differs from an existing note only by letter case does not create
  a second note: `concept "consumer Group"` prints the path of
  `Consumer group.md`, says so, and returns `"created": false, "case_mismatch": true`.
  Link to the name it prints.
- In a new note, replace the placeholder line under the title with one short
  paragraph (delete the `<!-- tutor:placeholder -->` line too).
- Leave `## Where it shows up` empty. `tutor map <topic>` (and every `done`)
  adds the backlink bullets.

### `insight <topic> --text "…" [--section "<heading>"] [--target <stage-file>]`

Appends `### YYYY-MM-DD — <first words>` plus the text to
`my-insights-<slug>.md`, under `## <section>` (default: `## General`; the section
is created when missing). With `--target`, adds a backlink bullet under
`## My insights` of that note. The target is a short name (`start-here`,
`brief`, `lesson`, `mini-projects`, `digests`, `repo-intel`, `capstone`,
`final-notes`, `recall`, `resources`) or the file name or path of a note in the
vault. Existing content is never changed. `--text -` reads standard input.

```bash
node harness/bin/tutor.mjs insight redis-streams --text "XAUTOCLAIM skips deleted entries." --section "Pending entries" --target brief
```

### `recall sync <topic>`, `recall due [<topic>]`, `recall grade <topic> <card-id> <again|hard|good|easy>`

Leitner boxes 1–8 with intervals of 1, 3, 7, 16, 35, 90, 180, 365 days.

- `sync` reads the cards of `08-recall-<slug>.md`, registers new ids in box 1
  (due today), and drops ids that are no longer in the note.
- `due` lists the cards due today or earlier, for one topic or all topics
  (`--json`: `{ date, total, next_due, cards: [{ topic, title, id, box, due, reviews, question, answer }], topics: [{ topic, due, registered, unsynced, next_due }] }`).
- `grade` moves the card: `again` → box 1, `hard` → same box, `good` → +1,
  `easy` → +2, and sets the next due date from the new box.

A card in the note:

```
<!-- card: rs-01 -->
What does XACK do?
?
Removes the entry from the group's pending list.
```

```bash
node harness/bin/tutor.mjs recall sync redis-streams
node harness/bin/tutor.mjs recall due --json
node harness/bin/tutor.mjs recall grade redis-streams rs-01 good
```

### `log <topic> ["<message>"]`

Appends a message to the topic log. Without a message it prints the last 20 entries.

```bash
node harness/bin/tutor.mjs log redis-streams "research: digest_targets lowered to 2"
```

### `doctor [--fix]`

Checks the harness itself: Node version, every domain pack and playbook,
templates, rubrics, the site and its component manifest (including whether it
lists `props`), skills, and that
`state/registry.json` matches the `topic.json` files on disk. A missing site is
a warning, not a failure. `--fix` rebuilds the registry from disk.

```bash
node harness/bin/tutor.mjs doctor
```

## Files

```
harness/
├── bin/tutor.mjs          entry point
├── lib/
│   ├── cli.mjs            command table and dispatcher
│   ├── args.mjs           argument parser
│   ├── io.mjs             file helpers, atomic writes, the state lock
│   ├── clock.mjs          dates and timestamps
│   ├── root.mjs           repository root (TUTOR_ROOT override)
│   ├── topic-store.mjs    topic.json, registry, topic addressing, topic paths
│   ├── packs.mjs          domain packs and playbooks
│   ├── stages.mjs         stage list, depth profiles, wave logic
│   ├── stage-io.mjs       inputs, outputs, targets of each stage (for `next`)
│   ├── markdown.mjs       frontmatter, word count, wikilinks, generated regions
│   ├── mdx.mjs            lesson page analysis, component attributes
│   ├── components.mjs     lesson component names by kind, and their props
│   ├── vault-index.mjs    wikilink resolution
│   ├── templates.mjs      template rendering
│   ├── scaffold.mjs       files created by `init`
│   ├── maps.mjs           start-here, resources, domain map, Home, reading order
│   ├── stage-notes.mjs    the skip text in the notes of skipped stages
│   ├── backlinks.mjs      "Where it shows up" bullets of concept and tech notes
│   ├── sources.mjs        sources.json and the §9 entry check
│   ├── insights.mjs       `insight`
│   ├── recall.mjs         card parsing and Leitner scheduling
│   ├── slicer.mjs         `slice` and `budget`
│   ├── commands/          one handler per command
│   └── validators/        one gate per stage, plus the shared note rules
├── templates/             note templates ({{placeholders}})
├── domains/<domain>/      pack.json + playbook.md
└── tests/                 node:test suites, fixtures, helpers
```

## Environment variables

| Variable | Use |
|----------|-----|
| `TUTOR_ROOT` | Use another folder as the repository root (state, vault, site, projects, `harness/domains`). Templates still come from this `harness/` folder. The tests use it to work in a temporary folder. |
| `TUTOR_NOW` | An ISO timestamp that replaces the clock, for tests. |

## Tests

```bash
npm test
```

The suites run the real CLI in a temporary `TUTOR_ROOT` with the fixture packs in
`harness/tests/fixtures/domains/`. `harness/tests/support/helpers.mjs` has
builders that write a valid artifact for every stage.
