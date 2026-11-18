# Personal AI Tutor + Note-Taker

Tell Claude a topic. It researches it, teaches it through an interactive site,
gives you projects to build, studies how a real company implements it, and leaves
you with short notes and recall cards you can come back to a year later.

Everything lives in this repository, in the same place for every topic.

## How to use it

Open this folder in Claude Code and talk to it. `CLAUDE.md` loads the tutor workflow.
The project defaults to Claude Opus for orchestration and writing (lesson pages,
experiences, review), and Claude Sonnet for research and extraction. See
[Claude setup](USAGE.md#using-claude-code-default).

| You say | What happens | Skill |
|---------|--------------|-------|
| `teach me Redis Streams` or `/learn Redis Streams` | The whole pipeline runs for that topic, start to finish. | `learn` |
| `/learn Kafka --depth deep` | Same, with more lessons, more digests, more repositories. | `learn` |
| `continue redis-streams` | Picks up where the last session stopped. | `learn` |
| `add this to my Redis Streams notes: ...` | Your own learning is saved, dated, and linked to the related note. | `learn-insight` |
| `quiz me` or `what's due` | A recall session on the cards that are due today. | `learn-recall` |
| `draw the write path of Raft` or `make a diagram of X` | A sourced diagram, registered once, shown on the site and in Obsidian. | `learn-visuals` |
| `master frontend engineering end to end`, or `learn inputs/frontend.html` (any topic file dropped in `inputs/`) | A roadmap of the whole field is published first (interactive checklist at `/roadmaps/<slug>.html`, map in Obsidian). Then every section is generated as its own topic, in order, and every roadmap item must be taught before a topic can finish. | `learn-roadmap` |
| `make a short video of how OAuth works` | A 30–90 s HyperFrames explainer with captions and transcript (MP4 when FFmpeg or Docker is available). | `learn-video` |
| `let me experiment with binary search` or `compare the funnel strategies` | The experience that fits: an interactive video lesson with predictions and a stepper, a branching deck of deep dives, or a hybrid lab (chosen automatically, see `harness/rubrics/experiences.md`). | `learn-video` |

Depth is a dial:

| Depth | Lesson pages | Mini projects | Digests | Repositories | Capstone |
|-------|--------------|---------------|---------|--------------|----------|
| `quick` | 3–4 | 1 | 1–2 | none | no |
| `standard` (default) | 5–7 | 2 | 2–3 | 1 | yes |
| `deep` | 8–12 | 3 | 4–6 | 2–3 | yes |

## Reading a topic

Each topic is read in the same numbered order:

1. **Brief** — what it is, in plain words
2. **Lesson** — the interactive pages: diagrams you can zoom, simulations you can break
   (add or fail servers, raise latency, step through an algorithm, run code), short
   narrated explainer videos with captions, interactive experiences (Watch, Explore,
   Guided, Deep dive and Practice tabs with predictions and experiments), small
   activities, and a depth control (Essentials / + Internals / + Production)
3. **Mini projects** — small real use cases, each with a starter and a solution
4. **Digests** — the canonical papers and docs, summarized
5. **Open-source deep dive** — how a production repository really does it
6. **Capstone** — a production-style project with a clear class-based architecture
7. **Final notes** — the one page to re-read later
8. **Recall** — flashcards with spaced review
9. **Resources** — the vetted sources, and why each one is trusted

Two ways to read:

- **The site** (best for learning): `npm --prefix site install` once, then
  `npm run site:dev`, and open the address it prints. Home → domain → topic →
  follow "next" from page to page.
- **Obsidian** (best for the knowledge graph): open the `vault/` folder as a vault.
  Start at `Home`, open a topic's `00-start-here` note. Every diagram, simulation and
  video of a topic is also in its `visuals/` folder (`visuals-<topic>`), with the
  concept it teaches, its sources, a check question and the video transcript.

## Where everything is

Four folders hold your content. All four use the same sub-path,
`<domain>/<subdomain>/<topic>`, so a topic is always at the same address.

```
notes_management/
│
├── vault/                         YOUR NOTES — open this folder in Obsidian
│   ├── Home.md                    list of every domain and topic
│   ├── _concepts/                 one note per idea shared between topics
│   ├── _tech/                     one note per technology or external service
│   └── <domain>/
│       ├── <domain>.md            map of this domain
│       └── <subdomain>/<topic>/
│           ├── 00-start-here-<topic>.md     the topic map, read this first
│           ├── 01-brief-<topic>.md
│           ├── 02-lesson-<topic>.md         index of the lesson pages
│           ├── 03-mini-projects-<topic>.md
│           ├── 04-digests/                  one note per paper or doc
│           ├── 05-repo-intel/<org>-<repo>/  the open-source deep dive
│           ├── 06-capstone-<topic>.md
│           ├── 07-final-notes-<topic>.md
│           ├── 08-recall-<topic>.md
│           ├── 09-resources-<topic>.md
│           └── my-insights-<topic>.md       your own additions
│
├── site/                          THE LESSON SITE (Astro)
│   ├── src/content/lessons/<domain>/<subdomain>/<topic>/NN-<page>.mdx
│   ├── src/components/learn/      shared interactive components
│   ├── src/components/topics/     components written for one topic
│   └── COMPONENTS.md              reference for every component
│
├── projects/                      CODE YOU BUILD
│   └── <domain>/<subdomain>/<topic>/
│       ├── mini-01-<name>/        README.md, starter/, solution/
│       └── capstone/              README.md, ARCHITECTURE.md, docs/adr/, src/, tests/
│
├── state/                         PROGRESS (managed by the tutor, do not edit)
│   ├── registry.json
│   └── topics/<domain>/<subdomain>/<topic>/topic.json, sources.json
│
├── harness/                       THE ENGINE
│   ├── bin/tutor.mjs              the `tutor` command line tool
│   ├── domains/<domain>/          pack.json + playbook.md: how each domain is taught
│   ├── rubrics/                   quality rules: sources, lesson pages, vault notes
│   └── templates/                 note templates
│
├── .claude/
│   ├── skills/                    one skill per step of the workflow
│   └── agents/                    the worker subagents
│
├── docs/ARCHITECTURE.md           how the harness works, in full
└── CLAUDE.md                      rules every Claude session here follows
```

Domains: `frontend-engineering`, `backend-engineering`, `system-design`, `devops`,
`ai-engineering`, `core-ai`, `data-engineering`, `data-analytics`,
`mobile-development`, `game-development`, `security`, and `general` for anything
else (marketing, business, math).

Example: Redis Streams is `backend-engineering/messaging/redis-streams` in
`vault/`, in `site/src/content/lessons/`, in `projects/`, and in `state/topics/`.

## How a topic is generated

The order of generation is not the order of reading. Research comes first so that
every later page is based on real, verified sources.

| Wave | Stage | Skill | What it writes |
|------|-------|-------|----------------|
| 0 | intake | `learn-intake` | domain, depth, prerequisites, the plan |
| 1 | research | `learn-research` | vetted sources |
| 1 | brief | `learn-brief` | 01 brief |
| 2 | digest | `learn-digest` | 04 digests |
| 2 | repo-intel | `learn-repo-intel` | 05 open-source deep dive |
| 3 | lesson | `learn-site` | 02 lesson pages |
| 3 | mini-projects | `learn-projects` | 03 mini projects |
| 4 | capstone | `learn-capstone` | 06 capstone |
| 5 | notes | `learn-notes` | 07 final notes, 08 recall cards |
| 5 | finalize | `learn` | checks everything, builds the site |

Stages in the same wave run in parallel on up to 5 subagents. Each subagent gets
one small unit of work so that it never fills more than 40% of its context; when a
unit turns out too large it hands off to a fresh subagent.

## Checking progress yourself

```bash
node harness/bin/tutor.mjs list                  # every topic and how far it is
node harness/bin/tutor.mjs status <topic>        # the stages of one topic
node harness/bin/tutor.mjs next <topic>          # what runs next
node harness/bin/tutor.mjs validate <topic> --all
node harness/bin/tutor.mjs recall due            # cards due today
node harness/bin/tutor.mjs doctor                # is the harness healthy
```

Step-by-step usage, deeper research, other agents: [USAGE.md](USAGE.md).
All commands: [harness/README.md](harness/README.md).
Full design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

For a retained-artifact verification run, use `node harness/bin/tutor.mjs rerun <topic>`.
Run `check` for research/projects/finalize, import authored child order with `order`, record
independent reviews with `review`, then `done`. Plain `validate --all` checks readiness;
`--structure-only` is an authoring diagnostic. Browser recall history can be exported and
imported once with `tutor recall import <topic> --file recall-events.json`.


New generation follows [evidence-led research](docs/RESEARCH-WORKFLOW.md): a bounded
recursive concept map, source-to-note coverage, deeper per-concept notes, adaptive
visuals for a developer learner, and fresh isolated reviews. This works through
host capabilities and explicit skill files rather than a hardcoded model provider.
See [using another model](USAGE.md#using-deepseek-or-another-modelhost).
