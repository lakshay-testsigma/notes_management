# Visual standard

A visual exists to make a mechanism easier to understand, test, remember or
apply. This standard applies to every plan with `plan.visual_first: true` (all
new plans from `learn-intake`); legacy plans keep the rules they were made
with. The procedure for making visuals is the `learn-visuals` skill; videos
follow the `learn-video` skill. Both are shared: stage skills call them instead
of drawing in their own way.

## When a topic gets which visual

Choose by the learning objective, not by a quota:

| The concept is | Use | Format |
|---|---|---|
| A system with parts and responsibilities | architecture diagram | `Diagram` (SVG or mermaid), `SystemDiagram` |
| A multi-stage process | one **end-to-end workflow** diagram, plus focused diagrams of the stages that matter | `Diagram` (`kind: workflow`, `scope: end-to-end` / `stage`) |
| Messages between parties in time order | sequence diagram | `SequenceDiagram`, mermaid `sequenceDiagram` |
| Something that changes state on events | state machine | `StateMachine`, mermaid `stateDiagram-v2` |
| Data or requests moving through components | data-flow or request-flow, animated | `FlowAnimation` |
| Events in time, a lifecycle | timeline or lifecycle | `Timeline`, `Diagram` |
| How concepts depend on each other | concept map, dependency graph | generated from `plan.curriculum`; `Graph3D` only when the graph is the idea |
| A choice between options | decision tree, comparison | mermaid `flowchart`, `CompareView` |
| An algorithm over data | algorithm visualization | `AlgorithmStepper` (author-verified trace) |
| Layers (network stack, model layers, architecture tiers) | layered illustration | `Diagram` (SVG) |
| A formula or tunable parameter | parameter sliders | `ParamPlayground` |
| A distributed system under failure, latency, concurrency | simulation dashboard | `ClusterSim` |
| Code whose behaviour should be tried | sandboxed playground | `CodePlayground` |
| A chronological or causal sequence that motion explains better than a picture | short explainer video, 30–90 s | `Video` (HyperFrames) |
| Space or a graph the learner must rotate or build | 3D | `Graph3D` (editable), `VectorSpace3D` |

Use 3D only when spatial structure is the idea. Prefer clear 2D for ordinary
architectures, algorithms and data flows. Do not make a video for a definition
or for anything a static diagram already shows.

**Amount.** A substantial topic (standard or deep) gets 3–5 distinct, useful
visuals when the subject supports them; a quick topic at least 2. The lesson
gate requires at least `quick 2 / standard 3 / deep 5` registered lesson
visuals. A complex page may carry more than one visual (`extra_visuals` in the
outline). A topic with a multi-stage process (`plan.multi_stage`, or any planned
video) needs one end-to-end workflow diagram.

## Every visual must

1. **Explain one specific concept.** Its `purpose` says what the learner should
   understand; `concept_ids` names the concepts. Decoration fails review.
2. **Have a descriptive title and labels.** Real component names, real commands,
   realistic numbers. No "Service A", no "Step 1".
3. **Match the verified sources.** Every relationship drawn (an arrow, an order,
   a number) is supported by a source in `source_ids`. Do not invent a
   relationship to complete a picture; leave it out and say so.
4. **Come with a short explanation.** `explanation`, 8–90 words, printed under
   the visual on the site and in the vault.
5. **Read on desktop and mobile.** SVG with a `viewBox`, at most about 7 boxes
   per diagram, labels of one to three words, text at least 14 px at 375 px wide
   (28 px on a 1080p video frame).
6. **Have a text alternative.** `alt`, 12+ words, that states the structure and
   the conclusion ("…so the leader replies after a majority stores the entry"),
   not "a diagram of Raft". SVG files also carry `<title>` and `<desc>`.
7. **Be reusable in the vault.** Diagrams live as files in
   `<vault>/visuals/assets/<id>-<slug>.svg|.mmd`; `tutor map` exports a note per
   visual with the embed, explanation, sources, check question and where it is
   used.
8. **Carry a learning check.** `learning_check.question` is a question the
   visual should let the learner answer; `answer` is the correct answer. It is
   how reviewers test whether the visual helps (see "Review").

## The registry

`state/topics/<topic>/visuals.json`, written only through
`tutor visuals <topic> add|update|remove` and `tutor video <topic> build|render`.

```json
{
  "id": "write-path-end-to-end",
  "title": "Raft write path, end to end",
  "kind": "workflow",
  "scope": "end-to-end",
  "format": "svg",
  "file": "vault/system-design/consistency-consensus/raft/visuals/assets/write-path-end-to-end-raft.svg",
  "concept_ids": ["log-replication"],
  "source_ids": ["raft-paper"],
  "purpose": "See the whole path of one write before studying each stage.",
  "explanation": "The leader replies only after a majority stores the entry; one follower can lag without blocking the write.",
  "alt": "A client sends a write to the leader, the leader replicates it to two followers, one acknowledges, and the leader replies after a majority of three stores it.",
  "learning_check": { "question": "Which message lets the leader reply?", "answer": "The first follower acknowledgement, which makes a majority of three." },
  "used_in": ["site/src/content/lessons/system-design/consistency-consensus/raft/02-the-write-path.mdx"]
}
```

`kind`: architecture, workflow, sequence, state-machine, data-flow,
request-flow, timeline, lifecycle, concept-map, dependency-graph,
decision-tree, flowchart, algorithm, layered, comparison, deployment, chart,
illustration, simulation, video. `format`: mermaid, svg, image (a generated
illustration, only when it adds educational value), component (an interactive
lesson component; set `component`), hyperframes (a video; set by `tutor video`).

The gates check: required fields, known source ids and curriculum concept ids,
files that exist inside the assets folder, SVG safety (no script, no event
handler, no external reference) and accessibility (`viewBox`, `<title>`,
`<text>`), mermaid syntax start, and that every `used_in` page really shows
the visual (`<Diagram id>`, `<Video id>`, or the named component).

## Progressive disclosure

Basic intuition → detailed explanation → interactive visualization → technical
internals → real-world implementation. On a lesson page the first three are the
prose and the visual; the last two go in at most two `<Depth>` blocks
(`internals`, `production`, 20–180 words each) that the learner shows or hides
with the depth control. Longer internals go in a concept note.

## Interaction rules

Every simulation has: one-sentence instructions (`intro`), meaningful controls,
an observable result that changes, an explanation of why the result happened,
and Reset that restores the first state. Keyboard reachable, named buttons,
`aria-live` for results, no information carried by colour alone, and no motion
that ignores `prefers-reduced-motion`. `npm --prefix site run interact` drives
the shared components and checks this.

## Video rules (summary of `learn-video`)

30–90 s, 3–10 scenes; a `sequence_reason`; every scene's narration fits its
duration (at most 2.8 words per second) and names what is on screen; captions
(WebVTT) equal the narration; a transcript and the sources ship with the video;
narration only with a free local voice (macOS `say` or Kokoro) and optional.
If the renderer is missing the video stays `storyboard` with its `blocker`;
nothing may claim an MP4 that `tutor video check` cannot open. A video is
rendered again only when its storyboard hash changes.

## Review

The independent content reviewer of a visual-first topic assesses, with evidence:

- `visual-accuracy`: every drawn relationship matches a cited source; no invented arrows, orders or numbers.
- `visual-efficacy`: for each visual, answer its `learning_check.question` twice: from the page prose alone, then with the visual (operate the simulation, watch the video). Record whether the visual made the correct answer possible or faster, and flag visuals that add nothing.
- `interactive-topic-fit`: every interactive object (experience, simulation, stepper, playground, 3D graph, activity) uses its page's concept in labels, presets, data and questions; a control changes what the prose explains; no placeholder data or scenario copied from another topic.
- `interaction-behavior`: each simulation's controls change the result, the explanation names the cause, a failure or counterexample is reachable, and Reset restores the start.
- `accessibility-responsive`: text alternatives, keyboard use, captions and transcript, 375 px layout, reduced motion.
- `writing-standard`: harness/rubrics/writing-standard.md.
- `video-consistency` (when the topic has a video): the script, the scenes on screen, the captions and the transcript say the same thing, and the claims match the sources.

The projects reviewer adds `project-diagrams`: the architecture, execution-flow
and deployment diagrams match the code that exists.
