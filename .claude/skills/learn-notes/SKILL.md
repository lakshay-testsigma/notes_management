---
name: learn-notes
description: Write the one-page final notes (07-final-notes) and the spaced-recall flashcards (08-recall) for a topic in the tutor harness. This is the `notes` stage. Use it whenever `tutor next` lists the `notes` stage, whenever the learner asks for "final notes", "a summary", "a refresher", "a cheat sheet", "flashcards" or "recall cards" for a topic that already exists in this repository, and whenever `tutor validate <topic> notes` reports a failure that has to be repaired.
argument-hint: "<topic id or slug>"
---

# learn-notes — final notes and recall cards (stage `notes`)

These two files are what the learner opens a year from now instead of redoing the
whole topic. The final notes rebuild the mental model in five minutes. The recall
cards keep that model alive through spaced review. Both have to be dense: every
sentence either states an idea the learner will need again or it is removed.

## When to use

Use this skill when the `notes` stage of a topic is ready to run, which means the
lesson, mini-projects, and capstone stages are `done` or `skipped`. The notes are a
compression of what the earlier stages produced, so they cannot be written before
those stages exist.

The `notes` stage is one unit of work and runs inline: the session that runs
this skill (normally the `learn` orchestrator) does all of it, without workers.
In this document, `tutor` always means `node harness/bin/tutor.mjs`, run from the
repository root.

### Capacity-aware input allowance

The input allowance is `min(60000, floor(0.4 * actual_window) - reserve)`, including
instructions, role/skill text and assigned excerpts. Ask `tutor budget --window
<actual_window> --reserve <overhead> <files>` before reading. Unknown window defaults
to 32768 and reserve3000. Any 60,000-token figure below is a ceiling only; the CLI's
smaller allowance wins. Split oversized units and persist handoffs before dispatch.
Learner experience comes from plan.learner; this learner is an existing software
developer learning a new subject. Keep clear prerequisite bridges, avoid redundant
basic programming lessons, and teach practical mechanisms and failure modes.

## Inputs

Run this first and take every path from its output (the two output files are
the keys `final_notes` and `recall`). Never build a path by hand, because the
file names carry the topic slug and one typo breaks every link.

```bash
node harness/bin/tutor.mjs paths <topic> --json
```

Then read only these files. The list is ordered so that the most compressed
material comes first.

1. `topic.json` in the state folder. Read `plan.summary`, `plan.outcomes`,
   `plan.lesson_outline`, `depth`, and the `stages` list (to see which stages were
   skipped).
2. `harness/rubrics/vault-notes.md`, the quality rubric for vault notes.
3. `harness/domains/<domain>/playbook.md`, but only the sections under the
   headings `## Recall focus` and `## Safety and ethics`.
4. `01-brief-<slug>.md`.
5. `02-lesson-<slug>.md`, which lists the lesson pages. Open an individual `.mdx`
   page only when you need one exact detail from it.
6. `03-mini-projects-<slug>.md`.
7. `04-digests/00-digests-<slug>.md`, the index only. Open one digest only when a
   fact in your notes depends on it.
8. `05-repo-intel/00-repo-intel-<slug>.md`, and for each repository the two files
   `<repo>-findings.md` and `<repo>-takeaways.md`. Skip this item when the
   `repo-intel` stage is `skipped` or absent.
9. `06-capstone-<slug>.md`. Skip it when the `capstone` stage is `skipped`.
10. `my-insights-<slug>.md`, so that the notes do not contradict what the learner
    wrote. Read it; never edit it.
11. The visual registry, printed by
    `node harness/bin/tutor.mjs visuals <topic> list --json`: each visual's
    `id`, `title`, `kind`, `purpose`, `learning_check` and `used_in`. Do not open
    the assets. The visual index note is `visuals_index` from `tutor paths`, and
    each visual has a note `visual-<id>-<slug>` (written by `tutor map`).
    Also read `harness/rubrics/writing-standard.md` and the "Who calls this
    skill" row of `.claude/skills/learn-visuals/SKILL.md` for this stage.
12. The two output files themselves, `07-final-notes-<slug>.md` and
    `08-recall-<slug>.md`. `tutor init` already created them from templates.
    Keep their frontmatter, their `# ` title line if they have one, and their
    `## My insights` heading. Delete the line `<!-- tutor:placeholder -->` and
    the "Not written yet" line under it, and write the content in their place.

Check the size before reading, and drop the optional items (single digests, single
lesson pages) if the total is above 60,000 tokens:

```bash
node harness/bin/tutor.mjs budget <file1> <file2> ...
```

## Steps

1. Mark the stage as started. Skip this command when the stage is already
   `in_progress`, which is the case when the `learn` orchestrator started it.

   ```bash
   node harness/bin/tutor.mjs start <topic> notes
   ```

   If the file `<state path>/handoffs/notes-notes.md` exists, an earlier session
   stopped halfway. Read it first and continue from its `## Next step`.

2. Open `07-final-notes-<slug>.md` and put the nine required headings into it
   (see "Output contract"), above `## My insights`. Do this before reading the
   other inputs, so that you have a place to write findings as you read.

3. Read the inputs in the order listed above. After each file, write what belongs
   in the notes directly under the matching heading in `07-final-notes`. Do not
   wait until everything is read. Notes held only in your memory are lost if the
   session ends, and they are also the first thing a small model forgets.

4. Tighten `07-final-notes`. Follow the filled example in
   `references/final-notes-example.md`. Remove any sentence that only introduces,
   repeats, or praises. Check that the total is inside the word limit, with the
   count the validator itself uses:

   ```bash
   node harness/bin/tutor.mjs words <path to 07-final-notes-<slug>.md>
   ```

   It prints the count and the allowed range (200 to 600 words). The validator
   does not count the frontmatter or code blocks, so the mermaid diagram and
   the commands block are free. Any other word counter also counts those and
   reads about 200 words too high; never cut a note because of such a number.
   Aim for 300 to 500 words.

4a. Write `## Visual refresher`. Choose the one to three registered visuals
   that best restore the mental model a year from now (usually the end-to-end
   workflow, the key experience, simulation or video). For each, one line: the link
   `[[visual-<id>-<slug>|<title>]]` and what to look at in it. Embed at most one
   of them (its mermaid block, or `![[<id>-<slug>.svg]]` for a registered SVG).
   End the section with `All visuals: [[visuals-<slug>|all visuals]].` Link the
   deeper explanation; never copy it. For a plan with `visual_first: true` the
   gate fails final notes that do not link `[[visuals-<slug>` or have no
   diagram or `[[visual-…]]` link. Run `node harness/bin/tutor.mjs map <topic>`
   first if the visual notes do not exist yet.

4a2. Interactive experiences. When the topic has `<Experience>` pages
   (`tutor experience <topic> list`), add one line per experience to the visual
   refresher: `[[visual-<id>-<slug>|<title>]]`, its mode, and the one checkpoint
   worth redoing. The experience note already holds the parts, transcripts,
   storyboard, deck outline, checkpoints and sources: link it, never copy it. If
   `tutor experience <topic> progress` lists weak concepts, name them in
   `## Common mistakes` with the misconception the learner actually had. Recall
   cards may reuse an experience checkpoint as a card (keep its explanation as the
   answer) and link the experience note in the `## Reopen map`.

4b. Check the writing: `node harness/bin/tutor.mjs style <path to 07-final-notes>`.
   Short active sentences, one idea per bullet, terms the learner already met.

5. Check that every outcome is covered. For each item of `plan.outcomes`, find
   where it was taught: `02-lesson-<slug>.md` lists every outcome with the
   pages that serve it, and `03-mini-projects-<slug>.md` says what each
   project proves. Every outcome must appear in the final
   notes (under "Key ideas" or "When to use it / when not to") and gets a
   card in the next step. If an outcome was taught nowhere, do not invent
   the teaching here: write what the sources support, record it with
   `node harness/bin/tutor.mjs log <topic> "notes: outcome <n> is not taught on any page"`,
   and name it under PROBLEMS in your report so that finalize repairs the
   page or the outcome.

6. Write the cards into `08-recall-<slug>.md`, above `## My insights`. Read
   `references/recall-cards.md` first: it has the exact card format, the four
   question types with examples, and the "Reopen map" table. Write one card for
   every entry in `plan.outcomes` before writing any other card, because the
   outcomes are what the learner was promised. Then write two or three visual
   cards (section "Visual cards" of `references/recall-cards.md`): build them
   from the registered visuals' `learning_check`, ask the learner to predict
   what the visual shows (an annotated-graphic question), and end the answer
   with the link `[[visual-<id>-<slug>]]`. A visual-first plan needs at least
   one card that links a visual note.

7. Check the cards mechanically. The first command prints the number of cards.
   The second prints duplicated ids and must print nothing.

   ```bash
   grep -c '<!-- card: ' <path to 08-recall-<slug>.md>
   grep -o '<!-- card: [^ ]* -->' <path to 08-recall-<slug>.md> | sort | uniq -d
   ```

8. Register the cards with the review scheduler. Without this step the cards
   exist as text but never come up for review.

   ```bash
   node harness/bin/tutor.mjs recall sync <topic>
   ```

9. Run the gate, described in the "Gate" section below.

## Output contract

Both files live in the topic's vault folder. Use the exact paths printed by
`tutor paths`.

### `07-final-notes-<slug>.md`

Frontmatter (keep what the template has; these are the required fields):

```yaml
---
title: <Topic title> — final notes
topic: <domain>/<subdomain>/<slug>
stage: final-notes
tags: [<domain>, <subdomain>]
created: <YYYY-MM-DD>
sources: [<ids from sources.json that the notes rely on>]
---
```

Body: exactly these headings, in this order, spelled exactly like this.

| Heading | What goes under it |
|---------|--------------------|
| `## In one sentence` | One sentence a beginner could repeat: what it is and what problem it removes. |
| `## The mental model` | One small mermaid diagram (at most 8 nodes) and one or two sentences that explain how to read it. |
| `## Visual refresher` | One to three links `[[visual-<id>-<slug>\|<title>]]` with what to look at in each, at most one embed, and the link to the visual index `[[visuals-<slug>\|all visuals]]`. |
| `## Key ideas` | 5 to 9 bullets. Each bullet is one complete idea with its reason ("X, because Y"). |
| `## When to use it / when not to` | Two short lists: "Use it when" and "Do not use it when", each with concrete conditions and the alternative to use instead. |
| `## Trade-offs and failure modes` | What you pay for the benefits, and how it breaks in practice, with the symptom you would see. |
| `## Commands or code worth remembering` | One code block with the three to eight commands or lines the learner would otherwise look up again. |
| `## What production systems do differently` | Two to four points from the repo-intel findings and takeaways, each linked to the note it comes from. |
| `## Go deeper` | Wikilinks to the other steps of this topic, in reading order. Only steps that exist: leave out the note of a stage that is `skipped` (for example the deep dive and the capstone of a `quick` topic). |
| `## My insights` | Keep this heading as the last one and write nothing below it. |

Rules for the content:

- When the `repo-intel` stage was skipped, keep the heading
  `## What production systems do differently`, ground its points in the digests or
  the official documentation, and say in one sentence that no repository was
  analyzed for this topic. A missing heading fails the rubric; an invented
  production claim misleads the learner.
- `sources` in the frontmatter lists only ids that
  `node harness/bin/tutor.mjs sources <topic> list` prints.
- Every wikilink must point to a file that exists in the vault, written as
  `[[file-name-without-extension|Shown text]]`. Link only to files that
  `tutor paths` lists or that you saw in `vault/_concepts/` or `vault/_tech/`.
- The mental model diagram is a mermaid code block. The only other picture is
  at most one embed of a registered visual under `## Visual refresher`
  (`![[<id>-<slug>.svg]]` or its mermaid block); never a new, unregistered image.
- Write in `harness/rubrics/writing-standard.md`: short active sentences, terms
  defined before use, analogies marked `**Analogy.**`. Keep the notes short:
  link deeper explanations and visuals instead of copying them.
- The notes are plain paragraphs, bullets, one diagram, and one code block. Do
  not add blockquotes or callout boxes; the learner finds them irritating.

### `08-recall-<slug>.md`

Frontmatter with `stage: recall`. Keep every tag the template already has,
because the Obsidian Spaced Repetition plugin finds card files by tag.

Body, in this order:

1. `## Cards` — at least 8 cards (at least 5 for depth `quick`). Good targets are
   6 for `quick`, 10 to 14 for `standard`, and 14 to 20 for `deep`.
2. `## Reopen map` — one table row per card: card id, the plan outcome it
   covers, the exact lesson page or note to reopen when the card is missed, and
   the visual note to look at first when one explains it (`[[visual-<id>-<slug>]]`).
3. `## My insights` — the last heading, with nothing below it.

Every card uses exactly this shape, with a blank line between cards and no blank
line inside a card:

```
<!-- card: rs-01 -->
A consumer crashes after reading five entries but before acknowledging them. What happens to those entries, and how does another consumer get them?
?
They stay in the group's pending list. Another consumer takes them over with XAUTOCLAIM once they have been idle longer than the chosen timeout.
```

The full rules, the id scheme, and worked examples of the four question types
(explain, compare, debug, decide) are in `references/recall-cards.md`.

## Gate

```bash
node harness/bin/tutor.mjs validate <topic> notes
```

The validator prints each failure as `path: problem. fix.` Fix exactly the lines it
reports, then run it again. When it passes:

```bash
node harness/bin/tutor.mjs done <topic> notes
```

Make at most three attempts. If the third validation still fails, stop repairing,
because repeated blind edits usually make notes worse, and record the failure
with the validator's own words:

```bash
node harness/bin/tutor.mjs fail <topic> notes --reason "<the failures that remain>"
```

## Context budget

- The stage is one unit with the id `notes`. It is not split, and it needs no
  worker.
- The unit reads at most 60,000 tokens. Size the reading list with `tutor budget`
  before opening the files, and read indexes, findings, and takeaways instead of
  whole folders.
- Write as you go: after each input file, add its points to `07-final-notes`
  before opening the next file.
- If the reading turns out to be larger than the budget, or the session is
  getting long, stop and hand off instead of pushing on. Write the file
  `<state path>/handoffs/notes-notes.md` with three headings, `## Done`,
  `## Remaining`, and `## Next step`, then run:

  ```bash
  node harness/bin/tutor.mjs unit <topic> notes add notes
  node harness/bin/tutor.mjs unit <topic> notes fail notes --handoff <state path>/handoffs/notes-notes.md
  ```

  and end with the single line `CONTINUE: <handoff path>`. A fresh session
  continues from that file.
- When the work is finished, report at most 150 words in this format:

  ```
  STAGE: notes  UNIT: notes  STATUS: done
  FILES: <path to 07-final-notes>, <path to 08-recall>
  FINDINGS:
  - <n> words in the final notes, <n> cards, recall sync ran.
  - <outcome coverage, for example "all 5 outcomes have a page or project and a card">.
  - <the most important production difference recorded>.
  VISUALS: <visual ids in the refresher>; <n> visual cards
  PROBLEMS: <"none", or one line each>
  ```

## Common mistakes

- Writing a summary of the lesson pages in order. The final notes are organized
  by the nine headings, not by the order in which things were taught.
- Definition cards such as "What is a consumer group?". The learner can recite a
  definition without understanding it. Ask what happens, why, which one to pick,
  or what is wrong.
- A blank line inside a card, or no blank line between two cards. The Spaced
  Repetition plugin then splits or merges cards.
- Renumbering or reusing card ids when repairing the file. The scheduler stores
  the learner's review history by id, so a changed id silently resets it.
- Writing anything below `## My insights`. That area belongs to the learner and
  to the `tutor insight` command.
- Linking to a note that does not exist, for example a repo-intel note for a
  topic whose `repo-intel` stage was skipped.
- Forgetting `tutor recall sync`, which leaves the cards unscheduled.
- A visual refresher that copies the visual notes, embeds every diagram, or
  links a visual that is not in `visuals.json`.
- Padding the notes to look thorough. A year from now the learner wants the
  shortest text that restores the model.
- Counting words with anything other than `tutor words`, and then cutting a
  note that the gate would have accepted.
- An outcome of the plan that appears in no key idea and on no card, or a
  card for an outcome that no page, project, or source supports.
