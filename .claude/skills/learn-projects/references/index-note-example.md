# Vault index note `03-mini-projects-<slug>.md` — filled example

The stage runner writes this note after all projects are built. `tutor init`
already created the file from a template. Keep its frontmatter and its `# `
title line. Delete the `<!-- tutor:placeholder -->` line and the "Not written
yet" line under it, and write the content in their place. Keep
`## My insights` as the last heading, and write nothing below it.

Rules:

- Project folders are not vault notes. Write their paths as inline code, never
  as wikilinks, because every wikilink must resolve to a file in the vault.
- Every project's folder name (for example `mini-01-job-queue`) must appear in
  the note. The validator looks for each one.
- Inside a table, write wikilinks without the `|Shown text` part, because a pipe
  character would split the table cell.
- Link concepts only when a note with that name exists in `vault/_concepts/` or
  `vault/_tech/` (`ls vault/_concepts vault/_tech`).
- Take "What it proves" from each project's README, in one sentence.
- If you add `sources:` to the frontmatter, use only ids that
  `node harness/bin/tutor.mjs sources <topic> list` prints.

````markdown
---
title: Redis Streams — mini projects
topic: backend-engineering/messaging/redis-streams
stage: mini-projects
tags: [backend-engineering, messaging]
created: 2026-11-14
---

# Redis Streams — mini projects

## How to use these projects

Do the projects in order. Each one removes some guidance: the first tells you
what to write, the second tells you only what must work. Start in the `starter/`
folder, run the tests, and make them pass. Open `solution/` only after your
tests pass or after you have used the hints. Read the
[[02-lesson-redis-streams|lesson]] first.

## Projects

| # | Project | Real use case | Time | Guidance | Open |
|---|---------|---------------|------|----------|------|
| 1 | A job queue that survives worker crashes | Order confirmation emails must not be lost during a deployment | 2 h | guided | `projects/backend-engineering/messaging/redis-streams/mini-01-job-queue/README.md` |
| 2 | Replaying events into a new service | A new analytics service needs last week's orders | 3 h | less guided | `projects/backend-engineering/messaging/redis-streams/mini-02-event-replay/README.md` |

## What each project proves

- **Project 1** proves that consumer groups and the pending entries list give
  at-least-once delivery. Related: [[Consumer group]], [[At-least-once delivery]].
- **Project 2** proves that a stream is a log that can be read again from any
  id, which a queue cannot do. Related: [[Append-only log]].

## My insights
````
