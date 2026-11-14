---
name: learn-insight
description: Add something the learner found out themselves to the notes of an existing topic in the tutor harness, with a date and a backlink in the related note. Use this whenever the learner shares a learning or asks for a detail to be saved, even when they do not say the word "insight" — for example "add this to my Redis Streams notes", "I found out that…", "I learned that…", "note that…", "also add…", "remember that…", "TIL…", or "put this in my notes". Also use it when the learner pastes a snippet, a gotcha, or a correction and clearly wants it kept.
argument-hint: "[topic] <what the learner learned>"
---

# learn-insight — save the learner's own insight

The generated notes are the tutor's voice. The file `my-insights-<slug>.md` is the
learner's voice, and it is the part of the vault they trust most, because they
wrote it. This skill saves a new insight there, links it to the generated note it
relates to, and never changes what the learner wrote before.

In this document, `tutor` means `node harness/bin/tutor.mjs`, run from the
repository root.

## When to use

Use it when the learner tells you something they learned, noticed, or want kept,
and it belongs to a topic that already exists in this repository. If the topic
does not exist yet, say so and offer to start it with the `learn` skill; do not
create topic folders by hand.

## Steps

### 1. Find the topic

```bash
node harness/bin/tutor.mjs list --json
```

- If the learner named a topic, match it to an id in the list.
- If they did not, infer it from the conversation: the topic that was just
  taught, quizzed, or discussed.
- Ask a question only when two or more topics fit equally well. Ask it in one
  line and list the candidates, for example: "Should this go under Redis Streams
  or Kafka?"

### 2. Get the paths and read the learner's insights file

```bash
node harness/bin/tutor.mjs paths <topic> --json
```

Read `my-insights-<slug>.md` (the `insights` key in the output) to see whether
the same insight is already there. If it is, tell the learner and stop, unless
they are adding a new detail to it. Read this file only; never edit it.

### 3. Choose the related note

The insight gets a backlink in one generated note, so that the learner meets it
again when rereading that note. Choose the note with this table.

| The insight is about | `--target` value |
|----------------------|------------------|
| What the thing is, why it exists, where it is used | `brief` |
| How a mechanism works, something from a lesson page | `lesson` |
| Something discovered while doing a mini project | `mini-projects` |
| A point from a paper or documentation page | the file name of that source's digest note in `04-digests/`, or `digests` when unsure which |
| How a production repository does something | the file name of the matching note in `05-repo-intel/<org>-<repo>/`, or `repo-intel` |
| A design decision or lesson from the capstone | `capstone` |
| A rule of thumb, trade-off, gotcha, or command worth remembering | `final-notes` |

The short names stand for the numbered notes of the topic (`lesson` is
`02-lesson-<slug>.md`, and so on). A file name is written exactly as
`tutor paths` or `ls` shows it, for example `bullmq-findings.md`.

When nothing fits clearly, use `final-notes`, because that is the note the
learner rereads most often. If the stage of the chosen note was skipped for
this topic, use `final-notes`, and if that was skipped too, use `brief`.

### 4. Clean up the wording lightly

The entry must still sound like the learner. Do only this:

- Fix spelling, grammar, and punctuation.
- Expand an abbreviation that would be unclear in a year.
- Put commands, code, and names in backticks.
- Keep their claim, their example, and their first-person voice.

Do not add facts, do not strengthen or soften their claim, and do not turn their
sentence into textbook prose. A note that sounds like the tutor is a note the
learner no longer recognizes as their own.

The CLI builds the entry's heading from the date and the first six words of the
text. So when the learner's sentence opens with filler such as "I found out
that", move the subject to the front and keep the rest of their words.

Example:

- The learner said: "found out xautoclaim doesnt give u msgs that were deleted,
  it just skips them and returns their ids in a 3rd array"
- Saved text: "`XAUTOCLAIM` does not return deleted entries. I found out that
  it skips them and returns their ids in a third array."
- Resulting heading: `2026-11-14 — XAUTOCLAIM does not return deleted entries`

### 5. Check for a contradiction

Read the target note and search it for the key terms of the insight. If the
generated notes say something different:

- Tell the learner what the note says and what they said, in two sentences.
- Do not rewrite the generated note, and do not rewrite the insight. The learner
  may be right (the notes may be outdated) or wrong, and silently changing either
  side hides the disagreement.
- Add one sentence to the end of the saved text, clearly marked as coming from
  the tutor: `(Tutor check: [[<note-file-name>]] says <what it says>. These
  differ; verify against <the source to check>.)`
- If the learner then asks you to correct the generated note, edit only the text
  above its `## My insights` heading, and only after a source confirms the
  correction.

### 6. Add links to shared notes

```bash
ls vault/_concepts vault/_tech
```

Where the insight mentions a concept or a technology that has a note in one of
these folders, write the mention as a wikilink, for example `[[Consumer group]]`
or `[[Redis]]`. Link only to files that exist. A link to a missing note fails
validation and shows as a dead node in the Obsidian graph.

### 7. Save it with the CLI

Pass the text through a quoted heredoc so that quotes, backticks, and dollar
signs in the learner's text reach the CLI unchanged.

```bash
TEXT=$(cat <<'EOF'
`XAUTOCLAIM` does not return deleted entries. I found out that it skips them and returns their ids in a third array.
EOF
)
node harness/bin/tutor.mjs insight <topic> --text "$TEXT" --section "Pending entries and claiming" --target lesson
```

- `--section` is the group inside `my-insights-<slug>.md` that the entry is
  filed under. Look at the `## ` headings already in that file and reuse one
  when it fits; otherwise choose a short name for the area of the topic (two to
  four words). Without `--section` the entry goes under "General".
- `--target` is the value chosen in step 3.
- The command appends the dated entry to `my-insights-<slug>.md` and adds a
  backlink line under `## My insights` in the target note. Use the command for
  both. Do not write either of them by hand.

If the command fails, read its error message, fix the argument it names, and run
it again. If it still fails, show the learner the cleaned text and the error, so
that the insight is not lost.

### 8. Check that it landed

Read the end of `my-insights-<slug>.md` and the `## My insights` section of the
target note. Both must show the new entry. If one is missing, report that to the
learner instead of patching the file by hand.

### 9. Offer follow-ups when the insight is a new small subtopic

An insight is a new subtopic when no lesson page, note, or recall card of the
topic covers it. In that case, offer the following; do not do it unasked.

- **A recall card.** If the learner agrees, open `08-recall-<slug>.md`, find the
  highest card id, and add one card with the next id at the end of the
  `## Cards` section, above `## Reopen map` and above `## My insights`. Use the
  exact format below, with a blank line before and after the card. If the file
  has a `## Reopen map` table, add a row for the new card. Then register it:

  ```
  <!-- card: rs-15 -->
  XAUTOCLAIM returns three arrays. What is in the third one, and why does it matter?
  ?
  The ids of pending entries that were deleted from the stream. They cannot be processed, so the caller should stop tracking them.
  ```

  ```bash
  node harness/bin/tutor.mjs recall sync <topic>
  ```

- **A short extra lesson page**, only when the insight is a mechanism with
  several steps that deserves a visual. First count the `.mdx` files in the
  topic's lessons folder. If the topic is already at the maximum for its depth
  (4 pages for `quick`, 7 for `standard`, 12 for `deep`), do not offer a page,
  because one more page makes `tutor validate` fail. Otherwise, if the learner
  agrees, follow the `learn-site` skill for one page: the new page takes the next
  number, the `<Resources />` line moves from the old last page to the end of the
  new page, the page is added to `02-lesson-<slug>.md`, and
  `npm --prefix site run build` must pass.

### 10. Confirm in two lines

Reply with exactly two lines, for example:

```
Added to Redis Streams → my-insights-redis-streams.md, section "Pending entries and claiming" (2026-11-14).
Linked from 02-lesson-redis-streams.md; it shows under "My insights" there.
```

If there was a contradiction or an offer from step 9, add it after these two
lines, in one sentence each.

## Rules that protect the learner's notes

- Never edit, reorder, merge, or delete an earlier entry in
  `my-insights-<slug>.md`. The file is append-only, and only through the CLI.
- Never write below a `## My insights` heading in any note except through
  `tutor insight`. Generators stay above that heading, the learner's material
  stays below it, and that separation is what lets stages be regenerated without
  losing the learner's work.
- Never change the meaning of what the learner said. If you believe it is wrong,
  say so and record the disagreement next to it, as described in step 5.
- One insight per command. If the learner shares three unrelated things, run the
  steps three times, so that each has its own heading and backlink.

## Common mistakes

- Asking "which topic?" when the conversation has been about one topic for the
  last ten messages.
- Rewriting the insight into polished textbook language.
- Editing the generated note to agree with the insight, without telling the
  learner that the two disagreed.
- Appending to `my-insights` with a file edit instead of the CLI, which skips the
  date and the backlink.
- Adding a recall card below `## My insights`, where the validator treats it as
  generated content in the learner's area.
- Replying with a long explanation. The learner wants to know that it is saved
  and where.
