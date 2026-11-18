# Evidence-led learning with any capable model

This is the operating guide for the `learn` orchestrator and its workers. Load it
after `docs/ARCHITECTURE.md` and `CLAUDE.md`. The same contracts apply to DeepSeek,
Kimi, or any other model used by the host. The `tutor` CLI does not call a provider API,
select a model, set reasoning parameters, or guarantee equal quality across models.
The learner chose two model tiers, declared in the role files of `.claude/agents/`
(`tier:` plus the actual `model:`): **fact** (cheaper: research, digests, repository analysis, projects, gap
audits) and **writer** (stronger: lesson pages, experiences, review, and the inline brief
and notes). The default Claude mapping is fact → `sonnet`, writer and
orchestrator → `opus`, declared in `.claude/agents/`. An optional Codex mapping
lives in `.codex/config.toml` and `.codex/agents/`. On another host, map fact to its cheaper model and writer to its strongest.
Use the model id actually available in the host; never invent an id from a spoken
name. More reasoning cannot substitute for live sources, executable checks, and
independent review.

## Start with capabilities and a learner profile

Before generation, run `tutor doctor`, test access to a canonical source, and check
that the host can search, fetch pages, run commands, edit files, and launch fresh
workers. Record actual limitations through `tutor log`. Establish services listed
by project `verification.json` before executing them. A failed network check blocks
research; it does not permit filling evidence fields from memory.

Use `plan.learner` to record the learner's stated experience, known concepts, and
goals, for example:

```json
{"experience":"software developer","known":["basic programming"],"goals":["debug production failures","choose designs using trade-offs"]}
```

For this learner, explain unfamiliar domain concepts from first principles without
re-teaching basic programming. Every unknown prerequisite still gets a bridge.
New plans produced by `learn-intake` use `visual_policy: "adaptive"` and the
curriculum below. Existing topics retain their plan until deliberately upgraded
with `tutor plan --set`; keep note identities and recall history.

## Discover, expand, and stop explicitly

Intake creates a provisional concept tree. Research replaces guesses with evidence
before writing teaching material. Use this loop, not a single query followed by a
long answer:

1. Find the official specification or documentation and its topic structure.
   Cross-check it against a second authoritative treatment or production source.
   Search the open web for omissions, alternative terminology, limitations, and
   current industry practices, even when the playbook already has enough sources.
   Search result snippets suggest candidates; read the actual source before citing.
2. Build a frontier of concepts to investigate. For each, discover prerequisites,
   mechanism, sub-concepts, alternatives, practical applications, and failure modes.
   Prioritize career-critical concepts and the learner's explicit requirements.
   A term's popularity alone is insufficient evidence of its importance.
3. Work breadth first, one small branch per fresh research worker. Deduplicate aliases
   to stable concept ids. Record a parent for each child; roots have `parent: null`.
   Investigate each included child in a later frontier. A leaf still needs a source
   check confirming that it needs no further expansion inside the chosen scope.
4. Record each round's frontier, inspected source ids, added ids, and conclusions.
   Sources must be vetted through `tutor sources`; 5–12 strong sources per scoped
   topic (3–8 at quick depth) remains the limit. Reuse sources across concepts when
   they actually cover them. Do not use a generic landing page as evidence for every
   child. Keep exact sections and claim/evidence excerpts in worker draft reports.
5. Stop only at a documented boundary: saturation (the investigated frontier yields
   no new in-scope concepts), scope boundary, or budget limit. Log inaccessible
   sources, unresolved disagreements, and deferred concepts. Neither a budget limit
   nor a finite map proves that every concept on the internet was found.

Recommended starting limits are depth/concepts: quick 2/12, standard 3/30, deep 4/60.
Root concepts have depth 0. These are discovery bounds, not desired counts. Hard safety bounds are depth 8 and
200 concepts per topic. Set query/fetch limits per unit (start with 4 queries and
8 narrow fetches); set max_rounds (default 6, allowed 1–20), then save the unfinished frontier and
resume it or report the scope limit. Repeated queries must address a concrete gap.
Cache retrieved text under `.cache/`; record retrieval URLs and dates. Never claim
to have read a page that could not be retrieved.

For a subject such as frontend engineering, investigate branches such as browser
execution, HTML/CSS, JavaScript, state and data flow, networking, accessibility,
performance, testing, security, rendering, and delivery. This is a seed list to
verify and expand, not a canonical syllabus. For an AI agent topic, similarly
investigate context, memory, tools, retrieval, evaluation, guardrails, and security
only as supported by the actual topic and sources. Resolve ambiguous names such
as an unexplained acronym before researching the wrong subject.

## The machine-readable curriculum

Store this under `plan.curriculum`, only using `tutor plan --set`. Intake checks its
shape; research also checks its source and discovery references; finalize checks
the generated coverage. Arrays are replaced as a whole by `plan --set`, so only the
orchestrator merges worker proposals. Research workers must not race to overwrite
the tree.

```json
{
  "schema": 1,
  "scope": "Explain browser task scheduling and diagnose blocked rendering.",
  "max_depth": 3,
  "max_concepts": 30,
  "concepts": [
    {
      "id": "event-loop",
      "title": "Event loop",
      "parent": null,
      "complexity": "advanced",
      "importance": "critical",
      "disposition": "included",
      "source_ids": ["html-event-loops"],
      "coverage": [
        {
          "path": "vault/frontend-engineering/browser/event-loop/concepts/event-loop-event-loop.md",
          "aspects": ["explanation", "mechanism", "use-case", "trade-offs", "failure-modes", "practice"]
        }
      ]
    }
  ],
  "discovery": [
    {"round":1,"frontier":["event-loop"],"source_ids":["html-event-loops"],"added":["event-loop"]},
    {"round":2,"frontier":["event-loop"],"source_ids":["html-event-loops"],"added":[],"stop_reason":"scope-boundary","note":"Browser scheduling only; Node.js phases need a separate topic."}
  ]
}
```

This illustrates the shape, not verified research. Obtain real paths from `tutor
paths`; obtain source ids by verifying sources. Freeze planned coverage paths by research close to avoid plan churn during generation.
If coverage/outline changes later, re-gate earlier required stages in order and
renew their execution evidence before continuing. Intake may use empty source_ids,
coverage, and discovery while the tree is provisional. At least one concept must
be included. Every concept must occur in a discovery `added` list; every included
concept must occur in an investigated frontier. Concepts use `basic`, `intermediate`,
or `advanced` complexity and `supporting`, `core`, or `critical` importance.
`deferred` and `excluded` concepts need an explicit `reason`. Deferred requirements
must be reported to the learner, and must not be relabelled excluded merely to pass.

For adaptive plans, every included intermediate/advanced or critical concept also
needs coverage in an MDX lesson whose planned complexity is at least as high, whose
importance is critical when the concept is critical, and whose visual is nonnull.
A Markdown note alone cannot satisfy the requested interaction for a hard concept.

Each included concept needs all six teaching aspects. `use-case` means a real
situation where a developer meets the concept **and** the benefit it gives over the
alternative; a use case without a stated benefit does not cover the aspect. For an abstract concept,
practice can be a worked prediction or debugging exercise rather than a large app.
Coverage can span multiple files; the union of `aspects` must contain all six.
Put `<!-- concept: event-loop -->` in each referenced Markdown/MDX file above
`## My insights`. Optional `anchor` is a literal substring in that generated body,
not a generated URL fragment. File existence, markers, and declared aspects provide
traceability; a reviewer must check that the prose actually teaches those aspects.

## Turn researched concepts into a readable course

Keep the lesson-page counts of the depth profile. A short page teaches one idea in
110–260 words and retains a prediction or activity. Do not compress an entire field
into twelve superficial pages. Use supplementary topic notes for included concepts
that need more depth, at `curriculum_dir` from `tutor paths`, one concept per worker.
Name them `<concept-id>-<topic-slug>.md`, with `stage: concept`, normal frontmatter,
source ids, and a protected insights boundary. Write drafts through `tutor write-note`.

Each note should explain what the concept is, its mechanism with a worked trace,
who uses it and why, when to choose or avoid it, the failures it prevents or causes,
and a practical exercise with a checkable answer. Explain uncertainty and competing
designs instead of presenting one implementation as universal. Use source sections
beside non-obvious claims. Link the notes from the lesson index in prerequisite order.
`tutor map` also exposes the recorded coverage and deferrals in the topic map; the
site renders supplemental notes under More notes. Existing digest/repo order stays intact.

If a branch requires more than the topic's source/page budget, initialize a narrower
topic with the CLI, link it, and run its own pipeline. Maintain a queue of remaining
topic ids in the orchestrator handoff. A requested complete course is unfinished
while required queued topics are undelivered; report that explicitly. Do not silently
lower scope, source-quality thresholds, or required digest/repo targets to get green.

## Choose visuals by learning value

Set `visual_policy: "adaptive"`. Each outline page records `complexity`, `importance`,
`spatial` (boolean), `visual` (component name or null), `visual_reason`, and, when it
has a visual, `interaction_goal`. Activities remain required on every page.

| Concept | Treatment |
|---|---|
| Basic and already familiar | Short prose/code and a question; visual may be null with a reason |
| Intermediate or career-critical | A focused diagram, trace, graph, or interactive control |
| Advanced with geometric or graph relationships | Manipulable Graph3D or VectorSpace3D; editable Graph3D when advanced |
| Advanced without spatial meaning | ParamPlayground, StateMachine, FlowAnimation, ClusterSim, AlgorithmStepper or CodePlayground explaining the mechanism, with a reason for the choice |

Do not add decorative 3D to a simple API call or invent geometry for security rules.
For vector search, let the learner manipulate points/query/distance and observe
neighbors. For memory or scheduling, show allocations, ownership, queues, or state
transitions; use 3D only when that representation helps. Each interaction needs an
observable outcome, labels, an initial state, and a reset. Keep page layout linear
with plain paragraphs and open visual sections; no cards or callout boxes. Validate
props against `site/COMPONENTS.md` and run browser smoke checks. Review semantics
and controls as well as rendering.

## Visual candidates and the writing standard

New plans also set `visual_first: true` and `multi_stage` (see `learn-intake`), and the
standard in `harness/rubrics/visuals.md` applies to every stage. Research feeds it:

- Each concept may carry `prerequisites: [concept ids]` in `plan.curriculum`. The vault
  export (`tutor map`) draws them, with the parent links, as `concept-map-<slug>.md`.
- Research workers record **visual candidates**: ordered sequences, dependencies,
  architectures, comparisons, state changes and key numbers that a vetted source states,
  each with its source id and exact section. The orchestrator merges them into
  `<handoffs_dir>/visual-candidates.md`. Later stages draw only relationships from that
  file or from the digests and repo-intel evidence; an unsourced arrow is a defect.
- A multi-stage process found here sets `multi_stage: true` and, for a true
  chronological or causal sequence, a planned `video` on its page before the plan freezes.
- Every summary, proposal and note follows `harness/rubrics/writing-standard.md` (about
  80% of ASD-STE100): short active sentences, one term per thing, terms defined before
  use, beginner explanation first and technical depth after it, and analogies,
  assumptions and interpretations marked. `tutor style <file>` reports the measurable
  part.

## Keep cheaper-model work small and recoverable

Use the host's actual context limit, not a guessed provider marketing value. Budget
instructions, source excerpts, and output reserve together with `tutor budget` and
`tutor slice`. Default unknown capacity is 32768 tokens with a 3000-token reserve;
the CLI computes the usable allowance. Prefer one branch, one note, one project,
or one hard visual per worker. Avoid feeding the whole repository, full topic.json,
or a previous conversation into a fresh worker.

The orchestrator passes a task, exact inputs/outputs, assigned concept ids, source
ids and URLs, acceptance checks, and the fix list. It reads only metadata and short
returns. Persist evidence and next actions as you go. Workers return no more than
150 words; large findings go in the assigned draft/handoff. Reuse verified work and
repair the smallest failing unit. Keep the existing retry/continuation limits.

Concurrency is the smaller of the host's available worker slots and the depth limit
(2/4/5). A low-cost run can use fewer simultaneous workers; it cannot omit units or
reviews. Agent names in `.claude/agents` describe roles, not portable API types.
Pass the role file to the host's fresh-worker API. If the host has no fresh workers,
generation units may run serially with saved handoffs, but independent review stays
pending until a separate fresh session performs it. Do not certify your own material
as an independent review. Keep each role on its declared tier: never move fact work to
the writer tier to fix wording; send the facts to a writer instead.

## Review after generation in fresh isolated sessions

After notes, structure checks, and execution checks pass, obtain the review packet:

```bash
node harness/bin/tutor.mjs review <topic> --json
```

It gives `input_fingerprint` and `required_checks` for each scope. Spawn fresh content
and project reviewers with those values, the learner request, projected plan, assigned
sources, and exact artifact paths. Do not send author reasoning or self-review verdicts.
At quick depth one fresh worker may cover both scopes; standard/deep require different
reviewer run ids. Large reviews split into bounded evidence inspections; the final
reviewer receives the evidence files and lists any unchecked requirements.

Before dispatch, the orchestrator provides a running preview of the current build
and an actual host browser tool or installed headless Playwright procedure. It owns
the preview's bounded lifecycle and stops it when review ends. Reviewers hydrate,
change controls, check observable results, and reset. Rendering smoke checks alone
do not establish meaningful interaction; absent runtime inspection leaves
visual-usefulness unreviewed and prevents pass.

During inspection, use validate --all --structure-only for artifact failures and
inspect execution receipts separately. Missing review imports are expected until
review completes, not content defects. Run full readiness validation after importing
both passing scopes, avoiding a circular prerequisite.

Content review checks every included concept's six aspects, explicit learner
requirements, source support, meaningful visuals, practical value, and learner fit,
as well as the existing checks. Re-open sources for central and risky claims and
cross-check every branch; log inaccessible evidence and unresolved contradictions.
Project review checks declared commands, services, tests, starter behavior, dependencies,
and architecture. A required check left unreviewed cannot receive a passing verdict.

For curriculum plans, each review JSON additionally includes:

```json
{
  "independent": true,
  "reviewer_run_id": "actual-fresh-worker-id",
  "input_fingerprint": "value-from-the-review-packet",
  "assessments": {"research-coverage":"Inspected concept ids and paths; result and evidence here."}
}
```

This is an addition to `scope`, `reviewer`, `verdict`, `checks`, `findings`, and
`not_checked`. Include a nonempty `assessments` entry for EVERY required check;
the fragment above is incomplete on purpose. The reviewer returns exact JSON in
its response; the orchestrator saves it outside `state/` and imports with `tutor
review <topic> --file <json>`. Record the real worker id, not an invented name.
The CLI rejects stale fingerprints, missing checks, self-declared nonindependence,
and reused content/project reviewer ids at standard/deep depth. Independence itself
is an attestation backed by the host's run history, not something JSON can prove.

Repair findings through the owning worker. Artifact changes invalidate receipts
and reviews: re-gate affected stages in generation order, renewing research/project
checks as necessary. Run tutor check finalize after the last edit and re-gating, then
obtain a new packet and refresh both review scopes. Plain build/smoke does not renew
CLI evidence. Do not change artifacts between passing reviews and done finalize.
Report completion only when `tutor done <topic> finalize` passes. State any deferrals,
unfinished child topics, missing network access, or untested environment plainly.
