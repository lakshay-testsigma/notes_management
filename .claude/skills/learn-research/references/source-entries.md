# Source entries: one filled example per type, and fallback thresholds

Use these as patterns. Every value in a real entry must come from a page you opened during
this run. The numbers, dates, and titles below are illustrations of the shape only; never copy
them into a real entry.

Contents: 1. official docs · 2. standard · 3. paper · 4. book · 5. repository ·
6. engineering blog · 7. course or talk · 8. fallback thresholds · 9. tier decision.

## 1. Official docs

```json
{
  "id": "redis-streams-docs",
  "type": "official-docs",
  "title": "Redis Streams",
  "url": "https://redis.io/docs/latest/develop/data-types/streams/",
  "authors": "Redis",
  "year": 2025,
  "tier": "A",
  "why_trusted": "The official documentation of the data type, maintained by the Redis project.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "Redis Ltd.", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://redis.io/docs/latest/develop/data-types/streams/",
  "use_for": ["brief", "digest", "lesson"]
}
```

`year` is the year shown on the page (last updated or copyright). If the page shows none, use
the current year, because you read the live version today.

## 2. Standard

```json
{
  "id": "rfc-7519-jwt",
  "type": "standard",
  "title": "RFC 7519: JSON Web Token (JWT)",
  "url": "https://www.rfc-editor.org/rfc/rfc7519",
  "authors": "M. Jones, J. Bradley, N. Sakimura (IETF)",
  "year": 2015,
  "tier": "A",
  "why_trusted": "The IETF standard that defines the format; every implementation follows it.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": "IETF RFC, Standards Track", "publisher": "IETF", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://www.rfc-editor.org/rfc/rfc7519",
  "use_for": ["digest", "lesson"]
}
```

## 3. Paper

```json
{
  "id": "lewis-2020-rag",
  "type": "paper",
  "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
  "url": "https://arxiv.org/abs/2005.11401",
  "authors": "Patrick Lewis et al.",
  "year": 2020,
  "tier": "A",
  "why_trusted": "The paper that introduced and named the technique, published at NeurIPS 2020.",
  "evidence": { "stars": null, "last_commit": null, "citations": 9000, "venue": "NeurIPS 2020", "publisher": null, "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://api.semanticscholar.org/graph/v1/paper/arXiv:2005.11401?fields=title,year,venue,citationCount",
  "use_for": ["digest", "lesson"]
}
```

`citations` is the exact number the page returned today. `verified_via` is the page that gave
the citation count and venue.

## 4. Book

```json
{
  "id": "kleppmann-2017-ddia",
  "type": "book",
  "title": "Designing Data-Intensive Applications",
  "url": "https://dataintensive.net/",
  "authors": "Martin Kleppmann",
  "year": 2017,
  "tier": "A",
  "why_trusted": "The standard book on the subject, published by O'Reilly and assigned in university and industry reading lists.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "O'Reilly Media", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
  "use_for": ["lesson"]
}
```

A book is flagged `digest` only when the relevant chapter is free to read online.

## 5. Repository

```json
{
  "id": "redis-redis-repo",
  "type": "repo",
  "title": "redis/redis",
  "url": "https://github.com/redis/redis",
  "authors": "Redis",
  "year": 2026,
  "tier": "A",
  "why_trusted": "The reference implementation of Redis Streams, maintained by the Redis company and run in production worldwide.",
  "evidence": { "stars": 68000, "last_commit": "2026-11-01", "citations": null, "venue": null, "publisher": null, "used_by": ["GitHub", "Snap", "Stack Overflow"] },
  "verified_at": "2026-11-14",
  "verified_via": "https://api.github.com/repos/redis/redis",
  "use_for": ["repo-intel", "lesson"]
}
```

- `stars` and `last_commit` come from the `gh api` output (`stargazers_count`, the date part
  of `pushed_at`). `year` is the year of `pushed_at`.
- `used_by` lists only adopters you read on a live page (an adopters file, a "who uses"
  page, a company engineering post). Put that page in `why_trusted` or pick it as
  `verified_via` when the adopters are the main evidence.
- Put the license (for example "BSD-3-Clause") in `why_trusted` when it is unusual or
  restrictive, so the repo-intel stage sees it early.

## 6. Engineering blog

```json
{
  "id": "uber-kafka-dlq-blog",
  "type": "engineering-blog",
  "title": "Building Reliable Reprocessing and Dead Letter Queues with Apache Kafka",
  "url": "https://www.uber.com/blog/reliable-reprocessing/",
  "authors": "Uber Engineering",
  "year": 2018,
  "tier": "B",
  "why_trusted": "Written by the team that runs the system in production at Uber's scale, on Uber's own engineering blog.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "Uber Engineering Blog", "used_by": ["Uber"] },
  "verified_at": "2026-11-14",
  "verified_via": "https://www.uber.com/blog/reliable-reprocessing/",
  "use_for": ["lesson"]
}
```

## 7. Course or talk

```json
{
  "id": "mit-6824-raft-lecture",
  "type": "course",
  "title": "MIT 6.5840 Distributed Systems: Raft lectures",
  "url": "https://pdos.csail.mit.edu/6.824/",
  "authors": "MIT PDOS",
  "year": 2025,
  "tier": "B",
  "why_trusted": "The public MIT graduate course on distributed systems, taught by the research group behind the field's core papers.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": "MIT course 6.5840", "publisher": "MIT CSAIL", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://pdos.csail.mit.edu/6.824/",
  "use_for": ["lesson"]
}
```

## 8. Fallback thresholds

`harness/rubrics/source-quality.md` is the authority. Use the numbers below only when the
rubric is missing or does not cover a case, and say so in `tutor log`.

| Type | Minimum to be recorded at all |
|------|-------------------------------|
| `official-docs`, `standard` | Published on the project's or the standards body's own domain. |
| `paper` | Peer-reviewed at a recognised venue, or at least 500 citations, or it is the paper the official docs name as the origin of the idea. |
| `book` | From an established technical or academic publisher, and named in the playbook or in an official reading list. |
| `repo` | Owned by a well-known company or foundation; not archived; pushed to within the last 12 months; at least 3,000 stars or it is the reference implementation; has a license. |
| `repo` flagged `repo-intel` | All of the above, plus: pushed to within the last 6 months, and evidence of production use read on a live page. |
| `engineering-blog` | On the company's own engineering site; the company runs the technology in production; the post describes real design decisions, not marketing. |
| `course`, `talk` | From a university, a major conference, or the project's own maintainers. |

## 9. Tier decision

| Tier | Meaning | Typical members |
|------|---------|-----------------|
| A | Canonical. If the learner reads one thing, it is this. | Official docs, the standard, the defining paper, the standard book, the reference implementation. |
| B | Strong and widely used. | A well-known engineering blog post, a major conference talk, a university course, a second production repository. |
| — | Not recorded. | Personal blogs, tutorials, listicles, videos without an accountable publisher, anything unverified. |
