---
name: learn-site
description: Write the interactive lesson pages of a topic for the Astro site in the tutor harness — short blog-style MDX pages where registered diagrams, an animated flow, a simulation (ClusterSim, AlgorithmStepper, CodePlayground), a short HyperFrames video, an interactive experience (<Experience>: explainer, guided interactive lesson, branching deck or hybrid lab chosen by `tutor experience`) or a 3D graph carries the explanation, progressive Depth blocks hold internals, and a small activity tests it — plus the vault pointer note 02-lesson. Calls the shared learn-visuals and learn-video skills. This is the `lesson` stage. Use it whenever `tutor next` lists the `lesson` stage, whenever a `tutor-lesson-builder` worker is given a `pages-NN-NN` unit, whenever the learner asks for "a lesson page", "an interactive explanation", "an animation of how X works", "a visual for X" or "add a page about X" for a topic in this repository, and whenever `tutor validate <topic> lesson` or the site build reports a lesson page to repair.
argument-hint: "<topic id or slug> [unit id such as pages-01-03]"
---

# learn-site — interactive lesson pages (stage `lesson`)

This is the output the learner cares about most. In their words: the site should
read like a blog, minimal, with little text and a lot to see and do. A page has
about 10 to 15 lines of description, and then the idea is shown: an animated flow
that plays the real steps of the system, a 3D graph that can be explored and
extended, a playground with real numbers, a small activity. Quote blocks and
"mini boxes" (callouts, cards, asides) irritate them.

The rule of this skill: **choose visuals for the mechanism and the learner.**
With `plan.visual_policy: "adaptive"`, an experienced developer may have a basic
page with `visual: null`; teach it through a concise example and an activity.
When a visual is planned, it carries the mechanism and the prose frames it.
Legacy plans retain a visual on every page. In this document, `tutor` means `node harness/bin/tutor.mjs`, run from
the repository root.

**Visual-first plans** (`plan.visual_first: true`, every new plan) add the
shared standard `harness/rubrics/visuals.md`: each meaningful visual is drawn
and registered through the shared skill `.claude/skills/learn-visuals/SKILL.md`
(`tutor visuals <topic> add`), so the lesson site and the Obsidian vault show
the same diagram with its explanation, alt text, sources and learning check;
planned videos are built through `.claude/skills/learn-video/SKILL.md`; and all
prose follows `harness/rubrics/writing-standard.md`. The gate then also
requires at least 2 (quick), 3 (standard) or 5 (deep) registered lesson
visuals, an end-to-end workflow `Diagram` when the topic has a multi-stage
process, every planned video embedded, and at most two `<Depth>` blocks of
20–180 words per page.

**Adaptive experiences** (`plan.experience_policy: "adaptive"`, every new plan):
each outline entry carries `experience.signals`, and the selector
(`harness/rubrics/experiences.md`) has chosen static, explainer, interactive,
branching or hybrid. A page whose mode is interactive, branching or hybrid
embeds `<Experience id="<experience.id>" />` where its idea starts, and its
experience is built by a `tutor-video-producer` (`learn-video`). The
experience's Practice tab is that page's activity; keep the prose short and let
the experience carry the mechanism. An explainer page embeds `<Video id>` (or an
explainer `<Experience>` whose Watch part is the planned video). A static page
embeds no video or experience.

## When to use

Use this skill when the `lesson` stage of a topic is ready to run. Two kinds of
sessions read it. The **stage runner** (the `learn` orchestrator, or a single
session doing everything) does Part A and Part C of the steps. A **worker** is a
`tutor-lesson-builder` subagent that was given one unit such as `pages-01-03`;
it does Part B only, for its two or three pages. Without subagents, one session
does Part A, then Part B once per unit in order, then Part C.

### Capacity-aware input allowance

The input allowance is `min(60000, floor(0.4 * actual_window) - reserve)`, including
instructions, role/skill text and assigned excerpts. Ask `tutor budget --window
<actual_window> --reserve <overhead> <files>` before reading. Unknown window defaults
to 32768 and reserve3000. Any 60,000-token figure below is a ceiling only; the CLI's
smaller allowance wins. Split oversized units and persist handoffs before dispatch.
Learner experience comes from plan.learner; this learner is an existing software
developer learning a new subject. Keep clear prerequisite bridges, avoid redundant
basic programming lessons, and teach practical mechanisms and failure modes.

## Inputs

Run this first and take every path from its output (the lessons folder is
`lessons_dir`, the folder for topic-specific components is
`topic_components_dir`, the handoff folder is `handoffs_dir`, and the site
path of the topic is `site_url`):

```bash
node harness/bin/tutor.mjs paths <topic> --json
```

Then read only these files:

1. The plan, printed by `node harness/bin/tutor.mjs plan <topic> --json`:
   `lesson_outline` (each entry has `order`, `slug`, `title`, `visual`,
   `activity`, and adaptive visual decision fields), `visual_policy`, `summary`,
   `outcomes`, and `prerequisites`. The outline is the
   page list. Do not add, remove, or reorder pages.
2. `site/COMPONENTS.md`, the authoritative reference for the props of every
   shared component. Do not read the whole file. List its headings with
   `grep -n '^## ' site/COMPONENTS.md` and read (Read tool, `offset` and
   `limit`) only "The shape of a lesson page", "Rules for props", and the
   section of each component your own pages use: the `visual` and `activity`
   of your outline entries, plus `Resources` when the final page is yours.
3. `harness/rubrics/lesson-page.md`, only the sections "Hard rules" and
   "Self-check before finishing a page" (same `grep`). The rest of it is
   covered by `references/visual-design.md`.
4. `harness/domains/<domain>/playbook.md`, only the sections under
   `## Lesson recipes` and `## Safety and ethics`.
5. The grounding notes: `01-brief-<slug>.md`; the digest index
   `04-digests/00-digests-<slug>.md` (open one digest only when a page depends
   on a fact from it); and, when they exist,
   `05-repo-intel/00-repo-intel-<slug>.md` with each repository's
   `<repo>-findings.md` and `<repo>-takeaways.md`. Real component names,
   numbers, and failure cases for the visuals come from these. Do not read the
   module notes or the cloned repository.
6. This skill's `references/visual-design.md` (choosing and designing a
   planned visual and the activity, and the MDX syntax that breaks the build) and
   `references/good-page.md` (one complete good page, followed by the
   mistakes that make a page bad). Visual-first instructions in those examples
   apply only when a visual is planned; the adaptive policy in this skill
   controls omission, difficulty, and the learner profile.
7. Only the worker that builds a topic-specific component:
   `references/topic-component.md`, the sections "Figure" and "Topic-specific
   components" of `site/COMPONENTS.md`, and what `site/README.md` says about
   topic-specific components.
8. Only the stage runner: `02-lesson-<slug>.md` (created by `tutor init`) and
   `references/lesson-index-note.md`.
9. Visual-first plans: `.claude/skills/learn-visuals/SKILL.md`, the section
   "Every visual must" of `harness/rubrics/visuals.md`, the research file
   `<handoffs_dir>/visual-candidates.md` (sourced sequences, dependencies and
   comparisons; read only the entries for your pages), and the current
   registry: `node harness/bin/tutor.mjs visuals <topic> list --json`.

Size the list before reading, and stay under 60,000 tokens:

```bash
node harness/bin/tutor.mjs budget <file1> <file2> ...
```

## Steps

### Part A — plan the units (stage runner)

1. Mark the stage as started. Skip this when the stage is already `in_progress`.

   ```bash
   node harness/bin/tutor.mjs start <topic> lesson
   ```

2. Cut `lesson_outline`, in order, into units with the table under "Context
   budget", and register each unit:

   ```bash
   node harness/bin/tutor.mjs unit <topic> lesson add pages-01-03
   node harness/bin/tutor.mjs unit <topic> lesson add pages-04-05
   ```

3. Visual-first plans: for each outline entry with a `video`, register a video
   unit and give it to a `tutor-video-producer` worker (it follows
   `learn-video`):

   ```bash
   node harness/bin/tutor.mjs unit <topic> lesson add video-<id>
   ```

   With `experience_policy: "adaptive"`, also register one
   `experience-<id>` unit per outline entry whose mode
   (`tutor experience <topic> plan`) is interactive, branching or hybrid; that
   unit writes the experience's videos, deck and `experience.json` and runs
   `tutor experience <topic> build <id>`. A video that belongs to an experience
   is built inside the experience unit, not as its own `video-<id>` unit.

   Spawn video and experience units in the first batch: they need only the plan, the sources
   and the grounding notes, and a render takes minutes. The page worker that
   owns the page writes `<Video id="<id>" />`; if its `--files` check reports
   only that this id is not registered yet, that is expected while the video
   unit runs; it names it under PROBLEMS and the stage runner re-checks after
   both returned.

4. Spawn one `tutor-lesson-builder` worker per unit, within the limit of the
   table "How many workers at once" in `.claude/skills/learn/SKILL.md`. The
   one exception to running them in parallel is described under "Context
   budget": a topic-specific component that a later unit needs. In each
   brief, say in the `TASK` line which page is the final page of the topic
   (the highest `order` in `lesson_outline`) and whether that unit owns it.

### Part B — write the pages of one unit (worker)

1. Mark the unit as started:

   ```bash
   node harness/bin/tutor.mjs unit <topic> lesson start pages-NN-NN
   ```

2. Read the inputs. Your outline entries are those whose `order` is in your
   unit: `pages-04-05` is the entries with `order` 4 and 5.

3. Write one page at a time, and save it before starting the next. For each
   page:

   1. Write the one idea of the page as a single sentence. It becomes the
      `description`. If you need "and" to join two ideas, keep the first.
   2. Follow the visual decision. For adaptive plans, read `complexity`,
      `importance`, `spatial`, `visual_reason`, and `interaction_goal`. With
      `visual: null`, omit the visual and its hand-over paragraph; use a concise
      developer example and keep the activity. Otherwise the outline's `visual`
      field is the plan; confirm it
      with the table in `references/visual-design.md` and the playbook's
      "Lesson recipes" (and its "Visual recipes" lines). Design its data from the brief, the digests, and the
      repo-intel findings: real component names, real commands, realistic
      numbers. Never use placeholder data such as "Service A" or "Step 1".
      Keep a diagram at 3 to 7 nodes; the gate warns above 7.
      Visual-first plans: follow `learn-visuals` steps 1–6 for every visual of
      the page, the planned `visual` and any `extra_visuals`. Ground each
      arrow, order and number in a source from `visual-candidates.md` or the
      digests. Static diagrams that the notes also need (the end-to-end
      workflow, an architecture, layers) are assets in `visual_assets_dir`,
      registered, and shown with `<Diagram id="<id>" />`. Interactive visuals
      worth keeping are registered with `format: "component"`. A planned
      `video` is embedded with `<Video id="<id>" />` after the paragraph that
      sets it up.
   3. When a visual is planned, copy the component's example from `site/COMPONENTS.md` and replace its
      data. Use only the props documented there: the gate fails a page for
      any other prop. Do not open a component's source code to look for one.
   4. Choose the activity. The outline's `activity` field is the plan. It
      tests the one idea of this page and requires reasoning. Prefer
      `PredictReveal`, placed before the visual or paragraph that reveals the
      answer.
   5. Write the file with the skeleton under "Output contract". Write the
      prose last: the problem, mechanism, use case, and failure or limitation.
      When there is a visual, explain what to change and what was just seen. Define every term in the sentence
      where it first appears, before a component uses it. Follow
      `harness/rubrics/writing-standard.md`: short active sentences, plain
      words, analogies marked `**Analogy.**`. Put internals and production
      detail in at most two `<Depth>` blocks (20–180 words each). Take facts only
      from the grounding notes. Never cite or link a page that is not in
      `sources.json`; leave that fact out and name it under PROBLEMS.
   6. If this page has the highest `order` of the whole `lesson_outline` in
      the plan, end it with `<Resources />` and put nothing after it. Decide
      this from the plan, never from the files on disk, because other units
      may not have written their pages yet. No other page has it.
   7. Go through the self-check at the end of `references/visual-design.md`,
      and run `node harness/bin/tutor.mjs style <page file>`.

4. First unit only: when no shared component can show the core mechanism of a
   page, build one topic-specific component by following
   `references/topic-component.md`. A topic has at most two, each small and
   focused on one mechanism.

5. Check your own pages, and only those: list your page files after
   `--files`, separated by commas.

   ```bash
   node harness/bin/tutor.mjs validate <topic> lesson --files <lessons_dir>/NN-<slug>.mdx,<lessons_dir>/NN-<slug>.mdx
   ```

   It reports only failures in those files and skips the stage-level checks.
   Add `node harness/bin/tutor.mjs visuals <topic> check` when you registered
   visuals.
   Fix what it reports, also a warning about more than 7 nodes. Do not run
   the full `tutor validate <topic> lesson`: its lines about other units'
   pages, the page count, and the pointer note are not your job. For the
   prose count as the gate counts it, run `tutor words <page file>`.

   Do not run the site build when other workers may be running, because
   parallel builds write into the same output folder. The exception is a
   repair task whose fix list contains build or smoke errors: then you are
   the only worker, so run `npm --prefix site run build` and then
   `npm --prefix site run smoke` to confirm the fix.

6. Mark the unit as done, and return the summary described under "Context
   budget":

   ```bash
   node harness/bin/tutor.mjs unit <topic> lesson done pages-NN-NN
   ```

### Part B2 — supplementary concept note (only an assigned concept unit)

A broad curriculum has more concepts than its short lesson outline can teach.
The orchestrator may assign one `concept-<id>` unit to this worker instead of
pages. Do not try to squeeze that unit into an existing page.

1. Read only the assigned concept from `plan.curriculum`, its parent and
   prerequisite summaries, learner profile, assigned vetted source entries,
   relevant evidence excerpts, and the exact output path from the brief.
   The orchestrator obtains `curriculum_dir` from `tutor paths`.
2. Write one focused Markdown note with frontmatter `stage: concept`, the
   current topic id, title, tags, creation date, and `sources` containing only
   assigned source ids. Put `<!-- concept: <id> -->` above `## My insights`.
3. Cover all six aspects explicitly: `explanation` (what it is and why it
   exists), `mechanism` (how it works step by step), `use-case` (a concrete
   developer or industry scenario and the benefit it gives over the alternative), `trade-offs` (when to choose it or an
   alternative), `failure-modes` (what it prevents, where it fails, and relevant
   security limits), and `practice` (a checkable experiment with expected
   behavior). Link source evidence beside the claims it supports. Mark
   interpretation and uncertainty; do not invent facts to fill headings.
4. Keep the same minimal prose style: connected short paragraphs, useful
   examples, no quote blocks, cards, or callout boxes. The note can explain
   the concept more fully than a 110–260-word lesson page. Link to the lesson
   with its appropriate interactive visual when one exists. Markdown notes
   do not execute MDX visual components: never paste one into a vault note.
5. Write a draft outside `state/`, then preserve learner insights through
   `tutor write-note <topic> <assigned note> --file <draft>`. Never hand-edit
   learner insight suffixes. Return the note path, the six covered aspects,
   and any evidence gaps to the orchestrator; it records
   `{path, aspects: [...], anchor?}` in the concept coverage through
   `tutor plan --set`. Every cited coverage file needs the concept marker.
6. Run the scoped lesson validation named in the brief, mark this unit done
   through the CLI only after its checks pass, and return at most 150 words.
   If the unit cannot be grounded, report it failed and preserve a handoff.

### Part C — pointer note, build, gate (stage runner)

1. Wait until every worker has returned. Then write the pointer note
   `02-lesson-<slug>.md` by following `references/lesson-index-note.md`. Each
   page line names the plan outcome the page serves. If an outcome is served
   by no page and no mini project, record it with
   `node harness/bin/tutor.mjs log <topic> "lesson: outcome <n> has no page"`.

2. Build the site. A page that breaks the build is not done, because the
   learner would get an error instead of the lesson.

   ```bash
   [ -d site/node_modules ] || npm --prefix site install
   npm --prefix site run build
   ```

   Then confirm the visuals and refresh their vault export:

   ```bash
   node harness/bin/tutor.mjs visuals <topic> check
   node harness/bin/tutor.mjs map <topic>
   ```

   If the build fails, read the last 40 lines of its output. The error names a
   file and usually a line. Fix that file (the usual causes are in
   `references/visual-design.md`, section 6) and build again, at most three
   times.

3. Run the gate: the full `tutor validate <topic> lesson`, which only the
   stage runner runs. It also checks the rules that span the topic. The
   browser checks `npm --prefix site run smoke` and `npm --prefix site run
   interact` run later, in `finalize`; a page that fails them comes back to a
   `tutor-lesson-builder` with a fix list. A video that stayed a storyboard is
   a warning, not a failure: report its blocker in the final message.

## Output contract

### Lesson pages

One file per outline entry in the lessons folder: `NN-<slug>.mdx`, where `NN`
is the entry's `order` with two digits and `<slug>` is the entry's `slug` in
lowercase with dashes, for example `03-consumer-groups.mdx`. The `order` in the
frontmatter is the same number as `NN`.

Every page follows this skeleton:

```mdx
---
title: <the entry's title>
description: <the one idea of the page, in one line>
order: <the entry's order, as a number>
concepts: [<two to four concept names>]
---

<Two or three sentences: the concrete situation in which this idea matters.>

<Activity: a prediction, when the visual is the reveal />

<One or two sentences: what to do with the visual and what to watch for.>

<Visual component with real data />

<Two to four sentences: what the visual just showed, named precisely.>

<Activity that tests the one idea, if there was no prediction above />

<One sentence that leads to the next page.>
```

The rules, with the reason for each:

| Rule | Reason |
|------|--------|
| 110 to 260 words of prose (everything outside frontmatter, code, and components). Aim for 150 to 220. | The learner asked for 10 to 15 lines; the visual does the teaching. |
| At least one activity component. Adaptive plans use the exact planned visual, or omit it when `visual: null`; legacy plans require a visual on every page. | Spend attention on meaningful interaction. |
| One idea per page. | A page with two ideas teaches neither. |
| No blockquotes (`>`), no `:::` asides, no `<aside>`, `<blockquote>`, `<details>`, no card or callout markup. An important note is a plain paragraph that starts with `**Note.**` | The learner finds boxes and quotes irritating. |
| Shared components have no `import` line and no `client:` directive. All props are plain data: strings, numbers, booleans, arrays, objects. Every prop is one that `site/COMPONENTS.md` documents. | The site provides them to every page; an import or a function prop breaks the page, and the gate fails an undocumented prop. |
| A diagram has 3 to 7 nodes. | More than that is two ideas; the gate warns above 7. |
| A term is defined before it is used, and no page cites a source that is not in `sources.json`. | The learner is a beginner, and every source they see was verified. |
| A topic-specific component is imported explicitly with the alias `@topics/<slug>/<Name>.tsx` and used with `client:visible`. | It is not provided globally, and the validator recognizes it by that import path. |
| At most two `##` headings, and none before the first paragraph. | It is a blog post, not a document. |
| The page with the highest `order` in `plan.lesson_outline` ends with `<Resources />` and nothing after it. No other page has it. | It renders the vetted sources of the topic; the gate takes the final page from the plan and requires it there only. |
| Visual-first: every `<Diagram id>` / `<Video id>` is registered and lists the page in `used_in`; the planned `extra_visuals` and `video` are on the page; at least 2/3/5 registered lesson visuals per quick/standard/deep topic; an end-to-end workflow `Diagram` when the topic has a multi-stage process. | One registry feeds the site and the vault; the learner gets several meaningful visuals, not one. |
| At most two `<Depth>` blocks per page (`level="internals"` or `level="production"`), 20–180 words each. | Progressive disclosure: intuition first, internals and practice on request. |

Shared component names (fixed; no other shared component exists):

| Kind | Components |
|------|-----------|
| visual | `FlowAnimation`, `SystemDiagram`, `SequenceDiagram`, `StateMachine`, `Graph3D`, `VectorSpace3D`, `Chart`, `ParamPlayground`, `CodeWalkthrough`, `Timeline`, `Mermaid`, `Diagram`, `Video`, `ClusterSim`, `AlgorithmStepper`, `CompareView`, `CodePlayground` |
| activity | `Quiz`, `PredictReveal`, `OrderSteps`, `MatchPairs`, `SortBuckets` |
| utility | `Resources`, `Figure`, `Depth` |

### Adaptive visual decisions

New developer-focused plans use `visual_policy: "adaptive"`. Follow the decision
for each page, rather than adding a graphic to fill a quota:

| Planned idea | Required treatment |
|---|---|
| Basic, supporting or core | `visual: null` is allowed with a `visual_reason`; keep a concrete example and an activity. |
| Intermediate, or any career-critical idea | Use the named visual to expose a useful mechanism, tradeoff, failure, or comparison. |
| Advanced with `spatial: true` | Use the planned `Graph3D` or `VectorSpace3D`; `Graph3D` must be `editable` so the learner can change topology. |
| Advanced with `spatial: false` | Use `ParamPlayground`, `StateMachine`, `FlowAnimation`, `ClusterSim`, `AlgorithmStepper` or `CodePlayground`; record why 3D would distort the mechanism. |

Every adaptive entry has `complexity: basic|intermediate|advanced`,
`importance: supporting|core|critical`, `spatial: true|false`, and a nonempty
`visual_reason`. A visual also needs `interaction_goal`: what the learner
changes and what result they must predict. A 3D embedding view must explain
that its three axes are a teaching projection of a higher-dimensional space.
The reviewer tests the stated interaction and checks that it demonstrates the
mechanism, including a failure or counterexample. Orbiting decorative objects
alone does not satisfy that review.

Adaptive plans have no topic-wide animation or 3D quota. Each planned visual
must occur on its own page; a 3D component elsewhere cannot cover for it.
Legacy plans require at least one `FlowAnimation` across the topic and a 3D
component when one is planned. Vary useful visuals and activities.

### Pointer note `02-lesson-<slug>.md`

Keep the frontmatter and title line of the template (`stage: lesson`), delete
the scaffold lines, and write `## Open the lesson` (with the site path
`site_url` from `tutor paths`, which the validator looks for), `## Pages` (one
line per page: file name, title, the one idea, the visual, and the plan
outcome it serves; link each registered visual's note
`[[visual-<id>-<slug>|<title>]]` and the index `[[visuals-<slug>|all visuals]]`), and `## What you can do after it` (every plan outcome
with the pages or project that teach it). `## My insights` stays the last
heading with nothing below it. The rules and a filled example are in
`references/lesson-index-note.md`.

## Gate

Only the stage runner runs this full gate. A worker checks its own pages with the
`--files` form of Part B, step 5.

```bash
node harness/bin/tutor.mjs validate <topic> lesson
```

The validator prints each failure as `path: problem. fix.` Fix exactly the
reported lines and run it again. When it passes, and the site build passed:

```bash
node harness/bin/tutor.mjs done <topic> lesson
```

Make at most three attempts. If the third validation still fails, stop and
record the remaining failures:

```bash
node harness/bin/tutor.mjs fail <topic> lesson --reason "<the failures that remain>"
```

## Context budget

- One unit is two or three pages in outline order, written by one
  `tutor-lesson-builder` worker. The unit id is `pages-<first>-<last>` with
  two-digit page orders. Cut the outline like this:

  | Pages | Units |
  |-------|-------|
  | 3 | `pages-01-03` |
  | 4 | `pages-01-02`, `pages-03-04` |
  | 5 | `pages-01-03`, `pages-04-05` |
  | 6 | `pages-01-03`, `pages-04-06` |
  | 7 | `pages-01-03`, `pages-04-05`, `pages-06-07` |
  | 8 | `pages-01-03`, `pages-04-06`, `pages-07-08` |
  | 9 | `pages-01-03`, `pages-04-06`, `pages-07-09` |
  | 10 | `pages-01-03`, `pages-04-06`, `pages-07-08`, `pages-09-10` |
  | 11 | `pages-01-03`, `pages-04-06`, `pages-07-09`, `pages-10-11` |
  | 12 | `pages-01-03`, `pages-04-06`, `pages-07-09`, `pages-10-12` |

- Units run in parallel, within the limit of the table "How many workers at
  once" in `.claude/skills/learn/SKILL.md`. Only the first unit may create
  files in the topic's component folder, so that two workers never write the
  same files. Look at the `visual` field of every outline entry: if an entry
  outside the first unit names something that is not a shared component (a
  custom simulation), run the first unit alone first and tell its worker to
  build that component too, then spawn the others.
- A worker reads at most 60,000 tokens. Size the list with `tutor budget`, and
  read index notes, findings, and takeaways instead of whole folders. The
  unit sizes above assume the reading rule of "Inputs": only the sections of
  `site/COMPONENTS.md` for the components of your own pages, and only two
  sections of the rubric. That fixed reading is about 15,000 tokens. A worker
  that reads both files in full has no room left for a third page or for a
  topic-specific component.
- Write as you go: finish and save each page before starting the next one.
- If the unit turns out larger than planned (for example the topic-specific
  component takes most of the session), stop after a finished page and hand
  off. Write `<handoffs folder>/lesson-pages-NN-NN.md` with the headings
  `## Done`, `## Remaining`, and `## Next step`, run
  `node harness/bin/tutor.mjs unit <topic> lesson fail pages-NN-NN --handoff <that path>`,
  and return the single line `CONTINUE: <that path>`. A worker that receives
  a handoff file reads it first and writes only the remaining pages.
- A finished worker returns at most 150 words, in the return format of its
  brief, with one FINDINGS line per page worded like this:

  ```
  STAGE: lesson  UNIT: pages-NN-NN  STATUS: done
  FILES: <each .mdx path>, <topic-specific component path, if any>
  FINDINGS:
  - Page NN "<title>": <the one idea> — <visual> + <activity> — outcome <n>.
  - (one such line per page of the unit)
  VISUALS: <registered ids, or "none">
  PROBLEMS: <"none", or one line each; include any fact left out because no recorded source supports it>
  ```

  The stage runner writes the pointer note from these lines, so each one
  states the idea of its page and the number of the plan outcome it serves
  (the position of the outcome in `plan.outcomes`, counted from 1).

## Common mistakes

- A wall of text with a diagram at the end. Design a planned visual first; omit decorative visuals on basic adaptive pages.
- Placeholder data ("Service A", "Step 1") or captions such as "the request is
  processed". Use the real names, commands, and numbers, and say what changes.
- An invented prop, or a function or JSX passed as a prop.
- A diagram with more than 7 nodes, a term used before it is defined, or a
  source that is not in `sources.json`.
- Labelled 3D points almost on top of each other, long point labels, or a
  chart that mixes counts and percentages on one axis.
- An `import` or a `client:` directive for a shared component.
- A callout, card, blockquote, `<details>` block, or bold "Tip:" box.
- A quiz that asks for a definition or repeats a phrase from the page.
- Two ideas on one page, or a page that repeats the brief.
- `<Resources />` missing on the last page of the plan, present on another
  page (for example the last page of your own unit), or followed by text.
- Curly braces or a `<` character in prose outside backticks.
- Running the site build or the full `tutor validate <topic> lesson` inside a
  parallel worker, or skipping the build and the smoke check at the end.
- Writing below `## My insights` in `02-lesson-<slug>.md`.
- A diagram arrow, order or number that no source in its `source_ids` states.
- A static diagram pasted as `<Mermaid>` when the notes need it too: register
  it and use `<Diagram id>`.
- A video for a definition, or 3D for an ordinary flowchart.
- A `<Depth>` block that carries the page's one idea (it is hidden on
  "Essentials"), or more than two of them.
- Editing `visuals.json` by hand instead of `tutor visuals` / `tutor video`.
