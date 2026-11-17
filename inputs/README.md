# inputs/ — the learner's topic files

Drop one file here per field or subject you want learned. Each file lists many topics
(sections) and their items, like `frontend.html`. The `learn` orchestrator reads this
folder first, imports each file as a roadmap, and generates every topic in order.

Accepted formats:

| Format | How it is used |
|--------|----------------|
| Roadmap HTML with an embedded `const DATA = {...}` (like `frontend.html`, template `harness/templates/roadmap.html`) | Imported as is with `tutor roadmap add`. |
| Roadmap JSON (`{ "title", "phases": [ { "sections": [ { "items": [...] } ] } ] }`, ARCHITECTURE §4.5) | Imported as is. |
| Anything else (`.md`, `.txt`, an HTML page without `DATA`) — a list of topics and subtopics | Converted once to roadmap JSON in `.cache/roadmaps/<slug>.json` (learn-roadmap Step 2C). Your file is never edited. |

See what is here and what is already imported:

```bash
node harness/bin/tutor.mjs roadmap inbox
```

Rules:

- Your files are read-only to the harness. It copies each imported file to
  `state/roadmaps/<slug>/source.*`; `inbox` reports a file as `changed-since-import` when you
  edit it later.
- Every item in a file becomes a required concept of its topic; a topic cannot finish until
  each item is taught (with its real use case and benefit).
- Say `learn inputs/<file>` (or `continue <roadmap>`) to start or resume.
