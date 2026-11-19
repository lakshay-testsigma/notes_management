# Usage

How to generate the notes for one topic, step by step. The overview of the
repository is in [README.md](README.md).

## 1. Set up once

```bash
npm --prefix site install            # the lesson site's packages
node harness/bin/tutor.mjs doctor    # must end with 0 failures
```

You need Node22.23.4 or newer, and an agent that can run shell commands, write
files, and search the web. The research step checks every source on a live
page, so it cannot pass without web access.

## 2. Generate a topic

Open this folder in Claude Code and send one message:

```
teach me Redis Streams
```

"teach me Redis Streams" and "generate the notes for Redis Streams" do the
same. The agent then works alone, with no questions, in this order:

| Step | What the agent does | What you get |
|------|---------------------|--------------|
| 1 | Picks the domain and depth, writes the plan | the topic folders |
| 2 | Finds sources and verifies each one live | `09-resources` |
| 3 | Writes the short description | `01-brief` |
| 4 | Summarizes the key papers and docs | `04-digests/` |
| 5 | Studies a production repository | `05-repo-intel/` |
| 6 | Builds the interactive lesson pages | `02-lesson` and the site pages |
| 7 | Builds the mini projects | `03-mini-projects` and `projects/…/mini-NN-…` |
| 8 | Builds the capstone project | `06-capstone` and `projects/…/capstone` |
| 9 | Writes the final notes and recall cards | `07-final-notes`, `08-recall` |
| 10 | Runs every check, builds the site, has a reviewer read it | a finished topic |

Steps 5 and 8 run only at depth `standard` or `deep`.

## 2b. Learn a whole field from a roadmap

For a field too big for one topic, send one message:

```
/learn-roadmap frontend engineering end to end
```

or drop a topic file in `inputs/` (roadmap HTML with `const DATA = {...}`, roadmap JSON, or a
plain `.md`/`.txt` list of topics) and say:

```
learn inputs/frontend.html
```

`node harness/bin/tutor.mjs roadmap inbox` shows every file in `inputs/` and whether it is
new, imported, changed since import, or needs conversion (see `inputs/README.md`).

The agent runs `tutor roadmap add`, which writes the interactive checklist
(`npm run site:dev`, then `/roadmaps/<slug>.html`) and `vault/_roadmaps/<slug>.md`
before anything else. Then it generates one topic per section, in order. Each roadmap
item is a required concept: intake fails until every item is mapped to an included
concept, and finalize fails until each one is covered. `adv` items get a visual lesson.

```bash
node harness/bin/tutor.mjs roadmap status <roadmap>   # topics ready, items covered
node harness/bin/tutor.mjs roadmap next <roadmap>     # the next section and its init command
```

Say `continue <roadmap>` to resume. A roadmap is large (inputs/frontend.html: 107 topics,
707 items), so it runs over many sessions (at most two topics per session); the position is
always on disk. While one topic writes its lessons, the next topic's research already runs
in free worker slots (`lookahead`), so at most two topics are active at once.

Cost and quality: research, digests, repository analysis, projects and gap audits run on
the cheaper model tier; lesson pages, experiences, the brief, the final notes and the
review run on the stronger one. After the notes, one or two audit rounds look for missed
subtopics and add them before the final review.

## 3. If the session stops halfway

Progress is saved on disk after every step. Open a new session and send:

```
continue redis-streams
```

To see where a topic stands yourself:

```bash
node harness/bin/tutor.mjs list
node harness/bin/tutor.mjs status redis-streams
```

## 4. Read the result

```bash
node harness/bin/tutor.mjs next redis-streams   # prints the reading order
npm run site:dev                                # the lesson site
```

Open the address the site prints, then Home → domain → topic. For the notes
and the graph, open the `vault/` folder in Obsidian and start at
`00-start-here-<topic>`.

Every new topic is visual-first: several sourced diagrams, at least one
simulation for an advanced idea, and a short video for each real sequence (a
request lifecycle, an algorithm over time, a funnel). Check what the machine can
render once:

```bash
node harness/bin/tutor.mjs video tools          # HyperFrames via npx; FFmpeg or Docker; local voice
node harness/bin/tutor.mjs visuals redis-streams list
node harness/bin/tutor.mjs video redis-streams render <id>   # render a storyboard later
node harness/bin/tutor.mjs style <file>          # writing-standard report
```

Without FFmpeg and without a running Docker daemon, videos are delivered as
storyboards with captions and transcripts, and the final message says so.
`brew install ffmpeg` (or starting Docker) and `tutor video <topic> render <id>`
turns them into MP4s; nothing is rendered twice for an unchanged storyboard.

Ideas that need practice get an interactive experience instead of a passive
video. The engine decides per idea: an explainer when following is enough, an
interactive lesson (pause-and-predict, a simulation, clickable inspection) when
experimenting matters, a branching deck when several decisions are valid, and a
hybrid lab only for genuinely complex topics.

```bash
node harness/bin/tutor.mjs experience redis-streams plan     # mode per page, cost, why
node harness/bin/tutor.mjs experience redis-streams list
node harness/bin/tutor.mjs deck redis-streams present <id>   # present a deck live
```

On a lesson page, practice in the Practice tab, choose **Export progress**, then
feed the results to your recall cards:

```bash
node harness/bin/tutor.mjs experience redis-streams progress --file ~/Downloads/progress-redis-streams-<id>.json
```

Interactive experiences play HyperFrames compositions in the browser, so they
work without FFmpeg or Docker.

## 5. Add your own learnings

```
add this to my Redis Streams notes: XAUTOCLAIM skips entries that were deleted
```

Your text is saved with the date under `## My insights`. The agent never
overwrites that part.

## 6. Review later

```
quiz me
```

This asks the recall cards that are due today and records how you did.

## Getting deeper research

1. **Ask for depth `deep`.** `/learn Kafka --depth deep`

   | Depth | Lesson pages | Mini projects | Digests | Repositories | Capstone |
   |-------|--------------|---------------|---------|--------------|----------|
   | `quick` | 3–4 | 1 | 1–2 | none | no |
   | `standard` (default) | 5–7 | 2 | 2–3 | 1 | yes |
   | `deep` | 8–12 | 3 | 4–6 | 2–3 | yes |

   A `deep` run starts many subagents (up to 5 at once) and takes much longer.

2. **Upgrade a topic you already have.** `/learn redis-streams --depth deep`
   keeps the finished work and runs only what the new depth adds.

3. **Name what you want studied.** Put the paper or repository in the request:
   `/learn Kafka --depth deep, digest the original Kafka paper and study apache/kafka`.
   It is still checked against the source rules and dropped if it fails them.

4. **Split a large subject.** One topic holds at most 12 sources. For more
   coverage, run narrower topics ("RAG chunking", "RAG reranking", "RAG
   evaluation"). They link to each other through shared concept notes. The recursive discovery
   queue in docs/RESEARCH-WORKFLOW.md records which branches still need their own topics.

5. **Redo the research of a topic.** Reset the stages you want regenerated,
   then continue. The old files stay until the stage rewrites them.

   ```bash
   node harness/bin/tutor.mjs reset redis-streams research
   node harness/bin/tutor.mjs reset redis-streams digest
   ```

## Using Claude Code (default)

Open this repository in Claude Code, or run `claude` from its root. `CLAUDE.md`
and the `learn` skills load automatically. Run the orchestrator session on MiMo V2.6 Pro
(`/model MiMo V2.6 Pro`); it writes the inline brief and notes. The eight worker roles in
`.claude/agents/` declare their own model:

| Tier | Claude model | Work |
|------|--------------|------|
| fact | `MiMo V2.6 Flash` | Research, digests, repo analysis, projects, coverage audits |
| writer | `MiMo V2.6 Pro` | Lessons, experiences, videos, independent reviews |

To resume the existing frontend roadmap, send:

```text
Continue the frontend roadmap from tutor CLI state using the learn-roadmap skill.
Preserve existing notes and recall history.
```

## Using Codex (optional)

`.codex/config.toml` and `.codex/agents/*.toml` keep a Codex mapping (fact →
`gpt-6-luna`, writer and orchestrator → `gpt-6.1-sol`). Codex reads `AGENTS.md`;
the native roles load their shared instructions from `.claude/agents/`. Config format:
[official OpenAI configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
and [native subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Using DeepSeek or another model/host

The workflow is provider-neutral. Select an actual model offered by your host;
the harness does not choose provider ids or reasoning settings. A cheaper model
gets the same research, evidence, visual and review requirements. Read the detailed
[research workflow](docs/RESEARCH-WORKFLOW.md) for recursive discovery and budgets.

Codex reads `AGENTS.md`; the runbook explicitly loads the shared `.claude` skills.
In another host, start in this folder:

```text
Read docs/ARCHITECTURE.md, then CLAUDE.md, AGENTS.md, and
.claude/skills/learn/SKILL.md. Follow docs/RESEARCH-WORKFLOW.md to generate
"<topic>" at depth <quick|standard|deep>. I am a software developer;
bridge unfamiliar domain concepts. Use recursive concept discovery,
vetted sources, six-aspect notes, adaptive visuals and fresh isolated
reviewers. Use tutor CLI state/paths; preserve notes and recall history.
Use this host's fresh-worker API and load each assigned role explicitly.
```

New plans record learner experience, a bounded concept tree/discovery log and
adaptive visual decisions. The research stage investigates children recursively,
checks claim support and declares its stopping boundary. Important hard concepts
get meaningful interactive lessons; simple familiar ideas may use prose and code.
Supplementary concept notes hold deeper mechanisms, practical uses, trade-offs,
failures and exercises. They appear in Obsidian and the site's More notes section.

Broad subjects split into scoped topics when their source budget is exceeded.
The orchestrator keeps the remaining topic queue in handoffs and reports deferrals;
a finite research pass never means every internet concept has been found.

Fresh worker isolation is required for independent review. When the host lacks it,
generation can continue serially, but completion remains pending until another
fresh session performs the reviews. Resume from `tutor next <topic>` rather than
copying an old conversation. Use `tutor review <topic> --json` for the current
fingerprint and exact review checks. Host/model-specific quality is not guaranteed.

## When something goes wrong

```bash
node harness/bin/tutor.mjs doctor --fix                 # repair the registry
node harness/bin/tutor.mjs validate redis-streams --all # which check fails, and the fix
node harness/bin/tutor.mjs reset redis-streams lesson   # run one stage again
```

All commands: [harness/README.md](harness/README.md).

For a retained-artifact verification run, use `node harness/bin/tutor.mjs rerun <topic>`.
Run `check` for research/projects/finalize, import authored child order with `order`, record
independent reviews with `review`, then `done`. Plain `validate --all` checks readiness;
`--structure-only` is an authoring diagnostic. Browser recall history can be exported and
imported once with `tutor recall import <topic> --file recall-events.json`.


## Remove topics you no longer want

Ask the agent explicitly to remove the named topics, or preview the exact package
paths yourself with `node harness/bin/tutor.mjs remove <topic>`. Add `--delete`
to apply. Multiple topic ids can be removed in one invocation. This deletes those
notes, insights, recall history, lessons and projects. Shared reference notes,
cached research and external review files are retained unless you separately ask
to clean them up. A regular continue or rerun preserves existing learning material.
