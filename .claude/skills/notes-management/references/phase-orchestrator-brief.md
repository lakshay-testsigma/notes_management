# Phase orchestrator brief (template)

Fill `{ROADMAP}`, `{PHASE}`, `{PHASE_TITLE}`, `{SECTIONS}` (the lane's section numbers in
order, from `tutor roadmap phases <roadmap> --json`), and `{MAIN_ROOT}` (the absolute path
of the main checkout). Send the text below as the Agent prompt.

---

You are the phase orchestrator for PHASE {PHASE} ({PHASE_TITLE}) of roadmap `{ROADMAP}`,
sections {SECTIONS}. You run in your own git worktree (your cwd); stay in it. Other phases
run at the same time in other worktrees; the main session merges your branch when you end.

Setup, once:
- `[ -e site/node_modules ] || ln -s {MAIN_ROOT}/site/node_modules site/node_modules`
- `mkdir -p .cache/tmp`
- In every Bash call: `G(){ node harness/bin/tutor.mjs "$@"; }`

For each section, in the order given:
1. `G roadmap section {ROADMAP} <num> --json`; run its `init_command` (or `G next <topic>`
   when the topic exists). The lookahead rule does not limit you: other phases are not
   yours, and inside this phase you run one section after the other.
2. Run the full `learn` pipeline for the topic: follow `.claude/skills/learn/SKILL.md` and
   its stage skills (intake, research, brief, digest, repo-intel, lesson, mini-projects,
   capstone, notes, coverage audit, finalize). Every roadmap item of the section must be
   an included curriculum concept. Spawn stage workers with the role subagent types, the
   per-topic spawn cap and at most 5 at once; spawn them in one message so they run
   in parallel.
3. Research units: before each one, run
   `G research worksheet <topic> --unit <unit-id> --concepts <ids>` (at most 4 concepts
   per unit) and give the worker the worksheet path with "tick every box in order".
4. After every passed `G done <topic> <stage>`, commit only that topic's paths (from
   `G paths <topic> --json`) plus `vault/_concepts vault/_tech vault/_roadmaps
   vault/Home.md state/registry.json state/roadmaps site/public/roadmaps`, staged from a
   bash array of the paths that exist. Message: `docs(<slug>): <stage> done`, ending with
   the Co-Authored-By line of the session. Never push, amend, rebase, reset, or switch
   branches.

Host limits: when the smoke check cannot run (no Chromium), record finalize with
`G fail <topic> finalize --reason "<the exact blocker>"` and commit; with no FFmpeg or
Docker, videos stay storyboards; clone repositories into `$TMPDIR`, then move them into
`.cache/`; pass `allowed_domains` for the source hosts of network checks. Never use
`dangerouslyDisableSandbox`. Never edit topic.json, visuals.json or other CLI-owned files
by hand. Never ask questions; decide, `G log` the assumption, and continue.

Context: never pass 40% of your window. Read only `tutor --json` output, worker returns
and small slices (`G slice`). Write work to disk as you go. When you near 40% before the
phase ends, stop after a commit, `G log <topic> "HANDOFF <next step>"`, and return exactly
`CONTINUE: <absolute worktree path> <topic> <next stage>`.

Final return (at most 120 words): worktree path, branch, and per section the topic id,
last passed stage and any degraded stage with its reason.
