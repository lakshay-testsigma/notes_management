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
/learn Redis Streams
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
   evaluation"). They link to each other through the shared concept notes.

5. **Redo the research of a topic.** Reset the stages you want regenerated,
   then continue. The old files stay until the stage rewrites them.

   ```bash
   node harness/bin/tutor.mjs reset redis-streams research
   node harness/bin/tutor.mjs reset redis-streams digest
   ```

## Using another agent

The skills in `.claude/skills/` load by themselves only in Claude Code. Any
other agent (Codex, Cursor, Gemini CLI, and so on) has to be told to read
them. Start it in this folder with this message:

```
Read CLAUDE.md, then .claude/skills/learn/SKILL.md, and follow that skill
exactly to generate the topic "<topic>" at depth <quick|standard|deep>.
Take every path and every next step from `node harness/bin/tutor.mjs`; never
build a path or edit state by hand. If you cannot spawn subagents, do each
worker unit yourself, one at a time, following the stage skill and the worker
file in .claude/agents/. Stop at the end of a stage when your context is more
than 40% full, and tell me to send "continue <topic>" in a new session.
```

Then repeat `continue <topic>` in new sessions until `tutor list` shows the
topic as complete. This path has been tested only with Claude Code.

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
