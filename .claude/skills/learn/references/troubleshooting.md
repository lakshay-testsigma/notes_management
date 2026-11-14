# Troubleshooting for the orchestrator

Look up what you see in the left column and do what the right column says. `tutor` means
`node harness/bin/tutor.mjs`, run from the repository root.

| What you see | What to do |
|--------------|------------|
| `tutor next` returns no stages but `status` shows unfinished ones | A stage is `in_progress` or `failed` from an earlier session. For `in_progress`, continue it: its units keep their status, so only run the units that are not `done`. For `failed`, run `tutor reset <topic> <stage>` and run it again once. |
| A stage is `in_progress` when you resume | Do not run `start` again. Read its units in `tutor status <topic> --json`, spawn workers only for units that are `pending` or `failed` (pass the unit's handoff path as `HANDOFF IN` when it has one), then gate. |
| The agent type (for example `tutor-digester`) is not available | Agent files are loaded when a session starts. Spawn `general-purpose` instead and make the first line of the brief: "Read `.claude/agents/<agent>.md` and follow it as your instructions." |
| Exit code 2 from `tutor` | It is a usage error. Run the same command with `--help` or check `docs/ARCHITECTURE.md` §5, correct the arguments, and rerun. Do not work around the CLI. |
| The validator names a heading or field that a skill does not mention | The validator wins. Change the file to what the validator asks for. |
| A worker wrote outside its output files | Leave correct files in place. Never delete a note in `vault/_concepts/` or `vault/_tech/` that was created with `tutor concept`: digests, deep dives, and the brief link to them. Delete only a file that is clearly stray (wrong folder, wrong name) and that no note links to, and record it with `tutor log`. |
| The learner asks for a deeper version of a topic that exists (`/learn <topic> --depth standard`) | Run `node harness/bin/tutor.mjs depth <topic> <depth>`, then continue with the wave loop (Step 1, "A different depth"). Never run `tutor init` again and never edit the depth by hand. |
| `research` verified fewer digest sources or repositories than the plan wanted | Lower the plan to the real number, as described in the research section of `references/stage-runbook.md`. Never fill the gap with an unverified source. |
| One field of a source is wrong (a count, an evidence value, a `use_for` flag) | Write only the changed fields to `.cache/tmp/<slug>/sources/<id>.patch.json` and run `node harness/bin/tutor.mjs sources <topic> update <id> --file <that file>`. The patch is merged into the entry (`evidence` field by field; `null` clears a value). Do not remove and re-add the entry. |
| A source in `sources.json` turns out to be wrong or weak as a whole | Run `node harness/bin/tutor.mjs sources <topic> remove <id> --reason "<why>"`. It logs the reason and regenerates `09-resources`. Then run `tutor validate <topic> research`; if the count dropped below the minimum, rerun `learn-research` for a replacement. Never edit `sources.json` by hand. |
| A note or lesson page cites a page that is not in `sources.json` | Either verify it and add it through `learn-research` Part B, or have the sentence removed. Never leave an unrecorded citation. |
| `npm --prefix site install` fails | Report the last lines of the error to the learner in the final message, finish everything else, and mark `finalize` failed with that reason. |
| The same unit returned `CONTINUE` three times | The unit was sized wrong. Mark it failed, log it, and continue; mention it in the final message. |
