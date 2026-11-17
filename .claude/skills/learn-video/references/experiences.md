# Schemas: experience.json and deck.json

Full, tested examples: `harness/examples/experiences/<topic>/`. The gates are
`experienceSpecProblems` (`harness/lib/experience.mjs`) and `deckSpecProblems`
(`harness/lib/deck.mjs`). `"SOURCE"` and `"LESSON_PAGE"` in the examples are
placeholders: use real source ids and the repository-relative page path.

## Outline entry (plan.lesson_outline[i], set by learn-intake)

```json
{
  "order": 3, "slug": "step-through-binary-search", "title": "Step through binary search",
  "complexity": "advanced", "importance": "critical", "spatial": false,
  "visual": "Experience", "visual_reason": "The learner must predict each halving.",
  "interaction_goal": "Predict which half is kept, then search for a missing value.",
  "activity": "Quiz",
  "experience": {
    "id": "binary-search-lab",
    "concept_ids": ["binary-search"],
    "signals": { "complexity": 3, "concepts": 3, "dependent_steps": 4, "changes_over_time": true,
                 "spatial": false, "parameters": 2, "decision_paths": 0, "benefit": "high" }
  }
}
```

Add `"mode"` only to override the selector, together with `"override_reason"`.
Explainer pages keep `"video": { "id", "reason" }`.

## experience.json

```json
{
  "id": "binary-search-lab",
  "title": "Step through binary search yourself",
  "mode": "interactive",
  "objective": "Predict which half binary search keeps and explain when the search stops.",
  "level": "intermediate",
  "summary": "12+ words: the text alternative of the whole experience.",
  "concept_ids": ["binary-search"],
  "source_ids": ["python-bisect-docs"],
  "used_in": ["site/src/content/lessons/<sub>/03-step-through-binary-search.mdx"],
  "watch": { "video": "<intro video id>" },
  "guided": { "video": "<walkthrough video id>" },
  "summary_video": "<hybrid summary video id>",
  "deck": "<deck id>",
  "fallback_visual": "<registered mermaid, svg or image id>",
  "simulation": {
    "component": "AlgorithmStepper",
    "props": { "title": "…", "frames": [ { "caption": "…", "array": [2, 5], "pointers": { "low": 0 }, "vars": { "target": 23 } } ] },
    "presets": { "missing-40": { "frames": [ "…" ] } }
  },
  "sync": [ { "scene": "<guided scene id>", "preset": "missing-40" } ],
  "inspect": [ { "id": "mid-formula", "scene": "formula", "label": "Why round down?",
                 "region": { "x": 6, "y": 24, "w": 88, "h": 12 }, "concept_id": "binary-search", "text": "6–60 words." } ],
  "checkpoints": [ "see below" ]
}
```

## Checkpoints

```json
{ "id": "which-half", "kind": "predict", "at": { "scene": "trace" },
  "prompt": "The middle element is 16 and the target is 23. Which part can still hold 23?",
  "choices": [
    { "text": "Only the part right of 16", "correct": true },
    { "text": "Only the part left of 16", "misconception": "Keeps the smaller half, ignoring the sort order" }
  ],
  "explanation": "Why, in 8+ words.", "concept_ids": ["binary-search"], "revisit": "idea" }

{ "id": "stop-progress", "kind": "experiment", "at": { "scene": "minority" },
  "prompt": "Fail servers and send a write until it cannot commit.",
  "goal": { "preset": "healthy",
            "condition": { "all": [ { "path": "live", "op": "lte", "value": 2 }, { "path": "pending", "op": "gte", "value": 1 } ] },
            "hint": "Fail three servers, press Send write, then Step." },
  "explanation": "…", "concept_ids": ["leader-election"] }
```

`kind`: predict, experiment, observe (`look_for`), explain, verify.
`at`: `{ "scene" }` (guided pause), `{ "slide" }` (deck slide), `{ "after": "watch" }`, `{ "tab": "practice" }`.
Condition ops: eq, ne, gt, gte, lt, lte, includes; `path` may be dotted (`vars.found`).

Simulation state keys:

| Component | Keys |
|-----------|------|
| ClusterSim | tick, mode, leader, term, latency, servers, live, failed (ids), committed, pending, delivered, rerouted, explanation, writes |
| AlgorithmStepper | frame, frames, done, caption, vars, pointers |

ClusterSim presets are props overrides (`servers`, `latency`, `failures: ["s3"]`).
Servers are `s1`…`sN`; the lowest live id leads at the start (a simplification
of Raft that the lesson must state).

## deck.json (Mode C)

```json
{
  "id": "funnel-strategy-paths", "title": "…", "purpose": "…", "summary": "12+ words",
  "explanation": "8+ words", "learning_check": { "question": "…", "answer": "…" },
  "concept_ids": ["…"], "source_ids": ["…"], "used_in": ["<lesson page>"],
  "slides": [
    { "id": "question", "heading": "…", "notes": "6+ words for the presenter and the outline",
      "visual": { "type": "title", "subtitle": "…" } },
    { "id": "compare-levers", "heading": "…", "notes": "…", "reveal": true,
      "visual": { "type": "steps", "items": ["…", "…"] },
      "hotspots": [ { "label": "Fix sign-up rate", "target": "signup" } ] }
  ],
  "sequences": [ { "id": "signup", "label": "Fix sign-up rate", "slides": [ { "id": "signup-math", "heading": "…", "notes": "…", "visual": { "type": "bars", "items": [] } } ] } ]
}
```

Visual types are the storyboard types except `custom`. Every sequence must be
opened by a hotspot; branch slides have no hotspots; Previous returns to the
slide that opened the branch.
