---
name: learn-recall
description: Run a spaced-recall session on the learner's topics in the tutor harness — ask the due flashcards one at a time, give feedback, record a grade, and point to the exact page to reopen for each weak card. Use this whenever the learner says "quiz me", "test me", "test me on <topic>", "what's due", "what should I review", "review <topic>", "do my flashcards", "recall session", or otherwise asks to be questioned on something they studied in this repository, even if they do not mention cards.
argument-hint: "[topic id or slug]"
---

# learn-recall — spaced recall session

Recalling an answer from memory is what makes it stick; reading the answer again
does not. So the whole session is built around one rule: the learner attempts
every card before seeing anything of its answer. The `tutor` CLI schedules the
cards in Leitner boxes (intervals of 1, 3, 7, 16, 35, 90, 180, and 365 days), and
this skill is the conversation around that schedule.

In this document, `tutor` means `node harness/bin/tutor.mjs`, run from the
repository root.

## When to use

Use it when the learner wants to be quizzed or asks what is due. It works on one
topic when they name one, and across all topics when they do not.

## Steps

### 1. Find what is due

With a topic:

```bash
node harness/bin/tutor.mjs recall due <topic> --json
```

Without a topic (all topics):

```bash
node harness/bin/tutor.mjs recall due --json
```

If the learner named a topic and you are not sure of its id, run
`node harness/bin/tutor.mjs list --json` and match the name. If nothing matches,
show the topic list and ask which one they mean.

The output has `total` (how many cards are due), `cards` (each with its
`topic`, `id`, `question`, and stored `answer`), `next_due`, and one entry per
topic under `topics`. Keep the answers to yourself until the learner has
attempted the card.

If a topic's entry shows `unsynced` above zero, or `registered` is zero for a
topic that has an `08-recall-<slug>.md` file, its cards were never registered.
Register them and ask again:

```bash
node harness/bin/tutor.mjs recall sync <topic>
node harness/bin/tutor.mjs recall due <topic> --json
```

### 2. When nothing is due

Tell the learner in one line when the next card is due. Take the date from the
output of `recall due` (the `next_due` field). If the output does not contain
it, read `recall.cards` in the topic's `topic.json` and report the earliest
`due` date.

Then offer a free-practice round of five cards. In free practice:

- Choose cards from `08-recall-<slug>.md` (its path is the `recall` key in the
  output of `node harness/bin/tutor.mjs paths <topic> --json`). Prefer the cards
  in the lowest boxes: `recall.cards` in the topic's `topic.json` stores a `box`
  number for each card id, and a low box means the card was missed recently.
- Ask and give feedback exactly as in steps 4 and 5.
- Do not record a grade for a correct answer. Grading a card before it is due
  would push its next review further away without the waiting time that makes the
  spacing work.
- If the learner misses a card, offer to record `again` for it, so that it comes
  back tomorrow.

### 3. Open the session

Say how many cards are due and for which topics. If more than 15 are due, propose
doing 10 now and the rest later, because attention drops in long sessions and
tired answers produce unreliable grades. Then start with the first card. Do not
explain the rules at length; one line is enough: "Answer in your own words; say
'skip' if you do not know."

### 4. Ask one card at a time

For each card:

1. Show the position, the topic, and the question only, for example:
   "Card 3 of 8 · Redis Streams" followed by the question text.
2. Stop and wait for the learner's answer. Do not show the answer, a paraphrase
   of it, or a multiple-choice list made from it.
3. If the learner asks for a hint, give one hint that narrows the question
   without containing the answer, and remember that a hint was used.
4. If the learner says "skip" or "I don't know", treat that as their attempt and
   go to step 5.

Never put two questions in one message. One card per message keeps the learner
recalling instead of scanning.

### 5. Compare, give feedback, and suggest a grade

Compare the learner's answer with the stored answer by meaning, not by wording.
Then reply with:

- One to three sentences of specific feedback: what was right, and what was
  missing or wrong. Name the missing idea; do not write "almost" or "good try"
  without content.
- The stored answer, now that they have attempted it.
- A suggested grade from this table, and one line that lets them change it.

| Grade | Suggest it when |
|-------|-----------------|
| `again` | The answer was wrong or blank, or the key idea was missing. |
| `hard` | The key idea was there but with a hint, a long struggle, or an important part missing. |
| `good` | The answer was correct and contained the key idea. |
| `easy` | The answer was correct, immediate, and went beyond the stored answer. |

Example reply:

```
You had the main point: the entries stay in the pending list. What was missing is
how another worker gets them — XAUTOCLAIM, once they have been idle longer than
the timeout.

Stored answer: They stay in the group's pending list. Another consumer takes
them over with XAUTOCLAIM once they have been idle longer than the chosen timeout.

Suggested grade: hard. Reply "ok" to keep it, or say again / good / easy.
```

Suggest honestly. A generous grade moves the card to a longer interval, and the
learner then forgets it before it comes back.

Write feedback in the writing standard (`harness/rubrics/writing-standard.md`):
short active sentences, the missing idea named in the card's own terms.

When you suggest `again` or `hard`, add one sentence that points to the visual
refresher: the visual note that explains the card (the `[[visual-<id>-<slug>]]`
link in the stored answer or in the card's `## Reopen map` row) and where it
lives on the site. Find the lesson page, simulation or video from
`node harness/bin/tutor.mjs visuals <topic> list --json` (its `used_in` and
`format`). For example: "Look at the crash-recovery flow (vault note
visual-crash-recovery-flow-redis-streams); on the lesson page
04-pending-and-claiming you can switch worker 1 off and watch it." One sentence,
one visual; skip it when no registered visual explains the card.

### 6. Record the grade

When the learner confirms or names a different grade, record the one they chose.
The learner's choice wins, because they know how hard the recall felt.

```bash
node harness/bin/tutor.mjs recall grade <topic> <card-id> <again|hard|good|easy>
```

Record each card once. Then go to the next card (step 4). If the learner asks a
follow-up question about the card, answer it in a few sentences and continue; a
recall session is not a lecture.

If the learner shows that a stored answer is wrong or outdated, correct the
answer text of that card in `08-recall-<slug>.md` (keep its id), run
`node harness/bin/tutor.mjs recall sync <topic>`, and tell them it was corrected.

### 6a. Use checkpoint results from the experiences

Before the first card, run `node harness/bin/tutor.mjs experience <topic> progress`.
It lists weak concepts (mastery below 0.6) with the misconceptions the learner
showed in interactive lessons and the scenes to replay. When the learner says they
exported progress from a lesson page (Practice → Export progress), import it first
with `experience <topic> progress --file <file>`: related cards become due today.
Ask the due cards about weak concepts first. When a card is graded `again` or `hard`
and an experience covers its concept, point to that experience's checkpoint or
`revisit` scene ("open the Guided tab of binary-search-lab and replay 'Compare with
the middle'"), because redoing the prediction repairs the model faster than rereading.

### 7. Close the session

When the cards are finished, or the learner stops, give a short summary:

1. How many cards were reviewed, and how many received each grade.
2. The weak areas: every card graded `again` or `hard`, each with the exact place
   to reopen. Find that place in the `## Reopen map` table of
   `08-recall-<slug>.md`, in the row for the card id. If the file has no such
   table, open `02-lesson-<slug>.md` and choose the lesson page whose one-line
   description matches the card. When a registered visual explains the card,
   name it first: its visual note, and the lesson page, simulation or video
   where it can be used (`tutor visuals <topic> list --json`). A picture or a
   simulation restores the model faster than a page of text.
3. When the next cards are due.

Point to one page or one note section per weak card, never to "the whole topic".
The learner has ten minutes, not two hours.

Example summary:

```
Reviewed 8 cards: 5 good, 1 easy, 1 hard, 1 again.

Reopen these:
- rs-04 (again) — growing pending list: final notes, section "Trade-offs and
  failure modes" (vault note 07-final-notes-redis-streams).
- rs-01 (hard) — recovering a crashed consumer's work: first the visual note
  visual-crash-recovery-flow-redis-streams, then the simulation on lesson page
  04-pending-and-claiming (switch worker 1 off).

Next review: 2 cards tomorrow, 3 cards on 2026-11-17.
```

Then write one line to the topic log, for each topic that was reviewed:

```bash
node harness/bin/tutor.mjs log <topic> "recall session: 8 reviewed, 1 again, 1 hard"
```

## Rules

- The answer stays hidden until the learner has attempted the card. This is the
  point of the whole skill.
- One card per message.
- Every reviewed card gets exactly one `recall grade` command, with the grade the
  learner accepted.
- Card ids and card text in `08-recall-<slug>.md` are not changed during a
  session, except to correct a wrong answer as described in step 6.
- If the learner shares something new during the session ("oh, I also found out
  that…"), finish the current card, then use the `learn-insight` skill to save it.

## Common mistakes

- Showing the question and the answer together "for convenience".
- Asking several cards in one message, or turning a card into multiple choice.
- Grading `good` for an answer that only repeated words from the question.
- Recording a grade without telling the learner which grade was recorded.
- Recording grades during free practice for cards that were not due.
- Ending with "review the topic again" instead of naming the page for each weak
  card.
- Sending the learner to a long page when a registered visual or simulation
  explains the card in one look, or naming a visual that is not in `visuals.json`.
- Forgetting `recall sync` when `recall due` shows no cards for a topic that has
  a recall file.
