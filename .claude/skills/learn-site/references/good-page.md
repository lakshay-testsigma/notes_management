# A complete good lesson page, and what makes a page bad

This is page 4 of the topic `backend-engineering/messaging/redis-streams`, saved
as `04-pending-and-claiming.mdx`. It obeys every rule of the lesson stage. Copy
its shape, not its content. The last section lists the mistakes that turn the
same page into a bad one.

Contents: the page · why it is good · the last page of a topic · a page with a
topic-specific component · the same page done badly.

The props used below (`FlowAnimation`, `PredictReveal`, `Quiz`) match
`site/COMPONENTS.md` at the time this example was written. That file is the
authority: before you reuse a prop from this example, confirm it there.

## The page

````mdx
---
title: Pending entries and claiming
description: An entry that was handed out but not acknowledged stays on record until another worker claims it.
order: 4
concepts: [pending entries list, XACK, XAUTOCLAIM, at-least-once delivery]
---

Your billing worker takes order 42 from the stream, starts charging the card, and the machine restarts. The stream has already handed that order out. Does anyone ever finish it?

Commit to an answer before you look at the animation.

<PredictReveal
  prompt="worker-1 reads order 42 from the stream and crashes before it finishes. What happens to order 42?"
  options={[
    "It is lost, because the stream already delivered it",
    "It returns to the front of the stream for the next reader",
    "It stays on record as pending under worker-1 until another worker claims it",
    "Redis sends it to worker-2 immediately"
  ]}
  correct={2}
  answer="It stays pending under worker-1's name. Nothing moves by itself: another worker has to claim it."
  reasoning="Redis cannot tell a crashed worker from a slow one, so it never reassigns work on its own. It only keeps the record that makes recovery possible."
/>

Now watch one order travel through the system. Play it once as it is. Then press **worker-1** under "Break a node" to crash that worker, and play it again.

<FlowAnimation
  title="One order, with and without a crash"
  nodes={[
    { id: "producer", label: "Order service" },
    { id: "stream", label: "orders stream", kind: "store" },
    { id: "w1", label: "worker-1" },
    { id: "w2", label: "worker-2" },
    { id: "pel", label: "Pending list", kind: "store" }
  ]}
  edges={[
    { from: "producer", to: "stream", label: "XADD" },
    { from: "stream", to: "w1", label: "XREADGROUP" },
    { from: "stream", to: "pel" },
    { from: "pel", to: "w2", label: "XAUTOCLAIM" },
    { from: "w2", to: "stream", label: "XACK" }
  ]}
  steps={[
    {
      from: "producer", to: "stream", packet: "order 42",
      caption: "The order service runs XADD orders * order 42. Redis stores it as entry 1731578400000-0."
    },
    {
      moves: [
        { from: "stream", to: "w1", packet: "entry 42" },
        { from: "stream", to: "pel", packet: "42: worker-1" }
      ],
      caption: "worker-1 runs XREADGROUP GROUP billing worker-1 STREAMS orders > and receives entry 42. In the same step Redis writes it to the pending list: owner worker-1, delivered 1 time.",
      fallback: {
        from: "stream", to: "pel", packet: "42: worker-1",
        caption: "worker-1 received entry 42 and crashed before finishing. The pending list still says: owner worker-1, delivered 1 time."
      }
    },
    {
      from: "w1", to: "stream", packet: "XACK",
      caption: "worker-1 charges the card and then runs XACK orders billing 1731578400000-0.",
      fallback: {
        moves: [
          { from: "pel", to: "w2", packet: "entry 42" },
          { from: "w2", to: "stream", packet: "XACK" }
        ],
        caption: "The entry has been idle for 60 seconds. worker-2 runs XAUTOCLAIM orders billing worker-2 60000 0, becomes its owner (delivered 2 times), charges the card, and runs XACK."
      }
    },
    {
      from: "stream", to: "pel", packet: "remove 42",
      caption: "The acknowledgement removes entry 42 from the pending list. Only now does the group consider the order finished."
    }
  ]}
  breakable={["w1"]}
/>

Two things kept order 42 safe. Every entry a group hands out is written to its **pending entries list**, with an owner and a delivery count, and it stays there until someone runs `XACK`. And a second worker can take over old pending entries with `XAUTOCLAIM`. Redis never moves them by itself, because it cannot tell a crashed worker from a slow one.

**Note.** After a claim the delivery count is 2. The card may already have been charged once, so the handler has to be safe to run twice.

<Quiz
  question="Why does worker-1 run XACK after charging the card, and not right after reading the entry?"
  options={[
    "XACK is slow, so it is better to run it last",
    "An early XACK removes the entry from the pending list, so a crash during the charge would lose the order",
    "Redis rejects XACK until the handler has returned",
    "The delivery count only increases after XACK"
  ]}
  answer={1}
  explanation="The pending list is the only record that the order is unfinished. Acknowledging first deletes that record before the work is done."
/>

Next: what to do with an entry that fails every time it is delivered.
````

## Why this page is good

- **One idea.** The `description` states it, and every element serves it.
- **About 175 words of prose**, inside the 110 to 260 limit. The frontmatter and
  the components are not counted.
- **It opens with a situation**, not a definition.
- **The prediction comes before the reveal.** The learner commits to an answer,
  and the animation then shows whether it was right.
- **The visual carries the explanation.** Remove the `FlowAnimation` and the
  page no longer explains how recovery works.
- **The data is real.** Real commands (`XREADGROUP`, `XAUTOCLAIM`, `XACK`), a
  real entry id format, a real idle time in milliseconds. A learner could type
  the captions into `redis-cli`.
- **The failure toggle teaches the point.** With `breakable` and the `fallback`
  steps, crashing worker-1 replays the same flow with the recovery path.
- **The learner is told what to do** with the visual and what to compare.
- **The quiz needs reasoning.** Its answer is not a phrase from the page, and
  each wrong option is something a beginner could believe.
- **The important warning is a plain paragraph** that starts with `**Note.**`
  There is no blockquote, callout, card, or collapsible block.
- **No `import` and no `client:`** for the shared components, and every prop is
  plain data.
- **No `{`, `}`, or `<` in the prose** outside backticks.
- **It ends with one sentence** that leads to the next page.

## The last page of a topic

The page with the highest `order` ends with `<Resources />`, with nothing after
it. The closing sentence goes before it:

```mdx
That is the whole path of a message through Redis Streams. The sources below are where to go deeper.

<Resources />
```

## A page with a topic-specific component

When the first unit built a component for this topic, the page imports it
directly under the frontmatter and uses it with `client:visible`, inside a
`Figure` that gives it a caption. Use the `@topics/<slug>/<Name>.tsx` alias
shown here: that import path is how the validator recognizes the component as
the visual of the page. The fragment below shows only the import and the use;
a real page still needs its full prose and its activity.

```mdx
---
title: Consumer groups by hand
description: A group hands each entry to exactly one of its consumers.
order: 3
concepts: [consumer group, last delivered id]
---

import ConsumerGroupSim from '@topics/redis-streams/ConsumerGroupSim.tsx';

Three workers share one stream. Add entries and watch who receives each one.

<Figure caption="One stream, one group, three workers. Add an entry and see who gets it.">
  <ConsumerGroupSim client:visible />
</Figure>
```

## The same page done badly

A bad version of this page makes the mistakes below. Each line gives the
mistake, then the fix. Check your page against the list before you save it.

| Mistake | Fix |
|---------|-----|
| The title holds three ideas ("Pending Entries, Claiming, and Trimming"), or a second idea starts after the activity. | One idea per page. The other ideas are other pages of the outline. |
| The `description` is a sentence about the page ("In this page we will learn…"). | It is the idea itself, in one line. |
| `order` or `concepts` is missing from the frontmatter. | The validator and the site need both. |
| `import FlowAnimation from …`, or `client:load` on a shared component. | Shared components need neither. Delete both. |
| A heading ("## Introduction") before the first paragraph; an opening definition or history fact. | Open with the concrete situation: the crash, the lost order. |
| A blockquote, a `:::tip` aside, a `<Callout>`, a `<details>` block. | A plain paragraph that starts with `**Note.**`, or cut it. |
| 520 words of prose, with the visual after all of it. | At most 260 words. The prose frames the visual; the visual explains. |
| `{id, fields}` or `a > b` in prose. | Put code in backticks; MDX reads braces as JavaScript and stops the build. |
| Props such as `animated`, `speed="fast"`, `onStep={(i) => …}`. | Only props documented in `site/COMPONENTS.md`, as plain data. The gate fails any other prop. |
| Nodes named "Service A", captions such as "Step 2: the message is processed", and no failure case. | The real parts (`orders stream`, `worker-1`, `Pending list`), the real commands, what changes in each step, and the failure the page is about. |
| A diagram with nine nodes. | Three to seven nodes. More means the page holds two ideas. |
| A term such as "pending list" used in a caption before the prose has defined it. | Define each term in the sentence where it first appears. |
| A quiz that asks "What does PEL stand for?". | Ask what happens to order 42 after a crash, or why `XACK` comes after the work. |
| `<Resources />` on a page that is not the last page of the plan, or text after it. | Only the page with the highest `order` in the plan has it, as its last line. |
| A fact or a link from a page that is not in `sources.json`. | Leave it out and report it under PROBLEMS. |
