---
name: learn-intake
description: Runs the intake stage of the tutor pipeline - classifies a new topic into a domain and subdomain, picks the depth (quick, standard, deep), creates the topic with `tutor init`, maps prerequisites against what the learner already studied, and writes the full learning plan (outcomes, lesson outline with a visual and an activity per page, mini projects, digest and repository targets, capstone). Use this skill whenever a topic does not exist yet and the learn orchestrator needs it created, whenever stage `intake` must run or be redone, and whenever the learner asks to re-plan or change the depth of a topic.
argument-hint: "\"<Topic title>\" [--depth quick|standard|deep]"
---

# learn-intake — stage `intake`

Intake decides what the whole pipeline will build. Every later stage reads the plan you write
here and follows it without re-deciding, so a vague plan produces vague lessons. Be specific.

`tutor` means `node harness/bin/tutor.mjs`, run from the repository root. `<topic>` is the full
topic id `<domain>/<subdomain>/<slug>`.

Explicit learner-named papers and repositories go in `plan.requested_sources` as
`{name,url,use_for}` before delegation. Research must vet each URL or record
`resolution: "rejected"` and a reason in that entry; never silently substitute it.
Pass this list to every relevant research worker.

## When to use

- The `learn` orchestrator found that the topic is not in `tutor list`.
- `tutor next` lists stage `intake` (for example after `tutor reset <topic> intake`).

Intake is always run inline by the orchestrator session, never by a worker. It is the one
stage that starts itself, because the topic does not exist until `tutor init` has run.

## Inputs

Read only these. Nothing here needs a web search unless you do not know what the topic is.

1. The learner's request: the topic title, and the depth if they gave one.
2. `node harness/bin/tutor.mjs domains --json` — the domain packs and their subdomains.
3. `node harness/bin/tutor.mjs list --json` — the topics that already exist, with progress.
4. `ls vault/_concepts` — the names of the shared concept notes (names only; do not open them).
5. After you chose the domain: `harness/domains/<domain>/pack.json` (whole file, it is short)
   and three headings of `harness/domains/<domain>/playbook.md`:
   `## How this domain is learned`, `## Lesson recipes`, and `## Safety and ethics`.
   Find the headings with `grep -n '^## ' harness/domains/<domain>/playbook.md`, then read
   only those line ranges with the Read tool (`offset` and `limit`).
6. `site/components.manifest.json` — the list of component names by kind. If it is missing,
   use the names in `references/plan-template.md`.
7. After `tutor init`: `node harness/bin/tutor.mjs paths <topic> --json` and
   `node harness/bin/tutor.mjs status <topic> --json` (to see which stages this topic has).

## Steps

1. **Check that the topic is new.** Look for the title or its slug in the `tutor list`
   output.
   - It does not exist: continue with step 2.
   - It exists and its `intake` stage is `done`: stop here and tell the orchestrator to
     resume that topic id. When the learner asked for another depth of that topic, the
     orchestrator first runs `node harness/bin/tutor.mjs depth <topic> <depth>` (never
     `init` again); if the plan is then too small for the new depth, extend it with steps
     7 and 8 below.
   - It exists and its `intake` stage is `pending`, `in_progress`, or `failed` (a rerun):
     keep its domain, subdomain, depth, and slug, skip steps 2–4 and the `init` command of
     step 5, and continue from the `start` command (skip `start` too when the stage is
     already `in_progress`).

2. **Check for ambiguity.** Ask the learner one short question only when the same name means
   different subjects in different fields (for example "transformers" is a machine learning
   architecture and an electrical device; "streams" could be Redis, Kafka, Java, or Node.js).
   In every other case decide yourself. The learner asked for an autonomous run, and a wrong
   small assumption is cheaper than an interruption.

3. **Choose the domain and subdomain.**
   - Pick the domain whose description fits the topic best. Use `general` for anything that
     is not engineering (marketing, business, mathematics, writing).
   - Inside the domain, prefer an existing subdomain: look at each subdomain's `examples`.
   - Create a new subdomain only when none fits. Name it in kebab-case, one or two words, as
     a category that could hold several topics (`vector-search`, not `pinecone-indexes`).

4. **Choose the depth**, unless the learner gave one.

   | Depth | Choose it when | Examples |
   |-------|----------------|----------|
   | `standard` | Default. Use it whenever you are unsure. | Redis Streams, JWT authentication, function calling |
   | `quick` | The topic is one narrow concept, command, or algorithm that fits one sitting. | Bloom filter, CORS, the XACK command |
   | `deep` | The learner asked for it ("in depth", "master", "everything about"), or the playbook heading "How this domain is learned" names the topic as a core pillar. | Kubernetes, React, SQL |

   The playbook's "Choosing depth" list decides when this table and the playbook disagree.
   A depth the learner gave always wins, also when the playbook suggests a deeper one. In
   that case the outline cannot hold every idea, so keep these items of the playbook's
   list "Cutting a topic into lesson pages": 1, 2, 3, and 7 (the problem, the model, the
   smallest working version, production use); with only 3 pages keep 1, 2, and 7. Drop the
   others, and name the dropped ideas in the `tutor log` line of step 8. Never squeeze two
   of them into one page.

5. **Create the topic.** Write the title the way the field writes it ("Redis Streams",
   "Retrieval-Augmented Generation (RAG)"). The slug is the title in kebab-case without an
   acronym in parentheses (`retrieval-augmented-generation`, not
   `retrieval-augmented-generation-rag`); always pass it with `--slug`.

   ```bash
   node harness/bin/tutor.mjs init "<Title>" --domain <domain> --subdomain <subdomain> --depth <depth> --slug <slug> --json
   node harness/bin/tutor.mjs start <topic> intake
   node harness/bin/tutor.mjs paths <topic> --json
   node harness/bin/tutor.mjs status <topic> --json
   ```

   `init` is idempotent, so running it twice is safe. From `status`, note whether the stages
   `repo-intel` and `capstone` exist for this topic; the domain pack or the depth may have
   removed them.

6. **Map the prerequisites.** List the 2–5 concepts a beginner must already understand to
   follow this topic. For each one:
   - Set `known: true` only on evidence: `tutor list` shows a finished topic that teaches it,
     or the learner said they know it. A note in `vault/_concepts` alone is not evidence,
     because concept notes are also created for things the learner has only seen mentioned.
   - If `vault/_concepts` already has a note for the concept, use exactly that name as the
     `concept` value, so the brief links to the existing note instead of creating a twin.
     A new name is written in sentence case and singular ("Message queue", "Dense
     retrieval"), not with every word capitalised.
   - For every prerequisite with `known: false`, write a `bridge`: one plain sentence of
     at most 12 words that gives just enough to continue ("A hash function turns any input
     into a fixed-size number."). For known ones, set `bridge` to an empty string. The
     brief copies every bridge and every outcome and has a hard limit of 400 words, so
     long ones make the brief fail its gate.

7. **Write the plan** to `.cache/tmp/<slug>/plan.json` (run `mkdir -p .cache/tmp/<slug>`
   first). Use exactly the shape in "Output contract" and the sizing rules below. A complete
   filled example and the component chooser are in `references/plan-template.md`; read it
   before writing your first plan.

   | Field | Rule |
   |-------|------|
   | `summary` | One sentence: what the topic is and what it is for. No jargon that is not in the prerequisites. |
   | `outcomes` | 3–6 items, each at most 15 words. Each starts with a verb and can be checked. Include at least one of each kind: explain ("Explain why…"), build ("Build a…"), decide ("Decide when to use… instead of…"). Every outcome must be taught by at least one page of `lesson_outline` or one mini project; do not promise a comparison ("…instead of fine-tuning") that no page explains. |
   | `lesson_outline` | `quick` 3–4 pages, `standard` 5–7, `deep` 8–12. One idea per page. Page 1 answers "what is it and why does it exist". The last page shows it in real production use. `order` counts from 1 without gaps; `slug` is kebab-case and unique. |
   | `visual` / `activity` | One of each per page, chosen from the playbook's "Lesson recipes"; fall back to the chooser in the reference file. Across the topic, use `FlowAnimation` at least once, use `Graph3D` or `VectorSpace3D` at least once when the topic has graph or spatial structure, and do not use the same activity on every page. |
   | `mini_projects` | `quick` 1, `standard` 2, `deep` 3. Each `use_case` names who needs it and for what ("A shop's order service hands slow email sending to a background worker"). Each one exercises at least one outcome and fits 1–3 hours. |
   | `digest_targets` | `quick` 1–2, `standard` 2–3, `deep` 4–6. Choose the low end unless you can name that many defining sources. |
   | `repo_targets` | `quick` 0, `standard` 1, `deep` 2–3. Use 0 when the topic has no `repo-intel` stage. |
   | `capstone` | A `name` and the real `problem` it solves, in the form the pack's `stages.capstone.kind` asks for (a service, a model, a campaign). When the topic has no `capstone` stage, still fill it in as the natural next project; it will not be generated. |

   If `pack.json` has `depth_overrides` for this depth, its numbers replace the ones above.

8. **Store the plan and regenerate the map.**

   ```bash
   node harness/bin/tutor.mjs plan <topic> --set .cache/tmp/<slug>/plan.json
   node harness/bin/tutor.mjs map <topic>
   node harness/bin/tutor.mjs log <topic> "intake: domain=<domain>/<subdomain>, depth=<depth>. Assumptions: <each decision you made for the learner>"
   ```

9. **Gate** (next section), then return the topic id to the orchestrator.

## Output contract

- `plan` inside `topic.json`, stored only through `tutor plan --set`. Exactly these keys:

  ```json
  {
    "summary": "one sentence",
    "prerequisites": [{ "concept": "Redis basics", "known": false, "bridge": "one line" }],
    "outcomes": ["Explain ...", "Build ...", "Decide ..."],
    "lesson_outline": [
      { "order": 1, "slug": "what-is-a-stream", "title": "What is a stream?", "visual": "FlowAnimation", "activity": "PredictReveal" }
    ],
    "mini_projects": [{ "n": 1, "slug": "job-queue", "use_case": "..." }],
    "digest_targets": 3,
    "repo_targets": 1,
    "capstone": { "name": "...", "problem": "..." }
  }
  ```

- `00-start-here-<slug>.md` in the vault, generated by `tutor map`. Do not write it by hand.
- One `tutor log` entry with the domain, the depth, and your assumptions.

Do not add keys to the plan. Other skills and the validator read this exact shape.

## Gate

```bash
node harness/bin/tutor.mjs validate <topic> intake
node harness/bin/tutor.mjs done <topic> intake
```

The gate checks that the plan has a summary, prerequisites, outcomes, and a lesson outline
whose page count fits the depth. When it fails, each line reads `path: problem. fix.` Correct
those fields in `.cache/tmp/<slug>/plan.json`, run `tutor plan <topic> --set` again, and rerun
the gate. After 3 failed attempts, run
`node harness/bin/tutor.mjs fail <topic> intake --reason "<the remaining lines>"` and stop the
pipeline, because nothing can be built without a plan.

## Context budget

- Intake is a single unit and is small: about 5,000 tokens of reading. The 60,000-token
  reading budget is never close, as long as you read the three playbook headings and not
  the whole playbook, and do not open concept notes or other topics.
- You may make at most 2 narrow web searches, and only when you do not know what the topic
  is. Sources are found in the `research` stage, not here.
- Write as you go: create `plan.json` as soon as the outline is decided, then refine it.
- If you are interrupted, the state is still consistent: `tutor init` has run and the stage
  is `in_progress`. If you must stop, write
  `<state>/handoffs/intake-plan.md` with the headings Done / Remaining / Next step.
- If a worker ever runs this skill, it returns at most 150 words in this format, or the single
  line `CONTINUE: <handoff path>`:

  ```text
  STAGE: intake  UNIT: plan  STATUS: done | failed
  FILES: <state path>/topic.json (plan), <vault path>/00-start-here-<slug>.md
  FINDINGS:
  - topic id, depth, number of lesson pages
  - prerequisites marked unknown
  - capstone name
  PROBLEMS: none | <what is missing and why>
  ```

## Common mistakes

- **Asking the learner to confirm the plan.** The run is autonomous. Log the assumption and
  continue.
- **A page that holds two ideas** ("Consumer groups and acknowledgements"). Split it; a page
  has 110–260 words of prose, which is room for one idea.
- **Outcomes that cannot be checked** ("Understand streams"). Rewrite with explain, build, or
  decide.
- **An outcome that no page or project teaches**, or an outcome longer than 15 words, or a
  bridge longer than 12 words. The first is found by the verifier at the very end; the
  other two make the brief fail its word limit.
- **Component names that do not exist.** Use only names from the manifest. A misspelled name
  breaks the lesson stage three waves later.
- **Marking a prerequisite as known because a concept note exists.** Only a finished topic or
  the learner's own words count.
- **Creating a new subdomain that duplicates an existing one** (`queues` next to `messaging`).
- **Editing `topic.json` directly.** Always go through `tutor plan --set`.
- **Choosing `deep` because the topic sounds important.** Deep costs several times more work.
  Use it only on the two conditions in step 4.
