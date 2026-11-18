# Tutor harness

Read `docs/ARCHITECTURE.md` first, then `CLAUDE.md`. For tutor generation/resume,
read `.claude/skills/learn/SKILL.md` and the applicable stage skill. For a whole field or a
roadmap file, read `.claude/skills/learn-roadmap/SKILL.md` (ARCHITECTURE §4.5). Other hosts
must explicitly load these local instructions; Claude auto-loading is not portable.
For new plans also load `docs/RESEARCH-WORKFLOW.md`: recursive concept discovery,
per-concept evidence/coverage, developer learner profile and adaptive visuals.
Use the host's fresh-worker API when the learn runbook requests workers. Keep
workers within the host limit and the skill's limit; do not assume named Claude
agent types exist on another host. Persist handoffs and resume from CLI state.
The learner's topic files live in `inputs/`; run `tutor roadmap inbox` first. Worker role
files declare `tier:` (fact = cheaper, writer = stronger) and `model:`. Claude Code is
the default host: role files in `.claude/agents/` use `sonnet` for fact work and `opus`
for writer work, and the orchestrator runs on Opus. Codex remains optional:
`.codex/config.toml` and `.codex/agents/` hold its mapping. Load the shared
`.claude/agents/<role>.md` explicitly when native roles are unavailable; use fresh
workers with explicit model overrides if the host API requires that. Respect the per-topic spawn caps and coverage-audit rounds of `learn`.

State under `state/` is owned by `node harness/bin/tutor.mjs`; change it only
through that CLI. Preserve generated notes, learner insights, card IDs and recall
history. Use `write-note` for generated prose and `rerun` for retained-artifact
revalidation. `--force` is an explicit override, never successful completion.

Only an explicit learner deletion request permits `tutor remove ... --delete`;
its preview names the packages and learner data that will be removed. Shared notes,
research caches and external review artifacts require separately authorized cleanup.

New plans are visual-first: load `.claude/skills/learn-visuals/SKILL.md` (and
`learn-video` for planned videos), `harness/rubrics/visuals.md` and
`harness/rubrics/writing-standard.md`. Change the visual registry only through
`tutor visuals` and `tutor video`. With `experience_policy: "adaptive"` also load
`harness/rubrics/experiences.md`; build experiences and decks only with `tutor experience`
and `tutor deck`. Official HyperFrames skills (`hyperframes`, `hyperframes-cli`,
`hyperframes-registry`, `media-use`, `slideshow`) are read for craft; harness rules win.

Before a full workflow, run `doctor`, check source-network access, and inspect each
project's `verification.json`. Establish required local services (or a documented
external test URL) before tests. Docker CLI presence does not prove daemon access.
The full site workflow needs Node >=22.23.4. Run `npm test`, topic validation,
execution checks and the independent reviews before claiming completion.
