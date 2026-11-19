---
title: "The AI review loop"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
sources: [openai-codex-repo]
---
# The AI review loop

**Video** · teaches AI-assisted development

**Why this visual.** See how a sandbox and approvals keep an AI agent's edits safe to merge.

Video (46 s): `site/public/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/ai-review-loop.mp4`, captions `site/public/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/ai-review-loop.vtt`. On the site: `/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/ai-review-loop.mp4`.

HyperFrames project: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/ai-review-loop` (editable: change `video.json`, then `tutor video frontend-engineering/learning-system-and-workstation/workstation-and-editor build ai-review-loop`). Storyboard: `projects/frontend-engineering/learning-system-and-workstation/workstation-and-editor/videos/ai-review-loop/storyboard.md`.

Interactive composition for the site player: `/media/frontend-engineering/learning-system-and-workstation/workstation-and-editor/ai-review-loop/composition/index.html`.

## Transcript

You prompt the agent with context. It proposes an edit inside a workspace-write sandbox. Tests run in the same boundary, then you read the diff and merge only when it passes.

**00:00 The AI review loop.** An AI agent can edit your code. Watch the loop that keeps you in charge.

**00:06 One loop, six steps.** You prompt with context. The agent proposes an edit in the sandbox, tests run, you review the diff, then merge.

**00:17 Inside the sandbox vs beyond it.** Inside the sandbox the agent edits and runs tests without asking. To touch the network or other folders, it stops and asks.

**00:26 The review gate.** Before you merge, read the diff and check the tests. Merge only when both are good.

**00:35 Why run the loop.** Skip the loop and the agent's mistake ships. Run the loop, and you catch it before it reaches your branch.

Sources:

- openai/codex — https://github.com/openai/codex

## What it shows

The sandbox sets technical boundaries and the approval policy decides when the agent must stop and ask.

Text alternative: You prompt the agent with context. It proposes an edit inside a workspace-write sandbox. Tests run in the same boundary, then you read the diff and merge only when it passes.

## Check yourself

What does the sandbox boundary control, and what does the approval policy decide?

Answer: The sandbox controls which files the agent can edit and whether commands can use the network; the approval policy decides when the agent must stop and ask.

## Sources

- openai/codex — https://github.com/openai/codex (`openai-codex-repo`)

## Used in

- lesson page `/frontend-engineering/learning-system-and-workstation/workstation-and-editor/lesson/05-ai-assisted-development/` (file `site/src/content/lessons/frontend-engineering/learning-system-and-workstation/workstation-and-editor/05-ai-assisted-development.mdx`)

Back to [[visuals-workstation-and-editor|all visuals]].

## My insights
