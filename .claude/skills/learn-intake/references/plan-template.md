# Plan template and component chooser

Read this before writing a plan. It has three parts: the component chooser, a complete filled
plan, and a checklist to run before `tutor plan --set`.

## 1. Component chooser

The playbook heading "Lesson recipes" of the topic's domain comes first. Use this table when
the playbook says nothing about the kind of idea a page teaches. Only these names exist
(`site/components.manifest.json` is the authority if it differs).

| The page teaches | Visual to choose |
|------------------|------------------|
| Data or a request moving through steps | `FlowAnimation` |
| The parts of a system and how they connect | `SystemDiagram` |
| Messages between actors over time | `SequenceDiagram` |
| States and what moves between them | `StateMachine` |
| A network, a dependency graph, a cluster | `Graph3D` |
| Embeddings, vectors, distance, geometry | `VectorSpace3D` |
| Numbers, benchmarks, a trade-off curve | `Chart` |
| One setting whose effect the learner should feel | `ParamPlayground` |
| Code that must be read line by line | `CodeWalkthrough` |
| History, versions, phases of a process | `Timeline` |
| A small static relationship | `Mermaid` |

| The learner should practise | Activity to choose |
|-----------------------------|--------------------|
| Guessing what happens next before seeing it | `PredictReveal` |
| Putting the steps of a process in order | `OrderSteps` |
| Connecting terms to their meanings | `MatchPairs` |
| Choosing between options, trade-offs, "which is true" | `Quiz` |

Rules across the whole outline:

- `FlowAnimation` appears at least once.
- When the topic has graph or spatial structure, `Graph3D` or `VectorSpace3D` appears at
  least once.
- No single activity is used on every page. Use `PredictReveal` early, because predicting
  before reading improves memory.
- `Resources` and `Figure` are utility components. Never put them in `visual` or `activity`.

## 2. A complete filled plan

Topic "Redis Streams", domain `backend-engineering`, subdomain `messaging`, depth `standard`
(6 pages, 2 mini projects, 3 digests, 1 repository, capstone enabled).

```json
{
  "summary": "Redis Streams is an append-only log inside Redis that lets several services read the same sequence of events reliably, each at its own pace.",
  "prerequisites": [
    { "concept": "Redis basics", "known": false, "bridge": "Redis is an in-memory database that stores values under keys." },
    { "concept": "Message queue", "known": false, "bridge": "A message queue lets one program leave work for another." },
    { "concept": "At-least-once delivery", "known": false, "bridge": "Delivery may repeat; survival depends on persistence and retention." }
  ],
  "outcomes": [
    "Explain how a stream differs from a list and from pub/sub.",
    "Explain how a consumer group tracks pending entries and what XACK changes.",
    "Build a worker that reads, acknowledges, and recovers entries left by a crashed worker.",
    "Decide when Redis Streams is enough and when a system needs Kafka instead."
  ],
  "lesson_outline": [
    { "order": 1, "slug": "what-is-a-stream", "title": "What is a stream?", "visual": "FlowAnimation", "activity": "PredictReveal" },
    { "order": 2, "slug": "entries-and-ids", "title": "Entries and their IDs", "visual": "Timeline", "activity": "MatchPairs" },
    { "order": 3, "slug": "reading-a-stream", "title": "Reading: from the start, or only what is new", "visual": "SequenceDiagram", "activity": "PredictReveal" },
    { "order": 4, "slug": "consumer-groups", "title": "Consumer groups share the work", "visual": "Graph3D", "activity": "OrderSteps" },
    { "order": 5, "slug": "acknowledge-and-recover", "title": "Acknowledging, and recovering from a crash", "visual": "StateMachine", "activity": "Quiz" },
    { "order": 6, "slug": "streams-in-production", "title": "Streams in production: trimming, memory, and limits", "visual": "ParamPlayground", "activity": "Quiz" }
  ],
  "mini_projects": [
    { "n": 1, "slug": "job-queue", "use_case": "An online shop's order service hands slow work (sending the confirmation email) to background workers, and no job may be lost when a worker crashes." },
    { "n": 2, "slug": "activity-feed", "use_case": "A team dashboard shows a live feed of deployments and alerts, and a user who reconnects sees everything they missed." }
  ],
  "digest_targets": 3,
  "repo_targets": 1,
  "capstone": {
    "name": "Order event pipeline",
    "problem": "A shop must process each order event exactly once in effect (charge, reserve stock, notify) across several workers, survive worker crashes, and show operators what is stuck."
  }
}
```

Why this plan is good:

- Each page title is one idea, and the pages build on each other in reading order.
- Every outcome maps to pages: outcome 1 → pages 1–2, outcome 2 → pages 4–5, outcome 3 → mini
  project 1 and the capstone, outcome 4 → page 6. No outcome is left without a page or a
  project.
- Every bridge has at most 12 words and every outcome at most 15, so the brief, which
  copies them, stays inside its 400-word limit.
- Concept names are in sentence case ("Message queue", "At-least-once delivery").
- The visuals match the idea: a state machine for the life of a pending entry, a 3D graph for
  producers, the stream, and the consumers of a group.
- Each mini project names a real user and a real need, not "practise XADD".

## 3. Checklist before `tutor plan --set`

Go through every line. Fix the plan file when a line is not true.

1. The file is valid JSON and has exactly the eight top-level keys.
2. `lesson_outline` has the right number of pages for the depth, and `order` runs 1, 2, 3…
3. Every `visual` is a visual component name and every `activity` is an activity component
   name, spelled exactly.
4. `FlowAnimation` is used at least once; a 3D component is used when the topic has graph or
   spatial structure.
5. `outcomes` has 3–6 items with at least one explain, one build, and one decide. Each has
   at most 15 words, and each is taught by a page of the outline or by a mini project.
6. Every prerequisite with `known: false` has a one-sentence `bridge` of at most 12 words,
   and every `concept` name is in sentence case.
7. `mini_projects` has the count for the depth, `n` runs 1, 2, 3, and every `use_case` names
   who needs it and for what.
8. `digest_targets` and `repo_targets` are numbers within the depth profile; `repo_targets`
   is 0 when the topic has no `repo-intel` stage.
9. `capstone.name` and `capstone.problem` are filled in.
