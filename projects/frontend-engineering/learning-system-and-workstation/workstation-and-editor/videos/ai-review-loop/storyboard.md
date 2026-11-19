# Storyboard: The AI review loop

**Purpose.** See how a sandbox and approvals keep an AI agent's edits safe to merge.

**Why a video.** Prompt, proposed edit, sandbox, tests, review, and merge form a chronological loop, so motion shows the order better than one static diagram.

**Length.** 46.0 s, 5 scenes.

## 1. The AI review loop (0.0–6.0 s)

**On screen.** Title card with "Prompt, sandbox, test, review, merge".

**Narration and caption.** An AI agent can edit your code. Watch the loop that keeps you in charge.

## 2. One loop, six steps (6.0–17.0 s)

**On screen.** Nodes Prompt, Proposed edit, Sandbox, Tests, Review diff, Merge. A packet moves prompt→edit, edit→sandbox, sandbox→tests, tests→review, review→merge; each node lights up when the packet arrives.

**Narration and caption.** You prompt with context. The agent proposes an edit in the sandbox, tests run, you review the diff, then merge.

**Sources.** openai-codex-repo

## 3. Inside the sandbox vs beyond it (17.0–26.0 s)

**On screen.** Nodes Agent, Workspace, Beyond boundary. A packet moves agent→workspace (Autonomous: no prompt inside the sandbox), workspace→beyond (Stops to ask before crossing); each node lights up when the packet arrives.

**Narration and caption.** Inside the sandbox the agent edits and runs tests without asking. To touch the network or other folders, it stops and asks.

**Sources.** openai-codex-repo

## 4. The review gate (26.0–35.0 s)

**On screen.** Numbered steps appear one at a time: Read the diff → Check the tests passed → Merge only when both are good.

**Narration and caption.** Before you merge, read the diff and check the tests. Merge only when both are good.

## 5. Why run the loop (35.0–46.0 s)

**On screen.** Two columns, "Trust the output" and "Run the loop", fill in pairs; verdict: Never merge AI output without review..

**Narration and caption.** Skip the loop and the agent's mistake ships. Run the loop, and you catch it before it reaches your branch.
