# Recall cards — format, question types, and the reopen map

Read this before writing `08-recall-<slug>.md`.

## 1. The exact card format

Each card is four parts, in this order, with nothing between them:

```
<!-- card: rs-01 -->
<question, one to three lines>
?
<answer, one to four lines>
```

Rules, each with its reason:

- The id comment is the line directly above the question. `tutor recall sync`
  finds cards by this comment.
- The line between question and answer contains only `?`. This is the Obsidian
  Spaced Repetition multi-line separator.
- There is no blank line inside a card, and exactly one blank line after it. The
  plugin treats a blank line as the end of a card.
- A question never contains a line that is only `?`.
- An answer is short enough to check in ten seconds. If it needs a paragraph, the
  card is asking two things; split it.

## 2. Card ids

- The prefix is the first letter of each word in the topic slug:
  `redis-streams` gives `rs`, `retrieval-augmented-generation` gives `rag`,
  `vector-databases` gives `vd`.
- The number has two digits and counts up from `01`: `rs-01`, `rs-02`, and so on.
- An id is never changed and never reused, even when a card is deleted. The
  scheduler stores the learner's review history under the id.
- When adding a card to an existing file, take the highest existing number and
  add one.

## 3. The four question types

Mix the types. A file of definition questions tests the memory of phrases; these
four types test whether the model in the learner's head works.

**Explain** — ask why or how, never "what is".

```
<!-- card: rs-02 -->
Why does a consumer group, and not each consumer, store the last delivered id?
?
So that any consumer can take the next entry without coordination. If consumers stored their own position, two of them would read the same entries.
```

**Compare** — ask for the difference that decides a choice.

```
<!-- card: rs-03 -->
XREADGROUP with the id `>` versus the id `0`: what does each return, and when do you use the second one?
?
`>` returns entries never delivered to the group. `0` returns this consumer's own pending entries. Use `0` after a restart to finish what was in flight.
```

**Debug** — give a symptom and ask for the cause and the check.

```
<!-- card: rs-04 -->
Throughput looks normal, but Redis memory climbs every day and XPENDING shows a growing count. What is wrong and how do you confirm it?
?
Some handler path returns without XACK, so entries stay pending and cannot be trimmed safely. Confirm with XPENDING per consumer and look for one consumer with old idle times.
```

**Decide** — describe a situation and ask for a choice with its reason.

```
<!-- card: rs-05 -->
You need to keep 30 days of click events, about 2 TB, and replay them for new services. Redis Streams or Kafka, and why?
?
Kafka. A stream lives in memory, so 2 TB is not practical, while Kafka stores the log on disk and is built for long retention and replay.
```

## 4. Coverage

- Write at least one card for every entry in `plan.outcomes`. Do these first.
- Then follow the playbook's `## Recall focus` section, which says what matters
  most in this domain (for example failure modes in backend topics, or the
  decision rules in system design).
- Add one card for each failure mode in the final notes and one for the most
  important production difference from the repo-intel findings.
- Do not write two cards with the same answer.

## 5. The reopen map

After the cards, add this table under the heading `## Reopen map`. The recall
skill uses it to send the learner back to one exact page instead of the whole
topic when a card is missed.

```markdown
## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| rs-01 | explain how a crashed consumer's work is recovered | lesson page `04-pending-and-claiming`, listed in [[02-lesson-redis-streams]] |
| rs-02 | explain what a consumer group stores | lesson page `03-consumer-groups`, listed in [[02-lesson-redis-streams]] |
| rs-04 | diagnose a growing pending list | [[07-final-notes-redis-streams]], section "Trade-offs and failure modes" |
| rs-05 | decide between Redis Streams and Kafka | [[01-brief-redis-streams]] |
```

Rules for the table:

- There is one row for every card id in the file.
- The lesson page is named by its file name without `.mdx`, exactly as it is
  listed in `02-lesson-<slug>.md`. Lesson pages are not vault notes, so the page
  name is written as inline code and only the lesson index is a wikilink.
- The "Outcome it covers" column uses the wording from `plan.outcomes`. A card
  that covers no planned outcome says "extra: <what it tests>".
- Inside the table, wikilinks are written without the `|Shown text` part,
  because a pipe character would split the table cell.
- The table contains no line that is only `?`, so the plugin does not read it
  as a card.

## 6. The whole file, in outline

```markdown
---
title: Redis Streams — recall cards
topic: backend-engineering/messaging/redis-streams
stage: recall
tags: [backend-engineering, messaging, flashcards]
created: 2026-11-14
---

# Redis Streams — recall cards

## Cards

<!-- card: rs-01 -->
...
?
...

<!-- card: rs-02 -->
...
?
...

## Reopen map

| Card | Outcome it covers | Reopen when missed |
|------|-------------------|--------------------|
| rs-01 | ... | ... |

## My insights
```

The template created by `tutor init` already has the frontmatter, the title
line, and `## My insights`. Keep them, including the `flashcards` tag, which is
how the Obsidian plugin finds the file. Delete the `<!-- tutor:placeholder -->`
line and the "Not written yet" line under it.
