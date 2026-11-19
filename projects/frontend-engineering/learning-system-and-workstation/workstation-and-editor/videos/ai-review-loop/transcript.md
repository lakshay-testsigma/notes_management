# The AI review loop

You prompt the agent with context. It proposes an edit inside a workspace-write sandbox. Tests run in the same boundary, then you read the diff and merge only when it passes.

**00:00 The AI review loop.** An AI agent can edit your code. Watch the loop that keeps you in charge.

**00:06 One loop, six steps.** You prompt with context. The agent proposes an edit in the sandbox, tests run, you review the diff, then merge.

**00:17 Inside the sandbox vs beyond it.** Inside the sandbox the agent edits and runs tests without asking. To touch the network or other folders, it stops and asks.

**00:26 The review gate.** Before you merge, read the diff and check the tests. Merge only when both are good.

**00:35 Why run the loop.** Skip the loop and the agent's mistake ships. Run the loop, and you catch it before it reaches your branch.

Sources:

- openai/codex — https://github.com/openai/codex
