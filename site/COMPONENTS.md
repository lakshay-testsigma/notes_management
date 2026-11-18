# Lesson components

This is the authoritative reference for writing lesson pages. Every component
named here works in any lesson MDX file **with no `import` line and no
`client:` directive**. Live examples of all of them are on the site at
`/playground/` (source data: `src/data/playground.ts`).

The machine-readable list is `components.manifest.json`: the component names
by kind, and under `"props"` every prop name each component accepts. The
lesson validator fails a page that uses a component or a prop that is not in
it, so a prop that is not in the tables below does not exist.

## Contents

- [The shape of a lesson page](#the-shape-of-a-lesson-page)
- [Choosing a component](#choosing-a-component)
- [Rules for props](#rules-for-props)
- [Data that reads well](#data-that-reads-well)
- Visual: [ProgressiveScene](#progressivescene) · [FlowAnimation](#flowanimation) · [SystemDiagram](#systemdiagram) · [SequenceDiagram](#sequencediagram) · [StateMachine](#statemachine) · [Graph3D](#graph3d) · [VectorSpace3D](#vectorspace3d) · [Chart](#chart) · [ParamPlayground](#paramplayground) · [CodeWalkthrough](#codewalkthrough) · [Timeline](#timeline) · [Mermaid](#mermaid) · [Diagram](#diagram) · [Video](#video) · [Experience](#experience) · [ClusterSim](#clustersim) · [AlgorithmStepper](#algorithmstepper) · [CompareView](#compareview) · [CodePlayground](#codeplayground)
- Activity: [Quiz](#quiz) · [PredictReveal](#predictreveal) · [OrderSteps](#ordersteps) · [MatchPairs](#matchpairs) · [SortBuckets](#sortbuckets)
- Utility: [Resources](#resources) · [Figure](#figure) · [Depth](#depth)
- [Topic-specific components](#topic-specific-components)
- [Checking your page](#checking-your-page)

## The shape of a lesson page

File: `site/src/content/lessons/<domain>/<subdomain>/<slug>/NN-<page>.mdx`

```mdx
---
title: What is a stream?
description: One-line mini description shown under the title.
order: 1
concepts: [append-only log, message id]
---

Two or three short paragraphs of plain prose.

<FlowAnimation nodes={[...]} steps={[...]} />

One more short paragraph.

<Quiz question="..." options={["...", "..."]} answer={0} explanation="..." />
```

- `title`, `description`, `order` (number) are required. `concepts` is a list.
- 110–260 words of prose on the page (everything outside frontmatter, code and components).
- At least one **visual** and at least one **activity** component.
- No blockquotes (`>`), no `:::` asides, no `<aside>`, `<blockquote>`, `<details>`, no cards or callouts. An important remark is a normal paragraph that starts with `**Note.**`
- The last lesson page of a topic ends with `<Resources />`.
- Deeper explanation goes in at most two `<Depth>` blocks of 20–180 words each; they do not count toward the 110–260 words.
- Do not write a `# Title` heading: the page prints the title and description from the frontmatter.

## Choosing a component

| You want to show | Use |
| --- | --- |
| A mechanism that gains parts, connections and information as it unfolds | `ProgressiveScene` (isometric SVG, no WebGL) |
| Something travelling through a system, step by step (a request, a RAG query, a message) | `FlowAnimation` |
| What happens when a part fails | `FlowAnimation` with `breakable` |
| What the parts of a system are and what each does | `SystemDiagram` |
| Who says what to whom, in time order (protocols, handshakes, API calls) | `SequenceDiagram` |
| One thing that changes state on events (an order, a connection, a job) | `StateMachine` |
| A network the learner should turn around, explore or build (agent memory, a knowledge graph, service dependencies) | `Graph3D` (`editable` to let them build) |
| Similarity as distance (embeddings, vector search, clustering) | `VectorSpace3D` |
| Measured numbers | `Chart` |
| A formula whose behaviour should be felt by moving a slider | `ParamPlayground` |
| Code, explained a few lines at a time | `CodeWalkthrough` |
| Events or versions in order | `Timeline` |
| A quick static sketch that only this page needs | `Mermaid` |
| A diagram that also belongs in the notes (architecture, end-to-end workflow, dependencies, layers) | `Diagram` (registered in visuals.json) |
| A chronological or causal sequence that motion explains better than a picture | `Video` (HyperFrames, 30–90 s) |
| An idea the experience-mode selector (`tutor experience <topic> plan`) routed to an interactive lesson, a branching deck or a hybrid lab | `Experience` |
| A distributed system the learner should run and break (servers, failures, latency, concurrency) | `ClusterSim` |
| An algorithm executing step by step on real data | `AlgorithmStepper` |
| Two approaches, or a before and an after, with measured trade-offs | `CompareView` |
| Code the learner should change and run | `CodePlayground` |
| Classify items into groups | `SortBuckets` |
| Deeper internals or production detail, for learners who want it | `Depth` (around prose) |
| Check one fact | `Quiz` |
| Make the learner commit to a guess before the explanation | `PredictReveal` |
| Check that an order of steps is understood | `OrderSteps` |
| Check vocabulary | `MatchPairs` |
| An image, or a topic-specific component, with a caption | `Figure` |

Legacy plans: across one topic use at least one `FlowAnimation`, and at
least one 3D component when the topic has spatial or graph structure.
Visual-first plans (`plan.visual_first`): choose per concept, register every
meaningful visual in `visuals.json`, and give a topic with a multi-stage
process one end-to-end workflow `Diagram`. Use 3D only when space or graph
structure is the idea. The full standard is `harness/rubrics/visuals.md`.

## Rules for props

- Text props take quotes: `title="Logging in"`. Everything else takes braces: `answer={1}`, `nodes={[...]}`, `editable` (a bare name means `true`).
- Props are **plain data only**: strings, numbers, booleans, arrays, objects. Never functions.
- Every `id` is unique inside its component. `from`, `to`, `source`, `target`, `initial` must be ids that exist.
- Start a component tag at the beginning of a line, with an empty line before and after it. Do not leave empty lines inside a tag.
- Inside prose, write `{` as `\{` and `<` as `&lt;` (MDX reads them as code).
- Multi-line text (code, mermaid) goes in a template literal: ``code={`line 1\nline 2`}``. Inside it, write a backtick as `` \` `` and `${` as `\${`.
- Keep node labels to one to three words, edge labels and packet labels to about 12 characters.
- Use only the prop names in the tables. A misspelt or invented prop (`node=`, `caption=` on a component that has none) fails the lesson validator.

## Data that reads well

A component draws whatever it is given. These limits keep the picture readable; the build does not enforce them.

- **Diagrams: 3–7 nodes.** `FlowAnimation`, `SystemDiagram` and `SequenceDiagram` (its actors) stay between three and seven boxes. A system with more parts is split into two diagrams, or the small parts are merged into one box.
- **3D points: at least 0.15 apart.** In `VectorSpace3D`, on coordinates between 0 and 1, no two labelled points are closer than 0.15 in a straight line (with another range: 15% of the largest coordinate). Closer points draw as one blob, and only one of their labels can be printed.
- **3D labels: a few words.** `VectorSpace3D` and `Graph3D` labels stay under about 22 characters. Where labels would still overlap the view prints the most relevant one and hides the others until the learner points at their dot, so a long label costs its neighbours their place.
- **Charts: one measure per axis.** Every series of a `Chart` shares the one y axis, so every series must be the same measure in the same unit. Never put counts and percentages (or milliseconds and requests) on the same axis: the smaller one becomes a flat line at the bottom. `Chart` cannot draw a second y axis; show two measures as two charts, one under the other, with the same `x`.
- **Numbers: as many digits as the claim needs.** In `ParamPlayground` outputs give counts `digits: 0`, and name the unit in `unit` or in the label.

---

## FlowAnimation

Kind: visual. Animated packets travel along the edges of a diagram, one step
at a time, with a caption per step. The learner can play, pause, step, go
back, restart and change speed. Optional "break a node" buttons switch a node
off so the learner sees the flow change. On narrow screens the diagram turns
vertical by itself.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `nodes` | `{ id, label, kind?, x?, y? }[]` | required | The boxes. `kind`: `"box"` (default), `"pill"` (people, clients), `"store"` (databases, queues, files). |
| `steps` | `Step[]` | required | The ordered steps, see below. |
| `edges` | `{ from, to, label?, dashed? }[]` | from `steps` | Arrows to draw. Any step that uses a pair with no edge gets a dashed edge automatically. |
| `title` | `string` | none | Small heading above the diagram. |
| `breakable` | `string[]` | `[]` | Node ids the learner may switch off. |
| `brokenCaptions` | `{ [nodeId]: string }` | generic sentence | What to say when the flow stops because that node is off. |
| `direction` | `"auto" \| "horizontal" \| "vertical"` | `"auto"` | Layout direction. |
| `intro` | `string` | a hint to press Play | Caption shown before the first step. |
| `autoplay` | `boolean` | `false` | Start playing when the component appears. |

`Step`: `{ from, to, packet?, caption, moves?, fallback? }`

- `from`, `to`: node ids. A packet may travel against an arrow (a reply).
- `packet`: short label that rides on the moving dot.
- `caption`: one sentence shown while the step runs. Required.
- `moves`: `{ from, to, packet? }[]`, use instead of `from`/`to` when several packets move at once.
- `fallback`: `{ from, to, packet?, caption }`, used instead of the step when one of the step's nodes is switched off. Without a fallback the flow stops at that step.

Layout: leave out `x`/`y` and the nodes are arranged in columns following the
edges. To place nodes yourself give **every** node `x` and `y` on a 0–100 grid
(0,0 is the top left).

Use 3–7 nodes. With more, the boxes shrink and the packets are hard to follow.

```mdx
<FlowAnimation
  title="Retrieval-augmented generation, one question"
  nodes={[
    { id: "user", label: "User", kind: "pill" },
    { id: "embed", label: "Embedder" },
    { id: "cache", label: "Answer cache", kind: "store" },
    { id: "db", label: "Vector database", kind: "store" },
    { id: "llm", label: "Language model" }
  ]}
  edges={[
    { from: "user", to: "embed" },
    { from: "embed", to: "cache" },
    { from: "embed", to: "db" },
    { from: "cache", to: "llm" },
    { from: "db", to: "llm" }
  ]}
  steps={[
    { from: "user", to: "embed", packet: "question", caption: "The question is turned into a vector." },
    {
      from: "embed", to: "cache", packet: "vector",
      caption: "The cache is checked for a question that means the same thing. This one is new.",
      fallback: { from: "embed", to: "db", packet: "vector", caption: "There is no cache, so the search goes straight to the database." }
    },
    { from: "embed", to: "db", packet: "vector", caption: "The database returns the chunks whose vectors are closest." },
    { from: "db", to: "llm", packet: "top 3 chunks", caption: "The chunks are placed in the prompt next to the question." },
    { from: "llm", to: "user", packet: "answer", caption: "The model answers from the retrieved text and cites it." }
  ]}
  breakable={["cache", "db"]}
  brokenCaptions={{ db: "Without the vector database nothing can be retrieved, so the flow stops." }}
/>
```

## SystemDiagram

Kind: visual. A clickable architecture diagram. Selecting a node highlights
its connections and prints its `detail` as plain text under the diagram.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `nodes` | `{ id, label, detail, kind?, x?, y? }[]` | required | `detail` is the sentence shown when the node is selected. `kind`, `x`, `y` as in FlowAnimation. |
| `edges` | `{ from, to, label?, dashed? }[]` | required | Arrows between nodes. |
| `title` | `string` | none | Small heading. |
| `initial` | `string` | nothing selected | Id of the node that starts selected. |
| `direction` | `"auto" \| "horizontal" \| "vertical"` | `"auto"` | Layout direction. |

Use 3–7 nodes. A bigger system is two diagrams: the whole in a few boxes, then one box opened up.

```mdx
<SystemDiagram
  title="A small web service"
  initial="api"
  nodes={[
    { id: "client", label: "Browser", kind: "pill", detail: "Sends requests and renders responses." },
    { id: "api", label: "API server", detail: "Checks who is asking, validates input, and decides which data is needed." },
    { id: "cache", label: "Cache", kind: "store", detail: "Keeps recent answers in memory so repeated questions are fast." },
    { id: "db", label: "Database", kind: "store", detail: "The source of truth. Slower than the cache, never wrong." }
  ]}
  edges={[
    { from: "client", to: "api", label: "HTTPS" },
    { from: "api", to: "cache", label: "read" },
    { from: "api", to: "db", label: "query" }
  ]}
/>
```

## SequenceDiagram

Kind: visual. Actors across the top, time running down. Messages are drawn
one at a time (play, pause, step, back, restart) with a caption for each.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `actors` | `(string \| { id, label })[]` | required | Left to right. A plain string is both id and label. Use 3–7 actors; three to five read best. |
| `messages` | `{ from, to, label, note?, kind? }[]` | required | In time order. `kind`: `"call"` (default, solid) or `"reply"` (dashed). `from` equal to `to` draws a self-call. `note` is added to the caption. |
| `title` | `string` | none | Small heading. |
| `autoplay` | `boolean` | `false` | Start playing when the component appears. |

```mdx
<SequenceDiagram
  title="Logging in"
  actors={["Browser", "API", "Database"]}
  messages={[
    { from: "Browser", to: "API", label: "POST /login", note: "Email and password travel over HTTPS" },
    { from: "API", to: "Database", label: "find user by email" },
    { from: "Database", to: "API", label: "user row", kind: "reply" },
    { from: "API", to: "API", label: "compare password hash", note: "The plain password is never stored" },
    { from: "API", to: "Browser", label: "200 + session cookie", kind: "reply" }
  ]}
/>
```

## StateMachine

Kind: visual. A state diagram the learner drives: the events that can fire
from the current state are shown as buttons; pressing one moves to the next
state. The path taken is printed underneath.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `states` | `{ id, label, detail?, x?, y? }[]` | required | `detail` is shown while the machine is in that state. |
| `transitions` | `{ from, to, event, detail? }[]` | required | `event` is the button text and the arrow label. `detail` is shown after the transition fires. |
| `initial` | `string` | first state | Id of the starting state. |
| `title` | `string` | none | Small heading. |
| `direction` | `"auto" \| "horizontal" \| "vertical"` | `"auto"` | Layout direction. |

```mdx
<StateMachine
  title="An order"
  initial="cart"
  states={[
    { id: "cart", label: "In cart", detail: "Nothing has been charged." },
    { id: "paid", label: "Paid", detail: "Money is taken; the warehouse is told." },
    { id: "shipped", label: "Shipped", detail: "The parcel is with the courier." },
    { id: "refunded", label: "Refunded", detail: "Money returned. This state is final." }
  ]}
  transitions={[
    { from: "cart", to: "paid", event: "pay" },
    { from: "paid", to: "shipped", event: "ship" },
    { from: "paid", to: "refunded", event: "cancel", detail: "Cancelled before shipping, so the refund is automatic." },
    { from: "shipped", to: "refunded", event: "return" }
  ]}
/>
```

## Graph3D

Kind: visual (3D). An interactive force-directed graph: drag to orbit, zoom
with the buttons or the wheel (after clicking in), hover for emphasis, select
a node to focus it and read its `detail`. With `editable` the learner can add
a named node, connect or disconnect two nodes, remove a node, and reset.
Without WebGL it shows a flat, still clickable, diagram.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `nodes` | `{ id, label, group?, detail?, size? }[]` | required | `group` decides the colour. `size` is relative (1 = normal, 1.5 = hub). |
| `links` | `{ source, target }[]` | required | Undirected connections between node ids. |
| `groups` | `{ id, label }[]` | from the nodes | Order of the colours and the legend; also the kinds offered when adding a node. At most 8. |
| `editable` | `boolean` | `false` | Show the build controls. |
| `labels` | `"auto" \| "all" \| "focus"` | `"auto"` | `auto` labels every node up to 16 nodes, then only the selected node and its neighbours. |
| `title` | `string` | none | Small heading. |

Use 6–25 nodes. More than that becomes a hairball. Keep labels to one to
three words: where two labels would print on top of each other the view shows
one (the pointed-at node first, then the selected node, then its neighbours,
then the order of `nodes`) and hides the other until the learner points at
its node or selects it.

```mdx
<Graph3D
  title="Memory of an AI agent"
  editable
  groups={[
    { id: "core", label: "Agent" },
    { id: "memory", label: "Memory" },
    { id: "tool", label: "Tools" }
  ]}
  nodes={[
    { id: "agent", label: "Agent loop", group: "core", size: 1.5, detail: "Reads the goal, decides the next step, calls a tool, looks at the result, repeats." },
    { id: "working", label: "Working memory", group: "memory", detail: "The current conversation and scratch notes. Lost when the task ends." },
    { id: "episodic", label: "Episodic memory", group: "memory", detail: "What happened in earlier tasks, stored as searchable records." },
    { id: "semantic", label: "Semantic memory", group: "memory", detail: "Facts and documents, stored as vectors." },
    { id: "vector", label: "Vector database", group: "memory", detail: "Finds the stored items closest in meaning to a query." },
    { id: "search", label: "Web search", group: "tool", detail: "Looks things up outside the agent." }
  ]}
  links={[
    { source: "agent", target: "working" },
    { source: "agent", target: "episodic" },
    { source: "agent", target: "semantic" },
    { source: "episodic", target: "vector" },
    { source: "semantic", target: "vector" },
    { source: "agent", target: "search" }
  ]}
/>
```

## VectorSpace3D

Kind: visual (3D). A 3D scatter of labelled points with one movable query
point. The `k` nearest points are highlighted and listed with their score.
The learner can switch between cosine similarity and euclidean distance,
change `k`, and move the query with sliders or by dragging it.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `points` | `{ label, x, y, z, group? }[]` | required | Any numeric range; the view scales to fit. `group` decides the colour. |
| `query` | `{ x, y, z, label? }` | middle of the range, label `"query"` | Starting position and name of the movable point. |
| `k` | `number` | `3` | Neighbours highlighted at the start (the learner can change it, 1–10). |
| `metric` | `"cosine" \| "euclidean"` | `"cosine"` | Starting distance measure. |
| `axes` | `[string, string, string]` | `["x", "y", "z"]` | Names of the three axes (shown in the view and on the sliders). |
| `title` | `string` | none | Small heading. |

Use 6–20 points. If no value is negative the axes start at the origin.

Spacing and labels: keep labelled points **at least 0.15 apart** (straight-line
distance, on coordinates between 0 and 1) and labels to a few words. A cluster
is still a cluster at that spacing. Where labels would print on top of each
other the view keeps the most relevant one (the pointed-at point, the query,
the nearest neighbours, then the order of `points`), moves a label above its
dot when only that side is free, and hides the rest. The learner reads a
hidden label by pointing at its dot, selecting it, or pressing N / P.

```mdx
<VectorSpace3D
  title="Sentences as points"
  axes={["cooking", "travel", "money"]}
  k={3}
  metric="cosine"
  query={{ label: "cheap flights", x: 0.1, y: 0.8, z: 0.6 }}
  points={[
    { label: "bake bread", x: 0.95, y: 0.05, z: 0.1, group: "cooking" },
    { label: "knife skills", x: 0.8, y: 0.02, z: 0.25, group: "cooking" },
    { label: "train passes", x: 0.02, y: 0.9, z: 0.45, group: "travel" },
    { label: "packing light", x: 0.05, y: 0.85, z: 0.1, group: "travel" },
    { label: "budget airlines", x: 0.03, y: 0.8, z: 0.7, group: "travel" },
    { label: "index funds", x: 0.02, y: 0.05, z: 0.95, group: "money" },
    { label: "travel insurance", x: 0.02, y: 0.6, z: 0.75, group: "money" }
  ]}
/>
```

## Chart

Kind: visual. A line, bar or scatter chart drawn from rows of data. Pointing
at it (or focusing it and pressing the arrow keys) prints the exact values
under the chart.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `data` | `object[]` | required | One object per row, e.g. `{ epoch: 1, train: 2.3 }`. |
| `x` | `string` | required | Key of the x value. Numbers give a numeric axis; text gives categories. |
| `y` | `string \| string[]` | required | Key, or keys, of the y values. Each key is one series (at most 8; 1–3 reads best). All series share one axis, so they must be the same measure in the same unit. |
| `type` | `"line" \| "bar" \| "scatter"` | `"line"` | Chart form. Scatter needs numeric `x`. |
| `labels` | `{ [key]: string }` | the keys | Series names for the legend. |
| `xLabel`, `yLabel` | `string` | none | Axis titles. Put the unit here: `"Latency (ms)"`. |
| `yMin`, `yMax` | `number` | fitted to the data | Fix the y axis. Bars always include zero. |
| `height` | `number` | `300` (240 on phones) | Height in pixels. |
| `labelKey` | `string` | none | Scatter only: key of a name for each point, shown when it is pointed at. |
| `title` | `string` | none | Small heading. |

One measure per axis. A chart has one y axis and cannot draw a second one, so
never mix counts and percentages (or any two units) in `y`: the smaller
measure turns into a flat line. Two measures are two charts, one under the
other, with the same `x`.

```mdx
<Chart
  title="Training and validation loss"
  type="line"
  data={[
    { epoch: 1, train: 2.31, validation: 2.35 },
    { epoch: 2, train: 1.62, validation: 1.71 },
    { epoch: 3, train: 1.18, validation: 1.33 },
    { epoch: 4, train: 0.91, validation: 1.12 },
    { epoch: 5, train: 0.72, validation: 1.02 },
    { epoch: 6, train: 0.58, validation: 0.99 }
  ]}
  x="epoch"
  y={["train", "validation"]}
  labels={{ train: "Training loss", validation: "Validation loss" }}
  xLabel="Epoch"
  yLabel="Loss"
/>
```

## ParamPlayground

Kind: visual. Sliders and toggles feed formulas written as **strings**. The
result is drawn as a line chart and/or printed as numbers. Formulas are read
by a small safe parser (`src/lib/expr.ts`); they are never executed as code.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `params` | `Param[]` | required | The controls, see below. |
| `chart` | `{ x, series, yLabel?, yMin?, yMax? }` | none | A curve per series, see below. |
| `outputs` | `{ label, expr, digits?, unit? }[]` | `[]` | Numbers printed above the chart. `digits` is the number of decimal places, default 3; `digits: 0` prints a whole number (use it for counts). `unit` is text after the number. |
| `title` | `string` | none | Small heading. |

`Param`: `{ name, label?, type?, min?, max?, step?, value?, unit? }`

- `name`: the variable name used in formulas (letters, digits, `_`).
- `type`: `"slider"` (default) or `"toggle"`. A toggle is `1` when on and `0` when off.
- `min` (0), `max` (1), `step` (a hundredth of the range), `value` (starting value; `true`/`false` for a toggle), `unit` (text after the number).

`chart.x`: `{ name?, label?, min, max, steps? }`. `name` is the variable that
runs along the x axis (default `"x"`), `steps` the number of samples (default 80).
`chart.series`: `{ label, expr }[]`. Give `yMin` and `yMax` whenever you know
the range, so the curve moves and the axis stays still.

Formula language: numbers, `+ - * / % ^`, parentheses, comparisons
`< <= > >= == !=`, `&& || !`, the choice `condition ? a : b`, the constants
`pi` and `e`, and the functions `sin cos tan tanh exp ln log log2 log10 sqrt
abs floor ceil round sign min max pow clamp(x, lo, hi) sigmoid relu step`.
`ln` and `log` are both the natural logarithm.

```mdx
<ParamPlayground
  title="Learning rate and how fast the loss falls"
  params={[
    { name: "rate", label: "Learning rate", min: 0.01, max: 0.5, step: 0.01, value: 0.1 },
    { name: "floor", label: "Best possible loss", min: 0, max: 0.5, step: 0.05, value: 0.1 },
    { name: "warmup", label: "Use warm-up", type: "toggle", value: false }
  ]}
  chart={{
    x: { name: "step", label: "Training step", min: 0, max: 60 },
    series: [
      { label: "Loss", expr: "floor + (1 - floor) * exp(-rate * (warmup ? max(0, step - 10) : step))" }
    ],
    yLabel: "Loss",
    yMin: 0,
    yMax: 1
  }}
  outputs={[
    { label: "Steps to halve the gap", expr: "ln(2) / rate + (warmup ? 10 : 0)", digits: 1 }
  ]}
/>
```

## CodeWalkthrough

Kind: visual. Shows code with line numbers and walks through it: each step
highlights some lines and shows a caption. Syntax colours are produced at
build time.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `code` | `string` | required | The code, in a template literal. Leading and trailing blank lines and shared indentation are removed. |
| `lang` | `string` | `"text"` | Language id for colours: `ts`, `js`, `python`, `go`, `rust`, `java`, `sql`, `bash`, `json`, `yaml`, `html`, `css`, `mdx`, … Unknown ids fall back to plain text. |
| `steps` | `{ lines, caption, title? }[]` | `[]` | `lines`: a line number `4`, a range `[4, 9]`, or several ranges `[[1, 2], [7, 7]]`. Lines count from 1. |
| `title` | `string` | none | Small heading (a file name works well). |

Keep the code under about 30 lines and write 3–6 steps.

```mdx
<CodeWalkthrough
  title="Retry with backoff"
  lang="ts"
  code={`
async function fetchWithRetry(url: string, tries = 3): Promise<Response> {
  let wait = 200;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // network error: fall through and retry
    }
    await new Promise((done) => setTimeout(done, wait));
    wait *= 2;
  }
  throw new Error("gave up after " + tries + " tries");
}
`}
  steps={[
    { lines: [1, 2], title: "Setup", caption: "Three tries by default, starting with a 200 ms wait." },
    { lines: [4, 9], title: "One attempt", caption: "A good response returns at once. A bad one, or a network error, falls through." },
    { lines: [10, 11], title: "Back off", caption: "Wait, then double the wait, so a struggling server gets room to recover." },
    { lines: 13, title: "Give up", caption: "After the last try the caller gets a clear error instead of waiting forever." }
  ]}
/>
```

## Timeline

Kind: visual. Events on a line. Selecting a point (click, Earlier/Later, or
the arrow keys) shows that event's text underneath.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `events` | `{ when, title, detail? }[]` | required | In order. `when` is a short label such as `"2017"` or `"Step 3"`. |
| `initial` | `number` | `0` | Index of the event that starts selected. |
| `title` | `string` | none | Small heading. |

Use 3–8 events.

```mdx
<Timeline
  title="From attention to chat assistants"
  events={[
    { when: "2014", title: "Attention for translation", detail: "A translation model learns to look back at the source sentence while writing each word." },
    { when: "2017", title: "The Transformer", detail: "Recurrence is removed; attention alone connects every word to every other word." },
    { when: "2018", title: "Pre-training", detail: "Models are trained once on large text collections and then adapted to many tasks." },
    { when: "2022", title: "Chat assistants", detail: "Transformer language models reach the general public as conversational assistants." }
  ]}
/>
```

## Mermaid

Kind: visual. A static diagram from mermaid source, drawn in the browser in
the site's colours. Prefer the animated components when order or motion is
the point. (Vault notes use ordinary ```` ```mermaid ```` code fences instead; those
are drawn the same way.)

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `chart` | `string` | required | Mermaid source in a template literal. |
| `title` | `string` | none | Small heading. |
| `caption` | `string` | none | One line under the diagram. |

```mdx
<Mermaid
  chart={`
flowchart LR
  Client --> Gateway --> Service --> Database
`}
  caption="A request passes the gateway before it reaches the service."
/>
```

## Diagram

Kind: visual. A diagram that is **registered** in the topic's visual registry
(`state/topics/<topic>/visuals.json`) and drawn from its asset in the vault
(`vault/<topic>/visuals/assets/<id>-<slug>.svg` or `.mmd`). The vault note of
the same visual embeds the same file, so the site and Obsidian never drift. The
learner can zoom (buttons or `+`/`-`), drag to move, and reset. Under the
figure the registered `explanation` and its sources are printed; the
registered `alt` is the text alternative.

Use it for architecture, workflow, dependency, layered and comparison diagrams
that also belong in the notes. Register first (`tutor visuals <topic> add
--file <entry.json>`, see `.claude/skills/learn-visuals/SKILL.md`), then:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `id` | `string` | required | The id of the visual in `visuals.json`. Its `used_in` must list this page. |
| `topic` | `string` | the topic of the page | Only outside a topic page (the playground). |

```mdx
<Diagram id="write-path-end-to-end" />
```

What the learner can do: zoom into a dense part, move around it, reset the view,
read the explanation, and open the sources.

## Video

Kind: visual. A short animated explainer (30–90 s) built with HyperFrames from a
storyboard (`projects/<topic>/videos/<id>/video.json`) by `tutor video <topic>
build|render <id>`. A rendered video plays with native controls, English
captions (WebVTT) and a transcript; it never autoplays. A video that could not
be rendered says so and shows its storyboard instead, so the page never claims
a video that does not exist.

Use it only for a chronological or causal sequence that a static diagram cannot
show well: a request lifecycle, an algorithm over time, a protocol, a funnel.
Not for a definition.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `id` | `string` | required | The id of the video in `visuals.json` (also its project folder name). |
| `topic` | `string` | the topic of the page | Only outside a topic page (the playground). |

```mdx
<Video id="raft-write-commit" />
```

What the learner can do: play, pause and scrub the video, switch captions,
open the transcript, and follow the sources.

## Experience

Kind: visual. An adaptive learning experience built by `tutor experience
<topic> build <id>` from `projects/<topic>/experiences/<id>/experience.json`.
The plan's selector chooses the mode per idea; the page only names the id.

| Mode | When the selector picks it | Tabs the learner gets |
| --- | --- | --- |
| Explainer (A) | A chronological or causal process, nothing to change | Watch, Practice |
| Interactive lesson (B) | Parameters change the behavior over time | Guided, Explore, Practice (Watch if planned) |
| Branching presentation (C) | Several valid decisions or paths | Deep dive, Practice |
| Hybrid lab (D) | Many interconnected concepts, parameters and paths | Watch, Explore, Guided, Deep dive, Practice |

- **Watch** plays the explainer (the rendered MP4 with captions, or the live
  HyperFrames composition) with a transcript.
- **Guided** plays the composition in `<hyperframes-player>` (opaque sandbox)
  with step forward and back, speed, chapters, clickable inspection regions and
  pauses for predict, observe, explain, experiment and check questions. When a
  scene starts, the simulation beside it loads the scene's preset; the
  simulation keeps its own state.
- **Explore** is the simulation (`ClusterSim` or `AlgorithmStepper`) with
  named starting states and the experiment challenges.
- **Deep dive** is a HyperFrames slideshow: fragment reveals, hotspot cards
  that open branch paths, Previous to return. It is never rendered to MP4.
- **Practice** lists every question, the misconceptions behind wrong answers,
  the final summary video (hybrid), and *Export progress*. The exported file
  goes back to the harness with `tutor experience <topic> progress --file`,
  which updates mastery and makes related recall cards due.

Progress (tab, answers, slides seen, walkthrough time) stays in the browser per
experience, so switching tabs loses nothing. A "Text version and static
diagram" section (summary, fallback diagram, transcripts, deck outline, the
questions) works without JavaScript and when the animation cannot load. The
player loads only when a tab needs it; it never autoplays.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `id` | `string` | required | The id of the experience in `visuals.json` (the folder of its `experience.json`). |
| `topic` | `string` | the topic of the page | Only outside a topic page (the playground). |

```mdx
<Experience id="binary-search-lab" />
```

An experience with questions counts as the page's activity.

## ClusterSim

Kind: visual. A distributed-systems simulation the learner runs and breaks.
Servers sit on a circle around a client (or a load balancer); messages move
between them one tick at a time. The learner sends one operation or three at
once, adds and removes servers, selects a server to fail or recover it, changes
the message latency, and pauses, steps or resets the clock. Underneath, a
metrics row, a "Why" line that explains the last outcome, and an event log in
plain words. Use it when a page is about what a cluster does under failure,
latency or concurrency: quorum writes, leader election, gossip, eventual
consistency, health checks and retries. Every mode is a simplified teaching
model; the replication mode says so on screen.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `mode` | `"replication" \| "broadcast" \| "load-balance"` | required | The model, see below. |
| `servers` | `number` | `3` | Servers at the start, 1–7 (ids `s1`, `s2`, …). The learner can add and remove servers within 1–7. |
| `latency` | `number` | `1` | Ticks a message takes to arrive, 1–5. The learner changes it with a slider. |
| `failures` | `string[]` | `[]` | Ids of servers that start failed, for example `["s3"]`. |
| `intro` | `string` | none | One sentence above the simulation: what to try first. |
| `explain` | `Record<string, string>` | none | Replaces the default "Why" text for an outcome. Keys: `committed`, `blocked`, `election`, `stale`, `rerouted` (also `converged`, `served`, `changed`). |
| `title` | `string` | none | Small heading. |

Modes:

- `replication`: leader-based majority quorum. The client sends a write to the
  leader, the leader appends it and sends AppendEntries to every follower,
  followers acknowledge, and the write commits when a majority of all
  configured servers store it. With too few servers up the write stays pending
  and the "Why" line says, for example, "only 2 of 5 servers are reachable and
  a majority needs 3". A failed leader is replaced after 3 ticks by the
  lowest-id live server, with the term raised by one, and only when a majority
  is up.
- `broadcast`: gossip. The first live server takes an update and forwards it
  once to every other server. A server that is down misses it and stays stale
  after it recovers, until the learner presses Sync (anti-entropy).
- `load-balance`: round-robin over the servers the balancer believes healthy.
  The balancer learns about failures only at health checks every 3 ticks, so
  requests sent to a failed server time out and are rerouted. Each server
  shows its queue and how many requests it served; latency changes response
  time.

```mdx
<ClusterSim
  title="Five servers, one majority"
  mode="replication"
  servers={5}
  latency={2}
  intro="Fail s4 and s5, send a write, then fail s3 too and send another."
  explain={{ blocked: "Two servers cannot outvote three. The write waits until a third server answers." }}
/>
```

What the learner can do: send a write and watch the acknowledgements arrive;
fail followers until writes stop committing, then recover one and see the
pending write commit; fail the leader and watch the election; send three
writes at once; raise the latency and compare the tick count.

## AlgorithmStepper

Kind: visual. Steps through a precomputed algorithm trace, one frame at a
time: the values (as cells, bars or a grid) with highlighted positions and
named pointers, the variables of that step, the code line that runs, and a
caption that says what happened. The learner moves with Back, Forward, Play
and Reset, a step slider, or the arrow keys. Write the trace by running the
algorithm on a small input and copying every state; the component computes
nothing, so the trace must be correct.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frames` | `Frame[]` | required | One entry per step, see below. |
| `view` | `"array" \| "bars" \| "grid"` | `"array"` | Draw `array` as cells or as bars, or draw `grid` as a table. |
| `code` | `string` | none | The algorithm's code, shown with the frame's `line` highlighted. |
| `lang` | `string` | none | Language name of `code` (shown only, not highlighted). |
| `speed` | `number` | `1200` | Milliseconds per frame while playing. |
| `title` | `string` | none | Small heading. |

`Frame`: `{ caption, array?, highlight?, pointers?, vars?, grid?, line? }`

- `caption`: what this step did and why, in one sentence. Required.
- `array`: the values, numbers or short strings. `highlight`: indexes to mark.
- `pointers`: names placed under a cell, for example `{ lo: 0, mid: 3, hi: 6 }`.
- `vars`: variables to print, for example `{ target: 23, comparisons: 2 }`.
- `grid`: rows of values for `view: "grid"`; `highlight` then counts cells row by row (row × width + column).
- `line`: the 1-based line of `code` that runs in this step.

```mdx
<AlgorithmStepper
  title="Binary search for 23"
  code={"lo, hi = 0, len(a) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == target: return mid\n    if a[mid] < target: lo = mid + 1\n    else: hi = mid - 1"}
  lang="python"
  frames={[
    { caption: "Start with the whole sorted list.", array: [2, 5, 8, 12, 16, 23, 38], pointers: { lo: 0, hi: 6 }, vars: { target: 23, comparisons: 0 }, line: 1 },
    { caption: "The middle value 12 is smaller than 23, so the left half cannot hold it.", array: [2, 5, 8, 12, 16, 23, 38], highlight: [3], pointers: { lo: 0, mid: 3, hi: 6 }, vars: { target: 23, comparisons: 1 }, line: 5 },
    { caption: "Search only the right half. The middle value 23 is the target.", array: [2, 5, 8, 12, 16, 23, 38], highlight: [5], pointers: { lo: 4, mid: 5, hi: 6 }, vars: { target: 23, comparisons: 2 }, line: 4 }
  ]}
/>
```

What the learner can do: step forward and back to compare states, play the
trace, jump with the slider, and match each caption to the highlighted code
line.

## CompareView

Kind: visual. Two approaches, or a before and an after, side by side. Each side lists its
points; measures that both sides report become paired bars with the winner named in text.
The verdict stays hidden until the learner asks for the trade-off, so they can judge first.
On a narrow screen the two sides become a toggle.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `left` | `{ label, points, metrics? }` | required | The first approach or the "before". `points`: 2–5 short lines. `metrics`: `{ "<measure>": number }`. |
| `right` | `{ label, points, metrics? }` | required | The second approach or the "after". Only measures present on both sides are drawn. |
| `unit` | `string` | none | Unit shown after every metric value, such as `"ms"`. |
| `lowerIsBetter` | `boolean` | `false` | Set for latency, cost, error rate: the smaller value wins. |
| `question` | `string` | none | A prompt above the comparison, such as "Which one would you run for checkout?". |
| `verdict` | `string` | none | The trade-off in one or two sentences, shown after "Show the trade-off". |
| `title` | `string` | none | Small title above the component. |

```mdx
<CompareView
  title="Write-through or write-behind cache"
  question="Checkout must never lose an order. Which cache write policy fits?"
  left={{ label: "Write-through", points: ["Writes the cache and the database in one request", "A crash after the reply loses nothing", "Every write waits for the database"], metrics: { "p99 write latency": 42, "orders lost per crash": 0 } }}
  right={{ label: "Write-behind", points: ["Writes the cache now, the database later in a batch", "A crash loses the writes still in the batch", "Writes return as soon as the cache has them"], metrics: { "p99 write latency": 6, "orders lost per crash": 120 } }}
  unit=""
  lowerIsBetter
  verdict="Write-through costs about 36 ms per write but loses nothing in a crash, so it fits checkout. Write-behind fits counters and analytics where a small loss is acceptable."
/>
```

What the learner can do: read both sides, compare the measured bars (the winner is named in a
column, not only coloured), switch sides on mobile, reveal the trade-off, and hide it again with Reset.

## CodePlayground

Kind: visual. Editable JavaScript that runs in the browser, in a sandboxed iframe that cannot
reach the network or the page. Use it when changing one line and running again teaches the idea
(an off-by-one, a race, a retry with backoff). Output appears below; with `expected`, the learner
sees whether their output matches.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `code` | `string` | required | Starting code. Use a template literal; shared indentation is removed. Top-level `await` works. |
| `lang` | `"javascript"` | `"javascript"` | Only JavaScript runs. Any other value shows the code for reading, with a sentence that says so. |
| `expected` | `string` | none | The console output a correct program prints. Compared after trimming line ends and blank edges. |
| `hint` | `string` | none | Shown when the learner presses "Show hint". |
| `timeout` | `number` | `2000` | Milliseconds before a run is stopped (200–5000), so an endless loop cannot freeze the page. |
| `title` | `string` | none | Small title above the editor. |

```mdx
<CodePlayground
  title="Retry with exponential backoff"
  code={`
    const delays = [];
    let delay = 100;
    for (let attempt = 1; attempt <= 4; attempt++) {
      delays.push(delay);
      delay = delay + 100; // TODO: double the delay instead
    }
    console.log(delays.join(' '));
  `}
  expected="100 200 400 800"
  hint="Exponential backoff multiplies the delay by 2 after each failed attempt."
/>
```

What the learner can do: edit the code (Tab inserts two spaces; Escape then Tab leaves the
editor), Run it, read the output and the match result, Stop a long run, Reset the code, and
reveal the hint. Runs are stopped after `timeout` with "Stopped after N ms (infinite loop?)".

## Quiz

Kind: activity. One question, single or multiple choice. The explanation
appears after the learner checks the answer; they can try again.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `question` | `string` | required | The question. |
| `options` | `string[]` | required | 2–5 choices. |
| `answer` | `number \| number[]` | required | Index of the right option, **counting from 0**. An array makes it multiple choice (all listed options are right). |
| `explanation` | `string` | none | Why the answer is right. Always write one. |

```mdx
<Quiz
  question="Why does a vector database return the nearest chunks rather than exact matches?"
  options={[
    "Exact matching is too slow",
    "Meaning is compared, so different words with the same meaning still match",
    "Vectors cannot be compared exactly"
  ]}
  answer={1}
  explanation="Text is turned into vectors that sit close together when the meaning is similar, so a search by distance finds related text even when no word is shared."
/>
```

## PredictReveal

Kind: activity. The learner commits to a prediction (by choosing an option,
or by typing when there are no options) and only then sees what happens and
why.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `prompt` | `string` | required | The situation and the question. |
| `answer` | `string` | required | What actually happens. Shown after the prediction is locked in. |
| `options` | `string[]` | none | Choices to predict from. Leave out for a typed prediction. |
| `correct` | `number` | none | Index (from 0) of the option that is true, so the learner is told whether they were right. |
| `reasoning` | `string` | none | Why it happens. |

```mdx
<PredictReveal
  prompt="A cache sits in front of a database. The cache goes down. What happens to requests?"
  options={["They all fail", "They still succeed, but slower", "Nothing changes"]}
  correct={1}
  answer="They still succeed, but slower."
  reasoning="The database is the source of truth. The cache only saves time, so losing it costs speed and puts more load on the database."
/>
```

## OrderSteps

Kind: activity. Steps are shown shuffled; the learner drags them (by the
handle) or uses Up/Down, then checks the order.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `steps` | `string[]` | required | The steps **in the correct order**. 3–8 short lines. |
| `prompt` | `string` | `"Put these steps in the right order."` | The instruction. |

```mdx
<OrderSteps
  prompt="Put the steps of answering a question with retrieval in order."
  steps={[
    "Turn the question into a vector",
    "Find the closest stored chunks",
    "Put the chunks into the prompt",
    "Generate the answer",
    "Show the answer with its sources"
  ]}
/>
```

## MatchPairs

Kind: activity. Terms on the left, shuffled meanings on the right. The
learner picks a term, then its meaning, and checks when all are matched.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `pairs` | `{ term, definition }[]` | required | 3–6 pairs. Keep terms to a few words. |
| `prompt` | `string` | `"Match each term to its meaning."` | The instruction. |

```mdx
<MatchPairs
  prompt="Match each HTTP status to its meaning."
  pairs={[
    { term: "200", definition: "The request worked" },
    { term: "301", definition: "The resource has moved for good" },
    { term: "404", definition: "Nothing lives at this address" },
    { term: "500", definition: "The server failed while handling the request" }
  ]}
/>
```

## SortBuckets

Kind: activity. Items to sort into 2–4 named groups. The learner drags each item into a group,
or uses the group names next to it (keyboard, touch and screen readers). Check marks every
placed item right or wrong in words and shows the explanation. Use it when the idea is a
classification: which layer, which failure type, which stage of a funnel.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `prompt` | `string` | required | The instruction, such as "Sort each error by who should retry it." |
| `buckets` | `string[]` | required | 2–4 group names. |
| `items` | `{ text, bucket }[]` | required | 3–10 items; `bucket` is the name of the right group. They start shuffled. |
| `explanation` | `string` | none | Why the items belong where they do, shown after Check. |

```mdx
<SortBuckets
  prompt="Sort each HTTP response by whether the client should retry it."
  buckets={["Retry", "Do not retry"]}
  items={[
    { text: "503 Service Unavailable", bucket: "Retry" },
    { text: "429 Too Many Requests", bucket: "Retry" },
    { text: "504 Gateway Timeout", bucket: "Retry" },
    { text: "400 Bad Request", bucket: "Do not retry" },
    { text: "404 Not Found", bucket: "Do not retry" },
    { text: "401 Unauthorized", bucket: "Do not retry" }
  ]}
  explanation="5xx overload and timeout codes and 429 describe a temporary state of the server, so a retry with backoff can succeed. 4xx codes describe the request itself; sending it again gives the same answer."
/>
```

What the learner can do: drag items between the pool and the groups, move them with buttons,
take one back out, Check (count right plus a "belongs in" hint per wrong item), and Reset.

## Resources

Kind: utility. Lists the topic's vetted sources from
`state/topics/<domain>/<subdomain>/<slug>/sources.json`, grouped by type, each
with its `why_trusted` line. **Inside a lesson it takes no props**: the topic
is known from the page. It must be the last thing on the final lesson page.

```mdx
<Resources />
```

The two props exist for pages outside a topic (the playground). Do not use
them in a lesson.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `topic` | `string` | the topic of the page | `"domain/subdomain/slug"` of the topic whose sources are listed. |
| `title` | `string` | none | Heading above the list. |

## Figure

Kind: utility. An image, or anything placed inside it, with a caption. Images
live in `site/public/` and are addressed from the site root.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `src` | `string` | none | Image path, e.g. `"/images/redis-streams/log.png"`. Leave out to wrap content instead. |
| `alt` | `string` | `""` | What the image shows, for screen readers. Required with `src`. |
| `caption` | `string` | none | One line under the figure. |
| `title` | `string` | none | Small heading. |
| `width` | `number` | full column | Maximum width in pixels. |

```mdx
<Figure src="/images/redis-streams/log.png" alt="An append-only log with five numbered entries" caption="New entries are only ever added at the end." width={520} />
```

Wrapping a topic-specific component:

```mdx
<Figure caption="One recall card moving through the review boxes.">
  <IntervalLadder client:visible />
</Figure>
```

Figure does not count as a visual component for the "at least one visual" rule.

## Depth

Kind: utility. A deeper layer of explanation inside a page: `internals` (how it works inside)
or `production` (how teams run it for real). It renders as a plain section with a small label,
never a box. A depth control above the lesson ("Essentials", "+ Internals", "+ Production")
lets the learner choose how much to see; the choice is remembered. By default internals are
shown and production notes are hidden. Without JavaScript every layer is visible. Keep each
block to one or two short paragraphs; the page's main prose still carries the one idea.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `level` | `"internals" \| "production"` | required | Which layer this text belongs to. |
| `title` | `string` | `"Technical internals"` or `"In production"` | Replaces the small label. |

```mdx
<Depth level="internals">

Each consumer group stores a pending entries list (PEL). `XREADGROUP` adds the delivered entry
id with the consumer name and a delivery counter; `XACK` removes it. `XAUTOCLAIM` moves entries
idle longer than a threshold to another consumer and increases their counter.

</Depth>

<Depth level="production">

Teams alert on the PEL length per group and move entries whose delivery counter passes a
limit to a dead-letter stream, so one poison message cannot block a consumer forever.

</Depth>
```

Leave a blank line after the opening tag and before the closing tag, so MDX reads the text as
markdown paragraphs.

What the learner can do: choose Essentials, + Internals or + Production above the lesson; the
page shows or hides the matching sections instantly and keeps the choice for later pages.

---

## Topic-specific components

When no shared component fits, write one for that topic only.

1. Create `site/src/components/topics/<slug>/<Name>.tsx` with a default-exported React component. Working example: `src/components/topics/component-tour/IntervalLadder.tsx`.
2. Import it at the top of the lesson, right after the frontmatter, with the `@topics` alias (the file extension is required), and use it with a client directive:

```mdx
---
title: Numbers, and your own components
description: ...
order: 4
concepts: [spaced repetition]
---

import IntervalLadder from '@topics/component-tour/IntervalLadder.tsx';

Some prose.

<IntervalLadder client:visible />
```

Rules for a topic component:

- Always give it `client:visible` (or `client:load` if it must work before scrolling). Without a directive it is a still picture.
- Props, if any, are plain data, like the shared components.
- Use the site's colour tokens so it works in light and dark: `var(--bg)`, `var(--text)`, `var(--text-2)`, `var(--muted)`, `var(--line)`, `var(--line-strong)`, `var(--accent)`, `var(--accent-soft)`, `var(--link)`, `var(--good)`, `var(--bad)`, and the series colours `var(--s1)` … `var(--s8)`.
- Reuse the shared classes for chrome: wrapper `lc`, text buttons `lc-btn`, a row of buttons `lc-controls`, caption `lc-caption`, quiet text `lc-quiet`.
- No borders or boxes around the component, no shadows. Render the same HTML on the server and in the browser (no `Math.random()`, `Date.now()` or `window` checks while rendering; use `useEffect`).
- A topic component counts as the page's visual. The page still needs one shared activity component (`Quiz`, `PredictReveal`, `OrderSteps` or `MatchPairs`).

## Checking your page

From `site/`:

```sh
npm run build            # must finish with no errors
npm run smoke            # opens every built page in a headless browser
npm run dev              # then open the page and /playground/
```

`npm run smoke` needs the build to be fresh. It fails when a page logs an
error, an island does not hydrate, a local asset or link is missing, a
mermaid diagram cannot be drawn, or a 3D view stays blank. To check only your
pages pass part of their URL: `npm run smoke -- <topic-slug>`.

A wrong prop name is caught by the lesson validator, which compares every
prop on a page with `components.manifest.json`. A wrong prop **value** is
not: if a component shows nothing, compare your data with the tables above.
`npm run check` type-checks the site itself (not the MDX props), and
`npm run manifest:check` confirms that the manifest, the components and this
file name the same props.

## ProgressiveScene

A persistent isometric SVG scene. Each step supplies a complete snapshot: visible
blocks, active directed paths, focus, failures, metrics and an explanation of the
change. Existing blocks keep their positions. New blocks enter; packets follow
only the current paths. It is an authored process trace, not a general simulation.
Use `Graph3D` or `VectorSpace3D` when rotation and spatial exploration teach the idea.
Examples: `/scene-lab/` and `/playground/#ProgressiveScene`.

| Prop | Type | Purpose |
| --- | --- | --- |
| `title` | string | Required concept-specific title |
| `intro` | string | Required instruction: what to change and predict |
| `nodes` | SceneNode[] | 1–7 persistent objects |
| `edges` | SceneEdge[] | Catalog of possible directed paths |
| `steps` | SceneStep[] | 2–12 full snapshots, no implicit cumulative state |

`SceneNode`: `{id, label, detail, position: [x, z], kind?}`. Labels ≤28 characters;
`detail` explains the object's job. `kind` is `block` (default), `store`, `queue`,
or `client`. Coordinates are logical plane coordinates, projected isometrically.
Use distinct spaced positions; `[[-1,0],[0,-1],[1,0],[0,1]]` makes a four-part diamond.
The full catalog fixes the projection, so no camera jump occurs as parts appear.
The object glyphs are symbolic, not physical models.

`SceneEdge`: `{id, from, to, label}`. Endpoints are node IDs. The label names the
actual operation, also listed as text below the scene. Do not draw a direct
store-to-cache link when the application performs that write.

`SceneStep`: `{title, description, nodes: string[], edges: string[], changes:
string[], focus?: string[], failed?: string[], metrics?: [{label,value}],
source_ids?: string[]}`. Node and edge lists are exact snapshots; omitted objects
are hidden and omitted edges are inactive. `failed` objects stay visible with an
unavailable label and dashed outline, but cannot carry traffic. Failure and recovery
are authored cases, not random events. Metrics are full replacements, with string
values including units. Explain assumptions and illustrative values in the intro.
`source_ids` trace the step to vetted topic sources; they are authoring metadata,
not automatically verified citations. The visual registry and independent reviewer
still check grounding. The Astro wrapper rejects broken references, hidden
endpoints and traffic through failed nodes at build time.

```mdx
<ProgressiveScene
  title="A job enters a queue"
  intro="Predict where the job waits, then advance and inspect the queue."
  nodes={[
    {id:'producer', label:'Producer', detail:'Creates a job.', position:[-1,0]},
    {id:'queue', label:'Job queue', detail:'Retains the job until a worker accepts it.', position:[0,-1], kind:'queue'}
  ]}
  edges={[{id:'append', from:'producer', to:'queue', label:'Append job'}]}
  steps={[
    {title:'Create a job', description:'The producer creates one job.', nodes:['producer'], edges:[], changes:['Producer added.']},
    {title:'Retain the job', description:'The job waits in the queue.', nodes:['producer','queue'], edges:['append'], focus:['queue'], changes:['Queue added.', 'The job is retained.'], metrics:[{label:'Waiting jobs',value:'1'}]}
  ]}
/>
```

Controls: Back, Next, direct numbered steps, Replay step, Pause/Resume traffic,
Reset, selectable blocks and a full text sequence. Arrowheads encode direction;
focus, failure labels and explanations do not rely on color. Blocks are reachable
by Tab and activated with Enter/Space. Reduced motion removes arrivals and packet
motion; offscreen traffic pauses. The first snapshot is server rendered; without
JavaScript the wrapper also prints the complete sequence. No external textures,
models, font or animation service is needed. This is a visual component; include
a separate `PredictReveal` or quiz for assessment.
