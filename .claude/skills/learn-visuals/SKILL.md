---
name: learn-visuals
description: The shared visual and writing capability of the tutor harness. Decides which diagram, simulation, video or interactive experience (explainer, interactive lesson, branching deck, hybrid lab via learn-video and `tutor experience select`) explains a concept, grounds every drawn relationship in a vetted source, draws it reproducibly (mermaid, SVG, a lesson component, or a HyperFrames video through learn-video), registers it with `tutor visuals` so the lesson site and the Obsidian vault show the same file with its explanation, alt text, sources and learning check, and applies the ASD-STE100-based writing standard. Every stage skill (research, brief, digest, repo-intel, lesson, mini-projects, capstone, notes, recall) calls this skill instead of drawing its own way. Also use it whenever the learner asks to "draw", "diagram", "visualize", "make a picture/flowchart/architecture diagram/concept map of" something in a topic of this repository, or asks for simpler wording.
argument-hint: "<topic id> [what to visualize]"
---

# learn-visuals — shared visual explanations

The learner wants to understand complex material fast, experiment with it,
and remember it months later. Long paragraphs do not do that. A good visual
does, when it shows the real mechanism and the learner can test it.

The rule of this skill: **one visual, one concept, every line sourced.** A
visual that decorates, or that draws a relationship no source supports, is
worse than no visual.

`tutor` means `node harness/bin/tutor.mjs`, run from the repository root.
The contract is `harness/rubrics/visuals.md` (what every visual must have)
and `harness/rubrics/writing-standard.md` (how every explanation reads).
When a validator and this skill disagree, the validator wins.

## Who calls this skill, and for what

| Caller | Visuals it makes | `used_in` |
|---|---|---|
| `learn-research` | no drawings; records **visual candidates** (sequences, dependencies, comparisons, parameters, decision paths with their source sections) in `<handoffs_dir>/visual-candidates.md` | — |
| `learn-intake` | plans: `visual_first: true`, `experience_policy: "adaptive"`, `multi_stage`, per page `visual`, `extra_visuals`, `video`, `experience.signals` | — |
| `learn-brief` | the one small "how it works" diagram (mermaid) | `01-brief` |
| `learn-digest` | the algorithm, experiment workflow or key result of each paper/doc | the digest note |
| `learn-repo-intel` | module map, main request flow (sequence), module dependency graph | `<repo>-architecture.md` |
| `learn-site` | the end-to-end workflow diagram, focused stage diagrams, simulations, videos | lesson pages |
| `learn-projects` | architecture or execution flow per mini project | the project README |
| `learn-capstone` | system architecture, data flow, deployment diagram, component responsibilities | `ARCHITECTURE.md`, `06-capstone` |
| `learn-notes` | no new drawings; embeds or links the 1–3 visuals that best restore the mental model | `07-final-notes`, recall cards |
| `learn-video` | explainer videos, interactive video lessons, branching decks and hybrid labs (`tutor experience`) | lesson page |

Only plans with `plan.visual_first: true` are gated on this standard. Apply
it to everything new anyway.

## Steps

### 1. Decide whether a visual helps, and which

For the concept in front of you ask: what must the learner be able to predict
or explain afterwards? Then pick from the table in
`harness/rubrics/visuals.md` ("When a topic gets which visual"). Short form:

- Parts and responsibilities → architecture. A process with stages → **one
  end-to-end workflow** plus focused stage diagrams. Messages over time →
  sequence. States → state machine. Moving data → animated flow. Order in
  time → timeline. Concept dependencies → concept map (generated). Choices →
  decision tree or `CompareView`. Algorithms → `AlgorithmStepper`. Tunable
  formulas → `ParamPlayground`. Distributed behaviour under failure →
  `ClusterSim`. Try-it code → `CodePlayground`.
- **Beyond a picture**, let the experience selector decide
  (`tutor experience select --file <signals.json>`, rubric
  `harness/rubrics/experiences.md`): an **explainer video** for a sequence the
  learner follows; an **interactive video lesson** when changing an input
  changes the behavior; a **branching deck** when several valid decisions
  exist; a **hybrid lab** only for complex, interconnected mechanisms. Then
  follow `.claude/skills/learn-video/SKILL.md`. Every interactive, branching or
  hybrid experience also needs one registered static diagram as its
  `fallback_visual`: draw it here first.
- **3D** only when space or a graph is the idea.
- **No visual** when a concrete example says it all (basic, supporting ideas).

A substantial topic needs 3–5 distinct visuals; a quick one at least 2. More
is not better: each must teach something the others do not.

### 2. Ground every relationship

Before drawing, write the list of claims the visual will make: each box, each
arrow, each order, each number. Next to each, the source id and section it
comes from (from the digests, the brief, repo-intel findings, the research
`visual-candidates.md`, or `tutor sources <topic> list`). Drop any claim you
cannot source, and say so in your return under PROBLEMS. For a repository,
cite `path/to/file:line @ <short-sha>` in the explanation.

### 3. Draw it reproducibly

Take paths from `tutor paths <topic> --json`. Assets live in
`visual_assets_dir` and are named `<id>-<slug>.<ext>` so Obsidian resolves
them uniquely.

- **Mermaid** (`.mmd`): the default for flowcharts, sequences, states,
  timelines, dependency graphs and decision trees. 3–7 nodes, labels of one to
  three words, edge labels short. Start with a diagram type
  (`flowchart LR`, `sequenceDiagram`, `stateDiagram-v2`, …). No `click`
  callbacks.
- **SVG** (`.svg`): for layered illustrations, architecture with grouping,
  and anything mermaid lays out badly. Use the skeleton in
  `references/svg-template.md`: `viewBox`, `<title>`, `<desc>`, `<text>`
  labels, `currentColor` or neutral strokes that read in light and dark, no
  script, no event handler, no external reference, under 300 KB.
- **Lesson component**: interactive visuals are written in the MDX page with
  the props in `site/COMPONENTS.md`; the registry entry has
  `format: "component"` and `component: "<Name>"`.
- **Image** (`format: "image"`): a generated illustration only when it adds
  educational value and a free local tool made it; label it as an
  illustration in its `explanation`. Never present an illustration as data.
- **Video**: `learn-video`.

### 4. Write the explanation and the alt text in the writing standard

`explanation` (8–90 words): what the visual shows and the one conclusion to
take away. `alt` (12+ words): the structure and the conclusion, for a learner
who cannot see it. `purpose`: what the learner should understand.
`learning_check`: a question the visual should let the learner answer, and
the answer. Follow `harness/rubrics/writing-standard.md`: short active
sentences, terms defined first, analogies marked `**Analogy.**`.

### 5. Register it

Write the entry (`references/entry-examples.md` has filled examples for three
domains) to a draft file outside `state/`, then:

```bash
node harness/bin/tutor.mjs visuals <topic> add --file <entry.json>
node harness/bin/tutor.mjs visuals <topic> update <id> --file <patch.json>   # change, keep the id
```

`add` rejects an entry with an unknown source or concept id, a missing file, an
unsafe SVG, or a missing alt/explanation/learning check, and prints why. It
also refreshes the vault notes. A workflow needs `scope` (`end-to-end`,
`stage`, `detail`).

### 6. Show it where it is used

- **Lesson page**: `<Diagram id="<id>" />` for mermaid/SVG/image, `<Video
  id="<id>" />` for a video, the component itself for `format: component`.
  The page must be listed in `used_in`.
- **Vault note** (brief, digest, repo-intel, capstone note, final notes):
  paste the mermaid block, or embed the SVG with `![[<id>-<slug>.svg]]`, and
  link the visual note `[[visual-<id>-<slug>|<title>]]` so the explanation,
  sources and check question are one click away.
- **Project README / ARCHITECTURE.md**: a fenced mermaid block (GitHub and
  Obsidian render it); register it with the README path in `used_in`.

`tutor map <topic>` (run by every stage runner) exports the registry to
`<vault>/visuals/`: `visuals-<slug>.md` (the index, linked from
`00-start-here`), one `visual-<id>-<slug>.md` per visual, and
`concept-map-<slug>.md` from the curriculum. Learner text under
`## My insights` in those notes is kept byte for byte.

### 7. Check

```bash
node harness/bin/tutor.mjs visuals <topic> check
node harness/bin/tutor.mjs validate <topic> <stage> --files <your files>
node harness/bin/tutor.mjs style <file>     # writing standard, target ≥ 80%
```

## Incremental work

Do not redraw a visual whose sources and concept did not change: update its
entry with `tutor visuals update` when only the wording changes. Videos are
re-rendered only when their storyboard hash changes (`tutor video render`
says "current" otherwise). Remove a visual with `tutor visuals <topic> remove
<id> --reason "..."`; its vault note stays because it may hold insights.

## Return (when a worker uses this skill)

Add to your usual return, inside the 150 words: `VISUALS: <ids registered>,
<ids reused>`; under PROBLEMS any relationship left out for lack of a source.

## Common mistakes

- A diagram that repeats the prose instead of showing the mechanism.
- An arrow that suggests a chain or dependency the sources do not state (for
  example drawing Leader → Follower 1 → Follower 2 when the leader sends to
  both).
- Placeholder labels, more than 7 boxes, colour as the only signal.
- An alt text such as "Diagram of X".
- A video for a definition; 3D for an ordinary flowchart.
- Editing `visuals.json` by hand, or an asset outside `visuals/assets/`.
