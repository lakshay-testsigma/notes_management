# Pointer note `02-lesson-<slug>.md` — filled example

The stage runner writes this note after all pages exist. It is the place in
the Obsidian vault that says where the interactive lesson is and what each page
teaches. It is a pointer, not a copy: do not repeat the lesson text here.

`tutor init` already created the file from a template. Keep its frontmatter and
its `# ` title line. Delete the `<!-- tutor:placeholder -->` line, the "Not
written yet" line under it, and any other scaffold sentence that stands
between the title and `## My insights` (for example "The lesson pages live on
the local site at…"); the sections below replace all of it. Keep
`## My insights` as the last heading, and write nothing below it.

Rules:

- The note must contain the site path of the topic: the value of `site_url` in
  the output of `node harness/bin/tutor.mjs paths <topic> --json`, which has the
  form `/<domain>/<subdomain>/<slug>/`. The validator checks for it.
- List every page in order, one line each: the file name without `.mdx`, the
  title, the one idea of the page, the visual it uses, and the plan outcome
  the page serves ("Serves outcome 2."). Take the idea and the outcome number
  from the worker summaries (or from each page's `description`). The number is
  the position of the outcome in `plan.outcomes`, counted from 1.
- Lesson pages are not vault notes, so page names are inline code, not
  wikilinks. Wikilinks go only to vault notes that exist.
- Under "What you can do after it", list every item of `plan.outcomes`
  (`node harness/bin/tutor.mjs plan <topic> --json`), each followed by where it
  is taught: its pages, or a mini project or the capstone. This list is the
  coverage check. If an outcome has no page and no project, write "(not
  taught on a page)" after it and record it with
  `node harness/bin/tutor.mjs log <topic> "lesson: outcome <n> has no page"`;
  finalize then repairs the page or the outcome. Never drop the outcome from
  the list to make the note look complete.

````markdown
---
title: "Redis Streams — lesson"
topic: backend-engineering/messaging/redis-streams
stage: lesson
tags: [backend-engineering, messaging]
created: 2026-11-14
---

# Redis Streams — interactive lesson

## Open the lesson

The lesson pages live on the local site at
`/backend-engineering/messaging/redis-streams/`. Start the site with
`npm run site:dev`, then open that path. Read the pages in order; each one
takes about five minutes. Read the [[01-brief-redis-streams|brief]] first.

## Pages

1. `01-what-is-a-stream` — What is a stream? An append-only log in which every
   entry keeps its id. Visual: animated flow of entries being appended and read.
   Serves outcome 1.
2. `02-reading-a-stream` — Reading a stream. A reader chooses where to start,
   so the same entries can be read again. Visual: timeline you can scrub.
   Serves outcome 1.
3. `03-consumer-groups` — Consumer groups. A group hands each entry to exactly
   one of its consumers. Visual: simulator you drive by hand. Serves outcome 2.
4. `04-pending-and-claiming` — Pending entries and claiming. An unacknowledged
   entry stays on record until another worker claims it. Visual: animated flow
   with a crash toggle. Serves outcome 2.
5. `05-poison-messages` — Poison messages. An entry that always fails must be
   moved aside after a few attempts. Visual: state machine of one entry.
   Serves outcome 3.
6. `06-streams-or-kafka` — Streams or Kafka? Memory against disk decides how
   much history you can keep. Visual: playground with retention and volume.
   Serves outcome 4.

## What you can do after it

1. Explain how a stream differs from a list and from pub/sub. Pages 1–2.
2. Explain how a consumer group tracks pending entries and what XACK changes.
   Pages 3–4.
3. Build a worker that reads, acknowledges, and recovers entries left by a
   crashed worker. Page 5 and mini project 1.
4. Decide when Redis Streams is enough and when a system needs Kafka. Page 6.

Continue with the [[03-mini-projects-redis-streams|mini projects]].

## My insights
````
