# Registry entries, three domains

Write the entry to a draft file (for example `tmp/visual.json`), then
`node harness/bin/tutor.mjs visuals <topic> add --file tmp/visual.json`.
Paths come from `tutor paths <topic> --json`.

## Distributed systems: end-to-end workflow (SVG)

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

## Deep learning: algorithm trace (lesson component)

```json
{
  "id": "one-gradient-step",
  "title": "One gradient step on one weight",
  "kind": "algorithm",
  "format": "component",
  "component": "AlgorithmStepper",
  "concept_ids": ["chain-rule-gradient"],
  "source_ids": ["goodfellow-dl-book"],
  "purpose": "Follow the forward pass, the gradient and the update on real numbers.",
  "explanation": "The gradient is the error times the input; the update moves the weight against it by the learning rate.",
  "alt": "Three steps with numbers: the forward pass gives a prediction of 1, the gradient is minus 4, and the weight moves from 0.5 to 0.9.",
  "learning_check": { "question": "If the input were 0, how would the weight change?", "answer": "It would not change: the gradient would be 0." },
  "used_in": ["site/src/content/lessons/core-ai/deep-learning/backpropagation/03-one-step.mdx"]
}
```

## Marketing: funnel comparison (mermaid in a digest)

```json
{
  "id": "funnel-stage-rates",
  "title": "Funnel stages and their conversion rates",
  "kind": "workflow",
  "scope": "end-to-end",
  "format": "mermaid",
  "file": "vault/general/marketing/funnels/visuals/assets/funnel-stage-rates-funnels.mmd",
  "concept_ids": ["funnel-conversion"],
  "source_ids": ["funnel-guide"],
  "purpose": "See that each stage only receives the people the stage before it kept.",
  "explanation": "Sign-up keeps 20%, activation 30%, purchase 25%; the largest relative drop is at sign-up.",
  "alt": "Four stages in a row: 10,000 visit, 2,000 sign up, 600 activate, 150 buy, with the rate between each pair; sign-up loses the most.",
  "learning_check": { "question": "If the sign-up rate doubles and the other rates stay the same, how many buyers do you get?", "answer": "300." },
  "used_in": ["vault/general/marketing/funnels/04-digests/funnel-guide-funnels.md"]
}
```

The `.mmd` file for the last entry:

```text
flowchart LR
  visit["Visit: 10,000"] -->|20%| signup["Sign up: 2,000"]
  signup -->|30%| activate["Activate: 600"]
  activate -->|25%| buy["Buy: 150"]
```
