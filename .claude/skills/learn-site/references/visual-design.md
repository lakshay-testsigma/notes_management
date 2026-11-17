For new plans, the adaptive policy in learn-site/SKILL.md and
`docs/RESEARCH-WORKFLOW.md` decides whether a visual is useful. Examples below
show how to design a planned visual; they do not require one on a basic
noncritical page. Keep an activity on every page and choose complexity from
what the learner must understand, not the presence of a convenient component.

# Designing the visual, the activity, and the prose of a lesson page

Read this before writing a page. Props are never listed here: the exact props
of every component are in `site/COMPONENTS.md`, and that file wins.

Contents: 1. The method · 2. Which component for which idea · 3. What good data
looks like, per component · 4. Activities · 5. Prose · 6. MDX syntax that breaks
the build · 7. Page self-check

## 1. The method

Design every page in this order. The order matters, because prose written
first always grows, and the visual then becomes decoration.

1. **Say the mechanism in one sentence.** "A consumer group hands each entry to
   exactly one consumer and remembers it until it is acknowledged."
2. **Ask what the learner has to see to believe it.** Something moving through
   steps? A structure with relations? A number that changes when a setting
   changes? A conversation between parties?
3. **Pick the component** that shows exactly that (section 2).
4. **Fill it with the real system.** Real component names, real commands, real
   messages, realistic numbers (section 3).
5. **Decide what the learner does.** Break a node, drag a slider, add a node,
   predict the next step. A visual the learner only watches is half a visual.
6. **Only now write the prose** that frames it (section 5).

## 2. Which component for which idea

| The idea is | Use | The learner |
|-------------|-----|-------------|
| A process: things move through steps in order (a request path, a RAG pipeline, a job through a queue) | `FlowAnimation` with a real caption per step and a failure toggle | plays it step by step, then breaks a node and sees what changes |
| An architecture: which parts exist and how they connect | `SystemDiagram` | reads the parts and the labeled connections |
| Relationships, a graph, a memory structure, an index, a dependency net | `Graph3D`; `editable` when the learner should build or extend it | rotates and explores; in editable mode adds, connects, removes nodes |
| Embeddings, similarity, clustering, nearest neighbors | `VectorSpace3D` | sees which points are close and where a query lands |
| A trade-off that depends on numbers (chunk size against recall, pool size against latency) | `ParamPlayground` | moves a parameter and watches the result change |
| Measurements or a comparison with numbers | `Chart` | compares the series |
| A protocol exchange between parties (a handshake, OAuth, a retry) | `SequenceDiagram` | follows the messages in time |
| A lifecycle with states and transitions (a job, a connection, a circuit breaker) | `StateMachine` | triggers events and sees the state change |
| Code where the order of lines is the lesson | `CodeWalkthrough` | steps through highlighted lines with an explanation each |
| History or versions | `Timeline` | scans the order of events |
| A static structure that nothing else fits (a folder layout, an entity diagram) | `Mermaid` | reads it |
| A diagram that also belongs in the notes: the end-to-end workflow, an architecture, layers, dependencies | `Diagram` (registered with `tutor visuals add`, see `learn-visuals`) | zooms into the part that decides the outcome |
| A chronological or causal sequence where motion shows cause and effect (request lifecycle, backpropagation, OAuth, a funnel) | `Video` (planned `video` entry, built by `learn-video`) | watches 30–90 s with captions, then answers the activity |
| A distributed system under failure, latency or concurrency (quorum, failover, gossip, load balancing) | `ClusterSim` | adds and fails servers, raises latency, sends concurrent writes, steps and resets |
| An algorithm executing on real data (search, sort, a gradient step, a join) | `AlgorithmStepper` with an author-verified trace | steps forward and back and matches each caption to the code line |
| Two approaches, or a before and an after, with measured trade-offs | `CompareView` | judges first, then reveals the trade-off |
| Code the learner should change and run (an off-by-one, backoff, a race) | `CodePlayground` | edits, runs in a sandbox, compares with the expected output |
| Classifying items (which layer, which failure type, which stage) | `SortBuckets` (activity) | drags or moves items into groups and checks |

Choosing between them:

- If the idea is about time and order, use `FlowAnimation` or
  `SequenceDiagram`. Use `FlowAnimation` when something travels through a
  system, and `SequenceDiagram` when two or three parties exchange messages.
- If the idea is about shape and connection, use `Graph3D` (many nodes,
  explorable) or `SystemDiagram` (few named parts).
- `Mermaid` does not move and cannot be touched. Use it only when no other
  component fits, and never as the only visual of a topic. A static diagram
  that the notes also need is a registered `Diagram`, so the vault and the site
  share one file.
- Visual-first plans: a topic with a multi-stage process needs one end-to-end
  workflow `Diagram` (`kind: workflow`, `scope: end-to-end`) on the page that
  introduces the process, before the focused visuals of its stages. A complex
  page may carry `extra_visuals`; each must teach something the primary one
  does not.
- Use 3D only when space or graph structure is the idea; a video only for a
  real sequence (`harness/rubrics/visuals.md`).
- The playbook's `## Lesson recipes` section says which component fits which
  kind of concept in this domain, with examples. When it disagrees with this
  table, the playbook wins, because it knows the domain.
- When nothing shared can show the core mechanism (a B-tree splitting, an
  attention matrix), build a topic-specific component: see
  `topic-component.md`.

## 3. What good data looks like, per component

Everything inside a component is specific to the topic. A learner should be
able to copy a label from the visual into a terminal or a search box and find
the real thing. A number that does not come from a source is realistic and is
called illustrative in the sentence that introduces the visual.

**Size.** A diagram (`FlowAnimation`, `SystemDiagram`, `StateMachine`,
`Mermaid`) has 3 to 7 nodes. The gate warns when a diagram has more than 7;
treat the warning as a rule and cut the diagram, or the page holds two ideas.
The 3D components may hold more points, because the learner explores them,
but only within the limits given below. Every term that appears in a label or
a caption is defined in the prose before the component.

**`FlowAnimation`**

- Three to seven nodes and four to eight steps. More loses the thread.
- Nodes are the real parts: `Producer`, `orders stream`, `billing group`,
  `worker-1`, `Pending list`. Not `Service A`.
- Each caption names the real command or message and what changes because of
  it: "worker-1 calls `XREADGROUP ... >` and receives entry `1731578400000-0`;
  the entry is now in the group's pending list."
- Use the failure toggle on the node whose failure teaches the idea (crash the
  worker, take the vector store offline), with a caption that says what the
  system does then. A flow that only shows the happy path hides the reason the
  design exists.
- Bad caption: "The request is processed." Good caption: "The retriever embeds
  the question with the same model as the documents and asks the index for the
  5 nearest chunks."

**`SystemDiagram`**

- Three to seven parts with their real names and one-line roles. When the
  real system has more, show the parts this page is about and name the rest
  in one sentence of prose.
- Every connection is labeled with what flows over it (`HTTP POST /orders`,
  `XADD`, `SQL`).
- List the parts in the order a request travels (client, service, data), and
  give each one its one-line role where the component has a field for it.

**`Graph3D`**

- Eight to sixteen nodes with real names, grouped by kind so the colors mean
  something (documents, chunks, entities; or controllers, services,
  repositories). Labels of one to three words.
- Edges carry the relation (`mentions`, `depends on`, `next`).
- Use `editable` when the idea is learned by building: "add a node for the new
  memory and connect it to the two entities it mentions". Say in the prose
  exactly what to build, and what a correct result looks like.

**`VectorSpace3D`**

- Six to twenty points that are real items: actual words, short phrases, or
  document titles, placed so that related items are close.
- Keep labelled points apart and labels short. Inside a cluster, no two
  points are closer than about 0.15 on a 0-to-1 scale (on another scale: 15%
  of the axis range) in at least one coordinate, and a label has at most
  three words. The component moves overlapping labels a little, but crowded
  data still reads badly: "Delivery in 3 days", "Track your parcel", and
  "Ships to 12 countries" at 0.05 from each other print as one smear.
- At least two visible clusters and one query point with its nearest neighbors.
  Tell the learner where to move the query and what should happen to the
  neighbors.
- Say in the prose that three dimensions are a simplification of hundreds.

**`ParamPlayground`**

- Two or three parameters with realistic ranges and units (chunk size 100 to
  2,000 tokens, not 0 to 100).
- The output makes the trade-off visible: something gets better while
  something else gets worse.
- Tell the learner which setting to try and what to notice.

**`Chart`**

- Real units on both axes, a short title that states the finding, and at most
  three series.
- One measure per axis. All series of one chart share the y axis, so they
  must be the same kind of number with the same unit. Never put a count
  (documents retrieved) and a percentage (answer accuracy) on one axis; use
  two charts, or convert both to the same unit.

**`SequenceDiagram`**

- Two to five named parties, six to twelve messages with their real names
  (`GET /authorize`, `302 + code`, `POST /token`).
- Include the failure or retry message when the idea is about it.

**`StateMachine`**

- The real states and the real events, including the failure path (`active →
  failed → retried`), not only the happy path.

**`CodeWalkthrough`**

- At most 25 lines of real code that would run, in the domain's default
  language. Three to six steps, each explaining why the highlighted lines
  exist.

## 4. Activities

Every page has at least one activity, and it tests the one idea of that page.

| Component | Use it for | Good example |
|-----------|------------|--------------|
| `PredictReveal` | Making the learner commit to a prediction before the page reveals the answer | "worker-1 crashes after reading 5 entries. What does worker-2 receive on its next `XREADGROUP ... >`?" |
| `Quiz` | Choosing between options in a situation | "Orders must never be lost but may be processed twice. Which setup fits?" |
| `OrderSteps` | A process whose order is the lesson | Order the six steps of a RAG query |
| `MatchPairs` | Pairing things that are easily confused | Delivery guarantee to its consequence |

Rules:

- Prefer `PredictReveal`, and place it before the visual or the paragraph that
  reveals the answer. A prediction made before seeing the answer is remembered;
  a question asked after the answer is only recognition.
- Ask for reasoning: what happens next, what breaks, which option fits. Do not
  ask for a definition, and do not ask a question whose answer is a phrase
  printed on the page.
- Wrong options in a `Quiz` are things a beginner would really believe. The
  explanation says why the right option is right and why the most tempting
  wrong one is not.
- One good activity is better than two weak ones. Use two only when the page
  has a prediction before the visual and a decision after it.

## 5. Prose

- 110 to 260 words are allowed; aim for 150 to 220. Count only the text outside
  frontmatter, code, and components.
- Open with a concrete situation, not a definition: "Your worker crashes halfway
  through sending 200 emails. Which ones went out?"
- Before the visual, say what to do with it and what to watch for.
- After the visual, name precisely what was seen. Use the real term once, in
  bold, the first time it appears.
- End with one sentence that leads to the next page.
- Short paragraphs of two to four sentences. At most two `##` headings, and
  none before the first paragraph. At most one short list.
- An important warning or exception is a plain paragraph that starts with
  `**Note.**` Do not use blockquotes, callouts, cards, asides, or collapsible
  blocks; the learner dislikes them and the validator rejects them.
- Write for a beginner: explain a term the first time it is used, or link it to
  the idea of an earlier page.
- Follow `harness/rubrics/writing-standard.md`: sentences of about 15–20
  words, active voice, one term per thing, plain words. `tutor style <page>`
  reports it; visual-first gates print its warnings. Mark comparisons with
  `**Analogy.**` (and where they break) and assumptions with `**Assumption.**`.
- Layer the depth: intuition in the first paragraph, the mechanism with the
  visual, then at most two `<Depth level="internals">` / `<Depth
  level="production">` blocks (20–180 words each, outside the 110–260 count)
  for internals and real-world practice. Leave a blank line after the opening
  and before the closing tag. Longer internals go to a concept note.

## 6. MDX syntax that breaks the build

A lesson page is MDX: Markdown in which `<` starts a component and `{` starts a
JavaScript expression. These are the mistakes that stop the site build.

| Mistake | Fix |
|---------|-----|
| A `{` or `}` in prose, such as `{id}` or a JSON snippet | Put it in backticks: `` `{id}` `` |
| A `<` in prose, such as `a < b` or `<topic>` | Put it in backticks, or write "less than" |
| An HTML comment `<!-- ... -->` | Delete it; MDX does not accept HTML comments |
| A component tag that is not closed | End it with `/>`, or close it with `</Name>` |
| An array or object prop written as a string, such as `steps="[...]"` | Use braces: `steps={[ ... ]}` |
| A trailing comma problem or an unquoted string inside `{[ ... ]}` | Inside braces it is JavaScript: quote every string, separate items with commas |
| A double quote inside a double-quoted string prop | Use single quotes outside, or a template literal inside braces |
| A function, an arrow, or JSX passed as a prop | Not allowed; props are plain data only |
| An `import` or a `client:` directive for a shared component | Delete it |
| No blank line between a component and the Markdown after it | Leave one blank line before and after every component |
| A line of prose indented by four spaces | Remove the indentation; it becomes a code block |
| A component name that is not in the shared list and not imported | Use a shared component, or import the topic-specific one |

## 7. Page self-check

Answer each line with yes before you move to the next page.

- The frontmatter has `title`, `description`, `order` (a number), and
  `concepts`.
- The page states one idea, and the `description` is that idea.
- There is an activity and the exact planned visual; a justified basic noncritical
  visual:null page may omit visuals under the adaptive policy.
- Every label, command, and number inside the components belongs to the real
  topic. Nothing is a placeholder.
- Every prop used is documented in `site/COMPONENTS.md` (the gate fails any
  other prop).
- A diagram has 3 to 7 nodes. Labelled 3D points are apart and their labels
  are short. A chart has one measure per axis.
- Every term in the prose, the labels, and the captions is defined before it
  is used.
- Nothing on the page cites or links a page that is not in `sources.json`.
- The prose is between 110 and 260 words (`tutor words <page file>` prints the
  count the gate uses).
- With the visual removed, the page would no longer explain the idea.
- Every `<Diagram id>` and `<Video id>` is registered and lists this page in
  `used_in`; every interactive visual worth keeping is registered with
  `format: component`; each has a `learning_check` the page's activity or prose
  lets the learner answer.
- Every arrow, order and number in a visual is backed by a source in its
  `source_ids`; nothing suggests a relationship the sources do not state.
- A simulation has instructions (`intro`), controls that change the result, an
  explanation of why, and Reset.
- `tutor style <page>` shows no warning you could fix by splitting a sentence.
- The activity cannot be answered by copying a phrase from the page.
- There is no blockquote, callout, card, aside, or `<details>`.
- There is no `import` and no `client:` for a shared component.
- No `{`, `}`, or `<` appears in prose outside backticks.
- If this is the last page of the topic (the highest `order` in the plan's
  `lesson_outline`, not the last page of your unit), it ends with
  `<Resources />`. No other page has it.
