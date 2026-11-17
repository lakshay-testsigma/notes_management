# Vault notes rubric

How every note in the Obsidian vault is written (ARCHITECTURE.md §10 and §11). Read by every stage that writes into `vault/` and by the verifier.

The vault is the learner's long-term memory. A note is good when the learner can open it a year later, understand it without the other notes, and follow its links to exactly one related idea at a time.

## Frontmatter

Every note starts with this block. `tutor init` and `tutor concept` create it; keep it and fill it.

```yaml
---
title: Redis Streams — brief
topic: backend-engineering/messaging/redis-streams
stage: brief
tags: [backend-engineering, messaging]
created: 2026-11-14
sources: [redis-streams-docs]
---
```

| Field | Rule |
|---|---|
| `title` | Human title. Quote it when it contains a colon. |
| `topic` | The full topic id `domain/subdomain/slug` for notes inside a topic folder. Shared notes in `_concepts/` and `_tech/` keep `topic: shared` from their template. |
| `stage` | One of `brief`, `lesson`, `mini-projects`, `digest`, `repo-intel`, `capstone`, `final-notes`, `recall`, `resources`, `insights`, `map`, `concept`, `tech`, `visual` (written only by `tutor map`). It must match the kind of note. |
| `tags` | A non-empty list. Start with the domain and subdomain. Keep tags the template added (for example `flashcards` on the recall note, which the Spaced Repetition plugin needs). |
| `created` | `YYYY-MM-DD`, the day the note was first written. Do not change it on later edits. |
| `sources` | Ids from the topic's `sources.json` that the note relies on. Only ids that exist there. Omit or leave `[]` when the note relies on none. |

Delete the scaffold line `<!-- tutor:placeholder -->` and the "Not written yet" line under it when you write the note; the validator fails a note that still has them.

## File names

Obsidian resolves a link by file name alone, and the graph view shows file names. So every file name is unique across the whole vault.

| Note | File name |
|---|---|
| Topic stage notes | `01-brief-<slug>.md`, `02-lesson-<slug>.md`, … `09-resources-<slug>.md`, `my-insights-<slug>.md` |
| Digest | `04-digests/<source-id>-<slug>.md` |
| Repository deep dive | `05-repo-intel/<org>-<repo>/<repo>-overview.md`, `<repo>-architecture.md`, `<repo>-module-<name>.md`, `<repo>-tech-and-services.md`, `<repo>-pattern-<name>.md`, `<repo>-findings.md`, `<repo>-takeaways.md` |
| Shared concept | `_concepts/<Name>.md`, for example `Idempotency.md` |
| Shared technology | `_tech/<Name>.md`, for example `PostgreSQL.md` |

Never build these paths by hand: `node harness/bin/tutor.mjs paths <topic>` prints them. Every file in a repository folder starts with the same `<repo>-` prefix. Never name a note `overview.md`, `notes.md`, or `README.md`.

## Links

- Use Obsidian wikilinks with shown text: `[[01-brief-redis-streams|the brief]]`, `[[Idempotency]]`, `[[PostgreSQL|Postgres]]`.
- The target is the **file name without `.md` and without any folder**.
- Every link must resolve to a file that exists in the vault. Create the note first, then link it. For a shared note run `node harness/bin/tutor.mjs concept "<Name>"` (add `--tech` for a technology).
- Inside a markdown table write the link without `|Shown text`, because the pipe would split the cell.
- Lesson pages are not vault notes. Refer to one as inline code (`04-pending-and-claiming`) and link the lesson index note `[[02-lesson-<slug>]]`.
- External pages are normal markdown links: `[Redis Streams docs](https://…)`. Prefer naming the source id in `sources` and linking `[[09-resources-<slug>]]` over repeating URLs.
- Link a term the first time it appears in a note, not every time.

## Concept note or tech note

Shared notes are what connect topics into one graph. Use this test:

| Question | Answer | Note |
|---|---|---|
| Can you install it, run it, call its API, or sign up for it? Does it have a vendor or a maintainer? | yes | `_tech/` : PostgreSQL, Redis, Kafka, Docker, GitHub Actions, Stripe, AWS S3, OpenTelemetry Collector |
| Is it an idea that a textbook could explain without naming a product? | yes | `_concepts/` : Idempotency, Backpressure, Consistent hashing, At-least-once delivery, Dependency injection |

Borderline cases: a protocol or standard is a concept when it is an idea with many implementations (OAuth 2.0, Raft, HTTP caching) and a tech note when it means one concrete product (the etcd server).

**When to create one.**

- `_tech/`: for every technology and external service found during repository analysis (it is listed in `<repo>-tech-and-services.md`), and for the main technology of a topic.
- `_concepts/`: when the idea would make sense in a second topic. An idea that only matters inside this topic stays in the topic's own notes.
- Before creating, look at the existing names (`ls vault/_concepts vault/_tech`). Reuse the existing note; never create `Idempotence` next to `Idempotency`. Use the common English name in sentence case, singular: only the first word and proper names are capitalised ("Dense retrieval", "At-least-once delivery", "Consumer group", not "Dense Retrieval"). A technology keeps its official spelling ("PostgreSQL", "GitHub Actions"). `tutor concept` returns the existing note when one exists with a different letter case; link to the file name it prints.

**What goes in one.** A shared note is short: one plain paragraph of 1–3 sentences that says what it is, then a line under `## Where it shows up` for each topic or repository note that uses it. The writer who creates the note replaces the placeholder line under the title (`<!-- tutor:placeholder -->` and the "_Not written yet" line) with that paragraph. Nobody writes the lines under `## Where it shows up` by hand: `tutor map` (also run by `tutor done`) fills them for every shared note that a topic links to. Never rewrite or delete what is already in a shared note.

## Atomic notes

- **One note answers one question.** "How does etcd replicate a write?" is one note. "Everything about etcd" is not.
- The title names that one thing. If the title needs "and", split the note.
- Target size: module and pattern notes 150–400 words; the brief 150–400; final notes 200–600. A note that grows past about 600 words is usually two notes.
- A note must stand alone: say what the thing is in the first two lines before going into detail.
- Put detail in the note that owns it and link to it; do not copy a paragraph into two notes.
- Index notes (`00-…`) only list and link; they hold no explanations.
- Write in plain words and short sentences. Explain a term on first use or link its concept note.

## Evidence citations (repository notes)

Every claim about a repository cites where it was seen, in this exact form, as inline code:

```
path/to/file.ext:line @ <short-sha>
```

- `path` is relative to the repository root, exactly as in the clone.
- `line` is one line number or a range: `:42` or `:120-148`.
- `<short-sha>` is the commit that was analysed, 7 or more hex characters, from `git -C .cache/repos/<org>__<repo> rev-parse --short HEAD`. Use the same SHA in every note of that repository and name it in `<repo>-overview.md`.
- One citation per claim, placed right after the claim. Several files: several citations.
- Cite only lines you actually read in the clone. A claim you cannot cite is removed, not softened with "probably".
- Quote at most a few lines of code, and only when the exact text matters; otherwise describe what the code does.
- `<repo>-findings.md` must contain citations; rank findings by how much they go beyond the textbook version.
- Repository code is never copied into the vault; the clone stays in `.cache/repos/`.

For a non-code case study (the `general` domain), cite the document the same way in spirit: `source-id, section or page`.

## Diagrams

- Diagrams are mermaid code blocks (` ```mermaid `). No images of diagrams, no ASCII art.
- Use `flowchart LR` or `flowchart TD` for structure and flow, `sequenceDiagram` for who-calls-whom, `stateDiagram-v2` for states, `erDiagram` for data models, `classDiagram` for class structure.
- Keep it readable: 5–15 nodes, short labels, labelled arrows. Split a larger picture into two diagrams.
- Put labels with spaces or symbols in quotes: `A["Order service"] -->|"XADD"| B[("orders stream")]`. No HTML in labels.
- Every diagram is followed by one or two sentences that say what to notice in it.
- `<repo>-architecture.md` has a module map diagram and the main request or data flow.
- Visual-first plans (`harness/rubrics/visuals.md`): the brief, every digest, each
  repository architecture note (two diagrams), each mini-project README, the capstone
  architecture (three diagrams) and note carry diagrams; a reusable diagram is a file in
  `<vault>/visuals/assets/<id>-<slug>.svg|.mmd` registered with `tutor visuals add`,
  embedded with `![[<id>-<slug>.svg]]` (or pasted as a mermaid block) and linked to its
  note `[[visual-<id>-<slug>]]`.
- `tutor map` writes `<vault>/visuals/`: `visuals-<slug>.md` (index), one
  `visual-<id>-<slug>.md` per visual (`stage: visual`: embed, explanation, text
  alternative, check question, sources, where it is used, video transcript), and
  `concept-map-<slug>.md`. Never edit them above `## My insights`; edit the registry.
- Final notes link `[[visuals-<slug>]]` and embed or link one to three visuals as a
  visual refresher; at least one recall card links a visual note.

## Writing

Every generated note follows `harness/rubrics/writing-standard.md`: short active
sentences, terms defined at first use, beginner explanation first and technical
depth after it, analogies and assumptions marked. `tutor style <note>` reports it.

## The `## My insights` rule

- Every stage note ends with the heading `## My insights`. It is the last heading of the note.
- Generators write nothing below it. That space belongs to the learner; `tutor insight` appends backlinks there.
- When regenerating a note that already exists, replace only the part above `## My insights` and keep everything below it exactly as it is.
- Never add a second `## My insights` heading, and never put another `#` or `##` heading below it.
- `my-insights-<slug>.md` is the learner's own file. Generators never overwrite or reorder it; only `tutor insight` appends to it.
- Notes inside a repository folder may omit the heading; the index `00-repo-intel-<slug>.md` and all other stage notes need it.

## Recall cards

Cards live in `08-recall-<slug>.md` in the Obsidian Spaced Repetition multi-line format. Each card is four parts with nothing between them, then one blank line:

```
<!-- card: rs-01 -->
Why must a stream consumer be idempotent?
?
Delivery is at-least-once: after a crash another worker can claim and process the same entry again.
```

- The id comment sits directly above the question. `tutor recall sync` finds cards by it.
- The id is `<prefix>-NN`: the prefix is the first letter of each word of the topic slug (`redis-streams` gives `rs`), the number has two digits and counts up from `01`.
- An id is never changed or reused, even after a card is deleted, because the review history is stored under it. A new card takes the highest number plus one.
- The separator line contains only `?`. No blank line inside a card. No other line in the file may consist of only `?`.
- One fact or one decision per card. The question is 1–3 lines; the answer is 1–4 lines and checkable in ten seconds.
- Ask for understanding: explain why, compare two things, debug a symptom, decide in a situation. Avoid "What is X?" and yes/no questions.
- At least 8 cards per topic (5 for `quick`), at least one per planned outcome.
- The plugin may add scheduling comments (`<!--SR:…-->`) after an answer once the learner reviews. Keep them when editing the file.

## Good and bad

**Bad** (file `findings.md`):

```markdown
# Findings

Kafka is a very powerful and robust system. It uses many advanced techniques
for performance, such as zero-copy and batching, and has excellent fault
tolerance. See the architecture note for more information.

> Tip: Kafka is fast!
```

What is wrong: no frontmatter; a file name that is not unique; praise instead of claims; no evidence; a link described in words instead of a wikilink; technologies and ideas not linked; a quote box; no `## My insights`.

**Good** (file `kafka-findings.md` in `05-repo-intel/apache-kafka/`):

```markdown
---
title: Kafka — findings
topic: backend-engineering/messaging/kafka
stage: repo-intel
tags: [backend-engineering, messaging]
created: 2026-11-14
sources: [apache-kafka-repo]
---

# Kafka — findings

Ranked by how far each one goes beyond the textbook description.
Commit analysed: `3f9a2c1` (see [[kafka-overview|the overview]]).

## 1. Log segments are sent to consumers without copying them into the broker's memory

The broker hands the file region straight to the socket, so a fetch costs no
copy through the JVM heap. This is the [[Zero-copy]] technique.
Evidence: `clients/src/main/java/org/apache/kafka/common/record/FileRecords.java:290-301 @ 3f9a2c1`

Borrow for the capstone: stream stored files with the runtime's file-to-socket
call instead of reading them into memory first.

## 2. …

## My insights
```

(The path, line numbers, and SHA in this example show the format only. Real notes cite what was read in the clone.)

## Self-check before finishing a note

1. Frontmatter complete; `stage` matches the note; `sources` ids exist in `sources.json`; placeholder removed.
2. The file name is the one `tutor paths` gave, and is unique.
3. Every `[[link]]` points to an existing file name; technologies link to `_tech`, ideas to `_concepts`.
4. The note answers one question and stands alone; it is within its size target (`node harness/bin/tutor.mjs words <file>` prints the count the validator uses and the allowed range).
5. Repository claims each carry `path:line @ sha`; nothing uncited remains.
6. Diagrams are mermaid, small, and followed by what to notice.
7. No blockquote or callout used as a box; plain paragraphs only.
8. `## My insights` is the last heading and nothing generated is below it.
9. Recall cards: ids unique and stable, `?` separator, no blank line inside a card.
10. A new shared note: the definition stands under the title, the placeholder is gone, the name is in sentence case, and nothing was written by hand under `## Where it shows up`.
