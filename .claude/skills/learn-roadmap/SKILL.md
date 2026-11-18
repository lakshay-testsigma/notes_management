---
name: learn-roadmap
description: Turns a whole field ("master frontend engineering end to end", "make me a backend engineer", "everything about system design") into a roadmap in the tutor harness - an ordered list of phases, sections and items, published at once as an interactive HTML checklist and an Obsidian map - and then generates the full learning package for every section, one topic at a time, in roadmap order, with every roadmap item taught. Use it whenever the learner asks to learn or master a broad field end to end, asks for a roadmap, gives a roadmap HTML or JSON file or drops a topic file in inputs/ (for example inputs/frontend.html), says "continue <roadmap>", or asks for the status of a roadmap. A request too broad for one topic (it would need more than about 60 concepts) is a roadmap, not a topic.
argument-hint: "<field> | inputs/<file> | --file <roadmap.html|roadmap.json> | continue <roadmap> | status <roadmap>"
---

# learn-roadmap — a whole field, one topic per section

One topic of the `learn` pipeline is bounded: at most 60 concepts. A field such as frontend
engineering has hundreds of items. A roadmap splits the field into sections; each section
becomes one topic; each item of a section becomes a required concept of that topic, and the
gates prove it is taught. The contract is `docs/ARCHITECTURE.md` §4.5. The CLI owns all
state: `tutor` below means `node harness/bin/tutor.mjs`, run from the repository root.

Ground rules of `learn` hold here too: no check-in questions, CLI-owned state and paths,
honest reports, the 40% context rule, and only this session spawns workers.

## Step 1 — Pick the mode

| The learner said | Mode |
|------------------|------|
| "status of <roadmap>", "how far am I" | Run `tutor roadmap status <roadmap>`, report it in plain words, stop. |
| "continue <roadmap>", or a field that already appears in `tutor roadmap list` | Go to Step 4. |
| Gave a roadmap file (HTML with `const DATA = {...}`, or JSON), or `roadmap inbox` shows one as `new` | Step 2A. |
| Gave a topic list in another format (`.md`, `.txt`, HTML without `DATA`), or `inbox` shows `needs-conversion` | Step 2C. |
| `inbox` shows `changed-since-import` | Compare the file with its stored copy (`state/roadmaps/<slug>/source.*`) by item ids only; import the new items as Step 2C with a new slug (`<slug>-v2`) and tell the learner in one line. Never overwrite a stored roadmap. |
| Named a field and gave no file | Step 2B. |

Run `tutor doctor`, `tutor roadmap inbox --json` and `tutor roadmap list --json` once per
session first. The learner's topic files live in `inputs/` (see `inputs/README.md`); a file
given elsewhere is copied there first so the next session finds it.

## Step 2A — Import a given roadmap

1. Pick the domain with `tutor domains` (frontend engineering → `frontend-engineering`).
2. Run `tutor roadmap add --file <file> --domain <domain> --slug <short-slug>`. Keep the
   default `--depth auto` unless the learner asked for one depth everywhere.
3. If it fails, the lines say which item or section is malformed. Do not edit the learner's
   file; copy it to `.cache/roadmaps/<slug>.json`, fix the copy, and add that.

## Step 2C — Convert a topic list into a roadmap

The learner's file names the topics; the harness needs roadmap JSON. Never edit the
learner's file.

1. If the file fits in 40% of your window (`tutor budget inputs/<file>`), convert it
   inline; otherwise spawn one `tutor-researcher` (fact tier) per slice from `tutor slice`,
   each writing `.cache/roadmaps/<slug>-part-<n>.json`.
2. Keep the learner's order and wording. Each heading becomes a phase or a section, each
   bullet an item, with the rules of Step 2B.2. Do not invent items; mark an item `opt` only
   when the file says it is optional. Docs URLs are verified on a live page or left out.
3. Merge into `.cache/roadmaps/<slug>.json` and run Step 2B.3.

## Step 2B — Draft a roadmap for a named field

The roadmap is the plan for every later topic, so it must be grounded, not recalled.

1. Spawn at most 3 `tutor-researcher` workers in one batch, one per part of the field
   (for example: fundamentals; frameworks and architecture; quality, delivery and career).
   Each worker verifies canonical curricula and official documentation indexes on live pages
   (for example MDN Learn, web.dev Learn, official framework docs, the field's standards) and
   writes `.cache/roadmaps/<slug>-part-<n>.json` with its phases, no prose elsewhere.
2. Merge the parts into `.cache/roadmaps/<slug>.json` with the shape in ARCHITECTURE §4.5.
   Rules for the merged roadmap:
   - Phases go prerequisites first: a phase never needs a later phase.
   - A section is one teachable topic of 2–12 items. Split a larger one.
   - Each item is one idea with a kebab-case `id` unique in the roadmap, a `title`, a `level`
     (`core` everyone must master, `adv` senior depth, `opt` survey of the ecosystem), a
     one-line `desc`, and `details` with at least one `{"key": "Docs", "value": "<verified URL>"}`.
   - Write `goal` (one sentence) and keep `intro` to three lines or fewer.
3. Run `tutor roadmap add --file .cache/roadmaps/<slug>.json --domain <domain> --slug <slug>`.

## Step 3 — Publish the roadmap first

Tell the learner right away, before any topic is generated, in three lines: the number of
phases, topics and items (`tutor roadmap status <roadmap> --json`, field `totals`), and where
to open it: `npm run site:dev`, then `/roadmaps/<slug>.html`; in Obsidian, `_roadmaps/<slug>`.
Do not wait for an answer. Continue with Step 4.

## Step 4 — Generate every section, in order

Repeat until `tutor roadmap next <roadmap> --json` returns `complete: true`:

1. Run `tutor roadmap next <roadmap> --json`. Read `next.section`, `next.topic`, `next.items`
   and `next.action`.
2. If `next.action.kind` is `create`: run `next.action.command` exactly as printed. Then run
   the `learn` skill's Step 2 (learn-intake) for that topic id, with this addition to intake:
   the items of `tutor roadmap section <roadmap> <num> --json` are required concepts (see
   "Intake for a roadmap topic" below). Then run `learn` Step 3 (the wave loop) through
   `finalize` and send `learn`'s final message for that topic, shortened to five lines.
3. If `next.action.kind` is `resume`: run `learn` in resume mode for `next.topic.id`.
4. A topic whose `intake` or `research` failed twice stops that topic: record it with
   `tutor log`, and go on to the next section only after telling the learner in one line.
   Other failures follow `learn`'s "Gates and failures"; `roadmap next` returns degraded
   sections after all others, so they are retried at the end.
5. After each topic, `tutor map <topic>` (finalize runs it) refreshes the roadmap HTML and
   vault map; nothing else needs to be written.

Run one topic at a time through its writer stages: the roadmap is linear, and a later
section may build on an earlier one. To save time, overlap only the fact work of the next
section:

- When the current topic has finished wave 2 (its digests and repo notes exist) and
  `tutor roadmap next <roadmap> --json` returns a non-null `lookahead`, run its
  `init_command`, then that topic's intake and `research` stage in the free worker slots of
  the current wave. Stop the lookahead topic after `research` is done; its `brief` and later
  waves start only when the current topic is finalized.
- Inside one phase lane at most two topics are active (the CLI returns `lookahead: null`
  otherwise), and the worker limit of `learn` counts the workers of both together.
  Different phases run in parallel lanes: see `notes-management` "Parallel phases" and
  `tutor roadmap phases <roadmap>`.
- Intake of the lookahead topic maps prerequisites against the current topic's plan, not
  its unfinished notes.

Workers inside one topic follow `learn`'s limits, model tiers and spawn caps.

Context: a roadmap is long (`inputs/frontend.html` has over 100 topics). One session
finishes at most two topics, then hands off; never carry earlier topics' worker returns
forward. After each finished topic, write a three-line handoff with
`tutor log <topic> "ROADMAP <roadmap>: section <num> done; next <num>"`. After compaction,
reload this skill and run `tutor roadmap next <roadmap>`; never rely on memory for the
position. If the host cannot continue, tell the learner to say `continue <roadmap>`.

## Intake for a roadmap topic

Everything in `learn-intake` applies, plus:

- Read the items with `tutor roadmap section <roadmap> <num> --json`. Do not read the whole
  roadmap.
- `plan.curriculum` is required. Every item becomes, or is merged into, an `included` concept
  whose `roadmap_items` lists the item id. One concept may cover two close items; no item may
  be left out, deferred or excluded.
- `core` items: concept importance `core` or `critical`. `adv` items: complexity
  `intermediate` or `advanced`; this makes the adaptive visual gate require a visual lesson
  for them. Hard mechanisms (rendering pipeline, event loop, caching layers, auth flows) get
  `critical` importance and an interactive or video experience through `learn-visuals`.
- Set `max_concepts` to at least the number of items plus the root concepts.
- The lesson outline must reach every item: each concept's coverage will point to a lesson
  page or a supplementary concept note with its `<!-- concept: <id> -->` marker at finalize.
- Use the item `desc` and `details` (tools, docs, practice, self-check) as starting points for
  research, practice activities and recall cards. They are not sources: only sources added
  with `tutor sources add` after live verification may be cited.

`tutor plan <topic> --set` prints the intake gate; every line that starts with `roadmap:` must
be gone before `tutor done <topic> intake`.

## The final message for the whole roadmap

When `roadmap next` returns `complete: true`, send:

```text
Your <roadmap title> roadmap is complete: <N> topics, <N> items, every item taught.
Open the checklist: run `npm run site:dev`, then open /roadmaps/<slug>.html.
In Obsidian: start at _roadmaps/<slug>; each section links to its 00-start-here note.
Not finished: <"nothing", or each degraded section with its topic id and failed stages>.
Say "quiz me" any time for a recall session across all of it.
```
