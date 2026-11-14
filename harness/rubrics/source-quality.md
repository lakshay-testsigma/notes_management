# Source quality rubric

The operational gate for ARCHITECTURE.md §9. Read by the research stage before any source is written to `sources.json`, and by the verifier at the end.

The learner's time is the scarce resource. They asked for industry-standard material only: the sources a senior practitioner would name without thinking. One excellent source beats five decent ones.

## The four rules

1. **Nothing from memory alone.** A name you remember (or a name in a playbook) is a *candidate*. It becomes a source only after you read its standing on a live page today and recorded what you read.
2. **Unverifiable means dropped.** Page not reachable, numbers not found, author unclear: drop the candidate. Never guess a star count, a citation count, a venue, a year, or a URL.
3. **Tier A or tier B, or it is not written.** There is no tier C.
4. **Fewer and better.** 5–12 sources per topic (3–8 for `quick`), at least one tier A, aim for at least half tier A. Do not lower the bar to fill a quota; a smaller honest list is correct.

## Tiers in one line

- **Tier A, canonical:** the official documentation, the standard itself, the paper that introduced the idea, the standard book of the field, the reference implementation.
- **Tier B, strong and widely used:** recognised and proven in practice, but not the origin or the standard.
- **Reject:** everything else, however well written.

## Thresholds by source type

Every threshold below can be checked on a live page. "Recognised organisation" means: a foundation (Apache, CNCF, Linux Foundation, OWASP, Mozilla), a standards body (IETF, W3C, WHATWG, ISO, NIST, Khronos), the company or core team that created the technology, a company known to run it at scale, a major research lab, or a leading university.

### `official-docs`

| Tier | Requirements (all) |
|---|---|
| A | Hosted on the domain owned by the project, vendor, or standards body. Covers the current stable version. The page is about the topic, not a marketing page. |
| B | Official documentation of a major vendor explaining a general concept it did not create (for example a cloud provider's page on caching patterns). |
| Reject | Mirrors and translations on third-party sites; documentation for an end-of-life version; tutorial sites (W3Schools, GeeksforGeeks, TutorialsPoint); wikis that anyone can edit. |

MDN Web Docs counts as tier A for the web platform. Verify domain ownership when unsure: `gh api repos/<org>/<repo> --jq .homepage` shows the project's official site.

### `standard`

| Tier | Requirements (all) |
|---|---|
| A | Published by the standards body itself. Current: not obsoleted or superseded (for an RFC, the `rfc-editor.org/info/rfcNNNN` page shows the status and any "Obsoleted by"). |
| B | A widely followed industry guideline that is not a formal standard (for example a well-known style or API guideline published by a major company). |
| Reject | Obsoleted RFCs and superseded versions presented as current; drafts that were never adopted; summaries of a standard on other sites. |

### `paper`

| Tier | Requirements (any one) |
|---|---|
| A | (1) The paper that introduced the idea, named as such by the official docs, a standard textbook, or the domain playbook. (2) Published at a top venue of the field **and** 1,000 or more citations. (3) The system paper written by the organisation that built and operates the system (for example the Dynamo or Spanner papers). |
| B | (1) Peer-reviewed at a recognised venue **and** 100 or more citations. (2) Published in the last 24 months by a major lab **and** adoption proven by one of: 100 or more citations, an official implementation with 5,000 or more stars, or use inside a major library or official documentation. |
| Reject | Preprints with fewer than 100 citations and no adoption proof; venues nobody in the field recognises; papers you could not find on a publisher, proceedings, or arXiv page. |

Top venues are listed in each domain playbook under "Trusted sources". Citation counts differ between indexes; record the number you read and where you read it. A source flagged `digest` must have its full text freely and legally readable online.

### `book`

| Tier | Requirements (all) |
|---|---|
| A | A recognised technical or academic publisher (O'Reilly, Addison-Wesley, Pearson, Manning, No Starch Press, Pragmatic Bookshelf, MIT Press, Cambridge University Press, Springer, Wiley, Morgan Kaufmann, CRC Press), or a free official edition by the author that the field has adopted. The author created or maintains the technology, or is a recognised authority (professor, long-time practitioner at a known organisation). It is the current edition and the versions it covers are still in use. The domain playbook or two independent authoritative lists (a university syllabus, the official docs' reading list) name it. |
| B | Recognised publisher and credible author, but not the standard text; or an older edition whose fundamentals still hold (say so in `why_trusted`). |
| Reject | Books about an obsolete major version; self-published books by authors with no standing; publishers of uneven quality unless the author alone meets the tier A author test. |

A paywalled book can never be flagged `digest`. Cite it for facts only when you confirmed them on a freely readable page. At depth `quick` a paywalled book is optional: make one fetch attempt, and if that does not verify it, leave the book out.

### `repo`

| Tier | Requirements (all) |
|---|---|
| A | It is the project itself or the reference implementation of the topic. Owned by a recognised organisation (or the creator's own account for a reference implementation). `archived` is false. Last push within 12 months. 10,000 or more stars, or 2,000 or more in a specialised niche (say which niche in `why_trusted`). A license is present. At least one named production adopter. |
| B | Owned by an organisation or run by an established maintainer team. `archived` is false. Last push within 12 months. 3,000 or more stars, or 1,000 or more in a specialised niche. A license is present. Either a named adopter, or it is a real product that its owner runs in production. |
| Reject | Archived repositories; no push for more than 12 months; no license; personal tutorial repositories, clones, forks, boilerplates, and "awesome" lists; anything trusted for its star count alone. |

Two narrow exceptions, both tier B at most, both stated in `why_trusted`:

- **Official sample.** A reference or sample application published by the organisation that makes the technology (for example Google's `android/nowinandroid`) qualifies below the star threshold. Write "official sample by <organisation>".
- **Frozen reference.** A historic source release or a finished teaching implementation by a recognised author (for example id Software's engine releases) qualifies without recent commits. Write "frozen reference".

A repository flagged `repo-intel` must pass tier A or tier B **and** these extra checks, because a worker will spend hours inside it:

- pushed within the last 90 days (frozen references are never flagged `repo-intel` unless the topic is that code)
- a license that allows reading and quoting (any OSI license; for source-available licenses, record the license name in `why_trusted`)
- real production code with tests and CI, not a demo of a library's API
- a size that `tutor slice` can cut into a handful of slices for the part being studied

Repository names in playbooks are starting points. Projects move between organisations; `gh api` follows the redirect, so always record the `full_name` that the API returns.

### `engineering-blog`

| Tier | Requirements (all) |
|---|---|
| A | Written by the creators of the technology or the team that built the system, on their own site, and it is the primary description of that idea or system. |
| B | On the engineering blog of a company that runs the technology at scale, describing their real production use, with a date and a named author or team. Or written by an individual who is the creator or maintainer, or whose work the official docs or a standard book cites. |
| Reject | Medium, dev.to, Hashnode, and LinkedIn posts by unknown authors; vendor posts whose conclusion is the vendor's product; undated posts; listicles; rewritten summaries of other people's work; content that reads as machine-generated. |

### `course`

| Tier | Requirements (all) |
|---|---|
| A | A public course from a leading university or the official training by the technology's maker, taught by a recognised authority, with materials freely accessible. |
| B | A course from a recognised educator or organisation that the field widely recommends, with a named instructor and a current syllabus. |
| Reject | Marketplace courses by unknown instructors; bootcamp marketing pages; certification dumps; video playlists with no named author or date. |

### `talk`

| Tier | Requirements (all) |
|---|---|
| A | Given at a recognised conference by the creator of the technology or the engineer who built the system, and widely treated as the reference explanation. |
| B | Given at a recognised conference (for example KubeCon, USENIX events, QCon, Strange Loop, JSConf, PyCon, GDC, SIGGRAPH, WWDC, Google I/O, Black Hat, DEF CON) by a practitioner from an organisation running the technology. |
| Reject | Uploads with no event or speaker named; product pitches; re-uploads on channels unrelated to the event. |

## How to verify live

Ask each fetch one narrow question so the answer is short.

| Type | Check | Record in `evidence` |
|---|---|---|
| `official-docs` | Fetch the page. Confirm the domain belongs to the project and the page covers the topic and the current version. | `publisher` |
| `standard` | Fetch the standards body's page. Confirm status and that it is not obsoleted. | `venue` (body and status), `publisher` |
| `paper` | Fetch the proceedings, publisher, or arXiv page for title, authors, year, venue. Then get the citation count (see below). | `venue`, `citations` |
| `book` | Fetch the publisher's catalog page for authors, edition, year. If the publisher blocks automated requests, use the author's or the book's official site when it states publisher and edition. | `publisher` |
| `repo` | `gh api repos/<org>/<repo> --jq '{full_name, owner_type: .owner.type, stars: .stargazers_count, pushed_at, archived, license: .license.spdx_id, homepage}'` (without `gh`: `curl -s https://api.github.com/repos/<org>/<repo>`). Find adopters in `ADOPTERS.md`, the project's "users" page, or the foundation's project page. | `stars`, `last_commit` (the date part of `pushed_at`), `used_by` |
| `engineering-blog` | Fetch the post. Confirm the site is the company's own, the date, the author, and that it describes production use. | `publisher`, `used_by` |
| `course`, `talk` | Fetch the page of the university, conference, or project. Confirm instructor or speaker, event, and year. | `venue` or `publisher` |

**Citation counts.** Try Semantic Scholar first:

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:<id>?fields=title,year,venue,citationCount"
curl -s "https://api.semanticscholar.org/graph/v1/paper/DOI:<doi>?fields=title,year,venue,citationCount"
```

It often answers `429 Too Many Requests` without an API key. Wait five seconds and retry once, then use OpenAlex:

```bash
curl -s "https://api.openalex.org/works/https://doi.org/<doi>?select=title,publication_year,cited_by_count"
# for an arXiv paper the DOI is 10.48550/arXiv.<id>
```

Google Scholar cannot be read reliably by a script; do not quote its numbers unless you fetched the page.

## What to write in each field

All fields are required by `tutor sources add`. Use `null` (or `[]` for `used_by`) where a value does not apply; at least one `evidence` value must be filled.

| Field | Rule |
|---|---|
| `id` | Lowercase kebab-case, unique in the topic. `<project>-docs`, `<first-author>-<year>-<keyword>` for papers and books, `<org>-<repo>-repo`, `<company>-<keyword>-blog`. |
| `type` | One of `official-docs`, `paper`, `book`, `repo`, `engineering-blog`, `course`, `talk`, `standard`. |
| `title`, `authors` | Exactly as shown on the live page. `authors` may be an organisation. |
| `url` | The canonical page the learner should open. |
| `year` | Whole number. Publication year; for living docs and repositories, the year of the latest revision you saw. |
| `tier` | `A` or `B`, decided by the tables above. |
| `why_trusted` | One sentence a senior engineer would accept: who stands behind it and why it is the reference. No adjectives such as "great" or "comprehensive". Name the exception or an unusual license here. |
| `evidence` | Only values read today. Numbers as numbers. `last_commit` as `YYYY-MM-DD`. `used_by` as a list of organisation or project names you saw named on a page. |
| `verified_at` | Today's date, `YYYY-MM-DD`. |
| `verified_via` | The exact URL where the evidence was read (the API URL for repositories and citation counts, the page URL otherwise). Not a search-results page. |
| `use_for` | One or more of `brief`, `digest`, `repo-intel`, `lesson`. `digest` only for sources whose full text is freely readable; `repo-intel` only for repositories that pass the extra checks. |

A good `why_trusted`: "The official documentation of the data type, maintained by the Redis project." A bad one: "A very popular and comprehensive guide to streams."

## The right mix

For a `standard` topic aim for roughly: 1–3 official docs or standards, 1–3 defining papers or standard books, 1–3 repositories, 0–2 engineering blog posts, 0–2 courses or talks. A topic with no official documentation (a concept, a pattern) leans on the defining paper and the standard book. A non-code topic in the `general` domain has no repositories.

## One valid entry per type

The evidence values below were read live on the date shown, from the page in `verified_via` (the adopter of the repository from its README). They show the shape and the level of proof; re-verify before reusing any of them.

`official-docs`

```json
{
  "id": "redis-streams-docs",
  "type": "official-docs",
  "title": "Redis Streams",
  "url": "https://redis.io/docs/latest/develop/data-types/streams/",
  "authors": "Redis",
  "year": 2026,
  "tier": "A",
  "why_trusted": "The official documentation of the data type, maintained by the Redis project on its own domain.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "Redis", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://redis.io/docs/latest/develop/data-types/streams/",
  "use_for": ["brief", "digest", "lesson"]
}
```

`standard`

```json
{
  "id": "rfc-9110-http-semantics",
  "type": "standard",
  "title": "RFC 9110: HTTP Semantics",
  "url": "https://www.rfc-editor.org/rfc/rfc9110",
  "authors": "R. Fielding, M. Nottingham, J. Reschke (IETF)",
  "year": 2022,
  "tier": "A",
  "why_trusted": "The current IETF Internet Standard that defines HTTP methods, status codes, and headers; it obsoletes the earlier HTTP/1.1 semantics RFCs.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": "IETF, Internet Standard", "publisher": "RFC Editor", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://www.rfc-editor.org/info/rfc9110",
  "use_for": ["digest", "lesson"]
}
```

`paper`

```json
{
  "id": "vaswani-2017-attention",
  "type": "paper",
  "title": "Attention Is All You Need",
  "url": "https://arxiv.org/abs/1706.03762",
  "authors": "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin",
  "year": 2017,
  "tier": "A",
  "why_trusted": "The paper that introduced the Transformer architecture, published at NeurIPS 2017 and cited more than 100,000 times.",
  "evidence": { "stars": null, "last_commit": null, "citations": 136318, "venue": "NeurIPS 2017", "publisher": null, "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://api.openalex.org/works/https://doi.org/10.48550/arXiv.1706.03762",
  "use_for": ["digest", "lesson"]
}
```

`book`

```json
{
  "id": "kleppmann-2026-ddia",
  "type": "book",
  "title": "Designing Data-Intensive Applications, 2nd Edition",
  "url": "https://dataintensive.net/",
  "authors": "Martin Kleppmann, Chris Riccomini",
  "year": 2026,
  "tier": "A",
  "why_trusted": "The standard text on replication, partitioning, and consistency for backend and data engineers, in its current edition from O'Reilly.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "O'Reilly Media", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://martin.kleppmann.com/2026/03/24/designing-data-intensive-applications-2e.html",
  "use_for": ["lesson"]
}
```

`repo`

```json
{
  "id": "etcd-io-etcd-repo",
  "type": "repo",
  "title": "etcd",
  "url": "https://github.com/etcd-io/etcd",
  "authors": "etcd-io (CNCF project)",
  "year": 2026,
  "tier": "A",
  "why_trusted": "The reference production use of Raft: a CNCF project under the Apache-2.0 license that Kubernetes uses as its datastore.",
  "evidence": { "stars": 52603, "last_commit": "2026-11-13", "citations": null, "venue": null, "publisher": null, "used_by": ["Kubernetes"] },
  "verified_at": "2026-11-14",
  "verified_via": "https://api.github.com/repos/etcd-io/etcd",
  "use_for": ["repo-intel", "lesson"]
}
```

`engineering-blog`

```json
{
  "id": "stripe-idempotency-blog",
  "type": "engineering-blog",
  "title": "Designing robust and predictable APIs with idempotency",
  "url": "https://stripe.com/blog/idempotency",
  "authors": "Brandur Leach (Stripe)",
  "year": 2017,
  "tier": "B",
  "why_trusted": "Written by a Stripe engineer on Stripe's own blog, describing how a payments API that runs at scale makes retries safe with idempotency keys.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "Stripe", "used_by": ["Stripe"] },
  "verified_at": "2026-11-14",
  "verified_via": "https://stripe.com/blog/idempotency",
  "use_for": ["lesson"]
}
```

`course`

```json
{
  "id": "mit-6-5840-distributed-systems",
  "type": "course",
  "title": "6.5840: Distributed Systems",
  "url": "https://pdos.csail.mit.edu/6.824/",
  "authors": "MIT (course 6.5840, formerly 6.824)",
  "year": 2026,
  "tier": "A",
  "why_trusted": "MIT's graduate distributed systems course, with public schedule, readings, and Raft labs.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": null, "publisher": "Massachusetts Institute of Technology", "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://pdos.csail.mit.edu/6.824/",
  "use_for": ["lesson"]
}
```

`talk`

```json
{
  "id": "roberts-2014-event-loop",
  "type": "talk",
  "title": "What the heck is the event loop anyway?",
  "url": "https://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html",
  "authors": "Philip Roberts",
  "year": 2014,
  "tier": "B",
  "why_trusted": "A JSConf EU 2014 talk, published on the conference's own site, that became the common visual explanation of the JavaScript event loop.",
  "evidence": { "stars": null, "last_commit": null, "citations": null, "venue": "JSConf EU 2014", "publisher": null, "used_by": [] },
  "verified_at": "2026-11-14",
  "verified_via": "https://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html",
  "use_for": ["lesson"]
}
```

## Self-check before `tutor sources add`

- I fetched a live page for this source in this session, and `verified_via` is that page.
- Every number in `evidence` is one I read, not one I remember.
- The tier follows a row in the tables above, and I can point to the row.
- `why_trusted` names who stands behind the source, and names any exception or unusual license.
- A `digest` source is freely readable in full; a `repo-intel` repository passes the extra checks.
- Removing this source would make the topic's list worse. If not, leave it out.
