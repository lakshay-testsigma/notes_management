# Lesson page rubric

How to write and design one lesson page of the Astro site (ARCHITECTURE.md §12). Read by the lesson stage before writing a page and by the verifier afterwards. Exact component props are in `site/COMPONENTS.md`; this file says what a good page is and why.

## What the learner asked for

- A site that feels like a **minimal blog**: a title, a one-line description, a little text, then things to watch and play with.
- **Visuals matched to difficulty**: an experienced developer can read basic concepts through concise examples. Intermediate and career-critical concepts use useful visuals; advanced graph or spatial mechanisms use manipulable 3D, and advanced nonspatial ideas use an interactive simulation.
- **About 10–15 lines of description per page**, not an article.
- **Playful activities** on every page, so they find out whether they understood.
- **No quote blocks and no "mini boxes"**: no blockquotes, callouts, cards, tips, or collapsible sections. They find them noisy.

The page spends its small word budget on a concrete question and makes the learner commit to a prediction or an answer. When a visual is planned, it exposes the mechanism. Basic adaptive pages can use a short example and activity without a graphic.

## Hard rules (the validator fails the page otherwise)

| Rule | Detail |
|---|---|
| File name | `NN-<page>.mdx`: two digits, lowercase words, dashes. Example: `03-consumer-groups.mdx` |
| Frontmatter | `title`, `description` (one line), `order` (whole number equal to `NN`), `concepts` (non-empty list) |
| Prose length | 110–260 words outside frontmatter, code, and components. Aim for 150–220 |
| Visual | Adaptive plans use the exact outline visual, or none when `visual: null`; legacy plans require at least one visual component: `FlowAnimation`, `SystemDiagram`, `SequenceDiagram`, `StateMachine`, `Graph3D`, `VectorSpace3D`, `Chart`, `ParamPlayground`, `CodeWalkthrough`, `Timeline`, `Mermaid`, `Diagram`, `Video`, `ClusterSim`, `AlgorithmStepper`, `CompareView`, `CodePlayground`, or an imported topic component |
| Activity | At least one activity component: `Quiz`, `PredictReveal`, `OrderSteps`, `MatchPairs`, `SortBuckets` |
| No boxes, no quotes | No line starting with `>`, no `:::`, no `<aside>`, `<blockquote>`, `<details>`, `<summary>`, no card, callout, or alert markup or components |
| Shared components | Used without an `import` and without a `client:` directive, and only with props that `site/COMPONENTS.md` documents |
| Topic components | Live in `site/src/components/topics/<slug>/` and are imported explicitly |
| Across the topic | Adaptive plans have no animation quota: each page implements its decision. Legacy plans require one `FlowAnimation` and a 3D component when planned |
| Last page | The final page of the topic (the highest `order` in the plan's `lesson_outline`) ends with `<Resources />` as its last line; no other page has it |
| Diagram size (warning) | A diagram with more than 7 nodes gets a warning; keep diagrams at 3–7 nodes |
| Registered visuals | `<Diagram id>` and `<Video id>` name an entry of `visuals.json` of the right format whose `used_in` lists the page |
| Depth blocks | At most two `<Depth level="internals|production">` blocks, 20–180 words each, counted apart from the 110–260 |
| Visual-first plans | The planned `extra_visuals` and `video` are on the page; per topic at least 2/3/5 registered lesson visuals (quick/standard/deep) and an end-to-end workflow `Diagram` when the topic has a multi-stage process (`harness/rubrics/visuals.md`) |
| Writing standard (warning) | Visual-first pages print `tutor style` warnings: long sentences, passive voice, academic words (`harness/rubrics/writing-standard.md`) |

## The page skeleton

This is the shape, not real syntax. Fill the component props from `site/COMPONENTS.md`.

```text
---
title: <the one idea, as a short noun phrase or question>
description: <one line: the single thing this page teaches>
order: <NN>
concepts: [<term 1>, <term 2>, <term 3>]
---

OPENING            2–3 lines. A concrete situation and the question it raises.

PREDICT            (optional but strong) a PredictReveal asking for the outcome
                   before the visual shows it.

HAND-OVER          1 line telling the learner what to do with the visual
                   ("Press play, then break worker-1 and play again.").

THE VISUAL         one visual component that shows the mechanism.

EXPLANATION        4–7 lines. Name what the visual just showed. Introduce each
                   new term in bold, once, with its meaning in the same sentence.

NOTE               (only if needed) one paragraph starting with **Note.**

SECOND VISUAL      (optional) only if it shows a different side of the same idea,
                   for example CodeWalkthrough after a FlowAnimation.

ACTIVITY           one activity component that makes the learner use the idea.

BRIDGE             1 line: what the next page answers.
```

Order matters: situation, prediction, visual, explanation, activity. Explaining before the visual wastes the visual; the learner should discover the answer in it.

## How to write the 10–15 lines

- **One idea per page.** If the `description` needs the word "and", split the page.
- **Open with a situation, not a definition.** "Your worker crashes halfway through an order. Who finishes it?" not "A pending entries list is a data structure that…".
- **Plain words.** Short sentences, active verbs, the same word for the same thing every time. Write for a beginner whose first language may not be English.
- **Define each term on first use**, in the same sentence, in bold once. Never use a term the plan's prerequisites and earlier pages did not cover.
- **Use real names and real values**: real commands, real field names, realistic numbers. No `foo`, no "some data".
- **Point at the visual.** Say what to press, what to watch, what changed. The text and the visual must need each other.
- **Paragraphs of 1–3 lines.** At most one short list (5 items or fewer) per page; a list is for parallel items, not for explanation.
- **Headings are optional.** A page is short enough to need none; use at most two `##` headings and no deeper levels.
- **Code** appears only inside `CodeWalkthrough` or as a fenced block of at most about 8 lines. Inline code for commands and names.
- **No filler.** Delete "In this lesson we will", "As you can see", "It is important to note", "Let's dive in", summaries of what was just said.
- **An important caveat** is a plain paragraph starting with `**Note.**`. At most one per page.

Count the words before finishing. Text inside component props does not count, so captions and quiz explanations are free space for detail: put the step-by-step specifics there.

## Adaptive policy

`plan.visual_policy: "adaptive"` opts into difficulty-based choices. Missing
policy or `"legacy"` keeps the original gates for existing notes.

- Each outline entry records `complexity` (`basic`, `intermediate`, `advanced`),
  `importance` (`supporting`, `core`, `critical`), `spatial` (boolean), and
  `visual_reason` (including why a basic page omits a graphic).
- A basic supporting/core page may set `visual: null`. A medium-level
  (`intermediate`) or career-critical page requires a visual. Every page still
  requires an activity and 110–260 words of concise prose.
- Advanced graph/spatial concepts require `Graph3D` or `VectorSpace3D`.
  Advanced `Graph3D` must use `editable` or `editable={true}`.
- Advanced nonspatial concepts use `ParamPlayground`, `StateMachine`, or
  `FlowAnimation` with a reason for choosing a simulation over 3D.
- Every visual has `interaction_goal`: a concrete change and a prediction.
  Reviewers try that action and a failure case. They reject decoration,
  misleading axes, disconnected controls, and a 3D projection presented as a
  faithful view of high-dimensional space. The validator can check component
  presence and graph editability; the reviewer verifies teaching accuracy.

## Choosing the visual

Start from the domain playbook's "Lesson recipes" table. When it has no match, choose by what the idea *is*:

| The idea is… | Use |
|---|---|
| things moving through steps or between parts | `FlowAnimation` |
| parts and their connections, at rest | `SystemDiagram` |
| who says what to whom, in order | `SequenceDiagram` |
| one thing changing state on events | `StateMachine` |
| a network, tree, or dependency graph, especially one the learner should build | `Graph3D` (with `editable` to let them build it) |
| points, vectors, distances, embeddings, surfaces | `VectorSpace3D` |
| numbers compared or changing | `Chart` |
| an outcome that depends on values the learner can change | `ParamPlayground` |
| code or configuration understood line by line | `CodeWalkthrough` |
| events in time, history, versions | `Timeline` |
| a small static structure | `Mermaid` |

Rules for a visual that teaches:

- It shows the **mechanism**, with the topic's real names and values, not a decorative picture of boxes.
- It includes the **failure or edge case** when the page is about one (a node that can be broken, a late event, a wrong input).
- The learner can **do** something: play, step, break, drag, change a value, add a node.
- It stays small: a diagram (`FlowAnimation`, `SystemDiagram`, `StateMachine`, `Mermaid`) has 3–7 nodes; the gate warns above 7. If it needs more, the page holds two ideas.
- Labelled 3D points stay apart (about 0.15 on a 0-to-1 scale) and their labels stay short (three words at most); crowded labels cannot be read.
- A chart has one measure per axis. Counts and percentages never share an axis; use two charts.
- **3D only for spatial or graph structure.** A linear pipeline in 3D is harder to read than in 2D. Say so in the text when a 3D view is a simplified projection.
- Prefer a shared component. Write a topic-specific component only when no shared one can show the idea, and keep it in `site/src/components/topics/<slug>/`.
- Vary the visuals across the topic; do not use the same component on every page.

## Choosing the activity

| Use | When | Good prompt |
|---|---|---|
| `PredictReveal` | before a visual, when the outcome is surprising | "The worker crashes after reading. What happens to the entry?" |
| `OrderSteps` | the idea is a sequence | "Put the steps of the handshake in order." |
| `MatchPairs` | several terms or cases must be told apart | "Match each isolation level to the anomaly it still allows." |
| `Quiz` | applying the idea to a new situation or a decision | "Orders must not be lost. Which setting do you choose and why?" |

Rules for an activity that tests understanding:

- It asks the learner to **apply or predict**, never to repeat a phrase from the page.
- Wrong options are the **mistakes beginners really make** (take them from the playbook's misconceptions), not jokes.
- Every answer comes with a **one- or two-line reason**, including why the tempting wrong option is wrong.
- It can be answered from this page and earlier pages only.
- Vary the activity type across the topic.

## Anti-patterns

| Do not | Do instead |
|---|---|
| Blockquote, callout, tip box, card, collapsible section | A plain paragraph; `**Note.**` for a caveat |
| Open with a definition or "In this lesson…" | Open with a situation and a question |
| Explain everything, then show the visual as an illustration | Set up the question, let the visual answer it, then name what happened |
| A wall of text with a diagram at the bottom | 150–220 words split around the visual and the activity |
| Bullet lists in place of explanation | Sentences; at most one short list |
| Two ideas on one page | Two pages |
| A visual with generic boxes ("Service A", "Data") | Real component names, commands, and values of the topic |
| A visual the learner only watches | Something to play, break, drag, or change |
| 3D because it looks impressive | 3D only for graphs and spatial ideas |
| A quiz on a memorised term ("What does X stand for?") | A prediction or a decision in a new situation |
| Terms used before they are defined | Define on first use, in bold, once |
| Long code blocks | `CodeWalkthrough`, or 8 lines at most |
| `import` of a shared component, or `client:load` on it | Use it directly |
| Tables of prose, images of text, external embeds | Shared components |
| Bold on every other phrase | Bold only for a new term or `**Note.**` |
| Ending with a summary of the page | One line that opens the next page |

## Self-check before finishing a page

1. Can I state the one idea in the `description` line without "and"?
2. Does the first paragraph pose a concrete situation or question?
3. Does this page follow its planned visual decision? On visual pages, does the graphic teach the mechanism? On basic `visual: null` pages, is a concise example enough?
4. Does the visual use the topic's real names and show the mechanism or the failure?
5. Can the learner do something with the visual?
6. Does the activity require applying or predicting, with a reason given for the answer?
7. Is every term defined on first use and already allowed by the prerequisites?
8. Is the prose 110–260 words (aim 150–220) with no quote, box, callout, or filler sentence?
9. No `import` or `client:` for shared components; `order` equals the file-name number.
10. Is this the last page of the topic (the highest `order` in the plan's `lesson_outline`)? Then `<Resources />` is the last line. No other page has it.
11. Does the page cite or link only sources that are in `sources.json`, and does every prop appear in `site/COMPONENTS.md`?
12. Adaptive: each required visual appears on its planned page and has a meaningful interaction. Legacy: one `FlowAnimation` and the planned 3D component. Both: vary useful visuals and activities.

A complete worked example and its counter-example are kept with the lesson skill (`.claude/skills/learn-site/references/`). When this rubric and `site/COMPONENTS.md` disagree about a prop, `COMPONENTS.md` wins; when a skill and ARCHITECTURE.md §12 disagree about a rule, §12 wins.
